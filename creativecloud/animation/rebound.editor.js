/* rebound.editor.js - Rebound Editor (v0.5.1)
   Fixes:
   - Multi-pick no longer gets "stuck" on scope: it prefers deepest element via composedPath + elementsFromPoint
   - Track picking excludes scope element by default (so you can pick within it)
   - Adds a scope frame overlay (shows allowed area)
   - Much thicker hover outline + stronger selected outline/glow
   Keeps:
   - drag + minimize dock
   - hide popup while picking
   - delete animation, upload/download JSON
   - autosave to localStorage + reload
   - JSON hidden by default
   - opaque UI + toolbar wrap
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

  function elLabel(el) {
    if (!el || el.nodeType !== 1) return '';
    const tag = el.tagName.toLowerCase();
    const id = el.id ? `#${el.id}` : '';
    const cls = el.classList && el.classList.length ? '.' + Array.from(el.classList).slice(0, 3).join('.') : '';
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

  // ---------------- Picker (single + multi) ----------------
  const Picker = (() => {
    let overlay, label, help, scopeFrame;
    let active = false;
    let marked = new Set();
    let scopeFrameEl = null;
    let scopeFrameUpdateFn = null;

    const INTERNAL_UI_SELECTOR =
      '.rb-panel, .rb-dock, .rb-pick-overlay, .rb-pick-label, .rb-pick-help, .rb-scope-frame';

    function ensureCss() {
      if (document.getElementById('rb-picker-css')) return;
      const s = document.createElement('style');
      s.id = 'rb-picker-css';
      s.textContent = `
        .rb-scope-frame{
          position: fixed;
          z-index: 2147483645;
          pointer-events: none;
          border: 4px dashed rgba(124,92,255,0.85);
          background: rgba(124,92,255,0.06);
          border-radius: 14px;
          box-shadow: 0 0 0 2px rgba(124,92,255,0.20), 0 18px 55px rgba(0,0,0,0.35);
        }
        .rb-pick-overlay{
          position: fixed;
          z-index: 2147483646;
          pointer-events: none;
          border: 4px solid #5b7cff;
          background: rgba(91,124,255,0.10);
          border-radius: 12px;
          box-shadow: 0 0 0 2px rgba(91,124,255,0.22), 0 14px 35px rgba(91,124,255,0.18);
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
          font-weight: 700;
          max-width: 78vw;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          box-shadow: 0 12px 35px rgba(0,0,0,0.45);
        }
        .rb-pick-help{
          position: fixed;
          z-index: 2147483646;
          left: 50%;
          bottom: 18px;
          transform: translateX(-50%);
          pointer-events: none;
          padding: 9px 12px;
          border-radius: 12px;
          background: #0f111a;
          border: 1px solid #2a2f45;
          color: rgba(245,247,255,0.90);
          font-size: 12px;
          font-weight: 600;
          box-shadow: 0 18px 55px rgba(0,0,0,0.55);
        }
        [data-rb-picked="1"]{
          outline: 5px solid #22c1c3 !important;
          outline-offset: 3px !important;
          box-shadow: 0 0 0 8px rgba(34,193,195,0.20) !important;
        }
      `;
      document.head.appendChild(s);
    }

    function ensure() {
      ensureCss();
      if (!overlay) {
        overlay = h('div', { class: 'rb-pick-overlay' });
        label = h('div', { class: 'rb-pick-label' });
        help = h('div', { class: 'rb-pick-help' });
        document.body.appendChild(overlay);
        document.body.appendChild(label);
        document.body.appendChild(help);

        overlay.style.display = 'none';
        label.style.display = 'none';
        help.style.display = 'none';
      }
    }

    function setBox(el) {
      const r = el.getBoundingClientRect();
      overlay.style.left = `${r.left}px`;
      overlay.style.top = `${r.top}px`;
      overlay.style.width = `${Math.max(0, r.width)}px`;
      overlay.style.height = `${Math.max(0, r.height)}px`;

      label.textContent = elLabel(el);
      label.style.left = `${Math.max(8, Math.min(window.innerWidth - 8, r.left))}px`;
      label.style.top = `${Math.max(8, r.top - 38)}px`;
    }

    function clearMarks() {
      for (const el of marked) {
        try { el.removeAttribute('data-rb-picked'); } catch {}
      }
      marked = new Set();
    }

    function toggleMark(el) {
      if (marked.has(el)) {
        marked.delete(el);
        try { el.removeAttribute('data-rb-picked'); } catch {}
      } else {
        marked.add(el);
        try { el.setAttribute('data-rb-picked', '1'); } catch {}
      }
    }

    function isInternalUi(el, extraIgnoreSelector) {
      if (!el || el.nodeType !== 1) return true;
      if (el.closest(INTERNAL_UI_SELECTOR)) return true;
      if (extraIgnoreSelector && el.closest(extraIgnoreSelector)) return true;
      return false;
    }

    function collectCandidates(e) {
      const out = [];
      const seen = new Set();

      function add(x) {
        if (!x || x.nodeType !== 1) return;
        if (seen.has(x)) return;
        seen.add(x);
        out.push(x);
      }

      // Prefer the real event target (deepest) via composedPath.
      if (e && typeof e.composedPath === 'function') {
        for (const n of e.composedPath()) add(n);
      } else if (e && e.target && e.target.nodeType === 1) {
        add(e.target);
      }

      // Add hit test stack as a fallback / reinforcement.
      const x = e?.clientX ?? 0;
      const y = e?.clientY ?? 0;
      if (document.elementsFromPoint) {
        for (const el of document.elementsFromPoint(x, y)) add(el);
      } else {
        add(document.elementFromPoint(x, y));
      }

      return out;
    }

    function findDeepestDescendantByRect(scopeEl, x, y) {
      // Fallback only (rare): choose smallest descendant whose rect contains point.
      // This is heavier, so we do it only when hit testing fails.
      try {
        const nodes = scopeEl.querySelectorAll('*');
        let best = null;
        let bestArea = Infinity;

        for (const n of nodes) {
          const r = n.getBoundingClientRect();
          if (r.width <= 0 || r.height <= 0) continue;
          if (x < r.left || x > r.right || y < r.top || y > r.bottom) continue;

          const area = r.width * r.height;
          if (area < bestArea) {
            best = n;
            bestArea = area;
          }
        }
        return best;
      } catch {
        return null;
      }
    }

    function getTargetFromEvent(e, { ignoreSelector, predicate, scopeElement }) {
      const candidates = collectCandidates(e);

      for (const el of candidates) {
        if (!el) continue;
        if (isInternalUi(el, ignoreSelector)) continue;
        if (predicate && !predicate(el)) continue;
        return el;
      }

      // If still nothing and we are locked to a scope, try a rect-based fallback.
      if (scopeElement && scopeElement.nodeType === 1) {
        const x = e?.clientX ?? 0;
        const y = e?.clientY ?? 0;
        const deep = findDeepestDescendantByRect(scopeElement, x, y);
        if (deep && !isInternalUi(deep, ignoreSelector) && (!predicate || predicate(deep))) return deep;
      }

      return null;
    }

    function attachScopeFrame(scopeElement) {
      if (!scopeElement || scopeElement.nodeType !== 1) return;

      scopeFrameEl = h('div', { class: 'rb-scope-frame' });
      document.body.appendChild(scopeFrameEl);

      scopeFrameUpdateFn = () => {
        if (!scopeFrameEl || !scopeElement.isConnected) return;
        const r = scopeElement.getBoundingClientRect();
        scopeFrameEl.style.left = `${r.left}px`;
        scopeFrameEl.style.top = `${r.top}px`;
        scopeFrameEl.style.width = `${Math.max(0, r.width)}px`;
        scopeFrameEl.style.height = `${Math.max(0, r.height)}px`;
      };

      scopeFrameUpdateFn();

      window.addEventListener('scroll', scopeFrameUpdateFn, true);
      window.addEventListener('resize', scopeFrameUpdateFn, true);
    }

    function detachScopeFrame() {
      if (scopeFrameUpdateFn) {
        window.removeEventListener('scroll', scopeFrameUpdateFn, true);
        window.removeEventListener('resize', scopeFrameUpdateFn, true);
      }
      scopeFrameUpdateFn = null;

      if (scopeFrameEl) {
        try { scopeFrameEl.remove(); } catch {}
      }
      scopeFrameEl = null;
    }

    function pick({
      ignoreSelector,
      multi = false,
      predicate,
      scopeElement = null,
      onPick,
      onCancel,
    }) {
      ensure();
      if (active) return;
      active = true;
      clearMarks();

      overlay.style.display = 'block';
      label.style.display = 'block';
      help.style.display = 'block';

      if (scopeElement) attachScopeFrame(scopeElement);

      const helpText = () => multi
        ? `Multi-pick: Click to toggle • Enter to finish • Esc to cancel • Selected: ${marked.size}`
        : 'Pick: Click to select • Esc to cancel';

      help.textContent = helpText();

      function move(e) {
        const el = getTargetFromEvent(e, { ignoreSelector, predicate, scopeElement });
        if (!el) return;
        setBox(el);
        help.textContent = helpText();
      }

      function click(e) {
        const el = getTargetFromEvent(e, { ignoreSelector, predicate, scopeElement });
        if (!el) return;

        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation?.();

        if (!multi) {
          cleanup();
          onPick?.(el);
          return;
        }

        toggleMark(el);
        help.textContent = helpText();
      }

      function key(e) {
        if (e.key === 'Escape') {
          cleanup();
          onCancel?.();
          return;
        }
        if (multi && e.key === 'Enter') {
          const out = Array.from(marked);
          cleanup();
          onPick?.(out);
        }
      }

      function cleanup() {
        active = false;
        overlay.style.display = 'none';
        label.style.display = 'none';
        help.style.display = 'none';

        window.removeEventListener('mousemove', move, true);
        window.removeEventListener('click', click, true);
        window.removeEventListener('keydown', key, true);

        detachScopeFrame();
        clearMarks();
      }

      window.addEventListener('mousemove', move, true);
      window.addEventListener('click', click, true);
      window.addEventListener('keydown', key, true);
    }

    return { pick };
  })();

  // ---------------- UI CSS (opaque + pro) ----------------
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
        --rb-danger: #ff5a7a;
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
        letter-spacing: 0.2px;
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

      // Preview current config
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

    _pickWithHide(fnStartPick) {
      const wasVisible = !!this.panel && this.panel.style.display !== 'none';
      if (wasVisible) this.panel.style.display = 'none';
      this._hideDock();

      const restore = () => {
        if (wasVisible) this.panel.style.display = 'block';
      };

      fnStartPick(restore);
    }

    render() {
      this.ensureConfigShape();
      const body = this.bodyEl;
      body.innerHTML = '';

      const anim = this.selectedAnim;

      // Animation section
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
        animSelect,
        h('div', { class: 'rb-col', style: 'margin-top:10px;' }, [
          h('div', { class: 'rb-label', text: 'Animation Name' }),
          animNameInput,
        ]),
      ]));

      // Scope section
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
              multi: false,
              onPick: (el) => {
                let sel = '';
                if (el.id) sel = `#${cssEscape(el.id)}`;
                else if (el.classList && el.classList.length) sel = '.' + Array.from(el.classList).slice(0, 1).map(cssEscape).join('.');
                else sel = makeSelectorWithinRoot(document.body, el).replace(':scope', 'body');

                anim.scopeSelector = sel;
                this._touchChange();
                this.render();
                restore();
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
        h('div', { class: 'rb-muted', text: 'Tip: Track picking is locked to scope and excludes selecting the scope itself.' }),
      ]));

      // Tracks section
      const tracks = Array.isArray(anim.tracks) ? anim.tracks : (anim.tracks = []);
      const list = h('div', { class: 'rb-list' });

      tracks.forEach((t, idx) => {
        list.appendChild(h('div', { class: 'rb-card' }, [
          h('div', { class: 'rb-row', style: 'justify-content:space-between;' }, [
            h('div', { class: 'rb-col', style: 'gap:6px; flex:1; min-width: 260px;' }, [
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

      if (this.editingTrackIndex >= 0 && tracks[this.editingTrackIndex]) {
        body.appendChild(this._renderTrackEditor(anim, tracks[this.editingTrackIndex]));
      }

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
        onClick: () => {
          this.jsonVisible = !this.jsonVisible;
          this.render();
        },
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

    _renderTrackEditor(anim, track) {
      const wrap = h('div', { class: 'rb-section' }, [
        h('div', { class: 'rb-section-title' }, [
          h('div', { text: `Edit Track #${this.editingTrackIndex + 1}` }),
          h('button', { class: 'rb-btn', text: 'Done', onClick: () => { this.editingTrackIndex = -1; this.render(); } }),
        ]),
      ]);

      const targetInput = h('input', {
        class: 'rb-input',
        value: track.targetSelector || '',
        placeholder: 'e.g. .gallery-column or :scope (comma-separated supported)',
        onInput: (e) => { track.targetSelector = e.target.value; this._touchChange(); },
      });

      const withinCb = h('input', {
        type: 'checkbox',
        ...(track.withinScope !== false ? { checked: 'checked' } : {}),
        onChange: (e) => { track.withinScope = !!e.target.checked; this._touchChange(); },
      });

      const pickSingleBtn = h('button', {
        class: 'rb-btn',
        text: 'Pick Element',
        onClick: () => this._pickTrackTarget(anim, track, { multi: false }),
      });

      const pickMultiBtn = h('button', {
        class: 'rb-btn',
        text: 'Pick Multiple',
        onClick: () => this._pickTrackTarget(anim, track, { multi: true }),
      });

      const clearTargetsBtn = h('button', {
        class: 'rb-btn danger',
        text: 'Clear',
        onClick: () => {
          track.targetSelector = '';
          this._touchChange();
          this.render();
        },
      });

      wrap.appendChild(h('div', { class: 'rb-col' }, [
        h('div', { class: 'rb-label', text: 'Target Selector (comma-separated supported)' }),
        targetInput,
        h('div', { class: 'rb-row' }, [pickSingleBtn, pickMultiBtn, clearTargetsBtn]),
        h('div', { class: 'rb-row' }, [
          withinCb,
          h('div', { class: 'rb-muted', text: 'Within scope' }),
        ]),
        h('div', { class: 'rb-muted', text: 'Multi-pick: click to toggle, press Enter to finish.' }),
      ]));

      return wrap;
    }

    _pickTrackTarget(anim, track, { multi }) {
      if (!anim.scopeSelector) return alert('Set scope selector first.');
      const scopeEl = document.querySelector(anim.scopeSelector);
      if (!scopeEl) return alert('Scope selector matched nothing.');

      // ✅ IMPORTANT FIX:
      // Predicate = inside scope AND not the scope itself (so you can pick within).
      const predicate = (el) => el !== scopeEl && scopeEl.contains(el);

      this._pickWithHide((restore) => {
        Picker.pick({
          ignoreSelector: '.rb-panel, .rb-dock',
          multi,
          scopeElement: scopeEl,     // show scope frame overlay
          predicate,
          onPick: (picked) => {
            if (!multi) {
              const el = picked;
              track.targetSelector = makeSelectorWithinRoot(scopeEl, el);
              track.withinScope = true;
              this._touchChange();
              this.render();
              restore();
              return;
            }

            const els = Array.isArray(picked) ? picked : [];
            if (!els.length) { restore(); return; }

            const sels = uniq(els.map((el) => makeSelectorWithinRoot(scopeEl, el)));
            track.targetSelector = sels.join(', ');
            track.withinScope = true;

            this._touchChange();
            this.render();
            restore();
          },
          onCancel: () => restore(),
        });
      });
    }
  }

  RB.Editor = ReboundEditor;
})();
