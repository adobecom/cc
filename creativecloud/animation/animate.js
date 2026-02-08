/* motionforge.runtime.js - CSS-progress driven runtime (vanilla JS, no UI) */
(() => {
  'use strict';

  const MF = (window.MotionForge = window.MotionForge || {});
  const VERSION = '0.2.0';

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

  // Convert ":scope > ..." to "[data-mf-scope="X"] > ..."
  function scopeSelectorToCss(scopeAttrSel, targetSelector, withinScope) {
    const sel = (targetSelector || '').trim();
    if (!sel) return null;

    if (sel === ':scope') return scopeAttrSel;

    // If author uses ":scope" prefix, replace it
    if (sel.startsWith(':scope')) {
      return sel.replace(/^:scope\b/, scopeAttrSel);
    }

    // Otherwise, prefix when within scope
    if (withinScope !== false) return `${scopeAttrSel} ${sel}`;
    return sel; // global selector
  }

  // ---- Progress update (ALWAYS automatic, as requested) ----
  function computeAndSetProgress(scopeEl, navHeight) {
    const screenHeight = window.innerHeight || 1;
    const elHeight = scopeEl.offsetHeight || 1;
    const rect = scopeEl.getBoundingClientRect();

    // EXACT logic you provided:
    const enterProgress = clamp((screenHeight - rect.top) / elHeight, 0, 1);
    const exitProgress = clamp((-rect.top + navHeight) / elHeight, 0, 1);

    // store as 0..100 numbers (no units)
    scopeEl.style.setProperty('--enter-progress', fmt(enterProgress * 100));
    scopeEl.style.setProperty('--exit-progress', fmt(exitProgress * 100));
  }

  // ---- CSS rule generation for scroll tracks ----
  function ratioExpr(progressVar, start, end) {
    const s = toNum(start, 0);
    const e = toNum(end, 100);
    if (e === s) return '1';

    // normalized ratio:
    // (clamp(s, progress, e) - s) / (e - s)
    return `((clamp(${s}, ${progressVar}, ${e}) - ${s}) / (${e} - ${s}))`;
  }

  function buildScrollCssRule({ selector, trigger, properties }) {
    const progressVar = trigger.progress === 'enter' ? 'var(--enter-progress)' : 'var(--exit-progress)';
    const ratio = ratioExpr(progressVar, trigger.start, trigger.end);

    // Collect transform funcs into one transform
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
      // translateY(calc(var(--base-offset) + var(--parallax-distance) * ratio))
      if (p.type === 'parallaxY') {
        tf.push(`translateY(calc(var(--base-offset, 0px) + var(--parallax-distance, 0px) * ${ratio}))`);
        continue;
      }

      // Animated CSS variable
      if (p.type === 'cssVar') {
        const name = String(p.name || '--mf-var');
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
        const from = toNum(p.from, 0);
        const to = toNum(p.to, 0);
        tf.translateY = `${lerp(from, to, t)}${unit}`;
        continue;
      }

      if (p.type === 'translateX') {
        hasTf = true;
        const unit = p.unit || 'px';
        const from = toNum(p.from, 0);
        const to = toNum(p.to, 0);
        tf.translateX = `${lerp(from, to, t)}${unit}`;
        continue;
      }

      if (p.type === 'rotate') {
        hasTf = true;
        const unit = p.unit || 'deg';
        const from = toNum(p.from, 0);
        const to = toNum(p.to, 0);
        tf.rotate = `${lerp(from, to, t)}${unit}`;
        continue;
      }

      if (p.type === 'scale') {
        hasTf = true;
        const from = toNum(p.from, 1);
        const to = toNum(p.to, 1);
        tf.scale = String(lerp(from, to, t));
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
      const e = ease(p);
      const v = lerp(from, to, e);
      onUpdate(v);
      if (p < 1) requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
    return () => { cancelled = true; };
  }

  // ---- Target resolving ----
  function resolveTargets(scopeEl, track) {
    const sel = (track.targetSelector || '').trim();
    if (!sel) return [];
    if (sel === ':scope') return [scopeEl];

    try {
      if (track.withinScope !== false) return Array.from(scopeEl.querySelectorAll(sel));
      return Array.from(document.querySelectorAll(sel));
    } catch (e) {
      console.warn('[MotionForge] Bad selector:', sel, e);
      return [];
    }
  }

  // ---- Main mount ----
  let MOUNT_SEQ = 0;

  function mount(config) {
    if (!config || typeof config !== 'object') {
      throw new Error('[MotionForge] Runtime.mount(config) requires a config object.');
    }

    const mountId = ++MOUNT_SEQ;

    // Only “offset” config (hidden from UI)
    const navHeight = toNum(config?.settings?.navHeight, 64);

    const animations = Array.isArray(config.animations) ? config.animations : [];

    // Style element for generated CSS (scroll engine)
    const styleEl = document.createElement('style');
    styleEl.setAttribute('data-mf-runtime-style', String(mountId));
    document.head.appendChild(styleEl);

    const destroyFns = [];
    const scopeItems = []; // { scopeEl, navHeight }

    // For view triggers
    const observers = [];

    // Build + generate CSS
    let cssOut = '';

    for (let ai = 0; ai < animations.length; ai++) {
      const anim = animations[ai];
      const scopeSelector = anim && anim.scopeSelector ? String(anim.scopeSelector) : '';
      if (!scopeSelector) continue;

      let scopeEls = [];
      try {
        scopeEls = Array.from(document.querySelectorAll(scopeSelector));
      } catch (e) {
        console.warn('[MotionForge] Bad scopeSelector:', scopeSelector, e);
        continue;
      }

      const tracks = Array.isArray(anim.tracks) ? anim.tracks : [];

      for (let si = 0; si < scopeEls.length; si++) {
        const scopeEl = scopeEls[si];
        const scopeId = `mf-${mountId}-${ai}-${si}`;

        scopeEl.setAttribute('data-mf-scope', scopeId);
        scopeItems.push({ scopeEl, navHeight });

        const scopeAttrSel = `[data-mf-scope="${scopeId}"]`;

        for (const track of tracks) {
          if (!track || !track.trigger) continue;

          const trig = track.trigger || {};
          const type = trig.type || 'scroll';

          // ---- Scroll/parallax: CSS injection using progress vars ----
          if (type === 'scroll') {
            const engine = track.engine || 'css';
            if (engine !== 'css') continue;

            // Ensure config-driven vars are applied (no HTML dependency)
            const targets = resolveTargets(scopeEl, track);
            for (const el of targets) {
              for (const p of track.properties || []) {
                if (!p || !p.type) continue;

                if (p.type === 'parallaxY') {
                  const unit = p.unit || 'px';
                  el.style.setProperty('--base-offset', fmtVal(p.base ?? 0, unit));
                  el.style.setProperty('--parallax-distance', fmtVal(p.distance ?? 0, unit));
                }

                // Optional static var support (if you want it later)
                if (p.type === 'staticVar') {
                  const name = String(p.name || '--mf-var');
                  const value = String(p.value ?? '');
                  el.style.setProperty(name, value);
                }
              }
            }

            const cssSel = scopeSelectorToCss(scopeAttrSel, track.targetSelector, track.withinScope);
            if (!cssSel) continue;

            const trigger = {
              progress: trig.progress === 'enter' ? 'enter' : 'exit',
              start: toNum(trig.start, 0),
              end: toNum(trig.end, 100),
            };

            cssOut += buildScrollCssRule({
              selector: cssSel,
              trigger,
              properties: track.properties || [],
            });

            continue;
          }

          // ---- Events: JS tweening (hover/click/view) ----
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

    // Commit generated CSS
    styleEl.textContent = cssOut;

    // Progress updater (single scroll listener)
    let ticking = false;
    let rafId = 0;

    function updateAllProgress() {
      ticking = false;
      for (const it of scopeItems) {
        computeAndSetProgress(it.scopeEl, it.navHeight);
      }
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

    // Initial set
    updateAllProgress();

    return {
      version: VERSION,
      destroy: () => {
        try { styleEl.remove(); } catch {}
        for (const ob of observers) {
          try { ob.disconnect(); } catch {}
        }
        for (const fn of destroyFns.splice(0)) {
          try { fn(); } catch {}
        }
        for (const it of scopeItems) {
          try { it.scopeEl.removeAttribute('data-mf-scope'); } catch {}
        }
      },
    };
  }

  MF.Runtime = { version: VERSION, mount };
})();


/* motionforge.editor.js - Vanilla JS editor UI (popup + picker), navHeight hidden */
(() => {
  'use strict';

  const MF = (window.MotionForge = window.MotionForge || {});
  if (!MF.Runtime) console.warn('[MotionForgeEditor] Load motionforge.runtime.js first');

  function h(tag, attrs = {}, children = []) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (k === 'class') el.className = v;
      else if (k === 'text') el.textContent = v;
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

    // Prefer unique ID
    if (el.id) {
      const sel = `#${cssEscape(el.id)}`;
      try { if (document.querySelectorAll(sel).length === 1) return sel; } catch {}
    }

    // :scope > tag.class:nth-child
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

  // ---- Picker (DevTools-like) ----
  const Picker = (() => {
    let overlay, label, active = false;

    function ensure() {
      if (overlay) return;
      overlay = h('div', { class: 'mf-pick-overlay' });
      label = h('div', { class: 'mf-pick-label' });
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
      label.style.top = `${Math.max(8, r.top - 24)}px`;
    }

    function pick({ onPick, onCancel }) {
      ensure();
      if (active) return;
      active = true;
      overlay.style.display = 'block';
      label.style.display = 'block';

      function move(e) {
        const el = document.elementFromPoint(e.clientX, e.clientY);
        if (!el) return;
        if (el.closest && el.closest('.mf-panel')) return;
        if (el.classList && (el.classList.contains('mf-pick-overlay') || el.classList.contains('mf-pick-label'))) return;
        setBox(el);
      }

      function click(e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation?.();

        const el = document.elementFromPoint(e.clientX, e.clientY);
        if (!el || (el.closest && el.closest('.mf-panel'))) return;
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

  function injectCssOnce() {
    if (document.getElementById('mf-editor-css')) return;
    const style = document.createElement('style');
    style.id = 'mf-editor-css';
    style.textContent = `
      .mf-panel {
        position: fixed;
        right: 16px;
        bottom: 16px;
        width: 440px;
        max-height: 80vh;
        overflow: auto;
        z-index: 2147483647;
        font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
        font-size: 12px;
        background: rgba(20,20,24,0.98);
        color: #eee;
        border: 1px solid rgba(255,255,255,0.12);
        border-radius: 12px;
        box-shadow: 0 12px 40px rgba(0,0,0,0.45);
      }
      .mf-panel * { box-sizing: border-box; }
      .mf-header {
        position: sticky; top: 0;
        padding: 10px 12px;
        background: rgba(20,20,24,0.98);
        border-bottom: 1px solid rgba(255,255,255,0.12);
        display:flex; justify-content:space-between; align-items:center;
      }
      .mf-title { font-weight: 700; letter-spacing: 0.3px; }
      .mf-section { padding: 10px 12px; border-bottom: 1px solid rgba(255,255,255,0.08); }
      .mf-row { display:flex; gap:8px; align-items:center; }
      .mf-col { display:flex; flex-direction:column; gap:6px; }
      .mf-btn {
        border: 1px solid rgba(255,255,255,0.18);
        background: rgba(255,255,255,0.06);
        color: #eee;
        padding: 6px 8px;
        border-radius: 8px;
        cursor: pointer;
        user-select: none;
        white-space: nowrap;
      }
      .mf-btn:hover { background: rgba(255,255,255,0.10); }
      .mf-btn.danger { border-color: rgba(255,90,90,0.35); }
      .mf-input, .mf-select, .mf-textarea {
        width: 100%;
        padding: 6px 8px;
        border-radius: 8px;
        border: 1px solid rgba(255,255,255,0.14);
        background: rgba(255,255,255,0.06);
        color: #eee;
        outline: none;
      }
      .mf-textarea { min-height: 160px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
      .mf-card {
        border: 1px solid rgba(255,255,255,0.12);
        background: rgba(255,255,255,0.04);
        border-radius: 10px;
        padding: 8px;
      }
      .mf-list { display:flex; flex-direction:column; gap:8px; }
      .mf-pill { padding: 2px 6px; border: 1px solid rgba(255,255,255,0.14); border-radius: 999px; font-size: 11px; opacity: 0.9; }
      .mf-muted { opacity: 0.75; }

      .mf-pick-overlay {
        position: fixed;
        z-index: 2147483646;
        pointer-events: none;
        border: 2px solid rgba(0, 200, 255, 0.9);
        background: rgba(0, 200, 255, 0.15);
        border-radius: 6px;
      }
      .mf-pick-label {
        position: fixed;
        z-index: 2147483646;
        pointer-events: none;
        padding: 4px 6px;
        border-radius: 6px;
        background: rgba(0,0,0,0.75);
        color: #fff;
        font-size: 12px;
        max-width: 60vw;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    `;
    document.head.appendChild(style);
  }

  function defaultConfig() {
    return { version: 1, settings: { navHeight: 64 }, animations: [] };
  }

  function newAnimation(name = 'animation-1') {
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

  class MotionForgeEditor {
    constructor({ openButton, initialConfig, onSave } = {}) {
      injectCssOnce();

      this.onSave = typeof onSave === 'function' ? onSave : null;
      this.config = initialConfig && typeof initialConfig === 'object' ? initialConfig : defaultConfig();

      this.selectedAnimIndex = 0;
      this.editingTrackIndex = -1;

      this.previewController = null;
      this.panel = null;

      if (openButton) openButton.addEventListener('click', () => this.open());
    }

    open() {
      if (this.panel) { this.panel.style.display = 'block'; return; }
      this.panel = this.buildUI();
      document.body.appendChild(this.panel);
      this.render();
      this.refreshPreview();
    }

    close() { if (this.panel) this.panel.style.display = 'none'; }

    get selectedAnim() { return this.config.animations[this.selectedAnimIndex] || null; }

    refreshPreview() {
      if (!MF.Runtime) return;
      if (this.previewController) { this.previewController.destroy(); this.previewController = null; }
      try { this.previewController = MF.Runtime.mount(this.config); }
      catch (e) { console.warn('[MotionForgeEditor] Preview failed:', e); }
    }

    buildUI() {
      const panel = h('div', { class: 'mf-panel' });
      const header = h('div', { class: 'mf-header' }, [
        h('div', { class: 'mf-title', text: 'MotionForge Editor' }),
        h('button', { class: 'mf-btn', text: 'Close', onClick: () => this.close() }),
      ]);
      this.bodyEl = h('div');
      panel.appendChild(header);
      panel.appendChild(this.bodyEl);
      return panel;
    }

    render() {
      const body = this.bodyEl;
      body.innerHTML = '';

      if (!Array.isArray(this.config.animations)) this.config.animations = [];
      if (this.config.animations.length === 0) this.config.animations.push(newAnimation('animation-1'));
      if (this.selectedAnimIndex >= this.config.animations.length) this.selectedAnimIndex = 0;

      const anim = this.selectedAnim;

      // ---- Animation picker ----
      const animSelect = h('select', {
        class: 'mf-select',
        onChange: (e) => {
          this.selectedAnimIndex = Number(e.target.value) || 0;
          this.editingTrackIndex = -1;
          this.render();
          this.refreshPreview();
        },
      });

      this.config.animations.forEach((a, idx) => {
        animSelect.appendChild(h('option', {
          value: String(idx),
          text: a.name || `animation-${idx + 1}`,
          ...(idx === this.selectedAnimIndex ? { selected: 'selected' } : {}),
        }));
      });

      body.appendChild(h('div', { class: 'mf-section' }, [
        h('div', { class: 'mf-row' }, [
          animSelect,
          h('button', {
            class: 'mf-btn',
            text: 'New',
            onClick: () => {
              const n = this.config.animations.length + 1;
              this.config.animations.push(newAnimation(`animation-${n}`));
              this.selectedAnimIndex = this.config.animations.length - 1;
              this.editingTrackIndex = -1;
              this.render();
              this.refreshPreview();
            },
          }),
          h('button', {
            class: 'mf-btn danger',
            text: 'Delete',
            onClick: () => {
              if (this.config.animations.length <= 1) return;
              this.config.animations.splice(this.selectedAnimIndex, 1);
              this.selectedAnimIndex = Math.max(0, this.selectedAnimIndex - 1);
              this.editingTrackIndex = -1;
              this.render();
              this.refreshPreview();
            },
          }),
        ]),
        h('div', { class: 'mf-col', style: 'margin-top:8px;' }, [
          h('label', { class: 'mf-muted', text: 'Animation Name' }),
          h('input', {
            class: 'mf-input',
            value: anim.name || '',
            onInput: (e) => {
              anim.name = e.target.value;
              this.render();
              this.refreshPreview();
            },
          }),
        ]),
      ]));

      // ---- Scope selection ----
      const scopeInput = h('input', {
        class: 'mf-input',
        value: anim.scopeSelector || '',
        placeholder: 'e.g. .firefly-model-showcase',
        onInput: (e) => { anim.scopeSelector = e.target.value; this.refreshPreview(); },
      });

      const pickScopeBtn = h('button', {
        class: 'mf-btn',
        text: 'Pick Scope',
        onClick: () => {
          Picker.pick({
            onPick: (el) => {
              let sel = '';
              if (el.id) sel = `#${cssEscape(el.id)}`;
              else if (el.classList && el.classList.length) sel = '.' + Array.from(el.classList).slice(0, 1).map(cssEscape).join('.');
              else sel = makeSelectorWithinRoot(document.body, el).replace(':scope', 'body');

              anim.scopeSelector = sel;
              this.render();
              this.refreshPreview();
            },
          });
        },
      });

      body.appendChild(h('div', { class: 'mf-section' }, [
        h('div', { class: 'mf-col' }, [
          h('label', { class: 'mf-muted', text: 'Scope selector (progress vars auto-applied here)' }),
          h('div', { class: 'mf-row' }, [scopeInput, pickScopeBtn]),
          h('div', { class: 'mf-muted', text: 'Runtime auto-updates --enter-progress and --exit-progress on the scope element.' }),
        ]),
      ]));

      // ---- Tracks list ----
      const tracks = Array.isArray(anim.tracks) ? anim.tracks : (anim.tracks = []);
      const list = h('div', { class: 'mf-list' });

      tracks.forEach((t, idx) => {
        list.appendChild(h('div', { class: 'mf-card' }, [
          h('div', { class: 'mf-row', style: 'justify-content:space-between;' }, [
            h('div', { class: 'mf-col', style: 'gap:4px;' }, [
              h('div', { text: t.targetSelector || '(no selector)' }),
              h('div', { class: 'mf-row' }, [
                h('span', { class: 'mf-pill', text: `trigger: ${t.trigger?.type || 'scroll'}` }),
                (t.trigger?.type === 'scroll')
                  ? h('span', { class: 'mf-pill', text: `${t.trigger.progress || 'exit'} ${t.trigger.start ?? 0}-${t.trigger.end ?? 100}` })
                  : null,
              ].filter(Boolean)),
            ]),
            h('div', { class: 'mf-row' }, [
              h('button', { class: 'mf-btn', text: 'Edit', onClick: () => { this.editingTrackIndex = idx; this.render(); } }),
              h('button', {
                class: 'mf-btn danger',
                text: 'Delete',
                onClick: () => {
                  tracks.splice(idx, 1);
                  if (this.editingTrackIndex === idx) this.editingTrackIndex = -1;
                  this.render();
                  this.refreshPreview();
                },
              }),
            ]),
          ]),
        ]));
      });

      body.appendChild(h('div', { class: 'mf-section' }, [
        h('div', { class: 'mf-row', style: 'justify-content:space-between;' }, [
          h('div', { text: 'Tracks (multiple elements/effects per animation)' }),
          h('button', {
            class: 'mf-btn',
            text: 'Add Track',
            onClick: () => {
              tracks.push(newTrack());
              this.editingTrackIndex = tracks.length - 1;
              this.render();
              this.refreshPreview();
            },
          }),
        ]),
        list,
      ]));

      if (this.editingTrackIndex >= 0 && tracks[this.editingTrackIndex]) {
        body.appendChild(this.renderTrackEditor(anim, tracks[this.editingTrackIndex]));
      }

      // ---- JSON export/import ----
      const jsonText = h('textarea', { class: 'mf-textarea' });
      jsonText.value = JSON.stringify(this.config, null, 2);

      body.appendChild(h('div', { class: 'mf-section' }, [
        h('div', { class: 'mf-row' }, [
          h('button', { class: 'mf-btn', text: 'Update JSON', onClick: () => { jsonText.value = JSON.stringify(this.config, null, 2); } }),
          h('button', {
            class: 'mf-btn',
            text: 'Load JSON',
            onClick: () => {
              try {
                this.config = JSON.parse(jsonText.value);
                this.selectedAnimIndex = 0;
                this.editingTrackIndex = -1;
                this.render();
                this.refreshPreview();
              } catch {
                alert('Invalid JSON');
              }
            },
          }),
          h('button', {
            class: 'mf-btn',
            text: 'onSave()',
            onClick: () => {
              const text = JSON.stringify(this.config, null, 2);
              this.onSave?.(text, this.config);
            },
          }),
        ]),
        jsonText,
        h('div', {
          class: 'mf-muted',
          text: 'To change the exit offset, edit settings.navHeight in JSON (UI intentionally hides it).',
        }),
      ]));
    }

    renderTrackEditor(anim, track) {
      const wrap = h('div', { class: 'mf-section' }, [
        h('div', { text: `Edit Track #${this.editingTrackIndex + 1}` }),
      ]);

      // Target selector + pick
      const targetInput = h('input', {
        class: 'mf-input',
        value: track.targetSelector || '',
        placeholder: 'e.g. .gallery-column or :scope',
        onInput: (e) => { track.targetSelector = e.target.value; this.refreshPreview(); },
      });

      const pickTargetBtn = h('button', {
        class: 'mf-btn',
        text: 'Pick Element',
        onClick: () => {
          if (!anim.scopeSelector) return alert('Set scope selector first.');
          const scopeEl = document.querySelector(anim.scopeSelector);
          if (!scopeEl) return alert('Scope selector matched nothing.');

          Picker.pick({
            onPick: (el) => {
              track.targetSelector = makeSelectorWithinRoot(scopeEl, el);
              track.withinScope = true;
              this.render();
              this.refreshPreview();
            },
          });
        },
      });

      const withinCb = h('input', {
        type: 'checkbox',
        ...(track.withinScope !== false ? { checked: 'checked' } : {}),
        onChange: (e) => { track.withinScope = !!e.target.checked; this.refreshPreview(); },
      });

      wrap.appendChild(h('div', { class: 'mf-col', style: 'margin-top:8px;' }, [
        h('label', { class: 'mf-muted', text: 'Target Selector' }),
        h('div', { class: 'mf-row' }, [targetInput, pickTargetBtn]),
        h('div', { class: 'mf-row' }, [withinCb, h('span', { text: 'within scope' })]),
      ]));

      // Trigger
      const triggerTypeSelect = h('select', {
        class: 'mf-select',
        onChange: (e) => {
          const type = e.target.value;

          if (type === 'scroll') {
            track.trigger = { type: 'scroll', progress: 'exit', start: 0, end: 100 };
            track.engine = 'css';
          }
          if (type === 'hover') {
            track.trigger = { type: 'hover', duration: 350, easing: 'easeInOutCubic' };
            track.engine = 'js';
          }
          if (type === 'click') {
            track.trigger = { type: 'click', duration: 350, easing: 'easeInOutCubic' };
            track.engine = 'js';
          }
          if (type === 'view') {
            track.trigger = { type: 'view', duration: 450, easing: 'easeInOutCubic', once: false, reverseOnExit: true };
            track.engine = 'js';
          }

          this.render();
          this.refreshPreview();
        },
      }, [
        h('option', { value: 'scroll', text: 'scroll / parallax (CSS progress)', ...(track.trigger?.type === 'scroll' ? { selected: 'selected' } : {}) }),
        h('option', { value: 'hover', text: 'on hover', ...(track.trigger?.type === 'hover' ? { selected: 'selected' } : {}) }),
        h('option', { value: 'click', text: 'on click', ...(track.trigger?.type === 'click' ? { selected: 'selected' } : {}) }),
        h('option', { value: 'view', text: 'on view enter', ...(track.trigger?.type === 'view' ? { selected: 'selected' } : {}) }),
      ]);

      wrap.appendChild(h('div', { class: 'mf-col', style: 'margin-top:10px;' }, [
        h('label', { class: 'mf-muted', text: 'Trigger' }),
        triggerTypeSelect,
      ]));

      // Trigger details
      wrap.appendChild(this.renderTriggerDetails(track));

      // Properties
      wrap.appendChild(this.renderPropertiesEditor(track));

      wrap.appendChild(h('div', { style: 'margin-top:10px;' }, [
        h('button', { class: 'mf-btn', text: 'Done', onClick: () => { this.editingTrackIndex = -1; this.render(); this.refreshPreview(); } }),
      ]));

      return wrap;
    }

    renderTriggerDetails(track) {
      const trig = track.trigger || {};
      const box = h('div', { class: 'mf-card', style: 'margin-top:10px;' });

      if (trig.type === 'scroll') {
        const progressSel = h('select', {
          class: 'mf-select',
          onChange: (e) => { trig.progress = e.target.value; this.refreshPreview(); },
        }, [
          h('option', { value: 'exit', text: 'exit progress', ...(trig.progress !== 'enter' ? { selected: 'selected' } : {}) }),
          h('option', { value: 'enter', text: 'enter progress', ...(trig.progress === 'enter' ? { selected: 'selected' } : {}) }),
        ]);

        const startIn = h('input', {
          class: 'mf-input', type: 'number', value: String(trig.start ?? 0),
          onInput: (e) => { trig.start = Number(e.target.value) || 0; this.refreshPreview(); },
        });

        const endIn = h('input', {
          class: 'mf-input', type: 'number', value: String(trig.end ?? 100),
          onInput: (e) => { trig.end = Number(e.target.value) || 100; this.refreshPreview(); },
        });

        box.appendChild(h('div', { class: 'mf-row' }, [
          h('div', { class: 'mf-col', style: 'flex:1;' }, [h('label', { class: 'mf-muted', text: 'progress source' }), progressSel]),
          h('div', { class: 'mf-col', style: 'flex:1;' }, [h('label', { class: 'mf-muted', text: 'start (pct)' }), startIn]),
          h('div', { class: 'mf-col', style: 'flex:1;' }, [h('label', { class: 'mf-muted', text: 'end (pct)' }), endIn]),
        ]));

        box.appendChild(h('div', { class: 'mf-muted', style: 'margin-top:6px;' }, [
          'Runtime auto-updates --enter-progress / --exit-progress on the scope element.',
        ]));
      }

      if (trig.type === 'hover' || trig.type === 'click' || trig.type === 'view') {
        const dur = h('input', {
          class: 'mf-input', type: 'number', value: String(trig.duration ?? 350),
          onInput: (e) => { trig.duration = Number(e.target.value) || 0; this.refreshPreview(); },
        });

        const easing = h('select', {
          class: 'mf-select',
          onChange: (e) => { trig.easing = e.target.value; this.refreshPreview(); },
        }, [
          h('option', { value: 'easeInOutCubic', text: 'easeInOutCubic', ...(trig.easing !== 'linear' ? { selected: 'selected' } : {}) }),
          h('option', { value: 'linear', text: 'linear', ...(trig.easing === 'linear' ? { selected: 'selected' } : {}) }),
        ]);

        box.appendChild(h('div', { class: 'mf-row' }, [
          h('div', { class: 'mf-col', style: 'flex:1;' }, [h('label', { class: 'mf-muted', text: 'duration (ms)' }), dur]),
          h('div', { class: 'mf-col', style: 'flex:1;' }, [h('label', { class: 'mf-muted', text: 'easing' }), easing]),
        ]));

        if (trig.type === 'view') {
          const once = h('input', {
            type: 'checkbox', ...(trig.once ? { checked: 'checked' } : {}),
            onChange: (e) => { trig.once = !!e.target.checked; this.refreshPreview(); },
          });
          const reverse = h('input', {
            type: 'checkbox', ...(trig.reverseOnExit !== false ? { checked: 'checked' } : {}),
            onChange: (e) => { trig.reverseOnExit = !!e.target.checked; this.refreshPreview(); },
          });
          box.appendChild(h('div', { class: 'mf-row', style: 'margin-top:8px;' }, [
            once, h('span', { text: 'play once' }),
            reverse, h('span', { text: 'reverse on exit' }),
          ]));
        }
      }

      return box;
    }

    renderPropertiesEditor(track) {
      const props = Array.isArray(track.properties) ? track.properties : (track.properties = []);
      const box = h('div', { class: 'mf-card', style: 'margin-top:10px;' });

      box.appendChild(h('div', { class: 'mf-row', style: 'justify-content:space-between; margin-bottom:6px;' }, [
        h('div', { text: 'Properties' }),
        h('button', {
          class: 'mf-btn',
          text: 'Add Property',
          onClick: () => { props.push({ type: 'opacity', from: 1, to: 0 }); this.render(); this.refreshPreview(); },
        }),
      ]));

      const list = h('div', { class: 'mf-list' });

      const unitPick = (p) => h('select', {
        class: 'mf-select',
        onChange: (e) => { p.unit = e.target.value; this.refreshPreview(); },
      }, [
        h('option', { value: 'px', text: 'px', ...(p.unit === 'px' ? { selected: 'selected' } : {}) }),
        h('option', { value: '%', text: '%', ...(p.unit === '%' ? { selected: 'selected' } : {}) }),
        h('option', { value: 'deg', text: 'deg', ...(p.unit === 'deg' ? { selected: 'selected' } : {}) }),
        h('option', { value: '', text: '(none)', ...(!p.unit ? { selected: 'selected' } : {}) }),
      ]);

      props.forEach((p, idx) => {
        const typeSel = h('select', {
          class: 'mf-select',
          onChange: (e) => {
            const t = e.target.value;
            if (t === 'opacity') props[idx] = { type: 'opacity', from: 1, to: 0 };
            if (t === 'translateY') props[idx] = { type: 'translateY', from: 0, to: 100, unit: 'px' };
            if (t === 'translateX') props[idx] = { type: 'translateX', from: 0, to: 100, unit: 'px' };
            if (t === 'rotate') props[idx] = { type: 'rotate', from: 0, to: 30, unit: 'deg' };
            if (t === 'scale') props[idx] = { type: 'scale', from: 1, to: 1.1 };
            if (t === 'parallaxY') props[idx] = { type: 'parallaxY', base: 0, distance: 100, unit: 'px' };
            this.render();
            this.refreshPreview();
          },
        }, [
          h('option', { value: 'opacity', text: 'opacity', ...(p.type === 'opacity' ? { selected: 'selected' } : {}) }),
          h('option', { value: 'translateY', text: 'translateY', ...(p.type === 'translateY' ? { selected: 'selected' } : {}) }),
          h('option', { value: 'translateX', text: 'translateX', ...(p.type === 'translateX' ? { selected: 'selected' } : {}) }),
          h('option', { value: 'rotate', text: 'rotate', ...(p.type === 'rotate' ? { selected: 'selected' } : {}) }),
          h('option', { value: 'scale', text: 'scale', ...(p.type === 'scale' ? { selected: 'selected' } : {}) }),
          h('option', { value: 'parallaxY', text: 'parallaxY (base + distance*t)', ...(p.type === 'parallaxY' ? { selected: 'selected' } : {}) }),
        ]);

        const rm = h('button', {
          class: 'mf-btn danger',
          text: 'Remove',
          onClick: () => { props.splice(idx, 1); this.render(); this.refreshPreview(); },
        });

        const row = h('div', { class: 'mf-card' }, [
          h('div', { class: 'mf-row' }, [typeSel, rm]),
        ]);

        const num = (label, key) => h('div', { class: 'mf-col', style: 'flex:1;' }, [
          h('label', { class: 'mf-muted', text: label }),
          h('input', {
            class: 'mf-input', type: 'number',
            value: String(p[key] ?? 0),
            onInput: (e) => { p[key] = Number(e.target.value) || 0; this.refreshPreview(); },
          }),
        ]);

        const controls = h('div', { class: 'mf-col', style: 'margin-top:6px;' });

        if (p.type === 'opacity' || p.type === 'scale') {
          controls.appendChild(h('div', { class: 'mf-row' }, [num('from', 'from'), num('to', 'to')]));
        } else if (p.type === 'translateX' || p.type === 'translateY' || p.type === 'rotate') {
          controls.appendChild(h('div', { class: 'mf-row' }, [
            num('from', 'from'),
            num('to', 'to'),
            h('div', { class: 'mf-col', style: 'flex:1;' }, [h('label', { class: 'mf-muted', text: 'unit' }), unitPick(p)]),
          ]));
        } else if (p.type === 'parallaxY') {
          controls.appendChild(h('div', { class: 'mf-row' }, [
            num('base', 'base'),
            num('distance', 'distance'),
            h('div', { class: 'mf-col', style: 'flex:1;' }, [h('label', { class: 'mf-muted', text: 'unit' }), unitPick(p)]),
          ]));
          controls.appendChild(h('div', { class: 'mf-muted', text: 'This sets --base-offset and --parallax-distance from config (no HTML needed).' }));
        }

        row.appendChild(controls);
        list.appendChild(row);
      });

      box.appendChild(list);
      return box;
    }
  }

  MF.Editor = MotionForgeEditor;
})();

