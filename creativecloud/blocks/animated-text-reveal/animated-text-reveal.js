const HEADER_HEIGHT = 64; // Define your sticky header height here

// ensures that the value is within range
const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

// Reads the DOM to create layout config
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

  let startTargetTop, endTargetTop;

  if (layoutConfig.isHeroMode) {
    startTargetTop = layoutConfig.heroStart;
    endTargetTop = layoutConfig.heroEnd;
  } else {
    startTargetTop = windowHeight * 0.85;

    // 2. Determine "Travel Distance"
    // For long text, we want the animation to take the full length of the text.
    // For short text, we want it to take at least half the screen so it's not too fast.
    const travelDistance = Math.max(
      windowHeight * 0.5,
      layoutConfig.textHeight
    );

    // 3. Set End Point
    // This calculates a dynamic end point.
    // However, we MUST ensure the end point is at least below the header.
    // The math below ensures it finishes exactly after 'travelDistance' of scrolling.
    endTargetTop = startTargetTop - travelDistance;

    // 4. Header Safety Clamp
    // If the dynamic end point is too high (above the header), clamp it.
    // But generally, the 'windowHeight * 0.5' minimum ensures we have plenty of space.
    // We double check to ensure readability.
    const safetyZone = HEADER_HEIGHT + windowHeight * 0.2;
    if (endTargetTop < safetyZone && layoutConfig.textHeight < windowHeight) {
      // If text fits on screen but math put exit too high, pull it down to safety.
      endTargetTop = safetyZone;
    }
  }

  const totalTravel = startTargetTop - endTargetTop;
  const currentMoved = startTargetTop - currentFirstLineTop;

  return clamp(currentMoved / totalTravel, 0, 1);
}

function prepareRevealSection(paragraphs) {
  return paragraphs.flatMap((p) => {
    const text = p.innerText;
    p.setAttribute('aria-label', text);
    p.innerText = '';
    return text.split(' ').map((wordText) => {
      const span = document.createElement('span');
      span.textContent = wordText;
      span.className = 'word';
      span.setAttribute('aria-hidden', 'true');
      p.appendChild(span);
      return span;
    });
  });
}

const render = (words, progress) => {
  const activeCount = Math.floor(words.length * progress);

  // Using a loop for performance in hot path, wrapped in function
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const shouldBeActive = i < activeCount;
    const isActive = word.classList.contains('active');

    if (shouldBeActive && !isActive) {
      word.classList.add('active');
    } else if (!shouldBeActive && isActive) {
      word.classList.remove('active');
    }
  }
};

export default function init(el) {
  try {
    let ticking = false;
    let isVisible = false;
    el.classList.add('con-block');
    const paragraphs = Array.from(
      el.querySelectorAll(':scope > div > div > p')
    );

    if (!el || paragraphs.length === 0) return;

    const allWords = prepareRevealSection(paragraphs);
    let layoutState = measureLayout(el, paragraphs);

    const tick = () => {
      const elRect = el.getBoundingClientRect();
      const progress = calculateProgress(
        elRect.top,
        layoutState,
        window.innerHeight
      );
      render(allWords, progress);
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
      { threshold: 0 }
    );

    observer.observe(el);

    window.addEventListener('scroll', onScroll, { passive: true });

    const resizeObserver = new ResizeObserver(() => {
      layoutState = measureLayout(el, paragraphs);
      tick();
    });
    resizeObserver.observe(el);

    // Initial measurement
    layoutState = measureLayout(el, paragraphs);
    tick();
  } catch (err) {
    console.error('Animation Init Error:', err);
  }
}
