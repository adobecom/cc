/* rebound.runtime.js - v0.5.0 */
(() => {
  'use strict';
  const RB = (window.Rebound = window.Rebound || {});
  const DEFAULT_STORAGE_KEY = 'rebound:config:v1';

  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const lerp = (a, b, t) => a + (b - a) * t;
  const Easings = {
    linear: t => t,
    easeInOutCubic: t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  };

  function toNum(v, fallback = 0) {
    const n = typeof v === 'number' ? v : Number(v);
    return Number.isFinite(n) ? n : fallback;
  }

  function fmt(n) { return (Math.round(toNum(n, 0) * 100000) / 100000).toString(); }

  // IMPROVED: Handles comma-separated lists from multi-select
  function scopeSelectorToCss(scopeAttrSel, targetSelector, withinScope) {
    const raw = (targetSelector || '').trim();
    if (!raw) return null;
    return raw.split(',').map(part => {
      const sel = part.trim();
      if (!sel) return '';
      if (sel === ':scope') return scopeAttrSel;
      if (sel.startsWith(':scope')) return sel.replace(/^:scope\b/, scopeAttrSel);
      return withinScope !== false ? `${scopeAttrSel} ${sel}` : sel;
    }).filter(Boolean).join(', ');
  }

  function buildScrollCssRule({ selector, trigger, properties }) {
    const progressVar = trigger.progress === 'enter' ? 'var(--enter-progress, 0)' : 'var(--exit-progress, 0)';
    const s = toNum(trigger.start, 0), e = toNum(trigger.end, 100);
    const ratio = `((clamp(${s}, ${progressVar}, ${e}) - ${s}) / (${e - s || 1}))`;
    
    const tf = [], decls = [];
    let opacity = '';

    (properties || []).forEach(p => {
      const unit = p.unit || (p.type === 'rotate' ? 'deg' : (p.type === 'scale' ? '' : 'px'));
      const from = p.from ?? (p.type === 'scale' ? 1 : 0), to = p.to ?? (p.type === 'scale' ? 1 : 0);
      if (p.type === 'opacity') opacity = `opacity: calc(${from} + (${to - from}) * ${ratio});`;
      else if (['translateY', 'translateX', 'rotate', 'scale'].includes(p.type)) {
        tf.push(`${p.type}(calc(${from}${unit} + (${to - from})${unit} * ${ratio}))`);
      } else if (p.type === 'parallaxY') {
        tf.push(`translateY(calc(var(--base-offset, 0px) + var(--parallax-distance, 0px) * ${ratio}))`);
      }
    });

    if (tf.length) decls.push(`transform: ${tf.join(' ')};`);
    if (opacity) decls.push(opacity);
    return decls.length ? `${selector} { ${decls.join(' ')} }` : '';
  }

  function mount(config) {
    const styleEl = document.createElement('style');
    document.head.appendChild(styleEl);
    const destroyFns = [], scopeItems = [];
    let css = '';

    (config.animations || []).forEach((anim, ai) => {
      const scopes = document.querySelectorAll(anim.scopeSelector || 'body');
      scopes.forEach((scopeEl, si) => {
        const id = `rb-${ai}-${si}`;
        scopeEl.setAttribute('data-rb-scope', id);
        scopeItems.push({ el: scopeEl, nh: toNum(config.settings?.navHeight, 64) });
        const scopeAttr = `[data-rb-scope="${id}"]`;

        (anim.tracks || []).forEach(track => {
          if (track.trigger?.type === 'scroll') {
            const sel = scopeSelectorToCss(scopeAttr, track.targetSelector, track.withinScope);
            if (sel) css += buildScrollCssRule({ selector: sel, trigger: track.trigger, properties: track.properties });
          }
        });
      });
    });

    styleEl.textContent = css;
    const update = () => {
      scopeItems.forEach(item => {
        const r = item.el.getBoundingClientRect(), h = item.el.offsetHeight || 1;
        item.el.style.setProperty('--enter-progress', fmt(clamp((window.innerHeight - r.top) / h, 0, 1) * 100));
        item.el.style.setProperty('--exit-progress', fmt(clamp((-r.top + item.nh) / h, 0, 1) * 100));
      });
    };

    window.addEventListener('scroll', update, { passive: true });
    destroyFns.push(() => window.removeEventListener('scroll', update));
    update();

    return { destroy: () => { styleEl.remove(); destroyFns.forEach(f => f()); } };
  }

  let ACTIVE = null;
  RB.Runtime = {
    mountSingleton: (cfg) => { if (ACTIVE) ACTIVE.destroy(); ACTIVE = mount(cfg); return ACTIVE; },
    autoMount: () => {
      const cfg = JSON.parse(localStorage.getItem(DEFAULT_STORAGE_KEY));
      if (cfg) RB.Runtime.mountSingleton(cfg);
    }
  };
  RB.Runtime.autoMount();
})();
