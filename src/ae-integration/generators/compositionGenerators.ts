/**
 * Composition-related Script Generators
 *
 * Generates ES3-compatible ExtendScript for composition operations.
 */

import {
  escapeString,
  generateProjectCheck,
  generateCompAccess,
  colorToES3,
  wrapInUndoGroup,
  generateResultObject
} from './helpers.js';

/**
 * Generate script to create a new composition
 */
export function generateCreateComposition(params: {
  name: string;
  width: number;
  height: number;
  frameRate: number;
  duration: number;
  backgroundColor?: { r: number; g: number; b: number };
}): string {
  let script = '';
  script += generateProjectCheck();

  script += 'var comp = app.project.items.addComp(\n';
  script += '  "' + escapeString(params.name) + '",\n';
  script += '  ' + params.width + ',\n';
  script += '  ' + params.height + ',\n';
  script += '  1,\n'; // pixel aspect ratio
  script += '  ' + params.duration + ',\n';
  script += '  ' + params.frameRate + '\n';
  script += ');\n';

  if (params.backgroundColor) {
    script += 'comp.bgColor = ' + colorToES3(params.backgroundColor) + ';\n';
  }

  script += generateResultObject({
    id: 'comp.id',
    name: 'comp.name',
    width: 'comp.width',
    height: 'comp.height',
    frameRate: 'comp.frameRate',
    duration: 'comp.duration'
  });

  return wrapInUndoGroup(script, 'Create Composition');
}

/**
 * Generate script to modify an existing composition
 */
export function generateModifyComposition(params: {
  compId?: number;
  compName?: string;
  name?: string;
  width?: number;
  height?: number;
  frameRate?: number;
  duration?: number;
  backgroundColor?: { r: number; g: number; b: number };
}): string {
  let script = '';
  script += generateProjectCheck();
  script += generateCompAccess(params.compId, params.compName);

  if (params.name) {
    script += 'comp.name = "' + escapeString(params.name) + '";\n';
  }
  if (params.width) {
    script += 'comp.width = ' + params.width + ';\n';
  }
  if (params.height) {
    script += 'comp.height = ' + params.height + ';\n';
  }
  if (params.frameRate) {
    script += 'comp.frameRate = ' + params.frameRate + ';\n';
  }
  if (params.duration) {
    script += 'comp.duration = ' + params.duration + ';\n';
  }
  if (params.backgroundColor) {
    script += 'comp.bgColor = ' + colorToES3(params.backgroundColor) + ';\n';
  }

  script += generateResultObject({
    id: 'comp.id',
    name: 'comp.name',
    width: 'comp.width',
    height: 'comp.height',
    frameRate: 'comp.frameRate',
    duration: 'comp.duration'
  });

  return wrapInUndoGroup(script, 'Modify Composition');
}

/**
 * Generate script to duplicate a composition
 */
export function generateDuplicateComposition(params: {
  compId?: number;
  compName?: string;
  newName?: string;
}): string {
  let script = '';
  script += generateProjectCheck();
  script += generateCompAccess(params.compId, params.compName);

  script += 'var newComp = comp.duplicate();\n';

  if (params.newName) {
    script += 'newComp.name = "' + escapeString(params.newName) + '";\n';
  }

  script += generateResultObject({
    id: 'newComp.id',
    name: 'newComp.name',
    width: 'newComp.width',
    height: 'newComp.height',
    frameRate: 'newComp.frameRate',
    duration: 'newComp.duration'
  });

  return wrapInUndoGroup(script, 'Duplicate Composition');
}

/**
 * Generate script to delete a composition
 */
export function generateDeleteComposition(params: {
  compId?: number;
  compName?: string;
}): string {
  let script = '';
  script += generateProjectCheck();
  script += generateCompAccess(params.compId, params.compName);

  script += 'var deletedName = comp.name;\n';
  script += 'comp.remove();\n';

  script += generateResultObject({
    success: 'true',
    deleted: 'deletedName'
  });

  return wrapInUndoGroup(script, 'Delete Composition');
}

/**
 * Generate script to list all compositions
 */
export function generateListCompositions(): string {
  let script = '';
  script += generateProjectCheck();

  script += 'var compositions = [];\n';
  script += 'for (var i = 1; i <= app.project.numItems; i++) {\n';
  script += '  var item = app.project.item(i);\n';
  script += '  if (item instanceof CompItem) {\n';
  script += '    compositions.push({\n';
  script += '      id: item.id,\n';
  script += '      name: item.name,\n';
  script += '      width: item.width,\n';
  script += '      height: item.height,\n';
  script += '      frameRate: item.frameRate,\n';
  script += '      duration: item.duration,\n';
  script += '      numLayers: item.numLayers,\n';
  script += '      workAreaStart: item.workAreaStart,\n';
  script += '      workAreaDuration: item.workAreaDuration\n';
  script += '    });\n';
  script += '  }\n';
  script += '}\n';
  script += 'compositions;\n';

  return script;
}

/**
 * Generate script to get detailed composition info
 */
export function generateGetCompositionInfo(params: {
  compId?: number;
  compName?: string;
}): string {
  let script = '';
  script += generateProjectCheck();
  script += generateCompAccess(params.compId, params.compName);

  script += 'var compInfo = {\n';
  script += '  id: comp.id,\n';
  script += '  name: comp.name,\n';
  script += '  width: comp.width,\n';
  script += '  height: comp.height,\n';
  script += '  pixelAspect: comp.pixelAspect,\n';
  script += '  frameRate: comp.frameRate,\n';
  script += '  duration: comp.duration,\n';
  script += '  numLayers: comp.numLayers,\n';
  script += '  workAreaStart: comp.workAreaStart,\n';
  script += '  workAreaDuration: comp.workAreaDuration,\n';
  script += '  bgColor: [comp.bgColor[0], comp.bgColor[1], comp.bgColor[2]],\n';
  script += '  resolutionFactor: [comp.resolutionFactor[0], comp.resolutionFactor[1]],\n';
  script += '  shutterAngle: comp.shutterAngle,\n';
  script += '  shutterPhase: comp.shutterPhase,\n';
  script += '  motionBlur: comp.motionBlur,\n';
  script += '  renderer: comp.renderer\n';
  script += '};\n';

  // Get layer summary
  script += 'compInfo.layers = [];\n';
  script += 'for (var i = 1; i <= comp.numLayers; i++) {\n';
  script += '  var layer = comp.layer(i);\n';
  script += '  compInfo.layers.push({\n';
  script += '    index: layer.index,\n';
  script += '    name: layer.name,\n';
  script += '    enabled: layer.enabled,\n';
  script += '    inPoint: layer.inPoint,\n';
  script += '    outPoint: layer.outPoint\n';
  script += '  });\n';
  script += '}\n';

  script += 'compInfo;\n';

  return script;
}

/**
 * Generate script to set active composition
 */
export function generateSetActiveComposition(params: {
  compId?: number;
  compName?: string;
}): string {
  let script = '';
  script += generateProjectCheck();
  script += generateCompAccess(params.compId, params.compName);

  script += 'comp.openInViewer();\n';

  script += generateResultObject({
    id: 'comp.id',
    name: 'comp.name'
  });

  return script;
}


/**
 * Generate script to render a single frame of a composition to PNG.
 * Gives the AI "eyes": the returned path can be read back by the assistant.
 * Uses CompItem.saveFrameToPng (undocumented but stable since CC2020).
 */
export function generateRenderFrame(params: {
  compId?: number;
  compName?: string;
  time: number;
  outputDir?: string;
  fileName?: string;
}): string {
  let script = '';
  script += generateProjectCheck();
  script += generateCompAccess(params.compId, params.compName);

  const outputDir = params.outputDir || '~/Desktop/ae_probe';

  script += 'var t = ' + params.time + ';\n';
  script += 'if (t < 0) { t = 0; }\n';
  script += 'if (t > comp.duration) { t = comp.duration; }\n';
  script += 'var outFolder = new Folder("' + escapeString(outputDir) + '");\n';
  script += 'if (!outFolder.exists) {\n';
  script += '  if (!outFolder.create()) {\n';
  script += '    throw new Error("Failed to create output folder: " + outFolder.fsName);\n';
  script += '  }\n';
  script += '}\n';
  // Sanitize custom fileName to a basename with a safe charset so callers cannot
  // escape outputDir via "../" or absolute paths. Default names are already safe.
  if (params.fileName) {
    const base = params.fileName.replace(/\\/g, '/').split('/').pop() || '';
    const safe = base.replace(/[^A-Za-z0-9_\-.]+/g, '_').replace(/^\.+/, '');
    const outName = safe || 'frame.png';
    script += 'var outName = "' + escapeString(outName) + '";\n';
  } else {
    script += 'var safeName = String(comp.name).replace(/[^A-Za-z0-9_\\-]+/g, "_");\n';
    script += 'var outName = safeName + "_t" + String(Math.round(t * 100) / 100).replace(".", "_") + "s.png";\n';
  }
  script += 'var outFile = new File(outFolder.fsName + "/" + outName);\n';
  script += 'if (!comp.saveFrameToPng) {\n';
  script += '  throw new Error("saveFrameToPng is not available in this After Effects version");\n';
  script += '}\n';
  // saveFrameToPng rasterises at the comp's current preview resolution, so a
  // comp left at Half or Quarter silently returns a downsampled frame and every
  // pixel comparison made against it is worthless. Force full resolution for the
  // render and put the user's setting back afterwards.
  script += 'var prevRes = comp.resolutionFactor;\n';
  script += 'var resForced = false;\n';
  script += 'try { comp.resolutionFactor = [1, 1]; resForced = true; } catch (eRF) {}\n';
  script += 'try {\n';
  script += '  comp.saveFrameToPng(t, outFile);\n';
  script += '} finally {\n';
  script += '  if (resForced) { try { comp.resolutionFactor = prevRes; } catch (eRR) {} }\n';
  script += '}\n';
  // File.exists caches, and on a fresh write it can answer false while the frame
  // is already on disk. Re-instantiate the File before believing the answer, and
  // give the write a moment: reporting a good render as a failure is worse than
  // waiting 200 ms.
  script += 'var check = new File(outFile.fsName);\n';
  script += 'for (var w = 0; w < 10 && !check.exists; w++) { $.sleep(20); check = new File(outFile.fsName); }\n';
  script += 'if (!check.exists) {\n';
  script += '  throw new Error("Frame render did not produce a file: " + outFile.fsName);\n';
  script += '}\n';

  script += generateResultObject({
    success: 'true',
    time: 't',
    path: 'outFile.fsName'
  });

  return script;
}

/**
 * Generate script for a full composition report: layers with geometry,
 * text data, expressions, keyframes and time samples. Lets the AI verify
 * the real state of a comp instead of trusting its own writes.
 */
export function generateGetCompReport(params: {
  compId?: number;
  compName?: string;
  sampleTimes?: number[];
  textPreview?: number;
}): string {
  let script = '';
  script += generateProjectCheck();
  script += generateCompAccess(params.compId, params.compName);

  const preview = params.textPreview || 120;

  // -- helpers (ES3) --
  // Never emit NaN/Infinity: CEP JSON.stringify polyfills turn them into bare
  // tokens that Node JSON.parse rejects, breaking the whole report bridge.
  script += 'function __r2(v) {\n';
  script += '  if (typeof v !== "number" || !isFinite(v)) { return null; }\n';
  script += '  return Math.round(v * 100) / 100;\n';
  script += '}\n';
  // Keyframe times need more than 2 decimals. At 50 fps a frame is 0.02 s, so
  // __r2 looks sufficient, but keys ported from a 24 fps comp land off-grid
  // (0.1666796875 s = 8.334 frames) and __r2 rounds that to a clean 0.17,
  // hiding it. The acceptance criteria demand an exact frame index per event,
  // so the report must not launder that away.
  script += 'function __r5(v) {\n';
  script += '  if (typeof v !== "number" || !isFinite(v)) { return null; }\n';
  script += '  return Math.round(v * 100000) / 100000;\n';
  script += '}\n';
  // A multidimensional property has one ease per component. They are usually
  // identical, so collapse to a scalar and only emit an array when they really
  // differ (Scale does: [81.67, 81.67, 33.333]).
  script += 'function __ease(arr) {\n';
  script += '  if (!arr || !arr.length) { return null; }\n';
  script += '  var o = [], same = true;\n';
  script += '  for (var i = 0; i < arr.length; i++) {\n';
  script += '    o.push(__r2(arr[i]));\n';
  script += '    if (i > 0 && o[i] !== o[0]) { same = false; }\n';
  script += '  }\n';
  script += '  return same ? o[0] : o;\n';
  script += '}\n';
  script += 'function __vec(v) {\n';
  script += '  if (v === null || v === undefined) { return null; }\n';
  script += '  if (typeof v === "number") { return __r2(v); }\n';
  script += '  if (v instanceof Array) {\n';
  script += '    var o = [];\n';
  script += '    for (var i = 0; i < v.length; i++) {\n';
  script += '      if (typeof v[i] !== "number" || !isFinite(v[i])) { return null; }\n';
  script += '      o.push(__r2(v[i]));\n';
  script += '    }\n';
  script += '    return o;\n';
  script += '  }\n';
  script += '  return null;\n';
  script += '}\n';

  // -- comp info --
  script += 'var report = {};\n';
  script += 'report.comp = { id: comp.id, name: comp.name, width: comp.width, height: comp.height, duration: __r2(comp.duration), frameRate: __r2(comp.frameRate), numLayers: comp.numLayers };\n';

  // -- markers --
  // EL PANEL DE ESSENTIAL GRAPHICS, que es lo que ve quien rellena la plantilla.
  // Es la cara publica de un master y no estaba en el informe: se leia la
  // maquinaria y no el producto.
  script += 'report.essentialGraphics = { templateName: null, controllers: [] };\n';
  script += 'try {\n';
  script += '  report.essentialGraphics.templateName = comp.motionGraphicsTemplateName;\n';
  script += '  var egn = comp.motionGraphicsTemplateControllerCount;\n';
  script += '  for (var ei = 1; ei <= egn; ei++) {\n';
  script += '    report.essentialGraphics.controllers.push({ index: ei, name: comp.getMotionGraphicsTemplateControllerName(ei) });\n';
  script += '  }\n';
  script += '} catch (eEG) {}\n';

  script += 'report.markers = [];\n';
  script += 'try {\n';
  script += '  var mk = comp.markerProperty;\n';
  script += '  for (var mi = 1; mi <= mk.numKeys; mi++) {\n';
  script += '    report.markers.push({ time: __r2(mk.keyTime(mi)), comment: mk.keyValue(mi).comment });\n';
  script += '  }\n';
  script += '} catch (eMk) {}\n';

  // -- sample times: explicit > markers > uniform 5 --
  if (params.sampleTimes && params.sampleTimes.length > 0) {
    const times: string[] = [];
    for (let i = 0; i < params.sampleTimes.length; i++) {
      times.push(String(params.sampleTimes[i]));
    }
    script += 'var sampleTimes = [' + times.join(', ') + '];\n';
  } else {
    script += 'var sampleTimes = [];\n';
    script += 'for (var si = 0; si < report.markers.length && si < 12; si++) { sampleTimes.push(report.markers[si].time); }\n';
    script += 'if (sampleTimes.length === 0) {\n';
    script += '  for (var ui = 1; ui <= 5; ui++) { sampleTimes.push(__r2(comp.duration * ui / 6)); }\n';
    script += '}\n';
  }
  script += 'report.sampleTimes = sampleTimes;\n';

  // -- recursive walk for expressions + keyframes --
  script += 'function __walk(group, path, acc, depth) {\n';
  script += '  if (depth > 5) { return; }\n';
  script += '  var n = 0;\n';
  script += '  try { n = group.numProperties; } catch (eN) { return; }\n';
  script += '  for (var i = 1; i <= n; i++) {\n';
  script += '    var sub = null;\n';
  script += '    try { sub = group.property(i); } catch (eS) { continue; }\n';
  script += '    if (!sub) { continue; }\n';
  script += '    var here = path + "/" + sub.name;\n';
  script += '    if (sub.propertyType === PropertyType.PROPERTY) {\n';
  script += '      var entry = null;\n';
  script += '      try {\n';
  script += '        if (sub.canSetExpression && sub.expression !== "") {\n';
  script += '          entry = { path: here, expression: sub.expression, enabled: sub.expressionEnabled };\n';
  script += '          if (sub.expressionError) { entry.error = sub.expressionError; }\n';
  script += '        }\n';
  script += '      } catch (eE) {}\n';
  script += '      try {\n';
  script += '        if (sub.numKeys > 0) {\n';
  script += '          if (!entry) { entry = { path: here }; }\n';
  script += '          entry.numKeys = sub.numKeys;\n';
  script += '          entry.keys = [];\n';
  script += '          for (var k = 1; k <= sub.numKeys && k <= 10; k++) {\n';
  script += '            var K = { t: __r5(sub.keyTime(k)), v: __vec(sub.keyValue(k)) };\n';
  // The interpolation type says bezier or linear, not how much curve: two
  // masters both reporting 6613 can move completely differently. Influence is
  // what tells them apart (linear 16.667, Easy Ease 33.333, and the house
  // presets 80 and 100). get_keyframes has carried this since 24/08, but the
  // report did not, and the report is what the constructor cards are built
  // from -- so no card could show a curve. Not every property accepts a
  // temporal ease (Source Text, Mask Path), hence the try.
  script += '            try {\n';
  script += '              var ei = sub.keyInTemporalEase(k), eo = sub.keyOutTemporalEase(k);\n';
  script += '              var fi = [], si = [], fo = [], so = [];\n';
  script += '              for (var q = 0; q < ei.length; q++) { fi.push(ei[q].influence); si.push(ei[q].speed); }\n';
  script += '              for (var w = 0; w < eo.length; w++) { fo.push(eo[w].influence); so.push(eo[w].speed); }\n';
  script += '              K.ii = __ease(fi); K.is = __ease(si);\n';
  script += '              K.oi = __ease(fo); K.os = __ease(so);\n';
  script += '            } catch (eEa) {}\n';
  script += '            try {\n';
  script += '              K.it = sub.keyInInterpolationType(k).toString();\n';
  script += '              K.ot = sub.keyOutInterpolationType(k).toString();\n';
  script += '            } catch (eIt) {}\n';
  script += '            entry.keys.push(K);\n';
  script += '          }\n';
  script += '        }\n';
  script += '      } catch (eK) {}\n';
  script += '      if (entry) { acc.push(entry); }\n';
  script += '    } else {\n';
  script += '      __walk(sub, here, acc, depth + 1);\n';
  script += '    }\n';
  script += '  }\n';
  script += '}\n';

  // -- layers --
  // A shy layer only disappears if the comp has the switch on. Reporting the
  // layer flag without this one says nothing about what is actually visible.
  script += 'try { report.comp.hideShyLayers = comp.hideShyLayers; } catch (eH) {}\n';
  script += 'report.layers = [];\n';
  script += 'for (var li = 1; li <= comp.numLayers; li++) {\n';
  script += '  var ly = comp.layer(li);\n';
  script += '  var L = { index: li, name: ly.name, matchName: ly.matchName, enabled: ly.enabled, inPoint: __r2(ly.inPoint), outPoint: __r2(ly.outPoint) };\n';
  // startTime: where the layer's OWN time zero sits on the parent timeline. The
  // report had inPoint and outPoint, which say when the layer is visible, and
  // that is not the same thing: a layer trimmed at the head is visible from its
  // inPoint but its content started earlier. Without startTime you cannot tell a
  // trimmed sequence from a shorter one, and you cannot map a frame of the parent
  // to a frame of the source. Measured 04/09/2026: an entire junction checker had
  // to be fed a hand-typed JSON because of this one missing field.
  script += '  try { L.startTime = __r2(ly.startTime); } catch (eSt) {}\n';
  script += '  try { L.threeD = ly.threeDLayer; } catch (e3) {}\n';
  // shy, solo, locked: the three switches that decide what a person actually
  // sees and can touch when they open the comp. Without them a report cannot
  // answer "what does the client see", only "what exists".
  script += '  try { L.shy = ly.shy; } catch (eS) {}\n';
  script += '  try { L.solo = ly.solo; } catch (eSo) {}\n';
  script += '  try { L.locked = ly.locked; } catch (eL) {}\n';
  // guideLayer: whether the render leaves this layer out. Without it a report
  // cannot tell an on-screen warning from one that only the person filling the
  // template ever sees, and that is the whole point of the warning layers.
  script += '  try { L.guideLayer = ly.guideLayer; } catch (eG) {}\n';
  // label: the layer colour. It is a norm, not decoration (green for the client
  // panel, yellow for the FAILFAST ones, blue for what gets painted, none for
  // plumbing), so a report without it cannot check that norm at all.
  script += '  try { L.label = ly.label; } catch (eLb) {}\n';
  script += '  try { L.parent = ly.parent ? ly.parent.name : null; } catch (eP) {}\n';
  // What the layer IS and what it CONTAINS. Without these the report is flat:
  // a precomposition looks like any other layer, so nothing downstream can walk
  // into it, and anything living inside one is invisible.
  script += '  try {\n';
  script += '    if (ly instanceof TextLayer) { L.kind = "text"; }\n';
  script += '    else if (ly instanceof ShapeLayer) { L.kind = "shape"; }\n';
  script += '    else if (ly instanceof CameraLayer) { L.kind = "camera"; }\n';
  script += '    else if (ly instanceof LightLayer) { L.kind = "light"; }\n';
  script += '    else if (ly.nullLayer) { L.kind = "null"; }\n';
  script += '    else if (ly.adjustmentLayer) { L.kind = "adjustment"; }\n';
  script += '    else if (ly.source instanceof CompItem) { L.kind = "precomp"; L.source = ly.source.name; L.sourceId = ly.source.id; }\n';
  script += '    else if (ly.source) { L.kind = "footage"; L.source = ly.source.name; }\n';
  script += '    else { L.kind = "otra"; }\n';
  script += '  } catch (eK) { L.kind = null; }\n';
  // Master Properties: what makes an INSTANCE an instance. A precomp layer whose
  // source publishes to Essential Graphics carries its own values here, and those
  // values are the whole difference between two layers that use the same comp.
  // A report without them cannot tell instances apart, so it cannot check that a
  // montage points at the right pieces, and it pushes whoever needs that data to
  // keep a second copy of it by hand.
  //
  // ⚠️ A Master Property can be a TextDocument, and reading one blows up the JSON
  // pass with "Text document not of Box document type". Values are reduced to
  // something serialisable HERE and never handed over raw, same as in
  // generateGetMasterProperties. A media replacement slot is NO_VALUE, so it
  // reports its name and the source layer it stands for, which is what identifies
  // the slot; what was dropped into it is not readable from scripting.
  script += '  try {\n';
  script += '    var eg = ly.property("Essential Properties");\n';
  script += '    if (eg && eg.numProperties > 0) {\n';
  script += '      L.masterProps = [];\n';
  script += '      for (var mi = 1; mi <= eg.numProperties; mi++) {\n';
  script += '        var mp = eg.property(mi);\n';
  script += '        var it = { index: mi };\n';
  script += '        try { it.name = mp.name; } catch (eN) {}\n';
  script += '        try { it.matchName = mp.matchName; } catch (eMn) {}\n';
  script += '        try {\n';
  script += '          var mv = mp.value;\n';
  script += '          var mt = typeof mv;\n';
  script += '          if (mv === null || mv === undefined) { it.value = null; }\n';
  script += '          else if (mt === "number" || mt === "string" || mt === "boolean") { it.value = mv; }\n';
  script += '          else if (mv instanceof Array) { var ma = []; for (var mk = 0; mk < mv.length; mk++) ma.push(mv[mk]); it.value = ma; }\n';
  script += '          else if (typeof mv.text === "string") { it.value = mv.text; }\n';
  script += '          else { it.value = null; }\n';
  script += '        } catch (eV) { it.value = null; }\n';
  script += '        try { var ms = mp.essentialPropertySource; if (ms) { it.sourceName = ms.name; } } catch (eSp) {}\n';
  script += '        L.masterProps.push(it);\n';
  script += '      }\n';
  script += '    }\n';
  script += '  } catch (eEg) {}\n';
  // Track mattes: a matte and the layer it cuts are one mechanism, and the
  // report showed them as two unrelated layers.
  script += '  try {\n';
  script += '    if (ly.trackMatteType && ly.trackMatteType !== TrackMatteType.NO_TRACK_MATTE) {\n';
  script += '      L.matte = String(ly.trackMatteType);\n';
  // Since AE 24 the matte can be any layer, not just the one above. Report the
  // real one; the layer above is a guess and reading it as fact sends you
  // rebuilding the wrong layer.
  script += '      var mtl = null;\n';
  script += '      try { mtl = ly.trackMatteLayer; } catch (eTL) { mtl = null; }\n';
  script += '      if (mtl) { L.matteDe = mtl.name; L.matteDeIndex = mtl.index; }\n';
  script += '      else if (li > 1) { L.matteDe = comp.layer(li - 1).name; L.matteDeSupuesto = true; }\n';
  script += '    }\n';
  script += '  } catch (eM) {}\n';
  script += '  try {\n';
  script += '    var rc = ly.sourceRectAtTime(ly.inPoint, false);\n';
  script += '    L.rect = { w: Math.round(rc.width), h: Math.round(rc.height), left: Math.round(rc.left), top: Math.round(rc.top) };\n';
  script += '  } catch (eR) {}\n';
  script += '  try { L.position = __vec(ly.property("Position").value); } catch (ePos) {}\n';
  script += '  try { L.anchor = __vec(ly.property("Anchor Point").value); } catch (eA) {}\n';
  script += '  try { L.scale = __vec(ly.property("Scale").value); } catch (eSc) {}\n';
  script += '  try { L.opacity = __r2(ly.property("Opacity").value); } catch (eO) {}\n';
  script += '  try {\n';
  script += '    if (ly.threeDLayer) {\n';
  script += '      L.rotX = __r2(ly.property("X Rotation").value);\n';
  script += '      L.rotY = __r2(ly.property("Y Rotation").value);\n';
  script += '      L.rotZ = __r2(ly.property("Z Rotation").value);\n';
  script += '    } else {\n';
  script += '      L.rotation = __r2(ly.property("Rotation").value);\n';
  script += '    }\n';
  script += '  } catch (eRot) {}\n';
  script += '  if (ly instanceof TextLayer) {\n';
  script += '    try {\n';
  script += '      var td = ly.property("Source Text").value;\n';
  script += '      L.text = { font: td.font, fontFamily: td.fontFamily, fontSize: __r2(td.fontSize), tracking: __r2(td.tracking), preview: String(td.text).substring(0, ' + preview + ') };\n';
  script += '      try { L.text.leading = __r2(td.leading); } catch (eLd) {}\n';
  script += '    } catch (eT) {}\n';
  script += '  }\n';
  script += '  if (ly.matchName === "ADBE Camera Layer") {\n';
  script += '    try { L.zoom = __r2(ly.property("Camera Options").property("Zoom").value); } catch (eZ) {}\n';
  script += '  }\n';
  // LOS EFECTOS DE LA CAPA, con su valor y sus opciones si es un desplegable.
  //
  // Sin esto el informe solo trae las propiedades ANIMADAS o con expresion, asi
  // que un panel de mandos entero (deslizadores y casillas quietos) era
  // invisible. Quien queria leer el panel de una plantilla tenia que mantener un
  // volcado aparte a mano, y el 20/08 ese volcado llevaba dias desfasado y hacia
  // que las fichas listaran mandos que ya no existian.
  script += '  var fx = [];\n';
  script += '  try {\n';
  script += '    var fxg = ly.property("Effects");\n';
  script += '    if (fxg) {\n';
  script += '      for (var fi = 1; fi <= fxg.numProperties; fi++) {\n';
  script += '        var ef = fxg.property(fi);\n';
  script += '        var E = { index: fi, name: ef.name, matchName: ef.matchName, enabled: ef.enabled };\n';
  script += '        try {\n';
  script += '          var p1 = ef.property(1);\n';
  script += '          if (p1) {\n';
  script += '            E.control = p1.name;\n';
  script += '            var v1 = p1.value;\n';
  script += '            if (v1 instanceof Array) { E.value = __vec(v1); }\n';
  script += '            else if (typeof v1 === "number") { E.value = __r2(v1); }\n';
  script += '            else if (typeof v1 === "boolean" || typeof v1 === "string") { E.value = v1; }\n';
  script += '          }\n';
  script += '        } catch (eV) {}\n';
  // Un desplegable guarda sus opciones en propertyParameters. Sin ellas el mando
  // dice «3» y no dice de que.
  script += '        try {\n';
  script += '          var pp2 = ef.property(1).propertyParameters;\n';
  script += '          if (pp2 && pp2.length) {\n';
  script += '            var opts = [];\n';
  script += '            for (var oi = 0; oi < pp2.length; oi++) { opts.push(String(pp2[oi])); }\n';
  script += '            E.options = opts;\n';
  script += '          }\n';
  script += '        } catch (eO2) {}\n';
  script += '        fx.push(E);\n';
  script += '      }\n';
  script += '    }\n';
  script += '  } catch (eFx) {}\n';
  script += '  if (fx.length > 0) { L.effects = fx; }\n';

  script += '  var animated = [];\n';
  script += '  __walk(ly, "", animated, 0);\n';
  script += '  if (animated.length > 0) { L.animatedProps = animated; }\n';
  script += '  var samples = [];\n';
  script += '  for (var st = 0; st < sampleTimes.length; st++) {\n';
  script += '    var T = sampleTimes[st];\n';
  script += '    if (T < ly.inPoint || T > ly.outPoint) { continue; }\n';
  script += '    try {\n';
  script += '      var hasAnim = false;\n';
  script += '      var pp = ly.property("Position");\n';
  script += '      var op = ly.property("Opacity");\n';
  script += '      var sp = ly.property("Scale");\n';
  script += '      if (pp && (pp.numKeys > 0 || pp.expressionEnabled)) { hasAnim = true; }\n';
  script += '      if (op && (op.numKeys > 0 || op.expressionEnabled)) { hasAnim = true; }\n';
  script += '      if (sp && (sp.numKeys > 0 || sp.expressionEnabled)) { hasAnim = true; }\n';
  script += '      if (hasAnim) {\n';
  script += '        samples.push({ t: __r2(T), position: __vec(pp.valueAtTime(T, false)), scale: __vec(sp.valueAtTime(T, false)), opacity: __r2(op.valueAtTime(T, false)) });\n';
  script += '      }\n';
  script += '    } catch (eSm) {}\n';
  script += '  }\n';
  script += '  if (samples.length > 0) { L.samples = samples; }\n';
  script += '  report.layers.push(L);\n';
  script += '}\n';

  // -- fonts used vs installed --
  script += 'report.fonts = [];\n';
  script += 'try {\n';
  script += '  var used = {};\n';
  script += '  for (var fi = 0; fi < report.layers.length; fi++) {\n';
  script += '    var lt = report.layers[fi].text;\n';
  script += '    if (lt && lt.font) { used[lt.font] = 1; }\n';
  script += '  }\n';
  script += '  for (var ps in used) {\n';
  script += '    if (!used.hasOwnProperty(ps)) { continue; }\n';
  script += '    var entryF = { postScriptName: ps, installed: "unknown" };\n';
  script += '    try {\n';
  // AE 24+: allFonts is an array of family arrays; older shapes may be flat.
  script += '      entryF.installed = false;\n';
  script += '      if (app.fonts && typeof app.fonts.getFontByPostScriptName === "function") {\n';
  script += '        entryF.installed = !!app.fonts.getFontByPostScriptName(ps);\n';
  script += '      } else {\n';
  script += '        var all = app.fonts.allFonts;\n';
  script += '        for (var ai = 0; ai < all.length; ai++) {\n';
  script += '          var family = all[ai];\n';
  script += '          if (family && family.postScriptName === ps) { entryF.installed = true; break; }\n';
  script += '          if (!(family instanceof Array)) { continue; }\n';
  script += '          for (var fi2 = 0; fi2 < family.length; fi2++) {\n';
  script += '            if (family[fi2] && family[fi2].postScriptName === ps) { entryF.installed = true; break; }\n';
  script += '          }\n';
  script += '          if (entryF.installed) { break; }\n';
  script += '        }\n';
  script += '      }\n';
  script += '    } catch (eF) {}\n';
  script += '    report.fonts.push(entryF);\n';
  script += '  }\n';
  script += '} catch (eFF) {}\n';

  script += 'report;\n';

  return script;
}

/**
 * generateDumpCompReport — el mismo informe que generateGetCompReport, pero
 * ESCRITO A FICHERO en vez de devuelto a la conversacion.
 *
 * ⚠️ EL PORQUE, que no es capricho: el informe de una comp son decenas de miles
 * de caracteres. Para documentar 26 masters, devolverlos por el canal del MCP
 * es inviable. Con esto el volcado cuesta una linea de respuesta y el fichero
 * queda en disco listo para que lo lea un script.
 *
 * ⚠️ ExtendScript es ES3 y NO tiene JSON.stringify, asi que se serializa a mano.
 * Todo lo que no sea ASCII imprimible sale como \uXXXX: los nombres de capa de
 * este proyecto van llenos de ñ, ·, ▹ y ⚙, y por ahi se rompe un fichero.
 */
export function generateDumpCompReport(params: {
  compId?: number;
  compName?: string;
  outPath: string;
  sampleTimes?: number[];
  textPreview?: number;
}): string {
  // El generador de siempre deja el objeto en `report`. Se le quita la ultima
  // linea, que solo lo evalua para devolverlo.
  let script = generateGetCompReport({
    compId: params.compId,
    compName: params.compName,
    sampleTimes: params.sampleTimes,
    textPreview: params.textPreview,
  }).replace(/report;\n$/, '');

  script += 'function __esc(s) {\n';
  script += '  s = String(s); var out = "", c, code, h;\n';
  script += '  for (var i = 0; i < s.length; i++) {\n';
  script += '    c = s.charAt(i); code = s.charCodeAt(i);\n';
  script += '    if (c === "\\"") { out += "\\\\\\""; }\n';
  script += '    else if (c === "\\\\") { out += "\\\\\\\\"; }\n';
  script += '    else if (code === 10) { out += "\\\\n"; }\n';
  script += '    else if (code === 13) { out += "\\\\r"; }\n';
  script += '    else if (code === 9) { out += "\\\\t"; }\n';
  script += '    else if (code < 32 || code > 126) {\n';
  script += '      h = code.toString(16); while (h.length < 4) { h = "0" + h; }\n';
  script += '      out += "\\\\u" + h;\n';
  script += '    } else { out += c; }\n';
  script += '  }\n';
  script += '  return "\\"" + out + "\\"";\n';
  script += '}\n';

  script += 'function __ser(v) {\n';
  script += '  if (v === null || v === undefined) { return "null"; }\n';
  script += '  var t = typeof v;\n';
  script += '  if (t === "number") { return isFinite(v) ? String(v) : "null"; }\n';
  script += '  if (t === "boolean") { return v ? "true" : "false"; }\n';
  script += '  if (t === "string") { return __esc(v); }\n';
  script += '  if (v instanceof Array) {\n';
  script += '    var a = []; for (var i = 0; i < v.length; i++) { a.push(__ser(v[i])); }\n';
  script += '    return "[" + a.join(",") + "]";\n';
  script += '  }\n';
  script += '  var o = [];\n';
  script += '  for (var k in v) {\n';
  script += '    if (!v.hasOwnProperty(k)) { continue; }\n';
  script += '    if (typeof v[k] === "function") { continue; }\n';
  script += '    o.push(__esc(k) + ":" + __ser(v[k]));\n';
  script += '  }\n';
  script += '  return "{" + o.join(",") + "}";\n';
  script += '}\n';

  const salida = params.outPath.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  script += 'var __txt = __ser(report);\n';
  script += 'var __f = new File("' + salida + '");\n';
  script += 'var __dir = __f.parent;\n';
  script += 'if (!__dir.exists) { __dir.create(); }\n';
  script += '__f.encoding = "UTF-8";\n';
  script += 'if (!__f.open("w")) { throw new Error("No se pudo abrir para escribir: " + __f.fsName); }\n';
  script += '__f.write(__txt);\n';
  script += '__f.close();\n';
  script += 'var __res = { success: true, path: __f.fsName, bytes: __txt.length, comp: report.comp.name, layers: report.comp.numLayers };\n';
  script += '__res;\n';

  return script;
}
