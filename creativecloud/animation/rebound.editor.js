/* rebound.editor.js - Rebound Editor (Improved Picker, Multi-Select, DOM Walker) */
(() => {
  'use strict';

  const RB = (window.Rebound = window.Rebound || {});
  if (!RB.Runtime) console.warn('[ReboundEditor] Load rebound.runtime.js first');

  const DEFAULT_STORAGE_KEY = 'rebound:config:v1';
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

  function elLabel(el) {
    if (!el || el.nodeType !== 1) return '';
    const tag = el.tagName.toLowerCase();
    const id = el.id ? `#${el.id}` : '';
    const cls = el.classList && el.classList.length ? '.' + Array.from(el.classList).slice(0, 3).join('.') : '';
    return `${tag}${id}${cls}`;
  }

  // Generates a selector for a specific element relative to root
  function getSingleSelector(root, el) {
    if (!root || !el) return '';
    if (el === root) return ':scope';

    if (el.id) {
      const sel = `#${cssEscape(el.id)}`;
      // Ensure ID is unique in document or fall back
      if (document.querySelectorAll(sel).length === 1) return sel;
    }

    const parts = [];
    let cur = el;
    while (cur && cur.nodeType === 1 && cur !== root) {
      const tag = cur.tagName.toLowerCase();
      const parent = cur.parentElement;
      if (!parent) break;
      
      const siblings = Array.from(parent.children);
      const sameTag = siblings.filter(s => s.tagName.toLowerCase() === tag);
      
      if (cur.classList.length > 0) {
        // Try class
        const cls = '.' + cssEscape(cur.classList[0]);
        if (parent.querySelectorAll(cls).length === 1) {
          parts.unshift(cls);
        } else {
          // Class + nth-child fallback
          const idx = siblings.indexOf(cur) + 1;
          parts.unshift(`${tag}:nth-child(${idx})`);
        }
      } else {
         const idx = siblings.indexOf(cur) + 1;
         parts.unshift(`${tag}:nth-child(${idx})`);
      }
      cur = parent;
    }
    parts.unshift(':scope');
    return parts.join(' > ');
  }

  // Generates a combined selector for multiple elements
  function generateMultiSelector(root, elements) {
    if (!elements || elements.length === 0) return '';
    
    // De-dupe
    const unique = Array.from(new Set(elements));
    
    // If just one
    if (unique.length === 1) return getSingleSelector(root, unique[0]);

    // Simple strategy: Comma separated specific paths
    // A smarter strategy would check for common classes, but that's risky if the class exists elsewhere.
    return unique.map(el => getSingleSelector(root, el).replace(':scope > ', '')).join(', ');
  }

  function defaultConfig() {
    return { version: 1, settings: { navHeight: 64 }, animations: [{ name: 'animation-1', scopeSelector: '', tracks: [] }] };
  }

  function newTrack() {
    return {
      targetSelector: '', withinScope: true,
      trigger: { type: 'scroll', progress: 'exit', start: 0, end: 100 },
      engine: 'css', properties: [{ type: 'translateY', from: 0, to: 100, unit: 'px' }],
    };
  }

  // ---------------- Advanced Picker ----------------
  const Picker = (() => {
    let overlayContainer, hud, active = false;
    let currentHover = null;
    let selectedSet = new Set();
    let options = {};
    let onRenderHUD = null; // callback to refresh hud

    function ensureCss() {
      if (document.getElementById('rb-picker-css')) return;
      const s = document.createElement('style');
      s.id = 'rb-picker-css';
      s.textContent = `
        .rb-pick-overlay-container { position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 2147483645; }
        .rb-pick-box { position: absolute; border: 2px solid #5b7cff; background: rgba(91,124,255,0.1); border-radius: 4px; pointer-events: none; transition: all 0.05s ease; }
        .rb-pick-box.hover { border-color: #5b7cff; border-style: dashed; z-index: 2; }
        .rb-pick-box.selected { border-color: #2ecc71; background: rgba(46,204,113,0.15); border-style: solid; z-index: 1; }
        
        .rb-pick-hud {
          position: fixed; z-index: 2147483646;
          background: #11152a; border: 1px solid #2a2f45; border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          padding: 8px; font-family: sans-serif; display: flex; flex-direction: column; gap: 8px;
          color: #fff; width: 260px; pointer-events: auto;
          bottom: 20px; left: 50%; transform: translateX(-50%);
        }
        .rb-hud-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
        .rb-hud-title { font-size: 11px; font-weight: bold; color: #7c5cff; text-transform: uppercase; letter-spacing: 0.5px; }
        .rb-hud-label { font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180px; }
        .rb-hud-btn {
          background: #1d2236; border: 1px solid #2a2f45; color: #ccc; border-radius: 6px;
          padding: 4px 8px; font-size: 11px; cursor: pointer; display: flex; align-items: center; justify-content: center;
        }
        .rb-hud-btn:hover { background: #2a2f45; color: #fff; }
        .rb-hud-btn.primary { background: #5b7cff; border-color: #5b7cff; color: #fff; }
        .rb-hud-crumbs { display: flex; gap: 4px; overflow-x: auto; padding-bottom: 4px; margin-bottom: 4px; }
        .rb-crumb { font-size: 10px; color: #888; cursor: pointer; padding: 2px 4px; border-radius: 4px; background: #0c0f1b; white-space: nowrap; }
        .rb-crumb:hover { background: #2a2f45; color: #fff; }
      `;
      document.head.appendChild(s);
    }

    function createBox(el, type) {
      const r = el.getBoundingClientRect();
      const div = document.createElement('div');
      div.className = `rb-pick-box ${type}`;
      div.style.left = `${r.left}px`;
      div.style.top = `${r.top}px`;
      div.style.width = `${r.width}px`;
      div.style.height = `${r.height}px`;
      return div;
    }

    function renderOverlay() {
      if (!overlayContainer) return;
      overlayContainer.innerHTML = '';
      
      // Render selected
      selectedSet.forEach(el => {
        if(el.isConnected) overlayContainer.appendChild(createBox(el, 'selected'));
      });

      // Render hover
      if (currentHover && currentHover.isConnected && !selectedSet.has(currentHover)) {
        overlayContainer.appendChild(createBox(currentHover, 'hover'));
      }
    }

    function renderHUD() {
      if (!hud) return;
      hud.innerHTML = '';
      
      const target = currentHover || (selectedSet.size > 0 ? Array.from(selectedSet)[selectedSet.size-1] : null);
      
      // 1. Breadcrumbs
      if (target) {
        const crumbs = h('div', { class: 'rb-hud-crumbs' });
        let p = target;
        const list = [];
        while(p && p !== document.body && list.length < 5) {
          list.unshift(p);
          p = p.parentElement;
        }
        list.forEach(el => {
          crumbs.appendChild(h('div', { 
            class: 'rb-crumb', 
            text: el.tagName.toLowerCase() + (el.id?`#${el.id}`:''),
            onClick: (e) => { e.stopPropagation(); setHover(el); }
          }));
        });
        hud.appendChild(crumbs);
      }

      // 2. Target Info
      hud.appendChild(h('div', { class: 'rb-hud-row' }, [
        h('div', { class: 'rb-hud-label', text: target ? elLabel(target) : 'Hover an element...' }),
        h('div', { class: 'rb-hud-title', text: target ? `${Math.round(target.getBoundingClientRect().width)}x${Math.round(target.getBoundingClientRect().height)}` : '' })
      ]));

      // 3. Walker Controls
      if (target) {
        const walk = (dir) => {
          let n = null;
          if (dir === 'up') n = target.parentElement;
          if (dir === 'down') n = target.firstElementChild;
          if (dir === 'prev') n = target.previousElementSibling;
          if (dir === 'next') n = target.nextElementSibling;
          if (n && n.nodeType === 1) setHover(n);
        };
        
        hud.appendChild(h('div', { class: 'rb-hud-row', style: 'justify-content: center; margin-top:4px;' }, [
          h('button', { class: 'rb-hud-btn', html: '&uarr; Parent', onClick: () => walk('up') }),
          h('button', { class: 'rb-hud-btn', html: '&darr; Child', onClick: () => walk('down') }),
          h('button', { class: 'rb-hud-btn', html: '&larr;', onClick: () => walk('prev') }),
          h('button', { class: 'rb-hud-btn', html: '&rarr;', onClick: () => walk('next') }),
        ]));
      }

      // 4. Action
      const isSel = target && selectedSet.has(target);
      const selCount = selectedSet.size;
      
      const toggleBtn = h('button', {
        class: `rb-hud-btn ${isSel ? '' : 'primary'}`,
        style: 'flex:1',
        text: isSel ? 'Deselect' : 'Select',
        onClick: (e) => {
          e.stopPropagation();
          if (!target) return;
          if (selectedSet.has(target)) selectedSet.delete(target);
          else selectedSet.add(target);
          renderOverlay();
          renderHUD();
        }
      });

      const doneBtn = h('button', {
        class: 'rb-hud-btn primary',
        style: 'flex:1',
        text: `Done (${selCount})`,
        onClick: () => finalize()
      });

      hud.appendChild(h('div', { class: 'rb-hud-row', style: 'margin-top:8px; border-top:1px solid #2a2f45; padding-top:8px;' }, [
        toggleBtn, doneBtn
      ]));
    }

    function setHover(el) {
      if (currentHover !== el) {
        currentHover = el;
        renderOverlay();
        renderHUD();
      }
    }

    function finalize() {
      cleanup();
      options.onPick?.(Array.from(selectedSet));
    }

    function start({ ignoreSelector, onPick, onCancel }) {
      if (active) return;
      active = true;
      options = { ignoreSelector, onPick, onCancel };
      ensureCss();

      selectedSet = new Set();
      overlayContainer = h('div', { class: 'rb-pick-overlay-container' });
      hud = h('div', { class: 'rb-pick-hud' });
      
      document.body.appendChild(overlayContainer);
      document.body.appendChild(hud);

      renderHUD();

      const move = (e) => {
        const el = document.elementFromPoint(e.clientX, e.clientY);
        if (!el) return;
        // Ignore internal UI
        if (el.closest('.rb-pick-hud') || (ignoreSelector && el.closest(ignoreSelector))) return;
        setHover(el);
      };

      const click = (e) => {
        if (e.target.closest('.rb-pick-hud')) return; // Allow HUD clicks
        e.preventDefault(); e.stopPropagation();
        
        const el = document.elementFromPoint(e.clientX, e.clientY);
        if (!el || (ignoreSelector && el.closest(ignoreSelector))) return;
        
        // Shift key to remove, otherwise add/toggle
        if (e.shiftKey) {
          if (selectedSet.has(el)) selectedSet.delete(el);
        } else {
          // If simply clicking, toggle
          if (selectedSet.has(el)) selectedSet.delete(el);
          else selectedSet.add(el);
        }
        renderOverlay();
        renderHUD();
      };

      const key = (e) => {
        if (e.key === 'Escape') {
          cleanup();
          onCancel?.();
        }
        if (e.key === 'Enter') finalize();
      };

      window.addEventListener('mousemove', move, true);
      window.addEventListener('click', click, true);
      window.addEventListener('keydown', key, true);

      // Scroll listener to update boxes
      window.addEventListener('scroll', renderOverlay, { passive: true, capture: true });

      function cleanup() {
        active = false;
        overlayContainer.remove();
        hud.remove();
        window.removeEventListener('mousemove', move, true);
        window.removeEventListener('click', click, true);
        window.removeEventListener('keydown', key, true);
        window.removeEventListener('scroll', renderOverlay, true);
      }
    }

    return { pick: start };
  })();

  // ---------------- Editor UI ----------------
  class ReboundEditor {
    constructor({ openButton, storageKey = DEFAULT_STORAGE_KEY, onSave } = {}) {
      this.storageKey = storageKey;
      this.onSave = onSave;
      this.config = this._loadConfig() || defaultConfig();
      this.selectedAnimIndex = 0;
      this.editingTrackIndex = -1;
      
      if (openButton) openButton.addEventListener('click', () => this.open());
      
      const ui = this._loadUi();
      if (ui?.minimized) this._showDock();
      
      // Auto-inject CSS
      const s = document.createElement('style');
      s.id = 'rb-editor-css';
      s.textContent = `
        :root{ --rb-bg:#0f111a; --rb-border:#2a2f45; --rb-text:#f5f7ff; --rb-accent:#5b7cff; }
        .rb-panel{ position:fixed; z-index:2147483647; width:480px; max-height:85vh; background:#11152a; border:1px solid var(--rb-border); border-radius:12px; box-shadow:0 20px 60px rgba(0,0,0,0.7); color:var(--rb-text); font-family:system-ui,sans-serif; display:flex; flex-direction:column; }
        .rb-panel *{ box-sizing:border-box; }
        .rb-header{ padding:12px; background:#0c0f1b; border-bottom:1px solid var(--rb-border); display:flex; justify-content:space-between; align-items:center; cursor:grab; border-radius:12px 12px 0 0; }
        .rb-body{ padding:16px; overflow-y:auto; flex:1; }
        .rb-section{ background:#151a2e; border:1px solid var(--rb-border); border-radius:8px; padding:12px; margin-bottom:12px; }
        .rb-row{ display:flex; gap:10px; align-items:center; }
        .rb-col{ display:flex; flex-direction:column; gap:6px; flex:1; }
        .rb-btn{ background:#1d2236; border:1px solid var(--rb-border); color:var(--rb-text); padding:6px 12px; border-radius:6px; cursor:pointer; font-size:12px; }
        .rb-btn:hover{ background:#2a2f45; }
        .rb-btn.primary{ background:var(--rb-accent); border-color:var(--rb-accent); color:#fff; }
        .rb-input, .rb-select{ background:#0c0f1b; border:1px solid var(--rb-border); color:var(--rb-text); padding:8px; border-radius:6px; width:100%; font-size:13px; outline:none; }
        .rb-input:focus{ border-color:var(--rb-accent); }
        .rb-label{ font-size:11px; color:#888; text-transform:uppercase; letter-spacing:0.5px; }
        .rb-dock{ position:fixed; bottom:20px; right:20px; z-index:2147483647; background:#11152a; padding:10px 16px; border-radius:30px; border:1px solid var(--rb-border); display:flex; gap:10px; box-shadow:0 10px 30px rgba(0,0,0,0.5); color:#fff; align-items:center; cursor:pointer; }
      `;
      document.head.appendChild(s);
    }

    _loadConfig() { return safeParseJson(localStorage.getItem(this.storageKey)); }
    _saveConfig() { 
      localStorage.setItem(this.storageKey, JSON.stringify(this.config));
      try{ RB.Runtime?.mountSingleton?.(this.config); }catch{}
    }
    _loadUi() { return safeParseJson(localStorage.getItem(UI_STORAGE_KEY)); }
    _saveUi(s) { localStorage.setItem(UI_STORAGE_KEY, JSON.stringify(s)); }

    open() {
      if (!this.panel) {
        this.panel = h('div', { class: 'rb-panel' }, [
          h('div', { class: 'rb-header', onPointerDown:(e)=>this._drag(e) }, [
            h('div', { style:'font-weight:bold', text: 'Rebound Editor' }),
            h('div', { class: 'rb-row' }, [
              h('button', { class:'rb-btn', text:'Min', onClick:()=>this.minimize() }),
              h('button', { class:'rb-btn', text:'Close', onClick:()=>this.close() })
            ])
          ]),
          (this.body = h('div', { class:'rb-body' }))
        ]);
        document.body.appendChild(this.panel);
        this._restorePos();
        this.render();
      }
      this.panel.style.display = 'flex';
      this._hideDock();
    }
    
    close() { if(this.panel) this.panel.style.display='none'; }
    minimize() { if(this.panel) this.panel.style.display='none'; this._showDock(); this._saveUi({minimized:true}); }
    
    _showDock() {
      if(!this.dock) {
        this.dock = h('div', { class:'rb-dock', onClick:()=>{this.open(); this._hideDock();} }, [
          h('div', { text:'Rebound' }), h('div', { style:'font-size:10px;opacity:0.6', text:'(Click to open)' })
        ]);
        document.body.appendChild(this.dock);
      }
      this.dock.style.display = 'flex';
    }
    _hideDock() { if(this.dock) this.dock.style.display='none'; }

    _drag(e) {
      if(e.target.tagName==='BUTTON') return;
      e.target.setPointerCapture(e.pointerId);
      const startX = e.clientX - this.panel.offsetLeft;
      const startY = e.clientY - this.panel.offsetTop;
      const move = (ev) => {
        this.panel.style.left = Math.max(0, ev.clientX - startX) + 'px';
        this.panel.style.top = Math.max(0, ev.clientY - startY) + 'px';
      };
      const up = () => {
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
        this._saveUi({ minimized:false, pos:{left:this.panel.style.left, top:this.panel.style.top} });
      };
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
    }
    _restorePos() {
      const ui = this._loadUi();
      if(ui?.pos) { this.panel.style.left=ui.pos.left; this.panel.style.top=ui.pos.top; }
      else { this.panel.style.left='20px'; this.panel.style.top='20px'; }
    }

    render() {
      if(!this.body) return;
      this.body.innerHTML = '';
      const anim = this.config.animations[this.selectedAnimIndex] || this.config.animations[0];

      // Scope Picker
      const scopeRow = h('div', { class: 'rb-section' }, [
        h('div', { class:'rb-label', text:'Animation Scope' }),
        h('div', { class:'rb-row' }, [
          h('input', { class:'rb-input', value:anim.scopeSelector||'', placeholder:'e.g. body', onInput:(e)=>{anim.scopeSelector=e.target.value; this._saveConfig();} }),
          h('button', { class:'rb-btn', text:'Pick', onClick:()=> {
            this.panel.style.display='none';
            Picker.pick({ ignoreSelector:'.rb-panel, .rb-dock', onCancel:()=>this.panel.style.display='flex', onPick:(els)=>{
              this.panel.style.display='flex';
              if(els.length) {
                anim.scopeSelector = getSingleSelector(document, els[0]);
                this._saveConfig(); this.render();
              }
            }});
          }})
        ])
      ]);
      this.body.appendChild(scopeRow);

      // Track List
      const trackList = h('div', { class:'rb-col' });
      (anim.tracks||[]).forEach((t, i) => {
        trackList.appendChild(h('div', { class:'rb-section', style:'cursor:pointer', onClick:()=>{this.editingTrackIndex=i; this.render();} }, [
          h('div', { style:'font-weight:bold', text: t.targetSelector || '(No target)' }),
          h('div', { style:'font-size:11px; opacity:0.7', text: `${t.trigger.type} - ${t.properties.length} props` })
        ]));
      });
      
      this.body.appendChild(h('div', { class:'rb-row', style:'margin-bottom:10px' }, [
        h('div', { style:'font-weight:bold', text:'Tracks' }),
        h('button', { class:'rb-btn primary', text:'+ Add', onClick:()=>{
           if(!anim.tracks) anim.tracks=[];
           anim.tracks.push(newTrack());
           this.editingTrackIndex = anim.tracks.length-1;
           this._saveConfig(); this.render();
        }})
      ]));
      this.body.appendChild(trackList);

      // Track Editor
      if(this.editingTrackIndex > -1 && anim.tracks[this.editingTrackIndex]) {
        this._renderTrackEditor(anim, anim.tracks[this.editingTrackIndex]);
      }
    }

    _renderTrackEditor(anim, track) {
      const editor = h('div', { class:'rb-panel', style:'left:520px; top:'+this.panel.style.top });
      // ... (Simplifying for brevity: Re-implementing the track details editor with the new picker)
      
      const update = () => { this._saveConfig(); this._renderTrackEditor(anim, track); }; // Re-render self

      const header = h('div', { class:'rb-header' }, [
        h('div', { text:`Edit Track #${this.editingTrackIndex+1}` }),
        h('button', { class:'rb-btn', text:'Done', onClick:()=>{ editor.remove(); this.editingTrackIndex=-1; this.render(); } })
      ]);
      
      const body = h('div', { class:'rb-body' });
      
      // Target Selector
      body.appendChild(h('div', { class:'rb-section' }, [
        h('div', { class:'rb-label', text:'Targets' }),
        h('div', { class:'rb-row' }, [
          h('input', { class:'rb-input', value:track.targetSelector, onInput:(e)=>{ track.targetSelector=e.target.value; this._saveConfig(); } }),
          h('button', { class:'rb-btn primary', text:'Select', onClick:()=> {
            editor.style.display='none'; this.panel.style.display='none';
            const scopeEl = document.querySelector(anim.scopeSelector);
            Picker.pick({ ignoreSelector:'.rb-panel, .rb-dock', onCancel:()=>{editor.style.display='flex'; this.panel.style.display='flex';}, onPick:(els)=>{
              editor.style.display='flex'; this.panel.style.display='flex';
              if(els.length) {
                // Generate multi-selector relative to scope
                const root = scopeEl || document.body;
                track.targetSelector = generateMultiSelector(root, els);
                this._saveConfig();
                // Force input update
                editor.querySelector('input').value = track.targetSelector;
              }
            }});
          }})
        ]),
        h('div', { style:'font-size:10px; color:#666; margin-top:4px', text:'Click multiple elements to group them.' })
      ]));

      // Properties (Simplified for this snippet)
      const propsList = h('div', { class:'rb-col' });
      track.properties.forEach((p, i) => {
        const row = h('div', { class:'rb-row', style:'background:#0c0f1b; padding:8px; border-radius:6px;' }, [
            h('div', { text: p.type, style:'width:80px; font-size:12px' }),
            h('input', { class:'rb-input', type:'number', value:p.from||0, onInput:(e)=>{p.from=Number(e.target.value); this._saveConfig();} }),
            h('div', { text:'to' }),
            h('input', { class:'rb-input', type:'number', value:p.to||0, onInput:(e)=>{p.to=Number(e.target.value); this._saveConfig();} }),
            h('button', { class:'rb-btn', text:'x', onClick:()=>{ track.properties.splice(i,1); update(); } })
        ]);
        propsList.appendChild(row);
      });

      body.appendChild(h('div', { class:'rb-section' }, [
        h('div', { class:'rb-row', style:'justify-content:space-between' }, [
            h('div', { class:'rb-label', text:'Properties' }),
            h('button', { class:'rb-btn', text:'+ Prop', onClick:()=>{ track.properties.push({type:'translateY', from:0, to:50}); update(); } })
        ]),
        propsList
      ]));
      
      editor.appendChild(header);
      editor.appendChild(body);
      
      // Remove old editor overlay if exists
      const old = document.querySelectorAll('.rb-panel');
      if(old.length > 1) old[1].remove();
      
      document.body.appendChild(editor);
      
      // Sync drag with main panel (optional, but nice)
      editor.style.top = this.panel.style.top;
      editor.style.left = (parseInt(this.panel.style.left) + 500) + 'px';
    }
  }

  RB.Editor = ReboundEditor;
})();
