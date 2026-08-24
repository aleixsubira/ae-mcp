/**
 * Layer-related Script Generators
 *
 * Generates ES3-compatible ExtendScript for layer operations.
 */

import {
  escapeString,
  generateProjectCheck,
  generateCompAccess,
  generateLayerAccess,
  colorToES3,
  positionToES3,
  arrayToES3,
  wrapInUndoGroup,
  generateResultObject,
  generateJustification,
  generateBlendMode,
  generateLightType,
  generateCameraType
} from './helpers.js';

/**
 * Generate script to add a solid layer
 */
export function generateAddSolidLayer(params: {
  compId?: number;
  compName?: string;
  name: string;
  color: { r: number; g: number; b: number };
  width?: number;
  height?: number;
  duration?: number;
  startTime?: number;
}): string {
  let script = '';
  script += generateProjectCheck();
  script += generateCompAccess(params.compId, params.compName);

  const width = params.width || 'comp.width';
  const height = params.height || 'comp.height';

  script += 'var solidWidth = ' + width + ';\n';
  script += 'var solidHeight = ' + height + ';\n';
  script += 'var layer = comp.layers.addSolid(\n';
  script += '  ' + colorToES3(params.color) + ',\n';
  script += '  "' + escapeString(params.name) + '",\n';
  script += '  solidWidth,\n';
  script += '  solidHeight,\n';
  script += '  1\n'; // pixel aspect ratio
  script += ');\n';

  if (params.duration !== undefined) {
    script += 'layer.outPoint = layer.inPoint + ' + params.duration + ';\n';
  }
  if (params.startTime !== undefined) {
    script += 'layer.startTime = ' + params.startTime + ';\n';
  }

  script += generateResultObject({
    index: 'layer.index',
    name: 'layer.name',
    inPoint: 'layer.inPoint',
    outPoint: 'layer.outPoint'
  });

  return wrapInUndoGroup(script, 'Add Solid Layer');
}

/**
 * Generate script to add a text layer
 */
export function generateAddTextLayer(params: {
  compId?: number;
  compName?: string;
  text: string;
  name?: string;
  position?: { x: number; y: number };
  fontSize?: number;
  fontFamily?: string;
  color?: { r: number; g: number; b: number };
  justification?: string;
}): string {
  let script = '';
  script += generateProjectCheck();
  script += generateCompAccess(params.compId, params.compName);

  script += 'var layer = comp.layers.addText("' + escapeString(params.text) + '");\n';

  if (params.name) {
    script += 'layer.name = "' + escapeString(params.name) + '";\n';
  }

  // Get text document for styling
  script += 'var textProp = layer.property("Source Text");\n';
  script += 'var textDoc = textProp.value;\n';

  if (params.fontSize) {
    script += 'textDoc.fontSize = ' + params.fontSize + ';\n';
  }
  if (params.fontFamily) {
    script += 'textDoc.font = "' + escapeString(params.fontFamily) + '";\n';
  }
  if (params.color) {
    script += 'textDoc.fillColor = ' + colorToES3(params.color) + ';\n';
  }
  if (params.justification) {
    script += 'textDoc.justification = ' + generateJustification(params.justification) + ';\n';
  }

  script += 'textProp.setValue(textDoc);\n';

  if (params.position) {
    script += 'layer.property("Position").setValue(' + positionToES3(params.position) + ');\n';
  }

  script += generateResultObject({
    index: 'layer.index',
    name: 'layer.name',
    text: '"' + escapeString(params.text) + '"'
  });

  return wrapInUndoGroup(script, 'Add Text Layer');
}

/**
 * Generate script to add an advanced text layer with more options
 */
export function generateAddTextLayerAdvanced(params: {
  compId?: number;
  compName?: string;
  text: string;
  name?: string;
  position?: { x: number; y: number };
  fontSize?: number;
  fontFamily?: string;
  color?: { r: number; g: number; b: number };
  justification?: string;
  tracking?: number;
  leading?: number;
  baselineShift?: number;
  strokeColor?: { r: number; g: number; b: number };
  strokeWidth?: number;
  strokeOverFill?: boolean;
}): string {
  let script = '';
  script += generateProjectCheck();
  script += generateCompAccess(params.compId, params.compName);

  script += 'var layer = comp.layers.addText("' + escapeString(params.text) + '");\n';

  if (params.name) {
    script += 'layer.name = "' + escapeString(params.name) + '";\n';
  }

  script += 'var textProp = layer.property("Source Text");\n';
  script += 'var textDoc = textProp.value;\n';

  if (params.fontSize) {
    script += 'textDoc.fontSize = ' + params.fontSize + ';\n';
  }
  if (params.fontFamily) {
    script += 'textDoc.font = "' + escapeString(params.fontFamily) + '";\n';
  }
  if (params.color) {
    script += 'textDoc.fillColor = ' + colorToES3(params.color) + ';\n';
  }
  if (params.justification) {
    script += 'textDoc.justification = ' + generateJustification(params.justification) + ';\n';
  }
  if (params.tracking !== undefined) {
    script += 'textDoc.tracking = ' + params.tracking + ';\n';
  }
  if (params.leading !== undefined) {
    script += 'textDoc.leading = ' + params.leading + ';\n';
  }
  if (params.baselineShift !== undefined) {
    script += 'textDoc.baselineShift = ' + params.baselineShift + ';\n';
  }
  if (params.strokeColor) {
    script += 'textDoc.applyStroke = true;\n';
    script += 'textDoc.strokeColor = ' + colorToES3(params.strokeColor) + ';\n';
  }
  if (params.strokeWidth !== undefined) {
    script += 'textDoc.strokeWidth = ' + params.strokeWidth + ';\n';
  }
  if (params.strokeOverFill !== undefined) {
    script += 'textDoc.strokeOverFill = ' + params.strokeOverFill + ';\n';
  }

  script += 'textProp.setValue(textDoc);\n';

  if (params.position) {
    script += 'layer.property("Position").setValue(' + positionToES3(params.position) + ');\n';
  }

  script += generateResultObject({
    index: 'layer.index',
    name: 'layer.name',
    text: '"' + escapeString(params.text) + '"'
  });

  return wrapInUndoGroup(script, 'Add Text Layer');
}

/**
 * Generate script to add a shape layer
 */
export function generateAddShapeLayer(params: {
  compId?: number;
  compName?: string;
  name?: string;
  shape?: string;
  size?: { width: number; height: number };
  position?: { x: number; y: number };
  fillColor?: { r: number; g: number; b: number };
  strokeColor?: { r: number; g: number; b: number };
  strokeWidth?: number;
  points?: number;
  innerRadius?: number;
  outerRadius?: number;
}): string {
  let script = '';
  script += generateProjectCheck();
  script += generateCompAccess(params.compId, params.compName);

  script += 'var layer = comp.layers.addShape();\n';

  if (params.name) {
    script += 'layer.name = "' + escapeString(params.name) + '";\n';
  }

  // Add shape content
  script += 'var contents = layer.property("Contents");\n';
  script += 'var shapeGroup = contents.addProperty("ADBE Vector Group");\n';
  script += 'var shapeContents = shapeGroup.property("Contents");\n';

  const shape = params.shape || 'rectangle';
  const sizeW = params.size?.width || 200;
  const sizeH = params.size?.height || 200;

  if (shape === 'rectangle') {
    script += 'var rect = shapeContents.addProperty("ADBE Vector Shape - Rect");\n';
    script += 'rect.property("Size").setValue([' + sizeW + ', ' + sizeH + ']);\n';
  } else if (shape === 'ellipse') {
    script += 'var ellipse = shapeContents.addProperty("ADBE Vector Shape - Ellipse");\n';
    script += 'ellipse.property("Size").setValue([' + sizeW + ', ' + sizeH + ']);\n';
  } else if (shape === 'polygon') {
    script += 'var poly = shapeContents.addProperty("ADBE Vector Shape - Star");\n';
    script += 'poly.property("Type").setValue(1);\n'; // polygon
    script += 'poly.property("Points").setValue(' + (params.points || 6) + ');\n';
    script += 'poly.property("Outer Radius").setValue(' + (params.outerRadius || 100) + ');\n';
  } else if (shape === 'star') {
    script += 'var star = shapeContents.addProperty("ADBE Vector Shape - Star");\n';
    script += 'star.property("Type").setValue(2);\n'; // star
    script += 'star.property("Points").setValue(' + (params.points || 5) + ');\n';
    script += 'star.property("Outer Radius").setValue(' + (params.outerRadius || 100) + ');\n';
    script += 'star.property("Inner Radius").setValue(' + (params.innerRadius || 50) + ');\n';
  }

  // Add fill
  if (params.fillColor) {
    script += 'var fill = shapeContents.addProperty("ADBE Vector Graphic - Fill");\n';
    script += 'fill.property("Color").setValue(' + colorToES3(params.fillColor) + ');\n';
  }

  // Add stroke
  if (params.strokeColor) {
    script += 'var stroke = shapeContents.addProperty("ADBE Vector Graphic - Stroke");\n';
    script += 'stroke.property("Color").setValue(' + colorToES3(params.strokeColor) + ');\n';
    if (params.strokeWidth !== undefined) {
      script += 'stroke.property("Stroke Width").setValue(' + params.strokeWidth + ');\n';
    }
  }

  // Position
  if (params.position) {
    script += 'layer.property("Position").setValue(' + positionToES3(params.position) + ');\n';
  } else {
    // Center in comp
    script += 'layer.property("Position").setValue([comp.width/2, comp.height/2]);\n';
  }

  script += generateResultObject({
    index: 'layer.index',
    name: 'layer.name'
  });

  return wrapInUndoGroup(script, 'Add Shape Layer');
}

/**
 * Generate script to add a null layer
 */
export function generateAddNullLayer(params: {
  compId?: number;
  compName?: string;
  name?: string;
}): string {
  let script = '';
  script += generateProjectCheck();
  script += generateCompAccess(params.compId, params.compName);

  script += 'var layer = comp.layers.addNull();\n';

  if (params.name) {
    script += 'layer.name = "' + escapeString(params.name) + '";\n';
  }

  script += generateResultObject({
    index: 'layer.index',
    name: 'layer.name'
  });

  return wrapInUndoGroup(script, 'Add Null Layer');
}

/**
 * Generate script to add an adjustment layer
 */
export function generateAddAdjustmentLayer(params: {
  compId?: number;
  compName?: string;
  name?: string;
}): string {
  let script = '';
  script += generateProjectCheck();
  script += generateCompAccess(params.compId, params.compName);

  // Create solid and set as adjustment layer
  script += 'var layer = comp.layers.addSolid(\n';
  script += '  [1, 1, 1],\n';
  script += '  "' + escapeString(params.name || 'Adjustment Layer') + '",\n';
  script += '  comp.width,\n';
  script += '  comp.height,\n';
  script += '  1\n';
  script += ');\n';
  script += 'layer.adjustmentLayer = true;\n';

  script += generateResultObject({
    index: 'layer.index',
    name: 'layer.name'
  });

  return wrapInUndoGroup(script, 'Add Adjustment Layer');
}

/**
 * Generate script to add a camera layer
 */
export function generateAddCameraLayer(params: {
  compId?: number;
  compName?: string;
  name?: string;
  type?: string;
  zoom?: number;
}): string {
  let script = '';
  script += generateProjectCheck();
  script += generateCompAccess(params.compId, params.compName);

  const cameraType = params.type || 'ONE_NODE';
  script += 'var layer = comp.layers.addCamera(\n';
  script += '  "' + escapeString(params.name || 'Camera') + '",\n';
  script += '  [comp.width/2, comp.height/2]\n';
  script += ');\n';

  // Set camera type
  if (cameraType === 'TWO_NODE') {
    script += 'layer.autoOrient = AutoOrientType.ALONG_PATH;\n';
  }

  if (params.zoom) {
    script += 'layer.property("Camera Options").property("Zoom").setValue(' + params.zoom + ');\n';
  }

  script += generateResultObject({
    index: 'layer.index',
    name: 'layer.name'
  });

  return wrapInUndoGroup(script, 'Add Camera Layer');
}

/**
 * Generate script to add a light layer
 */
export function generateAddLightLayer(params: {
  compId?: number;
  compName?: string;
  name?: string;
  type?: string;
  color?: { r: number; g: number; b: number };
  intensity?: number;
}): string {
  let script = '';
  script += generateProjectCheck();
  script += generateCompAccess(params.compId, params.compName);

  const lightType = params.type || 'POINT';
  script += 'var layer = comp.layers.addLight(\n';
  script += '  "' + escapeString(params.name || 'Light') + '",\n';
  script += '  [comp.width/2, comp.height/2]\n';
  script += ');\n';

  script += 'layer.lightType = ' + generateLightType(lightType) + ';\n';

  if (params.color) {
    script += 'layer.property("Light Options").property("Color").setValue(' + colorToES3(params.color) + ');\n';
  }
  if (params.intensity !== undefined) {
    script += 'layer.property("Light Options").property("Intensity").setValue(' + params.intensity + ');\n';
  }

  script += generateResultObject({
    index: 'layer.index',
    name: 'layer.name'
  });

  return wrapInUndoGroup(script, 'Add Light Layer');
}

/**
 * Generate script to add an AV (audio/video) layer from project item
 */
export function generateAddAVLayer(params: {
  compId?: number;
  compName?: string;
  itemId?: number;
  itemName?: string;
  startTime?: number;
}): string {
  let script = '';
  script += generateProjectCheck();
  script += generateCompAccess(params.compId, params.compName);

  // Find the source item
  if (params.itemId) {
    script += 'var sourceItem = app.project.itemByID(' + params.itemId + ');\n';
    script += 'if (!sourceItem) {\n';
    script += '  throw new Error("Item not found with ID: ' + params.itemId + '");\n';
    script += '}\n';
  } else if (params.itemName) {
    script += 'var sourceItem = null;\n';
    script += 'for (var i = 1; i <= app.project.numItems; i++) {\n';
    script += '  if (app.project.item(i).name === "' + escapeString(params.itemName) + '") {\n';
    script += '    sourceItem = app.project.item(i);\n';
    script += '    break;\n';
    script += '  }\n';
    script += '}\n';
    script += 'if (!sourceItem) {\n';
    script += '  throw new Error("Item not found: ' + escapeString(params.itemName) + '");\n';
    script += '}\n';
  } else {
    script += 'throw new Error("itemId or itemName must be provided");\n';
  }

  script += 'var layer = comp.layers.add(sourceItem);\n';

  if (params.startTime !== undefined) {
    script += 'layer.startTime = ' + params.startTime + ';\n';
  }

  script += generateResultObject({
    index: 'layer.index',
    name: 'layer.name',
    source: 'sourceItem.name'
  });

  return wrapInUndoGroup(script, 'Add AV Layer');
}

/**
 * Generate script to precompose layers
 */
export function generatePrecomposeLayers(params: {
  compId?: number;
  compName?: string;
  layerIndices: number[];
  name: string;
  moveAttributes?: boolean;
}): string {
  let script = '';
  script += generateProjectCheck();
  script += generateCompAccess(params.compId, params.compName);

  script += 'var layerIndices = ' + arrayToES3(params.layerIndices) + ';\n';
  script += 'var precompName = "' + escapeString(params.name) + '";\n';
  script += 'var moveAttributes = ' + (params.moveAttributes !== false) + ';\n';

  // Precompose
  // OJO: precompose() devuelve el CompItem NUEVO, no la capa. Leer .index sobre
  // ese resultado daba "TypeError: undefined is not an object" y hacia parecer
  // que la precomposicion fallaba, cuando en realidad si se hacia.
  script += 'var precompItem = comp.layers.precompose(layerIndices, precompName, moveAttributes);\n';
  // La capa nueva ocupa el sitio de la mas alta de las precompuestas.
  script += 'var minIdx = layerIndices[0];\n';
  script += 'for (var pi = 1; pi < layerIndices.length; pi++) { if (layerIndices[pi] < minIdx) minIdx = layerIndices[pi]; }\n';
  script += 'var precompLayer = comp.layer(minIdx);\n';

  script += generateResultObject({
    index: 'precompLayer.index',
    name: 'precompLayer.name',
    sourceCompId: 'precompItem.id'
  });

  return wrapInUndoGroup(script, 'Precompose Layers');
}

/**
 * Generate script to modify layer properties
 */
export function generateModifyLayer(params: {
  compId?: number;
  compName?: string;
  layerIndex?: number;
  layerName?: string;
  name?: string;
  enabled?: boolean;
  solo?: boolean;
  shy?: boolean;
  guideLayer?: boolean;
  locked?: boolean;
  inPoint?: number;
  outPoint?: number;
  startTime?: number;
  stretch?: number;
  blendMode?: string;
  parent?: number;
  is3D?: boolean;
  position?: { x: number; y: number; z?: number };
  anchorPoint?: number[];
  label?: number;
  scale?: number[];
  rotation?: number;
  opacity?: number;
}): string {
  let script = '';
  script += generateProjectCheck();
  script += generateCompAccess(params.compId, params.compName);
  script += generateLayerAccess('comp', params.layerIndex, params.layerName);

  if (params.name !== undefined) {
    script += 'layer.name = "' + escapeString(params.name) + '";\n';
  }
  if (params.enabled !== undefined) {
    script += 'layer.enabled = ' + params.enabled + ';\n';
  }
  if (params.solo !== undefined) {
    script += 'layer.solo = ' + params.solo + ';\n';
  }
  // A guide layer shows in the viewer and is EXCLUDED from the render: the
  // Render Settings default is "Guide Layers: All Off", and aerender prints it.
  // It is the right home for anything that must be seen while working and must
  // never reach the delivered file, such as an overflow warning.
  if (params.guideLayer !== undefined) {
    script += 'layer.guideLayer = ' + params.guideLayer + ';\n';
  }
  if (params.shy !== undefined) {
    script += 'layer.shy = ' + params.shy + ';\n';
  }
  if (params.locked !== undefined) {
    script += 'layer.locked = ' + params.locked + ';\n';
  }
  if (params.inPoint !== undefined) {
    script += 'layer.inPoint = ' + params.inPoint + ';\n';
  }
  if (params.outPoint !== undefined) {
    script += 'layer.outPoint = ' + params.outPoint + ';\n';
  }
  if (params.startTime !== undefined) {
    script += 'layer.startTime = ' + params.startTime + ';\n';
  }
  if (params.stretch !== undefined) {
    script += 'layer.stretch = ' + params.stretch + ';\n';
  }
  if (params.blendMode !== undefined) {
    script += 'layer.blendingMode = ' + generateBlendMode(params.blendMode) + ';\n';
  }
  if (params.parent !== undefined) {
    if (params.parent === 0) {
      script += 'layer.parent = null;\n';
    } else {
      script += 'layer.parent = comp.layer(' + params.parent + ');\n';
    }
  }
  if (params.is3D !== undefined) {
    script += 'layer.threeDLayer = ' + params.is3D + ';\n';
  }
  if (params.position) {
    script += 'layer.property("Position").setValue(' + positionToES3(params.position) + ');\n';
  }
  // The label is the colour swatch next to the layer name. 0 is «none», 1 to 16
  // are After Effects' own palette. Colour-coding by role is the cheapest way to
  // read a long timeline, so it belongs here.
  if (params.label !== undefined) {
    script += 'layer.label = ' + Math.max(0, Math.min(16, Math.round(params.label))) + ';\n';
  }

  // Anchor Point was missing entirely: the tool accepted the argument and threw
  // it away, reporting success. Moving the anchor also moves everything parented
  // to the layer, so the result echoes the value back for the caller to check.
  if (params.anchorPoint) {
    script += 'layer.property("Anchor Point").setValue(' + arrayToES3(params.anchorPoint) + ');\n';
  }
  if (params.scale) {
    script += 'layer.property("Scale").setValue(' + arrayToES3(params.scale) + ');\n';
  }
  if (params.rotation !== undefined) {
    script += 'layer.property("Rotation").setValue(' + params.rotation + ');\n';
  }
  if (params.opacity !== undefined) {
    script += 'layer.property("Opacity").setValue(' + params.opacity + ');\n';
  }

  script += generateResultObject({
    index: 'layer.index',
    name: 'layer.name',
    anchorPoint: 'layer.property("Anchor Point").value',
    position: 'layer.property("Position").value'
  });

  return wrapInUndoGroup(script, 'Modify Layer');
}

/**
 * Point a layer at a different source, keeping the layer itself: its effects,
 * expressions, keyframes, parenting, track matte and in/out points all survive.
 *
 * Different from replace_footage, and the difference matters: replace_footage
 * swaps the FILE behind a footage item, so every layer using that item changes
 * at once. This swaps the SOURCE of one layer, leaving every other user of the
 * old source alone.
 *
 * `fixExpressions` defaults to false. After Effects will rewrite expression text
 * when asked to fix it, and rewriting is exactly what you do not want on a
 * template whose expressions are the specification.
 */
export function generateReplaceLayerSource(params: {
  compId?: number;
  compName?: string;
  layerIndex?: number;
  layerName?: string;
  sourceItemId?: number;
  sourceItemName?: string;
  fixExpressions?: boolean;
}): string {
  let script = '';
  script += generateProjectCheck();
  script += generateCompAccess(params.compId, params.compName);
  script += generateLayerAccess('comp', params.layerIndex, params.layerName);

  if (params.sourceItemId) {
    script += 'var src = app.project.itemByID(' + params.sourceItemId + ');\n';
  } else if (params.sourceItemName) {
    script += 'var src = null;\n';
    script += 'for (var i = 1; i <= app.project.numItems; i++) {\n';
    script += '  if (app.project.item(i).name === "' + escapeString(params.sourceItemName) + '") {\n';
    script += '    src = app.project.item(i);\n';
    script += '    break;\n';
    script += '  }\n';
    script += '}\n';
  } else {
    script += 'throw new Error("sourceItemId or sourceItemName must be provided");\n';
    return script;
  }

  script += 'if (!src) {\n';
  script += '  throw new Error("Source item not found");\n';
  script += '}\n';
  script += 'if (typeof layer.replaceSource !== "function") {\n';
  script += '  throw new Error("This layer has no replaceable source (it is not an AV layer).");\n';
  script += '}\n';

  script += 'var previous = layer.source ? layer.source.name : null;\n';
  script += 'layer.replaceSource(src, ' + (params.fixExpressions ? 'true' : 'false') + ');\n';

  script += generateResultObject({
    success: 'true',
    layer: 'layer.name',
    previousSource: 'previous',
    source: 'layer.source ? layer.source.name : null'
  });

  return wrapInUndoGroup(script, 'Replace Layer Source');
}

/**
 * Generate script to delete a layer
 */
export function generateDeleteLayer(params: {
  compId?: number;
  compName?: string;
  layerIndex?: number;
  layerName?: string;
}): string {
  let script = '';
  script += generateProjectCheck();
  script += generateCompAccess(params.compId, params.compName);
  script += generateLayerAccess('comp', params.layerIndex, params.layerName);

  script += 'var deletedName = layer.name;\n';
  script += 'layer.remove();\n';

  script += generateResultObject({
    success: 'true',
    deleted: 'deletedName'
  });

  return wrapInUndoGroup(script, 'Delete Layer');
}

/**
 * Generate script to list all layers in a composition
 */
export function generateListLayers(params: {
  compId?: number;
  compName?: string;
}): string {
  let script = '';
  script += generateProjectCheck();
  script += generateCompAccess(params.compId, params.compName);

  script += 'var layers = [];\n';
  script += 'for (var i = 1; i <= comp.numLayers; i++) {\n';
  script += '  var layer = comp.layer(i);\n';
  script += '  var layerType = "unknown";\n';
  script += '  if (layer instanceof CameraLayer) layerType = "camera";\n';
  script += '  else if (layer instanceof LightLayer) layerType = "light";\n';
  script += '  else if (layer instanceof TextLayer) layerType = "text";\n';
  script += '  else if (layer instanceof ShapeLayer) layerType = "shape";\n';
  script += '  else if (layer.adjustmentLayer) layerType = "adjustment";\n';
  script += '  else if (layer.nullLayer) layerType = "null";\n';
  script += '  else if (layer.source instanceof CompItem) layerType = "precomp";\n';
  script += '  else if (layer.source) layerType = "av";\n';
  script += '  else layerType = "solid";\n';
  script += '  layers.push({\n';
  script += '    index: layer.index,\n';
  script += '    name: layer.name,\n';
  script += '    type: layerType,\n';
  script += '    enabled: layer.enabled,\n';
  script += '    solo: layer.solo,\n';
  script += '    shy: layer.shy,\n';
  script += '    locked: layer.locked,\n';
  script += '    inPoint: layer.inPoint,\n';
  script += '    outPoint: layer.outPoint,\n';
  script += '    startTime: layer.startTime,\n';
  script += '    is3D: layer.threeDLayer,\n';
  script += '    parent: layer.parent ? layer.parent.index : null\n';
  script += '  });\n';
  script += '}\n';
  script += 'layers;\n';

  return script;
}

/**
 * Generate script to get layer info
 */
export function generateGetLayerInfo(params: {
  compId?: number;
  compName?: string;
  layerIndex?: number;
  layerName?: string;
}): string {
  let script = '';
  script += generateProjectCheck();
  script += generateCompAccess(params.compId, params.compName);
  script += generateLayerAccess('comp', params.layerIndex, params.layerName);

  script += 'var layerType = "unknown";\n';
  script += 'if (layer instanceof CameraLayer) layerType = "camera";\n';
  script += 'else if (layer instanceof LightLayer) layerType = "light";\n';
  script += 'else if (layer instanceof TextLayer) layerType = "text";\n';
  script += 'else if (layer instanceof ShapeLayer) layerType = "shape";\n';
  script += 'else if (layer.adjustmentLayer) layerType = "adjustment";\n';
  script += 'else if (layer.nullLayer) layerType = "null";\n';
  script += 'else if (layer.source instanceof CompItem) layerType = "precomp";\n';
  script += 'else if (layer.source) layerType = "av";\n';
  script += 'else layerType = "solid";\n';

  script += 'var info = {\n';
  script += '  index: layer.index,\n';
  script += '  name: layer.name,\n';
  script += '  type: layerType,\n';
  script += '  enabled: layer.enabled,\n';
  script += '  solo: layer.solo,\n';
  script += '  shy: layer.shy,\n';
  script += '  locked: layer.locked,\n';
  script += '  inPoint: layer.inPoint,\n';
  script += '  outPoint: layer.outPoint,\n';
  script += '  startTime: layer.startTime,\n';
  script += '  stretch: layer.stretch,\n';
  script += '  is3D: layer.threeDLayer,\n';
  script += '  parent: layer.parent ? layer.parent.index : null,\n';
  script += '  hasVideo: layer.hasVideo,\n';
  script += '  hasAudio: layer.hasAudio,\n';
  script += '  source: layer.source ? layer.source.name : null\n';
  script += '};\n';

  // Get transform values if available
  script += 'if (layer.property("Transform")) {\n';
  script += '  info.position = layer.property("Position").value;\n';
  script += '  info.scale = layer.property("Scale").value;\n';
  script += '  info.rotation = layer.property("Rotation") ? layer.property("Rotation").value : 0;\n';
  script += '  info.opacity = layer.property("Opacity").value;\n';
  script += '  info.anchorPoint = layer.property("Anchor Point").value;\n';
  script += '}\n';

  script += 'info;\n';

  return script;
}

/**
 * Generate script to move a layer within the stacking order.
 *
 * AE has always been able to do this from script — `moveToBeginning()`,
 * `moveToEnd()`, `moveBefore(other)` and `moveAfter(other)` are plain Layer
 * methods. The MCP just never exposed them, which forced a manual drag every
 * time a layer had to go under the ones already in the comp (new layers always
 * enter at the top).
 *
 * Note the vocabulary: in AE, index 1 is the TOP of the stack, so "beginning"
 * means front-most and "end" means back-most.
 */
export function generateReorderLayer(params: {
  compId?: number;
  compName?: string;
  layerIndex?: number;
  layerName?: string;
  to: 'top' | 'bottom' | 'before' | 'after';
  refLayerIndex?: number;
  refLayerName?: string;
}): string {
  let script = '';
  script += generateProjectCheck();
  script += generateCompAccess(params.compId, params.compName);
  script += generateLayerAccess('comp', params.layerIndex, params.layerName);

  script += 'var movedName = layer.name;\n';
  script += 'var fromIndex = layer.index;\n';

  if (params.to === 'top') {
    script += 'layer.moveToBeginning();\n';
  } else if (params.to === 'bottom') {
    script += 'layer.moveToEnd();\n';
  } else {
    if (params.refLayerIndex === undefined && params.refLayerName === undefined) {
      script += 'throw new Error("to:\'' + params.to + '\' needs refLayerIndex or refLayerName");\n';
    }
    if (params.refLayerName !== undefined) {
      script += 'var ref = null;\n';
      script += 'for (var ri = 1; ri <= comp.numLayers; ri++) {\n';
      script += '  if (comp.layer(ri).name === "' + escapeString(params.refLayerName) + '") { ref = comp.layer(ri); break; }\n';
      script += '}\n';
      script += 'if (!ref) { throw new Error("Reference layer not found: ' + escapeString(params.refLayerName) + '"); }\n';
    } else {
      script += 'var ref = comp.layer(' + params.refLayerIndex + ');\n';
    }
    script += params.to === 'before' ? 'layer.moveBefore(ref);\n' : 'layer.moveAfter(ref);\n';
  }

  script += generateResultObject({
    success: 'true',
    name: 'movedName',
    fromIndex: 'fromIndex',
    toIndex: 'layer.index'
  });

  return wrapInUndoGroup(script, 'Reorder Layer');
}
