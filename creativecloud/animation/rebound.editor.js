/* rebound.editor.js - v0.5.0 */
(() => {
  'use strict';
  const RB = (window.Rebound = window.Rebound || {});
  const STORAGE_KEY = 'rebound:config:v1';

  // --- UI Helpers ---
  function h(tag, attrs = {}, children = []) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === 'class') el.className = v;
      else if (k === 'text') el.textContent = v;
      else if (k.startsWith('on')) el.addEventListener(k.slice(2).toLowerCase(), v);
      else if (v != null) el.setAttribute(k, String(v));
    }
    (Array.isArray(children) ? children : [children]).forEach(c => {
      if (c instanceof Node) el.appendChild(c);
      else if (c != null) el.appendChild(document.createTextNode(c));
    });
    return el;
  }

  // --- NEW: Multi-Select Picker Engine ---
  const Picker = (() => {
    let overlay, hud, selected = new Set(), current = null, callback = null, root = null;

    const getSelector = (el) => {
      if (root && el !== root) {
        // Simple relative selector generator
        const tag = el.tagName.toLowerCase();
        if (el.id) return `#${el.id}`;
        if (el.classList.length) return `${tag}.${el.classList[0]}`;
        return tag;
      }
      return el.id ? `#${el.id}` : el.tagName.toLowerCase();
    };

    const render = () => {
      overlay.innerHTML = '';
      const draw = (el, color) => {
        const r = el.getBoundingClientRect();
        overlay.appendChild(h('div', { style: `position:fixed;pointer-events:none;z-index:2147483645;border:2px solid ${color};background:rgba(91,124,255,0.1);left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;border-radius:4px;` }));
      };
      selected.forEach(el => draw(el, '#2ecc71'));
      if (current && !selected.has(current)) draw(current, '#5b7cff');

      hud.innerHTML = '';
      const target = current || Array.from(selected).pop();
      hud.appendChild(h('div', { style: 'font-weight:bold;margin-bottom:8px;font-size:12px;color:#fff;', text: target ? getSelector(target) : 'Hover elements...' }));
      
      hud.appendChild(h('div', { style: 'display:flex;gap:6px;' }, [
        h('button', { class: 'rb-btn', text: 'Select/Deselect', onClick: () => { 
          if (target) selected.has(target) ? selected.delete(target) : selected.add(target); 
          render(); 
        } }),
        h('button', { class: 'rb-btn primary', text: `Done (${selected.size})`, onClick: () => {
          const selectors = Array.from(selected).map(getSelector).join(', ');
          cleanup();
          callback(selectors);
        } })
      ]));
    };

    const cleanup = () => { overlay.remove(); hud.remove(); window.removeEventListener('mousemove', onMove); window.removeEventListener('click', onClick, true); };
    const onMove = e => { 
      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (el && !el.closest('.rb-picker-ui')) { current = el; render(); }
    };
    const onClick = e => { if (e.target.closest('.rb-picker-ui')) return; e.preventDefault(); e.stopPropagation(); };

    return {
      start: (scopeEl, cb) => {
        callback = cb; root = scopeEl; selected.clear();
        overlay = h('div', { class: 'rb-picker-ui' });
        hud = h('div', { class: 'rb-picker-ui', style: 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#11152a;padding:15px;border-radius:12px;z-index:2147483646;border:1px solid #2a2f45;min-width:240px;box-shadow:0 10px 30px rgba(0,0,0,0.5);' });
        document.body.append(overlay, hud);
        window.addEventListener('mousemove', onMove);
        window.addEventListener('click', onClick, true);
        render();
      }
    };
  })();

  class Editor {
    constructor() {
      this.config = JSON.parse(localStorage.getItem(STORAGE_KEY)) || { settings: { navHeight: 64 }, animations: [] };
      this.activeAnimIdx = 0;
      this.editingTrackIdx = -1;
      this.initUI();
    }

    save() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
      if (RB.Runtime) RB.Runtime.mountSingleton(this.config);
      this.render();
    }

    initUI() {
      this.panel = h('div', { class: 'rb-panel', style: 'position:fixed;top:20px;right:20px;width:380px;background:#0f111a;border:1px solid #2a2f45;color:#f5f7ff;z-index:2147483640;border-radius:16px;display:flex;flex-direction:column;max-height:85vh;box-shadow:0 20px 50px rgba(0,0,0,0.5);font-family:sans-serif;overflow:hidden;' });
      this.body = h('div', { style: 'padding:16px;overflow-y:auto;flex:1;' });
      this.panel.append(h('div', { style: 'padding:12px 16px;background:#11152a;border-bottom:1px solid #2a2f45;font-weight:bold;display:flex;justify-content:space-between;', children: [
        h('span', { text: 'Rebound Editor' }),
        h('span', { text: 'v0.5.0', style: 'font-size:10px; opacity:0.5;' })
      ] }), this.body);
      document.body.appendChild(this.panel);
      this.render();
    }

    render() {
      this.body.innerHTML = '';
      const anims = this.config.animations;

      // 1. ANIMATION LIST (Better management)
      this.body.appendChild(h('div', { style: 'display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;' }, [
        h('span', { text: 'ANIMATIONS', style: 'font-size:11px;color:#888;letter-spacing:1px;' }),
        h('button', { class: 'rb-btn primary', text: '+ New Animation', onClick: () => { 
          anims.push({ name: 'Anim ' + (anims.length + 1), scopeSelector: 'body', tracks: [] }); 
          this.activeAnimIdx = anims.length - 1;
          this.save(); 
        } })
      ]));

      const list = h('div', { style: 'margin-bottom:20px; display:flex; flex-direction:column; gap:6px;' });
      anims.forEach((a, i) => {
        const isActive = i === this.activeAnimIdx;
        list.appendChild(h('div', { 
          style: `padding:10px 12px; border-radius:10px; cursor:pointer; background:${isActive ? '#1d2236' : '#151a2e'}; border:1px solid ${isActive ? '#5b7cff' : '#2a2f45'}; display:flex; justify-content:space-between; align-items:center;`,
          onClick: () => { this.activeAnimIdx = i; this.editingTrackIdx = -1; this.render(); }
        }, [
          h('span', { text: a.name, style: isActive ? 'font-weight:bold;' : '' }),
          h('button', { text: '✕', style: 'background:none; border:none; color:#ff5a7a; cursor:pointer;', onClick: (e) => { 
            e.stopPropagation(); 
            anims.splice(i, 1); 
            this.activeAnimIdx = Math.max(0, i - 1); 
            this.save(); 
          } })
        ]));
      });
      this.body.appendChild(list);

      const current = anims[this.activeAnimIdx];
      if (!current) return;

      // 2. TRACKS (Added multi-pick)
      this.body.appendChild(h('hr', { style: 'border:none; border-top:1px solid #2a2f45; margin:20px 0;' }));
      this.body.appendChild(h('div', { style: 'display:flex;justify-content:space-between;margin-bottom:12px;' }, [
        h('span', { text: 'TRACKS', style: 'font-size:11px;color:#888;' }),
        h('button', { class: 'rb-btn', text: '+ Add Track', onClick: () => { 
          current.tracks.push({ targetSelector: '', trigger: { type: 'scroll', start: 0, end: 100, progress: 'exit' }, properties: [] }); 
          this.editingTrackIdx = current.tracks.length - 1;
          this.save(); 
        } })
      ]));

      current.tracks.forEach((t, ti) => {
        const isEditing = ti === this.editingTrackIdx;
        const trackCard = h('div', { style: `background:#0c0f1b; padding:12px; border-radius:12px; margin-bottom:10px; border:1px solid ${isEditing ? '#5b7cff' : '#2a2f45'};` }, [
          h('div', { style: 'display:flex; gap:8px; align-items:center;' }, [
            h('input', { class: 'rb-input', value: t.targetSelector, placeholder: 'Selector (comma separated)', onInput: e => { t.targetSelector = e.target.value; this.save(); } }),
            h('button', { class: 'rb-btn', text: 'Pick', onClick: () => {
              this.panel.style.display = 'none';
              Picker.start(document.querySelector(current.scopeSelector), (sel) => {
                this.panel.style.display = 'flex';
                t.targetSelector = sel;
                this.save();
              });
            } }),
            h('button', { text: isEditing ? '▲' : '▼', class: 'rb-btn', onClick: () => { this.editingTrackIdx = isEditing ? -1 : ti; this.render(); } }),
            h('button', { text: '✕', style: 'color:#ff5a7a; background:none; border:none; cursor:pointer;', onClick: () => { current.tracks.splice(ti, 1); this.save(); } })
          ]),
          // Expanded Property Editor
          isEditing ? h('div', { style: 'margin-top:12px; border-top:1px solid #2a2f45; padding-top:10px;' }, [
            h('div', { style: 'display:flex; justify-content:space-between; margin-bottom:10px;' }, [
              h('span', { text: 'Properties', style: 'font-size:11px; color:#888;' }),
              h('button', { class: 'rb-btn', text: '+ Add Prop', onClick: () => { t.properties.push({ type: 'translateY', from: 0, to: 100 }); this.save(); } })
            ]),
            ...t.properties.map((p, pi) => h('div', { style: 'display:flex; gap:5px; margin-bottom:5px;' }, [
              h('select', { class: 'rb-select', onChange: e => { p.type = e.target.value; this.save(); } }, [
                h('option', { value: 'translateY', text: 'Y', selected: p.type === 'translateY' }),
                h('option', { value: 'opacity', text: 'Opac', selected: p.type === 'opacity' }),
                h('option', { value: 'scale', text: 'Scale', selected: p.type === 'scale' })
              ]),
              h('input', { class: 'rb-input', type: 'number', value: p.from, style: 'width:50px', onInput: e => { p.from = Number(e.target.value); this.save(); } }),
              h('span', { text: '→', style: 'padding:5px' }),
              h('input', { class: 'rb-input', type: 'number', value: p.to, style: 'width:50px', onInput: e => { p.to = Number(e.target.value); this.save(); } }),
              h('button', { text: '✕', style: 'color:#ff5a7a; background:none; border:none; cursor:pointer;', onClick: () => { t.properties.splice(pi, 1); this.save(); } })
            ]))
          ]) : null
        ]);
        this.body.appendChild(trackCard);
      });
    }
  }

  // Inject Base Styles
  const style = document.createElement('style');
  style.textContent = `
    .rb-btn { background:#1d2236; border:1px solid #2a2f45; color:#ccc; padding:6px 12px; border-radius:8px; cursor:pointer; font-size:12px; transition:all 0.2s; }
    .rb-btn:hover { background:#2a2f45; color:#fff; border-color:#5b7cff; }
    .rb-btn.primary { background:#5b7cff; border-color:#5b7cff; color:#fff; }
    .rb-input, .rb-select { background:#0c0f1b; border:1px solid #2a2f45; color:#fff; padding:6px 10px; border-radius:8px; flex:1; font-size:12px; }
    .rb-input:focus { border-color:#5b7cff; outline:none; }
  `;
  document.head.appendChild(style);

  RB.Editor = new Editor();
})();
