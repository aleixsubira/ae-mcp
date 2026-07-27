# AE-MCP — Manual interno (FailFast)

Servidor MCP que permite a Claude controlar Adobe After Effects: crear
composiciones, capas, animación por expresiones y keyframes, efectos — y
desde julio de 2026, **ver lo que hace** (render de frames e informes de
estado). Este manual cubre la instalación para el equipo, las mejoras
propias sobre el proyecto original y el protocolo de trabajo.

- Repo original (upstream): https://github.com/ishu86/after-effects-mcp
- Nuestro fork interno (privado): https://github.com/aleixgomez-ff/ae-mcp

---

## 1. Qué hemos mejorado (jul 2026, commit `78bb951`)

### Bugs arreglados

| Bug | Síntoma | Arreglo |
|---|---|---|
| `set_keyframe` rechazaba arrays | `Unable to call "setValueAtKey"... Value is not an array` al animar posición/escala | El JSON Schema de `value` no declaraba tipo y algunos puentes MCP lo convertían a string. Ahora declara `oneOf` y además el servidor re-parsea strings JSON (`"[540,960]"`) por si el puente insiste |
| `get_expression` reventaba | `SyntaxError: Expected: ;` al leer cualquier expresión | El generador emitía `{...};` suelto, que ExtendScript interpreta como bloque, no como objeto. Ahora asigna a variable |

### Herramientas nuevas — "los ojos"

- **`render_frame {compName, time, fileName?, outputDir?}`**
  Renderiza un frame de la compo a PNG (por defecto en `~/Desktop/ae_probe/`)
  y devuelve la ruta. Claude puede mirar el resultado de lo que acaba de
  construir. Un render tarda ~100 ms.
- **`get_comp_report {compName, sampleTimes?}`**
  Informe completo de una compo en JSON: capas con geometría real
  (`sourceRectAtTime`), transformaciones, textos con fuente y tamaño,
  fuentes usadas vs instaladas, todas las expresiones y keyframes, y
  valores animados muestreados en los marcadores de la compo.

Con estas dos herramientas Claude trabaja en bucle *construir → ver →
medir → corregir* sin intervención humana. Antes construía a ciegas.

---

## 2. Instalación (macOS, por miembro del equipo)

Requisitos: After Effects 2024+, Node 18+, app de Claude desktop.

```bash
# 1. Clonar NUESTRO fork (no el upstream)
git clone https://github.com/aleixgomez-ff/ae-mcp.git ~/ae-mcp
cd ~/ae-mcp
npm install
npm run build

# 2. Instalar la extensión CEP en After Effects
./scripts/install-cep.sh
```

```jsonc
// 3. Registrar el servidor en Claude desktop:
// ~/Library/Application Support/Claude/claude_desktop_config.json
{
  "mcpServers": {
    "ae-mcp": {
      "command": "node",
      "args": ["/Users/TU_USUARIO/ae-mcp/dist/index.js"]
    }
  }
}
```

4. Reiniciar la app de Claude (Cmd+Q, no basta cerrar la ventana).
5. Abrir After Effects → Window → Extensions → **AE-MCP** (el panel debe
   quedar visible: es quien ejecuta los comandos).
6. Prueba de humo: pedir a Claude `get_project_info` y un
   `render_frame` de cualquier compo.

**Regla de oro: UN solo clon por máquina.** Si hay un clon en `~/ae-mcp` y
una copia en `~/Documents/ae-mcp`, la config de Claude ejecutará una y tú
editarás la otra, y perderás una tarde averiguándolo (experiencia real).
`ps aux | grep ae-mcp` te dice cuál corre de verdad.

---

## 3. Protocolo de trabajo con Claude

El detalle vive en la skill **`ae-visual-workflow`** (en `SKILL/` de este
repo; también instalable en Claude para que la cargue sola). Resumen:

1. **Nunca construir a ciegas**: `get_comp_report` antes de tocar nada;
   `render_frame` + mirar el PNG después de cada cambio visual.
2. **Marcadores como interfaz**: cada instante clave de sincronía lleva
   marcador con comentario; el informe muestrea los valores animados ahí.
3. **Calibración por sondas**: para geometría 3D no se calcula la
   proyección — se fija un valor constante, se renderiza, se mide, y con
   dos puntos se deriva el mapeo.
4. **Trampas de AE confirmadas**: el parenting no propaga opacidad;
   `add_camera_layer` crea la cámara descentrada (recolocar a
   `[cx, cy, -zoom]` siempre); para crawls se anima el Anchor Point, no
   la posición; ExtendScript es ES3 estricto.

---

## 4. Problemas conocidos (pendientes, poca prioridad)

- `save_project` sin `path` falla si el proyecto nunca se guardó: pasar
  ruta la primera vez.
- El chequeo de fuentes de `get_comp_report` puede dar `installed:false`
  para fuentes que renderizan bien (limitación de `app.fonts`): confirmar
  con un render antes de creer el flag.
- `saveFrameToPng` (base de `render_frame`) es API no documentada de
  Adobe: estable desde CC2020, pero si una versión futura la retira,
  `render_frame` fallará con mensaje claro.

## 5. Mantenimiento

- Tocar código → `npx tsc` → Cmd+Q a Claude y reabrir (el proceso node es
  hijo de la app; un toggle del conector puede no matarlo).
- La extensión CEP casi nunca necesita cambios: los comandos viajan como
  ficheros JSON por `~/Documents/ae-mcp-commands/` y el panel los ejecuta.
- Upstream: mantener `origin` apuntando al repo de ishu86 permite traer
  sus actualizaciones (`git fetch origin && git merge origin/main`) y
  valorar abrir PR con nuestros fixes — son genéricos, no internos.

## 6. Changelog interno

- **2026-07-26** (`78bb951`): fixes de `set_keyframe` y `get_expression`;
  nuevas `render_frame` y `get_comp_report`; skill `ae-visual-workflow`.
  Validado con un caso real: una compo con texto 3D en perspectiva
  calibrada íntegramente por Claude en ~10 ciclos de render.
