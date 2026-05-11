import { getLibs } from '../../scripts/utils.js';

const miloLibs = getLibs('/libs');
const { createTag } = await import(`${miloLibs}/utils/utils.js`);

const LANA_OPTIONS = { tags: 'showcase-marquee', errorType: 'i' };

const PLACEHOLDER_LABELS = ['pause-motion', 'play-motion', 'pause-icon', 'play-icon'];

let animationLabels = {
  playMotion: 'Play',
  pauseMotion: 'Pause',
  pauseIcon: 'Pause icon',
  playIcon: 'Play icon',
};

function logError(message, error) {
  window.lana?.log(`Animation slot text ${message}: ${error}`, LANA_OPTIONS);
}

export function createRollingLogos(logos) {
  const copies = Array.from({ length: 3 }, () => {
    const copy = createTag('div', { class: 'logos-duplicate' });
    logos.forEach((logo) => copy.append(logo.cloneNode(true)));
    return copy;
  });

  const tabletMQ = window.matchMedia('(min-width: 600px)');

  // Create a container to hold all duplicates and apply animation to it
  const logoContainer = createTag('div', { class: 'logo-container' }, copies);

  function handleResize(isTablet) {
    const gap = isTablet ? 80 : 30;
    logoContainer.style.setProperty('--scroll-distance', `-${copies[0].offsetWidth + gap}px`);
    logoContainer.style.setProperty('--logos-gap', `${gap}px`);
  }

  function addScrolling() {
    handleResize(tabletMQ.matches);
    tabletMQ.addEventListener('change', ({ matches }) => handleResize(matches));

    let lastScrollY = window.scrollY;
    let targetScrollOffset = 0;
    let currentScrollOffset = 0;
    let rafId = null;

    const updateScrollEffect = () => {
      const currentScrollY = window.scrollY;
      const scrollDelta = currentScrollY - lastScrollY;

      // Reverse the scroll offset multiplier for RTL
      const multiplier = document.dir ? -0.2 : 0.2;
      targetScrollOffset += scrollDelta * multiplier;

      const lerpFactor = 0.08;
      currentScrollOffset += (targetScrollOffset - currentScrollOffset) * lerpFactor;

      logoContainer.style.setProperty('--scroll-offset', `${currentScrollOffset}px`);
      lastScrollY = currentScrollY;
    };

    const animate = () => {
      updateScrollEffect();
      const difference = Math.abs(targetScrollOffset - currentScrollOffset);
      if (difference > 0.1) {
        rafId = requestAnimationFrame(animate);
      } else {
        rafId = null;
      }
    };

    const onScroll = () => {
      if (!rafId) {
        rafId = requestAnimationFrame(animate);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
  }

  return { addScrolling, logoContainer };
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

function initAnimationControls({ button, iconWrapper, logoContainer }) {
  let isPlaying = true;
  if (!button || !iconWrapper || !logoContainer) return;

  const updateControlState = (playing) => {
    isPlaying = playing;
    iconWrapper.classList.toggle('is-playing', playing);
    button.setAttribute('aria-label', playing ? animationLabels.pauseMotion : animationLabels.playMotion);
    button.setAttribute('title', playing ? animationLabels.pauseMotion : animationLabels.playMotion);
    button.setAttribute('aria-pressed', String(playing));
  };

  const pauseAnimation = () => {
    updateControlState(false);
    const { transform } = getComputedStyle(logoContainer);
    logoContainer.style.animation = 'none';
    logoContainer.style.transform = transform;
    logoContainer.classList.add('paused');
  };

  const playAnimation = () => {
    updateControlState(true);
    logoContainer.style.animation = '';
    logoContainer.style.transform = '';
    logoContainer.classList.remove('paused');
  };

  const toggleAnimation = () => (isPlaying ? pauseAnimation() : playAnimation());

  const handleKeydown = (event) => {
    if (event.code === 'Enter' || event.code === 'Space') {
      event.preventDefault();
      toggleAnimation();
    }
  };

  button.addEventListener('click', (event) => {
    event.preventDefault();
    toggleAnimation();
  });

  button.addEventListener('keydown', handleKeydown);
}

function createAnimationControls({ container, getFederatedContentRoot, logoContainer }) {
  const fedRoot = getFederatedContentRoot();
  if (!container || !fedRoot) return;
  const controlsWrapper = createTag('div', { class: 'animation-controls' });

  const button = createTag('button', {
    class: 'pause-play-wrapper',
    title: animationLabels.pauseMotion,
    'aria-label': animationLabels.pauseMotion,
    'aria-pressed': true,
  });

  const iconWrapper = createTag('div', { class: 'offset-filler is-playing' });

  const playIcon = createTag('img', {
    class: 'accessibility-control play-icon',
    alt: animationLabels.playIcon,
    src: `${fedRoot}/federal/assets/svgs/accessibility-play.svg`,
  });

  const pauseIcon = createTag('img', {
    class: 'accessibility-control pause-icon',
    alt: animationLabels.pauseIcon,
    src: `${fedRoot}/federal/assets/svgs/accessibility-pause.svg`,
  });

  iconWrapper.append(playIcon, pauseIcon);
  button.appendChild(iconWrapper);
  controlsWrapper.appendChild(button);

  container.appendChild(controlsWrapper);

  initAnimationControls({
    button,
    iconWrapper,
    logoContainer,
  });
}

export default async function init(el) {
  const { decorateBlockBg } = await import(`${miloLibs}/utils/decorate.js`);
  const { getFederatedContentRoot, getFedsPlaceholderConfig } = await import(`${miloLibs}/utils/utils.js`);
  const { replaceKeyArray } = await import(`${miloLibs}/features/placeholders.js`);
  animationLabels = await fetchAnimationLabels(
    getFedsPlaceholderConfig,
    replaceKeyArray,
  );
  const children = el.querySelectorAll(':scope > div');
  const foreground = children[children.length - 2];

  // Setup background if exists
  if (children.length > 1) {
    children[0].classList.add('background');
    decorateBlockBg(el, children[0], { useHandleFocalpoint: true });
  }
  foreground.classList.add('foreground', 'container');
  const headline = foreground.querySelector('h1, h2, h3, h4, h5, h6');
  const text = headline.closest('div');
  headline.classList.add('heading');
  headline.nextElementSibling?.classList.add('body');
  text.classList.add('text');
  text.classList.add('copy');

  const logoRowContent = children[children.length - 1];

  if (!logoRowContent) return;

  logoRowContent.classList.add('logo-row');
  const logos = logoRowContent.querySelectorAll('span.icon');
  logoRowContent.innerHTML = '';
  // TODO: cut down 1 level of DOM nesting
  const { logoContainer, addScrolling } = createRollingLogos(logos);
  createAnimationControls({ container: logoRowContent, getFederatedContentRoot, logoContainer });
  logoRowContent.append(logoContainer);
  new IntersectionObserver(([{ isIntersecting }], ob) => {
    if (!isIntersecting) return;
    ob.disconnect();
    if (!logoContainer.classList.contains('paused')) {
      addScrolling();
    }
  }).observe(el);
}
