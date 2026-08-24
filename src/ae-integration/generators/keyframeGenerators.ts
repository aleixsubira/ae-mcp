/**
 * Keyframe-related Script Generators
 *
 * Generates ES3-compatible ExtendScript for keyframe operations.
 */

import {
  escapeString,
  generateProjectCheck,
  generateCompAccess,
  generateLayerAccess,
  generatePropertyAccess,
  formatKeyframeValue,
  generateInterpolationType,
  wrapInUndoGroup,
  generateResultObject,
  arrayToES3
} from './helpers.js';

/**
 * Generate script to set a keyframe
 */
export function generateSetKeyframe(params: {
  compId?: number;
  compName?: string;
  layerIndex?: number;
  layerName?: string;
  property: string;
  time: number;
  value: number | number[] | string;
}): string {
  let script = '';
  script += generateProjectCheck();
  script += generateCompAccess(params.compId, params.compName);
  script += generateLayerAccess('comp', params.layerIndex, params.layerName);
  script += generatePropertyAccess('layer', params.property);

  script += 'var keyTime = ' + params.time + ';\n';
  script += 'var keyValue = ' + formatKeyframeValue(params.value) + ';\n';

  // Check if property can have keyframes
  script += 'if (!prop.canVaryOverTime) {\n';
  script += '  throw new Error("Property cannot have keyframes: ' + escapeString(params.property) + '");\n';
  script += '}\n';

  // Add or update keyframe
  script += 'var keyIndex = prop.addKey(keyTime);\n';
  script += 'prop.setValueAtKey(keyIndex, keyValue);\n';

  script += generateResultObject({
    keyIndex: 'keyIndex',
    time: 'keyTime',
    property: '"' + escapeString(params.property) + '"'
  });

  return wrapInUndoGroup(script, 'Set Keyframe');
}

/**
 * Generate script to set an advanced keyframe with easing
 */
export function generateSetKeyframeAdvanced(params: {
  compId?: number;
  compName?: string;
  layerIndex?: number;
  layerName?: string;
  property: string;
  time: number;
  value: number | number[] | string;
  inType?: string;
  outType?: string;
  inEase?: { speed: number; influence: number };
  outEase?: { speed: number; influence: number };
}): string {
  let script = '';
  script += generateProjectCheck();
  script += generateCompAccess(params.compId, params.compName);
  script += generateLayerAccess('comp', params.layerIndex, params.layerName);
  script += generatePropertyAccess('layer', params.property);

  script += 'var keyTime = ' + params.time + ';\n';
  script += 'var keyValue = ' + formatKeyframeValue(params.value) + ';\n';

  script += 'if (!prop.canVaryOverTime) {\n';
  script += '  throw new Error("Property cannot have keyframes: ' + escapeString(params.property) + '");\n';
  script += '}\n';

  script += 'var keyIndex = prop.addKey(keyTime);\n';
  script += 'prop.setValueAtKey(keyIndex, keyValue);\n';

  // Set interpolation types
  if (params.inType || params.outType) {
    const inType = params.inType || 'BEZIER';
    const outType = params.outType || 'BEZIER';
    script += 'prop.setInterpolationTypeAtKey(keyIndex, ';
    script += generateInterpolationType(inType) + ', ';
    script += generateInterpolationType(outType) + ');\n';
  }

  // Set temporal ease
  if (params.inEase || params.outEase) {
    // Determine number of dimensions
    script += 'var numDims = 1;\n';
    script += 'if (prop.propertyValueType === PropertyValueType.TwoD || prop.propertyValueType === PropertyValueType.TwoD_SPATIAL) {\n';
    script += '  numDims = 2;\n';
    script += '} else if (prop.propertyValueType === PropertyValueType.ThreeD || prop.propertyValueType === PropertyValueType.ThreeD_SPATIAL) {\n';
    script += '  numDims = 3;\n';
    script += '}\n';

    script += 'var inEaseArr = [];\n';
    script += 'var outEaseArr = [];\n';
    script += 'for (var d = 0; d < numDims; d++) {\n';

    if (params.inEase) {
      script += '  inEaseArr.push(new KeyframeEase(' + params.inEase.speed + ', ' + params.inEase.influence + '));\n';
    } else {
      script += '  inEaseArr.push(new KeyframeEase(0, 33.33));\n';
    }

    if (params.outEase) {
      script += '  outEaseArr.push(new KeyframeEase(' + params.outEase.speed + ', ' + params.outEase.influence + '));\n';
    } else {
      script += '  outEaseArr.push(new KeyframeEase(0, 33.33));\n';
    }

    script += '}\n';
    script += 'prop.setTemporalEaseAtKey(keyIndex, inEaseArr, outEaseArr);\n';
  }

  script += generateResultObject({
    keyIndex: 'keyIndex',
    time: 'keyTime',
    property: '"' + escapeString(params.property) + '"'
  });

  return wrapInUndoGroup(script, 'Set Keyframe');
}

/**
 * Generate script to apply easy ease to keyframes
 */
export function generateApplyEasyEase(params: {
  compId?: number;
  compName?: string;
  layerIndex?: number;
  layerName?: string;
  property: string;
  keyframeIndex?: number;
  type?: string;
}): string {
  let script = '';
  script += generateProjectCheck();
  script += generateCompAccess(params.compId, params.compName);
  script += generateLayerAccess('comp', params.layerIndex, params.layerName);
  script += generatePropertyAccess('layer', params.property);

  const easeType = params.type || 'BOTH';

  script += 'if (prop.numKeys === 0) {\n';
  script += '  throw new Error("Property has no keyframes");\n';
  script += '}\n';

  // Determine which keyframes to process
  if (params.keyframeIndex) {
    script += 'var startKey = ' + params.keyframeIndex + ';\n';
    script += 'var endKey = ' + params.keyframeIndex + ';\n';
  } else {
    script += 'var startKey = 1;\n';
    script += 'var endKey = prop.numKeys;\n';
  }

  // Get number of dimensions
  script += 'var numDims = 1;\n';
  script += 'if (prop.propertyValueType === PropertyValueType.TwoD || prop.propertyValueType === PropertyValueType.TwoD_SPATIAL) {\n';
  script += '  numDims = 2;\n';
  script += '} else if (prop.propertyValueType === PropertyValueType.ThreeD || prop.propertyValueType === PropertyValueType.ThreeD_SPATIAL) {\n';
  script += '  numDims = 3;\n';
  script += '}\n';

  script += 'var easeValue = 33.33;\n';
  script += 'for (var k = startKey; k <= endKey; k++) {\n';
  script += '  var inEaseArr = [];\n';
  script += '  var outEaseArr = [];\n';
  script += '  for (var d = 0; d < numDims; d++) {\n';

  if (easeType === 'IN' || easeType === 'BOTH') {
    script += '    inEaseArr.push(new KeyframeEase(0, easeValue));\n';
  } else {
    script += '    inEaseArr.push(prop.keyInTemporalEase(k)[d]);\n';
  }

  if (easeType === 'OUT' || easeType === 'BOTH') {
    script += '    outEaseArr.push(new KeyframeEase(0, easeValue));\n';
  } else {
    script += '    outEaseArr.push(prop.keyOutTemporalEase(k)[d]);\n';
  }

  script += '  }\n';
  script += '  prop.setTemporalEaseAtKey(k, inEaseArr, outEaseArr);\n';
  script += '}\n';

  script += generateResultObject({
    success: 'true',
    keyframesModified: 'endKey - startKey + 1'
  });

  return wrapInUndoGroup(script, 'Apply Easy Ease');
}

/**
 * Generate script to set temporal ease on a keyframe
 */
export function generateSetTemporalEase(params: {
  compId?: number;
  compName?: string;
  layerIndex?: number;
  layerName?: string;
  property: string;
  keyframeIndex: number;
  inSpeed?: number;
  inInfluence?: number;
  outSpeed?: number;
  outInfluence?: number;
}): string {
  let script = '';
  script += generateProjectCheck();
  script += generateCompAccess(params.compId, params.compName);
  script += generateLayerAccess('comp', params.layerIndex, params.layerName);
  script += generatePropertyAccess('layer', params.property);

  script += 'var keyIndex = ' + params.keyframeIndex + ';\n';
  script += 'if (keyIndex > prop.numKeys) {\n';
  script += '  throw new Error("Keyframe index out of range");\n';
  script += '}\n';

  // Get number of dimensions
  script += 'var numDims = 1;\n';
  script += 'if (prop.propertyValueType === PropertyValueType.TwoD || prop.propertyValueType === PropertyValueType.TwoD_SPATIAL) {\n';
  script += '  numDims = 2;\n';
  script += '} else if (prop.propertyValueType === PropertyValueType.ThreeD || prop.propertyValueType === PropertyValueType.ThreeD_SPATIAL) {\n';
  script += '  numDims = 3;\n';
  script += '}\n';

  script += 'var currentInEase = prop.keyInTemporalEase(keyIndex);\n';
  script += 'var currentOutEase = prop.keyOutTemporalEase(keyIndex);\n';

  script += 'var inEaseArr = [];\n';
  script += 'var outEaseArr = [];\n';

  const inSpeed = params.inSpeed !== undefined ? params.inSpeed : 'currentInEase[d].speed';
  const inInfluence = params.inInfluence !== undefined ? params.inInfluence : 'currentInEase[d].influence';
  const outSpeed = params.outSpeed !== undefined ? params.outSpeed : 'currentOutEase[d].speed';
  const outInfluence = params.outInfluence !== undefined ? params.outInfluence : 'currentOutEase[d].influence';

  script += 'for (var d = 0; d < numDims; d++) {\n';
  script += '  inEaseArr.push(new KeyframeEase(' + inSpeed + ', ' + inInfluence + '));\n';
  script += '  outEaseArr.push(new KeyframeEase(' + outSpeed + ', ' + outInfluence + '));\n';
  script += '}\n';

  script += 'prop.setTemporalEaseAtKey(keyIndex, inEaseArr, outEaseArr);\n';

  script += generateResultObject({
    success: 'true',
    keyIndex: 'keyIndex'
  });

  return wrapInUndoGroup(script, 'Set Temporal Ease');
}

/**
 * Generate script to offset keyframes in time
 */
export function generateOffsetKeyframes(params: {
  compId?: number;
  compName?: string;
  layerIndex?: number;
  layerName?: string;
  property: string;
  offset: number;
}): string {
  let script = '';
  script += generateProjectCheck();
  script += generateCompAccess(params.compId, params.compName);
  script += generateLayerAccess('comp', params.layerIndex, params.layerName);
  script += generatePropertyAccess('layer', params.property);

  script += 'var offset = ' + params.offset + ';\n';

  script += 'if (prop.numKeys === 0) {\n';
  script += '  throw new Error("Property has no keyframes");\n';
  script += '}\n';

  // Store keyframe data
  script += 'var keyData = [];\n';
  script += 'for (var i = 1; i <= prop.numKeys; i++) {\n';
  script += '  keyData.push({\n';
  script += '    time: prop.keyTime(i),\n';
  script += '    value: prop.keyValue(i),\n';
  script += '    inType: prop.keyInInterpolationType(i),\n';
  script += '    outType: prop.keyOutInterpolationType(i),\n';
  script += '    inEase: prop.keyInTemporalEase(i),\n';
  script += '    outEase: prop.keyOutTemporalEase(i)\n';
  script += '  });\n';
  script += '}\n';

  // Remove all keyframes
  script += 'while (prop.numKeys > 0) {\n';
  script += '  prop.removeKey(1);\n';
  script += '}\n';

  // Re-add keyframes at new times
  script += 'for (var i = 0; i < keyData.length; i++) {\n';
  script += '  var newTime = keyData[i].time + offset;\n';
  script += '  if (newTime >= 0) {\n';
  script += '    var keyIndex = prop.addKey(newTime);\n';
  script += '    prop.setValueAtKey(keyIndex, keyData[i].value);\n';
  script += '    prop.setInterpolationTypeAtKey(keyIndex, keyData[i].inType, keyData[i].outType);\n';
  script += '    prop.setTemporalEaseAtKey(keyIndex, keyData[i].inEase, keyData[i].outEase);\n';
  script += '  }\n';
  script += '}\n';

  script += generateResultObject({
    success: 'true',
    keyframesMoved: 'keyData.length',
    offset: 'offset'
  });

  return wrapInUndoGroup(script, 'Offset Keyframes');
}

/**
 * Generate script to scale keyframe timing
 */
export function generateScaleKeyframeTiming(params: {
  compId?: number;
  compName?: string;
  layerIndex?: number;
  layerName?: string;
  property: string;
  scale: number;
  anchorTime?: number;
}): string {
  let script = '';
  script += generateProjectCheck();
  script += generateCompAccess(params.compId, params.compName);
  script += generateLayerAccess('comp', params.layerIndex, params.layerName);
  script += generatePropertyAccess('layer', params.property);

  const anchor = params.anchorTime !== undefined ? params.anchorTime : 0;
  script += 'var scaleFactor = ' + params.scale + ';\n';
  script += 'var anchorTime = ' + anchor + ';\n';

  script += 'if (prop.numKeys === 0) {\n';
  script += '  throw new Error("Property has no keyframes");\n';
  script += '}\n';

  // Store keyframe data
  script += 'var keyData = [];\n';
  script += 'for (var i = 1; i <= prop.numKeys; i++) {\n';
  script += '  keyData.push({\n';
  script += '    time: prop.keyTime(i),\n';
  script += '    value: prop.keyValue(i),\n';
  script += '    inType: prop.keyInInterpolationType(i),\n';
  script += '    outType: prop.keyOutInterpolationType(i),\n';
  script += '    inEase: prop.keyInTemporalEase(i),\n';
  script += '    outEase: prop.keyOutTemporalEase(i)\n';
  script += '  });\n';
  script += '}\n';

  // Remove all keyframes
  script += 'while (prop.numKeys > 0) {\n';
  script += '  prop.removeKey(1);\n';
  script += '}\n';

  // Re-add keyframes at scaled times
  script += 'for (var i = 0; i < keyData.length; i++) {\n';
  script += '  var newTime = anchorTime + (keyData[i].time - anchorTime) * scaleFactor;\n';
  script += '  if (newTime >= 0) {\n';
  script += '    var keyIndex = prop.addKey(newTime);\n';
  script += '    prop.setValueAtKey(keyIndex, keyData[i].value);\n';
  script += '    prop.setInterpolationTypeAtKey(keyIndex, keyData[i].inType, keyData[i].outType);\n';
  script += '    prop.setTemporalEaseAtKey(keyIndex, keyData[i].inEase, keyData[i].outEase);\n';
  script += '  }\n';
  script += '}\n';

  script += generateResultObject({
    success: 'true',
    keyframesScaled: 'keyData.length',
    scale: 'scaleFactor'
  });

  return wrapInUndoGroup(script, 'Scale Keyframe Timing');
}

/**
 * Generate script to reverse keyframes
 */
export function generateReverseKeyframes(params: {
  compId?: number;
  compName?: string;
  layerIndex?: number;
  layerName?: string;
  property: string;
}): string {
  let script = '';
  script += generateProjectCheck();
  script += generateCompAccess(params.compId, params.compName);
  script += generateLayerAccess('comp', params.layerIndex, params.layerName);
  script += generatePropertyAccess('layer', params.property);

  script += 'if (prop.numKeys < 2) {\n';
  script += '  throw new Error("Need at least 2 keyframes to reverse");\n';
  script += '}\n';

  // Store keyframe data
  script += 'var keyData = [];\n';
  script += 'var firstTime = prop.keyTime(1);\n';
  script += 'var lastTime = prop.keyTime(prop.numKeys);\n';
  script += 'for (var i = 1; i <= prop.numKeys; i++) {\n';
  script += '  keyData.push({\n';
  script += '    time: prop.keyTime(i),\n';
  script += '    value: prop.keyValue(i),\n';
  script += '    inType: prop.keyInInterpolationType(i),\n';
  script += '    outType: prop.keyOutInterpolationType(i),\n';
  script += '    inEase: prop.keyInTemporalEase(i),\n';
  script += '    outEase: prop.keyOutTemporalEase(i)\n';
  script += '  });\n';
  script += '}\n';

  // Remove all keyframes
  script += 'while (prop.numKeys > 0) {\n';
  script += '  prop.removeKey(1);\n';
  script += '}\n';

  // Re-add keyframes in reverse order with reversed times
  script += 'for (var i = keyData.length - 1; i >= 0; i--) {\n';
  script += '  var newTime = firstTime + (lastTime - keyData[i].time);\n';
  script += '  var keyIndex = prop.addKey(newTime);\n';
  script += '  prop.setValueAtKey(keyIndex, keyData[i].value);\n';
  // Swap in/out types
  script += '  prop.setInterpolationTypeAtKey(keyIndex, keyData[i].outType, keyData[i].inType);\n';
  // Swap in/out ease
  script += '  prop.setTemporalEaseAtKey(keyIndex, keyData[i].outEase, keyData[i].inEase);\n';
  script += '}\n';

  script += generateResultObject({
    success: 'true',
    keyframesReversed: 'keyData.length'
  });

  return wrapInUndoGroup(script, 'Reverse Keyframes');
}

/**
 * Generate script to copy keyframes between properties
 */
export function generateCopyKeyframes(params: {
  compId?: number;
  compName?: string;
  sourceLayerIndex?: number;
  sourceLayerName?: string;
  sourceProperty: string;
  targetLayerIndex?: number;
  targetLayerName?: string;
  targetProperty?: string;
  timeOffset?: number;
}): string {
  let script = '';
  script += generateProjectCheck();
  script += generateCompAccess(params.compId, params.compName);

  // Get source layer and property
  script += generateLayerAccess('comp', params.sourceLayerIndex, params.sourceLayerName);
  script += 'var sourceLayer = layer;\n';
  script += generatePropertyAccess('sourceLayer', params.sourceProperty);
  script += 'var sourceProp = prop;\n';

  // Get target layer and property
  if (params.targetLayerIndex || params.targetLayerName) {
    script += generateLayerAccess('comp', params.targetLayerIndex, params.targetLayerName);
  } else {
    script += 'layer = sourceLayer;\n';
  }
  const targetProp = params.targetProperty || params.sourceProperty;
  script += generatePropertyAccess('layer', targetProp);
  script += 'var targetProp = prop;\n';

  const timeOffset = params.timeOffset || 0;

  script += 'if (sourceProp.numKeys === 0) {\n';
  script += '  throw new Error("Source property has no keyframes");\n';
  script += '}\n';

  // Copy keyframes
  script += 'var keysCopied = 0;\n';
  script += 'for (var i = 1; i <= sourceProp.numKeys; i++) {\n';
  script += '  var newTime = sourceProp.keyTime(i) + ' + timeOffset + ';\n';
  script += '  if (newTime >= 0) {\n';
  script += '    var keyIndex = targetProp.addKey(newTime);\n';
  script += '    targetProp.setValueAtKey(keyIndex, sourceProp.keyValue(i));\n';
  script += '    targetProp.setInterpolationTypeAtKey(keyIndex, sourceProp.keyInInterpolationType(i), sourceProp.keyOutInterpolationType(i));\n';
  script += '    targetProp.setTemporalEaseAtKey(keyIndex, sourceProp.keyInTemporalEase(i), sourceProp.keyOutTemporalEase(i));\n';
  script += '    keysCopied++;\n';
  script += '  }\n';
  script += '}\n';

  script += generateResultObject({
    success: 'true',
    keyframesCopied: 'keysCopied'
  });

  return wrapInUndoGroup(script, 'Copy Keyframes');
}

/**
 * Generate script to get keyframes from a property
 */
export function generateGetKeyframes(params: {
  compId?: number;
  compName?: string;
  layerIndex?: number;
  layerName?: string;
  property: string;
}): string {
  let script = '';
  script += generateProjectCheck();
  script += generateCompAccess(params.compId, params.compName);
  script += generateLayerAccess('comp', params.layerIndex, params.layerName);
  script += generatePropertyAccess('layer', params.property);

  script += 'var keyframes = [];\n';
  script += 'for (var i = 1; i <= prop.numKeys; i++) {\n';
  script += '  var kf = {};\n';
  script += '  kf.index = i;\n';
  script += '  kf.time = prop.keyTime(i);\n';
  script += '  kf.value = prop.keyValue(i);\n';
  script += '  kf.inInterpolation = prop.keyInInterpolationType(i).toString();\n';
  script += '  kf.outInterpolation = prop.keyOutInterpolationType(i).toString();\n';
  script += '  keyframes.push(kf);\n';
  script += '}\n';

  script += 'var result = {};\n';
  script += 'result.property = "' + escapeString(params.property) + '";\n';
  script += 'result.numKeys = prop.numKeys;\n';
  script += 'result.keyframes = keyframes;\n';
  script += 'result;\n';

  return script;
}

/**
 * Remove keyframes from a property.
 *
 * The MCP could create keyframes and not delete them, so the only way to undo an
 * inherited animation was an expression that returns a constant: the keys stay
 * underneath and whoever opens the timeline sees an animation that does not
 * happen. This closes that hole.
 *
 * Without `times`, every key goes and the property is left holding the value it
 * had at `keepValueAt` (default: the first key), so removing an animation does
 * not also move the layer.
 */
/**
 * Read the CONTENT of every keyframe of a Source Text property.
 *
 * `get_keyframes` cannot do this. Its `prop.keyValue(i)` hands back a whole
 * TextDocument, and reading one blows up with «Text document not of Box
 * document type»: several of its fields exist only on box text, and touching
 * them on point text throws. The generic report has the same problem and
 * returns `null` for the values.
 *
 * The consequence is worse than a missing feature: there is no way to answer
 * "does the text CHANGE between these keyframes", so a master with animated
 * copy has to be diagnosed by rendering frames and looking at them. That is how
 * it was done on 24 Aug 2026 for M04_Productos_AW, and it only worked because
 * the layer had two keyframes.
 *
 * So this reduces each TextDocument to fields that are safe to serialise, each
 * one guarded on its own: a field that throws is reported absent instead of
 * killing the whole call.
 */
export function generateGetTextKeyframes(params: {
  compId?: number;
  compName?: string;
  layerIndex?: number;
  layerName?: string;
  property?: string;
}): string {
  const prop = params.property || 'Source Text';
  let script = '';
  script += generateProjectCheck();
  script += generateCompAccess(params.compId, params.compName);
  script += generateLayerAccess('comp', params.layerIndex, params.layerName);
  script += generatePropertyAccess('layer', prop);

  // One guarded read per field. `boxText` fields throw on point text, which is
  // the whole reason the generic reader fails.
  script += 'function leerDoc(d) {\n';
  script += '  var o = {};\n';
  script += '  try { o.text = d.text; } catch (e) { o.text = null; }\n';
  script += '  try { o.font = d.font; } catch (e) {}\n';
  script += '  try { o.fontSize = d.fontSize; } catch (e) {}\n';
  script += '  try { o.tracking = d.tracking; } catch (e) {}\n';
  script += '  try { o.leading = d.leading; } catch (e) {}\n';
  script += '  try { o.autoLeading = d.autoLeading; } catch (e) {}\n';
  script += '  try { o.justification = d.justification.toString(); } catch (e) {}\n';
  script += '  try { o.boxText = d.boxText; } catch (e) { o.boxText = false; }\n';
  script += '  return o;\n';
  script += '}\n';

  script += 'var keyframes = [];\n';
  script += 'for (var i = 1; i <= prop.numKeys; i++) {\n';
  script += '  var kf = { index: i };\n';
  script += '  try { kf.time = prop.keyTime(i); } catch (e) { kf.time = null; }\n';
  script += '  try { kf.doc = leerDoc(prop.keyValue(i)); } catch (e) { kf.doc = null; kf.error = e.toString(); }\n';
  script += '  keyframes.push(kf);\n';
  script += '}\n';

  // Sin claves, el valor estatico. Una capa de texto sin animar tambien tiene
  // contenido, y preguntar por el no deberia devolver una lista vacia.
  script += 'var estatico = null;\n';
  script += 'if (prop.numKeys === 0) { try { estatico = leerDoc(prop.value); } catch (e) { estatico = null; } }\n';

  // Lo que se viene a preguntar: ¿cambia el texto entre claves?
  script += 'var cambia = false;\n';
  script += 'for (var j = 1; j < keyframes.length; j++) {\n';
  script += '  var a = keyframes[j-1].doc, b = keyframes[j].doc;\n';
  script += '  if (a && b && a.text !== b.text) { cambia = true; break; }\n';
  script += '}\n';

  script += generateResultObject({
    property: '"' + escapeString(prop) + '"',
    numKeys: 'prop.numKeys',
    textChangesBetweenKeys: 'cambia',
    keyframes: 'keyframes',
    staticValue: 'estatico'
  });

  return script;
}

export function generateRemoveKeyframes(params: {
  compId?: number;
  compName?: string;
  layerIndex?: number;
  layerName?: string;
  property: string;
  times?: number[];
  keepValueAt?: number;
}): string {
  let script = '';
  script += generateProjectCheck();
  script += generateCompAccess(params.compId, params.compName);
  script += generateLayerAccess('comp', params.layerIndex, params.layerName);
  script += generatePropertyAccess('layer', params.property);

  script += 'var antes = prop.numKeys;\n';
  script += 'if (antes === 0) { throw new Error("Property has no keyframes: ' + escapeString(params.property) + '"); }\n';

  if (params.times && params.times.length) {
    // Remove only the named times, nearest key within half a frame.
    script += 'var objetivos = ' + JSON.stringify(params.times) + ';\n';
    script += 'var tol = 1 / (2 * comp.frameRate);\n';
    script += 'var quitados = [];\n';
    script += 'for (var t = 0; t < objetivos.length; t++) {\n';
    script += '  for (var i = prop.numKeys; i >= 1; i--) {\n';
    script += '    if (Math.abs(prop.keyTime(i) - objetivos[t]) <= tol) { quitados.push(prop.keyTime(i)); prop.removeKey(i); break; }\n';
    script += '  }\n';
    script += '}\n';
  } else {
    // Freeze the value first, then strip every key, so the property does not
    // fall back to whatever static value was under the animation.
    const at = params.keepValueAt;
    script += 'var congelado = ' + (at !== undefined ? 'prop.valueAtTime(' + at + ', false)' : 'prop.keyValue(1)') + ';\n';
    script += 'var quitados = [];\n';
    script += 'for (var i = prop.numKeys; i >= 1; i--) { quitados.push(prop.keyTime(i)); prop.removeKey(i); }\n';
    script += 'try { prop.setValue(congelado); } catch (eSV) {}\n';
  }

  script += 'var result = {};\n';
  script += 'result.property = "' + escapeString(params.property) + '";\n';
  script += 'result.keyframesAntes = antes;\n';
  script += 'result.keyframesAhora = prop.numKeys;\n';
  script += 'result.quitados = quitados;\n';
  script += 'result;\n';

  return script;
}
