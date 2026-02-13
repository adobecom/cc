/* rebound.runtime.js - Rebound Runtime (v0.4.2)
   Fixes:
   - Multiple animations sharing the same scope no longer break (stable scopeId per element)
   - Optional late DOM binding: watches for missing scope selectors and remounts when they appear
   - Progress vars are NOT written on initial load; CSS falls back to 0 until first scroll
*/
(() => {
  'use strict';

  const RB = (window.Rebound = window.Rebound || {});
  const VERSION = '0.4.2';
  const DEFAULT_STORAGE_KEY = 'rebound:config:v1';

  // ---------------- Utils ----------------
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

  function isValidConfig(cfg) {
    return !!cfg && typeof cfg === 'object' && Array.isArray(cfg.animations);
  }

  // Convert ":scope > ..." to "[data-rb-scope="X"] > ..."
  function scopeSelectorToCss(scopeAttrSel, targetSelector, withinScope) {
    const sel = (targetSelector || '').trim();
    if (!sel) return null;

    if (sel === ':scope') return scopeAttrSel;

    if (sel.startsWith(':scope')) {
      return sel.replace(/^:scope\b/, scopeAttrSel);
    }

    if (withinScope !== false) return `${scopeAttrSel} ${sel}`;
    return sel;
  }

  // ---------------- Progress (AUTO) ----------------
  function computeAndSetProgress(scopeEl, navHeight) {
    if (!scopeEl || !scopeEl.isConnected) return;

    const elHeight = scopeEl.offsetHeight;
    if (!elHeight || elHeight < 2) return; // prevents bogus values during layout shifts

    const rect = scopeEl.getBoundingClientRect();
    const screenHeight = window.innerHeight || 1;

    // EXACT logic you provided:
    const enterProgress = clamp((screenHeight - rect.top) / elHeight, 0, 1);
    const exitProgress = clamp((-rect.top + navHeight) / elHeight, 0, 1);

    scopeEl.style.setProperty('--enter-progress', fmt(enterProgress * 100));
    scopeEl.style.setProperty('--exit-progress', fmt(exitProgress * 100));
  }

  // ---------------- CSS generation for scroll tracks ----------------
  function ratioExpr(progressVar, start, end) {
    const s = toNum(start, 0);
    const e = toNum(end, 100);
    if (e === s) return '1';
    return `((clamp(${s}, ${progressVar}, ${e}) - ${s}) / (${e} - ${s}))`;
  }

  function buildScrollCssRule({ selector, trigger, properties }) {
    const progressVar =
      trigger.progress === 'enter'
        ? 'var(--enter-progress, 0)'
        : 'var(--exit-progress, 0)';

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

      // Firefly-like parallax vars:
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

  // ---------------- JS animations for non-scroll triggers ----------------
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

  // ---------------- Target resolving ----------------
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

  // ---------------- Mount / Singleton ----------------
  let MOUNT_SEQ = 0;
  let ACTIVE = null;

  function mount(config) {
    if (!isValidConfig(config)) throw new Error('[Rebound] Runtime.mount(config) invalid config.');

    const mountId = ++MOUNT_SEQ;
    const navHeight = toNum(config?.settings?.navHeight, 64);
    const animations = config.animations || [];

    const styleEl = document.createElement('style');
    styleEl.setAttribute('data-rb-runtime-style', String(mountId));
    document.head.appendChild(styleEl);

    const destroyFns = [];
    const observers = [];
    const scopeItems = []; // unique scopes only

    // ✅ FIX: stable scopeId per element within this mount
    const scopeInfo = new WeakMap(); // scopeEl -> { scopeId }
    let scopeCounter = 0;

    let cssOut = '';

    for (let ai = 0; ai < animations.length; ai++) {
      const anim = animations[ai];
      const scopeSelector = anim && anim.scopeSelector ? String(anim.scopeSelector) : '';
      if (!scopeSelector) continue;

      let scopeEls = [];
      try { scopeEls = Array.from(document.querySelectorAll(scopeSelector)); }
      catch (e) { console.warn('[Rebound] Bad scopeSelector:', scopeSelector, e); continue; }

      const tracks = Array.isArray(anim.tracks) ? anim.tracks : [];

      for (const scopeEl of scopeEls) {
        // reuse existing scopeId if already assigned (prevents overwrite)
        let info = scopeInfo.get(scopeEl);
        if (!info) {
          const scopeId = `rb-${mountId}-${++scopeCounter}`;
          scopeEl.setAttribute('data-rb-scope', scopeId);
          info = { scopeId };
          scopeInfo.set(scopeEl, info);
          scopeItems.push({ scopeEl, navHeight, scopeId });
        }

        const scopeAttrSel = `[data-rb-scope="${cssEscape(info.scopeId)}"]`;

        for (const track of tracks) {
          if (!track || !track.trigger) continue;

          const trig = track.trigger || {};
          const type = trig.type || 'scroll';

          // ----- Scroll (CSS) -----
          if (type === 'scroll') {
            const engine = track.engine || 'css';
            if (engine !== 'css') continue;

            // Apply config vars to targets (no HTML dependency)
            const targets = resolveTargets(scopeEl, track);
            for (const el of targets) {
              for (const p of track.properties || []) {
                if (!p || !p.type) continue;

                if (p.type === 'parallaxY') {
                  const unit = p.unit || 'px';
                  el.style.setProperty('--base-offset', fmtVal(p.base ?? 0, unit));
                  el.style.setProperty('--parallax-distance', fmtVal(p.distance ?? 0, unit));
                }

                if (p.type === 'staticVar') {
                  const name = String(p.name || '--rb-var');
                  const value = String(p.value ?? '');
                  el.style.setProperty(name, value);
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

          // ----- Events (JS) -----
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
              const onEnter = () => {
                if (cancel) cancel();
                cancel = tween({ from: stateT, to: 1, duration, easing, onUpdate: setT });
              };
              const onLeave = () => {
                if (cancel) cancel();
                cancel = tween({ from: stateT, to: 0, duration, easing, onUpdate: setT });
              };
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
              if (!('IntersectionObserver' in window)) {
                setT(1);
                continue;
              }
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

    // ---- Progress update listeners ----
    // IMPORTANT: do not set vars on initial load; only after first scroll.
    let hasStarted = false;
    let ticking = false;
    let rafId = 0;

    function updateAllProgress() {
      for (const it of scopeItems) computeAndSetProgress(it.scopeEl, it.navHeight);
    }

    function scheduleUpdate() {
      if (!hasStarted) return;
      if (ticking) return;
      ticking = true;
      rafId = requestAnimationFrame(() => {
        ticking = false;
        updateAllProgress();
      });
    }

    function onScroll() {
      hasStarted = true;
      scheduleUpdate();
    }

    function onResize() {
      scheduleUpdate();
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    destroyFns.push(() => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      if (rafId) cancelAnimationFrame(rafId);
    });

    // If page loads already scrolled (restored scroll), start once after paint.
    // Still respects “no vars during load” for top-of-page loads.
    requestAnimationFrame(() => {
      const y = window.scrollY || document.documentElement.scrollTop || 0;
      if (y > 0) {
        hasStarted = true;
        updateAllProgress();
      }
    });

    return {
      version: VERSION,
      destroy: () => {
        try { styleEl.remove(); } catch {}
        for (const ob of observers) { try { ob.disconnect(); } catch {} }
        for (const fn of destroyFns.splice(0)) { try { fn(); } catch {} }
        for (const it of scopeItems) {
          try { it.scopeEl.removeAttribute('data-rb-scope'); } catch {}
        }
      },
    };
  }

  function mountSingleton(config) {
    if (ACTIVE) {
      try { ACTIVE.destroy(); } catch {}
      ACTIVE = null;
    }
    ACTIVE = mount(config);
    return ACTIVE;
  }

  // ---------------- Storage ----------------
  function loadFromStorage(key = DEFAULT_STORAGE_KEY) {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = safeParseJson(raw);
    return isValidConfig(parsed) ? parsed : null;
  }

  function saveToStorage(config, key = DEFAULT_STORAGE_KEY) {
    localStorage.setItem(key, JSON.stringify(config));
  }

  function mountFromStorage(key = DEFAULT_STORAGE_KEY) {
    const cfg = loadFromStorage(key);
    if (!cfg || !cfg.animations.length) return null;
    return mountSingleton(cfg);
  }

  // ---------------- Late DOM watch (fixes missing scopes on async/SPAs) ----------------
  let DOM_WATCHER = null;
  let DOM_WATCH_TIMER = 0;
  let DOM_WATCH_STOP_TIMER = 0;
  let LAST_MISSING_COUNT = null;

  function uniqueScopeSelectors(cfg) {
    const out = [];
    const seen = new Set();
    for (const a of cfg.animations || []) {
      const s = (a?.scopeSelector || '').trim();
      if (!s) continue;
      if (seen.has(s)) continue;
      seen.add(s);
      out.push(s);
    }
    return out;
  }

  function selectorExists(sel) {
    try { return !!document.querySelector(sel); }
    catch { return false; }
  }

  function getMissingScopeCount(cfg) {
    const sels = uniqueScopeSelectors(cfg);
    if (!sels.length) return 0;
    let missing = 0;
    for (const s of sels) if (!selectorExists(s)) missing++;
    return missing;
  }

  function stopDomWatch() {
    if (DOM_WATCHER) {
      try { DOM_WATCHER.disconnect(); } catch {}
      DOM_WATCHER = null;
    }
    if (DOM_WATCH_TIMER) clearTimeout(DOM_WATCH_TIMER);
    if (DOM_WATCH_STOP_TIMER) clearTimeout(DOM_WATCH_STOP_TIMER);
    DOM_WATCH_TIMER = 0;
    DOM_WATCH_STOP_TIMER = 0;
    LAST_MISSING_COUNT = null;
  }

  function startDomWatch(key, timeoutMs = 15000) {
    stopDomWatch();

    const cfg = loadFromStorage(key);
    if (!cfg) return;

    const initialMissing = getMissingScopeCount(cfg);
    if (initialMissing === 0) return; // everything present

    LAST_MISSING_COUNT = initialMissing;

    DOM_WATCHER = new MutationObserver(() => {
      if (DOM_WATCH_TIMER) return;
      DOM_WATCH_TIMER = setTimeout(() => {
        DOM_WATCH_TIMER = 0;

        const latest = loadFromStorage(key);
        if (!latest) { stopDomWatch(); return; }

        const missing = getMissingScopeCount(latest);

        // remount only when missing decreases (new scopes appeared) or resolved
        if (LAST_MISSING_COUNT == null || missing < LAST_MISSING_COUNT) {
          LAST_MISSING_COUNT = missing;
          mountFromStorage(key);
        }

        if (missing === 0) stopDomWatch();
      }, 250);
    });

    DOM_WATCHER.observe(document.documentElement, { childList: true, subtree: true });

    DOM_WATCH_STOP_TIMER = setTimeout(() => stopDomWatch(), Math.max(1000, timeoutMs));
  }

  function autoMountFromStorage(options = {}) {
    const key = options.key || DEFAULT_STORAGE_KEY;
    const watchDom = options.watchDom !== false; // default true
    const watchTimeoutMs = toNum(options.watchTimeoutMs, 15000);

    const ctrl = mountFromStorage(key);
    if (watchDom) startDomWatch(key, watchTimeoutMs);
    return ctrl;
  }

  RB.Runtime = {
    version: VERSION,
    DEFAULT_STORAGE_KEY,
    mount,
    mountSingleton,
    loadFromStorage,
    saveToStorage,
    mountFromStorage,
    autoMountFromStorage,
    stopDomWatch,
  };

  // Auto-mount on page load unless disabled
  if (window.__REBOUND_DISABLE_AUTOMOUNT__ !== true) {
    const run = () => autoMountFromStorage({ watchDom: true, watchTimeoutMs: 15000 });
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', run, { once: true });
    } else {
      run();
    }
  }
})();
