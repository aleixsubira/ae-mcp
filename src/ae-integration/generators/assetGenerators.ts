/**
 * Asset Management Script Generators
 *
 * Generates ES3-compatible ExtendScript for asset management operations.
 */

import {
  escapeString,
  generateProjectCheck,
  generateCompAccess,
  wrapInUndoGroup,
  generateResultObject
} from './helpers.js';

/**
 * Generate script to import a folder of footage
 */
export function generateImportFolder(params: {
  path: string;
  recursive?: boolean;
}): string {
  let script = '';
  script += generateProjectCheck();

  script += 'var folder = new Folder("' + escapeString(params.path) + '");\n';
  script += 'if (!folder.exists) {\n';
  script += '  throw new Error("Folder not found: ' + escapeString(params.path) + '");\n';
  script += '}\n';

  script += 'var importedItems = [];\n';

  script += 'function importFilesFromFolder(f, parentFolder) {\n';
  script += '  var files = f.getFiles();\n';
  script += '  for (var i = 0; i < files.length; i++) {\n';
  script += '    var file = files[i];\n';
  script += '    if (file instanceof Folder) {\n';

  if (params.recursive) {
    script += '      var subFolder = app.project.items.addFolder(file.name);\n';
    script += '      if (parentFolder) subFolder.parentFolder = parentFolder;\n';
    script += '      importFilesFromFolder(file, subFolder);\n';
  }

  script += '    } else if (file instanceof File) {\n';
  script += '      try {\n';
  script += '        var importOptions = new ImportOptions(file);\n';
  script += '        var imported = app.project.importFile(importOptions);\n';
  script += '        if (parentFolder) imported.parentFolder = parentFolder;\n';
  script += '        importedItems.push({ id: imported.id, name: imported.name });\n';
  script += '      } catch (e) {\n';
  script += '        // Skip unsupported files\n';
  script += '      }\n';
  script += '    }\n';
  script += '  }\n';
  script += '}\n';

  script += 'var rootFolder = app.project.items.addFolder(folder.name);\n';
  script += 'importFilesFromFolder(folder, rootFolder);\n';

  script += '{\n';
  script += '  folderId: rootFolder.id,\n';
  script += '  folderName: rootFolder.name,\n';
  script += '  importedCount: importedItems.length,\n';
  script += '  items: importedItems\n';
  script += '};\n';

  return wrapInUndoGroup(script, 'Import Folder');
}

/**
 * Generate script to replace footage
 */
export function generateReplaceFootage(params: {
  itemId?: number;
  itemName?: string;
  newPath: string;
}): string {
  let script = '';
  script += generateProjectCheck();

  // Find the item
  if (params.itemId) {
    script += 'var item = app.project.itemByID(' + params.itemId + ');\n';
  } else if (params.itemName) {
    script += 'var item = null;\n';
    script += 'for (var i = 1; i <= app.project.numItems; i++) {\n';
    script += '  if (app.project.item(i).name === "' + escapeString(params.itemName) + '") {\n';
    script += '    item = app.project.item(i);\n';
    script += '    break;\n';
    script += '  }\n';
    script += '}\n';
  }

  script += 'if (!item) {\n';
  script += '  throw new Error("Item not found");\n';
  script += '}\n';

  script += 'if (!(item instanceof FootageItem)) {\n';
  script += '  throw new Error("Item is not a footage item");\n';
  script += '}\n';

  script += 'var newFile = new File("' + escapeString(params.newPath) + '");\n';
  script += 'if (!newFile.exists) {\n';
  script += '  throw new Error("New file not found: ' + escapeString(params.newPath) + '");\n';
  script += '}\n';

  script += 'item.replace(newFile);\n';

  script += generateResultObject({
    success: 'true',
    itemId: 'item.id',
    itemName: 'item.name',
    newPath: '"' + escapeString(params.newPath) + '"'
  });

  return wrapInUndoGroup(script, 'Replace Footage');
}

/**
 * Generate script to organize project items
 */
export function generateOrganizeProjectItems(params: {
  structure?: string;
  customFolders?: string[];
}): string {
  let script = '';
  script += generateProjectCheck();

  const structure = params.structure || 'type';

  script += 'var organizedCount = 0;\n';

  if (structure === 'type') {
    // Create folders by type
    script += 'var compsFolder = null;\n';
    script += 'var footageFolder = null;\n';
    script += 'var solidsFolder = null;\n';

    script += 'for (var i = 1; i <= app.project.numItems; i++) {\n';
    script += '  var item = app.project.item(i);\n';
    script += '  if (item instanceof FolderItem) continue;\n';
    script += '  if (item.parentFolder !== app.project.rootFolder) continue;\n';

    script += '  if (item instanceof CompItem) {\n';
    script += '    if (!compsFolder) {\n';
    script += '      compsFolder = app.project.items.addFolder("Compositions");\n';
    script += '    }\n';
    script += '    item.parentFolder = compsFolder;\n';
    script += '    organizedCount++;\n';
    script += '  } else if (item instanceof FootageItem) {\n';
    script += '    if (item.mainSource instanceof SolidSource) {\n';
    script += '      if (!solidsFolder) {\n';
    script += '        solidsFolder = app.project.items.addFolder("Solids");\n';
    script += '      }\n';
    script += '      item.parentFolder = solidsFolder;\n';
    script += '    } else {\n';
    script += '      if (!footageFolder) {\n';
    script += '        footageFolder = app.project.items.addFolder("Footage");\n';
    script += '      }\n';
    script += '      item.parentFolder = footageFolder;\n';
    script += '    }\n';
    script += '    organizedCount++;\n';
    script += '  }\n';
    script += '}\n';
  } else if (structure === 'usage') {
    // Create folders for used and unused items
    script += 'var usedFolder = app.project.items.addFolder("Used");\n';
    script += 'var unusedFolder = app.project.items.addFolder("Unused");\n';

    script += 'for (var i = 1; i <= app.project.numItems; i++) {\n';
    script += '  var item = app.project.item(i);\n';
    script += '  if (item instanceof FolderItem) continue;\n';
    script += '  if (item.parentFolder !== app.project.rootFolder) continue;\n';

    script += '  if (item.usedIn && item.usedIn.length > 0) {\n';
    script += '    item.parentFolder = usedFolder;\n';
    script += '  } else {\n';
    script += '    item.parentFolder = unusedFolder;\n';
    script += '  }\n';
    script += '  organizedCount++;\n';
    script += '}\n';
  } else if (structure === 'custom' && params.customFolders) {
    // Create custom folders
    script += 'var folders = {};\n';
    for (let i = 0; i < params.customFolders.length; i++) {
      const folderName = params.customFolders[i];
      script += 'folders["' + escapeString(folderName) + '"] = app.project.items.addFolder("' + escapeString(folderName) + '");\n';
    }
  }

  script += generateResultObject({
    success: 'true',
    organizedCount: 'organizedCount'
  });

  return wrapInUndoGroup(script, 'Organize Project');
}

/**
 * Generate script to find missing footage
 */
export function generateFindMissingFootage(): string {
  let script = '';
  script += generateProjectCheck();

  script += 'var missingItems = [];\n';

  script += 'for (var i = 1; i <= app.project.numItems; i++) {\n';
  script += '  var item = app.project.item(i);\n';
  script += '  if (item instanceof FootageItem) {\n';
  script += '    if (item.footageMissing) {\n';
  script += '      var info = {};\n';
  script += '      info.id = item.id;\n';
  script += '      info.name = item.name;\n';
  script += '      if (item.file) {\n';
  script += '        info.path = item.file.fsName;\n';
  script += '      }\n';
  script += '      missingItems.push(info);\n';
  script += '    }\n';
  script += '  }\n';
  script += '}\n';

  script += 'var result = {};\n';
  script += 'result.missingCount = missingItems.length;\n';
  script += 'result.items = missingItems;\n';
  script += 'result;\n';

  return script;
}

/**
 * Generate script to collect files
 */
export function generateCollectFiles(params: {
  outputPath: string;
  includeFootage?: boolean;
  includeFonts?: boolean;
}): string {
  let script = '';
  script += generateProjectCheck();

  // Note: AE's collectFiles is limited in scripting
  // This creates a manual collection

  script += 'var outputFolder = new Folder("' + escapeString(params.outputPath) + '");\n';
  script += 'if (!outputFolder.exists) {\n';
  script += '  outputFolder.create();\n';
  script += '}\n';

  script += 'var collectedFiles = [];\n';

  if (params.includeFootage !== false) {
    script += 'var footageFolder = new Folder(outputFolder.fsName + "/footage");\n';
    script += 'footageFolder.create();\n';

    script += 'for (var i = 1; i <= app.project.numItems; i++) {\n';
    script += '  var item = app.project.item(i);\n';
    script += '  if (item instanceof FootageItem && item.file) {\n';
    script += '    try {\n';
    script += '      var srcFile = item.file;\n';
    script += '      var destFile = new File(footageFolder.fsName + "/" + srcFile.name);\n';
    script += '      if (srcFile.copy(destFile.fsName)) {\n';
    script += '        collectedFiles.push(srcFile.name);\n';
    script += '      }\n';
    script += '    } catch (e) {}\n';
    script += '  }\n';
    script += '}\n';
  }

  // Save project to output folder
  script += 'var projectFile = new File(outputFolder.fsName + "/" + (app.project.file ? app.project.file.name : "collected_project.aep"));\n';
  script += 'app.project.save(projectFile);\n';

  script += '{\n';
  script += '  outputPath: outputFolder.fsName,\n';
  script += '  collectedCount: collectedFiles.length,\n';
  script += '  files: collectedFiles\n';
  script += '};\n';

  return wrapInUndoGroup(script, 'Collect Files');
}

/**
 * Generate script to reduce project to used items
 */
export function generateReduceProject(params: {
  compId?: number;
  compName?: string;
}): string {
  let script = '';
  script += generateProjectCheck();
  script += generateCompAccess(params.compId, params.compName);

  script += 'app.project.reduceProject([comp]);\n';

  script += generateResultObject({
    success: 'true',
    compName: 'comp.name',
    remainingItems: 'app.project.numItems'
  });

  return wrapInUndoGroup(script, 'Reduce Project');
}

/**
 * Generate script to set proxy for footage
 */
export function generateSetProxy(params: {
  itemId?: number;
  itemName?: string;
  proxyPath: string;
}): string {
  let script = '';
  script += generateProjectCheck();

  // Find the item
  if (params.itemId) {
    script += 'var item = app.project.itemByID(' + params.itemId + ');\n';
  } else if (params.itemName) {
    script += 'var item = null;\n';
    script += 'for (var i = 1; i <= app.project.numItems; i++) {\n';
    script += '  if (app.project.item(i).name === "' + escapeString(params.itemName) + '") {\n';
    script += '    item = app.project.item(i);\n';
    script += '    break;\n';
    script += '  }\n';
    script += '}\n';
  }

  script += 'if (!item) {\n';
  script += '  throw new Error("Item not found");\n';
  script += '}\n';

  script += 'var proxyFile = new File("' + escapeString(params.proxyPath) + '");\n';
  script += 'if (!proxyFile.exists) {\n';
  script += '  throw new Error("Proxy file not found: ' + escapeString(params.proxyPath) + '");\n';
  script += '}\n';

  script += 'item.setProxy(proxyFile);\n';

  script += generateResultObject({
    success: 'true',
    itemName: 'item.name',
    proxyPath: '"' + escapeString(params.proxyPath) + '"'
  });

  return wrapInUndoGroup(script, 'Set Proxy');
}

/**
 * Generate script to remove proxy
 */
export function generateRemoveProxy(params: {
  itemId?: number;
  itemName?: string;
}): string {
  let script = '';
  script += generateProjectCheck();

  // Find the item
  if (params.itemId) {
    script += 'var item = app.project.itemByID(' + params.itemId + ');\n';
  } else if (params.itemName) {
    script += 'var item = null;\n';
    script += 'for (var i = 1; i <= app.project.numItems; i++) {\n';
    script += '  if (app.project.item(i).name === "' + escapeString(params.itemName) + '") {\n';
    script += '    item = app.project.item(i);\n';
    script += '    break;\n';
    script += '  }\n';
    script += '}\n';
  }

  script += 'if (!item) {\n';
  script += '  throw new Error("Item not found");\n';
  script += '}\n';

  script += 'item.setProxyToNone();\n';

  script += generateResultObject({
    success: 'true',
    itemName: 'item.name'
  });

  return wrapInUndoGroup(script, 'Remove Proxy');
}

/**
 * Generate script to list the project's folder tree.
 *
 * Needed before moving anything: you cannot file a comp into a folder you
 * cannot see. Returns only FolderItems, with their path, so a 700-item project
 * stays readable.
 */
export function generateListProjectFolders(): string {
  let script = '';
  script += generateProjectCheck();

  script += 'function folderPath(f) {\n';
  script += '  var parts = [];\n';
  script += '  var cur = f;\n';
  script += '  while (cur && cur !== app.project.rootFolder) { parts.unshift(cur.name); cur = cur.parentFolder; }\n';
  script += '  return parts.join(" / ");\n';
  script += '}\n';
  script += 'var out = [];\n';
  script += 'for (var i = 1; i <= app.project.numItems; i++) {\n';
  script += '  var it = app.project.item(i);\n';
  script += '  if (!(it instanceof FolderItem)) continue;\n';
  script += '  out.push({ id: it.id, name: it.name, path: folderPath(it), items: it.numItems });\n';
  script += '}\n';

  script += generateResultObject({
    total: 'out.length',
    folders: 'out'
  });

  return script;
}

/**
 * Generate script to move one project item into a folder.
 *
 * This is the surgical version of organize_project_items, which is a blunt
 * instrument: that one invents "Compositions"/"Footage"/"Solids" folders and
 * dumps every root-level item into them, which wrecks a project that already
 * has a folder structure.
 */
export function generateMoveProjectItem(params: {
  itemId?: number;
  itemName?: string;
  folderId?: number;
  folderName?: string;
  createFolder?: boolean;
  toRoot?: boolean;
}): string {
  let script = '';
  script += generateProjectCheck();

  // Find the item
  if (params.itemId !== undefined) {
    script += 'var item = app.project.itemByID(' + params.itemId + ');\n';
    script += 'if (!item) { throw new Error("Item not found by id: ' + params.itemId + '"); }\n';
  } else {
    script += 'var item = null;\n';
    script += 'for (var i = 1; i <= app.project.numItems; i++) {\n';
    script += '  if (app.project.item(i).name === "' + escapeString(params.itemName || '') + '") { item = app.project.item(i); break; }\n';
    script += '}\n';
    script += 'if (!item) { throw new Error("Item not found: ' + escapeString(params.itemName || '') + '"); }\n';
  }

  // Find the destination folder
  //
  // ⚠️ NADA DE `instanceof` CON OBJETOS DE AE: `folder instanceof FolderItem`
  // devuelve falso para una carpeta de verdad, asi que la rama de folderId
  // lanzaba SIEMPRE y solo funcionaba buscar por nombre. Una carpeta es lo
  // unico que tiene numItems y no tiene capas.
  if (params.toRoot) {
    // La raiz no aparece en app.project.item(), asi que no habia forma de
    // sacar algo de una carpeta. Las zonas van a la vista, en la raiz.
    script += 'var folder = app.project.rootFolder;\n';
  } else if (params.folderId !== undefined) {
    script += 'var folder = app.project.itemByID(' + params.folderId + ');\n';
    script += 'if (!folder || folder.numItems === undefined || folder.numLayers !== undefined) { throw new Error("Folder not found by id: ' + params.folderId + '"); }\n';
  } else {
    script += 'var folder = null;\n';
    script += 'for (var j = 1; j <= app.project.numItems; j++) {\n';
    script += '  var cand = app.project.item(j);\n';
    script += '  if (cand instanceof FolderItem && cand.name === "' + escapeString(params.folderName || '') + '") { folder = cand; break; }\n';
    script += '}\n';
    if (params.createFolder) {
      script += 'if (!folder) { folder = app.project.items.addFolder("' + escapeString(params.folderName || '') + '"); }\n';
    } else {
      script += 'if (!folder) { throw new Error("Folder not found: ' + escapeString(params.folderName || '') + '"); }\n';
    }
  }

  script += 'var fromName = (item.parentFolder === app.project.rootFolder) ? "(raiz)" : item.parentFolder.name;\n';
  script += 'item.parentFolder = folder;\n';
  script += 'var toName = (folder === app.project.rootFolder) ? "(raiz)" : folder.name;\n';

  script += generateResultObject({
    success: 'true',
    item: 'item.name',
    from: 'fromName',
    to: 'toName'
  });

  return wrapInUndoGroup(script, 'Move Project Item');
}

/**
 * Generate script to rename one project item.
 *
 * There was no way to rename a folder or a comp from here, so the tidying of
 * the project panel always ended with a list of renames for a human. AE exposes
 * `Item.name` as writable, so it was only a missing tool.
 *
 * Renaming a COMP is not free: a layer that points at it keeps pointing at it,
 * but expressions written as comp("Nombre") break silently, the same way
 * renaming an effect broke three expressions of T02. That is why the result
 * says how many layers use the item: the caller decides with the number in
 * front, instead of finding out later.
 */
export function generateRenameProjectItem(params: {
  itemId?: number;
  itemName?: string;
  newName: string;
}): string {
  let script = '';
  script += generateProjectCheck();

  if (params.itemId !== undefined) {
    script += 'var item = app.project.itemByID(' + params.itemId + ');\n';
    script += 'if (!item) { throw new Error("Item not found by id: ' + params.itemId + '"); }\n';
  } else {
    script += 'var item = null;\n';
    script += 'for (var i = 1; i <= app.project.numItems; i++) {\n';
    script += '  if (app.project.item(i).name === "' + escapeString(params.itemName || '') + '") { item = app.project.item(i); break; }\n';
    script += '}\n';
    script += 'if (!item) { throw new Error("Item not found: ' + escapeString(params.itemName || '') + '"); }\n';
  }

  script += 'var nuevo = "' + escapeString(params.newName) + '";\n';
  script += 'if (nuevo === "") { throw new Error("newName is empty"); }\n';
  // Two items with the same name inside one folder is how a project starts to lie.
  script += 'var padre = item.parentFolder;\n';
  script += 'for (var k = 1; k <= padre.numItems; k++) {\n';
  script += '  if (padre.item(k) !== item && padre.item(k).name === nuevo) {\n';
  script += '    throw new Error("Ya hay un item llamado \\"" + nuevo + "\\" en esa carpeta");\n';
  script += '  }\n';
  script += '}\n';
  // How many layers point at it, so a rename is never blind.
  script += 'var usos = 0;\n';
  script += 'for (var c = 1; c <= app.project.numItems; c++) {\n';
  script += '  var it = app.project.item(c);\n';
  script += '  if (!(it instanceof CompItem)) continue;\n';
  script += '  for (var L = 1; L <= it.numLayers; L++) {\n';
  script += '    if (it.layer(L).source === item) usos++;\n';
  script += '  }\n';
  script += '}\n';
  script += 'var antes = item.name;\n';
  script += 'item.name = nuevo;\n';

  script += generateResultObject({
    success: 'true',
    antes: 'antes',
    ahora: 'item.name',
    // ⚠️ NADA DE `instanceof` CON OBJETOS DE AE. Devolvia "comp" para una
    // carpeta, asi que se distingue por lo que cada tipo tiene: una comp tiene
    // capas, una carpeta tiene items, y lo demas es material.
    tipo: '(item.numLayers !== undefined) ? "comp" : (item.numItems !== undefined) ? "carpeta" : "material"',
    capasQueLoUsan: 'usos',
    aviso: 'usos > 0 ? "lo usan " + usos + " capas: comprueba las expresiones que lo nombren por texto" : ""'
  });

  return wrapInUndoGroup(script, 'Rename Project Item');
}

/**
 * Generate script to delete an EMPTY project folder.
 *
 * Deliberately only empty folders. Deleting a folder with something inside
 * takes its contents with it, without asking, and this project already lost
 * three null layers of T02 that way. If it has anything, this refuses and says
 * what is in it.
 */
export function generateDeleteEmptyFolder(params: {
  folderId?: number;
  folderName?: string;
}): string {
  let script = '';
  script += generateProjectCheck();

  if (params.folderId !== undefined) {
    script += 'var folder = app.project.itemByID(' + params.folderId + ');\n';
  } else {
    script += 'var folder = null;\n';
    script += 'for (var i = 1; i <= app.project.numItems; i++) {\n';
    script += '  var cand = app.project.item(i);\n';
    script += '  if (cand instanceof FolderItem && cand.name === "' + escapeString(params.folderName || '') + '") { folder = cand; break; }\n';
    script += '}\n';
  }
  // Mismo motivo que en rename: `instanceof` miente aqui. Una carpeta es lo
  // unico que tiene numItems y no tiene capas.
  script += 'if (!folder || folder.numItems === undefined || folder.numLayers !== undefined) { throw new Error("Folder not found"); }\n';
  script += 'if (folder.numItems > 0) {\n';
  script += '  var dentro = [];\n';
  script += '  for (var j = 1; j <= folder.numItems; j++) dentro.push(folder.item(j).name);\n';
  script += '  throw new Error("La carpeta no esta vacia, tiene " + folder.numItems + ": " + dentro.join(", "));\n';
  script += '}\n';
  script += 'var nombre = folder.name;\n';
  script += 'folder.remove();\n';

  script += generateResultObject({
    success: 'true',
    borrada: 'nombre'
  });

  return wrapInUndoGroup(script, 'Delete Empty Folder');
}

/**
 * Audit the project against one root folder.
 *
 * Answers the question you have to answer before deleting anything: what does
 * the work actually depend on, where does each piece live, and what is nobody
 * using. The report walks every composition's layers, follows precomps, and
 * classifies every item in the project.
 *
 * Nothing is deleted or moved. It only looks.
 */
export function generateAuditProject(params: {
  rootFolder?: string;
  rootComps?: string[];
}): string {
  const root = params.rootFolder || '0_FAILFAST';

  let script = '';
  script += generateProjectCheck();

  script += 'var RAIZ = "' + escapeString(root) + '";\n';

  // Full path of every item, so "inside the root folder" is a fact and not a guess.
  script += 'function rutaDe(it) {\n';
  script += '  var partes = [];\n';
  script += '  var p = it.parentFolder;\n';
  script += '  while (p && p !== app.project.rootFolder) { partes.unshift(p.name); p = p.parentFolder; }\n';
  script += '  return partes.join(" / ");\n';
  script += '}\n';

  script += 'var porId = {};\n';
  script += 'var todos = [];\n';
  script += 'for (var i = 1; i <= app.project.numItems; i++) {\n';
  script += '  var it = app.project.item(i);\n';
  script += '  if (it instanceof FolderItem) continue;\n';
  script += '  var ruta = rutaDe(it);\n';
  script += '  var reg = { id: it.id, nombre: it.name, ruta: ruta,\n';
  script += '              tipo: (it instanceof CompItem) ? "comp" : "material",\n';
  script += '              dentro: (ruta === RAIZ || ruta.indexOf(RAIZ + " / ") === 0) };\n';
  script += '  porId[it.id] = reg;\n';
  script += '  todos.push(reg);\n';
  script += '}\n';

  // What each comp uses. Layer sources only: that is what breaks if you delete it.
  script += 'var usa = {};\n';
  script += 'for (var c = 1; c <= app.project.numItems; c++) {\n';
  script += '  var cm = app.project.item(c);\n';
  script += '  if (!(cm instanceof CompItem)) continue;\n';
  script += '  var lista = [];\n';
  script += '  for (var L = 1; L <= cm.numLayers; L++) {\n';
  script += '    try { var src = cm.layer(L).source; if (src) lista.push(src.id); } catch (eL) {}\n';
  script += '  }\n';
  script += '  usa[cm.id] = lista;\n';
  script += '}\n';

  // Roots: the named comps, or every comp living inside the root folder.
  script += 'var cola = [];\n';
  if (params.rootComps && params.rootComps.length) {
    script += 'var nombres = ' + JSON.stringify(params.rootComps) + ';\n';
    script += 'for (var n = 0; n < nombres.length; n++) {\n';
    script += '  for (var t = 0; t < todos.length; t++) {\n';
    script += '    if (todos[t].nombre === nombres[n] && todos[t].tipo === "comp") { cola.push(todos[t].id); break; }\n';
    script += '  }\n';
    script += '}\n';
  } else {
    script += 'for (var t = 0; t < todos.length; t++) {\n';
    script += '  if (todos[t].tipo === "comp" && todos[t].dentro) cola.push(todos[t].id);\n';
    script += '}\n';
  }
  script += 'var raices = cola.length;\n';

  script += 'var visto = {};\n';
  script += 'while (cola.length) {\n';
  script += '  var id = cola.pop();\n';
  script += '  if (visto[id]) continue;\n';
  script += '  visto[id] = true;\n';
  script += '  var hijos = usa[id];\n';
  script += '  if (hijos) { for (var h = 0; h < hijos.length; h++) if (!visto[hijos[h]]) cola.push(hijos[h]); }\n';
  script += '}\n';

  script += 'var fuera = [];\n';   // used, but living outside the root folder
  script += 'var sobra = [];\n';   // reachable from nothing
  script += 'var dentroOk = 0;\n';
  script += 'for (var t2 = 0; t2 < todos.length; t2++) {\n';
  script += '  var r = todos[t2];\n';
  script += '  if (visto[r.id]) { if (r.dentro) { dentroOk++; } else { fuera.push(r); } }\n';
  script += '  else { sobra.push(r); }\n';
  script += '}\n';

  script += 'var result = {};\n';
  script += 'result.raiz = RAIZ;\n';
  script += 'result.compsRaiz = raices;\n';
  script += 'result.total = todos.length;\n';
  script += 'result.enUsoYDentro = dentroOk;\n';
  script += 'result.enUsoPeroFuera = fuera;\n';
  script += 'result.sinUsar = sobra;\n';
  script += 'result;\n';

  return script;
}
