import { createTag } from '../../scripts/utils.js';

const LANA_OPTIONS = { tags: 'animated-slot-text', errorType: 'i' };

function transformCard(card) {
  const cardEl = card.cloneNode(true);
  cardEl.setAttribute('tabindex', '0');

  cardEl.addEventListener('focus', () => cardEl.scrollIntoView({ behaviour: 'smooth', block: 'nearest', inline: 'center' }));

  const title = cardEl.querySelector('h1');
  const stepTitle = cardEl.querySelector('h2');

  if (title && stepTitle) {
    const headerGroup = createTag('div', { class: 'step-header-group' });
    title.parentNode.insertBefore(headerGroup, title);
    headerGroup.appendChild(title);
  }
  return cardEl;
}

function createControlsComponent(onPrev, onNext) {
  const container = createTag('div', { class: 'carousel-controls' });
  const progressTrack = createTag('div', { class: 'progress-track' });
  const progressBar = createTag('div', { id: 'progressBar', class: 'progress-indicator' });
  progressTrack.appendChild(progressBar);

  const navButtons = createTag('div', { class: 'nav-buttons' });

  const prevBtn = createTag('button', { id: 'prev', class: 'nav-btn', 'aria-label': 'Previous Step' });
  prevBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>';
  prevBtn.addEventListener('click', onPrev);

  const nextBtn = createTag('button', { id: 'next', class: 'nav-btn', 'aria-label': 'Next Step' });
  nextBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>';
  nextBtn.addEventListener('click', onNext);

  navButtons.appendChild(prevBtn);
  navButtons.appendChild(nextBtn);

  container.appendChild(progressTrack);
  container.appendChild(navButtons);

  return { container, progressTrack, progressBar, prevBtn, nextBtn };
}

function calculateThumbState({ scrollLeft, scrollWidth, clientWidth }, trackWidth) {
  if (!trackWidth) return { width: 0, x: 0 };
  const maxScroll = scrollWidth - clientWidth;

  const thumbRatio = Math.max(0.1, Math.min(1, clientWidth / scrollWidth));
  const thumbWidth = trackWidth * thumbRatio;

  const scrollPercent = maxScroll > 0 ? scrollLeft / maxScroll : 0;
  const availableSpace = trackWidth - thumbWidth;
  const thumbLeft = availableSpace * scrollPercent;

  return { width: thumbWidth, x: thumbLeft };
}

function calculateButtonState({ scrollLeft, scrollWidth, clientWidth }) {
  const maxScroll = scrollWidth - clientWidth;
  return {
    prevDisabled: scrollLeft <= 2,
    nextDisabled: scrollLeft >= maxScroll - 2,
  };
}

function decorateContent(el) {
  const dataCards = Array.from(el.children);
  const transformedCards = dataCards.map((card) => transformCard(card));
  const track = createTag('div', { class: 'step-card-track' });
  transformedCards.forEach((card) => track.appendChild(card));

  const scrollByCard = (direction) => {
    const computedStyle = window.getComputedStyle(track);
    const gap = parseFloat(computedStyle.gap) || 24;
    const cardWidth = (transformedCards[0]?.offsetWidth || 300) + gap;
    track.scrollBy({ left: direction * cardWidth, behavior: 'smooth' });
  };

  const controls = createControlsComponent(() => scrollByCard(-1), () => scrollByCard(1));
  const foreground = createTag('div', { class: 'foreground' });
  foreground.appendChild(track);
  foreground.appendChild(controls.container);
  el.innerHTML = '';
  el.appendChild(foreground);

  let ticking = false;

  const updateUI = () => {
    const metrics = {
      scrollLeft: track.scrollLeft,
      scrollWidth: track.scrollWidth,
      clientWidth: track.clientWidth,
    };

    const trackWidth = controls.progressTrack.offsetParent
      ? controls.progressTrack.getBoundingClientRect().width
      : 0;

    const thumbState = calculateThumbState(metrics, trackWidth);
    const btnState = calculateButtonState(metrics);

    if (trackWidth > 0) {
      controls.progressBar.style.width = `${thumbState.width}px`;
      controls.progressBar.style.transform = `translate(${thumbState.x}px)`;
    }
    controls.prevBtn.disabled = btnState.prevDisabled;
    controls.nextBtn.disabled = btnState.nextDisabled;
    ticking = false;
  };

  const onScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(updateUI);
      ticking = true;
    }
  };

  track.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  window.requestAnimationFrame(updateUI);
}

export default function init(el) {
  try {
    el.classList.add('con-block');
    decorateContent(el);
  } catch (err) {
    console.error(err);
    window.lana?.log(`Step card Init Error: ${err}`, LANA_OPTIONS);
  }
}
