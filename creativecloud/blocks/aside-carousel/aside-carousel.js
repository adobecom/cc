// One-time block for doodlebug.
// Combining Milo's aside (desktop) and carousel+editorial_card (mobile) and doodlebug.css theme

import { createTag, getLibs } from '../../scripts/utils.js';

const miloLibs = getLibs('/libs');
let decorateBlockText;
let applyHoverPlay;
let decorateTextOverrides;

const DEFAULT_TEXT_SIZES = ['xl', 's', 'm'];

const ARROW_SVG = `<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 21 21">
<path d="M19.2214 10.8918C19.3516 10.5773 19.3516 10.2226 19.2214 9.90808C19.1562 9.75098 19.0621 9.60895 18.9435 9.49041L12.9241 3.47092C12.4226 2.96819 11.6076 2.96819 11.1061 3.47092C10.604 3.97239 10.604 4.78743 11.1061 5.2889L14.9312 9.11399H2.4314C1.72109 9.11399 1.146 9.69036 1.146 10.4C1.146 11.1097 1.72109 11.6861 2.4314 11.6861H14.9312L11.1061 15.5112C10.604 16.0126 10.604 16.8277 11.1061 17.3291C11.3568 17.5805 11.6863 17.7062 12.0151 17.7062C12.3439 17.7062 12.6733 17.5805 12.9241 17.3291L18.9436 11.3097C19.0622 11.1911 19.1562 11.0491 19.2214 10.8918Z"/>
</svg>`;

function decorateSlide(slide) {
  slide.classList.add('slide');
  const textCell = slide.querySelector('h1, h2, h3, h4, h5, h6, p')?.closest('div');
  textCell?.classList.add('text'); // must run before mediaCell query to exclude this div
  const mediaCell = slide.querySelector(':scope > div:not([class])');

  if (mediaCell) {
    mediaCell.classList.add('image');
    const video = mediaCell.querySelector('video');
    if (video) applyHoverPlay(video);
  }

  if (textCell) {
    decorateBlockText(textCell, DEFAULT_TEXT_SIZES);
  }

  slide.querySelectorAll('a:not([class])').forEach((a) => a.classList.add('static'));
}

function getVisibleCount(track, slides) {
  const gap = Number.parseFloat(getComputedStyle(track).gap) || 16;
  const slideWidth = slides[0].offsetWidth;
  return Math.floor((track.parentElement.offsetWidth + gap) / (slideWidth + gap));
}

function setAriaState(slides, current, visibleCount) {
  slides.forEach((slide, i) => {
    const visible = i >= current && i < current + visibleCount;
    slide.setAttribute('aria-hidden', String(!visible));
    slide.querySelectorAll('a, button, [tabindex]').forEach((el) => {
      el.setAttribute('tabindex', visible ? '0' : '-1');
    });
  });
}

function goTo(track, slides, index) {
  const gap = Number.parseFloat(getComputedStyle(track).gap) || 16;
  track.style.transform = `translateX(-${index * (slides[0].offsetWidth + gap)}px)`;
}

function updateBtnStates(advance, retreat, current, total, visibleCount) {
  const retreatDisabled = current === 0;
  const advanceDisabled = current + visibleCount >= total;
  advance.disabled = advanceDisabled;
  advance.classList.toggle('disabled', advanceDisabled);
  retreat.disabled = retreatDisabled;
  retreat.classList.toggle('disabled', retreatDisabled);
}

function initControls(el, slides) {
  if (slides.length < 2) return;

  el.setAttribute('role', 'region');
  el.setAttribute('aria-roledescription', 'carousel');
  slides.forEach((slide, i) => {
    slide.setAttribute('role', 'group');
    slide.setAttribute('aria-roledescription', 'slide');
    slide.setAttribute('aria-label', `Slide ${i + 1} of ${slides.length}`);
  });

  const track = createTag('div', { class: 'slides-track' });
  el.prepend(track);
  track.append(...slides);

  const ariaLive = createTag('div', {
    class: 'sr-only',
    'aria-live': 'polite',
    'aria-atomic': 'true',
  });

  const prev = createTag('button', { class: 'carousel-prev', 'aria-label': 'Previous slide' }, ARROW_SVG);
  const next = createTag('button', { class: 'carousel-next', 'aria-label': 'Next slide' }, ARROW_SVG);
  const controls = createTag('div', { class: 'carousel-controls' });
  controls.append(prev, next);

  let current = 0;
  let visibleCount = getVisibleCount(track, slides);
  const [advance, retreat] = document.documentElement.dir === 'rtl' ? [prev, next] : [next, prev];

  function navigate(index) {
    current = index;
    visibleCount = getVisibleCount(track, slides);
    goTo(track, slides, current);
    updateBtnStates(advance, retreat, current, slides.length, visibleCount);
    setAriaState(slides, current, visibleCount);
    ariaLive.textContent = `Slide ${current + 1} of ${slides.length}`;
  }

  updateBtnStates(advance, retreat, current, slides.length, visibleCount);
  setAriaState(slides, current, visibleCount);

  advance.addEventListener('click', () => { if (!advance.disabled) navigate(current + 1); });
  retreat.addEventListener('click', () => { if (!retreat.disabled) navigate(current - 1); });

  el.addEventListener('keydown', (e) => {
    if (!controls.contains(e.target) && e.target !== el) return;
    if (e.key === 'ArrowLeft' && !prev.disabled) prev.click();
    else if (e.key === 'ArrowRight' && !next.disabled) next.click();
  });

  let xStart = 0;
  let yStart = 0;
  el.addEventListener('touchstart', (e) => {
    xStart = e.touches[0].screenX;
    yStart = e.touches[0].screenY;
  }, { passive: true });
  el.addEventListener('touchmove', (e) => {
    const xDiff = Math.abs(e.touches[0].screenX - xStart);
    const yDiff = Math.abs(e.touches[0].screenY - yStart);
    if (xDiff > yDiff && xDiff > 10) e.preventDefault();
  }, { passive: false });
  el.addEventListener('touchend', (e) => {
    const diff = xStart - e.changedTouches[0].screenX;
    if (Math.abs(diff) < 50) return;
    if (diff > 0 && current + visibleCount < slides.length) navigate(current + 1);
    else if (diff < 0 && current > 0) navigate(current - 1);
  });

  el.append(ariaLive, controls);

  new ResizeObserver(() => {
    if (window.matchMedia('(min-width: 1200px)').matches) {
      track.style.transform = '';
      current = 0;
      setAriaState(slides, 0, slides.length);
      updateBtnStates(advance, retreat, 0, slides.length, slides.length);
      return;
    }
    visibleCount = getVisibleCount(track, slides);
    current = Math.min(current, Math.max(0, slides.length - visibleCount));
    goTo(track, slides, current);
    updateBtnStates(advance, retreat, current, slides.length, visibleCount);
    setAriaState(slides, current, visibleCount);
  }).observe(el);
}

export default async function init(el) {
  ({ decorateBlockText, applyHoverPlay, decorateTextOverrides } = await import(`${miloLibs}/utils/decorate.js`));

  const slides = [...el.querySelectorAll(':scope > div')];
  slides.forEach((slide) => decorateSlide(slide));
  decorateTextOverrides(el);
  initControls(el, slides);
}
