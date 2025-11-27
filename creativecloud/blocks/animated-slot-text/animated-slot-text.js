const CONFIG = {
  // MATH: 7000ms total / 3 transitions (4 items) = ~2333ms per step.
  totalDuration: 7000,
  initialWait: 500,
  easing: (p) => p, 
};

const createEl = (tag, className, text = '', attrs = {}) => {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text) el.textContent = text;
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  return el;
};

function parseSlotData(htmlString) {
  const lines = htmlString.split(/(?:<br\s*\/?>|<\/p>|<\/div>|\n)/i);
  const stripTags = (s) => s.replace(/<[^>]*>/g, '');

  return lines.reduce((acc, rawLine) => {
      const cleanLine = stripTags(rawLine).trim();
      const lowerLine = cleanLine.toLowerCase();

      if (lowerLine.startsWith('prefix:'))
          return { ...acc, prefix: cleanLine.substring(7).trim() };
      
      if (lowerLine.startsWith('slot:'))
          return {
              ...acc,
              items: cleanLine.substring(5).split(',').map(s => s.trim()).filter(Boolean),
          };
      return acc;
  }, { prefix: '', items: [] });
}

function renderComponent(block, { prefix, items }) {
  block.innerHTML = '';
  block.setAttribute('role', 'group');
  const finalWord = items && items.length > 0 ? items[items.length - 1] : '';
  const fullText = [prefix, finalWord].filter(Boolean).join(' ');
  block.setAttribute('aria-label', fullText);

  const mainFragment = document.createDocumentFragment();
  const appendIfText = (text, cls) => text && mainFragment.appendChild(createEl('span', cls, text, { 'aria-hidden': 'true' }));

  appendIfText(prefix, 'slot-static-text');

  let windowEl, reelEl;
  if (items && items.length > 0) {
      windowEl = createEl('span', 'slot-machine-window', '', { 'aria-hidden': 'true' });
      reelEl = createEl('span', 'slot-reel');
      const reelFragment = document.createDocumentFragment();
      items.forEach(text => reelFragment.appendChild(createEl('div', 'slot-item', text)));
      reelEl.appendChild(reelFragment);
      windowEl.appendChild(reelEl);
      mainFragment.appendChild(windowEl);
  }

  block.appendChild(mainFragment);
  return { windowEl, reelEl };
}

const measureGeometry = (reelEl) => {
  const items = Array.from(reelEl.children);
  if (!items.length) return { height: 0 };
  
  return {
      height: items[0].offsetHeight
  };
};

const setRafTimeout = (callback, delay) => {
  const start = performance.now();
  let handle;
  const loop = (now) => {
      if (now - start >= delay) callback();
      else handle = requestAnimationFrame(loop);
  };
  handle = requestAnimationFrame(loop);
  return () => cancelAnimationFrame(handle);
};

const calculateStepDuration = (totalItems) => {
  if (!totalItems || totalItems <= 1) return 0;
  return CONFIG.totalDuration/(totalItems -1);
};

const calculateStyles = (index, height, duration) => ({
  transform: `translate3d(0, ${index * height * -1}px, 0)`,
  transition: duration === 0 ? 'none' : `transform ${duration}ms var(--anim-ease)`,
});

const applyStyles = (windowEl, reelEl, styles) => {
  requestAnimationFrame(() => {
      Object.assign(reelEl.style, { transform: styles.transform, transition: styles.transition });
      if (styles.transition === 'none') void reelEl.offsetWidth;
  });
};

function decorateContent(el) {
  const block = el.querySelector(':scope > div:not([class])') || el.firstElementChild;
  if (!block) return;
  block.classList.add('foreground');
  
  const contentBlock = block.querySelector(':scope > div'); 
  if (!contentBlock) return;
  
  const rawContent = contentBlock.innerHTML;
  const data = parseSlotData(rawContent);
  const { windowEl, reelEl } = renderComponent(contentBlock, data);

  if (!data.items.length) return;

  let state = { currentIndex: 0, dimensions: { height: 0 } };

  const updateState = (index, duration) => {
      if (!state.dimensions.height) return;
      
      const styles = calculateStyles(index, state.dimensions.height, duration);
      applyStyles(windowEl, reelEl, styles);
  };

  const runSequence = (index = 0) => {
      state.currentIndex = index;
      if (index >= data.items.length) return;
      const duration = calculateStepDuration(data.items.length);
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

      reelEl.addEventListener('transitionend', (e) => {
          cancelSafety();
          onTransitionEnd(e);
      }, { once: true });
  };

  const handleResize = () => {
      const newDims = measureGeometry(reelEl);
      if (newDims.height > 0) {
          state.dimensions = newDims;
          updateState(state.currentIndex, 0);
      }
  };

  const setupTriggers = () => {
      document.fonts.ready.then(() => {
          state.dimensions = measureGeometry(reelEl);
          updateState(0, 0);
      });

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          state.currentIndex = data.items.length - 1;
          state.dimensions = measureGeometry(reelEl);
          updateState(state.currentIndex, 0);
          return;
      }

      const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
              if (entry.isIntersecting) {
                  state.dimensions = measureGeometry(reelEl);
                  updateState(0, 0);
                  setRafTimeout(() => runSequence(1), CONFIG.initialWait);
                  observer.disconnect();
              }
          });
      }, { threshold: 0.5 });

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
