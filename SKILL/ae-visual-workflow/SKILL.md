---
name: ae-visual-workflow
description: >
  Working protocol for driving Adobe After Effects through the ae-mcp server
  (mcp tools prefixed ae-mcp__, possibly proxied as
  mcp__remote-devices__ae-mcp__*). Use whenever building or editing AE
  compositions via MCP: it defines the see-measure-correct loop
  (get_comp_report + render_frame), empirical probe calibration, AE traps
  (opacity vs parenting, off-center cameras, ExtendScript ES3 quirks), and
  this user's environment specifics (two repo clones, restart procedure).
---

# After Effects via ae-mcp — protocolo visual

## Regla número uno: nunca construyas a ciegas

El servidor ae-mcp tiene dos herramientas de verificación. Úsalas SIEMPRE,
desde el primer minuto:

- `get_comp_report {compName}` — estado real de una compo: capas con
  geometría (`sourceRectAtTime`), textos con fuente y si está instalada,
  TODAS las expresiones y keyframes, valores animados muestreados en los
  marcadores. Llámalo antes de tocar nada y después de cada bloque de
  cambios. No confíes en que tu escritura funcionó: verifícalo aquí.
- `render_frame {compName, time, fileName}` — renderiza un frame a PNG en
  `~/Desktop/ae_probe/`. Tras cada cambio visual, renderiza 1-2 frames
  clave, tráelos con device_stage_files y MÍRALOS. Un render tarda ~100 ms:
  no hay excusa para iterar sin ver.

Bucle estándar: `get_comp_report` → cambio → `render_frame` → mirar →
corregir → repetir. Diez ciclos son normales y baratos.

## Calibración empírica con sondas

Para colocar/temporizar elementos 3D (crawls, zooms, cámaras), NO calcules
la proyección: mídela.

1. Fija la propiedad animada a un valor constante por expresión
   (p.ej. `[0,1000,0]` en Anchor Point).
2. `render_frame` y mide en el PNG dónde cae el contenido.
3. Repite con un segundo valor. Con dos puntos tienes el mapeo local
   (suele ser casi lineal cerca del centro de pantalla, comprimido hacia
   el horizonte).
4. Deriva las constantes y escribe la expresión final.

Los marcadores de composición son la interfaz de sincronía: pon un marcador
en cada instante clave (con comentario), porque `get_comp_report` muestrea
los valores animados exactamente ahí.

## Trampas de After Effects (todas pisadas y confirmadas)

- **El parenting NO propaga opacidad.** Un null padre con opacity 0 deja a
  los hijos visibles. Los fades van en cada capa hija (o precomponiendo).
- **`add_camera_layer` crea la cámara descentrada** en `[0,0,-zoom]`
  mirando a la esquina superior izquierda. Primer paso tras crearla:
  `modify_layer` posición `{x: cx, y: cy, z: -zoom}` (para 1080×1920:
  `{540, 960, -zoom}`). Una cámara descentrada produce texto 3D sesgado
  en diagonal — si ves shear inexplicable, revisa la cámara.
- **Movimiento tipo crawl (contenido deslizándose por un plano inclinado):
  posición FIJA y anima el ANCHOR POINT.** Trasladar la posición Y desliza
  el plano rígido (la cola se abalanza sobre la cámara); animar el anchor
  point mueve el contenido por la superficie, como en la película.
  Propiedad: `"Anchor Point"` (con espacio y mayúsculas).
- **Perspectiva del crawl**: zoom 1500 a z=-1500 queda plano; zoom 700
  exagera y comprime el fondo. Punto dulce medido: zoom 1000, cámara
  `[540,960,-1000]`, plano con rotX -68 y pivote bajo (~y 1650).
- **Linear Wipe para desvanecer al horizonte**: la dirección correcta del
  ángulo es empírica (0 vs 180 según el rig). Renderiza y comprueba que
  oscurece el lado del horizonte, no la entrada.
- **ExtendScript es ES3**: nada de arrow functions, const/let, template
  literals. Y un `{...};` en posición de sentencia es un BLOQUE, no un
  objeto — asigna siempre a variable (`var r = {...}; r;`).
- **Expresiones multilínea con comentarios `//` pueden fallar** al
  releerse; escribe expresiones en una sola línea con `;`.
- **`app.fonts` da falsos negativos**: el informe puede decir
  `installed:false` para fuentes que renderizan bien (Helvetica Neue).
  Confirma con un render antes de creer el flag.

## Bugs del MCP y su estado

- `set_keyframe` / `set_keyframe_advanced`: ARREGLADO (jul 2026) — acepta
  arrays `[x,y]`, números y strings JSON. Si un servidor viejo devuelve
  "Value is not an array", el workaround es usar expresiones.
- `get_expression`: ARREGLADO (jul 2026). En servidores viejos revienta
  con `SyntaxError: Expected: ;`.
- `save_project` sin ruta falla si el proyecto nunca se guardó: pasa
  `path` la primera vez.
- `modify_layer` con `position {x,y,z}` funciona también en cámaras.

## Entorno de este usuario (macbook-aleix-local)

- **Hay DOS clones del repo**: `~/ae-mcp` y `~/Documents/ae-mcp`.
  Claude desktop ejecuta **`~/Documents/ae-mcp/dist/index.js`** (verificado
  con `ps aux | grep ae-mcp`). Si tocas código, toca ese clon (o los dos).
- **Tras cambiar el servidor**: recompilar (`npx tsc`) y cerrar del todo
  la app de Claude (Cmd+Q) — el proceso node es hijo suyo y un toggle del
  conector puede no matarlo. La extensión CEP de AE no necesita cambios
  para ediciones del lado servidor.
- **El montaje FUSE de device_bash es frágil** para operaciones pesadas
  ("Resource deadlock avoided" al ejecutar binarios): compila en el
  contenedor cloud y escribe los .js compilados con device_commit_files,
  o ejecuta `node node_modules/typescript/lib/tsc.js` en vez del binario.
- Los PNG de render caen en `~/Desktop/ae_probe/` (Desktop suele estar
  concedido); tráelos con `device_stage_files`.
- Existe un `AE_Probe.jsx` en el escritorio (panel/script de volcado
  manual): obsoleto para lo esencial desde que existen `render_frame` y
  `get_comp_report`, útil solo si el MCP no está disponible.

## Valores de referencia: crawl vertical 1080×1920 (calibrados)

Rig completo verificado por render: cámara de un nodo, zoom 1000, posición
`[540, 960, -1000]`; plano de texto con rotX -68, escala 72 %, posición
fija con pivote bajo (`[540, 1650, 0]`); movimiento por Anchor Point con
expresión tipo `a=A0+V*(time-t0); [0,a,0]`, donde V≈440 unidades/s da un
ritmo legible y V es EL parámetro a retocar contra la música o el ritmo
deseado. Zoom-out de logo: interpolar en espacio exponencial
(`s=sIni*Math.pow(sFin/sIni,Math.pow(u,0.72))`), nunca lineal en escala.
Fundido al horizonte con Linear Wipe (ángulo según rig, comprobar por
render).
