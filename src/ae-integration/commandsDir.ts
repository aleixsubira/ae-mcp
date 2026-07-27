/**
 * Resolution of the command-exchange folder shared with the CEP panel.
 *
 * Historically this was hardcoded to ~/Documents/ae-mcp-commands, which is a
 * bad place on macOS: when the user has iCloud "Desktop & Documents" sync
 * enabled, every command file goes through a cloud round-trip before the panel
 * can see it (latency, .icloud placeholders, dropped commands).
 *
 * Resolution order (the CEP host script implements the SAME order):
 *   1. AE_MCP_COMMANDS_DIR environment variable
 *   2. "commandsDir" in <appSupport>/ae-mcp/config.json
 *   3. <appSupport>/ae-mcp/commands           <- default, never cloud-synced
 *
 * The server publishes the resolved path to
 * <appSupport>/ae-mcp/active-commands-dir.txt so the panel can follow it even
 * when the env var is only visible to the Node process (After Effects launched
 * from Finder does not inherit the shell environment).
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export type CommandsDirSource = 'env' | 'config' | 'default' | 'explicit';

export interface ResolvedCommandsDir {
  dir: string;
  source: CommandsDirSource;
}

/**
 * Per-user application support directory for ae-mcp.
 * macOS:   ~/Library/Application Support/ae-mcp
 * Windows: %APPDATA%\ae-mcp
 * Linux:   $XDG_CONFIG_HOME/ae-mcp or ~/.config/ae-mcp
 *
 * Matches ExtendScript's Folder.userData on macOS and Windows, which is what
 * the CEP host script uses.
 */
export function getAppSupportDir(): string {
  if (process.platform === 'darwin') {
    return path.join(os.homedir(), 'Library', 'Application Support', 'ae-mcp');
  }
  if (process.platform === 'win32') {
    const appData = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
    return path.join(appData, 'ae-mcp');
  }
  const xdg = process.env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config');
  return path.join(xdg, 'ae-mcp');
}

/** Where the folder used to live. Kept only so we can warn about it. */
export const LEGACY_COMMANDS_DIR = path.join(os.homedir(), 'Documents', 'ae-mcp-commands');

export function getConfigFilePath(): string {
  return path.join(getAppSupportDir(), 'config.json');
}

export function getActiveDirPointerPath(): string {
  return path.join(getAppSupportDir(), 'active-commands-dir.txt');
}

function expandHome(p: string): string {
  if (p === '~') {
    return os.homedir();
  }
  if (p.indexOf('~/') === 0 || p.indexOf('~\\') === 0) {
    return path.join(os.homedir(), p.substring(2));
  }
  return p;
}

/**
 * Resolve the commands folder. Never throws: a broken config file falls
 * through to the default rather than taking the server down.
 */
export function resolveCommandsDir(explicit?: string): ResolvedCommandsDir {
  if (explicit && explicit.trim().length > 0) {
    return { dir: path.resolve(expandHome(explicit.trim())), source: 'explicit' };
  }

  const fromEnv = process.env.AE_MCP_COMMANDS_DIR;
  if (fromEnv && fromEnv.trim().length > 0) {
    return { dir: path.resolve(expandHome(fromEnv.trim())), source: 'env' };
  }

  try {
    const configPath = getConfigFilePath();
    if (fs.existsSync(configPath)) {
      const raw = fs.readFileSync(configPath, 'utf8');
      const parsed = JSON.parse(raw) as { commandsDir?: unknown };
      if (typeof parsed.commandsDir === 'string' && parsed.commandsDir.trim().length > 0) {
        return { dir: path.resolve(expandHome(parsed.commandsDir.trim())), source: 'config' };
      }
    }
  } catch {
    // Malformed config: ignore it and fall through to the default.
  }

  return { dir: path.join(getAppSupportDir(), 'commands'), source: 'default' };
}

/**
 * Write the resolved path where the CEP panel can find it. Best effort: a
 * failure here only means the panel falls back to its own resolution.
 */
export function publishActiveCommandsDir(dir: string): boolean {
  try {
    const appSupport = getAppSupportDir();
    if (!fs.existsSync(appSupport)) {
      fs.mkdirSync(appSupport, { recursive: true });
    }
    fs.writeFileSync(getActiveDirPointerPath(), dir, 'utf8');
    return true;
  } catch {
    return false;
  }
}

/** True when the old Documents folder is still around (upgrade leftovers). */
export function legacyCommandsDirExists(): boolean {
  try {
    return fs.existsSync(LEGACY_COMMANDS_DIR);
  } catch {
    return false;
  }
}
