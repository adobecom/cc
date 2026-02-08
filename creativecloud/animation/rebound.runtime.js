/* rebound.runtime.js - CSS-progress driven runtime (vanilla JS, no UI) */
(() => {
  'use strict';

  const RB = (window.Rebound = window.Rebound || {});
  const VERSION = '0.3.0';

  const DEFAULT_STORAGE_KEY = 'rebound:config:v1';

  // ---- Utils ----
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
    const x = toNum(n, 0);
    return (Math.round(x * 100000) / 100000).toString();
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
  function scopeSelectorToCss(scopeAttrSel, targetSelector, withinScope) {
    const sel = (targetSelector || '').trim();
    if (!sel) return null;

    if (sel === ':scope') return scopeAttrSel;

    // Replace :scope prefix
    if (sel.startsWith(':scope')) {
      return sel.replace(/^:scope\b/, scopeAttrSel);
    }

    // Prefix if within scope
    if (withinScope !== false) return `${scopeAttrSel} ${sel}`;
    return sel;
  }

  // ---- Progress update (ALWAYS automatic) ----
  function computeAndSetProgress(scopeEl, navHeight) {
    const screenHeight = window.innerHeight || 1;
    const elHeight = scopeEl.offsetHeight || 1;
    const rect = scopeEl.getBoundingClientRect();

    // EXACT logic you provided:
    const enterProgress = clamp((screenHeight - rect.top) / elHeight, 0, 1);
    const exitProgress = clamp((-rect.top + navHeight) / elHeight, 0, 1);

    scopeEl.style.setProperty('--enter-progress', fmt(enterProgress * 100));
    scopeEl.style.setProperty('--exit-progress', fmt(exitProgress * 100));
  }

  // ---- CSS rule generation for scroll tracks ----
  function ratioExpr(progressVar, start, end) {
    const s = toNum(start, 0);
    const e = toNum(end, 100);
    if (e === s) return '1';
    // (clamp(s, progress, e) - s) / (e - s)
    return `((clamp(${s}, ${progressVar}, ${e}) - ${s}) / (${e} - ${s}))`;
  }

  function buildScrollCssRule({ selector, trigger, properties }) {
    const progressVar = trigger.progress === 'enter' ? 'var(--enter-progress)' : 'var(--exit-progress)';
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
        continue;
      }

      if (p.type === 'translateY') {
        const unit = p.unit || 'px';
        const from = fmtVal(p.from ?? 0, unit);
        const to = fmtVal(p.to ?? 0, unit);
        tf.push(`translateY(calc(${from} + (${to} - ${from}) * ${ratio}))`);
        continue;
      }

      if (p.type === 'translateX') {
        const unit = p.unit || 'px';
        const from = fmtVal(p.from ?? 0, unit);
        const to = fmtVal(p.to ?? 0, unit);
        tf.push(`translateX(calc(${from} + (${to} - ${from}) * ${ratio}))`);
        continue;
      }

      if (p.type === 'rotate') {
        const unit = p.unit || 'deg';
        const from = fmtVal(p.from ?? 0, unit);
        const to = fmtVal(p.to ?? 0, unit);
        tf.push(`rotate(calc(${from} + (${to} - ${from}) * ${ratio}))`);
        continue;
      }

      if (p.type === 'scale') {
        const from = toNum(p.from, 1);
        const to = toNum(p.to, 1);
        tf.push(`scale(calc(${from} + (${to} - ${from}) * ${ratio}))`);
        continue;
      }

      // Firefly-like: base+distance over progress (vars are set from config)
      if (p.type === 'parallaxY') {
        tf.push(`translateY(calc(var(--base-offset, 0px) + var(--parallax-distance, 0px) * ${ratio}))`);
        continue;
      }

      if (p.type === 'cssVar') {
        const name = String(p.name || '--rb-var');
        const unit = p.unit || '';
        const from = fmtVal(p.from ?? 0, unit);
        const to = fmtVal(p.to ?? 0, unit);
        otherDecls.push(`${name}: calc(${from} + (${to} - ${from}) * ${ratio});`);
        continue;
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

  // ---- JS animation for non-scroll triggers ----
  function applyEventProperties(el, properties, t) {
    const tf = { translateX: null, translateY: null, rotate: null, scale: null };
    let hasTf = false;

    for (const p of properties || []) {
      if (!p || !p.type) continue;

      if (p.type === 'opacity') {
        const from = toNum(p.from, 1);
        const to = toNum(p.to, 1);
        el.style.opacity = String(lerp(from, to, t));
        continue;
      }

      if (p.type === 'translateY') {
        hasTf = true;
        const unit = p.unit || 'px';
        tf.translateY = `${lerp(toNum(p.from, 0), toNum(p.to, 0), t)}${unit}`;
        continue;
      }

      if (p.type === 'translateX') {
        hasTf = true;
        const unit = p.unit || 'px';
        tf.translateX = `${lerp(toNum(p.from, 0), toNum(p.to, 0), t)}${unit}`;
        continue;
      }

      if (p.type === 'rotate') {
        hasTf = true;
        const unit = p.unit || 'deg';
        tf.rotate = `${lerp(toNum(p.from, 0), toNum(p.to, 0), t)}${unit}`;
        continue;
      }

      if (p.type === 'scale') {
        hasTf = true;
        tf.scale = String(lerp(toNum(p.from, 1), toNum(p.to, 1), t));
        continue;
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
      onUpdate(lerp(from, to, ease(p)));
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
    } catch (e) {
      console.warn('[Rebound] Bad selector:', sel, e);
      return [];
    }
  }

  // ---- Main mount ----
  let MOUNT_SEQ = 0;

  function mount(config) {
    if (!config || typeof config !== 'object') {
      throw new Error('[Rebound] Runtime.mount(config) requires a config object.');
    }

    const mountId = ++MOUNT_SEQ;
    const navHeight = toNum(config?.settings?.navHeight, 64);
    const animations = Array.isArray(config.animations) ? config.animations : [];

    const styleEl = document.createElement('style');
    styleEl.setAttribute('data-rb-runtime-style', String(mountId));
    document.head.appendChild(styleEl);

    const destroyFns = [];
    const scopeItems = [];
    const observers = [];

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

        scopeItems.push({ scopeEl, navHeight });

        const scopeAttrSel = `[data-rb-scope="${cssEscape(scopeId)}"]`;

        for (const track of tracks) {
          if (!track || !track.trigger) continue;
          const trig = track.trigger || {};
          const type = trig.type || 'scroll';

          if (type === 'scroll') {
            const engine = track.engine || 'css';
            if (engine !== 'css') continue;

            // Apply vars driven by config (no HTML dependency)
            const targets = resolveTargets(scopeEl, track);
            for (const el of targets) {
              for (const p of track.properties || []) {
                if (!p || !p.type) continue;

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
              trigger: {
                progress: trig.progress === 'enter' ? 'enter' : 'exit',
                start: toNum(trig.start, 0),
                end: toNum(trig.end, 100),
              },
              properties: track.properties || [],
            });
            continue;
          }

          // ---- Event triggers ----
          const targets = resolveTargets(scopeEl, track);
          if (!targets.length) continue;

          const duration = toNum(trig.duration, 350);
          const easing = trig.easing || 'easeInOutCubic';

          for (const el of targets) {
            let cancel = null;
            let stateT = 0;

            const setT = (t) => {
              stateT = t;
              applyEventProperties(el, track.properties || [], t);
            };

            setT(toNum(trig.initialT, 0));

            if (type === 'hover') {
              const onEnter = () => { if (cancel) cancel(); cancel = tween({ from: stateT, to: 1, duration, easing, onUpdate: setT }); };
              const onLeave = () => { if (cancel) cancel(); cancel = tween({ from: stateT, to: 0, duration, easing, onUpdate: setT }); };
              el.addEventListener('mouseenter', onEnter);
              el.addEventListener('mouseleave', onLeave);
              destroyFns.push(() => {
                el.removeEventListener('mouseenter', onEnter);
                el.removeEventListener('mouseleave', onLeave);
              });
            }

            if (type === 'click') {
              let toggled = false;
              const onClick = () => {
                toggled = !toggled;
                if (cancel) cancel();
                cancel = tween({ from: stateT, to: toggled ? 1 : 0, duration, easing, onUpdate: setT });
              };
              el.addEventListener('click', onClick);
              destroyFns.push(() => el.removeEventListener('click', onClick));
            }

            if (type === 'view') {
              if (!('IntersectionObserver' in window)) { setT(1); continue; }
              const once = !!trig.once;
              const reverseOnExit = trig.reverseOnExit !== false;
              const threshold = trig.threshold ?? 0.01;
              let played = false;

              const ob = new IntersectionObserver((entries) => {
                for (const entry of entries) {
                  if (entry.isIntersecting) {
                    if (once && played) return;
                    played = true;
                    if (cancel) cancel();
                    cancel = tween({ from: stateT, to: 1, duration, easing, onUpdate: setT });
                  } else if (reverseOnExit && (!once || !played)) {
                    if (cancel) cancel();
                    cancel = tween({ from: stateT, to: 0, duration, easing, onUpdate: setT });
                  }
                }
              }, { threshold });

              ob.observe(el);
              observers.push(ob);
            }
          }
        }
      }
    }

    styleEl.textContent = cssOut;

    let ticking = false;
    let rafId = 0;

    function updateAllProgress() {
      ticking = false;
      for (const it of scopeItems) computeAndSetProgress(it.scopeEl, it.navHeight);
    }

    function onScrollOrResize() {
      if (ticking) return;
      ticking = true;
      rafId = requestAnimationFrame(updateAllProgress);
    }

    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize);
    destroyFns.push(() => {
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
      if (rafId) cancelAnimationFrame(rafId);
    });

    updateAllProgress();

    return {
      version: VERSION,
      destroy: () => {
        try { styleEl.remove(); } catch {}
        for (const ob of observers) { try { ob.disconnect(); } catch {} }
        for (const fn of destroyFns.splice(0)) { try { fn(); } catch {} }
        for (const it of scopeItems) { try { it.scopeEl.removeAttribute('data-rb-scope'); } catch {} }
      },
    };
  }

  // ---- Storage helpers (optional) ----
  function loadFromStorage(key = DEFAULT_STORAGE_KEY) {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = safeParseJson(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  }

  function saveToStorage(config, key = DEFAULT_STORAGE_KEY) {
    localStorage.setItem(key, JSON.stringify(config));
  }

  function mountFromStorage(key = DEFAULT_STORAGE_KEY) {
    const cfg = loadFromStorage(key);
    if (!cfg) return null;
    return mount(cfg);
  }

  RB.Runtime = {
    version: VERSION,
    mount,
    loadFromStorage,
    saveToStorage,
    mountFromStorage,
    DEFAULT_STORAGE_KEY,
  };
})();
