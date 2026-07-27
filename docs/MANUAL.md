# AE-MCP: Internal Team Manual (FAILFAST)

MCP server that lets Claude drive Adobe After Effects: compositions, layers,
keyframe and expression animation, effects: and since July 2026, it can
**see what it does** (frame renders and state reports). This manual covers
team installation, our improvements over the original project, and the
working protocol.

- Upstream repo: https://github.com/ishu86/after-effects-mcp
- Our fork (public): https://github.com/aleixsubira/ae-mcp

---

## 1. What we improved (Jul 2026, v1.1.0-ff)

### Fixed bugs

| Bug | Symptom | Fix |
|---|---|---|
| `set_keyframe` rejected arrays | `Unable to call "setValueAtKey"... Value is not an array` when animating position/scale | The JSON Schema for `value` declared no type and some MCP bridges stringify it. It now declares `oneOf`, and the server re-parses JSON strings (`"[540,960]"`) defensively |
| `get_expression` crashed | `SyntaxError: Expected: ;` on reading any expression | The generator emitted a bare `{...};`, which ExtendScript parses as a block, not an object. It now assigns to a variable |

### New tools: "the eyes"

- **`render_frame {compName, time, fileName?, outputDir?}`**
  Renders a comp frame to PNG (default `~/Desktop/ae_probe/`) and returns
  the path. Claude can look at what it just built. A render takes ~100 ms.
- **`get_comp_report {compName, sampleTimes?}`**
  Full comp report as JSON: layers with real geometry
  (`sourceRectAtTime`), transforms, text with fonts and sizes, fonts used
  vs installed, every expression and keyframe, and animated values sampled
  at the comp markers.

With these two tools Claude works in a *build → see → measure → correct*
loop without human intervention. Before, it built blind.

---

## 2. Installation (macOS, per team member)

Requirements: After Effects 2024+, Node 18+, Claude desktop app.

```bash
# 1. Clone OUR fork (not upstream)
git clone https://github.com/aleixsubira/ae-mcp.git ~/ae-mcp
cd ~/ae-mcp
npm install
npm run build

# 2. Install the CEP extension into After Effects
./scripts/install-cep.sh
```

```jsonc
// 3. Register the server in Claude desktop:
// ~/Library/Application Support/Claude/claude_desktop_config.json
{
  "mcpServers": {
    "ae-mcp": {
      "command": "node",
      "args": ["/Users/YOUR_USER/ae-mcp/dist/index.js"]
    }
  }
}
```

4. Restart the Claude app (Cmd+Q: closing the window is not enough).
5. In After Effects: Window → Extensions → **AE-MCP** (the panel must stay
   visible: it executes the commands).
6. Smoke test: ask Claude for `get_project_info` and a `render_frame` of
   any comp.

**Golden rule: ONE clone per machine.** If there is a clone in `~/ae-mcp`
and a copy in `~/Documents/ae-mcp`, Claude's config will run one while you
edit the other, and you will lose an afternoon figuring it out (true
story). `ps aux | grep ae-mcp` tells you which one actually runs.

---

## 3. Working protocol with Claude

The details live in the **`ae-visual-workflow`** skill (in `SKILL/` in this
repo; also installable in Claude so it loads on its own). Summary:

1. **Never build blind**: `get_comp_report` before touching anything;
   `render_frame` + look at the PNG after every visual change.
2. **Markers as the sync interface**: every key moment gets a comp marker
   with a comment; the report samples animated values there.
3. **Probe calibration**: for 3D geometry, don't compute the projection:
   freeze a constant value, render, measure, and derive the mapping from
   two data points.
4. **Confirmed AE traps**: parenting does not propagate opacity;
   `add_camera_layer` creates the camera off-center (always reposition to
   `[cx, cy, -zoom]`); crawl-type motion is animated via Anchor Point, not
   position; ExtendScript is strict ES3.

---

## 3b. The command folder (v1.2.0-ff)

The server and the CEP panel talk to each other through a folder of JSON
files. Until v1.1.0-ff that folder was hardcoded to
`~/Documents/ae-mcp-commands`, which is the worst possible place on a Mac:
with iCloud "Desktop & Documents" enabled, every command takes a cloud
round-trip before the panel sees it, and `.icloud` placeholders can make
commands vanish.

Both sides now resolve the folder the same way:

1. `AE_MCP_COMMANDS_DIR` environment variable
2. `commandsDir` in `~/Library/Application Support/ae-mcp/config.json`
3. `~/Library/Application Support/ae-mcp/commands` (default, never synced)

After Effects launched from Finder does not inherit the shell environment,
so the panel cannot read the env var. The server therefore publishes the
resolved path to `~/Library/Application Support/ae-mcp/active-commands-dir.txt`
and the panel reads it. The panel also keeps watching the old Documents
folder while it exists, so server and extension can be updated in either
order without breaking the bridge.

The panel STATUS line shows the resolved folder and how it was resolved:
`(server)` means it followed the pointer, `(default)` means the server had
not published one yet. Both work as long as the paths match.

Delete `~/Documents/ae-mcp-commands` only once every machine runs
v1.2.0-ff or newer.

---

## 3c. Dropdown Menu Controls (v1.3.0-ff)

Populating a dropdown from a script used to be impossible through this
server, so every menu had to be filled by hand with Edit... That is now
`items` on `add_expression_control`, plus `set_dropdown_items` and
`get_dropdown_items`.

The trap, measured on AE 26.0: a Dropdown Menu Control is a **pseudo-effect**.
`setPropertyParameters` does not edit it, it **regenerates** it with a new
matchName, and the custom effect name is lost (the effect comes back as
"Dropdown Menu Control"). Any expression of the form
`effect("Producto Escena 1")(1)` is then left pointing at a name that no
longer exists, and After Effects raises no expression error for it.

So the tools do two things you must keep if you touch this code:

- `add_expression_control` populates the dropdown **before** naming the effect.
- `set_dropdown_items` captures the name, repopulates, and restores it.

Verified end to end: a slave expression referencing the effect by name keeps
resolving after a repopulation, and still evaluates (dropdown set to item 2,
the driven Opacity read back as 20).

What After Effects rejects, validated up front so you get a clear message:
empty item names, duplicates, and the "|" character. Accented characters do
survive (`Nexa Diésel` round-trips byte for byte), despite the Adobe docs
warning about non-ASCII.

`get_dropdown_items` needs AE 26.0 or newer; older versions cannot read the
item list back and return `readable:false`.

---

## 4. Known issues (pending, low priority)

- `save_project` without `path` fails if the project was never saved: pass
  a path the first time.
- The font check in `get_comp_report` can report `installed:false` for
  fonts that render fine (an `app.fonts` limitation): confirm with a
  render before trusting the flag.
- `saveFrameToPng` (behind `render_frame`) is undocumented Adobe API:
  stable since CC2020, but if a future version removes it, `render_frame`
  will fail with a clear message.

## 5. Maintenance

- Touch code → `npx tsc` → Cmd+Q Claude and reopen (the node process is a
  child of the app; toggling the connector may not kill it).
- Commands travel as JSON files through the folder described in section 3b
  and the panel executes them.
- **Moving or renaming the repo breaks the CEP extension silently.**
  `install-cep.sh` creates a *symlink* from
  `~/Library/Application Support/Adobe/CEP/extensions/com.aemcp.panel` to
  `<repo>/cep-extension`. If the repo moves, the symlink dangles and the
  panel keeps working until the next After Effects restart, then vanishes
  from Window > Extensions with no error anywhere. Re-run
  `install-cep.sh` after any move. Check where it points with:
  `ls -la ~/Library/Application\ Support/Adobe/CEP/extensions/`
- Unsigned extensions need `PlayerDebugMode 1` per CEP runtime version.
  `install-cep.sh` now sets CSXS 9 through 15; an AE upgrade to a newer
  runtime is another way for the panel to disappear from the menu.
- Touching `cep-extension/` requires closing and reopening the panel
  (or restarting AE). Touching `src/` requires `npx tsc` and restarting
  the Claude app.
- Upstream: keeping `origin`→our fork and `upstream`→the original repo
  allows pulling updates (`git fetch upstream && git merge upstream/main`)
  and considering a PR with our fixes: they are generic, not internal.

## 6. Internal changelog

- **2026-07-27** (`v1.3.0-ff`): dropdowns can be populated from script
  (`items` on `add_expression_control`, `set_dropdown_items`,
  `get_dropdown_items`), with the effect name preserved across the
  pseudo-effect regeneration. Also fixed `wrapInUndoGroup`, which was
  swallowing the result object of every tool it wrapped: those tools
  returned `success` with no data.

- **2026-07-27** (`v1.2.0-ff`): command folder is configurable and defaults
  to `~/Library/Application Support/ae-mcp/commands` instead of
  `~/Documents`; panel reports the resolved folder and watches the legacy
  one for backwards compatibility; `install-cep.sh` covers CSXS 9-15 and
  flushes the preference cache. Found while diagnosing a panel that had
  disappeared from Window > Extensions: the CEP symlink still pointed at a
  deleted second copy of the repo.

- **2026-07-26** (`v1.1.0-ff`): `set_keyframe` and `get_expression` fixes;
  new `render_frame` and `get_comp_report`; `ae-visual-workflow` skill.
  Validated on a real case: a comp with 3D perspective text calibrated
  entirely by Claude in ~10 render cycles.
