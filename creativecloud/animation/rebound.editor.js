/* rebound.editor.js - Rebound Editor (v0.4.2)
   - JSON hidden by default
   - No “apply json from box”
   - Opaque UI
   - Import/export toolbar wraps
   - Flush-save on beforeunload so removing mode=rebound doesn’t lose recent edits
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

  // ---------------- Picker ----------------
  const Picker = (() => {
    let overlay, label, active = false;

    function ensureCss() {
      if (document.getElementById('rb-picker-css')) return;
      const s = document.createElement('style');
      s.id = 'rb-picker-css';
      s.textContent = `
        .rb-pick-overlay { position: fixed; z-index: 2147483646; pointer-events:none; border:2px solid #5b7cff; background: rgba(91,124,255,0.14); border-radius: 10px; }
        .rb-pick-label { position: fixed; z-index: 2147483646; pointer-events:none; padding: 6px 10px; border-radius: 999px; background:#0f111a; border:1px solid #2a2f45; color:#fff; font-size:12px; max-width:70vw; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
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

  // ---------------- UI CSS (Opaque) ----------------
  function injectCssOnce() {
    if (document.getElementById('rb-editor-css')) return;
    const style = document.createElement('style');
    style.id = 'rb-editor-css';
    style.textContent = `
      :root{ --rb-bg:#0f111a; --rb-bg2:#151a2e; --rb-border:#2a2f45; --rb-text:#f5f7ff; --rb-muted: rgba(245,247,255,0.70); --rb-danger:#ff5a7a; --rb-shadow:0 18px 55px rgba(0,0,0,0.65); }

      .rb-panel{ position:fixed; z-index:2147483647; width:500px; max-height:80vh; overflow:hidden; border-radius:16px;
        background: linear-gradient(180deg, var(--rb-bg2), var(--rb-bg)); border:1px solid var(--rb-border); box-shadow: var(--rb-shadow);
        color: var(--rb-text); font-family: ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;
      }
      .rb-panel *{ box-sizing:border-box; }
      .rb-header{ display:flex; align-items:center; justify-content:space-between; padding:10px 12px; background:#11152a; border-bottom:1px solid var(--rb-border); cursor:grab; user-select:none; }
      .rb-header:active{ cursor:grabbing; }
      .rb-brand{ display:flex; align-items:center; gap:10px; font-weight:800; letter-spacing:.3px; }
      .rb-badge{ font-size:11px; padding:3px 8px; border-radius:999px; border:1px solid var(--rb-border); background:#0c0f1b; color:var(--rb-muted); }
      .rb-actions{ display:flex; gap:8px; align-items:center; }
      .rb-iconbtn{ width:34px; height:34px; display:flex; align-items:center; justify-content:center; border-radius:12px; border:1px solid var(--rb-border); background:#0c0f1b; color:var(--rb-text); cursor:pointer; }
      .rb-iconbtn:hover{ filter:brightness(1.08); }
      .rb-iconbtn.danger{ border-color: rgba(255,90,122,0.65); color:#ffd3db; }

      .rb-body{ overflow:auto; max-height: calc(80vh - 58px); padding:12px; background: var(--rb-bg); }

      .rb-section{ border:1px solid var(--rb-border); background:#10152a; border-radius:14px; padding:12px; margin-bottom:10px; }
      .rb-section-title{ display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; font-weight:750; letter-spacing:.2px; }

      .rb-row{ display:flex; gap:10px; align-items:center; }
      .rb-col{ display:flex; flex-direction:column; gap:8px; }
      .rb-muted{ color: var(--rb-muted); font-size:12px; }
      .rb-label{ font-size:12px; color: var(--rb-muted); }

      .rb-input, .rb-select, .rb-textarea{ width:100%; padding:9px 10px; border-radius:12px; border:1px solid var(--rb-border); background:#0c0f1b; color:var(--rb-text); outline:none; }
      .rb-input:focus, .rb-select:focus, .rb-textarea:focus{ border-color: rgba(124,92,255,0.7); box-shadow: 0 0 0 6px rgba(124,92,255,0.16); }
      .rb-textarea{ min-height:170px; font-family: ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace; font-size:12px; }

      .rb-btn{ border:1px solid var(--rb-border); background:#0c0f1b; color:var(--rb-text); padding:9px 10px; border-radius:12px; cursor:pointer; user-select:none; white-space:nowrap; }
      .rb-btn:hover{ filter:brightness(1.08); }
      .rb-btn.primary{ border-color: rgba(124,92,255,0.65); background: linear-gradient(180deg, rgba(124,92,255,0.35), rgba(124,92,255,0.16)); }
      .rb-btn.danger{ border-color: rgba(255,90,122,0.65); background: linear-gradient(180deg, rgba(255,90,122,0.25), rgba(255,90,122,0.10)); }

      .rb-card{ border:1px solid var(--rb-border); background:#0c0f1b; border-radius:12px; padding:10px; }
      .rb-list{ display:flex; flex-direction:column; gap:10px; }
      .rb-pill{ font-size:11px; padding:3px 8px; border-radius:999px; border:1px solid var(--rb-border); background:#0c0f1b; color:var(--rb-muted); }

      .rb-toolbar{ display:flex; flex-wrap:wrap; gap:8px; align-items:center; }
      .rb-toolbar .rb-btn{ flex: 1 1 160px; }
    `;
    document.head.appendChild(style);
  }

  function iconSvg(name) {
    const common = 'width="18" height="18" viewBox="0 0 24 24" fill="none"';
    if (name === 'min') return `<svg ${common}><path d="M6 18h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
    if (name === 'close') return `<svg ${common}><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
    if (name === 'wand') return `<svg ${common}><path d="M4 20l8-8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M14 4l6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M13 5l6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
    return '';
  }

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

      this._saveTimer = 0;
      this._remountTimer = 0;
      this._badgeEl = null;
      this._badgeText = 'Auto-saved';

      // Ensure preview reflects config
      try { RB.Runtime?.mountSingleton?.(this.config); } catch {}

      // ✅ IMPORTANT: flush-save when the user reloads/removes query param
      window.addEventListener('beforeunload', () => {
        try { this._saveConfigToStorageNow(); } catch {}
      });

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

    _setBadge(text) {
      this._badgeText = text;
      if (this._badgeEl) this._badgeEl.textContent = text;
    }

    open() {
      if (!this.panel) {
        this.panel = this._buildPanel();
        document.body.appendChild(this.panel);
        this.panel.style.left = `${Math.max(16, (window.innerWidth || 1200) - 500 - 24)}px`;
        this.panel.style.top = `16px`;
        this.render();
      }
      this.panel.style.display = 'block';
    }

    close() {
      if (this.panel) this.panel.style.display = 'none';
    }

    _buildPanel() {
      const panel = h('div', { class: 'rb-panel', style: 'display:none; position:fixed;' });

      const header = h('div', { class: 'rb-header' }, [
        h('div', { class: 'rb-brand' }, [
          h('div', { html: iconSvg('wand') }),
          h('div', { text: 'Rebound' }),
          (this._badgeEl = h('div', { class: 'rb-badge', text: this._badgeText })),
        ]),
        h('div', { class: 'rb-actions' }, [
          h('button', { class: 'rb-iconbtn', title: 'Close', html: iconSvg('close'), onClick: () => this.close() }),
        ]),
      ]);

      this.bodyEl = h('div', { class: 'rb-body' });
      panel.appendChild(header);
      panel.appendChild(this.bodyEl);

      // simple drag
      let dragging = false;
      let sx = 0, sy = 0, sl = 0, st = 0;
      header.addEventListener('pointerdown', (e) => {
        if (e.target.closest('.rb-iconbtn')) return;
        dragging = true;
        sx = e.clientX; sy = e.clientY;
        sl = parseFloat(panel.style.left || '0');
        st = parseFloat(panel.style.top || '0');
        header.setPointerCapture?.(e.pointerId);
      });
      window.addEventListener('pointermove', (e) => {
        if (!dragging) return;
        panel.style.left = `${sl + (e.clientX - sx)}px`;
        panel.style.top = `${st + (e.clientY - sy)}px`;
      });
      window.addEventListener('pointerup', () => { dragging = false; });

      return panel;
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
      const wasVisible = this.panel && this.panel.style.display !== 'none';
      if (wasVisible) this.panel.style.display = 'none';
      const restore = () => { if (wasVisible) this.panel.style.display = 'block'; };
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
              ignoreSelector: '.rb-panel',
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
        h('div', { class: 'rb-muted', text: 'Runtime mounts from localStorage even when editor is not loaded.' }),
      ]));

      // Tracks list
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

      // Import / Export (JSON hidden by default)
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
