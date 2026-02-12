/* rebound.runtime.js - Rebound Runtime (auto-mount + scroll progress + events)
   - Auto mounts from localStorage on page load
   - Handles comma-separated selectors correctly within scopes
*/
(() => {
  'use strict';

  const RB = (window.Rebound = window.Rebound || {});
  const VERSION = '0.5.0';
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

  // Convert ":scope > ..." to "[data-rb-scope="X"] > ..."
  // Handles comma-separated lists: ".a, .b" -> "[scope] .a, [scope] .b"
  function scopeSelectorToCss(scopeAttrSel, targetSelector, withinScope) {
    const raw = (targetSelector || '').trim();
    if (!raw) return null;

    if (raw === ':scope') return scopeAttrSel;

    // Split by comma, respecting parentheses (simple split for now, robust enough for basic selectors)
    const parts = raw.split(',');

    return parts.map(part => {
      const sel = part.trim();
      if (!sel) return '';
      
      if (sel.startsWith(':scope')) {
        return sel.replace(/^:scope\b/, scopeAttrSel);
      }
      
      if (withinScope !== false) {
        return `${scopeAttrSel} ${sel}`;
      }
      return sel;
    }).filter(Boolean).join(', ');
  }

  // ---------- Progress (AUTO) ----------
  function computeAndSetProgress(scopeEl, navHeight) {
    if (!scopeEl || !scopeEl.isConnected) return;

    const elHeight = scopeEl.offsetHeight;
    if (!elHeight || elHeight < 2) return;

    const rect = scopeEl.getBoundingClientRect();
    const screenHeight = window.innerHeight || 1;

    const enterProgress = clamp((screenHeight - rect.top) / elHeight, 0, 1);
    const exitProgress = clamp((-rect.top + navHeight) / elHeight, 0, 1);

    scopeEl.style.setProperty('--enter-progress', fmt(enterProgress * 100));
    scopeEl.style.setProperty('--exit-progress', fmt(exitProgress * 100));
  }

  // ---------- CSS generation ----------
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
    const otherDecls = [];

    for (const p of properties || []) {
      if (!p || !p.type) continue;

      if (p.type === 'opacity') {
        const from = toNum(p.from, 1);
        const to = toNum(p.to, 1);
        opacityDecl = `opacity: calc(${from} + (${to} - ${from}) * ${ratio});`;
      } else if (['translateY', 'translateX', 'rotate', 'scale'].includes(p.type)) {
        const unit = p.unit || (p.type === 'rotate' ? 'deg' : (p.type === 'scale' ? '' : 'px'));
        const from = p.from ?? (p.type === 'scale' ? 1 : 0);
        const to = p.to ?? (p.type === 'scale' ? 1 : 0);
        tf.push(`${p.type}(calc(${fmtVal(from, unit)} + (${fmtVal(to, unit)} - ${fmtVal(from, unit)}) * ${ratio}))`);
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
    if (otherDecls.length) decls.push(...otherDecls);

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
        tf[p.type] = `${lerp(toNum(p.from, p.type === 'scale' ? 1 : 0), toNum(p.to, p.type === 'scale' ? 1 : 0), t)}${unit}`;
      }
    }

    if (hasTf) {
      const out = [];
      if (tf.translateX != null) out.push(`translateX(${tf.translateX})`);
      if (tf.translateY != null) out.push(`translateY(${tf.translateY})`);
      if (tf.rotate != null) out.push(`rotate(${tf.rotate})`);
      if (tf.scale != null) out.push(`scale(${tf.scale})`);
      el.style.transform = out.join(' ');
      if (!el.style.willChange) el.style.willChange = 'transform, opacity';
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

  // ---------- Target resolving ----------
  function resolveTargets(scopeEl, track) {
    const sel = (track.targetSelector || '').trim();
    if (!sel) return [];
    if (sel === ':scope') return [scopeEl];

    try {
      if (track.withinScope !== false) return Array.from(scopeEl.querySelectorAll(sel));
      return Array.from(document.querySelectorAll(sel));
    } catch (e) {
      console.warn('[Rebound] Bad selector:', sel, e);
      return [];
    }
  }

  // ---------- Mount / Singleton ----------
  let MOUNT_SEQ = 0;
  let ACTIVE = null;

  function mount(config) {
    if (!config || typeof config !== 'object') throw new Error('[Rebound] Runtime.mount requires config.');

    const mountId = ++MOUNT_SEQ;
    const navHeight = toNum(config?.settings?.navHeight, 64);
    const animations = Array.isArray(config.animations) ? config.animations : [];

    const styleEl = document.createElement('style');
    styleEl.setAttribute('data-rb-runtime-style', String(mountId));
    document.head.appendChild(styleEl);

    const destroyFns = [];
    const observers = [];
    const scopeItems = []; 
    let cssOut = '';

    for (let ai = 0; ai < animations.length; ai++) {
      const anim = animations[ai];
      const scopeSelector = anim && anim.scopeSelector ? String(anim.scopeSelector) : '';
      if (!scopeSelector) continue;

      let scopeEls = [];
      try { scopeEls = Array.from(document.querySelectorAll(scopeSelector)); }
      catch (e) { console.warn('[Rebound] Bad scopeSelector:', scopeSelector, e); continue; }

      const tracks = Array.isArray(anim.tracks) ? anim.tracks : [];

      for (let si = 0; si < scopeEls.length; si++) {
        const scopeEl = scopeEls[si];
        const scopeId = `rb-${mountId}-${ai}-${si}`;
        scopeEl.setAttribute('data-rb-scope', scopeId);
        scopeItems.push({ scopeEl, navHeight, scopeId });
        const scopeAttrSel = `[data-rb-scope="${cssEscape(scopeId)}"]`;

        for (const track of tracks) {
          if (!track || !track.trigger) continue;
          const trig = track.trigger;

          if (trig.type === 'scroll') {
            if (track.engine !== 'css') continue;
            
            // Set static vars
            const targets = resolveTargets(scopeEl, track);
            for (const el of targets) {
              for (const p of track.properties || []) {
                if (p.type === 'parallaxY') {
                   const unit = p.unit || 'px';
                   el.style.setProperty('--base-offset', fmtVal(p.base ?? 0, unit));
                   el.style.setProperty('--parallax-distance', fmtVal(p.distance ?? 0, unit));
                }
              }
            }

            const cssSel = scopeSelectorToCss(scopeAttrSel, track.targetSelector, track.withinScope);
            if (!cssSel) continue;

            cssOut += buildScrollCssRule({
              selector: cssSel,
              trigger: { progress: trig.progress === 'enter' ? 'enter' : 'exit', start: toNum(trig.start, 0), end: toNum(trig.end, 100) },
              properties: track.properties || [],
            });
            continue;
          }

          // Event based
          const targets = resolveTargets(scopeEl, track);
          for (const el of targets) {
            let cancel = null;
            let stateT = 0;
            const setT = (t) => { stateT = t; applyEventProperties(el, track.properties || [], t); };
            setT(toNum(trig.initialT, 0));

            if (trig.type === 'hover') {
              const onEnter = () => { if (cancel) cancel(); cancel = tween({ from: stateT, to: 1, duration: trig.duration, easing: trig.easing, onUpdate: setT }); };
              const onLeave = () => { if (cancel) cancel(); cancel = tween({ from: stateT, to: 0, duration: trig.duration, easing: trig.easing, onUpdate: setT }); };
              el.addEventListener('mouseenter', onEnter); el.addEventListener('mouseleave', onLeave);
              destroyFns.push(() => { el.removeEventListener('mouseenter', onEnter); el.removeEventListener('mouseleave', onLeave); });
            } else if (trig.type === 'click') {
              let toggled = false;
              const onClick = () => { toggled = !toggled; if (cancel) cancel(); cancel = tween({ from: stateT, to: toggled?1:0, duration: trig.duration, easing: trig.easing, onUpdate: setT }); };
              el.addEventListener('click', onClick);
              destroyFns.push(() => el.removeEventListener('click', onClick));
            } else if (trig.type === 'view') {
               if (!('IntersectionObserver' in window)) { setT(1); continue; }
               let played = false;
               const ob = new IntersectionObserver((entries) => {
                 for (const e of entries) {
                   if (e.isIntersecting) {
                     if (trig.once && played) return;
                     played = true;
                     if (cancel) cancel(); cancel = tween({ from: stateT, to: 1, duration: trig.duration, easing: trig.easing, onUpdate: setT });
                   } else if (trig.reverseOnExit !== false && (!trig.once || !played)) {
                     if (cancel) cancel(); cancel = tween({ from: stateT, to: 0, duration: trig.duration, easing: trig.easing, onUpdate: setT });
                   }
                 }
               }, { threshold: trig.threshold ?? 0.01 });
               ob.observe(el); observers.push(ob);
            }
          }
        }
      }
    }

    styleEl.textContent = cssOut;
    
    let ticking = false;
    const update = () => { for (const it of scopeItems) computeAndSetProgress(it.scopeEl, it.navHeight); };
    const onScroll = () => { if(!ticking) { ticking=true; requestAnimationFrame(()=>{ticking=false; update();}); } };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    destroyFns.push(() => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); });

    return {
      destroy: () => {
        try { styleEl.remove(); } catch {}
        for (const ob of observers) ob.disconnect();
        for (const fn of destroyFns) fn();
        for (const it of scopeItems) it.scopeEl.removeAttribute('data-rb-scope');
      }
    };
  }

  function mountSingleton(config) {
    if (ACTIVE) try { ACTIVE.destroy(); } catch {}
    ACTIVE = mount(config);
    return ACTIVE;
  }

  const loadFromStorage = (key = DEFAULT_STORAGE_KEY) => safeParseJson(localStorage.getItem(key));
  const autoMount = (key) => mountSingleton(loadFromStorage(key));

  RB.Runtime = { version: VERSION, mountSingleton, autoMountFromStorage: autoMount };
  if (window.__REBOUND_DISABLE_AUTOMOUNT__ !== true) {
    document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', () => autoMount()) : autoMount();
  }
})();
