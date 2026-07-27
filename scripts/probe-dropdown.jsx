/**
 * PROBE v3: setPropertyParameters - que le pasa al EFECTO al repoblar
 * FAILFAST / ae-mcp
 *
 * v2 demostro que poblar un dropdown nuevo funciona, pero que despues
 * layer.property('Effects').property('Producto Escena 1') devuelve null.
 * Hipotesis: setPropertyParameters regenera el pseudo-efecto (matchName
 * nuevo) y/o le devuelve el nombre por defecto. v3 lo mide.
 *
 * Ejecutar: File > Scripts > Run Script File...  Proyecto vacio.
 * Resultados en la comp __PROBE_RESULT__ (los lee Claude por MCP).
 */
(function () {
  var res = [];
  function log(k, v) {
    var s = String(v);
    if (s.length > 190) { s = s.substring(0, 190) + '...'; }
    res.push(k + ' = ' + s);
  }
  function tryIt(label, fn) {
    try { var r = fn(); log(label, 'OK >> ' + r); return r; }
    catch (e) { log(label, 'FAIL >> ' + e.toString()); return null; }
  }
  function codes(s) {
    if (s === null || s === undefined) { return 'null'; }
    var o = [];
    for (var i = 0; i < s.length; i++) { o.push(s.charCodeAt(i)); }
    return o.join(',');
  }

  var SAGRADO = ['Nexa Di\u00E9sel', 'Nexa Gasolina', 'Blue+', 'Autogas', 'Klin', 'Waylet'];
  var work = null, result = null;

  try {
    app.beginUndoGroup('PROBE v3');
    work = app.project.items.addComp('__PROBE_WORK__', 100, 100, 1, 1, 25);
    var layer = work.layers.addNull();
    layer.name = 'PROBE_PANEL';
    var fx = layer.property('Effects');

    // ---------- BLOQUE 1: que sobrevive a la llamada ----------
    var e1 = fx.addProperty('ADBE Dropdown Control');
    var idx1 = e1.propertyIndex;
    e1.name = 'Producto Escena 1';
    log('01_idx', idx1);
    log('02_matchName_antes', e1.matchName);
    log('03_nombre_antes', e1.name);

    var menuNuevo = tryIt('04_setPropertyParameters', function () {
      return e1.property(1).setPropertyParameters(SAGRADO) ? 'devuelve objeto' : 'devuelve null';
    });
    var devuelto = null;
    tryIt('05_recoger_devuelto', function () {
      var e = fx.property(idx1);
      devuelto = e.property(1);
      return 'ok';
    });

    tryIt('06_efecto_por_INDICE', function () { return fx.property(idx1).name; });
    tryIt('07_efecto_matchName_despues', function () { return fx.property(idx1).matchName; });
    tryIt('08_efecto_por_NOMBRE_viejo', function () {
      var e = fx.property('Producto Escena 1');
      return e ? 'lo encuentra' : 'NULL >> el nombre se ha perdido';
    });
    tryIt('09_numero_de_efectos', function () { return fx.numProperties; });

    // ---------- BLOQUE 2: lectura de vuelta + acento ----------
    tryIt('10_propertyParameters', function () {
      var p = fx.property(idx1).property(1).propertyParameters;
      return p ? ('n=' + p.length + ' :: ' + p.join(' / ')) : 'undefined';
    });
    tryIt('11_acento_codes', function () {
      var p = fx.property(idx1).property(1).propertyParameters;
      if (!p) { return 'sin readback'; }
      return codes(p[0]) + ' | identico=' + (p[0] === SAGRADO[0]);
    });
    tryIt('12_valueText', function () { return fx.property(idx1).property(1).valueText; });

    // ---------- BLOQUE 3: renombrar DESPUES ----------
    tryIt('13_renombrar_despues', function () {
      fx.property(idx1).name = 'Producto Escena 1';
      var e = fx.property('Producto Escena 1');
      return e ? 'el nombre agarra tras poblar' : 'NO agarra';
    });

    // ---------- BLOQUE 4: repoblar uno YA existente ----------
    tryIt('14_repoblar_existente', function () {
      fx.property(idx1).property(1).setPropertyParameters(['Waylet', 'Klin']);
      var p = fx.property(idx1).property(1).propertyParameters;
      return 'items=' + (p ? p.join(' / ') : '?') + ' nombre=' + fx.property(idx1).name;
    });

    // ---------- BLOQUE 5: LA PRUEBA DE FUEGO ----------
    // Una expresion que referencia el efecto POR NOMBRE, igual que el rig
    // de Repsol. Sobrevive a que repueblen el dropdown?
    tryIt('15_expresion_por_nombre', function () {
      fx.property(idx1).name = 'Producto Escena 1';
      var l2 = work.layers.addNull();
      l2.name = 'CONSUMIDOR';
      var s = l2.property('Effects').addProperty('ADBE Slider Control');
      s.name = 'Lee dropdown';
      s.property(1).expression =
        'thisComp.layer("PROBE_PANEL").effect("Producto Escena 1")(1)';
      var antes = s.property(1).expressionError || 'ninguno';
      fx.property(idx1).property(1).setPropertyParameters(['A', 'B', 'C']);
      var despues = s.property(1).expressionError || 'ninguno';
      var valor = 'n/a';
      try { valor = s.property(1).valueAtTime(0, false); } catch (e9) { valor = 'no legible'; }
      return 'error_antes=[' + antes + '] error_despues=[' + despues +
             '] nombre_efecto=' + fx.property(idx1).name + ' valor=' + valor;
    });

    // ---------- BLOQUE 6: casos prohibidos ----------
    tryIt('16_duplicados', function () {
      fx.property(idx1).property(1).setPropertyParameters(['X', 'X']); return 'NO lanzo';
    });
    tryIt('17_pipe', function () {
      fx.property(idx1).property(1).setPropertyParameters(['a|b', 'c']); return 'NO lanzo';
    });
    tryIt('18_vacio', function () {
      fx.property(idx1).property(1).setPropertyParameters(['', 'c']); return 'NO lanzo';
    });
    tryIt('19_un_solo_item', function () {
      fx.property(idx1).property(1).setPropertyParameters(['Solo']); return 'acepta 1 item';
    });

    // ---------- BLOQUE 7: orden correcto (poblar y LUEGO nombrar) ----------
    tryIt('20_orden_correcto', function () {
      var e2 = fx.addProperty('ADBE Dropdown Control');
      var i2 = e2.propertyIndex;
      e2.property(1).setPropertyParameters(SAGRADO);
      fx.property(i2).name = 'Producto Escena 2';
      var check = fx.property('Producto Escena 2');
      var p = check ? check.property(1).propertyParameters : null;
      return (check ? 'nombre OK' : 'nombre PERDIDO') +
             ' items=' + (p ? p.length : '?');
    });

  } catch (e) {
    log('ERROR_GLOBAL', e.toString() + ' linea ' + e.line);
  }

  try {
    for (var i = app.project.numItems; i >= 1; i--) {
      var it = app.project.item(i);
      if (it.name === '__PROBE_RESULT__') { it.remove(); }
    }
    result = app.project.items.addComp('__PROBE_RESULT__', 100, 100, 1, 1, 25);
    for (var j = 0; j < res.length; j++) {
      var n = (j + 1 < 10 ? '0' : '') + (j + 1);
      result.layers.addNull().name = n + ' ' + res[j];
    }
    if (work) { work.remove(); }
    app.endUndoGroup();
    alert('PROBE v3 terminado.\n' + res.length + ' resultados en __PROBE_RESULT__.\n\nDile a Claude: "listo"');
  } catch (e4) {
    app.endUndoGroup();
    alert('PROBE v3 fallo al volcar:\n' + e4.toString() + '\n\n' + res.join('\n'));
  }
})();
