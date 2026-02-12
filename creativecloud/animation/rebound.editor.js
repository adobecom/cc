/* rebound.editor.js - Rebound Editor (v0.6.2)
   Fix for "popup does not come back":
   - Selection happens on pointerdown (capture) (more reliable than click)
   - While picker is active, click is blocked (capture) to prevent navigation/app handlers
   - restore() is deferred + clamps panel back into viewport
*/
(() => {
  'use strict';

  const RB = (window.Rebound = window.Rebound || {});
  if (!RB.Runtime) console.warn('[ReboundEditor] Load rebound.runtime.js first');

  const DEFAULT_STORAGE_KEY = RB.Runtime?.DEFAULT_STORAGE_KEY || 'rebound:config:v1';
  const UI_STORAGE_KEY = 'rebound:ui:v1';

  // ---------------- Utilities ----------------
  function h(tag, attrs = {}, children = []) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (k === 'class') el.className = v;
      else if (k === 'text') el.textContent = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
      else if (k === 'value') el.value = v;
      else if (v != null) el.setAttribute(k, String(v));
    }
    (Array.isArray(children) ? children : [children]).forEach((c) => {
      if (c == null) return;
      if (typeof c === 'string') el.appendChild(document.createTextNode(c));
      else el.appendChild(c);
    });
    return el;
  }

  function cssEscape(s) {
    if (window.CSS?.escape) return CSS.escape(s);
    return String(s).replace(/[^a-zA-Z0-9_-]/g, '\\$&');
  }

  function safeParseJson(text) {
    try { return JSON.parse(text); } catch { return null; }
  }

  function downloadTextFile(filename, text) {
    const blob = new Blob([text], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function shortElLabel(el) {
    if (!el || el.nodeType !== 1) return '(none)';
    const tag = el.tagName.toLowerCase();
    const id = el.id ? `#${el.id}` : '';
    const cls = el.classList && el.classList.length
      ? '.' + Array.from(el.classList).slice(0, 2).join('.')
      : '';
    return `${tag}${id}${cls}`;
  }

  function makeSelectorWithinRoot(root, el) {
    if (!root || !el) return '';
    if (el === root) return ':scope';

    if (el.id) {
      const sel = `#${cssEscape(el.id)}`;
      try { if (document.querySelectorAll(sel).length === 1) return sel; } catch {}
    }

    const parts = [];
    let cur = el;
    while (cur && cur.nodeType === 1 && cur !== root) {
      const tag = cur.tagName.toLowerCase();
      const parent = cur.parentElement;
      if (!parent) break;

      const idx = Array.from(parent.children).indexOf(cur) + 1;
      const cls = cur.classList && cur.classList.length
        ? '.' + Array.from(cur.classList).slice(0, 2).map(cssEscape).join('.')
        : '';
      parts.unshift(`${tag}${cls}:nth-child(${idx})`);
      cur = parent;
    }
    parts.unshift(':scope');
    return parts.join(' > ');
  }

  function uniq(arr) {
    const out = [];
    const seen = new Set();
    for (const v of arr) {
      const s = String(v || '').trim();
      if (!s || seen.has(s)) continue;
      seen.add(s);
      out.push(s);
    }
    return out;
  }

  function defaultConfig() {
    return {
      version: 1,
      settings: { navHeight: 64 },
      animations: [{ name: 'animation-1', scopeSelector: '', tracks: [] }],
    };
  }

  function newAnimation(name = 'animation') {
    return { name, scopeSelector: '', tracks: [] };
  }

  function newTrack() {
    return {
      targetSelector: '',
      withinScope: true,
      trigger: { type: 'scroll', progress: 'exit', start: 0, end: 100 },
      engine: 'css',
      properties: [{ type: 'translateY', from: 0, to: 100, unit: 'px' }],
    };
  }

  // ---------------- Icons ----------------
  function iconSvg(name) {
    const common = 'width="18" height="18" viewBox="0 0 24 24" fill="none"';
    if (name === 'min') return `<svg ${common}><path d="M6 18h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
    if (name === 'close') return `<svg ${common}><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
    if (name === 'max') return `<svg ${common}><path d="M7 7h10v10H7z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`;
    if (name === 'wand') return `<svg ${common}><path d="M4 20l8-8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M14 4l6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M13 5l6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
    return '';
  }

  // ---------------- DOM Explorer Picker ----------------
  const Picker = (() => {
    let overlay, label, scopeFrame, toolbar, crumbs, status;
    let btnParent, btnPrev, btnNext, btnToggle, btnContinue, btnDone, btnCancel;
    let active = false;

    let mode = 'single'; // 'single' | 'multi'
    let locked = false;
    let current = null;
    let stack = [];
    let stackIndex = 0;
    let selected = new Set();
    let predicate = null;
    let ignoreSelector = '';
    let scopeElement = null;
    let boundaryElement = null;
    let allowPickScope = true;

    const INTERNAL_UI_SEL =
      '.rb-panel, .rb-dock, .rb-pick-overlay, .rb-pick-label, .rb-scope-frame, .rb-pick-toolbar';

    function ensureCss() {
      if (document.getElementById('rb-picker-css')) return;
      const s = document.createElement('style');
      s.id = 'rb-picker-css';
      s.textContent = `
        .rb-scope-frame{
          position: fixed;
          z-index: 2147483645;
          pointer-events: none;
          border: 4px dashed rgba(124,92,255,0.88);
          background: rgba(124,92,255,0.06);
          border-radius: 14px;
          box-shadow: 0 0 0 2px rgba(124,92,255,0.18), 0 18px 55px rgba(0,0,0,0.30);
        }
        .rb-pick-overlay{
          position: fixed;
          z-index: 2147483646;
          pointer-events: none;
          border: 6px solid #5b7cff;
          background: rgba(91,124,255,0.10);
          border-radius: 14px;
          box-shadow:
            0 0 0 3px rgba(91,124,255,0.25),
            0 18px 55px rgba(91,124,255,0.18);
        }
        .rb-pick-label{
          position: fixed;
          z-index: 2147483646;
          pointer-events: none;
          padding: 8px 12px;
          border-radius: 999px;
          background: #0f111a;
          border: 1px solid #2a2f45;
          color: #fff;
          font-size: 12px;
          font-weight: 800;
          max-width: 78vw;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          box-shadow: 0 12px 35px rgba(0,0,0,0.45);
        }
        [data-rb-picked="1"]{
          outline: 6px solid #22c1c3 !important;
          outline-offset: 4px !important;
          box-shadow: 0 0 0 10px rgba(34,193,195,0.20) !important;
        }

        .rb-pick-toolbar{
          position: fixed;
          left: 50%;
          bottom: 16px;
          transform: translateX(-50%);
          z-index: 2147483647;
          width: min(980px, calc(100vw - 24px));
          border-radius: 16px;
          background: #0f111a;
          border: 1px solid #2a2f45;
          box-shadow: 0 18px 55px rgba(0,0,0,0.65);
          color: #f5f7ff;
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
          pointer-events: auto;
          overflow: hidden;
        }
        .rb-pick-toolbar-top{
          display:flex;
          gap: 10px;
          align-items: center;
          justify-content: space-between;
          padding: 10px 12px;
          background: #11152a;
          border-bottom: 1px solid #2a2f45;
        }
        .rb-pick-status{
          font-size: 12px;
          color: rgba(245,247,255,0.82);
          font-weight: 650;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 60%;
        }
        .rb-pick-actions{
          display:flex;
          gap: 8px;
          align-items: center;
          flex-wrap: wrap;
          justify-content: flex-end;
        }
        .rb-pick-btn{
          border: 1px solid #2a2f45;
          background: #0c0f1b;
          color: #f5f7ff;
          padding: 8px 10px;
          border-radius: 12px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 750;
          white-space: nowrap;
        }
        .rb-pick-btn:hover{ filter: brightness(1.08); }
        .rb-pick-btn.primary{
          border-color: rgba(124,92,255,0.65);
          background: linear-gradient(180deg, rgba(124,92,255,0.30), rgba(124,92,255,0.14));
        }
        .rb-pick-btn.danger{
          border-color: rgba(255,90,122,0.65);
          background: linear-gradient(180deg, rgba(255,90,122,0.25), rgba(255,90,122,0.10));
        }

        .rb-pick-crumbs{
          display:flex;
          gap: 6px;
          align-items:center;
          padding: 10px 12px;
          overflow-x: auto;
          background: #0f111a;
        }
        .rb-crumb{
          border: 1px solid #2a2f45;
          background: #0c0f1b;
          color: rgba(245,247,255,0.92);
          padding: 6px 10px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 750;
          cursor: pointer;
          white-space: nowrap;
        }
        .rb-crumb:hover{ filter: brightness(1.08); }
        .rb-crumb.active{
          border-color: rgba(91,124,255,0.85);
          box-shadow: 0 0 0 5px rgba(91,124,255,0.18);
        }
        .rb-crumb-sep{
          color: rgba(245,247,255,0.35);
          font-weight: 800;
          user-select: none;
        }
      `;
      document.head.appendChild(s);
    }

    function ensureDom() {
      ensureCss();
      if (!overlay) {
        overlay = h('div', { class: 'rb-pick-overlay' });
        label = h('div', { class: 'rb-pick-label' });
        scopeFrame = h('div', { class: 'rb-scope-frame' });

        toolbar = h('div', { class: 'rb-pick-toolbar' });
        const top = h('div', { class: 'rb-pick-toolbar-top' });
        status = h('div', { class: 'rb-pick-status', text: '' });
        const actions = h('div', { class: 'rb-pick-actions' });

        btnParent = h('button', { class: 'rb-pick-btn', text: 'Parent (↑)' });
        btnPrev = h('button', { class: 'rb-pick-btn', text: 'Prev (◀)' });
        btnNext = h('button', { class: 'rb-pick-btn', text: 'Next (▶)' });
        btnToggle = h('button', { class: 'rb-pick-btn primary', text: 'Select (Enter)' });
        btnContinue = h('button', { class: 'rb-pick-btn', text: 'Continue' });
        btnDone = h('button', { class: 'rb-pick-btn primary', text: 'Done (Enter)' });
        btnCancel = h('button', { class: 'rb-pick-btn danger', text: 'Cancel (Esc)' });

        actions.append(btnParent, btnPrev, btnNext, btnToggle, btnContinue, btnDone, btnCancel);
        top.append(status, actions);

        crumbs = h('div', { class: 'rb-pick-crumbs' });

        toolbar.append(top, crumbs);

        document.body.appendChild(scopeFrame);
        document.body.appendChild(overlay);
        document.body.appendChild(label);
        document.body.appendChild(toolbar);

        scopeFrame.style.display = 'none';
        overlay.style.display = 'none';
        label.style.display = 'none';
        toolbar.style.display = 'none';
      }
    }

    function isInternalUi(el) {
      if (!el || el.nodeType !== 1) return true;
      if (el.closest(INTERNAL_UI_SEL)) return true;
      if (ignoreSelector && el.closest(ignoreSelector)) return true;
      return false;
    }

    function setScopeFrame() {
      if (!scopeElement || !scopeElement.isConnected) {
        scopeFrame.style.display = 'none';
        return;
      }
      const r = scopeElement.getBoundingClientRect();
      scopeFrame.style.display = 'block';
      scopeFrame.style.left = `${r.left}px`;
      scopeFrame.style.top = `${r.top}px`;
      scopeFrame.style.width = `${Math.max(0, r.width)}px`;
      scopeFrame.style.height = `${Math.max(0, r.height)}px`;
    }

    function setBox(el) {
      if (!el || !el.getBoundingClientRect) return;
      const r = el.getBoundingClientRect();
      overlay.style.left = `${r.left}px`;
      overlay.style.top = `${r.top}px`;
      overlay.style.width = `${Math.max(0, r.width)}px`;
      overlay.style.height = `${Math.max(0, r.height)}px`;
      label.textContent = shortElLabel(el);
      label.style.left = `${Math.max(8, Math.min(window.innerWidth - 8, r.left))}px`;
      label.style.top = `${Math.max(8, r.top - 42)}px`;
    }

    function clearMarks() {
      for (const el of selected) {
        try { el.removeAttribute('data-rb-picked'); } catch {}
      }
      selected = new Set();
    }

    function toggleMark(el) {
      if (!el) return;
      if (selected.has(el)) {
        selected.delete(el);
        try { el.removeAttribute('data-rb-picked'); } catch {}
      } else {
        selected.add(el);
        try { el.setAttribute('data-rb-picked', '1'); } catch {}
      }
    }

    function elementAllowed(el) {
      if (!el || el.nodeType !== 1) return false;
      if (isInternalUi(el)) return false;
      if (predicate && !predicate(el)) return false;
      if (scopeElement && !scopeElement.contains(el)) return false;
      if (!allowPickScope && scopeElement && el === scopeElement) return false;
      return true;
    }

    function buildCandidateStack(e) {
      const out = [];
      const seen = new Set();
      function add(x) {
        if (!x || x.nodeType !== 1) return;
        if (seen.has(x)) return;
        seen.add(x);
        if (elementAllowed(x)) out.push(x);
      }

      // deepest-first
      if (e && typeof e.composedPath === 'function') {
        for (const n of e.composedPath()) add(n);
      } else if (e && e.target && e.target.nodeType === 1) {
        add(e.target);
      }

      const x = e?.clientX ?? 0;
      const y = e?.clientY ?? 0;

      if (document.elementsFromPoint) {
        for (const n of document.elementsFromPoint(x, y)) add(n);
      } else {
        add(document.elementFromPoint(x, y));
      }

      if (scopeElement && out.length) {
        let p = out[0].parentElement;
        while (p && p.nodeType === 1 && scopeElement.contains(p)) {
          add(p);
          p = p.parentElement;
        }
        add(scopeElement);
      }

      return out;
    }

    function buildBreadcrumb(el) {
      const bc = [];
      let cur = el;
      const stopAt = boundaryElement && boundaryElement.nodeType === 1 ? boundaryElement : null;
      while (cur && cur.nodeType === 1) {
        bc.push(cur);
        if (stopAt && cur === stopAt) break;
        if (!stopAt && cur === document.body) break;
        cur = cur.parentElement;
      }
      return bc.reverse();
    }

    function renderBreadcrumb() {
      crumbs.innerHTML = '';
      const bc = current ? buildBreadcrumb(current) : [];
      for (let i = 0; i < bc.length; i++) {
        const el = bc[i];
        const b = h('button', {
          class: 'rb-crumb' + (el === current ? ' active' : ''),
          text: shortElLabel(el),
          onClick: (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            locked = true;
            if (elementAllowed(el)) setCurrent(el);
            updateToolbar();
          },
        });
        crumbs.appendChild(b);
        if (i < bc.length - 1) crumbs.appendChild(h('div', { class: 'rb-crumb-sep', text: '›' }));
      }
    }

    function updateToolbar() {
      const count = selected.size;
      const curLabel = current ? shortElLabel(current) : '(none)';
      const lockHint = locked ? 'LOCKED' : 'HOVER';
      const stackHint = stack.length ? `stack ${stackIndex + 1}/${stack.length}` : 'stack 0/0';

      if (mode === 'single') {
        btnToggle.style.display = 'inline-block';
        btnToggle.textContent = 'Select (Enter)';
        btnContinue.style.display = 'none';
        btnDone.style.display = 'none';
        status.textContent =
          `[${lockHint}] ${curLabel} • ${stackHint} • PointerDown selects • Shift+PointerDown locks • Parent/crumbs • Enter selects • Esc cancels`;
      } else {
        btnToggle.style.display = 'inline-block';
        btnToggle.textContent = selected.has(current) ? `Remove (${count})` : `Add (${count})`;
        btnContinue.style.display = 'inline-block';
        btnDone.style.display = 'inline-block';
        status.textContent =
          `[${lockHint}] ${curLabel} • Selected ${count} • ${stackHint} • PointerDown toggles • Shift+PointerDown locks • Parent/crumbs • Enter done • Esc cancels`;
      }

      renderBreadcrumb();
    }

    function setCurrent(el) {
      if (!el || !elementAllowed(el)) return;
      current = el;
      setBox(el);
      updateToolbar();
    }

    function chooseParent() {
      if (!current) return;
      let p = current.parentElement;
      while (p && p.nodeType === 1) {
        if (elementAllowed(p)) {
          setCurrent(p);
          return;
        }
        p = p.parentElement;
      }
    }

    function cycle(delta) {
      if (!stack || stack.length < 2) return;
      stackIndex = (stackIndex + delta + stack.length) % stack.length;
      const el = stack[stackIndex];
      if (elementAllowed(el)) setCurrent(el);
    }

    function unlock() {
      locked = false;
      stack = [];
      stackIndex = 0;
      updateToolbar();
    }

    function confirmSingle(onPick, cleanup) {
      if (!current) return;
      const el = current;
      cleanup();
      onPick?.(el);
    }

    function doneMulti(onPick, cleanup) {
      const els = Array.from(selected);
      cleanup();
      onPick?.(els);
    }

    function pick({
      ignoreSelector: ign = '',
      mode: m = 'single',
      predicate: pred = null,
      scopeElement: scope = null,
      boundaryElement: boundary = null,
      allowPickScope: allowScope = true,
      onPick,
      onCancel,
    }) {
      ensureDom();
      if (active) return;
      active = true;

      ignoreSelector = ign;
      mode = m;
      predicate = typeof pred === 'function' ? pred : null;
      scopeElement = scope && scope.nodeType === 1 ? scope : null;
      boundaryElement = boundary && boundary.nodeType === 1 ? boundary : (scopeElement || null);
      allowPickScope = allowScope !== false;

      locked = false;
      current = null;
      stack = [];
      stackIndex = 0;
      clearMarks();

      overlay.style.display = 'block';
      label.style.display = 'block';
      toolbar.style.display = 'block';

      if (scopeElement) {
        setScopeFrame();
        scopeFrame.style.display = 'block';
      } else {
        scopeFrame.style.display = 'none';
      }

      updateToolbar();

      btnParent.onclick = (ev) => { ev.preventDefault(); ev.stopPropagation(); locked = true; chooseParent(); };
      btnPrev.onclick = (ev) => { ev.preventDefault(); ev.stopPropagation(); locked = true; cycle(-1); };
      btnNext.onclick = (ev) => { ev.preventDefault(); ev.stopPropagation(); locked = true; cycle(+1); };

      btnToggle.onclick = (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        if (!current) return;
        if (mode === 'single') {
          confirmSingle(onPick, cleanup);
          return;
        }
        toggleMark(current);
        updateToolbar();
      };

      btnContinue.onclick = (ev) => { ev.preventDefault(); ev.stopPropagation(); unlock(); };
      btnDone.onclick = (ev) => { ev.preventDefault(); ev.stopPropagation(); doneMulti(onPick, cleanup); };
      btnCancel.onclick = (ev) => { ev.preventDefault(); ev.stopPropagation(); cleanup(); onCancel?.(); };

      function onMove(e) {
        if (scopeElement) setScopeFrame();
        if (locked) return;
        stack = buildCandidateStack(e);
        stackIndex = 0;
        if (stack.length) setCurrent(stack[0]);
      }

      // ✅ Block click (navigation/app handlers) while picker active
      function blockClick(e) {
        if (e.target && e.target.closest && e.target.closest('.rb-pick-toolbar')) return;
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation?.();
      }

      // ✅ Use POINTERDOWN for selection (more reliable than click)
      function onPointerDownCapture(e) {
        if (e.target && e.target.closest && e.target.closest('.rb-pick-toolbar')) return;
        if (e.target && e.target.closest && e.target.closest(INTERNAL_UI_SEL)) return;

        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation?.();

        stack = buildCandidateStack(e);
        stackIndex = 0;
        const el = stack.length ? stack[0] : null;
        if (!el) return;

        setCurrent(el);

        if (mode === 'single') {
          if (!e.shiftKey) {
            confirmSingle(onPick, cleanup);
            return;
          }
          locked = true;
          updateToolbar();
          return;
        }

        // multi mode
        if (!e.shiftKey) {
          toggleMark(current);
          updateToolbar();
          return;
        }

        locked = true;
        updateToolbar();
      }

      function onKey(e) {
        if (e.key === 'Escape') {
          cleanup();
          onCancel?.();
          return;
        }
        if (e.key === 'ArrowUp') { locked = true; chooseParent(); return; }
        if (e.key === '[') { locked = true; cycle(-1); return; }
        if (e.key === ']') { locked = true; cycle(+1); return; }

        if (mode === 'multi' && e.key === ' ') {
          e.preventDefault();
          if (!current) return;
          toggleMark(current);
          updateToolbar();
          return;
        }

        if (e.key === 'Enter') {
          if (mode === 'single') {
            if (!current) return;
            confirmSingle(onPick, cleanup);
          } else {
            doneMulti(onPick, cleanup);
          }
        }
      }

      function cleanup() {
        active = false;

        overlay.style.display = 'none';
        label.style.display = 'none';
        toolbar.style.display = 'none';
        scopeFrame.style.display = 'none';

        window.removeEventListener('pointermove', onMove, true);
        window.removeEventListener('pointerdown', onPointerDownCapture, true);
        window.removeEventListener('click', blockClick, true);
        window.removeEventListener('keydown', onKey, true);
        window.removeEventListener('scroll', setScopeFrame, true);
        window.removeEventListener('resize', setScopeFrame, true);

        clearMarks();

        ignoreSelector = '';
        predicate = null;
        scopeElement = null;
        boundaryElement = null;
        locked = false;
        current = null;
        stack = [];
        stackIndex = 0;
      }

      window.addEventListener('pointermove', onMove, true);
      window.addEventListener('pointerdown', onPointerDownCapture, { capture: true, passive: false });
      window.addEventListener('click', blockClick, { capture: true, passive: false });
      window.addEventListener('keydown', onKey, true);
      window.addEventListener('scroll', setScopeFrame, true);
      window.addEventListener('resize', setScopeFrame, true);
    }

    return { pick };
  })();

  // ---------------- Editor UI CSS (opaque + pro) ----------------
  function injectCssOnce() {
    if (document.getElementById('rb-editor-css')) return;
    const style = document.createElement('style');
    style.id = 'rb-editor-css';
    style.textContent = `
      :root{
        --rb-bg: #0f111a;
        --rb-bg2: #151a2e;
        --rb-bg3: #0c0f1b;
        --rb-border: #2a2f45;
        --rb-text: #f5f7ff;
        --rb-muted: rgba(245,247,255,0.70);
        --rb-shadow: 0 18px 55px rgba(0,0,0,0.65);
      }

      .rb-panel{
        position: fixed;
        z-index: 2147483647;
        width: 520px;
        max-height: 80vh;
        overflow: hidden;
        border-radius: 16px;
        background: linear-gradient(180deg, var(--rb-bg2), var(--rb-bg));
        border: 1px solid var(--rb-border);
        box-shadow: var(--rb-shadow);
        color: var(--rb-text);
        font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
      }
      .rb-panel *{ box-sizing: border-box; }

      .rb-header{
        display:flex;
        align-items:center;
        justify-content:space-between;
        padding: 10px 12px;
        background: #11152a;
        border-bottom: 1px solid var(--rb-border);
        cursor: grab;
        user-select: none;
      }
      .rb-header:active{ cursor: grabbing; }

      .rb-brand{ display:flex; align-items:center; gap:10px; font-weight: 800; letter-spacing: 0.3px; }
      .rb-badge{
        font-size: 11px;
        padding: 3px 8px;
        border-radius: 999px;
        border: 1px solid var(--rb-border);
        background: var(--rb-bg3);
        color: var(--rb-muted);
      }
      .rb-actions{ display:flex; gap:8px; align-items:center; }

      .rb-iconbtn{
        width: 34px; height: 34px;
        display:flex; align-items:center; justify-content:center;
        border-radius: 12px;
        border: 1px solid var(--rb-border);
        background: var(--rb-bg3);
        color: var(--rb-text);
        cursor: pointer;
      }
      .rb-iconbtn:hover{ filter: brightness(1.08); }
      .rb-iconbtn.danger{ border-color: rgba(255,90,122,0.65); color: #ffd3db; }

      .rb-body{
        overflow:auto;
        max-height: calc(80vh - 58px);
        padding: 12px;
        background: var(--rb-bg);
      }

      .rb-section{
        border: 1px solid var(--rb-border);
        background: #10152a;
        border-radius: 14px;
        padding: 12px;
        margin-bottom: 10px;
      }
      .rb-section-title{
        display:flex;
        align-items:center;
        justify-content:space-between;
        margin-bottom: 10px;
        font-weight: 750;
      }

      .rb-row{ display:flex; gap:10px; align-items:center; flex-wrap: wrap; }
      .rb-col{ display:flex; flex-direction:column; gap:8px; }
      .rb-muted{ color: var(--rb-muted); font-size: 12px; }
      .rb-label{ font-size: 12px; color: var(--rb-muted); }

      .rb-input, .rb-select, .rb-textarea{
        width: 100%;
        padding: 9px 10px;
        border-radius: 12px;
        border: 1px solid var(--rb-border);
        background: var(--rb-bg3);
        color: var(--rb-text);
        outline: none;
      }
      .rb-input:focus, .rb-select:focus, .rb-textarea:focus{
        border-color: rgba(124,92,255,0.70);
        box-shadow: 0 0 0 6px rgba(124,92,255,0.16);
      }
      .rb-textarea{
        min-height: 170px;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-size: 12px;
      }

      .rb-btn{
        border: 1px solid var(--rb-border);
        background: var(--rb-bg3);
        color: var(--rb-text);
        padding: 9px 10px;
        border-radius: 12px;
        cursor: pointer;
        user-select: none;
        white-space: nowrap;
      }
      .rb-btn:hover{ filter: brightness(1.08); }
      .rb-btn.primary{
        border-color: rgba(124,92,255,0.65);
        background: linear-gradient(180deg, rgba(124,92,255,0.35), rgba(124,92,255,0.16));
      }
      .rb-btn.danger{
        border-color: rgba(255,90,122,0.65);
        background: linear-gradient(180deg, rgba(255,90,122,0.25), rgba(255,90,122,0.10));
      }

      .rb-card{
        border: 1px solid var(--rb-border);
        background: var(--rb-bg3);
        border-radius: 12px;
        padding: 10px;
      }
      .rb-list{ display:flex; flex-direction:column; gap:10px; }
      .rb-pill{
        font-size: 11px;
        padding: 3px 8px;
        border-radius: 999px;
        border: 1px solid var(--rb-border);
        background: var(--rb-bg3);
        color: var(--rb-muted);
      }

      .rb-toolbar{
        display:flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;
      }
      .rb-toolbar .rb-btn{ flex: 1 1 160px; }

      .rb-dock{
        position: fixed;
        right: 16px;
        bottom: 16px;
        z-index: 2147483647;
        display:flex;
        align-items:center;
        gap:10px;
        padding: 10px 12px;
        border-radius: 999px;
        background: #11152a;
        border: 1px solid var(--rb-border);
        box-shadow: var(--rb-shadow);
        color: var(--rb-text);
      }
      .rb-dock-title{
        display:flex; align-items:center; gap:8px;
        font-weight: 800;
        letter-spacing: 0.3px;
      }
    `;
    document.head.appendChild(style);
  }

  // ---------------- Editor ----------------
  class ReboundEditor {
    constructor({ openButton, storageKey = DEFAULT_STORAGE_KEY, onSave } = {}) {
      injectCssOnce();

      this.storageKey = storageKey;
      this.onSave = typeof onSave === 'function' ? onSave : null;

      this.config = this._loadConfigFromStorage() || defaultConfig();
      this.selectedAnimIndex = 0;
      this.editingTrackIndex = -1;
      this.jsonVisible = false;

      this.panel = null;
      this.bodyEl = null;
      this.dock = null;

      this._saveTimer = 0;
      this._remountTimer = 0;
      this._badgeEl = null;
      this._badgeText = 'Auto-saved';

      try { RB.Runtime?.mountSingleton?.(this.config); } catch {}

      window.addEventListener('beforeunload', () => {
        try { this._saveConfigToStorageNow(); } catch {}
      });

      const ui = this._loadUiState();
      if (ui?.minimized) this._showDock();

      if (openButton) openButton.addEventListener('click', () => this.open());
    }

    _loadConfigFromStorage() {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return null;
      const parsed = safeParseJson(raw);
      return parsed && typeof parsed === 'object' ? parsed : null;
    }

    _saveConfigToStorageNow() {
      localStorage.setItem(this.storageKey, JSON.stringify(this.config));
      this._setBadge('Saved');
    }

    _scheduleSave() {
      this._setBadge('Saving…');
      clearTimeout(this._saveTimer);
      this._saveTimer = window.setTimeout(() => this._saveConfigToStorageNow(), 180);
    }

    _scheduleRemount() {
      clearTimeout(this._remountTimer);
      this._remountTimer = window.setTimeout(() => {
        try { RB.Runtime?.mountSingleton?.(this.config); } catch {}
      }, 80);
    }

    _touchChange() {
      this._scheduleSave();
      this._scheduleRemount();
    }

    _loadUiState() {
      const raw = localStorage.getItem(UI_STORAGE_KEY);
      return raw ? safeParseJson(raw) : null;
    }

    _saveUiState(state) {
      try { localStorage.setItem(UI_STORAGE_KEY, JSON.stringify(state)); } catch {}
    }

    _setBadge(text) {
      this._badgeText = text;
      if (this._badgeEl) this._badgeEl.textContent = text;
    }

    open() {
      if (!this.panel) {
        this.panel = this._buildPanel();
        document.body.appendChild(this.panel);
        this._restorePanelPosition();
        this.render();
      }
      this.panel.style.display = 'block';
      this.panel.style.visibility = 'visible';
      this.panel.style.pointerEvents = 'auto';
      this._hideDock();
      this._saveUiState({ minimized: false, panelPos: this._getPanelPos() });
    }

    close() {
      if (!this.panel) return;
      this.panel.style.display = 'none';
      this._saveUiState({ minimized: false, panelPos: this._getPanelPos() });
    }

    minimize() {
      if (this.panel) this.panel.style.display = 'none';
      this._showDock();
      this._saveUiState({ minimized: true, panelPos: this._getPanelPos() });
    }

    maximizeFromDock() {
      this._hideDock();
      this.open();
    }

    _buildDock() {
      return h('div', { class: 'rb-dock' }, [
        h('div', { class: 'rb-dock-title', html: `${iconSvg('wand')} Rebound` }),
        h('button', { class: 'rb-iconbtn', title: 'Maximize', html: iconSvg('max'), onClick: () => this.maximizeFromDock() }),
        h('button', { class: 'rb-iconbtn danger', title: 'Close', html: iconSvg('close'), onClick: () => this._hideDock() }),
      ]);
    }

    _showDock() {
      if (!this.dock) {
        this.dock = this._buildDock();
        document.body.appendChild(this.dock);
      }
      this.dock.style.display = 'flex';
    }

    _hideDock() {
      if (!this.dock) return;
      this.dock.style.display = 'none';
    }

    _buildPanel() {
      const panel = h('div', { class: 'rb-panel', style: 'display:none; left: 16px; top: 16px;' });

      const header = h('div', { class: 'rb-header' }, [
        h('div', { class: 'rb-brand' }, [
          h('div', { html: iconSvg('wand') }),
          h('div', { text: 'Rebound' }),
          (this._badgeEl = h('div', { class: 'rb-badge', text: this._badgeText })),
        ]),
        h('div', { class: 'rb-actions' }, [
          h('button', { class: 'rb-iconbtn', title: 'Minimize', html: iconSvg('min'), onClick: () => this.minimize() }),
          h('button', { class: 'rb-iconbtn danger', title: 'Close', html: iconSvg('close'), onClick: () => this.close() }),
        ]),
      ]);

      this.bodyEl = h('div', { class: 'rb-body' });
      panel.appendChild(header);
      panel.appendChild(this.bodyEl);

      this._enableDrag(panel, header);
      return panel;
    }

    _getPanelPos() {
      if (!this.panel) return null;
      return {
        left: parseFloat(this.panel.style.left || '0'),
        top: parseFloat(this.panel.style.top || '0'),
      };
    }

    _restorePanelPosition() {
      const ui = this._loadUiState();
      if (ui?.panelPos && this.panel) {
        this.panel.style.left = `${Math.max(8, ui.panelPos.left || 8)}px`;
        this.panel.style.top = `${Math.max(8, ui.panelPos.top || 8)}px`;
      } else if (this.panel) {
        const w = 520;
        const left = Math.max(16, (window.innerWidth || 1200) - w - 24);
        this.panel.style.left = `${left}px`;
        this.panel.style.top = `16px`;
      }
    }

    _enableDrag(panel, handle) {
      let dragging = false;
      let startX = 0, startY = 0;
      let startLeft = 0, startTop = 0;

      const onPointerDown = (e) => {
        const target = e.target;
        if (target && target.closest && target.closest('.rb-iconbtn')) return;

        dragging = true;
        handle.setPointerCapture?.(e.pointerId);
        startX = e.clientX;
        startY = e.clientY;
        startLeft = parseFloat(panel.style.left || '0');
        startTop = parseFloat(panel.style.top || '0');
      };

      const onPointerMove = (e) => {
        if (!dragging) return;

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        const newLeft = startLeft + dx;
        const newTop = startTop + dy;

        const maxLeft = Math.max(8, (window.innerWidth || 1200) - panel.offsetWidth - 8);
        const maxTop = Math.max(8, (window.innerHeight || 800) - 60);

        panel.style.left = `${Math.max(8, Math.min(maxLeft, newLeft))}px`;
        panel.style.top = `${Math.max(8, Math.min(maxTop, newTop))}px`;
      };

      const onPointerUp = () => {
        if (!dragging) return;
        dragging = false;
        this._saveUiState({ minimized: false, panelPos: this._getPanelPos() });
      };

      handle.addEventListener('pointerdown', onPointerDown);
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
    }

    ensureConfigShape() {
      if (!this.config || typeof this.config !== 'object') this.config = defaultConfig();
      if (!this.config.settings) this.config.settings = { navHeight: 64 };
      if (!Array.isArray(this.config.animations)) this.config.animations = [];
      if (this.config.animations.length === 0) this.config.animations.push(newAnimation('animation-1'));
      if (this.selectedAnimIndex >= this.config.animations.length) this.selectedAnimIndex = 0;
    }

    get selectedAnim() {
      return this.config.animations[this.selectedAnimIndex] || null;
    }

    // ✅ Bulletproof restore: deferred + clamped into viewport
    _pickWithHide(fnStartPick) {
      if (this.panel) this.panel.style.display = 'none';
      this._hideDock();

      let restored = false;

      const restore = () => {
        if (restored) return;
        restored = true;

        setTimeout(() => {
          requestAnimationFrame(() => {
            if (!this.panel) {
              this.open();
              return;
            }
            this.panel.style.display = 'block';
            this.panel.style.visibility = 'visible';
            this.panel.style.pointerEvents = 'auto';
            this._hideDock();

            // clamp back into view (in case it was dragged off-screen)
            const left = parseFloat(this.panel.style.left || '16');
            const top = parseFloat(this.panel.style.top || '16');
            const maxLeft = Math.max(8, (window.innerWidth || 1200) - this.panel.offsetWidth - 8);
            const maxTop = Math.max(8, (window.innerHeight || 800) - 60);
            this.panel.style.left = `${Math.max(8, Math.min(maxLeft, left))}px`;
            this.panel.style.top = `${Math.max(8, Math.min(maxTop, top))}px`;
          });
        }, 0);
      };

      fnStartPick(restore);
    }

    // ---------------- RENDER ----------------
    render() {
      this.ensureConfigShape();
      const body = this.bodyEl;
      body.innerHTML = '';

      const anim = this.selectedAnim;

      const animSelect = h('select', {
        class: 'rb-select',
        onChange: (e) => {
          this.selectedAnimIndex = Number(e.target.value) || 0;
          this.editingTrackIndex = -1;
          this.render();
        },
      });

      this.config.animations.forEach((a, idx) => {
        animSelect.appendChild(h('option', {
          value: String(idx),
          text: a.name || `animation-${idx + 1}`,
          ...(idx === this.selectedAnimIndex ? { selected: 'selected' } : {}),
        }));
      });

      const btnNewAnim = h('button', {
        class: 'rb-btn primary',
        text: 'New Animation',
        onClick: () => {
          const n = this.config.animations.length + 1;
          this.config.animations.push(newAnimation(`animation-${n}`));
          this.selectedAnimIndex = this.config.animations.length - 1;
          this.editingTrackIndex = -1;
          this._touchChange();
          this.render();
        },
      });

      const btnDeleteAnim = h('button', {
        class: 'rb-btn danger',
        text: 'Delete Animation',
        onClick: () => {
          if (this.config.animations.length <= 1) {
            this.config.animations = [newAnimation('animation-1')];
            this.selectedAnimIndex = 0;
          } else {
            this.config.animations.splice(this.selectedAnimIndex, 1);
            this.selectedAnimIndex = Math.max(0, this.selectedAnimIndex - 1);
          }
          this.editingTrackIndex = -1;
          this._touchChange();
          this.render();
        },
      });

      const animNameInput = h('input', {
        class: 'rb-input',
        value: anim.name || '',
        placeholder: 'Animation name',
        onInput: (e) => {
          anim.name = e.target.value;
          this._touchChange();
          this.render();
        },
      });

      body.appendChild(h('div', { class: 'rb-section' }, [
        h('div', { class: 'rb-section-title' }, [
          h('div', { text: 'Animation' }),
          h('div', { class: 'rb-row' }, [btnNewAnim, btnDeleteAnim]),
        ]),
        h('div', { class: 'rb-row' }, [animSelect]),
        h('div', { class: 'rb-col', style: 'margin-top:10px;' }, [
          h('div', { class: 'rb-label', text: 'Animation Name' }),
          animNameInput,
        ]),
      ]));

      const scopeInput = h('input', {
        class: 'rb-input',
        value: anim.scopeSelector || '',
        placeholder: 'e.g. .firefly-model-showcase',
        onInput: (e) => {
          anim.scopeSelector = e.target.value;
          this._touchChange();
        },
      });

      const pickScopeBtn = h('button', {
        class: 'rb-btn',
        text: 'Pick Scope',
        onClick: () => {
          this._pickWithHide((restore) => {
            Picker.pick({
              ignoreSelector: '.rb-panel, .rb-dock',
              mode: 'single',
              predicate: (el) => !!el && el.nodeType === 1,
              scopeElement: null,
              boundaryElement: null,
              allowPickScope: true,
              onPick: (el) => {
                try {
                  let sel = '';
                  if (el === document.documentElement) sel = 'html';
                  else if (el === document.body) sel = 'body';
                  else if (el.id) sel = `#${cssEscape(el.id)}`;
                  else if (el.classList && el.classList.length) sel = '.' + Array.from(el.classList).slice(0, 1).map(cssEscape).join('.');
                  else sel = makeSelectorWithinRoot(document.body, el).replace(':scope', 'body');

                  anim.scopeSelector = sel;
                  this._touchChange();
                  this.render();
                } finally {
                  restore();
                }
              },
              onCancel: () => restore(),
            });
          });
        },
      });

      body.appendChild(h('div', { class: 'rb-section' }, [
        h('div', { class: 'rb-section-title' }, [
          h('div', { text: 'Scope' }),
          h('div', { class: 'rb-pill', text: '--enter/exit auto' }),
        ]),
        h('div', { class: 'rb-row' }, [scopeInput, pickScopeBtn]),
        h('div', { class: 'rb-muted', text: 'Selection is on PointerDown. Shift+PointerDown locks for Parent/breadcrumb traversal.' }),
      ]));

      // Tracks
      const tracks = Array.isArray(anim.tracks) ? anim.tracks : (anim.tracks = []);
      const list = h('div', { class: 'rb-list' });

      tracks.forEach((t, idx) => {
        list.appendChild(h('div', { class: 'rb-card' }, [
          h('div', { class: 'rb-row', style: 'justify-content:space-between;' }, [
            h('div', { class: 'rb-col', style: 'gap:6px; flex:1;' }, [
              h('div', { text: t.targetSelector || '(no selector)' }),
              h('div', { class: 'rb-row' }, [
                h('div', { class: 'rb-pill', text: `trigger: ${t.trigger?.type || 'scroll'}` }),
                (t.trigger?.type === 'scroll')
                  ? h('div', { class: 'rb-pill', text: `${t.trigger.progress || 'exit'} ${t.trigger.start ?? 0}-${t.trigger.end ?? 100}` })
                  : null,
              ].filter(Boolean)),
            ]),
            h('div', { class: 'rb-row' }, [
              h('button', { class: 'rb-btn', text: 'Edit', onClick: () => { this.editingTrackIndex = idx; this.render(); } }),
              h('button', {
                class: 'rb-btn danger',
                text: 'Delete',
                onClick: () => {
                  tracks.splice(idx, 1);
                  if (this.editingTrackIndex === idx) this.editingTrackIndex = -1;
                  this._touchChange();
                  this.render();
                },
              }),
            ]),
          ]),
        ]));
      });

      const addTrackBtn = h('button', {
        class: 'rb-btn primary',
        text: 'Add Track',
        onClick: () => {
          tracks.push(newTrack());
          this.editingTrackIndex = tracks.length - 1;
          this._touchChange();
          this.render();
        },
      });

      body.appendChild(h('div', { class: 'rb-section' }, [
        h('div', { class: 'rb-section-title' }, [
          h('div', { text: 'Tracks' }),
          addTrackBtn,
        ]),
        list,
      ]));

      // Import/Export
      const fileInput = h('input', { type: 'file', accept: 'application/json', style: 'display:none' });
      fileInput.addEventListener('change', async () => {
        const file = fileInput.files && fileInput.files[0];
        if (!file) return;

        const text = await file.text();
        const parsed = safeParseJson(text);
        if (!parsed || typeof parsed !== 'object') {
          alert('Invalid JSON file.');
          return;
        }

        this.config = parsed;
        this.selectedAnimIndex = 0;
        this.editingTrackIndex = -1;
        this._touchChange();
        this.render();
      });

      const btnDownload = h('button', {
        class: 'rb-btn',
        text: 'Download JSON',
        onClick: () => {
          const file = `rebound-config-${new Date().toISOString().slice(0, 10)}.json`;
          downloadTextFile(file, JSON.stringify(this.config, null, 2));
        },
      });

      const btnUpload = h('button', {
        class: 'rb-btn',
        text: 'Upload JSON',
        onClick: () => fileInput.click(),
      });

      const btnToggleJson = h('button', {
        class: 'rb-btn',
        text: this.jsonVisible ? 'Hide JSON' : 'Show JSON',
        onClick: () => { this.jsonVisible = !this.jsonVisible; this.render(); },
      });

      const btnOnSave = h('button', {
        class: 'rb-btn primary',
        text: 'onSave()',
        onClick: () => {
          const text = JSON.stringify(this.config, null, 2);
          this.onSave?.(text, this.config);
          this._setBadge('Saved');
        },
      });

      const jsonBox = h('textarea', { class: 'rb-textarea', readonly: 'readonly' });
      jsonBox.value = JSON.stringify(this.config, null, 2);

      body.appendChild(h('div', { class: 'rb-section' }, [
        h('div', { class: 'rb-section-title' }, [
          h('div', { text: 'Import / Export' }),
          h('div', { class: 'rb-pill', text: 'localStorage' }),
        ]),
        h('div', { class: 'rb-toolbar' }, [btnDownload, btnUpload, btnToggleJson, btnOnSave]),
        fileInput,
        this.jsonVisible ? jsonBox : null,
        h('div', { class: 'rb-muted', text: `Storage key: ${this.storageKey}` }),
      ]));
    }
  }

  RB.Editor = ReboundEditor;
})();
