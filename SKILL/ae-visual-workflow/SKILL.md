---
name: ae-visual-workflow
description: >
  Working protocol for driving Adobe After Effects through the ae-mcp server
  (mcp tools prefixed ae-mcp__, possibly proxied as
  mcp__remote-devices__ae-mcp__*). Use whenever building or editing AE
  compositions via MCP: it defines the see-measure-correct loop
  (get_comp_report + render_frame), empirical probe calibration, AE traps
  (opacity vs parenting, off-center cameras, ExtendScript ES3 quirks), and
  this user's environment specifics (repo location, restart procedure).
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
- `render_frame {compName, time, fileName}`: renders a frame to PNG in
  `~/Desktop/ae_probe/`. After every visual change, render 1-2 key frames,
  bring them over with device_stage_files and LOOK at them. A render takes
  ~100 ms: there is no excuse for iterating blind.

Standard loop: `get_comp_report` → change → `render_frame` → look →
correct → repeat. Ten cycles is normal and cheap.

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

## MCP bugs and their status

- `set_keyframe` / `set_keyframe_advanced`: FIXED (Jul 2026): accepts
  arrays `[x,y]`, numbers and JSON strings. If an old server returns
  "Value is not an array", the workaround is expressions.
- `get_expression`: FIXED (Jul 2026). Old servers crash with
  `SyntaxError: Expected: ;`.
- `save_project` without a path fails if the project was never saved: pass
  `path` the first time.
- `modify_layer` with `position {x,y,z}` also works on cameras.

## This user's environment (macbook-aleix-local)

- Canonical repo: **`~/ae-mcp`** (git, origin = private FAILFAST fork,
  upstream = original author). Claude desktop may run a copy from
  `~/Documents/ae-mcp`: check with `ps aux | grep ae-mcp` which one
  actually runs before editing server code.
- **After changing the server**: rebuild (`npx tsc`) and fully quit the
  Claude app (Cmd+Q): the node process is its child and toggling the
  connector may not kill it. The AE CEP extension needs no changes for
  server-side edits.
- **The device_bash FUSE mount is fragile** for heavy operations
  ("Resource deadlock avoided" when exec-ing binaries, git cannot delete
  its lock files): compile in the cloud container and write the built .js
  with device_commit_files, or run
  `node node_modules/typescript/lib/tsc.js` instead of the binary. Git
  commits are best done by the user in a native terminal.
- Render PNGs land in `~/Desktop/ae_probe/` (Desktop is usually granted);
  fetch them with `device_stage_files`.

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
