const HEADER_HEIGHT = 64;
const LANA_OPTIONS = { tags: 'firefly-gallery', errorType: 'i' };

let lastActiveCount = 0;

const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

function measureLayout(el, paragraphs) {
  const elRect = el.getBoundingClientRect();
  const firstRect = paragraphs[0].getBoundingClientRect();
  const lastRect = paragraphs[paragraphs.length - 1].getBoundingClientRect();
  const windowHeight = window.innerHeight;

  const firstElementOffset = firstRect.top - elRect.top;
  const textHeight = lastRect.bottom - firstRect.top;

  const isAtTop = window.scrollY < 50;
  const isHero = isAtTop && firstRect.top < windowHeight * 0.4;

  return {
    firstElementOffset,
    textHeight,
    isHeroMode: isHero,
    heroStart: isHero ? firstRect.top : 0,
    heroEnd: isHero ? firstRect.top - windowHeight * 0.5 : 0,
  };
}

function calculateProgress(elementTop, layoutConfig, windowHeight) {
  const currentFirstLineTop = elementTop + layoutConfig.firstElementOffset;
  let startTargetTop;
  let endTargetTop;

  if (layoutConfig.isHeroMode) {
    startTargetTop = layoutConfig.heroStart;
    endTargetTop = layoutConfig.heroEnd;
  } else {
    startTargetTop = windowHeight - layoutConfig.textHeight;

    // Fallback for Tall Content:
    // If text is taller than 75% of the screen, waiting for the bottom
    // forces the top off-screen. We fallback to starting when top enters bottom 15%.
    if (layoutConfig.textHeight > windowHeight * 0.75) {
      startTargetTop = windowHeight * 0.85;
    }
    const travelDistance = Math.max(
      windowHeight * 0.5,
      layoutConfig.textHeight,
    );
    endTargetTop = startTargetTop - travelDistance;

    const safetyZone = HEADER_HEIGHT + (windowHeight * 0.2);
    if (endTargetTop < safetyZone && layoutConfig.textHeight < windowHeight) {
      endTargetTop = safetyZone;
    }
  }

  const totalTravel = startTargetTop - endTargetTop;
  const currentMoved = startTargetTop - currentFirstLineTop;
  return clamp(currentMoved / totalTravel, 0, 1);
}

function prepareRevealSection(originalParagraphs) {
  const allChars = [];
  const layoutData = originalParagraphs.map((p) => ({
    p,
    text: p.innerText,
  }));
  layoutData.forEach(({ p, text }) => {
    p.classList.add('semantic-text');
    p.removeAttribute('aria-label');
    p.removeAttribute('role');

    const wrapper = document.createElement('div');
    wrapper.className = 'text-layer-wrapper';

    const visualDiv = document.createElement('div');
    visualDiv.className = 'visual-text';
    visualDiv.setAttribute('aria-hidden', 'true');

    const fragment = document.createDocumentFragment();

    text.split(' ').forEach((wordText, index, arr) => {
      const wordSpan = document.createElement('span');
      wordSpan.className = 'word';

      wordText.split('').forEach((char) => {
        const charSpan = document.createElement('span');
        charSpan.textContent = char;
        charSpan.className = 'char';
        wordSpan.appendChild(charSpan);
        allChars.push(charSpan);
      });
      fragment.appendChild(wordSpan);

      if (index < arr.length - 1) {
        fragment.appendChild(document.createTextNode(' '));
      }
    });

    visualDiv.appendChild(fragment);

    if (p.parentNode) {
      p.parentNode.insertBefore(wrapper, p);
      wrapper.appendChild(p);
      wrapper.appendChild(visualDiv);
    }
  });
  return allChars;
}

const render = (units, progress) => {
  const activeCount = Math.floor(units.length * progress);
  if (activeCount === lastActiveCount) return;

  if (activeCount > lastActiveCount) {
    for (let i = lastActiveCount; i < activeCount; i += 1) {
      if (units[i]) units[i].classList.add('active');
    }
  } else {
    for (let i = lastActiveCount - 1; i >= activeCount; i -= 1) {
      if (units[i]) units[i].classList.remove('active');
    }
  }
  lastActiveCount = activeCount;
};

export default function init(el) {
  try {
    let ticking = false;
    let isVisible = false;
    el.classList.add('con-block');

    const paragraphs = Array.from(
      el.querySelectorAll(':scope > div > div > p'),
    );
    if (!el || paragraphs.length === 0) return;
    const allChars = prepareRevealSection(paragraphs);
    let layoutState = measureLayout(el, paragraphs);

    const tick = () => {
      const elRect = el.getBoundingClientRect();
      const progress = calculateProgress(
        elRect.top,
        layoutState,
        window.innerHeight,
      );
      render(allChars, progress);
    };

    const onScroll = () => {
      if (!ticking && isVisible) {
        window.requestAnimationFrame(() => {
          tick();
          ticking = false;
        });
        ticking = true;
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
          if (isVisible) tick();
        });
      },
      { threshold: 0 },
    );

    observer.observe(el);
    window.addEventListener('scroll', onScroll, { passive: true });

    const resizeObserver = new ResizeObserver(() => {
      layoutState = measureLayout(el, paragraphs);
      tick();
    });
    resizeObserver.observe(el);
    tick();
  } catch (err) {
    window.lana?.log(`Animation Init Error: ${err}`, LANA_OPTIONS);
  }
}
