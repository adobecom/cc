const DEFAULTS = {
  // MATH: 7000ms total / 3 transitions (4 items) = ~2333ms per step.
  totalDuration: 7000,
  initialWait: 500,
  prefixColor: '#000000', // UPDATED: Default to black
  slotColor: '#f33',
  easing: (p) => p,
};

const createEl = (tag, className, text = '', attrs = {}, styles = {}) => {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text) el.textContent = text;
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  Object.entries(styles).forEach(([k, v]) => el.style[k] = v);
  return el;
};

function parseSlotData(block) {
  const config = {
    prefix: '',
    items: [],
    totalDuration: null,
    initialWait: null,
    prefixColor: null,
    slotColor: null,
  };

  const rows = Array.from(block.children);

  rows.forEach((row) => {
    const keyDiv = row.children[0];
    const valDiv = row.children[1];
    if (!keyDiv || !valDiv) return;

    const key = keyDiv.textContent.trim().toLowerCase();
    const value = valDiv.textContent.trim();

    switch (key) {
      case 'prefix':
        config.prefix = value;
        break;
      case 'slot':
        config.items = value
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
        break;
      case 'total-animation-duration':
        const dur = parseInt(value, 10);
        if (!isNaN(dur)) config.totalDuration = dur;
        break;
      case 'initial-wait':
        const wait = parseInt(value, 10);
        if (!isNaN(wait)) config.initialWait = wait;
        break;
      case 'prefix-color':
        config.prefixColor = value;
        break;
      case 'slot-color':
        config.slotColor = value;
        break;
    }
  });

  return config;
}

function renderComponent(block, data) {
  block.innerHTML = '';
  block.setAttribute('role', 'group');

  const { prefix, items, prefixColor, slotColor } = data;
  const finalPrefixColor = prefixColor || DEFAULTS.prefixColor;
  const finalSlotColor = slotColor || DEFAULTS.slotColor;
  const finalWord = items && items.length > 0 ? items[items.length - 1] : '';
  const fullText = [prefix, finalWord].filter(Boolean).join(' ');
  block.setAttribute('aria-label', fullText);

  const wrapper = document.createElement('div');

  if (prefix) {
    wrapper.appendChild(
      createEl(
        'span',
        'slot-static-text',
        prefix,
        { 'aria-hidden': 'true' },
        { color: finalPrefixColor }
      )
    );
  }

  let windowEl, reelEl;
  if (items && items.length > 0) {
    windowEl = createEl('span', 'slot-machine-window', '', {
      'aria-hidden': 'true',
    });
    reelEl = createEl('span', 'slot-reel');

    const reelFragment = document.createDocumentFragment();
    items.forEach((text) => {
      reelFragment.appendChild(
        createEl('div', 'slot-item', text, {}, { color: finalSlotColor })
      );
    });

    reelEl.appendChild(reelFragment);
    windowEl.appendChild(reelEl);
    wrapper.appendChild(windowEl);
  }

  block.appendChild(wrapper);
  return { windowEl, reelEl };
}

const measureGeometry = (reelEl) => {
  const items = Array.from(reelEl.children);
  if (!items.length) return { height: 0 };
  return { height: items[0].offsetHeight };
};

const setRafTimeout = (callback, delay) => {
  const start = performance.now();
  let handle;
  const loop = (now) => {
    if (now - start >= delay) callback();
    else handle = window.requestAnimationFrame(loop);
  };
  handle = window.requestAnimationFrame(loop);
  return () => window.cancelAnimationFrame(handle);
};

const calculateStepDuration = (totalItems, instanceTotalDuration) => {
  if (!totalItems || totalItems <= 1) return 0;
  const totalTime = instanceTotalDuration || DEFAULTS.totalDuration;
  return totalTime / (totalItems -1);
};

const calculateStyles = (index, height, duration) => ({
  transform: `translate3d(0, ${index * height * -1}px, 0)`,
  transition:
    duration === 0 ? 'none' : `transform ${duration}ms var(--anim-ease)`,
});

const applyStyles = (reelEl, styles) => {
  requestAnimationFrame(() => {
    Object.assign(reelEl.style, {
      transform: styles.transform,
      transition: styles.transition,
    });
    if (styles.transition === 'none') void reelEl.offsetWidth; // Force Reflow only if needed
  });
};

function decorateContent(el) {
  if (!el) return;
  const data = parseSlotData(el);
  el.innerHTML = '';

  const foreground = document.createElement('div');
  foreground.classList.add('foreground');
  el.appendChild(foreground);

  const { reelEl } = renderComponent(foreground, data);

  if (!data.items.length) return;

  let state = { currentIndex: 0, dimensions: { height: 0 } };

  const updateState = (index, duration) => {
    if (!state.dimensions.height) return;

    const styles = calculateStyles(index, state.dimensions.height, duration);
    applyStyles(reelEl, styles);
  };

  const runSequence = (index = 0) => {
    state.currentIndex = index;
    if (index >= data.items.length) return;
    const duration = calculateStepDuration(data.items.length, data.totalDuration);
    updateState(index, duration);

    if (index >= data.items.length - 1) return;

    const onTransitionEnd = (e) => {
      if (e.target !== reelEl) return; // Only listen to reel
      reelEl.removeEventListener('transitionend', onTransitionEnd);
      runSequence(index + 1);
    };

    const cancelSafety = setRafTimeout(() => {
      reelEl.removeEventListener('transitionend', onTransitionEnd);
      runSequence(index + 1);
    }, duration + 50);

    reelEl.addEventListener(
      'transitionend',
      (e) => {
        cancelSafety();
        onTransitionEnd(e);
      },
      { once: true }
    );
  };

  const handleResize = () => {
    const newDims = measureGeometry(reelEl);
    if (newDims.height > 0) {
      state.dimensions = newDims;
      updateState(state.currentIndex, 0);
    }
  };

  const setupTriggers = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      state.currentIndex = data.items.length - 1;
      state.dimensions = measureGeometry(reelEl);
      updateState(state.currentIndex, 0);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            state.dimensions = measureGeometry(reelEl);
            updateState(0, 0);
            const waitTime = data.initialWait !== null ? data.initialWait : DEFAULTS.initialWait;
            setRafTimeout(() => runSequence(1), waitTime);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    window.addEventListener('resize', handleResize);
  };

  setupTriggers();
}
export default function init(el) {
  try {
    el.classList.add('con-block');
    decorateContent(el);
  } catch (err) {
    console.error(err);
  }
}
