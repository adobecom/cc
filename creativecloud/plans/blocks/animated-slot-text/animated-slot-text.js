// Animated Slot Text Component
// Provides animated text transitions with slot machine effect and responsive behavior
import { debounce } from '../../scripts/action.js';
import { createTag, getLibs } from '../../scripts/utils.js';

// Configuration constants
const LANA_OPTIONS = { tags: 'animated-slot-text', errorType: 'i' };

const DEFAULTS = {
  // MATH: 7000ms total / 3 transitions (4 items) = ~2333ms per step.
  totalDuration: 7000,
  initialWait: 500,
  prefixColor: '#000000', // Default to black
  slotColor: '#f33',
  safetyTimeoutBuffer: 50, // Buffer for safety timeout in animation sequence
  resizeDebounceDelay: 100, // Debounce delay for resize events
  intersectionThreshold: 0.5, // Threshold for intersection observer
};

const PLACEHOLDER_LABELS = ['pause-motion', 'play-motion', 'pause-icon', 'play-icon'];

let animationLabels = {
  playMotion: 'Play',
  pauseMotion: 'Pause',
  pauseIcon: 'Pause icon',
  playIcon: 'Play icon',
};

// ===== UTILITY FUNCTIONS =====

function logError(message, error) {
  window.lana?.log(`Animation slot text ${message}: ${error}`, LANA_OPTIONS);
}

async function fetchAnimationLabels(getFedsPlaceholderConfig, replaceKeyArray) {
  try {
    const [pauseMotion, playMotion, pauseIcon, playIcon] = await replaceKeyArray(
      PLACEHOLDER_LABELS,
      getFedsPlaceholderConfig(),
    );
    return { playMotion, pauseMotion, pauseIcon, playIcon, hasFetched: true };
  } catch (err) {
    logError('Failed to fetch animation labels', err);
    return animationLabels;
  }
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
    if (styles.transition === 'none') {
      reelEl.getBoundingClientRect();
    }
  });
};

const calculateStepDuration = (totalItems, instanceTotalDuration) => {
  if (!totalItems || totalItems <= 1) return 0;
  const totalTime = instanceTotalDuration || DEFAULTS.totalDuration;
  return totalTime / (totalItems - 1);
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
      if (!row.children || row.children.length < 2) return;

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
    if (items?.length < 1) return [];
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return [items[items.length - 1]];
    }
    return items.map((item) => item.replace(/\./g, ''));
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

  const styles = {
    transform: `translate3d(0, ${index * state.dimensions.height * -1}px, 0)`,
    transition: duration === 0 ? 'none' : `transform ${duration}ms var(--anim-ease)`,
  };
  applyStyles(reelEl, styles);
}

function createAnimationController(state, reelEl, windowEl, data, controlActions, animationRef) {
  const runSequence = (index = 0) => {
    try {
      state.currentIndex = index;

      if (index < data.items.length - 1) {
        windowEl.classList.remove('finished');
      }

      if (index >= data.items.length) {
        controlActions?.updateControlState(false);
        return;
      }

      const duration = (index === 0)
        ? 0
        : calculateStepDuration(data.items.length, data.totalDuration);

      updateAnimationState(state, reelEl, index, duration);

      if (index >= data.items.length - 1) {
        const maskCancel = setRafTimeout(() => {
          windowEl.classList.add('finished');
          controlActions?.updateControlState(false);
        }, duration);
        animationRef.cancel = maskCancel;
        return;
      }

      if (duration === 0) {
        const snapCancel = setRafTimeout(() => {
          runSequence(index + 1);
        }, 50);
        animationRef.cancel = snapCancel;
        return;
      }
      let onTransitionEnd;

      const triggerNext = () => {
        reelEl.removeEventListener('transitionend', onTransitionEnd);
        runSequence(index + 1);
      };

      const safetyCancel = setRafTimeout(triggerNext, duration + DEFAULTS.safetyTimeoutBuffer);

      onTransitionEnd = (e) => {
        if (e.target !== reelEl) return;
        safetyCancel();
        triggerNext();
      };

      animationRef.cancel = () => {
        reelEl.removeEventListener('transitionend', onTransitionEnd);
        safetyCancel();
      };

      reelEl.addEventListener('transitionend', onTransitionEnd);
    } catch (err) {
      logError('Animation sequence error', err);
    }
  };

  return { runSequence };
}

// ===== EVENT HANDLING & CONTROLS =====

function initControls({
  wrapper,
  filler,
  data,
  windowEl,
  updateVisuals,
  updateStateIndex,
  animationInterface,
  animationRef,
}) {
  let isPlaying = true;

  const updateControlState = (playing) => {
    isPlaying = playing;
    if (!wrapper || !filler) return;

    if (playing) {
      filler.classList.add('is-playing');
      wrapper.setAttribute('aria-label', animationLabels.pauseMotion);
      wrapper.setAttribute('title', animationLabels.pauseMotion);
      wrapper.setAttribute('aria-pressed', 'true');
    } else {
      filler.classList.remove('is-playing');
      wrapper.setAttribute('aria-label', animationLabels.playMotion);
      wrapper.setAttribute('title', animationLabels.playMotion);
      wrapper.setAttribute('aria-pressed', 'false');
    }
  };

  const jumpToEnd = () => {
    if (animationRef.cancel) animationRef.cancel();
    const lastIndex = data.items.length - 1;
    if (updateStateIndex) updateStateIndex(lastIndex);
    updateVisuals(lastIndex, 0);
    windowEl.classList.add('finished');
  };

  const restartAnimation = () => {
    if (animationRef.cancel) animationRef.cancel();
    windowEl.classList.remove('finished');
    if (animationInterface && animationInterface.start) {
      animationInterface.start(0);
    }
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      updateControlState(false);
      jumpToEnd();
    } else {
      updateControlState(true);
      restartAnimation();
    }
  };

  if (wrapper) {
    wrapper.addEventListener('click', (e) => {
      e.preventDefault();
      togglePlayPause();
    });
    wrapper.addEventListener('keydown', (e) => {
      if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        togglePlayPause();
      }
    });
  }

  return { updateControlState };
}

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

function setupEventTriggers(config) {
  const {
    el, state, animationController, resizeHandler, data, windowEl, reelEl, animationRef,
  } = config;
  try {
    window.addEventListener('resize', debounce(resizeHandler, DEFAULTS.resizeDebounceDelay));
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      state.currentIndex = data.items.length - 1;
      // Ensure DOM is ready for measurement
      window.requestAnimationFrame(() => {
        state.dimensions = measureGeometry(reelEl);
        if (state.dimensions.height > 0) {
          updateAnimationState(state, reelEl, state.currentIndex, 0);
        }
        windowEl.classList.add('finished');
      });
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

            const startCancel = setRafTimeout(() => animationController.runSequence(1), waitTime);
            animationRef.cancel = startCancel;

            observer.disconnect();
          }
        });
      },
      { threshold: DEFAULTS.intersectionThreshold },
    );

    observer.observe(el);
  } catch (err) {
    logError('Failed to setup event triggers', err);
  }
}

function addAccessibilityControl(el, getFederatedContentRoot) {
  if (!el) return;
  const fedRoot = getFederatedContentRoot();

  const controlContainer = createTag('div', { class: 'animation-controls' });

  const a = createTag('a', {
    class: 'pause-play-wrapper',
    title: `${animationLabels.pauseMotion}`,
    'aria-label': `${animationLabels.pauseMotion}`,
    role: 'button',
    tabIndex: 0,
    'aria-pressed': true,
  });
  const offset = createTag('div', { class: 'offset-filler is-playing' });
  const play = createTag('img', {
    class: 'accessibility-control play-icon',
    alt: `${animationLabels.playIcon}`,
    src: `${fedRoot}/federal/assets/svgs/accessibility-play.svg`,
  });
  const pause = createTag('img', {
    class: 'accessibility-control pause-icon',
    alt: `${animationLabels.pauseIcon}`,
    src: `${fedRoot}/federal/assets/svgs/accessibility-pause.svg`,
  });
  offset.appendChild(play);
  offset.appendChild(pause);
  a.appendChild(offset);
  controlContainer.appendChild(a);
  el?.appendChild(controlContainer);
}

// ===== COMPONENT INITIALIZATION =====

function decorateContent(
  el,
  getFederatedContentRoot,
) {
  try {
    if (!el) return;

    const data = parseSlotData(el);
    const { reelEl, windowEl } = setupComponentDOM(el, data);

    if (!data.items.length || !reelEl || !windowEl) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const animationRef = { cancel: null };
    const animationInterface = { start: null };
    const controlsActions = { updateControlState: () => {} };

    const state = { currentIndex: 0, dimensions: { height: 0 } };

    if (!reducedMotion) {
      addAccessibilityControl(el, getFederatedContentRoot);

      const ctrlInterface = initControls({
        wrapper: el?.querySelector('.animation-controls .pause-play-wrapper'),
        filler: el?.querySelector('.animation-controls .pause-play-wrapper .offset-filler'),
        data,
        windowEl,
        updateVisuals: (idx, dur) => updateAnimationState(state, reelEl, idx, dur),
        updateStateIndex: (idx) => { state.currentIndex = idx; },
        animationInterface,
        animationRef,
      });

      controlsActions.updateControlState = ctrlInterface.updateControlState;
    }

    const animationController = createAnimationController(
      state,
      reelEl,
      windowEl,
      data,
      controlsActions,
      animationRef,
    );

    animationInterface.start = animationController.runSequence;

    const resizeHandler = createResizeHandler(state, reelEl);

    setupEventTriggers({
      el, state, animationController, resizeHandler, data, windowEl, reelEl, animationRef,
    });
  } catch (err) {
    logError('Failed to decorate content', err);
  }
}

export default async function init(el) {
  try {
    const miloLibs = getLibs('/libs');
    const { getFederatedContentRoot, getFedsPlaceholderConfig } = await import(`${miloLibs}/utils/utils.js`);
    const { replaceKeyArray } = await import(`${miloLibs}/features/placeholders.js`);
    animationLabels = await fetchAnimationLabels(
      getFedsPlaceholderConfig,
      replaceKeyArray,
    );
    el.classList.add('con-block');
    decorateContent(
      el,
      getFederatedContentRoot,
    );
  } catch (err) {
    window.lana?.log(`Animation slot text Init Error: ${err}`, LANA_OPTIONS);
  }
}
