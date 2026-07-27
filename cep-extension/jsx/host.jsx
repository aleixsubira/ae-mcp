/**
 * AE-MCP Host Script (ExtendScript)
 *
 * This script runs in After Effects and processes commands from the MCP server.
 * IMPORTANT: This file MUST be ES3 compatible!
 */

// Global state
var AEMCP = {
  commandsFolder: null,   // primary folder (where a current server writes)
  folders: [],            // every folder we watch, primary first
  folderSource: "default",
  processedCommands: {},
  pollInterval: 100, // ms
  isRunning: false,
  clientPrefixes: {}
};

/**
 * Candidate application-support folders for ae-mcp, most trusted first.
 *
 * Folder.userData is documented as ~/Library/Application Support on macOS and
 * %APPDATA% on Windows, which is what commandsDir.ts computes server-side. We
 * do NOT bet the bridge on that being exact: the canonical macOS path is added
 * as a second candidate. A silent server/panel mismatch is indistinguishable
 * from "After Effects is not responding", so redundancy is cheap here.
 */
function aemcpAppSupportCandidates() {
  var list = [];

  function push(path) {
    if (!path) return;
    for (var i = 0; i < list.length; i++) {
      if (list[i] === path) return;
    }
    list.push(path);
  }

  try {
    if (Folder.userData) push(Folder.userData.fsName + "/ae-mcp");
  } catch (e) {}

  try {
    push(new Folder("~/Library/Application Support/ae-mcp").fsName);
  } catch (e2) {}

  return list;
}

/**
 * Read a text file, or null if it is missing or unreadable.
 */
function aemcpReadText(file) {
  if (!file || !file.exists) return null;
  try {
    file.open("r");
    var content = file.read();
    file.close();
    return content;
  } catch (e) {
    return null;
  }
}

function aemcpTrim(str) {
  return String(str).replace(/^[\s\u0000]+|[\s\u0000]+$/g, "");
}

/**
 * Resolve the commands folder. MUST mirror resolveCommandsDir() in
 * src/ae-integration/commandsDir.ts:
 *   1. AE_MCP_COMMANDS_DIR environment variable
 *   2. active-commands-dir.txt published by the running server
 *   3. "commandsDir" in <appSupport>/ae-mcp/config.json
 *   4. <appSupport>/ae-mcp/commands
 *
 * Step 2 exists because After Effects launched from Finder does not inherit
 * the shell environment, so the panel cannot see the server's env var.
 */
function aemcpResolveCommandsDir() {
  var candidates = aemcpAppSupportCandidates();
  var i;

  var fromEnv = null;
  try {
    fromEnv = $.getenv("AE_MCP_COMMANDS_DIR");
  } catch (e) {
    fromEnv = null;
  }
  if (fromEnv) {
    fromEnv = aemcpTrim(fromEnv);
    if (fromEnv.length > 0) {
      return { path: fromEnv, source: "env", candidates: candidates };
    }
  }

  for (i = 0; i < candidates.length; i++) {
    var pointer = aemcpReadText(new File(candidates[i] + "/active-commands-dir.txt"));
    if (pointer) {
      pointer = aemcpTrim(pointer);
      if (pointer.length > 0) {
        return { path: pointer, source: "server", candidates: candidates };
      }
    }
  }

  for (i = 0; i < candidates.length; i++) {
    var configText = aemcpReadText(new File(candidates[i] + "/config.json"));
    if (configText) {
      try {
        var config = JSON.parse(configText);
        if (config && config.commandsDir) {
          var configured = aemcpTrim(config.commandsDir);
          if (configured.length > 0) {
            return { path: configured, source: "config", candidates: candidates };
          }
        }
      } catch (e2) {
        // Malformed config: fall through.
      }
    }
  }

  return {
    path: (candidates.length > 0 ? candidates[0] : Folder.myDocuments.fsName + "/ae-mcp")
          + "/commands",
    source: "default",
    candidates: candidates
  };
}

/**
 * Initialize the MCP bridge
 */
function initMCP() {
  var resolved = aemcpResolveCommandsDir();
  AEMCP.folderSource = resolved.source;

  var primary = new Folder(resolved.path);
  if (!primary.exists) {
    primary.create();
  }
  AEMCP.commandsFolder = primary;
  AEMCP.folders = [primary];

  function watch(folder) {
    if (!folder || !folder.exists) return;
    for (var i = 0; i < AEMCP.folders.length; i++) {
      if (AEMCP.folders[i].fsName === folder.fsName) return;
    }
    AEMCP.folders.push(folder);
  }

  // Every other app-support candidate, in case Folder.userData does not match
  // what the server computed.
  for (var c = 0; c < resolved.candidates.length; c++) {
    watch(new Folder(resolved.candidates[c] + "/commands"));
  }

  // Backwards compatibility: keep watching the old Documents folder while it
  // exists, so a server that has not been updated yet still gets answered.
  watch(new Folder(Folder.myDocuments.fsName + "/ae-mcp-commands"));

  AEMCP.isRunning = true;

  var names = [];
  for (var n = 0; n < AEMCP.folders.length; n++) {
    names.push(AEMCP.folders[n].fsName);
  }

  return JSON.stringify({
    success: true,
    folder: primary.fsName,
    folders: names,
    source: resolved.source
  });
}

/**
 * Process pending commands
 * Called periodically by the CEP panel
 */
function processCommands() {
  if (!AEMCP.folders || AEMCP.folders.length === 0) {
    return JSON.stringify({ processed: 0 });
  }

  var processed = 0;

  for (var f = 0; f < AEMCP.folders.length; f++) {
    var folder = AEMCP.folders[f];
    if (!folder || !folder.exists) continue;

    var files = folder.getFiles("*.json");

    for (var i = 0; i < files.length; i++) {
      var file = files[i];

      // Skip response files and processed files
      if (file.name.indexOf(".response") !== -1) continue;
      if (file.name.indexOf(".processed") !== -1) continue;

      // Skip already processed commands. Keyed by full path: two folders can
      // legitimately hold files with the same name.
      if (AEMCP.processedCommands[file.fsName]) continue;

      try {
        processed += processCommandFile(file);
      } catch (e) {
        // Log error but continue processing
        $.writeln("Error processing " + file.fsName + ": " + e.toString());
      }
    }
  }

  return JSON.stringify({ processed: processed });
}

/**
 * Process a single command file
 */
function processCommandFile(file) {
  // Read the command file
  file.open("r");
  var content = file.read();
  file.close();

  // Parse JSON
  var command;
  try {
    command = JSON.parse(content);
  } catch (e) {
    writeErrorResponse(file, "Invalid JSON: " + e.toString());
    markAsProcessed(file);
    return 1;
  }

  // Validate command structure
  if (!command.id || !command.script) {
    writeErrorResponse(file, "Invalid command structure: missing id or script");
    markAsProcessed(file);
    return 1;
  }

  // Execute the script
  var result;
  try {
    app.beginUndoGroup("AE-MCP: " + command.id);

    // Execute the script
    result = eval(command.script);

    app.endUndoGroup();

    // Write success response
    writeSuccessResponse(file, result);
  } catch (e) {
    app.endUndoGroup();
    writeErrorResponse(file, e.toString());
  }

  markAsProcessed(file);
  return 1;
}

/**
 * Write a success response file
 */
function writeSuccessResponse(commandFile, data) {
  var responsePath = commandFile.fsName + ".response";
  var responseFile = new File(responsePath);

  var response = {
    success: true,
    data: data,
    commandId: extractCommandId(commandFile.name),
    timestamp: new Date().getTime()
  };

  responseFile.open("w");
  responseFile.write(JSON.stringify(response));
  responseFile.close();

  // Small delay to ensure file system catches up
  $.sleep(50);
}

/**
 * Write an error response file
 */
function writeErrorResponse(commandFile, error) {
  var responsePath = commandFile.fsName + ".response";
  var responseFile = new File(responsePath);

  var response = {
    success: false,
    error: error,
    commandId: extractCommandId(commandFile.name),
    timestamp: new Date().getTime()
  };

  responseFile.open("w");
  responseFile.write(JSON.stringify(response));
  responseFile.close();

  $.sleep(50);
}

/**
 * Mark a command file as processed
 */
function markAsProcessed(file) {
  AEMCP.processedCommands[file.fsName] = true;

  // Rename to .processed to archive
  var processedPath = file.fsName + ".processed";
  var processedFile = new File(processedPath);

  // Remove old processed file if exists
  if (processedFile.exists) {
    processedFile.remove();
  }

  file.rename(file.name + ".processed");
}

/**
 * Extract command ID from filename
 * Format: {clientPrefix}_{commandId}.json
 */
function extractCommandId(filename) {
  // Remove .json extension
  var baseName = filename.replace(".json", "");
  // Get the part after the last underscore (roughly)
  var parts = baseName.split("_");
  if (parts.length >= 3) {
    return parts.slice(2).join("_");
  }
  return baseName;
}

/**
 * Clean up old processed files
 */
function cleanupProcessedFiles(maxAge) {
  if (!AEMCP.folders || AEMCP.folders.length === 0) {
    return JSON.stringify({ cleaned: 0 });
  }

  maxAge = maxAge || 3600000; // Default 1 hour
  var now = new Date().getTime();
  var cleaned = 0;
  var patterns = ["*.processed", "*.response"];

  for (var f = 0; f < AEMCP.folders.length; f++) {
    var folder = AEMCP.folders[f];
    if (!folder || !folder.exists) continue;

    for (var p = 0; p < patterns.length; p++) {
      var files = folder.getFiles(patterns[p]);
      for (var i = 0; i < files.length; i++) {
        var file = files[i];
        var modified = file.modified.getTime();

        if (now - modified > maxAge) {
          file.remove();
          cleaned++;
        }
      }
    }
  }

  return JSON.stringify({ cleaned: cleaned });
}

/**
 * Get MCP status
 */
function getMCPStatus() {
  var names = [];
  for (var i = 0; i < AEMCP.folders.length; i++) {
    names.push(AEMCP.folders[i].fsName);
  }

  var count = 0;
  for (var k in AEMCP.processedCommands) {
    if (AEMCP.processedCommands.hasOwnProperty(k)) count++;
  }

  return JSON.stringify({
    isRunning: AEMCP.isRunning,
    folder: AEMCP.commandsFolder ? AEMCP.commandsFolder.fsName : null,
    folders: names,
    folderSource: AEMCP.folderSource,
    processedCount: count,
    aeVersion: app.version,
    project: app.project.file ? app.project.file.name : "Untitled"
  });
}

/**
 * Stop the MCP bridge
 */
function stopMCP() {
  AEMCP.isRunning = false;
  AEMCP.processedCommands = {};
  return JSON.stringify({ success: true });
}

/**
 * Execute a script directly (for testing)
 */
function executeScript(script) {
  try {
    app.beginUndoGroup("AE-MCP Direct Execute");
    var result = eval(script);
    app.endUndoGroup();
    return JSON.stringify({ success: true, data: result });
  } catch (e) {
    app.endUndoGroup();
    return JSON.stringify({ success: false, error: e.toString() });
  }
}

// JSON polyfill for ExtendScript (ES3)
if (typeof JSON === "undefined") {
  JSON = {};
}

if (typeof JSON.parse !== "function") {
  JSON.parse = function(text) {
    return eval("(" + text + ")");
  };
}

if (typeof JSON.stringify !== "function") {
  JSON.stringify = function(value) {
    var type = typeof value;

    if (value === null) {
      return "null";
    }

    if (type === "undefined") {
      return undefined;
    }

    if (type === "number" || type === "boolean") {
      return String(value);
    }

    if (type === "string") {
      return '"' + value.replace(/\\/g, "\\\\")
                        .replace(/"/g, '\\"')
                        .replace(/\n/g, "\\n")
                        .replace(/\r/g, "\\r")
                        .replace(/\t/g, "\\t") + '"';
    }

    if (value instanceof Array) {
      var arr = [];
      for (var i = 0; i < value.length; i++) {
        var v = JSON.stringify(value[i]);
        if (v !== undefined) {
          arr.push(v);
        } else {
          arr.push("null");
        }
      }
      return "[" + arr.join(",") + "]";
    }

    if (type === "object") {
      var pairs = [];
      for (var key in value) {
        if (value.hasOwnProperty(key)) {
          var v = JSON.stringify(value[key]);
          if (v !== undefined) {
            pairs.push('"' + key + '":' + v);
          }
        }
      }
      return "{" + pairs.join(",") + "}";
    }

    return undefined;
  };
}

// Object.keys polyfill for ES3
if (typeof Object.keys !== "function") {
  Object.keys = function(obj) {
    var keys = [];
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        keys.push(key);
      }
    }
    return keys;
  };
}
