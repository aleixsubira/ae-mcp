# AE-MCP — Internal Team Manual (FAILFAST)

MCP server that lets Claude drive Adobe After Effects: compositions, layers,
keyframe and expression animation, effects — and since July 2026, it can
**see what it does** (frame renders and state reports). This manual covers
team installation, our improvements over the original project, and the
working protocol.

- Upstream repo: https://github.com/ishu86/after-effects-mcp
- Our internal fork (private): https://github.com/aleixgomez-ff/ae-mcp

---

## 1. What we improved (Jul 2026, v1.1.0-ff)

### Fixed bugs

| Bug | Symptom | Fix |
|---|---|---|
| `set_keyframe` rejected arrays | `Unable to call "setValueAtKey"... Value is not an array` when animating position/scale | The JSON Schema for `value` declared no type and some MCP bridges stringify it. It now declares `oneOf`, and the server re-parses JSON strings (`"[540,960]"`) defensively |
| `get_expression` crashed | `SyntaxError: Expected: ;` on reading any expression | The generator emitted a bare `{...};`, which ExtendScript parses as a block, not an object. It now assigns to a variable |

### New tools — "the eyes"

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
git clone https://github.com/aleixgomez-ff/ae-mcp.git ~/ae-mcp
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

4. Restart the Claude app (Cmd+Q — closing the window is not enough).
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
3. **Probe calibration**: for 3D geometry, don't compute the projection —
   freeze a constant value, render, measure, and derive the mapping from
   two data points.
4. **Confirmed AE traps**: parenting does not propagate opacity;
   `add_camera_layer` creates the camera off-center (always reposition to
   `[cx, cy, -zoom]`); crawl-type motion is animated via Anchor Point, not
   position; ExtendScript is strict ES3.

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
- The CEP extension almost never needs changes: commands travel as JSON
  files through `~/Documents/ae-mcp-commands/` and the panel executes them.
- Upstream: keeping `origin`→our fork and `upstream`→the original repo
  allows pulling updates (`git fetch upstream && git merge upstream/main`)
  and considering a PR with our fixes — they are generic, not internal.

## 6. Internal changelog

- **2026-07-26** (`v1.1.0-ff`): `set_keyframe` and `get_expression` fixes;
  new `render_frame` and `get_comp_report`; `ae-visual-workflow` skill.
  Validated on a real case: a comp with 3D perspective text calibrated
  entirely by Claude in ~10 render cycles.
