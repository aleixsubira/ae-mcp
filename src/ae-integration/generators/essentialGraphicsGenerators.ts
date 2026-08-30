/**
 * Essential Graphics generators
 *
 * The Essential Graphics panel is how a composition publishes a small, curated
 * set of controls: the ones whoever fills in the content is meant to touch,
 * without opening the timeline. When that composition is then used as a layer
 * inside another one, those published controls show up on the layer as Master
 * Properties, and can be overridden per instance.
 *
 * None of this was reachable from this server before, so a template's client
 * facing panel had to be built by hand, composition by composition.
 *
 * The relevant ExtendScript API:
 *   Property.canAddToMotionGraphicsTemplate(comp) -> boolean
 *   Property.addToMotionGraphicsTemplate(comp)    -> boolean
 *   CompItem.motionGraphicsTemplateControllerCount
 *   CompItem.getMotionGraphicsTemplateControllerName(index)   // 1-based
 *   CompItem.setMotionGraphicsControllerName(index, name)
 *   AVLayer.property("Essential Properties")                  // master props
 */

import {
  escapeString,
  arrayToES3,
  generateProjectCheck,
  generateCompAccess,
  generateLayerAccess,
  generatePropertyAccess,
  generateResultObject,
  wrapInUndoGroup
} from './helpers.js';

/**
 * Publish one property to a composition's Essential Graphics panel.
 *
 * `canAddToMotionGraphicsTemplate` is checked first and its refusal is reported
 * as an error, because `addToMotionGraphicsTemplate` returning false is easy to
 * ignore and leaves the caller believing the property was published.
 */
export function generateAddToEssentialGraphics(params: {
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

  script += 'if (!prop.canAddToMotionGraphicsTemplate(comp)) {\n';
  script += '  throw new Error("This property cannot be published to Essential Graphics: ' +
            escapeString(params.property) + '");\n';
  script += '}\n';

  // ⚠️⚠️ NO SE PUEDE PONER EL NOMBRE EN LA MISMA LLAMADA QUE PUBLICA. ⚠️⚠️
  //
  // Dos caminos probados y los dos fallan, medidos el 19/08:
  //
  //   1. Publicar y renombrar por indice. DENTRO del script el control nuevo se
  //      añade AL FINAL y getMotionGraphicsTemplateControllerName sigue leyendo
  //      el orden viejo; DESPUES del script AE reordena el panel y el control
  //      salta al principio, pero setMotionGraphicsControllerName cae sobre ese
  //      orden final. Lectura y escritura no coinciden dentro de una ejecucion,
  //      asi que cualquier indice calculado aqui ya es falso cuando se usa.
  //      Renombro el control equivocado dos veces, informando exito las dos.
  //
  //   2. addToMotionGraphicsTemplateAs(comp, nombre). El metodo EXISTE, la
  //      llamada devuelve exito y el nombre SE IGNORA: se publicaron dos
  //      deslizadores como «Primero» y «Segundo» y el panel los dejo como «A» y
  //      «B», sus nombres de fabrica.
  //
  // El unico camino que funciona son TRES llamadas separadas:
  //   add_to_essential_graphics -> list_essential_graphics -> rename_...
  //
  // Por eso esta herramienta no acepta un nombre.
  script += 'var before = comp.motionGraphicsTemplateControllerCount;\n';
  script += 'var ok = prop.addToMotionGraphicsTemplate(comp);\n';
  script += 'var total = comp.motionGraphicsTemplateControllerCount;\n';
  script += 'if (!ok || total <= before) {\n';
  script += '  throw new Error("addToMotionGraphicsTemplate refused the property (already published?)");\n';
  script += '}\n';

  script += generateResultObject({
    success: 'true',
    controllerCount: 'total',
    note: '"Published without a name. Call list_essential_graphics to find it, then rename_essential_graphics_property."'
  });

  return wrapInUndoGroup(script, 'Add Property to Essential Graphics');
}

/**
 * Publish a LAYER (not a property) to a composition's Essential Graphics panel:
 * this is media replacement, the slot where whoever fills in the content drops
 * their own image or video and it takes the place of whatever was there.
 *
 * Different call from publishing a property, and the difference matters:
 *   Property.addToMotionGraphicsTemplate  publishes a value  (a slider, a point)
 *   AVLayer.addToMotionGraphicsTemplate   publishes a source (a file to swap)
 *
 * ⚠️ MEASURED 19/08: a Master Property CANNOT be republished to the parent
 * composition. Publishing a property that is itself a Master Property is
 * refused by canAddToMotionGraphicsTemplate, while an ordinary property of the
 * same layer in the same composition publishes fine (checked both ways). So a
 * control does not travel up through nested compositions: whatever the client
 * must reach has to be published from a layer living in the composition they
 * actually open.
 */
export function generateAddLayerToEssentialGraphics(params: {
  compId?: number;
  compName?: string;
  layerIndex?: number;
  layerName?: string;
}): string {
  let script = '';
  script += generateProjectCheck();
  script += generateCompAccess(params.compId, params.compName);
  script += generateLayerAccess('comp', params.layerIndex, params.layerName);

  script += 'if (typeof layer.canAddToMotionGraphicsTemplate !== "function") {\n';
  script += '  throw new Error("This After Effects build cannot publish layers to Essential Graphics (needs AVLayer.addToMotionGraphicsTemplate).");\n';
  script += '}\n';
  script += 'if (!layer.canAddToMotionGraphicsTemplate(comp)) {\n';
  script += '  throw new Error("This layer cannot be published as media replacement. A layer whose source is already a media replacement slot, or a layer type that has no swappable source, is refused.");\n';
  script += '}\n';

  // Tampoco aqui se puede nombrar en la misma llamada. Ver el comentario largo
  // en generateAddToEssentialGraphics: ni el renombrado por indice ni
  // addToMotionGraphicsTemplateAs funcionan. Publicar, listar y renombrar.
  script += 'var before = comp.motionGraphicsTemplateControllerCount;\n';
  script += 'var ok = layer.addToMotionGraphicsTemplate(comp);\n';
  script += 'var total = comp.motionGraphicsTemplateControllerCount;\n';
  script += 'if (!ok || total <= before) {\n';
  script += '  throw new Error("addToMotionGraphicsTemplate refused the layer (already published?)");\n';
  script += '}\n';

  script += generateResultObject({
    success: 'true',
    controllerCount: 'total',
    layer: 'layer.name'
  });

  return wrapInUndoGroup(script, 'Add Media Replacement to Essential Graphics');
}

/**
 * List what a composition currently publishes.
 */
export function generateListEssentialGraphics(params: {
  compId?: number;
  compName?: string;
}): string {
  let script = '';
  script += generateProjectCheck();
  script += generateCompAccess(params.compId, params.compName);

  script += 'var n = comp.motionGraphicsTemplateControllerCount;\n';
  script += 'var items = [];\n';
  script += 'for (var i = 1; i <= n; i++) {\n';
  script += '  items.push({ index: i, name: comp.getMotionGraphicsTemplateControllerName(i) });\n';
  script += '}\n';

  script += generateResultObject({
    comp: 'comp.name',
    templateName: 'comp.motionGraphicsTemplateName',
    controllerCount: 'n',
    controllers: 'items'
  });

  return script;
}

/**
 * Rename one published control. The name shown in Essential Graphics is
 * independent of the underlying property name, so a template can read well to
 * whoever fills it in without renaming effects in the timeline.
 */
export function generateRenameEssentialGraphicsProperty(params: {
  compId?: number;
  compName?: string;
  index: number;
  newName: string;
}): string {
  let script = '';
  script += generateProjectCheck();
  script += generateCompAccess(params.compId, params.compName);

  script += 'var n = comp.motionGraphicsTemplateControllerCount;\n';
  script += 'if (' + params.index + ' < 1 || ' + params.index + ' > n) {\n';
  script += '  throw new Error("index out of range: ' + params.index +
            ' (comp publishes " + n + " controls)");\n';
  script += '}\n';

  script += 'var previous = comp.getMotionGraphicsTemplateControllerName(' + params.index + ');\n';
  script += 'comp.setMotionGraphicsControllerName(' + params.index + ', "' +
            escapeString(params.newName) + '");\n';
  script += 'var landed = comp.getMotionGraphicsTemplateControllerName(' + params.index + ');\n';

  script += generateResultObject({
    success: 'true',
    index: String(params.index),
    previousName: 'previous',
    name: 'landed'
  });

  return wrapInUndoGroup(script, 'Rename Essential Graphics Property');
}

/**
 * Read the Master Properties of a precomp layer: what the source composition
 * publishes, what this instance currently shows, and whether this instance has
 * overridden it.
 *
 * `isModified` is the interesting one: it is the difference between "this
 * instance was deliberately set" and "this instance is showing the source
 * composition's value".
 */
export function generateGetMasterProperties(params: {
  compId?: number;
  compName?: string;
  layerIndex?: number;
  layerName?: string;
}): string {
  let script = '';
  script += generateProjectCheck();
  script += generateCompAccess(params.compId, params.compName);
  script += generateLayerAccess('comp', params.layerIndex, params.layerName);

  script += 'var group = layer.property("Essential Properties");\n';
  script += 'if (!group) {\n';
  script += '  throw new Error("Layer has no Master Properties. Its source composition publishes nothing to Essential Graphics.");\n';
  script += '}\n';

  // A Master Property can be a TextDocument, and a TextDocument blows up when
  // anything walks its members: reading .value succeeds and the JSON pass then
  // throws "Text document not of Box document type". So values are reduced to
  // something safe to serialize BEFORE they leave this loop, and never handed
  // over raw.
  script += 'function safeValue(prop) {\n';
  script += '  var v;\n';
  script += '  try { v = prop.value; } catch (e) { return null; }\n';
  script += '  if (v === null || v === undefined) return null;\n';
  script += '  var t = typeof v;\n';
  script += '  if (t === "number" || t === "string" || t === "boolean") return v;\n';
  script += '  if (v instanceof Array) {\n';
  script += '    var out = [];\n';
  script += '    for (var k = 0; k < v.length; k++) out.push(v[k]);\n';
  script += '    return out;\n';
  script += '  }\n';
  script += '  try { if (typeof v.text === "string") return v.text; } catch (e) {}\n';
  script += '  return "(" + t + ", not serialisable)";\n';
  script += '}\n';

  script += 'var items = [];\n';
  script += 'for (var i = 1; i <= group.numProperties; i++) {\n';
  script += '  var p = group.property(i);\n';
  script += '  var item = { index: i };\n';
  script += '  try { item.name = p.name; } catch (e) {}\n';
  script += '  try { item.matchName = p.matchName; } catch (e) {}\n';
  script += '  item.value = safeValue(p);\n';
  script += '  try { item.canSetValue = p.canSetValue; } catch (e) {}\n';
  // The source property is what "Reset" is expected to fall back to.
  script += '  try {\n';
  script += '    var src = p.essentialPropertySource;\n';
  script += '    if (src) {\n';
  script += '      try { item.sourceName = src.name; } catch (e) {}\n';
  script += '      item.sourceValue = safeValue(src);\n';
  script += '    }\n';
  script += '  } catch (e) {}\n';
  script += '  items.push(item);\n';
  script += '}\n';

  script += generateResultObject({
    layer: 'layer.name',
    source: 'layer.source ? layer.source.name : null',
    count: 'group.numProperties',
    properties: 'items'
  });

  return script;
}

/**
 * Override one Master Property on a precomp layer.
 */
export function generateSetMasterProperty(params: {
  compId?: number;
  compName?: string;
  layerIndex?: number;
  layerName?: string;
  propertyName?: string;
  propertyIndex?: number;
  value: any;
}): string {
  let script = '';
  script += generateProjectCheck();
  script += generateCompAccess(params.compId, params.compName);
  script += generateLayerAccess('comp', params.layerIndex, params.layerName);

  script += 'var group = layer.property("Essential Properties");\n';
  script += 'if (!group) {\n';
  script += '  throw new Error("Layer has no Master Properties.");\n';
  script += '}\n';

  if (params.propertyIndex) {
    script += 'var p = group.property(' + params.propertyIndex + ');\n';
  } else if (params.propertyName) {
    script += 'var p = group.property("' + escapeString(params.propertyName) + '");\n';
  } else {
    script += 'throw new Error("propertyName or propertyIndex must be provided");\n';
    return script;
  }

  script += 'if (!p) {\n';
  script += '  throw new Error("Master Property not found");\n';
  script += '}\n';

  // ⚠️ UN HUECO DE SUSTITUCION DE MEDIO NO SE ESCRIBE CON setValue.
  //
  // «ADBE Layer Source Alternate» es propertyValueType NO_VALUE, asi que setValue
  // lanza «Can not get or set a value from this property» y da igual el valor que
  // se le pase: ni el nombre del item ni su id. La via buena es setAlternateSource,
  // que recibe el ITEM del proyecto, no un numero.
  //
  // Medido el 28/08/2026 contra `T01_Orbita`: la reflexion de la propiedad
  // devuelve el metodo setAlternateSource y las propiedades alternateSource y
  // canSetAlternateSource, o sea que el API existia y lo que faltaba era usarlo.
  // Sin esto, una transicion compartida por varias juntas enseña las MISMAS dos
  // piezas en todas, que es justo lo que hace inservible una transicion reutilizable.
  //
  // Aqui el valor que llega es el NOMBRE del item del proyecto.
  const value = Array.isArray(params.value) ? arrayToES3(params.value) : String(params.value);

  script += 'if (p.matchName === "ADBE Layer Source Alternate") {\n';
  script += '  var wanted = "' + escapeString(String(params.value)) + '";\n';
  script += '  var found = null;\n';
  script += '  for (var i = 1; i <= app.project.numItems; i++) {\n';
  script += '    if (app.project.item(i).name === wanted) { found = app.project.item(i); break; }\n';
  script += '  }\n';
  script += '  if (!found) {\n';
  script += '    throw new Error("No hay ningun item del proyecto que se llame " + wanted);\n';
  script += '  }\n';
  // canSetAlternateSource sale por reflexion como propiedad, pero en el API es un
  // metodo que recibe el item. Se prueba, y si no lo es no se bloquea por ello.
  script += '  var admite = true;\n';
  script += '  try {\n';
  script += '    if (typeof p.canSetAlternateSource === "function") { admite = p.canSetAlternateSource(found); }\n';
  script += '  } catch (e) { admite = true; }\n';
  script += '  if (!admite) {\n';
  script += '    throw new Error("AE no acepta " + wanted + " como sustituto de este hueco");\n';
  script += '  }\n';
  script += '  p.setAlternateSource(found);\n';
  script += '} else {\n';
  script += '  p.setValue(' + value + ');\n';
  script += '}\n';

  // p.value tambien revienta en una NO_VALUE, asi que el resultado se lee segun el
  // tipo de propiedad. Devolver el nombre del sustituto deja verificar el cambio
  // sin una segunda llamada.
  script += 'var leido = null;\n';
  script += 'if (p.matchName === "ADBE Layer Source Alternate") {\n';
  script += '  leido = p.alternateSource ? p.alternateSource.name : null;\n';
  script += '} else {\n';
  script += '  leido = p.value;\n';
  script += '}\n';

  script += generateResultObject({
    success: 'true',
    name: 'p.name',
    value: 'leido'
  });

  return wrapInUndoGroup(script, 'Set Master Property');
}

/**
 * Ask After Effects what it actually exposes.
 *
 * ExtendScript objects carry a `reflect` member listing their real methods and
 * properties, which is the only reliable way to answer "does this API exist?"
 * without guessing from documentation that may be out of date or incomplete.
 *
 * Added on 19/08 to settle whether Essential Graphics groups and comments (the
 * "Add Formatting" menu in the panel) can be created by script at all.
 */
export function generateInspectApi(params: {
  compId?: number;
  compName?: string;
  layerIndex?: number;
  layerName?: string;
  target: string;
  property?: string;
  filter?: string;
}): string {
  let script = '';
  script += generateProjectCheck();

  if (params.target === 'comp' || params.target === 'layer' || params.target === 'property') {
    script += generateCompAccess(params.compId, params.compName);
  }
  if (params.target === 'layer' || params.target === 'property') {
    script += generateLayerAccess('comp', params.layerIndex, params.layerName);
  }
  if (params.target === 'property') {
    if (!params.property) {
      return script + 'throw new Error("property must be provided when target is \'property\'");\n';
    }
    script += generatePropertyAccess('layer', params.property);
  }

  const targets: Record<string, string> = {
    app: 'app',
    project: 'app.project',
    comp: 'comp',
    layer: 'layer',
    property: 'prop'
  };
  const expr = targets[params.target] || 'app';

  script += 'var target = ' + expr + ';\n';
  script += 'var r = target.reflect;\n';
  script += 'var methods = [], props = [];\n';
  script += 'try {\n';
  script += '  var m = r.methods;\n';
  script += '  for (var i = 0; i < m.length; i++) methods.push(String(m[i].name));\n';
  script += '} catch (e) {}\n';
  script += 'try {\n';
  script += '  var p = r.properties;\n';
  script += '  for (var j = 0; j < p.length; j++) props.push(String(p[j].name));\n';
  script += '} catch (e) {}\n';

  if (params.filter) {
    script += 'var needle = "' + escapeString(params.filter.toLowerCase()) + '";\n';
    script += 'function keep(list) {\n';
    script += '  var out = [];\n';
    script += '  for (var k = 0; k < list.length; k++) {\n';
    script += '    if (String(list[k]).toLowerCase().indexOf(needle) !== -1) out.push(list[k]);\n';
    script += '  }\n';
    script += '  return out;\n';
    script += '}\n';
    script += 'methods = keep(methods);\n';
    script += 'props = keep(props);\n';
  }

  // For a property, the names alone do not answer "can I write this?", so the
  // values of anything range-shaped are read too.
  script += 'var values = {};\n';
  script += 'var probe = ["minValue","maxValue","hasMin","hasMax","value","name","matchName","propertyValueType","canSetValue","isModified"];\n';
  script += 'for (var q = 0; q < probe.length; q++) {\n';
  script += '  try {\n';
  script += '    var v = target[probe[q]];\n';
  script += '    if (v !== undefined && typeof v !== "object" && typeof v !== "function") values[probe[q]] = v;\n';
  script += '  } catch (e) {}\n';
  script += '}\n';

  script += generateResultObject({
    target: '"' + escapeString(params.target) + '"',
    methods: 'methods',
    properties: 'props',
    values: 'values'
  });

  return script;
}
