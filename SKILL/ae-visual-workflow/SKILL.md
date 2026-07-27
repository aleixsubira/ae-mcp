---
name: ae-visual-workflow
description: >
  Working protocol for driving Adobe After Effects through the ae-mcp server
  (mcp tools prefixed ae-mcp__, possibly proxied as
  mcp__remote-devices__ae-mcp__*). Use whenever building or editing AE
  compositions via MCP: the see-measure-correct loop (get_comp_report +
  render_frame), empirical probe calibration, expressions on effect
  properties, dropdown menu controls, safe checkpointing with
  increment_and_save, AE traps (opacity vs parenting, off-center cameras,
  ExtendScript ES3 quirks), and this user's environment specifics (repo
  location, CEP symlink, restart procedure).
---

# After Effects via ae-mcp: visual protocol

## Rule number one: never build blind

The ae-mcp server has two verification tools. Use them ALWAYS, from the
first minute:

- `get_comp_report {compName}`: real state of a comp: layers with
  geometry (`sourceRectAtTime`), text with fonts and whether they are
  installed, ALL expressions and keyframes, animated values sampled at the
  comp markers. Call it before touching anything and after every batch of
  changes. Do not trust that your write worked: verify it here.
- `render_frame {compName, time, fileName, outputDir}`: renders a frame to
  PNG. After every visual change, render 1-2 key frames, bring them over
  with device_stage_files and LOOK at them. A render takes ~100 ms: there
  is no excuse for iterating blind.

Standard loop: `get_comp_report` → change → `render_frame` → look →
correct → repeat. Ten cycles is normal and cheap.

**Verifying structure is not verifying function.** On 2026-07-24 a comp was
renamed and `list_layers` afterwards showed a perfect layer tree, so it was
called verified. It was not: all six slaving expressions inside it were
disabled and the whole grouping had been dead for three days. Layer trees
survive things expressions do not. Read the expressions, or render.

## Rule number two: checkpoints must not be destructive

- `increment_and_save` (no args) saves to the next free numbered filename
  (`…Test 5.aep` → `…Test 6.aep`) and leaves the current file untouched.
  Use it freely, at every milestone, without asking.
- `save_project` overwrites in place. Only on explicit user request.

A checkpoint that can bury the last known-good state is not a checkpoint.

## Expressions

- **Expressions on EFFECT properties work.** Older notes claiming otherwise
  are wrong (verified 2026-07-27 by writing, reading back and evaluating).
  Address them with a path:
  `set_expression {property: "Effects/<Effect name>/<Property name>"}`.
  A dropdown control's property is `Menu`; a slider's is `Slider`.
  This is what makes rig slaving automatable instead of hand-pickwhipped.
- `get_expression` returns `expressionError`. A non-null value means AE has
  **disabled** the expression: it will silently return the property's static
  value, and nothing in the UI shouts about it. Always read it back after a
  rename.
- Renaming a comp or layer referenced by name inside an expression is
  **reversible**: read with `get_expression`, rename, read again, repair
  with `set_expression`. Better still, read before renaming so you know how
  many references you are about to break.

## Dropdown Menu Controls

- Populate at creation: `add_expression_control {controlType: "dropdown",
  items: [...]}`. Repopulate later: `set_dropdown_items`. Read back:
  `get_dropdown_items` (needs AE 26.0+, otherwise `readable:false`).
- **A Dropdown Menu Control is a pseudo-effect.** `setPropertyParameters`
  does not edit it, it **regenerates** it with a new matchName and **drops
  the custom effect name** (it comes back as "Dropdown Menu Control").
  Every `effect("My Dropdown")(1)` expression is then left pointing at a
  name that no longer exists, **and AE raises no expression error**.
  The MCP tools handle this: `add_expression_control` populates before
  naming, `set_dropdown_items` restores the name afterwards. Never call
  `setPropertyParameters` raw.
- AE rejects empty item names, duplicates, and the `|` character. Accents
  and `+` survive intact (`Nexa Diésel` round-trips byte for byte), despite
  the Adobe docs warning about non-ASCII.

## Empirical probe calibration

To place/time 3D elements (crawls, zooms, cameras), do NOT compute the
projection: measure it.

1. Freeze the animated property to a constant via expression
   (e.g. `[0,1000,0]` on Anchor Point).
2. `render_frame` and measure in the PNG where the content lands.
3. Repeat with a second value. Two points give you the local mapping
   (near screen center it is roughly linear; it compresses toward the
   horizon).
4. Derive the constants and write the final expression.

Composition markers are the sync interface: put a marker (with a comment)
on every key instant, because `get_comp_report` samples animated values
exactly there.

## After Effects traps (all stepped on and confirmed)

- **Parenting does NOT propagate opacity.** A parent null at opacity 0
  leaves children fully visible. Fades go on each child layer (or
  precompose).
- **`add_camera_layer` creates the camera off-center** at `[0,0,-zoom]`
  looking at the top-left corner. First step after creating one:
  `modify_layer` position `{x: cx, y: cy, z: -zoom}` (for 1080×1920:
  `{540, 960, -zoom}`). An off-center camera produces diagonally skewed
  3D text: if you see unexplained shear, check the camera.
- **Crawl-style motion (content sliding along a tilted plane): FIXED
  position, animate the ANCHOR POINT.** Translating position Y slides the
  rigid plane (the tail lunges at the camera); animating the anchor point
  moves the content along the surface, like the movie. Property name:
  `"Anchor Point"` (with space and capitals).
- **Crawl perspective**: zoom 1500 at z=-1500 looks flat; zoom 700
  overdoes it and crushes the far end. Measured sweet spot: zoom 1000,
  camera `[540,960,-1000]`, plane at rotX -68, scale 72%, low pivot
  (~y 1650).
- **Linear Wipe for the horizon fade**: the correct wipe angle is
  empirical (0 vs 180 depending on the rig). Render and confirm it darkens
  the horizon side, not the entry side.
- **ExtendScript is ES3**: no arrow functions, const/let, or template
  literals. And a bare `{...};` in statement position is a BLOCK, not an
  object: always assign to a variable (`var r = {...}; r;`).
- **Multiline expressions with `//` comments may fail** on re-read; write
  expressions on a single line with `;`.
- **`app.fonts` gives false negatives**: the report may say
  `installed:false` for fonts that render fine (Helvetica Neue). Confirm
  with a render before believing the flag.
- **Cmd+Z reverts MCP changes.** Checkpoint often; verify a name before
  operating on something by index.

## MCP status

Fixed (Jul 2026, v1.1.0-ff to v1.3.0-ff):

- `set_keyframe` / `set_keyframe_advanced`: accepts arrays `[x,y]`, numbers
  and JSON strings. An old server returning "Value is not an array" needs
  updating.
- `get_expression`: worked around a bare-object ExtendScript crash. Old
  servers fail with `SyntaxError: Expected: ;`.
- `wrapInUndoGroup` used to end the script with `app.endUndoGroup()`, so
  every tool wrapped in an undo group returned `success` with **no data**.
  If a mutating tool returns no payload, the server predates v1.3.0-ff.

Still not possible through the MCP: the Essential Graphics Panel, reordering
layers, setting anchor point directly (use an expression), shape internals,
nested folders and moving items between folders, choosing the renderer,
changing a layer's font.

Other quirks: `save_project` without a path fails if the project was never
saved (pass `path` the first time); `import_folder` fails on paths with
spaces (use `import_footage` one by one); `get_layer_info` evaluates at the
current time cursor; the safety classifier can block `delete_composition`.
`modify_layer` with `position {x,y,z}` also works on cameras.

## This user's environment (macbook-aleix-local)

- Single source of truth: **`~/ae-mcp`** (git; origin = public fork at
  github.com/aleixsubira/ae-mcp, upstream = original author). Claude
  desktop runs `~/ae-mcp/dist/index.js` directly. If server behavior ever
  contradicts the repo, confirm with `ps aux | grep ae-mcp` which path is
  actually running.
- **The CEP symlink is a silent failure mode.** `install-cep.sh` symlinks
  `~/Library/Application Support/Adobe/CEP/extensions/com.aemcp.panel` to
  `<repo>/cep-extension`. Move the repo and the panel keeps working until
  the next AE restart, then disappears from Window > Extensions with no
  error anywhere. Confirmed 2026-07-27: it still pointed at a deleted
  `~/Documents/ae-mcp` copy, so every edit to `cep-extension/` in the repo
  was reaching nothing. Verify with
  `ls -la ~/Library/Application\ Support/Adobe/CEP/extensions/` before
  believing any panel-side change took effect. Unsigned extensions also
  need `PlayerDebugMode 1` per CEP runtime (CSXS 9-15).
- **Commands folder** (v1.2.0-ff): `~/Library/Application Support/ae-mcp/commands`,
  overridable with `AE_MCP_COMMANDS_DIR` or `<appSupport>/ae-mcp/config.json`.
  The panel STATUS line shows the resolved folder; `(server)` means it
  followed the pointer the server publishes, `(default)` means it resolved
  on its own. It also watches the legacy `~/Documents/ae-mcp-commands`.
- **After changing the server**: rebuild, then fully quit the Claude app
  (Cmd+Q) and reopen: the node process is its child and toggling the
  connector may not kill it. After changing `cep-extension/`, close and
  reopen the AE panel instead (or restart AE). Quitting Claude does not
  disturb an open After Effects session or its unsaved changes.
- **The device_bash FUSE mount can create files but not delete them.**
  Consequences: never run git write operations (`add`, `commit`, `checkout`)
  through it, because git leaves `.lock` files it cannot remove and the repo
  jams (`index.lock`, `HEAD.lock`, `packed-refs.lock`). Edit files and
  compile through the mount, then hand the user a ready-to-paste commit
  command. Compile with `node node_modules/typescript/lib/tsc.js`, not the
  `tsc` binary ("Resource deadlock avoided").
- **Render PNGs**: `~/Desktop/ae_probe/` is the default but Desktop is often
  NOT granted to the session. Pass `outputDir: "~/ae-mcp/_probe"` instead
  (granted, and gitignored), then fetch with `device_stage_files`.

## Reference values: vertical 1080×1920 crawl (calibrated)

Full rig verified by render: one-node camera, zoom 1000, position
`[540, 960, -1000]`; text plane at rotX -68, scale 72%, fixed position
with a low pivot (`[540, 1650, 0]`); motion via Anchor Point with an
expression like `a=A0+V*(time-t0); [0,a,0]`, where V≈440 units/s gives a
readable pace and V is THE parameter to retune against music or desired
rhythm. Logo zoom-out: interpolate in exponential space
(`s=sIni*Math.pow(sFin/sIni,Math.pow(u,0.72))`), never linear in scale.
Horizon fade with Linear Wipe (angle depends on the rig; confirm by
render).
