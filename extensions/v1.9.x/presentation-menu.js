/**
 * Feather Wiki extension: presentation-menu
 *
 * 1. Keeps the sidebar menu fixed while the page scrolls. If the menu is taller
 *    than the viewport it gets its own scrollbar, independent from the page.
 * 2. Numbers the page menu hierarchically: 1, 1.1, 1.1.1, ...
 * 3. Adds up/down/indent/outdent controls to move a page around the menu.
 * 4. Makes the editor's numbered-list button clearer (the "#" icon becomes "1.").
 * 5. Lets you hide the sidebar for presentations. When hidden, a thin strip on
 *    the left edge (and a small handle) brings it back as an overlay.
 * 6. Zooms only the page content (Ctrl/Cmd + wheel over the page, Ctrl/Cmd + 0
 *    to reset). The menu keeps its size.
 * 7. Drag the divider to change the menu width.
 *
 * The menu hierarchy and order are stored in Feather Wiki's own page data
 * (the "parent" field and the order of the pages array), so moving a page marks
 * the wiki as changed and is saved with "Save Wiki" like any other edit.
 *
 * This file is part of Feather Wiki and is licensed under the GNU AGPLv3.
 */
(function () {
  'use strict';

  var FWPM = {
    stickyMenu: true,           // 1. fix the sidebar menu in place
    numberPages: true,          // 2. number the page menu
    separator: ' ',             // text between the number and the title (e.g. '. ')
    numberAllPages: false,      // also number the "All Pages" listing
    moveControls: true,         // 3. buttons to move the current page in the menu
    clarifyEditorButtons: true, // 4. show "1." instead of "#" for numbered lists
    editorSizes: true,          // 4b. add H1..H6 buttons to the visual editor
    editorSpellcheck: true,     // 4c. make sure the editor is spell-checked
    editorLang: '',             // 4c. e.g. 'es' to use the Spanish dictionary
    sidebarToggle: true,        // 5. hide/show the sidebar
    pageZoom: true,             // 6. Ctrl/Cmd + wheel over the page content
    resizeMenu: true,           // 7. drag the divider to resize the menu
    zoomStep: 0.1,
    pageZoomMin: 0.5,
    pageZoomMax: 3,
    minMenuWidth: 180,
    overlayWidth: '320px',      // fallback overlay width before the first resize
    edgeWidth: 14,              // px of the touch/click strip on the left edge
    minWidth: '50rem'           // screens at least this wide get these features
  };

  var root = document.documentElement;
  var peekTimer = null;
  var storageReady = false;
  var baseWidthSet = false;
  var lastX = 0;
  var lastY = 0;

  FW.ready(function () {
    var state = FW.state;
    var emitter = FW.emitter;
    var ev = state.events;

    if (FWPM.stickyMenu || FWPM.sidebarToggle || FWPM.resizeMenu) injectStyles();

    if (FWPM.pageZoom) {
      initZoomFromStorage();
      document.addEventListener('wheel', onWheel, { passive: false });
      document.addEventListener('keydown', onZoomKey);
      document.addEventListener('mousemove', function (e) { lastX = e.clientX; lastY = e.clientY; }, { passive: true });
    }

    ['DOMContentLoaded', 'render'].forEach(function (name) {
      emitter.on(name, function () {
        // Small delay so the elements exist in the DOM after render
        setTimeout(function () {
          if (FWPM.numberPages) numberMenu();
          if (FWPM.numberAllPages) numberAllPagesView();
          if (FWPM.clarifyEditorButtons) clarifyEditorButtons();
          if (FWPM.editorSizes) addEditorSizeButtons();
          if (FWPM.editorSpellcheck) setupEditorSpellcheck();
          if (FWPM.moveControls) addMoveControls();
          if (FWPM.sidebarToggle) setupSidebarToggle();
          ensureBaseWidth();
          if (FWPM.resizeMenu) setupResizer();
        }, 50);
      });
    });

    // Make sure the handlers run once on load, like the official extensions do
    emitter.emit('DOMContentLoaded');

    // --- Styles ------------------------------------------------------------

    function injectStyles () {
      if (document.getElementById('fw-presentation-menu')) return;
      var style = document.createElement('style');
      style.id = 'fw-presentation-menu';
      style.textContent =
        ':root{--fwpm-sb-width:20%;--fwpm-page-zoom:1}' +
        // Zoom applies to the page content only, so the menu never changes size
        'main>section{zoom:var(--fwpm-page-zoom,1)}' +
        '#fwpm-zoom-badge{position:fixed;right:1rem;bottom:1rem;z-index:70;' +
          'background:rgba(0,0,0,.78);color:#fff;padding:6px 12px;border-radius:6px;' +
          'font-size:.85rem;opacity:0;transition:opacity .15s;pointer-events:none}' +
        '#fwpm-zoom-badge.fwpm-on{opacity:1}' +
        '@media (min-width:' + FWPM.minWidth + '){' +
          'main{display:flex!important;border-spacing:0!important}' +
          'main>*{display:block!important}' +
          '.sb{position:sticky;top:0;align-self:flex-start;height:100vh;overflow-y:auto;' +
              'flex:0 0 var(--fwpm-sb-width,20%);width:auto;' +
              'min-width:' + FWPM.minMenuWidth + 'px;max-width:85vw}' +
          'main>section{flex:1 1 auto;min-width:0}' +
        '}' +
        // The number goes before the title. Inside a <summary> the disclosure
        // triangle is drawn in the list padding, so the number needs a nudge to
        // the right or they overlap.
        '.fwpm-num{display:inline-block;min-width:1.6em;opacity:.7;font-variant-numeric:tabular-nums}' +
        'nav li summary > .fwpm-num{margin-left:1rem}' +
        // Move controls
        '.fwpm-move{display:block;margin-top:.5rem;white-space:nowrap}' +
        '.fwpm-move button{padding:2px 9px;margin-left:3px;background:var(--btn-bg);' +
          'color:var(--btn-color);border:0;border-radius:4px;cursor:pointer;font-weight:700}' +
        '.fwpm-move button:disabled{opacity:.3;cursor:default}' +
        '.fwpm-move .fwpm-pos{display:inline-block;min-width:2em;margin-left:.4rem;' +
          'font-size:.8rem;opacity:.8;font-variant-numeric:tabular-nums}' +
        // Sidebar hide/show
        '.fwpm-hide,.fwpm-show,.fwpm-edge,#fwpm-resizer{display:none}' +
        '@media (min-width:' + FWPM.minWidth + '){' +
          '.sb .fwpm-hide{display:block;position:absolute;top:.5rem;right:.5rem;z-index:3;' +
            'padding:1px 9px;background:var(--btn-bg);color:var(--btn-color);border:0;' +
            'border-radius:4px;cursor:pointer;font-weight:700;line-height:1.4}' +
          'html.fwpm-hidden .fwpm-edge{display:block;position:fixed;left:0;top:0;' +
            'width:' + FWPM.edgeWidth + 'px;height:100vh;z-index:59}' +
          'html.fwpm-hidden .fwpm-show{display:block;position:fixed;top:50%;left:0;' +
            'transform:translateY(-50%);z-index:61;' +
            'padding:3px 6px;background:var(--btn-bg);color:var(--btn-color);border:0;' +
            'border-radius:0 4px 4px 0;cursor:pointer;font-weight:700;line-height:1.4}' +
          'html.fwpm-hidden main > .sb{position:fixed;top:0;left:0;height:100vh;' +
            'width:min(85vw,var(--fwpm-sb-width,' + FWPM.overlayWidth + '));max-width:none;flex:none;' +
            'transform:translateX(-100%);transition:transform .2s ease;z-index:60;overflow-y:auto}' +
          'html.fwpm-hidden.fwpm-peek main > .sb{transform:translateX(0);' +
            'box-shadow:2px 0 14px rgba(0,0,0,.35)}' +
          'html.fwpm-hidden.fwpm-peek .fwpm-show{opacity:0;pointer-events:none}' +
          'html.fwpm-hidden main > section{flex:1 1 100%}' +
          // Divider to resize the menu
          '#fwpm-resizer{display:block;position:fixed;top:0;left:var(--fwpm-sb-width,20%);' +
            'width:7px;height:100vh;z-index:58;cursor:col-resize}' +
          '#fwpm-resizer::before{content:"";position:absolute;top:50%;left:2px;width:3px;' +
            'height:40px;margin-top:-20px;border-radius:2px;background:var(--color);' +
            'opacity:.18;transition:opacity .15s}' +
          '#fwpm-resizer:hover{background:rgba(128,128,128,.12)}' +
          '#fwpm-resizer:hover::before{opacity:.55}' +
          'html.fwpm-hidden #fwpm-resizer{display:none}' +
        '}';
      document.head.appendChild(style);
    }

    // --- Numbering ---------------------------------------------------------

    function numberMenu () {
      var nav = document.querySelector('.sb nav');
      if (!nav) return;
      var activeTab = nav.querySelector('.tabs button.a');
      // Only number the Pages tab (not Tags or Recent)
      if (activeTab && activeTab.textContent.trim() !== 'Pages') return;
      var rootUl = nav.querySelector('ul');
      if (!rootUl) return;
      numberList(rootUl, '');
    }

    function numberList (ul, prefix) {
      var index = 0;
      var children = ul.children;
      for (var i = 0; i < children.length; i++) {
        var li = children[i];
        if (li.tagName !== 'LI') continue;
        var label = li.querySelector(':scope > a') ||
                    li.querySelector(':scope > details > summary > a');
        if (!label) continue;
        var href = label.getAttribute('href') || '';
        // Skip the extra links Feather Wiki appends to the page list
        if (href === '?page=a' || href === '?page=m') continue;
        index++;
        var num = prefix ? prefix + '.' + index : String(index);
        setNumber(label, num);
        var childUl = li.querySelector(':scope > details > ul') ||
                      li.querySelector(':scope > ul');
        if (childUl) numberList(childUl, num);
      }
    }

    function setNumber (label, num) {
      var prev = label.previousElementSibling;
      if (prev && prev.classList && prev.classList.contains('fwpm-num')) {
        prev.textContent = num + FWPM.separator;
        return;
      }
      var span = document.createElement('span');
      span.className = 'fwpm-num';
      span.textContent = num + FWPM.separator;
      label.parentNode.insertBefore(span, label);
    }

    // Also number the "All Pages" page content (optional)
    function numberAllPagesView () {
      var section = document.querySelector('main > section');
      if (!section) return;
      if (!state.pg || state.pg.e || state.edit) return;
      if ((state.query.page || '') !== 'a') return;
      var rootUl = section.querySelector('ul');
      if (!rootUl) return;
      numberList(rootUl, '');
    }

    // --- Move controls -----------------------------------------------------

    function addMoveControls () {
      if (state.edit) return;
      var pg = state.pg;
      if (!pg || pg.e || pg.id === undefined) return;
      if (state.p.published) return; // same condition as the Edit button
      var header = document.querySelector('main > section > header');
      if (!header) return;
      var container = header.querySelector('.c.tr');
      if (!container || container.querySelector('#fwpm-move')) return;

      var canUp = !!previousSibling(pg);
      var canDown = !!nextSibling(pg);
      var canIndent = canUp;
      var canOutdent = !!pg.parent;

      var box = document.createElement('div');
      box.id = 'fwpm-move';
      box.className = 'fwpm-move';
      box.appendChild(moveButton('↑', 'Subir en el menú', canUp, function () { moveUp(pg); }));
      box.appendChild(moveButton('↓', 'Bajar en el menú', canDown, function () { moveDown(pg); }));
      box.appendChild(moveButton('→', 'Anidar (hacer subpágina de la anterior)', canIndent, function () { indent(pg); }));
      box.appendChild(moveButton('←', 'Desanidar (subir un nivel)', canOutdent, function () { outdent(pg); }));
      var pos = document.createElement('span');
      pos.className = 'fwpm-pos';
      pos.title = 'Posición actual en el menú';
      pos.textContent = numberFor(pg);
      box.appendChild(pos);
      container.appendChild(box);
    }

    function moveButton (label, title, enabled, handler) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = label;
      b.title = title;
      b.disabled = !enabled;
      b.addEventListener('click', handler);
      return b;
    }

    function siblings (page) {
      return state.p.pages.filter(function (p) {
        return (p.parent || '') === (page.parent || '');
      });
    }

    function previousSibling (page) {
      var sib = siblings(page);
      var i = sib.indexOf(page);
      return i > 0 ? sib[i - 1] : null;
    }

    function nextSibling (page) {
      var sib = siblings(page);
      var i = sib.indexOf(page);
      return (i > -1 && i < sib.length - 1) ? sib[i + 1] : null;
    }

    function moveUp (page) {
      var prev = previousSibling(page);
      if (!prev) return;
      moveInArray(page, prev, true);
      afterMove(page, 'Página subida');
    }

    function moveDown (page) {
      var next = nextSibling(page);
      if (!next) return;
      moveInArray(page, lastDescendant(next), false);
      afterMove(page, 'Página bajada');
    }

    function indent (page) {
      var prev = previousSibling(page);
      if (!prev) return;
      page.parent = prev.id;
      moveInArray(page, lastDescendant(prev), false);
      afterMove(page, 'Página anidada');
    }

    function outdent (page) {
      if (!page.parent) return;
      var parent = state.p.pages.filter(function (p) { return p.id === page.parent; })[0];
      if (!parent) return;
      if (parent.parent) page.parent = parent.parent;
      else delete page.parent;
      moveInArray(page, parent, false);
      afterMove(page, 'Página desanidada');
    }

    function moveInArray (page, ref, before) {
      var arr = state.p.pages;
      var from = arr.indexOf(page);
      if (from < 0) return;
      arr.splice(from, 1);
      var to = arr.indexOf(ref);
      if (to < 0) { arr.splice(from, 0, page); return; }
      arr.splice(before ? to : to + 1, 0, page);
    }

    function lastDescendant (page) {
      var last = page;
      var i;
      for (i = 0; i < state.p.pages.length; i++) {
        if (isDescendantOf(state.p.pages[i], page.id)) last = state.p.pages[i];
      }
      return last;
    }

    function isDescendantOf (page, id) {
      var cur = page;
      while (cur && cur.parent) {
        if (cur.parent === id) return true;
        cur = state.p.pages.filter(function (p) { return p.id === cur.parent; })[0];
      }
      return false;
    }

    // Hierarchical number of a page, e.g. "3.1.2"
    function numberFor (page) {
      var chain = [];
      var cur = page;
      while (cur) {
        chain.unshift(cur);
        cur = cur.parent
          ? state.p.pages.filter(function (p) { return p.id === cur.parent; })[0]
          : null;
      }
      var prefix = '';
      for (var k = 0; k < chain.length; k++) {
        var node = chain[k];
        var sib = state.p.pages.filter(function (p) {
          return (p.parent || '') === (node.parent || '');
        });
        var idx = sib.indexOf(node) + 1;
        prefix = prefix ? prefix + '.' + idx : String(idx);
      }
      return prefix;
    }

    function afterMove (page, message) {
      emitter.emit(ev.CHECK_CHANGED);
      emitter.emit(ev.RENDER);
      emitter.emit(ev.NOTIFY, message + '. No olvides guardar la wiki.', 4000);
    }

    // --- Hide / show sidebar ----------------------------------------------

    function setupSidebarToggle () {
      var sb = document.querySelector('.sb');

      // Button inside the sidebar: hides it when pinned, pins it when hidden
      var hideBtn = sb && sb.querySelector('.fwpm-hide');
      if (sb && !hideBtn) {
        hideBtn = document.createElement('button');
        hideBtn.type = 'button';
        hideBtn.className = 'fwpm-hide';
        hideBtn.addEventListener('click', function () { setHidden(!isHidden()); });
        sb.insertBefore(hideBtn, sb.firstChild);
      }
      if (hideBtn) updateHideLabel();

      // Thin strip on the left edge to bring the menu back
      if (!document.querySelector('.fwpm-edge')) {
        var edge = document.createElement('div');
        edge.className = 'fwpm-edge';
        edge.title = 'Mostrar el menú';
        edge.addEventListener('mouseenter', openPeek);
        edge.addEventListener('click', openPeek);
        root.appendChild(edge);
      }

      // Small handle, useful on touch devices
      if (!document.querySelector('.fwpm-show')) {
        var showBtn = document.createElement('button');
        showBtn.type = 'button';
        showBtn.className = 'fwpm-show';
        showBtn.textContent = '☰';
        showBtn.title = 'Mostrar el menú';
        showBtn.addEventListener('click', togglePeek);
        root.appendChild(showBtn);
      }

      // Close the overlay when the pointer leaves the menu
      if (sb && !sb.dataset.fwpmBound) {
        sb.dataset.fwpmBound = '1';
        sb.addEventListener('mouseenter', cancelClosePeek);
        sb.addEventListener('mouseleave', function () { closePeekSoon(); });
      }

      // A navigation (render) should close the temporary overlay
      if (isHidden()) closePeek();
    }

    function isHidden () { return root.classList.contains('fwpm-hidden'); }
    function setHidden (hidden) {
      root.classList.toggle('fwpm-hidden', !!hidden);
      if (!hidden) closePeek();
      updateHideLabel();
    }
    function openPeek () {
      cancelClosePeek();
      root.classList.add('fwpm-peek');
      updateHideLabel();
    }
    function closePeek () {
      root.classList.remove('fwpm-peek');
      updateHideLabel();
    }
    function updateHideLabel () {
      var b = document.querySelector('.sb .fwpm-hide');
      if (!b) return;
      b.textContent = isHidden() ? '»' : '«';
      b.title = isHidden() ? 'Fijar el menú' : 'Ocultar el menú';
    }
    function togglePeek () {
      if (root.classList.contains('fwpm-peek')) closePeek();
      else openPeek();
    }
    function closePeekSoon () {
      cancelClosePeek();
      peekTimer = setTimeout(closePeek, 250);
    }
    function cancelClosePeek () {
      if (peekTimer) { clearTimeout(peekTimer); peekTimer = null; }
    }

    // --- Zoom (page content only) -----------------------------------------

    function initZoomFromStorage () {
      if (storageReady) return;
      storageReady = true;
      try {
        var w = localStorage.getItem('--fwpm-sb-width');
        if (w) { root.style.setProperty('--fwpm-sb-width', w); baseWidthSet = true; }
        var pz = localStorage.getItem('--fwpm-page-zoom');
        if (pz) root.style.setProperty('--fwpm-page-zoom', pz);
      } catch (e) {}
    }

    function onWheel (e) {
      if (!e.ctrlKey && !e.metaKey) return;
      var t = e.target;
      if (!t || !t.closest) return;
      // Only the page content zooms; the menu keeps its size
      if (!t.closest('main > section')) return;
      e.preventDefault();
      var dir = e.deltaY < 0 ? 1 : -1;
      setPageZoom(getVar('--fwpm-page-zoom', 1) + dir * FWPM.zoomStep);
    }

    function onZoomKey (e) {
      if (!(e.ctrlKey || e.metaKey)) return;
      if (e.key !== '0' && e.code !== 'Digit0' && e.code !== 'Numpad0') return;
      var el = document.elementFromPoint(lastX, lastY);
      if (el && el.closest && el.closest('main > section')) {
        e.preventDefault();
        setPageZoom(1);
      }
    }

    function setPageZoom (z) {
      z = clamp(z, FWPM.pageZoomMin, FWPM.pageZoomMax);
      root.style.setProperty('--fwpm-page-zoom', z.toFixed(2));
      try { localStorage.setItem('--fwpm-page-zoom', z.toFixed(2)); } catch (e) {}
      showBadge('Zoom: ' + Math.round(z * 100) + '%');
    }

    var badgeTimer = null;
    function showBadge (text) {
      var b = document.getElementById('fwpm-zoom-badge');
      if (!b) {
        b = document.createElement('div');
        b.id = 'fwpm-zoom-badge';
        root.appendChild(b);
      }
      b.textContent = text;
      b.classList.add('fwpm-on');
      if (badgeTimer) clearTimeout(badgeTimer);
      badgeTimer = setTimeout(function () { b.classList.remove('fwpm-on'); }, 900);
    }

    function getVar (name, def) {
      var v = root.style.getPropertyValue(name) ||
              getComputedStyle(root).getPropertyValue(name);
      var n = parseFloat(v);
      return isNaN(n) ? def : n;
    }
    function clamp (v, min, max) { return Math.max(min, Math.min(max, v)); }

    // --- Resize the menu with the mouse -----------------------------------

    // Turn the initial percentage width into pixels so the divider position
    // matches the real menu width from the start.
    function ensureBaseWidth () {
      if (baseWidthSet) return;
      if (root.style.getPropertyValue('--fwpm-sb-width')) { baseWidthSet = true; return; }
      var sb = document.querySelector('.sb');
      if (!sb) return;
      var w = Math.round(sb.getBoundingClientRect().width);
      if (w > 0) root.style.setProperty('--fwpm-sb-width', w + 'px');
      baseWidthSet = true;
    }

    function setupResizer () {
      if (document.getElementById('fwpm-resizer')) return;
      var r = document.createElement('div');
      r.id = 'fwpm-resizer';
      r.title = 'Arrastra para cambiar el ancho del menú';
      r.addEventListener('pointerdown', onResizeStart);
      root.appendChild(r);
    }

    function onResizeStart (e) {
      if (e.button !== undefined && e.button !== 0) return;
      e.preventDefault();
      var sb = document.querySelector('.sb');
      if (!sb) return;
      var startX = e.clientX;
      var startW = sb.getBoundingClientRect().width;
      var move = function (ev) {
        var max = window.innerWidth * 0.85;
        var w = clamp(startW + ev.clientX - startX, FWPM.minMenuWidth, max);
        root.style.setProperty('--fwpm-sb-width', Math.round(w) + 'px');
      };
      var up = function () {
        document.removeEventListener('pointermove', move);
        document.removeEventListener('pointerup', up);
        try { localStorage.setItem('--fwpm-sb-width', root.style.getPropertyValue('--fwpm-sb-width')); } catch (err) {}
      };
      document.addEventListener('pointermove', move);
      document.addEventListener('pointerup', up);
    }

    // --- Editor toolbar (heading sizes and clarity) -----------------------

    function clarifyEditorButtons () {
      var numbered = document.querySelector('.ed-bar .ed-btn[title="Number List"]');
      if (numbered && numbered.textContent.trim() === '#') numbered.textContent = '1.';
    }

    // Make sure the editor is spell-checked. The browser decides when to
    // actually run it; this only guarantees it is enabled and, if configured,
    // that the right language/dictionary is used.
    function setupEditorSpellcheck () {
      var areas = document.querySelectorAll('.ed-uc, #md, #html');
      for (var i = 0; i < areas.length; i++) {
        if (areas[i].getAttribute('spellcheck') !== 'true') areas[i].setAttribute('spellcheck', 'true');
        if (FWPM.editorLang && areas[i].getAttribute('lang') !== FWPM.editorLang) {
          areas[i].setAttribute('lang', FWPM.editorLang);
        }
      }
      if (FWPM.editorLang && document.documentElement.getAttribute('lang') !== FWPM.editorLang) {
        document.documentElement.setAttribute('lang', FWPM.editorLang);
      }
    }

    function addEditorSizeButtons () {
      var bar = document.querySelector('.ed-bar');
      if (!bar) return;

      // Label the two existing heading buttons so the whole set is clear
      var h2 = bar.querySelector('.ed-btn[title="Heading"]');
      var h3 = bar.querySelector('.ed-btn[title="Sub-Heading"]');
      if (h2 && h2.textContent.trim() === 'H') h2.textContent = 'H2';
      if (h3 && h3.textContent.trim() === 'H2') h3.textContent = 'H3';

      // Add the missing sizes once (the toolbar is rebuilt on each render)
      if (bar.querySelector('.ed-btn[data-fwpm-size]')) return;
      var h1 = sizeButton('H1', 'Heading 1', '<h1>');
      if (h2) h2.parentNode.insertBefore(h1, h2);
      else bar.appendChild(h1);
      var extra = [
        sizeButton('H4', 'Heading 4', '<h4>'),
        sizeButton('H5', 'Heading 5', '<h5>'),
        sizeButton('H6', 'Heading 6', '<h6>')
      ];
      if (h3) {
        var parent = h3.parentNode;
        var ref = h3.nextSibling;
        for (var i = 0; i < extra.length; i++) parent.insertBefore(extra[i], ref);
      } else {
        for (var j = 0; j < extra.length; j++) bar.appendChild(extra[j]);
      }
    }

    function sizeButton (label, title, tag) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'ed-btn';
      b.setAttribute('data-fwpm-size', '1');
      b.title = title;
      b.textContent = label;
      b.addEventListener('click', function () {
        document.execCommand('formatBlock', false, tag);
        var area = document.querySelector('.ed-uc');
        if (area) area.focus();
      });
      return b;
    }
  });
})();
