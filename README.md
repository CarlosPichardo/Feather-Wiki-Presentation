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
7. **Ancho del menú ajustable.** Arrastrando el divisor del borde derecho del menú (por defecto, como máximo 320 px para dejar el resto al documento).
8. **Corrector ortográfico.** Fuerza el corrector en el editor y permite fijar el idioma (por defecto, el del documento).
9. **Página activa resaltada.** El ítem de la página actual se marca con la clase `fwpm-active` (enlace + fondo), de modo que siga siendo visible al navegar.
10. **Numeración de encabezados.** Cada `h2`–`h6` del contenido recibe su número de jerarquía (`4.5`, `4.5.1`, `4.5.1.1`…) como atributo `data-num`, que el CSS dibuja en la canaleta de la izquierda. Desactivable con `numberHeadings: false`.

### Extensiones de la comunidad incluidas
| Extensión | Función |
|---|---|
| `feather-search.js` | Barra de búsqueda de páginas en el menú. |
| `data-import-export.js` | Importar páginas y exportar a páginas, JSON crudo o HTML estático (desde *Wiki Settings*). |
| `suneditor-replacement.js` | Editor visual avanzado (tipografías, tamaños, colores, tablas, enlaces, code view). **Parcheado** (ver notas). |
| `simple-navigation.js` | Botones *Anterior / Siguiente* al pie de cada página (autoalojado). |

> Descargadas pero **no activadas**: `toggle-menu.js` (duplica la función 5 y choca con ella) y `auto-save.js` (solo funciona con guardado en servidor; en local avisa "Cannot autosave").

---

## Estructura del proyecto

```
Feather-Wiki-Presentation/
├─ index.html                     # Wiki (46 páginas) + tema "Trazabilidad"
├─ favicon.ico                    # Icono de Feather Wiki (autoalojado)
├─ README.md
└─ extensions/
   ├─ fonts/                      # Fuentes WOFF2 autoalojadas (OFL)
   │  ├─ archivo-latin.woff2
   │  ├─ ibm-plex-sans-latin.woff2
   │  ├─ ibm-plex-mono-400-latin.woff2
   │  ├─ ibm-plex-mono-500-latin.woff2
   │  ├─ manifest.json            # Qué familia, pesos, bytes y licencia
   │  └─ OFL.txt                  # Licencia de las tres familias
   └─ v1.9.x/
      ├─ presentation-menu.js     # Extensión propia
      ├─ feather-search.js
      ├─ data-import-export.js
      ├─ suneditor-replacement.js # Parcheada (carga SunEditor local)
      ├─ simple-navigation.js     # Autoalojada
      ├─ toggle-menu.js           # Descargada (no activa)
      ├─ auto-save.js             # Descargada (no activa)
      └─ suneditor/
         ├─ suneditor.min.js      # SunEditor 2.47.12 (autoalojado)
         └─ suneditor.min.css
```

Cada archivo `.html` es una wiki independiente y **autocontenida** (HTML + CSS + JS + datos). La carpeta `extensions/` debe permanecer **junto** a los archivos `.html`.

---

## Requisitos

- Un navegador moderno con soporte de **ECMAScript 2015 (ES6)** (Chrome/Edge 86+, Firefox 88+, Safari 13+).
- **Sin conexión a internet.** Todas las dependencias están **autoalojadas** en la carpeta `extensions/`. La app funciona 100 % offline.

### Todo autoalojado (offline)
| Dependencia | Ubicación local |
|---|---|
| SunEditor (JS) | `extensions/v1.9.x/suneditor/suneditor.min.js` |
| SunEditor (CSS) | `extensions/v1.9.x/suneditor/suneditor.min.css` |
| Navegación anterior/siguiente | `extensions/v1.9.x/simple-navigation.js` |
| Archivo (display) | `extensions/fonts/archivo-latin.woff2` |
| IBM Plex Sans (cuerpo) | `extensions/fonts/ibm-plex-sans-latin.woff2` |
| IBM Plex Mono (código/números) | `extensions/fonts/ibm-plex-mono-400-latin.woff2`, `…-500-latin.woff2` |

> El feed de "Updates" que se cargaba desde `floss.social` fue **eliminado** (era la única llamada de red restante).

**Imágenes.** Las 14 fotografías de contenido venían apuntando a `upload.wikimedia.org` y **se descargaban de internet**. Se descargaron una vez y se **incrustaron en base64** dentro del JSON de `index.html` (mismo modelo que usa Feather Wiki para sus imágenes), así que ya no hay ninguna petición de red. Se conservan intactos los enlaces de atribución (`href`) a la fuente original en Wikimedia Commons.

Las fuentes se sirven con `@font-face` desde `./extensions/fonts/` y **cargan igual con doble clic (`file://`)** que servidas por HTTP; no se necesita ningún CDN. `favicon.ico` (referenciado por el contenido como "Feather Wiki icon") está en la raíz junto a `index.html`.

---

## Diseño: tema "Trazabilidad"

El aspecto visual está aplicado en **`index.html` → Wiki Settings → Custom CSS** (`<style id="c">`). No hay CSS externo: el tema viaja dentro del propio archivo.

La idea es un **cuaderno de taller**: fondo de cromo gris en el menú lateral y una **hoja blanca que ocupa todo lo que deja el menú**, con una **canaleta de numeración** y un filete vertical que conecta cada encabezado con su número.

| Elemento | Decisión |
|---|---|
| Superficies | `#FFFFFF` hoja · `#E9ECF1` cromo (menú + fondo) · `#1A1F26` campos en oscuro |
| Tinta | `#14171C` texto · `#5C6470` metadatos y numeración · `#D4D9E0` filetes |
| Acento | `#1F5598` azul de plano técnico (enlaces, botones, foco) |
| Display | **Archivo** 600/700 para títulos y encabezados |
| Cuerpo | **IBM Plex Sans** 400/600 |
| Mono | **IBM Plex Mono** 400/500 para código, metadatos y la numeración de la canaleta |
| Medida | **Sin tope**: la columna de lectura crece con la hoja y aprovecha el ancho disponible (tablas, imágenes, código, formulario y editor a todo ancho) |
| Cabecera | Título apilado sobre una sola línea de metadatos (la tabla de dos columnas de Feather Wiki se deshace con `!important`) |
| Formulario de edición | Cabecera, campos y **barra de acciones en flex envolvente**: `Save · Cancel · Delete` ocupan su propia línea, en horizontal, debajo del módulo de edición |
| Numeración | `main > section[data-num]` → canaleta de `4.5rem` con filete en `--rail`; los números se alinean a la derecha contra el filete |
| Página activa | `.fwpm-active` en el menú (enlace azul + subrayado + fondo tenue) |
| Ancho | La hoja ocupa **todo el ancho disponible** en cualquier tamaño; solo por encima de 2200 px se recupera una medida de lectura de 1600 px en la prosa |

### Aprovechamiento del ancho de pantalla

La hoja no está limitada: el menú ocupa lo justo (por defecto `clamp(200px, 20%, 320px)`) y **el documento usa todo lo que queda hasta el borde derecho**.

| Antes | Ahora |
|---|---|
| Hoja fija en `max-width: 800 px` | `max-width: none` → llena el área del documento |
| Columna de lectura en `600 px` | `max-width: none` → crece con la hoja |
| Formulario y ajustes | `form`, `.mw` (página de ajustes) y `.ed` limitados a `1000 px` | `max-width: none` → a todo ancho |
| Franja de cromo gris vacía a la derecha | `hueco = 0 px` en todos los tamaños |

Detalles:

- **Menú**: `clamp(200px, 20%, 320px)` — en pantallas de 1600 px o más deja de crecer y no se lleva espacio del documento. Sigue siendo arrastrable para ajustarlo a mano.
- **Imágenes, vídeo e iframe**: `max-width: 100%` dentro de la columna, para que un contenido ancho no se salga de la hoja.
- **Pantallas muy anchas**: a partir de **2200 px** de ventana la prosa vuelve a limitarse a `1600 px` (unos 90 caracteres por línea) para no perder legibilidad; tablas, imágenes y bloques siguen a todo ancho. Para cambiarlo, la regla es `@media (min-width:2200px){ main .uc, main>section>header{max-width:1600px} }`.

Medido con `probe-widths.js` en **16 combinaciones** (480–2560 px: lectura, página de ajustes, imágenes, edición, editor desplegado y zoom ×1,5): `hueco = 0` en todas y ningún elemento desbordado. La página de ajustes pasa de `1000 px` a `1465 px` en una ventana de 1920.

### Editor: barra de acciones siempre visible

Feather Wiki maqueta el pie del formulario de edición como `display:table` (`@media (min-width:50rem)`). Esa tabla se estiraba por la anchura mínima del desplegable **Parent**, se desbordaba de la hoja y empujaba los botones fuera del papel: al estrechar la ventana o al aplicar el zoom de página (`Ctrl` + rueda) desaparecían de la pantalla.

El tema lo reconstruye y:

- **Cabecera (título + slug), campos y acciones** pasan a `display:flex` envolvente, así que nunca desbordan la hoja.
- **`Save · Cancel · Delete`** comparten una sola línea con un filete superior, justo debajo del módulo de edición.
- **SunEditor** fija un ancho absoluto en línea al abrirse; se fuerza a `width:100%`, de modo que el módulo se adapta si cambias el zoom o redimensionas la ventana (las barras de herramientas envuelven en varias filas en vez de salirse).

Comprobado con 22 combinaciones (480–1920 px de ancho × zoom 75–200 %, editor plegado y desplegado, y redimensionado tras abrir el editor): los tres botones quedan dentro de la hoja, en la misma línea y clicables en todos los casos.

### Cómo cambiar el tema

1. **Wiki Settings → Custom CSS**: ediciones puntuales (colores, tamaños, medida).
2. `:root` dentro de ese mismo bloque: los tokens `--bg`, `--sb-bg`, `--color`, `--link`, `--font`, `--gutter`… Cambiar un token reestiliza todo el sistema.
3. La numeración de la canaleta y el resaltado de la página activa los produce `presentation-menu.js` (atributo `data-num` y clase `fwpm-active`); si los desactivas con `numberHeadings: false` / `activeLink: false`, el CSS simplemente no encuentra nada que dibujar.

> **Importante:** el tema vive en el `<style id="c">` del `index.html`. Si editas con una pestaña **ya abierta** y guardas, la app regenera el `<head>` con el Custom Head que tenía cargado. Recarga con `Ctrl+F5` antes de editar.

---

## Uso

### Ver la presentación
Abre `index.html` en el navegador (no necesita internet ni servidor: también funciona con doble clic).

> Se recomienda mantener el `index.html` **junto a la carpeta `extensions/`**, porque las extensiones y SunEditor se cargan desde ahí.

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
  numberHeadings: true,       // numerar encabezados (data-num en la canaleta)
  activeLink: true,           // resaltar la página actual en el menú
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
  - cargaba `suneditor@latest` (ya es 3.x, incompatible) → se fijó a **2.47.12** (autoalojada);
  - su selector de guarda era incorrecto y **creaba el editor repetidamente** → corregido;
  - usaba `state.edits.useMd`, que no existe en Feather Wiki 1.9.x → corregido;
  - ahora carga desde `extensions/v1.9.x/suneditor/` (antes lo hacía desde el CDN de jsDelivr).
- **`toggle-menu.js` y `auto-save.js`** están descargadas pero no activadas: la primera duplica/choca con la función de ocultar menú; la segunda solo tiene sentido con guardado en servidor (*nest*).
- Los archivos pueden pesar varios MB si contienen imágenes (se guardan incrustadas en base64). Este `index.html` pesa ~700 KB: el JSON con las 46 páginas (~620 KB, de los que ~390 KB son las 14 fotos incrustadas en base64) y el tema (~15 KB).
- **Totalmente offline**: verificado recorriendo las **47 páginas del menú** en Chrome y registrando todas las peticiones de red — **0 peticiones externas**, 0 fallos de carga y 0 errores de JS. Lo mismo se repitió abriendo el archivo con `file://` (doble clic): las 4 fuentes WOFF2 cargan y las imágenes se muestran.

### Verificación offline (cómo se comprobó)
```
1. Abrir index.html en Chrome con depuración remota y registrar Network.requestWillBeSent.
2. Navegar a las 47 páginas del menú.
3. Filtrar peticiones cuya URL no sea http://localhost — debe dar 0.
4. Comprobar en el DOM que ningún <img>, <video>, <iframe> u hoja de estilo apunta a un origen externo.
5. Repetir el paso 1-3 con file:///.../index.html (doble clic, sin servidor).
```

### Seguridad
- El antiguo Custom JS incluía un **token de acceso de Mastodon** incrustado y hacía `fetch` a `floss.social`. Fue **eliminado** del archivo.
- Si ese token llegó a publicarse (por ejemplo en el historial de Git), **revócalo** en floss.social (Preferencias → Desarrollo → Aplicaciones).

### Nota para quien edite `index.html` a mano
El archivo contiene **todos los datos de la wiki incrustados** en un bloque `<script id="p" type="application/json">`. Editarlo manualmente es delicado: **haz una copia de seguridad antes** y verifica que el JSON siga siendo válido. Lo más seguro es editar desde la propia app (botón **Edit**) y guardar con **Save Wiki**.

---

## Créditos y licencia

- **[Feather Wiki](https://feather.wiki)** por Robbie Antenesse — licencia **AGPLv3**.
- **Extensiones de la comunidad**: `feather-search`, `data-import-export` (oficiales de Feather Wiki); `suneditor-replacement` por *jcoder* (adaptación); `simple-navigation` (oficial).
- **`presentation-menu.js`**: extensión propia de este proyecto.
- **Tipografías** (subconjuntos *latin*, sin modificar, licencia **SIL Open Font License 1.1**; texto completo en `extensions/fonts/OFL.txt`):
  - **Archivo** — Omnibus-Type, Copyright 2020 The Archivo Project Authors.
  - **IBM Plex Sans** y **IBM Plex Mono** — IBM, Copyright 2017 IBM Corp. con Reserved Font Name "Plex".
- El **contenido** de la wiki (páginas, textos, imágenes) pertenece a su autor.
