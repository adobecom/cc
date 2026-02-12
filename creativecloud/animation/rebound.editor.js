/* rebound.editor.js - Complete Rebound Editor v0.5.1
   - Includes Advanced Picker (Multi-select, DOM Walker)
   - Restores JSON upload/download
   - Fixes "Editor doesn't reappear" bug
*/
(() => {
  'use strict';

  const RB = (window.Rebound = window.Rebound || {});
  if (!RB.Runtime) console.warn('[Rebound] Load runtime first.');

  const STORAGE_KEY = 'rebound:config:v1';
  const UI_KEY = 'rebound:ui:v1';

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

  function safeJson(t) { try { return JSON.parse(t); } catch { return null; } }
  function cssEsc(s) { return window.CSS?.escape ? CSS.escape(s) : String(s).replace(/[^a-zA-Z0-9_-]/g, '\\$&'); }
  
  function downloadFile(name, text) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], {type:'application/json'}));
    a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
  }

  // Generates selector. If unique ID, use it. Else path.
  function getSelector(root, el) {
    if (!root || !el) return '';
    if (el === root) return ':scope';
    if (el.id && document.querySelectorAll(`#${cssEsc(el.id)}`).length === 1) return `#${cssEsc(el.id)}`;
    
    const parts = [];
    let cur = el;
    while (cur && cur.nodeType === 1 && cur !== root) {
      const parent = cur.parentElement;
      if (!parent) break;
      const sibs = Array.from(parent.children);
      const tag = cur.tagName.toLowerCase();
      
      if (cur.className) {
        const cls = '.' + cur.classList[0]; // try first class
        if (parent.querySelectorAll(cls).length === 1) {
            parts.unshift(cls);
            cur = parent;
            continue;
        }
      }
      const idx = sibs.indexOf(cur) + 1;
      parts.unshift(`${tag}:nth-child(${idx})`);
      cur = parent;
    }
    parts.unshift(':scope');
    return parts.join(' > ');
  }

  // Generates comma-separated selector for multi-select
  function generateMultiSelector(root, elements) {
    const unique = Array.from(new Set(elements));
    if (!unique.length) return '';
    return unique.map(el => getSelector(root, el).replace(/^:scope > /, '')).join(', ');
  }

  function defaultConfig() {
    return { version: 1, settings: { navHeight: 64 }, animations: [{ name: 'anim-1', scopeSelector: 'body', tracks: [] }] };
  }
  function newTrack() {
    return { targetSelector: '', withinScope: true, trigger: { type: 'scroll', progress: 'exit', start:0, end:100 }, engine: 'css', properties: [] };
  }

  // ---------------- Advanced Picker ----------------
  const Picker = (() => {
    let overlay, hud, active = false, options = {};
    let selectedSet = new Set(), currentHover = null;

    function ensureCss() {
      if (document.getElementById('rb-picker-css')) return;
      const s = document.createElement('style');
      s.id = 'rb-picker-css';
      s.textContent = `
        .rb-p-ov { position:fixed; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:2147483645; }
        .rb-p-box { position:absolute; border:2px solid #5b7cff; background:rgba(91,124,255,0.1); border-radius:4px; pointer-events:none; transition:all 0.1s; }
        .rb-p-box.sel { border-color:#2ecc71; background:rgba(46,204,113,0.15); z-index:2; }
        .rb-p-hud { position:fixed; z-index:2147483646; bottom:30px; left:50%; transform:translateX(-50%); background:#11152a; border:1px solid #2a2f45; border-radius:12px; padding:10px; width:280px; font-family:sans-serif; color:#fff; box-shadow:0 10px 40px rgba(0,0,0,0.5); pointer-events:auto; display:flex; flex-direction:column; gap:8px; }
        .rb-p-row { display:flex; justify-content:space-between; align-items:center; gap:8px; }
        .rb-p-btn { background:#1d2236; border:1px solid #2a2f45; color:#ccc; border-radius:6px; padding:6px 10px; font-size:12px; cursor:pointer; flex:1; text-align:center; }
        .rb-p-btn:hover { background:#2a2f45; color:#fff; }
        .rb-p-btn.pri { background:#5b7cff; border-color:#5b7cff; color:#fff; }
        .rb-p-crumbs { display:flex; gap:4px; overflow-x:auto; padding-bottom:4px; }
        .rb-p-crumb { font-size:10px; padding:2px 5px; background:#0c0f1b; border-radius:4px; white-space:nowrap; cursor:pointer; }
        .rb-p-crumb:hover { background:#5b7cff; }
      `;
      document.head.appendChild(s);
    }

    function render() {
      if (!overlay || !hud) return;
      overlay.innerHTML = '';
      hud.innerHTML = '';

      // Overlay Boxes
      const draw = (el, cls) => {
        if (!el.isConnected) return;
        const r = el.getBoundingClientRect();
        overlay.appendChild(h('div', { class:`rb-p-box ${cls}`, style:`left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px` }));
      };
      selectedSet.forEach(el => draw(el, 'sel'));
      if (currentHover && !selectedSet.has(currentHover)) draw(currentHover, '');

      // HUD
      const target = currentHover || Array.from(selectedSet).pop();
      const name = target ? (target.tagName.toLowerCase() + (target.id?`#${target.id}` : (target.classList.length?`.${target.classList[0]}`:''))) : 'Hover to select';
      
      // Breadcrumbs
      if (target) {
        const crumbs = h('div', { class:'rb-p-crumbs' });
        let p = target, c = 0;
        while(p && p!==document.body && c++ < 5) {
            const el = p; 
            crumbs.prepend(h('div', { class:'rb-p-crumb', text: el.tagName.toLowerCase(), onClick:(e)=>{e.stopPropagation(); setHover(el);} }));
            p = p.parentElement;
        }
        hud.appendChild(crumbs);
      }

      hud.appendChild(h('div', { class:'rb-p-row' }, [
        h('div', { style:'font-weight:bold;font-size:13px', text: name }),
        h('div', { style:'font-size:11px;color:#888', text: target ? `${Math.round(target.offsetWidth)}x${Math.round(target.offsetHeight)}` : '' })
      ]));

      // Walker
      if (target) {
         const walk = (d) => {
             let n;
             if(d=='u') n=target.parentElement;
             if(d=='d') n=target.firstElementChild;
             if(d=='p') n=target.previousElementSibling;
             if(d=='n') n=target.nextElementSibling;
             if(n && n.nodeType===1) setHover(n);
         };
         hud.appendChild(h('div', { class:'rb-p-row' }, [
             h('button', { class:'rb-p-btn', html:'&uarr;', onClick:()=>walk('u') }),
             h('button', { class:'rb-p-btn', html:'&darr;', onClick:()=>walk('d') }),
             h('button', { class:'rb-p-btn', html:'&larr;', onClick:()=>walk('p') }),
             h('button', { class:'rb-p-btn', html:'&rarr;', onClick:()=>walk('n') }),
         ]));
      }

      // Actions
      const isSel = target && selectedSet.has(target);
      const btnSel = h('button', { 
          class:`rb-p-btn ${isSel?'':'pri'}`, 
          text: isSel ? 'Deselect' : 'Select',
          onClick: (e) => { e.stopPropagation(); if(target) { if(isSel) selectedSet.delete(target); else selectedSet.add(target); render(); } }
      });
      const btnDone = h('button', { class:'rb-p-btn pri', text:`Done (${selectedSet.size})`, onClick: finish });

      hud.appendChild(h('div', { class:'rb-p-row', style:'margin-top:5px;border-top:1px solid #2a2f45;padding-top:8px' }, [ btnSel, btnDone ]));
    }

    function setHover(el) { if(currentHover !== el) { currentHover = el; render(); } }
    function finish() { cleanup(); options.onPick?.(Array.from(selectedSet)); }
    function cleanup() {
      active = false;
      overlay?.remove(); hud?.remove();
      window.removeEventListener('mousemove', onMove, true);
      window.removeEventListener('click', onClick, true);
      window.removeEventListener('keydown', onKey, true);
      window.removeEventListener('scroll', render, true);
    }

    const onMove = (e) => {
        const el = document.elementFromPoint(e.clientX, e.clientY);
        if(!el || el.closest('.rb-p-hud') || (options.ignore && el.closest(options.ignore))) return;
        setHover(el);
    };
    const onClick = (e) => {
        if(e.target.closest('.rb-p-hud')) return;
        e.preventDefault(); e.stopPropagation();
        const el = document.elementFromPoint(e.clientX, e.clientY);
        if(!el || (options.ignore && el.closest(options.ignore))) return;
        if(selectedSet.has(el)) selectedSet.delete(el); else selectedSet.add(el);
        render();
    };
    const onKey = (e) => {
        if(e.key === 'Escape') { cleanup(); options.onCancel?.(); }
        if(e.key === 'Enter') finish();
    };

    return {
      pick: (opts) => {
        if(active) return;
        active = true; options = opts; selectedSet = new Set();
        ensureCss();
        overlay = h('div', { class:'rb-p-ov' });
        hud = h('div', { class:'rb-p-hud' });
        document.body.appendChild(overlay);
        document.body.appendChild(hud);
        render();
        window.addEventListener('mousemove', onMove, true);
        window.addEventListener('click', onClick, true);
        window.addEventListener('keydown', onKey, true);
        window.addEventListener('scroll', render, {passive:true, capture:true});
      }
    };
  })();

  // ---------------- Editor UI ----------------
  class ReboundEditor {
    constructor({ openButton, storageKey = STORAGE_KEY, onSave } = {}) {
      this.storageKey = storageKey;
      this.onSave = onSave;
      this.config = safeJson(localStorage.getItem(this.storageKey)) || defaultConfig();
      this.selAnimIdx = 0;
      this.editTrackIdx = -1;
      this.jsonVisible = false;

      if(openButton) openButton.addEventListener('click', () => this.open());
      
      const ui = safeJson(localStorage.getItem(UI_KEY));
      if(ui?.minimized) this.showDock();
      
      this.injectStyles();
      // Auto-update runtime
      try{ RB.Runtime?.mountSingleton?.(this.config); }catch{}
    }

    injectStyles() {
      if(document.getElementById('rb-css')) return;
      const s = document.createElement('style');
      s.id = 'rb-css';
      s.textContent = `
        .rb-panel { position:fixed; z-index:2147483647; background:#11152a; border:1px solid #2a2f45; border-radius:12px; color:#f5f7ff; width:500px; max-height:85vh; display:flex; flex-direction:column; box-shadow:0 20px 60px rgba(0,0,0,0.6); font-family:system-ui,sans-serif; }
        .rb-head { padding:12px; border-bottom:1px solid #2a2f45; background:#0c0f1b; display:flex; justify-content:space-between; align-items:center; cursor:grab; border-radius:12px 12px 0 0; }
        .rb-body { padding:12px; overflow-y:auto; flex:1; }
        .rb-sec { background:#151a2e; border:1px solid #2a2f45; border-radius:8px; padding:12px; margin-bottom:10px; }
        .rb-row { display:flex; gap:10px; align-items:center; }
        .rb-col { display:flex; flex-direction:column; gap:6px; flex:1; }
        .rb-btn { background:#1d2236; border:1px solid #2a2f45; color:#ccc; padding:6px 12px; border-radius:6px; cursor:pointer; font-size:12px; white-space:nowrap; }
        .rb-btn:hover { background:#2a2f45; color:#fff; }
        .rb-btn.pri { background:#5b7cff; border-color:#5b7cff; color:#fff; }
        .rb-btn.dan { border-color:#ff5a7a; color:#ff5a7a; background:rgba(255,90,122,0.1); }
        .rb-inp, .rb-sel { background:#0c0f1b; border:1px solid #2a2f45; color:#fff; padding:8px; border-radius:6px; width:100%; outline:none; font-size:13px; }
        .rb-lbl { font-size:11px; color:#888; text-transform:uppercase; font-weight:bold; }
        .rb-dock { position:fixed; bottom:20px; right:20px; z-index:2147483647; background:#11152a; padding:10px; border-radius:30px; border:1px solid #2a2f45; cursor:pointer; display:flex; align-items:center; gap:10px; color:#fff; box-shadow:0 5px 20px rgba(0,0,0,0.5); }
      `;
      document.head.appendChild(s);
    }

    save() {
      localStorage.setItem(this.storageKey, JSON.stringify(this.config));
      try{ RB.Runtime?.mountSingleton?.(this.config); }catch{}
    }

    open() {
      if(!this.panel) {
        this.panel = h('div', { class:'rb-panel' }, [
          h('div', { class:'rb-head', onPointerDown:e=>this.drag(e) }, [
             h('div', { style:'font-weight:bold', text:'Rebound Editor' }),
             h('div', { class:'rb-row' }, [
               h('button', { class:'rb-btn', text:'Min', onClick:()=>this.minimize() }),
               h('button', { class:'rb-btn', text:'Close', onClick:()=>this.close() })
             ])
          ]),
          (this.body = h('div', { class:'rb-body' }))
        ]);
        document.body.appendChild(this.panel);
        this.restorePos();
        this.render();
      }
      this.panel.style.display = 'flex';
      if(this.dock) this.dock.style.display = 'none';
      localStorage.setItem(UI_KEY, JSON.stringify({minimized:false}));
    }

    close() { if(this.panel) this.panel.style.display='none'; }
    minimize() { if(this.panel) this.panel.style.display='none'; this.showDock(); }
    showDock() {
      if(!this.dock) {
        this.dock = h('div', { class:'rb-dock', onClick:()=>this.open() }, [
          h('div', { text:'⚡ Rebound' })
        ]);
        document.body.appendChild(this.dock);
      }
      this.dock.style.display = 'flex';
      localStorage.setItem(UI_KEY, JSON.stringify({minimized:true}));
    }

    drag(e) {
      if(e.target.tagName==='BUTTON') return;
      e.target.setPointerCapture(e.pointerId);
      const dx = e.clientX - this.panel.offsetLeft;
      const dy = e.clientY - this.panel.offsetTop;
      const move = ev => {
        this.panel.style.left = Math.max(0,ev.clientX-dx)+'px';
        this.panel.style.top = Math.max(0,ev.clientY-dy)+'px';
      };
      const up = () => {
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
        localStorage.setItem(UI_KEY, JSON.stringify({minimized:false, pos:{left:this.panel.style.left, top:this.panel.style.top}}));
      };
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
    }
    restorePos() {
      const u = safeJson(localStorage.getItem(UI_KEY));
      this.panel.style.left = u?.pos?.left || '20px';
      this.panel.style.top = u?.pos?.top || '20px';
    }

    // Helper to hide editor while picking
    pick(opts) {
      this.panel.style.display = 'none';
      Picker.pick({
        ignore: '.rb-panel, .rb-dock',
        onPick: (els) => { this.panel.style.display = 'flex'; opts.onPick(els); },
        onCancel: () => { this.panel.style.display = 'flex'; }
      });
    }

    render() {
      if(!this.body) return;
      this.body.innerHTML = '';
      const anim = this.config.animations[this.selAnimIdx] || this.config.animations[0];

      // 1. Settings
      this.body.appendChild(h('div', { class:'rb-sec' }, [
        h('div', { class:'rb-row' }, [
          h('div', { class:'rb-col' }, [ h('div', { class:'rb-lbl', text:'Animation Name' }), h('input', { class:'rb-inp', value:anim.name, onInput:e=>{anim.name=e.target.value; this.save();} }) ]),
          h('div', { class:'rb-col' }, [ h('div', { class:'rb-lbl', text:'Nav Height' }), h('input', { class:'rb-inp', type:'number', value:this.config.settings?.navHeight||0, onInput:e=>{this.config.settings.navHeight=Number(e.target.value); this.save();} }) ]),
        ])
      ]));

      // 2. Scope
      this.body.appendChild(h('div', { class:'rb-sec' }, [
        h('div', { class:'rb-lbl', text:'Scope Selector' }),
        h('div', { class:'rb-row' }, [
          h('input', { class:'rb-inp', value:anim.scopeSelector, onInput:e=>{anim.scopeSelector=e.target.value; this.save();} }),
          h('button', { class:'rb-btn', text:'Pick', onClick:() => this.pick({ onPick: els => {
            if(els.length) { anim.scopeSelector = getSelector(document, els[0]); this.save(); this.render(); }
          }}) })
        ])
      ]));

      // 3. Tracks
      const list = h('div', { class:'rb-col' });
      (anim.tracks||[]).forEach((t, i) => {
        list.appendChild(h('div', { class:'rb-sec', style:'cursor:pointer;margin-bottom:5px', onClick:()=>{this.editTrackIdx=i; this.render();} }, [
          h('div', { style:'font-weight:bold', text: t.targetSelector || '(No Target)' }),
          h('div', { style:'font-size:11px;opacity:0.7', text: `${t.trigger.type} · ${t.properties.length} props` })
        ]));
      });

      this.body.appendChild(h('div', { class:'rb-row', style:'justify-content:space-between;margin-bottom:10px' }, [
        h('div', { class:'rb-lbl', text:'Tracks' }),
        h('button', { class:'rb-btn pri', text:'+ Add Track', onClick:()=>{ (anim.tracks=anim.tracks||[]).push(newTrack()); this.editTrackIdx=anim.tracks.length-1; this.save(); this.render(); } })
      ]));
      this.body.appendChild(list);

      // 4. JSON / Import / Export
      const jsonArea = this.jsonVisible ? h('textarea', { class:'rb-inp', style:'height:200px;font-family:monospace', value:JSON.stringify(this.config,null,2), onInput:e=>{ const p=safeJson(e.target.value); if(p){this.config=p; this.save();} } }) : null;
      
      const fileIn = h('input', { type:'file', style:'display:none', accept:'.json', onChange: async e => {
         if(e.target.files[0]) {
           const t = await e.target.files[0].text();
           const c = safeJson(t);
           if(c) { this.config = c; this.selAnimIdx=0; this.save(); this.render(); }
         }
      }});

      this.body.appendChild(h('div', { class:'rb-sec' }, [
        h('div', { class:'rb-row', style:'flex-wrap:wrap' }, [
          h('button', { class:'rb-btn', text:'Download JSON', onClick:()=>downloadFile('rebound-config.json', JSON.stringify(this.config,null,2)) }),
          h('button', { class:'rb-btn', text:'Upload JSON', onClick:()=>fileIn.click() }),
          h('button', { class:'rb-btn', text: this.jsonVisible?'Hide JSON':'Show JSON', onClick:()=>{this.jsonVisible=!this.jsonVisible; this.render();} }),
          h('button', { class:'rb-btn pri', text:'Run onSave()', onClick:()=>this.onSave?.(JSON.stringify(this.config)) }),
        ]),
        jsonArea
      ]));

      // 5. Track Editor Overlay
      if(this.editTrackIdx > -1 && anim.tracks[this.editTrackIdx]) {
        this.renderTrackEdit(anim, anim.tracks[this.editTrackIdx]);
      }
    }

    renderTrackEdit(anim, track) {
      const editor = h('div', { class:'rb-panel', style:`left:${parseInt(this.panel.style.left)+520}px;top:${this.panel.style.top};height:${this.panel.offsetHeight}px` });
      
      const refresh = () => { this.save(); this.renderTrackEdit(anim, track); }; // re-render self
      
      const head = h('div', { class:'rb-head', onPointerDown:e=>{e.target.setPointerCapture(e.pointerId); const dx=e.clientX-editor.offsetLeft; const dy=e.clientY-editor.offsetTop; const m=ev=>{editor.style.left=(ev.clientX-dx)+'px'; editor.style.top=(ev.clientY-dy)+'px';}; const u=()=>{window.removeEventListener('pointermove',m);window.removeEventListener('pointerup',u);}; window.addEventListener('pointermove',m); window.addEventListener('pointerup',u);} }, [
        h('div', { text:`Track #${this.editTrackIdx+1}` }),
        h('button', { class:'rb-btn', text:'Done', onClick:()=>{ editor.remove(); this.editTrackIdx=-1; this.render(); } })
      ]);
      
      const body = h('div', { class:'rb-body' });

      // Target
      body.appendChild(h('div', { class:'rb-sec' }, [
        h('div', { class:'rb-lbl', text:'Target Elements' }),
        h('div', { class:'rb-row' }, [
          h('input', { class:'rb-inp', value:track.targetSelector, onInput:e=>{track.targetSelector=e.target.value; this.save();} }),
          h('button', { class:'rb-btn pri', text:'Select', onClick:() => {
             editor.style.display='none'; 
             this.pick({ onPick: els => {
                editor.style.display='flex';
                if(els.length) {
                  const scope = document.querySelector(anim.scopeSelector);
                  track.targetSelector = generateMultiSelector(scope || document.body, els);
                  this.save();
                  // Manually update input to avoid full re-render flickering
                  editor.querySelector('input').value = track.targetSelector;
                }
             }});
          }})
        ])
      ]));

      // Trigger
      const trig = track.trigger;
      body.appendChild(h('div', { class:'rb-sec' }, [
        h('div', { class:'rb-lbl', text:'Trigger Type' }),
        h('select', { class:'rb-sel', onChange:e=>{trig.type=e.target.value; refresh();} }, [
          h('option',{value:'scroll',text:'Scroll',selected:trig.type=='scroll'}),
          h('option',{value:'hover',text:'Hover',selected:trig.type=='hover'}),
          h('option',{value:'click',text:'Click',selected:trig.type=='click'}),
          h('option',{value:'view',text:'View (In Viewport)',selected:trig.type=='view'}),
        ]),
        h('div', { style:'margin-top:10px' }, trig.type==='scroll' ? [
          h('div', { class:'rb-row' }, [
             h('div',{class:'rb-col'},[ h('div',{class:'rb-lbl',text:'Start %'}), h('input',{class:'rb-inp',type:'number',value:trig.start,onInput:e=>{trig.start=Number(e.target.value);this.save();}}) ]),
             h('div',{class:'rb-col'},[ h('div',{class:'rb-lbl',text:'End %'}), h('input',{class:'rb-inp',type:'number',value:trig.end,onInput:e=>{trig.end=Number(e.target.value);this.save();}}) ])
          ]),
          h('div',{class:'rb-row',style:'margin-top:5px'}, [
             h('div',{class:'rb-lbl',text:'Progress:'}),
             h('select',{class:'rb-sel',onChange:e=>{trig.progress=e.target.value;this.save();}},[
               h('option',{value:'exit',text:'Exit (Parallax)',selected:trig.progress!='enter'},{}),
               h('option',{value:'enter',text:'Enter (Reveal)',selected:trig.progress=='enter'},{})
             ])
          ])
        ] : [
          h('div', { class:'rb-row' }, [
             h('div',{class:'rb-col'},[ h('div',{class:'rb-lbl',text:'Duration (ms)'}), h('input',{class:'rb-inp',type:'number',value:trig.duration||300,onInput:e=>{trig.duration=Number(e.target.value);this.save();}}) ])
          ])
        ])
      ]));

      // Properties
      const props = h('div', { class:'rb-col' });
      track.properties.forEach((p, i) => {
        const row = h('div', { class:'rb-row', style:'background:#0c0f1b;padding:5px;border-radius:4px' }, [
          h('div', { text:p.type, style:'font-size:11px;width:60px' }),
          h('input', { class:'rb-inp', type:'number', style:'padding:4px', value:p.from, placeholder:'From', onInput:e=>{p.from=Number(e.target.value);this.save();} }),
          h('input', { class:'rb-inp', type:'number', style:'padding:4px', value:p.to, placeholder:'To', onInput:e=>{p.to=Number(e.target.value);this.save();} }),
          h('button', { class:'rb-btn dan', text:'x', style:'padding:4px 8px', onClick:()=>{track.properties.splice(i,1); refresh();} })
        ]);
        props.appendChild(row);
      });

      body.appendChild(h('div', { class:'rb-sec' }, [
         h('div', { class:'rb-row', style:'justify-content:space-between;margin-bottom:5px' }, [
           h('div', { class:'rb-lbl', text:'Properties' }),
           h('select', { class:'rb-sel', style:'width:100px;padding:4px', onChange:e=>{
              if(e.target.value==='0')return;
              const t = e.target.value;
              const def = {type:t, from:0, to:(t=='scale'||t=='opacity'?1:100), unit:(t=='rotate'?'deg':'px')};
              track.properties.push(def); refresh();
           }}, [
             h('option',{value:'0',text:'+ Add'}),
             h('option',{value:'translateY',text:'Translate Y'}),
             h('option',{value:'translateX',text:'Translate X'}),
             h('option',{value:'opacity',text:'Opacity'}),
             h('option',{value:'scale',text:'Scale'}),
             h('option',{value:'rotate',text:'Rotate'}),
             h('option',{value:'parallaxY',text:'Parallax Var'}),
           ])
         ]),
         props
      ]));

      // Clean up old overlay if exists
      const old = document.querySelectorAll('.rb-panel');
      if(old.length > 1) old[1].remove();

      editor.appendChild(head);
      editor.appendChild(body);
      document.body.appendChild(editor);
    }
  }

  RB.Editor = ReboundEditor;
})();
