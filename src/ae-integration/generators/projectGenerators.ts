/**
 * Project-related Script Generators
 *
 * Generates ES3-compatible ExtendScript for project operations.
 */

import {
  escapeString,
  generateProjectCheck,
  wrapInUndoGroup,
  generateResultObject
} from './helpers.js';

/**
 * Generate script to create a new project
 */
export function generateCreateProject(params: { name?: string }): string {
  let script = '';
  script += 'if (app.project) {\n';
  script += '  app.project.close(CloseOptions.DO_NOT_SAVE_CHANGES);\n';
  script += '}\n';
  script += 'app.newProject();\n';

  if (params.name) {
    script += 'var projectName = "' + escapeString(params.name) + '";\n';
  }

  script += generateResultObject({
    success: 'true',
    message: '"New project created"'
  });

  return script;
}

/**
 * Generate script to open an existing project
 */
export function generateOpenProject(params: { path: string }): string {
  let script = '';
  script += 'var projectFile = new File("' + escapeString(params.path) + '");\n';
  script += 'if (!projectFile.exists) {\n';
  script += '  throw new Error("Project file not found: ' + escapeString(params.path) + '");\n';
  script += '}\n';
  script += 'var opened = app.open(projectFile);\n';
  script += 'if (!opened) {\n';
  script += '  throw new Error("Failed to open project");\n';
  script += '}\n';

  script += generateResultObject({
    success: 'true',
    name: 'app.project.file ? app.project.file.name : "Untitled"',
    path: 'app.project.file ? app.project.file.fsName : ""'
  });

  return script;
}

/**
 * Generate script to save current project
 */
export function generateSaveProject(params: { path?: string }): string {
  let script = '';
  script += generateProjectCheck();

  if (params.path) {
    script += 'var saveFile = new File("' + escapeString(params.path) + '");\n';
    script += 'app.project.save(saveFile);\n';
  } else {
    script += 'if (app.project.file) {\n';
    script += '  app.project.save();\n';
    script += '} else {\n';
    script += '  throw new Error("No file path specified and project has not been saved before");\n';
    script += '}\n';
  }

  script += generateResultObject({
    success: 'true',
    path: 'app.project.file ? app.project.file.fsName : ""'
  });

  return script;
}

/**
 * Generate script to save the project under the NEXT available numbered name,
 * leaving the current file untouched (Repsol_MotionSystem_Test 5.aep ->
 * Repsol_MotionSystem_Test 6.aep).
 *
 * Prefers After Effects' own "Increment and Save" menu command so the numbering
 * matches what the user gets from the keyboard. findMenuCommandId is
 * language-dependent, so there is a self-computed fallback: no user should lose
 * the ability to save safely because their AE is not in English.
 */
export function generateIncrementAndSave(): string {
  let script = '';
  script += generateProjectCheck();

  script += 'if (!app.project.file) {\n';
  script += '  throw new Error("Project has never been saved. Use save_project with an explicit path first.");\n';
  script += '}\n';
  script += 'var previousPath = app.project.file.fsName;\n';
  script += 'var method = "menuCommand";\n';

  script += 'var cmdId = 0;\n';
  script += 'try { cmdId = app.findMenuCommandId("Increment and Save"); } catch (e) { cmdId = 0; }\n';

  script += 'if (cmdId) {\n';
  script += '  app.executeCommand(cmdId);\n';
  script += '} else {\n';
  script += '  method = "computed";\n';
  script += '  var folder = app.project.file.parent;\n';
  script += '  var full = app.project.file.name;\n';
  script += '  var dot = full.lastIndexOf(".");\n';
  script += '  var ext = dot > -1 ? full.substring(dot) : ".aep";\n';
  script += '  var stem = dot > -1 ? full.substring(0, dot) : full;\n';
  script += '  stem = decodeURI(stem);\n';
  script += '  var m = stem.match(/^(.*?)(\\d+)$/);\n';
  script += '  var base, n;\n';
  script += '  if (m) { base = m[1]; n = parseInt(m[2], 10); } else { base = stem + " "; n = 1; }\n';
  script += '  var candidate = null;\n';
  script += '  for (var i = n + 1; i < n + 1000; i++) {\n';
  script += '    var f = new File(folder.fsName + "/" + base + i + ext);\n';
  script += '    if (!f.exists) { candidate = f; break; }\n';
  script += '  }\n';
  script += '  if (!candidate) { throw new Error("Could not find a free incremented filename"); }\n';
  script += '  app.project.save(candidate);\n';
  script += '}\n';

  script += generateResultObject({
    success: 'true',
    method: 'method',
    previousPath: 'previousPath',
    path: 'app.project.file ? app.project.file.fsName : ""',
    unchangedFileKept: 'previousPath'
  });

  return script;
}

/**
 * Generate script to close current project
 */
export function generateCloseProject(params: { save?: boolean }): string {
  let script = '';
  script += generateProjectCheck();

  if (params.save) {
    script += 'app.project.close(CloseOptions.SAVE_CHANGES);\n';
  } else {
    script += 'app.project.close(CloseOptions.DO_NOT_SAVE_CHANGES);\n';
  }

  script += generateResultObject({
    success: 'true',
    message: '"Project closed"'
  });

  return script;
}

/**
 * Generate script to get project info
 */
export function generateGetProjectInfo(): string {
  let script = '';
  script += generateProjectCheck();

  script += 'var projectInfo = {\n';
  script += '  name: app.project.file ? app.project.file.name : "Untitled",\n';
  script += '  path: app.project.file ? app.project.file.fsName : "",\n';
  script += '  numItems: app.project.numItems,\n';
  script += '  bitsPerChannel: app.project.bitsPerChannel,\n';
  script += '  timeDisplayType: app.project.timeDisplayType,\n';
  script += '  gpuAccelType: app.project.gpuAccelType ? app.project.gpuAccelType.toString() : "Unknown"\n';
  script += '};\n';

  // Count compositions
  script += 'var compCount = 0;\n';
  script += 'var footageCount = 0;\n';
  script += 'var folderCount = 0;\n';
  script += 'for (var i = 1; i <= app.project.numItems; i++) {\n';
  script += '  var item = app.project.item(i);\n';
  script += '  if (item instanceof CompItem) compCount++;\n';
  script += '  else if (item instanceof FootageItem) footageCount++;\n';
  script += '  else if (item instanceof FolderItem) folderCount++;\n';
  script += '}\n';
  script += 'projectInfo.compositions = compCount;\n';
  script += 'projectInfo.footageItems = footageCount;\n';
  script += 'projectInfo.folders = folderCount;\n';

  script += 'projectInfo;\n';

  return script;
}

/**
 * Generate script to import footage
 */
export function generateImportFootage(params: {
  path: string;
  name?: string;
  sequence?: boolean;
  forceAlphabetical?: boolean;
}): string {
  let script = '';
  script += generateProjectCheck();

  script += 'var importFile = new File("' + escapeString(params.path) + '");\n';
  script += 'if (!importFile.exists) {\n';
  script += '  throw new Error("File not found: ' + escapeString(params.path) + '");\n';
  script += '}\n';

  script += 'var importOptions = new ImportOptions(importFile);\n';

  if (params.sequence) {
    script += 'importOptions.sequence = true;\n';
    if (params.forceAlphabetical) {
      script += 'importOptions.forceAlphabetical = true;\n';
    }
  }

  script += 'var imported = app.project.importFile(importOptions);\n';

  if (params.name) {
    script += 'imported.name = "' + escapeString(params.name) + '";\n';
  }

  script += generateResultObject({
    id: 'imported.id',
    name: 'imported.name',
    width: 'imported.width || 0',
    height: 'imported.height || 0',
    duration: 'imported.duration || 0',
    frameRate: 'imported.frameRate || 0'
  });

  return wrapInUndoGroup(script, 'Import Footage');
}

/**
 * Generate script to list all project items
 */
export function generateListProjectItems(params: { type?: string }): string {
  let script = '';
  script += generateProjectCheck();

  script += 'var items = [];\n';
  script += 'for (var i = 1; i <= app.project.numItems; i++) {\n';
  script += '  var item = app.project.item(i);\n';
  script += '  var itemType = "unknown";\n';
  script += '  if (item instanceof CompItem) itemType = "composition";\n';
  script += '  else if (item instanceof FootageItem) itemType = "footage";\n';
  script += '  else if (item instanceof FolderItem) itemType = "folder";\n';

  if (params.type) {
    script += '  if (itemType !== "' + escapeString(params.type) + '") continue;\n';
  }

  script += '  var itemInfo = {\n';
  script += '    id: item.id,\n';
  script += '    name: item.name,\n';
  script += '    type: itemType,\n';
  script += '    parentFolder: item.parentFolder ? item.parentFolder.name : null\n';
  script += '  };\n';
  script += '  if (item instanceof CompItem || item instanceof FootageItem) {\n';
  script += '    itemInfo.width = item.width;\n';
  script += '    itemInfo.height = item.height;\n';
  script += '    itemInfo.duration = item.duration;\n';
  script += '  }\n';
  script += '  items.push(itemInfo);\n';
  script += '}\n';
  script += 'items;\n';

  return script;
}
