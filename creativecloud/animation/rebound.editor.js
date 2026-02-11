/* rebound.editor.js - Rebound Editor (v0.5.0)
   Adds:
   - Pick Multiple elements for target selector (comma-separated)
   - Multi-pick: Click to toggle, Enter to finish, Esc to cancel
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
    let overlay, label, help, active = false;
    let marked = new Set();

    function ensureCss() {
      if (document.getElementById('rb-picker-css')) return;
      const s = document.createElement('style');
      s.id = 'rb-picker-css';
      s.textContent = `
        .rb-pick-overlay {
          position: fixed;
          z-index: 2147483646;
          pointer-events: none;
          border: 2px solid #5b7cff;
          background: rgba(91,124,255,0.14);
          border-radius: 10px;
        }
        .rb-pick-label {
          position: fixed;
          z-index: 2147483646;
          pointer-events: none;
          padding: 6px 10px;
          border-radius: 999px;
          background: #0f111a;
          border: 1px solid #2a2f45;
          color: #fff;
          font-size: 12px;
          max-width: 70vw;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .rb-pick-help {
          position: fixed;
          z-index: 2147483646;
          left: 50%;
          bottom: 18px;
          transform: translateX(-50%);
          pointer-events: none;
          padding: 8px 12px;
          border-radius: 12px;
          background: #0f111a;
          border: 1px solid #2a2f45;
          color: rgba(245,247,255,0.85);
          font-size: 12px;
          box-shadow: 0 18px 55px rgba(0,0,0,0.55);
        }
        [data-rb-picked="1"]{
          outline: 2px solid #22c1c3 !important;
          outline-offset: 2px !important;
        }
      `;
      document.head.appendChild(s);
    }

    function ensure() {
      ensureCss();
      if (overlay) return;
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

    function setBox(el) {
      const r = el.getBoundingClientRect();
      overlay.style.left = `${r.left}px`;
      overlay.style.top = `${r.top}px`;
      overlay.style.width = `${r.width}px`;
      overlay.style.height = `${r.height}px`;

      label.textContent = elLabel(el);
      label.style.left = `${Math.max(8, r.left)}px`;
      label.style.top = `${Math.max(8, r.top - 34)}px`;
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

    function pick({ ignoreSelector, multi = false, predicate, onPick, onCancel }) {
      ensure();
      if (active) return;
      active = true;
      clearMarks();

      overlay.style.display = 'block';
      label.style.display = 'block';
      help.style.display = 'block';
      help.textContent = multi
        ? 'Multi-pick: Click to toggle • Enter to finish • Esc to cancel'
        : 'Pick: Click to select • Esc to cancel';

      function getTargetFromPoint(x, y) {
        const el = document.elementFromPoint(x, y);
        if (!el) return null;
        if (ignoreSelector && el.closest && el.closest(ignoreSelector)) return null;
        if (predicate && !predicate(el)) return null;
        return el;
      }

      function move(e) {
        const el = getTargetFromPoint(e.clientX, e.clientY);
        if (!el) return;
        setBox(el);
        if (multi) help.textContent = `Selected: ${marked.size} • Click to toggle • Enter to finish • Esc to cancel`;
      }

      function click(e) {
        const el = getTargetFromPoint(e.clientX, e.clientY);
        if (!el) return;

        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation?.();

        if (!multi) {
          cleanup();
          onPick?.(el);
          return;
        }

        // multi: toggle selection and stay in picker
        toggleMark(el);
        help.textContent = `Selected: ${marked.size} • Click to toggle • Enter to finish • Esc to cancel`;
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

      /* Import/Export toolbar */
      .rb-toolbar{
        display:flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;
      }
      .rb-toolbar .rb-btn{
        flex: 1 1 160px;
      }

      /* Minimized dock */
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
    constructor({
      openButton,
      storageKey = DEFAULT_STORAGE_KEY,
      onSave,
    } = {}) {
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

      // Flush save on reload (removing mode=rebound causes reload)
      window.addEventListener('beforeunload', () => {
        try { this._saveConfigToStorageNow(); } catch {}
      });

      const ui = this._loadUiState();
      if (ui?.minimized) this._showDock();

      if (openButton) openButton.addEventListener('click', () => this.open());
    }

    // ---------- Storage ----------
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

    // ---------- UI ----------
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
      const left = parseFloat(this.panel.style.left || '0');
      const top = parseFloat(this.panel.style.top || '0');
      return { left, top };
    }

    _restorePanelPosition() {
      const state = this._loadUiState();
      if (state?.panelPos && this.panel) {
        this.panel.style.left = `${Math.max(8, state.panelPos.left || 8)}px`;
        this.panel.style.top = `${Math.max(8, state.panelPos.top || 8)}px`;
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

    // ---------- Data helpers ----------
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

    // ---------- Rendering ----------
    render() {
      this.ensureConfigShape();
      const body = this.bodyEl;
      body.innerHTML = '';

      const anim = this.selectedAnim;

      // -------- Animation section --------
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

      // -------- Scope section --------
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
        h('div', { class: 'rb-muted', text: 'Tip: multiple animations can share the same scope safely.' }),
      ]));

      // -------- Tracks section --------
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
              h('button', {
                class: 'rb-btn',
                text: 'Edit',
                onClick: () => {
                  this.editingTrackIndex = idx;
                  this.render();
                },
              }),
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

      // -------- Import / Export (JSON hidden by default) --------
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

      // Target selector + pick
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
        h('div', { class: 'rb-muted', text: 'Multi-pick creates a selector list like “:scope > …, :scope > …”.' }),
      ]));

      // Trigger select
      const triggerTypeSelect = h('select', {
        class: 'rb-select',
        onChange: (e) => {
          const type = e.target.value;

          if (type === 'scroll') { track.trigger = { type: 'scroll', progress: 'exit', start: 0, end: 100 }; track.engine = 'css'; }
          if (type === 'hover') { track.trigger = { type: 'hover', duration: 350, easing: 'easeInOutCubic' }; track.engine = 'js'; }
          if (type === 'click') { track.trigger = { type: 'click', duration: 350, easing: 'easeInOutCubic' }; track.engine = 'js'; }
          if (type === 'view')  { track.trigger = { type: 'view', duration: 450, easing: 'easeInOutCubic', once: false, reverseOnExit: true }; track.engine = 'js'; }

          this._touchChange();
          this.render();
        },
      }, [
        h('option', { value: 'scroll', text: 'scroll / parallax (CSS progress)', ...(track.trigger?.type === 'scroll' ? { selected: 'selected' } : {}) }),
        h('option', { value: 'hover', text: 'on hover', ...(track.trigger?.type === 'hover' ? { selected: 'selected' } : {}) }),
        h('option', { value: 'click', text: 'on click', ...(track.trigger?.type === 'click' ? { selected: 'selected' } : {}) }),
        h('option', { value: 'view',  text: 'on view enter', ...(track.trigger?.type === 'view' ? { selected: 'selected' } : {}) }),
      ]);

      wrap.appendChild(h('div', { class: 'rb-col', style: 'margin-top:12px;' }, [
        h('div', { class: 'rb-label', text: 'Trigger' }),
        triggerTypeSelect,
      ]));

      wrap.appendChild(this._renderTriggerDetails(track));
      wrap.appendChild(this._renderPropertiesEditor(track));

      return wrap;
    }

    _pickTrackTarget(anim, track, { multi }) {
      if (!anim.scopeSelector) return alert('Set scope selector first.');
      const scopeEl = document.querySelector(anim.scopeSelector);
      if (!scopeEl) return alert('Scope selector matched nothing.');

      // Only allow picking inside this scope
      const predicate = (el) => el === scopeEl || scopeEl.contains(el);

      this._pickWithHide((restore) => {
        Picker.pick({
          ignoreSelector: '.rb-panel, .rb-dock',
          multi,
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
            if (!els.length) {
              restore();
              return;
            }

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

    _renderTriggerDetails(track) {
      const trig = track.trigger || {};
      const box = h('div', { class: 'rb-card', style: 'margin-top:12px;' });

      if (trig.type === 'scroll') {
        const progressSel = h('select', {
          class: 'rb-select',
          onChange: (e) => { trig.progress = e.target.value; this._touchChange(); },
        }, [
          h('option', { value: 'exit', text: 'exit progress', ...(trig.progress !== 'enter' ? { selected: 'selected' } : {}) }),
          h('option', { value: 'enter', text: 'enter progress', ...(trig.progress === 'enter' ? { selected: 'selected' } : {}) }),
        ]);

        const startIn = h('input', {
          class: 'rb-input', type: 'number', value: String(trig.start ?? 0),
          onInput: (e) => { trig.start = Number(e.target.value) || 0; this._touchChange(); },
        });

        const endIn = h('input', {
          class: 'rb-input', type: 'number', value: String(trig.end ?? 100),
          onInput: (e) => { trig.end = Number(e.target.value) || 100; this._touchChange(); },
        });

        box.appendChild(h('div', { class: 'rb-row' }, [
          h('div', { class: 'rb-col', style: 'flex:1; min-width: 140px;' }, [h('div', { class: 'rb-label', text: 'progress' }), progressSel]),
          h('div', { class: 'rb-col', style: 'flex:1; min-width: 120px;' }, [h('div', { class: 'rb-label', text: 'start %' }), startIn]),
          h('div', { class: 'rb-col', style: 'flex:1; min-width: 120px;' }, [h('div', { class: 'rb-label', text: 'end %' }), endIn]),
        ]));

        box.appendChild(h('div', { class: 'rb-muted', style: 'margin-top:8px;' }, [
          'Progress vars are automatic. CSS uses var(--enter/exit-progress, 0) until first scroll.',
        ]));
      }

      if (trig.type === 'hover' || trig.type === 'click' || trig.type === 'view') {
        const dur = h('input', {
          class: 'rb-input', type: 'number', value: String(trig.duration ?? 350),
          onInput: (e) => { trig.duration = Number(e.target.value) || 0; this._touchChange(); },
        });

        const easing = h('select', {
          class: 'rb-select',
          onChange: (e) => { trig.easing = e.target.value; this._touchChange(); },
        }, [
          h('option', { value: 'easeInOutCubic', text: 'easeInOutCubic', ...(trig.easing !== 'linear' ? { selected: 'selected' } : {}) }),
          h('option', { value: 'linear', text: 'linear', ...(trig.easing === 'linear' ? { selected: 'selected' } : {}) }),
        ]);

        box.appendChild(h('div', { class: 'rb-row' }, [
          h('div', { class: 'rb-col', style: 'flex:1; min-width: 160px;' }, [h('div', { class: 'rb-label', text: 'duration (ms)' }), dur]),
          h('div', { class: 'rb-col', style: 'flex:1; min-width: 160px;' }, [h('div', { class: 'rb-label', text: 'easing' }), easing]),
        ]));

        if (trig.type === 'view') {
          const once = h('input', {
            type: 'checkbox', ...(trig.once ? { checked: 'checked' } : {}),
            onChange: (e) => { trig.once = !!e.target.checked; this._touchChange(); },
          });
          const reverse = h('input', {
            type: 'checkbox', ...(trig.reverseOnExit !== false ? { checked: 'checked' } : {}),
            onChange: (e) => { trig.reverseOnExit = !!e.target.checked; this._touchChange(); },
          });
          box.appendChild(h('div', { class: 'rb-row', style: 'margin-top:10px;' }, [
            once, h('div', { class: 'rb-muted', text: 'play once' }),
            reverse, h('div', { class: 'rb-muted', text: 'reverse on exit' }),
          ]));
        }
      }

      return box;
    }

    _renderPropertiesEditor(track) {
      const props = Array.isArray(track.properties) ? track.properties : (track.properties = []);
      const box = h('div', { class: 'rb-card', style: 'margin-top:12px;' });

      const addBtn = h('button', {
        class: 'rb-btn primary',
        text: 'Add Property',
        onClick: () => {
          props.push({ type: 'opacity', from: 1, to: 0 });
          this._touchChange();
          this.render();
        },
      });

      box.appendChild(h('div', { class: 'rb-row', style: 'justify-content:space-between; align-items:center; margin-bottom:10px;' }, [
        h('div', { text: 'Properties', style: 'font-weight:750;' }),
        addBtn,
      ]));

      const list = h('div', { class: 'rb-list' });

      const unitPick = (p) => h('select', {
        class: 'rb-select',
        onChange: (e) => { p.unit = e.target.value; this._touchChange(); },
      }, [
        h('option', { value: 'px', text: 'px', ...(p.unit === 'px' ? { selected: 'selected' } : {}) }),
        h('option', { value: '%', text: '%', ...(p.unit === '%' ? { selected: 'selected' } : {}) }),
        h('option', { value: 'deg', text: 'deg', ...(p.unit === 'deg' ? { selected: 'selected' } : {}) }),
        h('option', { value: '', text: '(none)', ...(!p.unit ? { selected: 'selected' } : {}) }),
      ]);

      const num = (p, label, key) => h('div', { class: 'rb-col', style: 'flex:1; min-width: 120px;' }, [
        h('div', { class: 'rb-label', text: label }),
        h('input', {
          class: 'rb-input', type: 'number',
          value: String(p[key] ?? 0),
          onInput: (e) => { p[key] = Number(e.target.value) || 0; this._touchChange(); },
        }),
      ]);

      props.forEach((p, idx) => {
        const typeSel = h('select', {
          class: 'rb-select',
          onChange: (e) => {
            const t = e.target.value;
            if (t === 'opacity') props[idx] = { type: 'opacity', from: 1, to: 0 };
            if (t === 'translateY') props[idx] = { type: 'translateY', from: 0, to: 100, unit: 'px' };
            if (t === 'translateX') props[idx] = { type: 'translateX', from: 0, to: 100, unit: 'px' };
            if (t === 'rotate') props[idx] = { type: 'rotate', from: 0, to: 30, unit: 'deg' };
            if (t === 'scale') props[idx] = { type: 'scale', from: 1, to: 1.1 };
            if (t === 'parallaxY') props[idx] = { type: 'parallaxY', base: 0, distance: 100, unit: 'px' };
            this._touchChange();
            this.render();
          },
        }, [
          h('option', { value: 'opacity', text: 'opacity', ...(p.type === 'opacity' ? { selected: 'selected' } : {}) }),
          h('option', { value: 'translateY', text: 'translateY', ...(p.type === 'translateY' ? { selected: 'selected' } : {}) }),
          h('option', { value: 'translateX', text: 'translateX', ...(p.type === 'translateX' ? { selected: 'selected' } : {}) }),
          h('option', { value: 'rotate', text: 'rotate', ...(p.type === 'rotate' ? { selected: 'selected' } : {}) }),
          h('option', { value: 'scale', text: 'scale', ...(p.type === 'scale' ? { selected: 'selected' } : {}) }),
          h('option', { value: 'parallaxY', text: 'parallaxY (base+distance)', ...(p.type === 'parallaxY' ? { selected: 'selected' } : {}) }),
        ]);

        const rm = h('button', {
          class: 'rb-btn danger',
          text: 'Remove',
          onClick: () => {
            props.splice(idx, 1);
            this._touchChange();
            this.render();
          },
        });

        const card = h('div', { class: 'rb-card' }, [
          h('div', { class: 'rb-row' }, [typeSel, rm]),
        ]);

        const controls = h('div', { class: 'rb-col', style: 'margin-top:10px;' });

        if (p.type === 'opacity' || p.type === 'scale') {
          controls.appendChild(h('div', { class: 'rb-row' }, [
            num(p, 'from', 'from'),
            num(p, 'to', 'to'),
          ]));
        } else if (p.type === 'translateX' || p.type === 'translateY' || p.type === 'rotate') {
          controls.appendChild(h('div', { class: 'rb-row' }, [
            num(p, 'from', 'from'),
            num(p, 'to', 'to'),
            h('div', { class: 'rb-col', style: 'flex:1; min-width: 120px;' }, [
              h('div', { class: 'rb-label', text: 'unit' }),
              unitPick(p),
            ]),
          ]));
        } else if (p.type === 'parallaxY') {
          controls.appendChild(h('div', { class: 'rb-row' }, [
            num(p, 'base', 'base'),
            num(p, 'distance', 'distance'),
            h('div', { class: 'rb-col', style: 'flex:1; min-width: 120px;' }, [
              h('div', { class: 'rb-label', text: 'unit' }),
              unitPick(p),
            ]),
          ]));
          controls.appendChild(h('div', { class: 'rb-muted' }, [
            'Sets --base-offset and --parallax-distance on each matched target element.',
          ]));
        }

        card.appendChild(controls);
        list.appendChild(card);
      });

      box.appendChild(list);
      return box;
    }
  }

  RB.Editor = ReboundEditor;
})();
