import { getLibs } from '../../scripts/utils.js';

const miloLibs = getLibs('/libs');
const { createTag } = await import(`${miloLibs}/utils/utils.js`);

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

      const multiplier = 0.2;
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

export default function init(el) {
  const logos = el.querySelectorAll('span.icon');
  const { logoContainer, addScrolling } = createRollingLogos(logos);
  el.innerHTML = '';
  el.append(logoContainer);
  new IntersectionObserver(([{ isIntersecting }], ob) => {
    if (!isIntersecting) return;
    ob.disconnect();
    addScrolling();
  }).observe(el);
}
