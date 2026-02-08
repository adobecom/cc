/* rebound.editor.js - Rebound authoring UI (vanilla JS, no HTML) */
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
    if (window.CSS && typeof window.CSS.escape === 'function') return window.CSS.escape(s);
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

  // ---------------- Icon SVG ----------------
  function iconSvg(name) {
    // simple inline icons
    const common = 'width="18" height="18" viewBox="0 0 24 24" fill="none"';
    if (name === 'min') return `<svg ${common}><path d="M6 18h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
    if (name === 'close') return `<svg ${common}><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
    if (name === 'max') return `<svg ${common}><path d="M7 7h10v10H7z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`;
    if (name === 'download') return `<svg ${common}><path d="M12 3v10m0 0l4-4m-4 4l-4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 21h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
    if (name === 'upload') return `<svg ${common}><path d="M12 21V11m0 0l4 4m-4-4l-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 3h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
    if (name === 'wand') return `<svg ${common}><path d="M4 20l8-8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M14 4l6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M13 5l6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
    return '';
  }

  // ---------------- Picker ----------------
  const Picker = (() => {
    let overlay, label, active = false;

    function ensureCss() {
      if (document.getElementById('rb-picker-css')) return;
      const s = document.createElement('style');
      s.id = 'rb-picker-css';
      s.textContent = `
        .rb-pick-overlay {
          position: fixed;
          z-index: 2147483646;
          pointer-events: none;
          border: 2px solid rgba(34, 193, 195, 0.95);
          background: rgba(34, 193, 195, 0.18);
          border-radius: 10px;
          box-shadow: 0 0 0 6px rgba(124,92,255,0.12);
        }
        .rb-pick-label {
          position: fixed;
          z-index: 2147483646;
          pointer-events: none;
          padding: 6px 10px;
          border-radius: 999px;
          background: rgba(10,12,18,0.85);
          border: 1px solid rgba(255,255,255,0.12);
          backdrop-filter: blur(10px);
          color: #fff;
          font-size: 12px;
          max-width: 70vw;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      `;
      document.head.appendChild(s);
    }

    function ensure() {
      ensureCss();
      if (overlay) return;
      overlay = h('div', { class: 'rb-pick-overlay' });
      label = h('div', { class: 'rb-pick-label' });
      document.body.appendChild(overlay);
      document.body.appendChild(label);
      overlay.style.display = 'none';
      label.style.display = 'none';
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

    function pick({ ignoreSelector, onPick, onCancel }) {
      ensure();
      if (active) return;
      active = true;

      overlay.style.display = 'block';
      label.style.display = 'block';

      function move(e) {
        const el = document.elementFromPoint(e.clientX, e.clientY);
        if (!el) return;
        if (ignoreSelector && el.closest && el.closest(ignoreSelector)) return;
        if (el.classList && (el.classList.contains('rb-pick-overlay') || el.classList.contains('rb-pick-label'))) return;
        setBox(el);
      }

      function click(e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation?.();

        const el = document.elementFromPoint(e.clientX, e.clientY);
        if (!el) return;
        if (ignoreSelector && el.closest && el.closest(ignoreSelector)) return;

        cleanup();
        onPick?.(el);
      }

      function key(e) {
        if (e.key === 'Escape') {
          cleanup();
          onCancel?.();
        }
      }

      function cleanup() {
        active = false;
        overlay.style.display = 'none';
        label.style.display = 'none';
        window.removeEventListener('mousemove', move, true);
        window.removeEventListener('click', click, true);
        window.removeEventListener('keydown', key, true);
      }

      window.addEventListener('mousemove', move, true);
      window.addEventListener('click', click, true);
      window.addEventListener('keydown', key, true);
    }

    return { pick };
  })();

  // ---------------- UI CSS ----------------
  function injectCssOnce() {
    if (document.getElementById('rb-editor-css')) return;
    const style = document.createElement('style');
    style.id = 'rb-editor-css';
    style.textContent = `
      :root{
        --rb-bg: rgba(12,14,22,0.78);
        --rb-bg2: rgba(16,18,28,0.88);
        --rb-border: rgba(255,255,255,0.12);
        --rb-text: rgba(245,247,255,0.92);
        --rb-muted: rgba(245,247,255,0.68);
        --rb-accent: #7c5cff;
        --rb-accent2: #22c1c3;
        --rb-danger: #ff5a7a;
        --rb-shadow: 0 18px 55px rgba(0,0,0,0.55);
      }

      .rb-panel{
        position: fixed;
        z-index: 2147483647;
        width: 480px;
        max-height: 80vh;
        overflow: hidden;
        border-radius: 18px;
        background: linear-gradient(180deg, rgba(124,92,255,0.14), rgba(34,193,195,0.08)) , var(--rb-bg);
        border: 1px solid var(--rb-border);
        box-shadow: var(--rb-shadow);
        backdrop-filter: blur(14px);
        color: var(--rb-text);
        font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
        transform: translateZ(0);
      }
      .rb-panel *{ box-sizing: border-box; }
      .rb-header{
        display:flex;
        align-items:center;
        justify-content:space-between;
        padding: 10px 12px;
        background: radial-gradient(1200px 120px at 0% 0%, rgba(124,92,255,0.55), transparent),
                    radial-gradient(1200px 120px at 100% 0%, rgba(34,193,195,0.45), transparent),
                    rgba(10,12,18,0.55);
        border-bottom: 1px solid rgba(255,255,255,0.10);
        cursor: grab;
        user-select: none;
      }
      .rb-header:active{ cursor: grabbing; }
      .rb-brand{
        display:flex;
        align-items:center;
        gap:10px;
        font-weight: 800;
        letter-spacing: 0.35px;
      }
      .rb-badge{
        font-size: 11px;
        padding: 3px 8px;
        border-radius: 999px;
        border: 1px solid rgba(255,255,255,0.14);
        background: rgba(255,255,255,0.06);
        color: var(--rb-muted);
      }
      .rb-actions{ display:flex; gap:8px; align-items:center; }
      .rb-iconbtn{
        width: 34px; height: 34px;
        display:flex; align-items:center; justify-content:center;
        border-radius: 12px;
        border: 1px solid rgba(255,255,255,0.14);
        background: rgba(255,255,255,0.06);
        color: rgba(255,255,255,0.9);
        cursor: pointer;
        transition: transform 120ms ease, background 120ms ease;
      }
      .rb-iconbtn:hover{ transform: translateY(-1px); background: rgba(255,255,255,0.10); }
      .rb-iconbtn.danger{ border-color: rgba(255,90,122,0.35); color: #ffd3db; }
      .rb-body{
        overflow:auto;
        max-height: calc(80vh - 58px);
        padding: 12px;
      }

      .rb-section{
        border: 1px solid rgba(255,255,255,0.10);
        background: linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.03));
        border-radius: 16px;
        padding: 12px;
        margin-bottom: 10px;
      }
      .rb-section-title{
        display:flex;
        align-items:center;
        justify-content:space-between;
        margin-bottom: 10px;
        font-weight: 700;
        letter-spacing: 0.2px;
      }
      .rb-row{ display:flex; gap:10px; align-items:center; }
      .rb-col{ display:flex; flex-direction:column; gap:8px; }
      .rb-muted{ color: var(--rb-muted); font-size: 12px; }
      .rb-label{ font-size: 12px; color: var(--rb-muted); }

      .rb-input, .rb-select, .rb-textarea{
        width: 100%;
        padding: 9px 10px;
        border-radius: 12px;
        border: 1px solid rgba(255,255,255,0.14);
        background: rgba(10,12,18,0.35);
        color: var(--rb-text);
        outline: none;
      }
      .rb-input:focus, .rb-select:focus, .rb-textarea:focus{
        border-color: rgba(124,92,255,0.55);
        box-shadow: 0 0 0 6px rgba(124,92,255,0.14);
      }
      .rb-textarea{
        min-height: 170px;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-size: 12px;
      }

      .rb-btn{
        border: 1px solid rgba(255,255,255,0.14);
        background: rgba(255,255,255,0.06);
        color: var(--rb-text);
        padding: 9px 10px;
        border-radius: 12px;
        cursor: pointer;
        transition: transform 120ms ease, background 120ms ease, border-color 120ms ease;
        user-select: none;
        white-space: nowrap;
      }
      .rb-btn:hover{
        transform: translateY(-1px);
        background: rgba(255,255,255,0.10);
        border-color: rgba(255,255,255,0.20);
      }
      .rb-btn.primary{
        border: 1px solid rgba(124,92,255,0.45);
        background: linear-gradient(180deg, rgba(124,92,255,0.35), rgba(124,92,255,0.12));
      }
      .rb-btn.danger{
        border: 1px solid rgba(255,90,122,0.45);
        background: linear-gradient(180deg, rgba(255,90,122,0.25), rgba(255,90,122,0.08));
      }

      .rb-card{
        border: 1px solid rgba(255,255,255,0.10);
        background: rgba(10,12,18,0.28);
        border-radius: 14px;
        padding: 10px;
      }
      .rb-list{ display:flex; flex-direction:column; gap:10px; }
      .rb-pill{
        font-size: 11px;
        padding: 3px 8px;
        border-radius: 999px;
        border: 1px solid rgba(255,255,255,0.14);
        background: rgba(255,255,255,0.06);
        color: var(--rb-muted);
      }

      /* Dock (minimized) */
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
        background: linear-gradient(180deg, rgba(124,92,255,0.25), rgba(34,193,195,0.12)), rgba(10,12,18,0.75);
        border: 1px solid rgba(255,255,255,0.14);
        box-shadow: 0 16px 50px rgba(0,0,0,0.55);
        backdrop-filter: blur(14px);
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
      autoMount = true,
      onSave,
    } = {}) {
      injectCssOnce();

      this.storageKey = storageKey;
      this.autoMount = autoMount !== false;
      this.onSave = typeof onSave === 'function' ? onSave : null;

      // load config from storage
      this.config = this._loadConfigFromStorage() || defaultConfig();
      this.selectedAnimIndex = 0;
      this.editingTrackIndex = -1;

      this.panel = null;
      this.bodyEl = null;
      this.dock = null;

      this._runtimeController = null;

      // Debounced persistence/remount
      this._saveTimer = 0;
      this._remountTimer = 0;
      this._savedBadgeText = 'Auto-saved';

      if (this.autoMount && RB.Runtime?.mount) this._remountRuntimeNow();

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
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(this.config));
        this._setBadge('Saved');
      } catch (e) {
        console.warn('[Rebound] Failed saving to storage:', e);
        this._setBadge('Save error');
      }
    }

    _scheduleSave() {
      this._setBadge('Saving…');
      clearTimeout(this._saveTimer);
      this._saveTimer = window.setTimeout(() => this._saveConfigToStorageNow(), 220);
    }

    _loadUiState() {
      const raw = localStorage.getItem(UI_STORAGE_KEY);
      const parsed = raw ? safeParseJson(raw) : null;
      if (!parsed || typeof parsed !== 'object') return null;
      return parsed;
    }

    _saveUiState(state) {
      try { localStorage.setItem(UI_STORAGE_KEY, JSON.stringify(state)); } catch {}
    }

    // ---------- Runtime mount ----------
    _remountRuntimeNow() {
      if (!RB.Runtime?.mount) return;
      try {
        if (this._runtimeController) this._runtimeController.destroy();
      } catch {}
      try {
        this._runtimeController = RB.Runtime.mount(this.config);
      } catch (e) {
        console.warn('[Rebound] Runtime mount failed:', e);
      }
    }

    _scheduleRemountRuntime() {
      if (!this.autoMount) return;
      clearTimeout(this._remountTimer);
      this._remountTimer = window.setTimeout(() => this._remountRuntimeNow(), 120);
    }

    _touchChange() {
      this._scheduleSave();
      this._scheduleRemountRuntime();
    }

    // ---------- UI ----------
    _setBadge(text) {
      this._savedBadgeText = text;
      if (this._badgeEl) this._badgeEl.textContent = text;
    }

    open() {
      if (!this.panel) {
        this.panel = this._buildPanel();
        document.body.appendChild(this.panel);
        this._restorePanelPosition();
        this.render();
      }
      this._showPanel();
    }

    close() {
      // “close” hides panel; user can reopen via host button
      this._hidePanel();
    }

    minimize() {
      this._hidePanel();
      this._showDock();
      this._saveUiState({ minimized: true, panelPos: this._getPanelPos() });
    }

    maximizeFromDock() {
      this._hideDock();
      this._showPanel();
      this._saveUiState({ minimized: false, panelPos: this._getPanelPos() });
    }

    _showPanel() {
      if (!this.panel) return;
      this.panel.style.display = 'block';
      this._hideDock();
      this._saveUiState({ minimized: false, panelPos: this._getPanelPos() });
    }

    _hidePanel() {
      if (!this.panel) return;
      this.panel.style.display = 'none';
      this._saveUiState({ minimized: true, panelPos: this._getPanelPos() });
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

    _buildDock() {
      const dock = h('div', { class: 'rb-dock' }, [
        h('div', { class: 'rb-dock-title', html: `${iconSvg('wand')} Rebound` }),
        h('button', { class: 'rb-iconbtn', title: 'Maximize', html: iconSvg('max'), onClick: () => this.maximizeFromDock() }),
        h('button', {
          class: 'rb-iconbtn danger',
          title: 'Close',
          html: iconSvg('close'),
          onClick: () => {
            // Hide dock entirely (host button can reopen panel)
            this._hideDock();
            this._saveUiState({ minimized: false, panelPos: this._getPanelPos() });
          },
        }),
      ]);
      return dock;
    }

    _buildPanel() {
      const panel = h('div', { class: 'rb-panel', style: 'display:none; left: 16px; top: 16px;' });

      const header = h('div', { class: 'rb-header' }, [
        h('div', { class: 'rb-brand' }, [
          h('div', { html: iconSvg('wand') }),
          h('div', { text: 'Rebound' }),
          (this._badgeEl = h('div', { class: 'rb-badge', text: this._savedBadgeText })),
        ]),
        h('div', { class: 'rb-actions' }, [
          h('button', { class: 'rb-iconbtn', title: 'Minimize', html: iconSvg('min'), onClick: () => this.minimize() }),
          h('button', { class: 'rb-iconbtn danger', title: 'Close', html: iconSvg('close'), onClick: () => this.close() }),
        ]),
      ]);

      this.bodyEl = h('div', { class: 'rb-body' });

      panel.appendChild(header);
      panel.appendChild(this.bodyEl);

      // drag support
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
        // default bottom-right-ish
        const w = 480;
        const left = Math.max(16, (window.innerWidth || 1200) - w - 24);
        const top = 16;
        this.panel.style.left = `${left}px`;
        this.panel.style.top = `${top}px`;
      }

      // restore minimized state
      if (state?.minimized) {
        this._hidePanel();
        this._showDock();
      }
    }

    _enableDrag(panel, handle) {
      let dragging = false;
      let startX = 0, startY = 0;
      let startLeft = 0, startTop = 0;

      const onPointerDown = (e) => {
        // avoid starting drag when clicking buttons
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

        // keep within viewport
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

      // cleanup not implemented in MVP (ok for tool usage)
    }

    // ---------- Data helpers ----------
    get selectedAnim() {
      return this.config.animations[this.selectedAnimIndex] || null;
    }

    ensureConfigShape() {
      if (!this.config || typeof this.config !== 'object') this.config = defaultConfig();
      if (!this.config.settings) this.config.settings = { navHeight: 64 };
      if (!Array.isArray(this.config.animations)) this.config.animations = [];
      if (this.config.animations.length === 0) this.config.animations.push(newAnimation('animation-1'));
      if (this.selectedAnimIndex >= this.config.animations.length) this.selectedAnimIndex = 0;
    }

    // Hide panel while picking element (no distraction)
    _pickWithHide(fnStartPick) {
      const wasVisible = !!this.panel && this.panel.style.display !== 'none';
      if (wasVisible) this._hidePanel();
      this._hideDock(); // keep fully clean while picking

      const restore = () => {
        if (wasVisible) this._showPanel();
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
          // if only one, reset instead of deleting
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
          // update select display
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
              onPick: (el) => {
                // Prefer ID, else first class, else body-based selector
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
          h('div', { class: 'rb-pill', text: '--enter-progress / --exit-progress auto' }),
        ]),
        h('div', { class: 'rb-row' }, [scopeInput, pickScopeBtn]),
        h('div', { class: 'rb-muted' }, [
          'Progress is computed automatically and set as CSS vars on the scope element. ',
          'To adjust exit offset, edit settings.navHeight in JSON.',
        ]),
      ]));

      // -------- Tracks section --------
      const tracks = Array.isArray(anim.tracks) ? anim.tracks : (anim.tracks = []);
      const list = h('div', { class: 'rb-list' });

      tracks.forEach((t, idx) => {
        const card = h('div', { class: 'rb-card' }, [
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
        ]);
        list.appendChild(card);
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

      // -------- JSON section (download/upload + textarea) --------
      const jsonText = h('textarea', { class: 'rb-textarea' });
      jsonText.value = JSON.stringify(this.config, null, 2);

      const btnUpdateJson = h('button', {
        class: 'rb-btn',
        text: 'Update JSON View',
        onClick: () => { jsonText.value = JSON.stringify(this.config, null, 2); },
      });

      const btnDownload = h('button', {
        class: 'rb-btn',
        html: `<span style="display:flex;gap:8px;align-items:center;">${iconSvg('download')} Download</span>`,
        onClick: () => {
          const file = `rebound-animations-${new Date().toISOString().slice(0,10)}.json`;
          downloadTextFile(file, JSON.stringify(this.config, null, 2));
        },
      });

      const fileInput = h('input', { type: 'file', accept: 'application/json', style: 'display:none;' });
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

      const btnUpload = h('button', {
        class: 'rb-btn',
        html: `<span style="display:flex;gap:8px;align-items:center;">${iconSvg('upload')} Upload</span>`,
        onClick: () => fileInput.click(),
      });

      const btnLoadFromTextarea = h('button', {
        class: 'rb-btn',
        text: 'Apply JSON from Box',
        onClick: () => {
          const parsed = safeParseJson(jsonText.value);
          if (!parsed || typeof parsed !== 'object') return alert('Invalid JSON in text box.');
          this.config = parsed;
          this.selectedAnimIndex = 0;
          this.editingTrackIndex = -1;
          this._touchChange();
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

      body.appendChild(h('div', { class: 'rb-section' }, [
        h('div', { class: 'rb-section-title' }, [
          h('div', { text: 'Export / Import' }),
          h('div', { class: 'rb-pill', text: 'LocalStorage enabled' }),
        ]),
        h('div', { class: 'rb-row' }, [btnUpdateJson, btnDownload, btnUpload, btnLoadFromTextarea, btnOnSave]),
        fileInput,
        jsonText,
        h('div', { class: 'rb-muted' }, `Stored in localStorage key: ${this.storageKey}`),
      ]));
    }

    _renderTrackEditor(anim, track) {
      const wrap = h('div', { class: 'rb-section' }, [
        h('div', { class: 'rb-section-title' }, [
          h('div', { text: `Edit Track #${this.editingTrackIndex + 1}` }),
          h('button', {
            class: 'rb-btn',
            text: 'Done',
            onClick: () => { this.editingTrackIndex = -1; this.render(); },
          }),
        ]),
      ]);

      // Target selector + pick
      const targetInput = h('input', {
        class: 'rb-input',
        value: track.targetSelector || '',
        placeholder: 'e.g. .gallery-column or :scope',
        onInput: (e) => { track.targetSelector = e.target.value; this._touchChange(); },
      });

      const withinCb = h('input', {
        type: 'checkbox',
        ...(track.withinScope !== false ? { checked: 'checked' } : {}),
        onChange: (e) => { track.withinScope = !!e.target.checked; this._touchChange(); },
      });

      const pickElBtn = h('button', {
        class: 'rb-btn',
        text: 'Pick Element',
        onClick: () => {
          if (!anim.scopeSelector) return alert('Set scope selector first.');
          const scopeEl = document.querySelector(anim.scopeSelector);
          if (!scopeEl) return alert('Scope selector matched nothing.');

          this._pickWithHide((restore) => {
            Picker.pick({
              ignoreSelector: '.rb-panel, .rb-dock',
              onPick: (el) => {
                track.targetSelector = makeSelectorWithinRoot(scopeEl, el);
                track.withinScope = true;
                this._touchChange();
                this.render();
                restore();
              },
              onCancel: () => restore(),
            });
          });
        },
      });

      wrap.appendChild(h('div', { class: 'rb-col' }, [
        h('div', { class: 'rb-label', text: 'Target Selector' }),
        h('div', { class: 'rb-row' }, [targetInput, pickElBtn]),
        h('div', { class: 'rb-row' }, [
          withinCb,
          h('div', { class: 'rb-muted', text: 'Within scope' }),
        ]),
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
          h('div', { class: 'rb-col', style: 'flex:1;' }, [h('div', { class: 'rb-label', text: 'progress' }), progressSel]),
          h('div', { class: 'rb-col', style: 'flex:1;' }, [h('div', { class: 'rb-label', text: 'start %' }), startIn]),
          h('div', { class: 'rb-col', style: 'flex:1;' }, [h('div', { class: 'rb-label', text: 'end %' }), endIn]),
        ]));

        box.appendChild(h('div', { class: 'rb-muted', style: 'margin-top:8px;' }, [
          'CSS uses clamp(start, var(--enter/exit-progress), end). Progress vars are automatic on the scope element.',
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
          h('div', { class: 'rb-col', style: 'flex:1;' }, [h('div', { class: 'rb-label', text: 'duration (ms)' }), dur]),
          h('div', { class: 'rb-col', style: 'flex:1;' }, [h('div', { class: 'rb-label', text: 'easing' }), easing]),
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
        h('div', { text: 'Properties', style: 'font-weight:700;' }),
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

      const num = (p, label, key) => h('div', { class: 'rb-col', style: 'flex:1;' }, [
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
            h('div', { class: 'rb-col', style: 'flex:1;' }, [
              h('div', { class: 'rb-label', text: 'unit' }),
              unitPick(p),
            ]),
          ]));
        } else if (p.type === 'parallaxY') {
          controls.appendChild(h('div', { class: 'rb-row' }, [
            num(p, 'base', 'base'),
            num(p, 'distance', 'distance'),
            h('div', { class: 'rb-col', style: 'flex:1;' }, [
              h('div', { class: 'rb-label', text: 'unit' }),
              unitPick(p),
            ]),
          ]));
          controls.appendChild(h('div', { class: 'rb-muted' }, [
            'This sets --base-offset and --parallax-distance on the target element (no HTML inline vars needed).',
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
