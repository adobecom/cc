const CONFIG = {
  minDuration: 400,
  maxDuration: 2000,
  initialWait: 500,
  easing: (p) => Math.pow(p, 2),
};

const createEl = (tag, className, text = '', attrs = {}) => {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text) el.textContent = text;
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  return el;
};

function parseSlotData(htmlString) {
  const lines = htmlString.split(/<br\s*\/?>/i);

  return lines.reduce(
    (acc, line) => {
      const cleanLine = line.trim();
      const lowerLine = cleanLine.toLowerCase();

      if (lowerLine.startsWith('prefix:'))
        return { ...acc, prefix: cleanLine.substring(7).trim() };

      if (lowerLine.startsWith('suffix:'))
        return { ...acc, suffix: cleanLine.substring(7).trim() };

      if (lowerLine.startsWith('slot:'))
        return {
          ...acc,
          items: cleanLine
            .substring(5)
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
        };

      return acc;
    },
    { prefix: '', suffix: '', items: [] }
  );
}

function renderComponent(block, { prefix, suffix, items }) {
  block.innerHTML = '';
  block.setAttribute('role', 'group');
  const finalWord = items && items.length > 0 ? items[items.length - 1] : '';
  const fullText = [prefix, finalWord, suffix]
    .filter((str) => str && str.trim().length > 0)
    .join(' ');

  block.setAttribute('aria-label', fullText);
  const mainFragment = document.createDocumentFragment();

  const appendIfText = (text, cls) =>
    text &&
    mainFragment.appendChild(
      createEl('span', cls, text, { 'aria-hidden': 'true' })
    );

  appendIfText(prefix, 'slot-static-text');

  let windowEl, reelEl;

  if (items && items.length > 0) {
    windowEl = createEl('span', 'slot-machine-window', '', {
      'aria-hidden': 'true',
    });
    reelEl = createEl('span', 'slot-reel');

    const reelFragment = document.createDocumentFragment();
    items.forEach((text) =>
      reelFragment.appendChild(createEl('div', 'slot-item', text))
    );
    reelEl.appendChild(reelFragment);

    windowEl.appendChild(reelEl);
    mainFragment.appendChild(windowEl);
  }

  appendIfText(suffix, 'slot-suffix');

  block.appendChild(mainFragment);

  return { windowEl, reelEl };
}

const measureGeometry = (reelEl) => {
  const items = Array.from(reelEl.children);
  if (!items.length) return { height: 0, widths: [] };

  const widths = items.map((el) => {
    const rectWidth = el.getBoundingClientRect().width;
    return Math.ceil(rectWidth > 0 ? rectWidth : el.scrollWidth);
  });

  return {
    height: items[0].offsetHeight,
    widths: widths,
  };
};

const setRafTimeout = (callback, delay) => {
  const start = performance.now();
  let handle;
  const loop = (now) => {
    if (now - start >= delay) {
      callback();
    } else {
      handle = window.requestAnimationFrame(loop);
    }
  };
  handle = window.requestAnimationFrame(loop);
  return () => cancelAnimationFrame(handle);
};

const calculateStepDuration = (index, totalItems) => {
  if (!totalItems || totalItems <= 1) return 0;
  const progress = index / (totalItems - 1);
  const safeProgress = Math.max(0, Math.min(1, progress));

  const easeFactor = CONFIG.easing(safeProgress);
  return (
    CONFIG.minDuration + (CONFIG.maxDuration - CONFIG.minDuration) * easeFactor
  );
};

const calculateStyles = (index, height, widths, duration) => ({
  width: `${widths[index]}px`,
  transform: `translate3d(0, ${index * height * -1}px, 0)`,
  transition:
    duration === 0
      ? 'none'
      : `transform ${duration}ms var(--anim-ease), width ${duration}ms var(--anim-ease)`,
});

const applyStyles = (windowEl, reelEl, styles) => {
  requestAnimationFrame(() => {
    Object.assign(windowEl.style, {
      width: styles.width,
      transition: styles.transition,
    });
    Object.assign(reelEl.style, {
      transform: styles.transform,
      transition: styles.transition,
    });

    // Force reflow ONLY if snapping (duration 0) to apply immediately
    if (styles.transition === 'none') void reelEl.offsetWidth;
  });
};

function decorateContent(el) {
  const block = el.querySelector(':scope > div:not([class])');
  if (!block) return;
  block.classList.add('foreground');
  const contentBlock = el.querySelector(':scope > div > div');
  if (!contentBlock) return;
  const rawContent = contentBlock?.innerHTML ?? '';
  const data = parseSlotData(rawContent);
  const { windowEl, reelEl } = renderComponent(contentBlock, data);
  if (!data.items.length) return;

  let state = { currentIndex: 0, dimensions: { height: 0, widths: [] } };

  const updateState = (index, duration) => {
    const styles = calculateStyles(
      index,
      state.dimensions.height,
      state.dimensions.widths,
      duration
    );
    if (styles.width === '0px' && state.dimensions.widths[index] === 0) {
      return;
    }
    applyStyles(windowEl, reelEl, styles);
  };

  const runSequence = (index = 0) => {
    state.currentIndex = index;
    if (index >= data.items.length) return;

    const duration = calculateStepDuration(index, data.items.length);

    updateState(index, duration);
    if (index >= data.items.length - 1) return;
    const onTransitionEnd = (e) => {
      if (e.target !== reelEl && e.target !== windowEl) return;
      reelEl.removeEventListener('transitionend', onTransitionEnd);
      runSequence(index + 1);
    };

    // Safety: Fallback if transitionend fails (e.g. tab backgrounded)
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
    state.dimensions = measureGeometry(reelEl);
    // RESPONSIVE FIX: Snap to the *current* index instead of the end.
    // This keeps the text stable during window resizing or orientation changes.
    updateState(state.currentIndex, 0);
  };
  const setupTriggers = () => {
    state.dimensions = measureGeometry(reelEl);

    // A11y & Performance: Check Reduced Motion preference
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) {
      state.currentIndex = data.items.length - 1;
      updateState(state.currentIndex, 0);
      return;
    }

    updateState(0, 0);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // RE-MEASURE when visible. Critical for fixing 0px width bugs.
            state.dimensions = measureGeometry(reelEl);

            updateState(0, 0);
            setRafTimeout(() => runSequence(1), CONFIG.initialWait);
            observer.disconnect();
          }
        });
      },
      { threshold: 1.0 }
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
