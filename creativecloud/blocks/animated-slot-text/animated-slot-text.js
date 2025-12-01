// Animated Slot Text Component
// Provides animated text transitions with slot machine effect and responsive behavior

import { debounce } from '../../scripts/action.js';
import { createTag } from '../../scripts/utils.js';

// Configuration constants
const LANA_OPTIONS = { tags: 'firefly-gallery', errorType: 'i' };

const DEFAULTS = {
  // MATH: 7000ms total / 3 transitions (4 items) = ~2333ms per step.
  totalDuration: 7000,
  initialWait: 500,
  prefixColor: '#000000', // UPDATED: Default to black
  slotColor: '#f33',
  safetyTimeoutBuffer: 50, // Buffer for safety timeout in animation sequence
  resizeDebounceDelay: 100, // Debounce delay for resize events
  intersectionThreshold: 0.5, // Threshold for intersection observer
};

// ===== UTILITY FUNCTIONS =====

function logError(message, error) {
  window.lana?.log(`Animation slot text ${message}: ${error}`, LANA_OPTIONS);
}

const createEl = (tag, className, text = '', attrs = {}, styles = {}) => {
  const el = createTag(tag, attrs);
  if (className) el.className = className;
  if (text) el.textContent = text;
  Object.entries(styles).forEach(([k, v]) => {
    el.style[k] = v;
  });
  return el;
};

const measureGeometry = (reelEl) => {
  const items = Array.from(reelEl.children);
  if (!items.length) return { height: 0 };
  return { height: items[0].getBoundingClientRect().height };
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

const applyStyles = (reelEl, styles) => {
  window.requestAnimationFrame(() => {
    Object.assign(reelEl.style, {
      transform: styles.transform,
      transition: styles.transition,
    });
    if (styles.transition === 'none') reelEl.getBoundingClientRect();
  });
};

// ===== DATA PROCESSING =====

function parseSlotData(block) {
  const config = {
    prefix: '',
    items: [],
    totalDuration: null,
    initialWait: null,
    prefixColor: null,
    slotColor: null,
  };

  try {
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
        case 'total-animation-duration': {
          const dur = parseInt(value, 10);
          if (!Number.isNaN(dur)) config.totalDuration = dur;
          break;
        }
        case 'initial-wait': {
          const wait = parseInt(value, 10);
          if (!Number.isNaN(wait)) config.initialWait = wait;
          break;
        }
        case 'prefix-color':
          config.prefixColor = value;
          break;
        case 'slot-color':
          config.slotColor = value;
          break;
        default:
          break;
      }
    });
  } catch (err) {
    logError('Failed to parse slot data', err);
  }

  return config;
}

function getSlotTextItems(items) {
  try {
    return items?.length ? items.map((item) => item.replace(/[^a-zA-Z0-9\s]/g, '')) : [];
  } catch (err) {
    logError('Failed to process slot text items', err);
    return [];
  }
}

// ===== DOM OPERATIONS =====

function renderComponent(block, data) {
  try {
    block.innerHTML = '';
    block.setAttribute('role', 'group');

    const { prefix, items, prefixColor, slotColor } = data;
    const finalPrefixColor = prefixColor || DEFAULTS.prefixColor;
    const finalSlotColor = slotColor || DEFAULTS.slotColor;
    const finalWord = getSlotTextItems(items);
    const fullText = [prefix, finalWord?.join(', ')].filter(Boolean).join(' ');
    block.setAttribute('aria-label', fullText);

    const wrapper = document.createElement('div');

    if (prefix) {
      wrapper.appendChild(
        createEl(
          'span',
          'slot-static-text',
          prefix,
          { 'aria-hidden': 'true' },
          { color: finalPrefixColor },
        ),
      );
    }

    let windowEl;
    let reelEl;
    if (items && items.length > 0) {
      windowEl = createEl('span', 'slot-machine-window', '', { 'aria-hidden': 'true' });
      reelEl = createEl('span', 'slot-reel');

      const reelFragment = document.createDocumentFragment();
      items.forEach((text) => {
        reelFragment.appendChild(
          createEl('div', 'slot-item', text, {}, { color: finalSlotColor }),
        );
      });

      reelEl.appendChild(reelFragment);
      windowEl.appendChild(reelEl);
      wrapper.appendChild(windowEl);
    }

    block.appendChild(wrapper);
    return { windowEl, reelEl };
  } catch (err) {
    logError('Failed to render component', err);
    return { windowEl: null, reelEl: null };
  }
}

function setupComponentDOM(el, data) {
  try {
    el.innerHTML = '';
    const foreground = document.createElement('div');
    foreground.classList.add('foreground');
    el.appendChild(foreground);
    return renderComponent(foreground, data);
  } catch (err) {
    logError('Failed to setup component DOM', err);
    return { windowEl: null, reelEl: null };
  }
}

// ===== ANIMATION FUNCTIONS =====

function updateAnimationState(state, reelEl, index, duration) {
  if (!state.dimensions.height) return;

  // Inline styles calculation
  const styles = {
    transform: `translate3d(0, ${index * state.dimensions.height * -1}px, 0)`,
    transition: duration === 0 ? 'none' : `transform ${duration}ms var(--anim-ease)`,
  };
  applyStyles(reelEl, styles);
}

function createAnimationController(state, reelEl, windowEl, data) {
  const runSequence = (index = 0) => {
    try {
      state.currentIndex = index;
      if (index < data.items.length - 1) {
        windowEl.classList.remove('finished');
      }
      if (index >= data.items.length) return;

      // Inline calculation: total time / (number of transitions)
      const duration = (!data.items.length || data.items.length <= 1)
        ? 0
        : (data.totalDuration || DEFAULTS.totalDuration) / (data.items.length - 1);
      updateAnimationState(state, reelEl, index, duration);

      if (index >= data.items.length - 1) {
        setRafTimeout(() => {
          windowEl.classList.add('finished');
        }, duration);
        return;
      }

      const onTransitionEnd = (e) => {
        if (e.target !== reelEl) return;
        reelEl.removeEventListener('transitionend', onTransitionEnd);
        runSequence(index + 1);
      };

      const cancelSafety = setRafTimeout(() => {
        reelEl.removeEventListener('transitionend', onTransitionEnd);
        runSequence(index + 1);
      }, duration + DEFAULTS.safetyTimeoutBuffer);

      reelEl.addEventListener(
        'transitionend',
        (e) => {
          cancelSafety();
          onTransitionEnd(e);
        },
        { once: true },
      );
    } catch (err) {
      logError('Animation sequence error', err);
    }
  };

  return { runSequence };
}

// ===== EVENT HANDLING =====

function createResizeHandler(state, reelEl) {
  return () => {
    try {
      const newDims = measureGeometry(reelEl);
      if (newDims.height > 0) {
        state.dimensions = newDims;
        updateAnimationState(state, reelEl, state.currentIndex, 0);
      }
    } catch (err) {
      logError('Resize handling error', err);
    }
  };
}

function setupEventTriggers(el, state, animationController, resizeHandler, data, windowEl, reelEl) {
  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      state.currentIndex = data.items.length - 1;
      state.dimensions = measureGeometry(reelEl);
      updateAnimationState(state, reelEl, state.currentIndex, 0);
      windowEl.classList.add('finished');
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            state.dimensions = measureGeometry(reelEl);
            updateAnimationState(state, reelEl, 0, 0);
            const waitTime = data.initialWait !== null
              ? data.initialWait
              : DEFAULTS.initialWait;
            setRafTimeout(() => animationController.runSequence(1), waitTime);
            observer.disconnect();
          }
        });
      },
      { threshold: DEFAULTS.intersectionThreshold },
    );

    observer.observe(el);
    window.addEventListener('resize', debounce(resizeHandler, DEFAULTS.resizeDebounceDelay));
  } catch (err) {
    logError('Failed to setup event triggers', err);
  }
}

// ===== COMPONENT INITIALIZATION =====

function decorateContent(el) {
  try {
    if (!el) return;

    const data = parseSlotData(el);
    const { reelEl, windowEl } = setupComponentDOM(el, data);

    if (!data.items.length || !reelEl || !windowEl) return;

    const state = { currentIndex: 0, dimensions: { height: 0 } };
    const animationController = createAnimationController(state, reelEl, windowEl, data);
    const resizeHandler = createResizeHandler(state, reelEl);

    setupEventTriggers(el, state, animationController, resizeHandler, data, windowEl, reelEl);
  } catch (err) {
    logError('Failed to decorate content', err);
  }
}

export default function init(el) {
  try {
    el.classList.add('con-block');
    decorateContent(el);
  } catch (err) {
    window.lana?.log(`Animation slot text Init Error: ${err}`, LANA_OPTIONS);
  }
}
