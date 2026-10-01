# Feather Wiki — Presentación

Wiki de presentación autocontenida construida sobre **[Feather Wiki](https://feather.wiki)** (v1.9.1 "Goldfinch"), pensada para exponer contenido en pantalla completa con un menú lateral navegable, numerado y ajustable.

El proyecto incluye una **extensión propia** (`presentation-menu.js`) que añade funciones orientadas a presentaciones, además de varias **extensiones de la comunidad**.

---

## Características

### Extensión propia: `presentation-menu.js`
1. **Menú lateral fijo (sticky).** El menú permanece visible mientras se desplaza la página y tiene su propia barra de desplazamiento si es largo.
2. **Numeración jerárquica del menú.** Los ítems se numeran automáticamente según su nivel: `1`, `1.1`, `1.1.1`…
3. **Mover páginas en el menú.** Botones `↑ ↓ → ←` en la cabecera de cada página (subir, bajar, anidar, desanidar) con indicador de posición.
4. **Editor con tamaños de fuente.** Botones `H1`–`H6` en el editor visual y botón de lista numerada claro (`1.` junto a `•`).
5. **Ocultar/mostrar el menú.** Botón `«` para ocultarlo; al ocultarse aparece una franja sensible en el borde izquierdo y un botón `☰` para traerlo de vuelta como panel superpuesto; `»` lo fija de nuevo.
6. **Zoom solo de la página.** `Ctrl/Cmd + rueda` sobre el contenido agranda/achica únicamente la página (el menú mantiene su tamaño). `Ctrl/Cmd + 0` reinicia.
7. **Ancho del menú ajustable.** Arrastrando el divisor del borde derecho del menú.
8. **Corrector ortográfico.** Fuerza el corrector en el editor y permite fijar el idioma (por defecto, el del documento).

### Extensiones de la comunidad incluidas
| Extensión | Función |
|---|---|
| `feather-search.js` | Barra de búsqueda de páginas en el menú. |
| `data-import-export.js` | Importar páginas y exportar a páginas, JSON crudo o HTML estático (desde *Wiki Settings*). |
| `suneditor-replacement.js` | Editor visual avanzado (tipografías, tamaños, colores, tablas, enlaces, code view). **Parcheado** (ver notas). |
| `simple-navigation.js` | Botones *Anterior / Siguiente* al pie de cada página (se carga desde feather.wiki). |

> Descargadas pero **no activadas**: `toggle-menu.js` (duplica la función 5 y choca con ella) y `auto-save.js` (solo funciona con guardado en servidor; en local avisa "Cannot autosave").

---

## Estructura del proyecto

```
Feather-Wiki-Presentation/
├─ index.html                     # Wiki de documentación/referencia (44 páginas)
├─ requistos.html                 # Presentación: "Fundamentos de la Ingeniería de Requisitos" (12 páginas)
├─ README.md
└─ extensions/
   └─ v1.9.x/
      ├─ presentation-menu.js     # Extensión propia
      ├─ feather-search.js
      ├─ data-import-export.js
      ├─ suneditor-replacement.js # Parcheada
      ├─ toggle-menu.js           # Descargada (no activa)
      └─ auto-save.js             # Descargada (no activa)
```

Cada archivo `.html` es una wiki independiente y **autocontenida** (HTML + CSS + JS + datos). La carpeta `extensions/` debe permanecer **junto** a los archivos `.html`.

---

## Requisitos

- Un navegador moderno con soporte de **ECMAScript 2015 (ES6)** (Chrome/Edge 86+, Firefox 88+, Safari 13+).
- **Conexión a internet** para:
  - **SunEditor** (se carga desde el CDN de jsDelivr). Sin conexión, el editor cae automáticamente al editor visual por defecto.
  - **simple-navigation.js** (se carga desde `feather.wiki`). Sin conexión no aparecerán los botones Anterior/Siguiente.

---

## Uso

### Ver la presentación
Abre `index.html` en el navegador.

### Editar
1. Pulsa **Edit** en la página que quieras modificar.
2. Escribe el contenido con el editor (visual o Markdown).
3. **Guardar:** pulsa **Save Wiki** para descargar el archivo `.html` actualizado. Reemplaza el archivo original con el descargado.

> Las extensiones se conservan al guardar porque están registradas en el **Custom Head** (Wiki Settings → Custom Head).

### Organizar el menú
- **Anidar:** en el editor de la página, desplegable **Parent**.
- **Ordenar:** botones `↑ ↓ → ←` en la cabecera de la página, o *Wiki Settings → Page Order* (un slug por línea).

### Buscar / Importar / Exportar
- **Buscar:** barra "Search Pages" en el menú.
- **Importar/Exportar:** *Wiki Settings → Data Management* (Import Files as Pages, Export Pages, Export Raw JSON Data, Export Static HTML).

---

## Configuración de la extensión

En la cabecera de `extensions/v1.9.x/presentation-menu.js` hay un bloque de configuración:

```js
const FWPM = {
  stickyMenu: true,           // menú fijo
  numberPages: true,          // numerar el menú
  separator: ' ',             // texto entre número y título (p. ej. '. ')
  numberAllPages: false,      // numerar también la página "All Pages"
  moveControls: true,         // botones ↑ ↓ → ←
  clarifyEditorButtons: true, // mostrar "1." en el botón de lista numerada
  editorSizes: true,          // botones H1..H6 en el editor visual
  editorSpellcheck: true,     // asegurar el corrector ortográfico
  editorLang: '',             // p. ej. 'es' para diccionario español
  sidebarToggle: true,        // ocultar/mostrar el menú
  pageZoom: true,             // zoom solo de la página (Ctrl/Cmd + rueda)
  resizeMenu: true,           // redimensionar el menú con el mouse
  zoomStep: 0.1,
  pageZoomMin: 0.5,
  pageZoomMax: 3,
  minMenuWidth: 180,
  overlayWidth: '320px',
  edgeWidth: 14,
  minWidth: '50rem'
};
```

---

## Notas

- **Zoom y ancho del menú** se guardan en el navegador (`localStorage`), por equipo; no viajan dentro del archivo de la wiki.
- **SunEditor** se parcheó localmente porque la versión publicada estaba rota:
  - cargaba `suneditor@latest` (ya es 3.x, incompatible) → se fijó a **2.47.12**;
  - su selector de guarda era incorrecto y **creaba el editor repetidamente** → corregido;
  - usaba `state.edits.useMd`, que no existe en Feather Wiki 1.9.x → corregido;
  - se añadió una **salvaguarda offline** (si el CDN no carga, se usa el editor por defecto).
- **`toggle-menu.js` y `auto-save.js`** están descargadas pero no activadas: la primera duplica/choca con la función de ocultar menú; la segunda solo tiene sentido con guardado en servidor (*nest*).
- Los archivos pueden pesar varios MB si contienen imágenes (se guardan incrustadas en base64).

---

## Créditos y licencia

- **[Feather Wiki](https://feather.wiki)** por Robbie Antenesse — licencia **AGPLv3**.
- **Extensiones de la comunidad**: `feather-search`, `data-import-export` (oficiales de Feather Wiki); `suneditor-replacement` por *jcoder* (adaptación); `simple-navigation` (oficial).
- **`presentation-menu.js`**: extensión propia de este proyecto.
- El **contenido** de la wiki (páginas, textos, imágenes) pertenece a su autor.
