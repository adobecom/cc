/* rebound.runtime.js - Rebound Runtime v0.5.1
   - Auto-mounts animations.
   - Supports comma-separated selectors for multi-element tracks.
*/
(() => {
  'use strict';

  const RB = (window.Rebound = window.Rebound || {});
  const VERSION = '0.5.1';
  const DEFAULT_STORAGE_KEY = 'rebound:config:v1';

  // ---------- Utils ----------
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const lerp = (a, b, t) => a + (b - a) * t;

  const Easings = {
    linear: (t) => t,
    easeInOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  };

  function toNum(v, fallback = 0) {
    const n = typeof v === 'number' ? v : Number(v);
    return Number.isFinite(n) ? n : fallback;
  }

  function fmt(n) {
    return (Math.round(toNum(n, 0) * 100000) / 100000).toString();
  }

  function fmtVal(n, unit) {
    const u = unit == null ? '' : String(unit);
    return `${fmt(n)}${u}`;
  }

  function cssEscape(s) {
    if (window.CSS && typeof window.CSS.escape === 'function') return window.CSS.escape(s);
    return String(s).replace(/[^a-zA-Z0-9_-]/g, '\\$&');
  }

  function safeParseJson(text) {
    try { return JSON.parse(text); } catch { return null; }
  }

  // Convert ":scope > .a, .b" -> "[data-rb-scope] .a, [data-rb-scope] .b"
  function scopeSelectorToCss(scopeAttrSel, targetSelector, withinScope) {
    const raw = (targetSelector || '').trim();
    if (!raw) return null;
    if (raw === ':scope') return scopeAttrSel;

    // Split selector by comma to prefix each part
    const parts = raw.split(',');
    
    return parts.map(part => {
      const sel = part.trim();
      if (!sel) return '';
      if (sel.startsWith(':scope')) return sel.replace(/^:scope\b/, scopeAttrSel);
      if (withinScope !== false) return `${scopeAttrSel} ${sel}`;
      return sel;
    }).filter(Boolean).join(', ');
  }

  // ---------- CSS Generation ----------
  function ratioExpr(progressVar, start, end) {
    const s = toNum(start, 0);
    const e = toNum(end, 100);
    if (e === s) return '1';
    return `((clamp(${s}, ${progressVar}, ${e}) - ${s}) / (${e} - ${s}))`;
  }

  function buildScrollCssRule({ selector, trigger, properties }) {
    const progressVar = trigger.progress === 'enter' ? 'var(--enter-progress, 0)' : 'var(--exit-progress, 0)';
    const ratio = ratioExpr(progressVar, trigger.start, trigger.end);
    
    const tf = [];
    let opacityDecl = '';
    
    for (const p of properties || []) {
      if (!p || !p.type) continue;
      
      const unit = p.unit || (p.type === 'rotate' ? 'deg' : (p.type === 'scale' ? '' : 'px'));
      const from = p.from ?? (p.type === 'scale' ? 1 : 0);
      const to = p.to ?? (p.type === 'scale' ? 1 : 0);
      const fromS = fmtVal(from, unit);
      const toS = fmtVal(to, unit);

      if (p.type === 'opacity') {
        opacityDecl = `opacity: calc(${from} + (${to} - ${from}) * ${ratio});`;
      } else if (['translateY', 'translateX', 'rotate', 'scale'].includes(p.type)) {
        tf.push(`${p.type}(calc(${fromS} + (${toS} - ${fromS}) * ${ratio}))`);
      } else if (p.type === 'parallaxY') {
        tf.push(`translateY(calc(var(--base-offset, 0px) + var(--parallax-distance, 0px) * ${ratio}))`);
      }
    }

    const decls = [];
    if (tf.length || opacityDecl) {
      const wc = [];
      if (tf.length) wc.push('transform');
      if (opacityDecl) wc.push('opacity');
      decls.push(`will-change: ${wc.join(', ')};`);
    }

    if (tf.length) decls.push(`transform: ${tf.join(' ')};`);
    if (opacityDecl) decls.push(opacityDecl);

    if (!decls.length) return '';
    return `${selector} {\n  ${decls.join('\n  ')}\n}\n`;
  }

  // ---------- JS Events ----------
  function applyEventProperties(el, properties, t) {
    const tf = { translateX: null, translateY: null, rotate: null, scale: null };
    let hasTf = false;

    for (const p of properties || []) {
      if (!p || !p.type) continue;
      if (p.type === 'opacity') {
        el.style.opacity = String(lerp(toNum(p.from, 1), toNum(p.to, 1), t));
      } else if (['translateY', 'translateX', 'rotate', 'scale'].includes(p.type)) {
        hasTf = true;
        const unit = p.unit || (p.type === 'rotate' ? 'deg' : (p.type === 'scale' ? '' : 'px'));
        tf[p.type] = `${lerp(toNum(p.from, p.type === 'scale'?1:0), toNum(p.to, p.type === 'scale'?1:0), t)}${unit}`;
      }
    }

    if (hasTf) {
      const out = [];
      if (tf.translateX != null) out.push(`translateX(${tf.translateX})`);
      if (tf.translateY != null) out.push(`translateY(${tf.translateY})`);
      if (tf.rotate != null) out.push(`rotate(${tf.rotate})`);
      if (tf.scale != null) out.push(`scale(${tf.scale})`);
      el.style.transform = out.join(' ');
    }
  }

  function tween({ from, to, duration, easing, onUpdate }) {
    const ease = Easings[easing] || Easings.easeInOutCubic;
    const start = performance.now();
    let cancelled = false;
    function frame(now) {
      if (cancelled) return;
      const p = clamp((now - start) / Math.max(1, duration), 0, 1);
      const e = ease(p);
      onUpdate(lerp(from, to, e));
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    return () => { cancelled = true; };
  }

  function resolveTargets(scopeEl, track) {
    const sel = (track.targetSelector || '').trim();
    if (!sel) return [];
    if (sel === ':scope') return [scopeEl];
    try {
      if (track.withinScope !== false) return Array.from(scopeEl.querySelectorAll(sel));
      return Array.from(document.querySelectorAll(sel));
    } catch { return []; }
  }

  // ---------- Main Mount Logic ----------
  let ACTIVE = null;
  let MOUNT_SEQ = 0;

  function mount(config) {
    if (!config || typeof config !== 'object') throw new Error('[Rebound] Invalid config');
    
    const mountId = ++MOUNT_SEQ;
    const navHeight = toNum(config.settings?.navHeight, 64);
    
    // Create Style Tag
    const styleEl = document.createElement('style');
    styleEl.setAttribute('data-rb-runtime', mountId);
    document.head.appendChild(styleEl);

    const destroyFns = [];
    const scopeItems = [];
    let cssOut = '';
    const observers = [];

    (config.animations || []).forEach((anim, ai) => {
      if (!anim.scopeSelector) return;
      let scopeEls;
      try { scopeEls = document.querySelectorAll(anim.scopeSelector); } catch { return; }

      scopeEls.forEach((scopeEl, si) => {
        const scopeId = `rb-${mountId}-${ai}-${si}`;
        scopeEl.setAttribute('data-rb-scope', scopeId);
        scopeItems.push({ scopeEl, navHeight });
        const scopeAttrSel = `[data-rb-scope="${cssEscape(scopeId)}"]`;

        (anim.tracks || []).forEach(track => {
          if (!track.trigger) return;

          // 1. Scroll (CSS)
          if (track.trigger.type === 'scroll' && track.engine === 'css') {
            // Static Vars
            resolveTargets(scopeEl, track).forEach(el => {
              track.properties?.forEach(p => {
                if (p.type === 'parallaxY') {
                   const u = p.unit || 'px';
                   el.style.setProperty('--base-offset', fmtVal(p.base, u));
                   el.style.setProperty('--parallax-distance', fmtVal(p.distance, u));
                }
              });
            });

            const cssSel = scopeSelectorToCss(scopeAttrSel, track.targetSelector, track.withinScope);
            if (cssSel) {
              cssOut += buildScrollCssRule({
                selector: cssSel,
                trigger: track.trigger,
                properties: track.properties
              });
            }
          }
          // 2. Events (JS)
          else {
            resolveTargets(scopeEl, track).forEach(el => {
              let cancel = null;
              let t = 0;
              const setT = (v) => { t = v; applyEventProperties(el, track.properties, v); };
              setT(0); // init

              const { type, duration, easing, once, reverseOnExit } = track.trigger;
              
              if (type === 'hover') {
                const onOver = () => { if(cancel) cancel(); cancel = tween({from:t, to:1, duration, easing, onUpdate:setT}); };
                const onOut = () => { if(cancel) cancel(); cancel = tween({from:t, to:0, duration, easing, onUpdate:setT}); };
                el.addEventListener('mouseenter', onOver);
                el.addEventListener('mouseleave', onOut);
                destroyFns.push(() => { el.removeEventListener('mouseenter', onOver); el.removeEventListener('mouseleave', onOut); });
              } 
              else if (type === 'click') {
                let active = false;
                const onCk = () => { active=!active; if(cancel) cancel(); cancel = tween({from:t, to:active?1:0, duration, easing, onUpdate:setT}); };
                el.addEventListener('click', onCk);
                destroyFns.push(() => el.removeEventListener('click', onCk));
              }
              else if (type === 'view') {
                 if (!window.IntersectionObserver) { setT(1); return; }
                 let played = false;
                 const ob = new IntersectionObserver(entries => {
                   entries.forEach(e => {
                     if (e.isIntersecting) {
                       if (once && played) return;
                       played = true;
                       if(cancel) cancel(); cancel = tween({from:t, to:1, duration, easing, onUpdate:setT});
                     } else if (reverseOnExit !== false && (!once || !played)) {
                       if(cancel) cancel(); cancel = tween({from:t, to:0, duration, easing, onUpdate:setT});
                     }
                   });
                 }, { threshold: track.trigger.threshold || 0.1 });
                 ob.observe(el);
                 observers.push(ob);
              }
            });
          }
        });
      });
    });

    styleEl.textContent = cssOut;

    // Scroll Loop
    let ticking = false;
    const compute = (el, nh) => {
      const h = el.offsetHeight;
      if (!h) return;
      const r = el.getBoundingClientRect();
      const wh = window.innerHeight;
      el.style.setProperty('--enter-progress', fmt(clamp((wh - r.top)/h, 0, 1) * 100));
      el.style.setProperty('--exit-progress', fmt(clamp((-r.top + nh)/h, 0, 1) * 100));
    };

    const updateAll = () => scopeItems.forEach(i => compute(i.scopeEl, i.navHeight));
    const onScroll = () => { if(!ticking){ ticking=true; requestAnimationFrame(()=>{ticking=false; updateAll();}); } };
    
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    destroyFns.push(() => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); });

    return {
      destroy: () => {
        styleEl.remove();
        observers.forEach(o => o.disconnect());
        destroyFns.forEach(f => f());
        scopeItems.forEach(i => i.scopeEl.removeAttribute('data-rb-scope'));
      }
    };
  }

  function mountSingleton(cfg) {
    if (ACTIVE) try { ACTIVE.destroy(); } catch {}
    ACTIVE = mount(cfg);
    return ACTIVE;
  }

  const load = (k) => safeParseJson(localStorage.getItem(k));
  const auto = (k = DEFAULT_STORAGE_KEY) => mountSingleton(load(k));

  RB.Runtime = { version: VERSION, mountSingleton, autoMountFromStorage: auto };
  
  if (window.__REBOUND_DISABLE_AUTOMOUNT__ !== true) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => auto());
    else auto();
  }
})();
