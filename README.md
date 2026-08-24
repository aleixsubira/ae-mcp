# AE-MCP · FAILFAST Fork

> Internal fork of [after-effects-mcp](https://github.com/ishu86/after-effects-mcp)
> maintained by **FAILFAST**. The original project README is preserved below;
> this section summarizes what this fork adds.
>
> Every tool here exists because production work hit a wall without it. None of
> them were written speculatively.

## Given back to the original project

| PR | What | Status |
|----|------|--------|
| [#2](https://github.com/ishu86/after-effects-mcp/pull/2) | keyframe and expression fixes, plus `render_frame` and `get_comp_report` | **merged** 28 Jul 2026 |
| [#3](https://github.com/ishu86/after-effects-mcp/pull/3) | `precompose_layers` reported a failure that had not happened | open |

On the way in, the maintainer hardened the #2 tools: `get_comp_report` no longer
emits `NaN`/`Infinity` (which broke the JSON bridge), `render_frame` verifies its
output file and sanitizes the filename, the font check handles AE 24+ nested
`allFonts`, and `set_keyframe` accepts `{x,y,z}` objects. Those four fixes are
merged back into this fork as of 19 Aug 2026, so the two sides do not drift.

### Five upstream bugs this fork is holding

These are bugs in the ORIGINAL project's own code, not consequences of anything
this fork does. They are listed apart from the tools below on purpose: a tool we
built for our own work has no business in someone else's repo, but a bug that
breaks their code for everyone does.

They are fixed here and working. Nothing in our own work is waiting on them.

| Where | What breaks | Verified | Lives in |
|---|---|---|---|
| `wrapInUndoGroup` | The value of an `eval()` is its last statement, and the helper ends on `app.endUndoGroup()`. So **every tool wrapped in an undo group returns `undefined` instead of its result object**. There are **53 call sites across 10 generator files**: this is the widest of the five | counted on `upstream/main` | `69d1a3c` ⚠️ buried in an unrelated dropdown commit since v1.2 |
| `copy_effects` | Emits its result as a bare labelled block (`{ copiedEffects: copiedEffects, ... };`), which is not an object literal in ExtendScript. **Every call dies with `SyntaxError: Expected: ;`** | read on `upstream/main`, hit on 19 Aug 2026 copying four effects between two layers | `4a48e9f`, mixed with 8 new tools |
| `reorder_effects` | `moveTo()` invalidates the `PropertyBase`, and the next line reads `effect.name` to build the result. The reorder happens; **reporting it throws `Object is invalid`**, so a successful call looks failed | read on `upstream/main` | `4a48e9f`, mixed with 8 new tools |
| `render_frame` | `saveFrameToPng` rasterises at the comp's **preview** resolution. A comp left at Half or Quarter returns a downsampled frame and says nothing, so any pixel comparison against it is worthless. Also `File.exists` caches and can report a freshly written frame as missing | one comp in a live project is saved at Quarter | `4175f70` ✅ that commit is only these two |
| `get_comp_report` | `matteDe` reads the layer **above** instead of `layer.trackMatteLayer`. Since AE 24 the matte is chosen, not inherited, so the guess is wrong whenever anyone uses that freedom | three false readings in a live project | `4175f70` ✅ that commit is only these two |

The last two are fixes to tools this fork contributed in PR #2, so they are ours
to correct.

**Why none of them has been sent, decided 24 Aug 2026.** PR #3 has been open
since 19 Aug with zero comments and zero reviews, so the cost of preparing a
pull request here is real and the odds of it landing are unknown. Meanwhile the
fixes work in this fork and no client work is blocked by them. The reason to
send them at all is drift, not altruism: this fork has already had to merge
`upstream/main` once (`ba56c55`), and every fix that stays here is one more
patch sitting on top of files the maintainer also edits.

**If it gets picked up again, send ONE and wait.** `wrapInUndoGroup` first: it
is the widest (53 call sites), the easiest to argue, and the smallest to read.
Its fix is four lines. Extracting it means lifting those four lines out of
`69d1a3c` into a clean branch off `fork/main`, because that commit is about
something else entirely. `4175f70` is the only one that could go almost as-is.

⚠️ **PRs go out from the `fork` remote** (`aleixsubira/after-effects-mcp`), never
from `origin`. `fork/main` was brought level with `upstream/main` on 24 Aug 2026,
so a branch cut from it starts clean.

## What this fork adds (v1.4.0-ff, Aug 2026)

Essential Graphics was unreachable, so a template's client-facing panel had to be
built by hand, comp by comp. And the comp report said what a layer was called but
not what it *is*, which is the thing you need to read a 30-layer master.

| Type | Change |
|------|--------|
| ✨ New | **`add_to_essential_graphics`**: publish a property to the panel |
| ✨ New | **`add_layer_to_essential_graphics`**: publish a layer as media replacement |
| ✨ New | **`list_essential_graphics`**: read the settled order of the panel |
| ✨ New | **`rename_essential_graphics_property`**: rename a published row. ⚠️ Publishing and naming cannot be done in one call: both routes were tried and both fail |
| ✨ New | **`get_master_properties` / `set_master_property`**: read and write per-instance overrides, with `sourceValue` |
| ✨ New | **`replace_layer_source`**: point ONE layer at another source, keeping its effects, expressions, keyframes and track matte. `replace_footage` swaps the file for every layer using it |
| ✨ New | **`inspect_api`**: ask After Effects, through ExtendScript reflection, what an object really exposes. Settles "does this API exist" instead of guessing |
| ✨ New | **`remove_keyframes`**: the server could create keys and not delete them, so undoing an inherited animation was done with an expression returning a constant. The keys stayed underneath and the timeline lied about what the layer does |
| ✨ New | **`audit_project`**: the three lists you need before deleting anything: in use and inside the root folder, **in use but living outside it** (move, never delete), and referenced by nobody. Reports each item's full folder path, which nothing else exposes. Read-only |
| 📈 Better | `get_comp_report` / `dump_comp_report`: what each layer IS and what it CONTAINS, the three switches that decide what a person actually sees, the effects on every layer, and the Essential Graphics panel |
| 📈 Better | `modify_layer` takes `anchorPoint` and `label` |
| 🐛 Fix | `get_master_properties`: a `TextDocument` value blew up the JSON pass with "Text document not of Box document type". Values are reduced to something serialisable before they leave |
| 🐛 Fix | the five upstream bugs listed above, four of which reported success while doing nothing |

**Why it matters**: with the panel reachable and the report honest, a master can
be checked without opening After Effects, and the check is a number rather than
an opinion.

## What this fork adds (v1.3.0-ff, Aug 2026)

| Type | Change |
|------|--------|
| 🐛 Fix | `precompose_layers` threw `TypeError` and looked like it had failed, when the precomposition had actually happened: `precompose()` returns the new `CompItem`, not the new layer |
| ✨ New | **`reorder_layer`**: move a layer within a comp. New layers always enter at the top, so every background had to be dragged down by hand. AE always allowed `moveToBeginning`/`moveBefore` from script; the server just never exposed them |
| ✨ New | **`rename_effect`**: rename an effect without deleting and rebuilding it, which lost its values |
| ✨ New | **`list_project_folders`**: read the project tree, so moving anything is no longer blind |
| ✨ New | **`move_project_item`**: move one item. `organize_project_items` is a blunt instrument: it invents `Compositions`/`Footage`/`Solids` folders and empties the root into them |
| ✨ New | **`dump_comp_report`**: the same report as `get_comp_report`, written to a file. One report is tens of thousands of characters, so returning dozens of them through the MCP channel is not possible. ExtendScript is ES3 with no `JSON.stringify`, so it ships its own serialiser and escapes every non-ASCII character, because layer names are full of accents and symbols |
| ✨ New | **`set_dropdown_items`**: populate a Dropdown Menu Control from script, keeping the effect's name |
| ✨ New | **`get_dropdown_items`**: read back what a dropdown actually offers, instead of trusting the last write |
| ✨ New | **`increment_and_save`**: save a new version without overwriting the previous one, so a checkpoint cannot destroy the state it was meant to protect |
| 🔄 Sync | merged `upstream/main`: the four fixes the maintainer made to the #2 tools before merging them |

**Why it matters**: `render_frame` + `get_comp_report` let Claude *see* what it
built. The eight tools above let it *restructure* a project: reorder, rename,
move and document it without a single manual drag.

## v1.2.0-ff, Aug 2026

| Type | Change |
|------|--------|
| ✨ New | configurable command folder: the bridge is no longer pinned to one hard-coded path, and falls back to the legacy location |
| 🐛 Fix | CEP install is robust to a missing extensions folder and to an existing symlink |

## v1.1.0-ff, Jul 2026

All of it merged upstream as [PR #2](https://github.com/ishu86/after-effects-mcp/pull/2).

| Type | Change |
|------|--------|
| 🐛 Fix | `set_keyframe` / `set_keyframe_advanced` now accept arrays: position/scale keyframes were impossible due to a schema serialization bug |
| 🐛 Fix | `get_expression` no longer throws `SyntaxError`: the generator emitted an invalid ExtendScript object literal |
| ✨ New | **`render_frame`**: renders any comp frame to PNG. Gives the AI eyes: it can look at what it just built |
| ✨ New | **`get_comp_report`**: JSON report of a comp's real state: layers, geometry, text, fonts, expressions, keyframes, and animated values sampled at comp markers |
| 🧠 New | **`ae-visual-workflow`** skill ([`SKILL/`](SKILL/ae-visual-workflow/SKILL.md)): the see-measure-correct working protocol and known AE traps, so Claude knows them upfront |
| 📖 Docs | [`docs/MANUAL.md`](docs/MANUAL.md): team manual: step-by-step install, protocol and maintenance |

**For the team**: start with [`docs/MANUAL.md`](docs/MANUAL.md).

**Upstream**: the `upstream` remote points to the original repo to pull future
updates. Last synced base: `8d14179` (19 Aug 2026).

---

*Maintained solo by [@aleixsubira](https://github.com/aleixsubira): Creative
Designer (Motion & Product) at [Fail Fast Studio](https://failfast.design).
Issues and PRs welcome; response time depends on client deadlines.*

---

<p align="center">
  <img src="https://img.shields.io/badge/After%20Effects-2024+-9999FF?style=for-the-badge&logo=adobe-after-effects&logoColor=white" alt="After Effects 2024+"/>
  <img src="https://img.shields.io/badge/MCP-Protocol-00D4AA?style=for-the-badge" alt="MCP Protocol"/>
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js 18+"/>
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="MIT License"/>
</p>

<h1 align="center">AE-MCP</h1>
<p align="center"><strong>After Effects Model Context Protocol Server</strong></p>
<p align="center">Automate Adobe After Effects with AI through 70+ MCP tools</p>

---

## Overview

AE-MCP is a comprehensive MCP server that enables AI assistants like Claude to directly control Adobe After Effects. It provides **70+ tools** covering the full motion graphics workflow: from creating compositions to applying professional effects and expressions.

### Key Features

| Feature | Description |
|---------|-------------|
| **70+ Tools** | Complete After Effects automation |
| **Animation Presets** | Spring physics, bounce, elastic, slide, fade |
| **Expression Library** | 20+ pre-built expressions (wiggle, loop, physics) |
| **Effect Templates** | One-click professional looks (cinematic, VHS, neon) |
| **Motion Graphics** | Lower thirds, title cards, transitions, logo reveals |
| **Reliable Architecture** | File-based communication for stability |

---

## Requirements

- **Adobe After Effects 2024** or later
- **Node.js 18+**
- **macOS** or **Windows**

---

## Installation

### Step 1: Install the MCP Server

```bash
git clone https://github.com/anthropics/ae-mcp.git
cd ae-mcp
npm install
npm run build
```

### Step 2: Install the CEP Extension

**macOS:**
```bash
./scripts/install-cep.sh
```

**Windows:**
```batch
scripts\install-cep.bat
```

### Step 3: Configure Your AI Assistant

<details>
<summary><strong>Claude Desktop</strong></summary>

Add to your config file:
- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "ae-mcp": {
      "command": "node",
      "args": ["/path/to/ae-mcp/dist/index.js"]
    }
  }
}
```
</details>

<details>
<summary><strong>Claude Code (CLI)</strong></summary>

Add to your MCP settings (`~/.claude/settings.json`):

```json
{
  "mcpServers": {
    "ae-mcp": {
      "command": "node",
      "args": ["/path/to/ae-mcp/dist/index.js"]
    }
  }
}
```

**Bonus:** This repo includes a **Claude Code Skill** for enhanced After Effects automation. Copy the skill files to your Claude Code skills directory:

```bash
cp -r SKILL/* ~/.claude/skills/
```

The Claude Code skill provides specialized knowledge about After Effects workflows, property formats, and best practices. See [`SKILL/SKILL.md`](SKILL/SKILL.md) for details.
</details>

### Step 4: Launch After Effects

1. Start **After Effects 2024+**
2. Open **Window > Extensions > AE-MCP**
3. The panel will auto-start and begin listening for commands

---

## Tool Categories

### Project & Composition
`create_project` · `open_project` · `save_project` · `close_project` · `get_project_info` · `import_footage` · `create_composition` · `modify_composition` · `duplicate_composition` · `delete_composition` · `list_compositions` · `get_composition_info`

### Layer Creation
`add_solid_layer` · `add_text_layer` · `add_text_layer_advanced` · `add_shape_layer` · `add_null_layer` · `add_adjustment_layer` · `add_camera_layer` · `add_light_layer` · `add_av_layer` · `precompose_layers` · `modify_layer` · `delete_layer`

### Animation & Keyframing
`set_keyframe` · `set_keyframe_advanced` · `apply_easy_ease` · `set_temporal_ease` · `offset_keyframes` · `scale_keyframe_timing` · `reverse_keyframes` · `copy_keyframes` · `get_keyframes`

### Expressions
`set_expression` · `get_expression` · `remove_expression` · `enable_expression` · `add_expression_control` · `apply_expression_template` · `link_properties`

### Effects
`apply_effect` · `apply_effect_template` · `modify_effect_properties` · `remove_effect` · `reorder_effects` · `copy_effects` · `list_effects`

### Motion Graphics Templates
| Tool | Styles |
|------|--------|
| `create_lower_third` | modern, corporate, news, minimal, social |
| `create_title_card` | cinematic, documentary, social, minimal |
| `create_transition` | wipe, dissolve, push, slide, zoom |
| `create_logo_reveal` | fade, scale, slide, spin, glitch, particle |
| `create_text_animator` | typewriter, fadeIn, scaleIn, slideIn, randomize, wave |

### Asset Management
`import_folder` · `replace_footage` · `organize_project_items` · `find_missing_footage` · `collect_files` · `reduce_project`

### Markers & Timeline
`add_composition_marker` · `add_layer_marker` · `get_markers` · `delete_marker` · `set_work_area`

---

## Quick Examples

### Create an animated intro

```
Create a 1920x1080 composition called "Intro" at 30fps, 5 seconds.
Add a text layer saying "Welcome" centered on screen.
Apply a slideInUp animation with easy ease.
Add a subtle glow effect.
```

### Build a lower third

```
Create a modern lower third:
- Name: "Sarah Chen"
- Title: "Lead Designer"
- Blue primary color
- Animate in and out
- 5 second duration
```

### Add physics-based motion

```
Add a bounce expression to the position of "Logo" layer.
Set amplitude to 0.15, frequency to 4, decay to 6.
```

---

## Animation Presets

### Spring Physics (Remotion-inspired)
| Preset | Description |
|--------|-------------|
| `gentle` | Subtle, smooth animations |
| `default` | Balanced spring motion |
| `wobbly` | Playful, bouncy animations |
| `stiff` | Quick, responsive animations |
| `slow` | Heavy, deliberate motion |
| `bouncy` | High energy bounces |
| `snappy` | Instant, responsive feel |

### Motion Presets
**Fade:** `fadeIn` · `fadeOut`
**Slide:** `slideInLeft` · `slideInRight` · `slideInUp` · `slideInDown` · `slideOutLeft` · `slideOutRight` · `slideOutUp` · `slideOutDown`
**Scale:** `scaleIn` · `scaleOut` · `scaleInBounce`
**Physics:** `bounce` · `elastic` · `overshoot`
**Rotate:** `spinIn` · `spinOut`

---

## Expression Templates

| Category | Templates |
|----------|-----------|
| **Wiggle** | `wiggle` · `wiggleSmooth` · `wiggleFadeIn` · `wiggleFadeOut` |
| **Loop** | `loopCycle` · `loopPingpong` · `loopOffset` · `loopContinue` |
| **Physics** | `bounce` · `inertia` · `springy` · `overshoot` |
| **Linking** | `matchPosition` · `offsetPosition` · `followWithDelay` · `inverseRotation` |
| **Time** | `time` · `clock` · `countdown` · `frameNumber` |

---

## Effect Templates

| Category | Effects |
|----------|---------|
| **Blur** | `gaussianBlur` · `directionalBlur` · `glassBlur` |
| **Color** | `curves` · `colorBalance` · `brightnessContrast` · `vibrance` |
| **Stylistic** | `glow` · `dropShadow` · `vignette` |
| **Creative** | `cinematicLook` · `vhsRetro` · `neonGlow` · `filmGrain` · `chromaticAberration` · `duotone` |

---

## Architecture

```
ae-mcp/
├── src/                          # TypeScript source
│   ├── index.ts                  # Entry point
│   ├── stdio-server.ts           # MCP server (70+ tools)
│   ├── ae-integration/
│   │   ├── file-communicator.ts  # File-based IPC
│   │   └── generators/           # ES3 script generators
│   └── presets/                  # Animation, expression, effect presets
├── cep-extension/                # After Effects extension
│   ├── CSXS/manifest.xml
│   ├── jsx/host.jsx              # ExtendScript host
│   └── js/main.js                # Panel JavaScript
├── SKILL/                        # Claude Code skill
│   ├── SKILL.md                  # Skill definition
│   └── examples.md               # Animation examples
└── scripts/                      # Installation scripts
```

### Communication Flow

```
AI Assistant (Claude)
        ↓
   MCP Server (Node.js)
        ↓ Write JSON command
   ~/Documents/ae-mcp-commands/
        ↓ Poll every 100ms
   CEP Extension
        ↓ Execute script
   After Effects DOM
        ↓ Write response
   *.json.response
```

---

## Troubleshooting

<details>
<summary><strong>Extension not appearing in After Effects</strong></summary>

1. Verify debug mode is enabled (the install script does this automatically)
2. Restart After Effects completely
3. Check extension location:
   - **macOS:** `~/Library/Application Support/Adobe/CEP/extensions/ae-mcp`
   - **Windows:** `%APPDATA%\Adobe\CEP\extensions\ae-mcp`
</details>

<details>
<summary><strong>Commands timing out</strong></summary>

1. Ensure the AE-MCP panel is **visible** in After Effects
2. Check `~/Documents/ae-mcp-commands/` for command files
3. Look at the panel's log for errors
</details>

<details>
<summary><strong>Script errors</strong></summary>

1. Open the ExtendScript Toolkit or console in After Effects
2. Verify composition/layer references exist
3. Check for ES3 compatibility issues (no arrow functions, template literals, etc.)
</details>

---

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## License

MIT

---

<p align="center">
  <sub>Built for motion designers who want to work faster with AI</sub>
</p>
