import { createTag } from '../../scripts/utils.js';

const LANA_OPTIONS = { tags: 'animated-slot-text', errorType: 'i' };

function transformCard(card) {
  const cardEl = card.cloneNode(true);
  cardEl.setAttribute('tabindex', '0');

  cardEl.addEventListener('focus', () => cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' }));

  const title = cardEl.querySelector('h1');
  const stepTitle = cardEl.querySelector('h2');
  const picture = cardEl.querySelector('picture');

  if (title && stepTitle) {
    const headerGroup = createTag('div', { class: 'step-header-group' });
    if (picture) {
      const img = picture.querySelector('img');
      const parentP = picture.closest('p');
      if (parentP) {
        const text = parentP.textContent || '';
        const pipeIndex = text.indexOf('|');

        if (pipeIndex !== -1 && img) {
          const altText = text.substring(pipeIndex + 1).trim();
          img.alt = altText;
        }
        parentP.remove();
      }
      if (img) {
        picture.classList.add('step-icon');
      }
      headerGroup.appendChild(picture);
    }
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

function setupDragInteraction(track, progressTrack, progressBar, setDraggingState) {
  let isDragging = false;

  // Cache variables
  let trackRect = null;
  let thumbWidth = 0;
  let trackWidth = 0;
  let maxScroll = 0;

  let rafId = null;
  let currentClientX = 0;

  const getClientX = (e) => (e.touches ? e.touches[0].clientX : e.clientX);

  const updatePosition = () => {
    if (!trackRect) return;

    let relativeX = currentClientX - trackRect.left - (thumbWidth / 2);

    const availableSpace = trackWidth - thumbWidth;
    if (relativeX < 0) relativeX = 0;
    if (relativeX > availableSpace) relativeX = availableSpace;

    progressBar.style.transform = `translateX(${relativeX}px)`;
    const percentage = availableSpace > 0 ? relativeX / availableSpace : 0;
    track.scrollLeft = percentage * maxScroll;

    rafId = null;
  };

  const onDragStart = (e) => {
    isDragging = true;
    setDraggingState(true);
    trackRect = progressTrack.getBoundingClientRect();
    thumbWidth = progressBar.getBoundingClientRect().width;
    trackWidth = trackRect.width;
    maxScroll = track.scrollWidth - track.clientWidth;
    track.style.scrollBehavior = 'auto';
    track.style.scrollSnapType = 'none';
    progressBar.style.transition = 'none';
    currentClientX = getClientX(e);
    updatePosition();
  };

  const onDragMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();

    currentClientX = getClientX(e);

    if (!rafId) {
      rafId = requestAnimationFrame(updatePosition);
    }
  };

  const onDragEnd = () => {
    if (!isDragging) return;
    isDragging = false;
    setDraggingState(false);

    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }

    track.style.scrollBehavior = '';
    track.style.scrollSnapType = '';
    progressBar.style.transition = '';
    trackRect = null;
  };

  // Mouse Listeners
  progressTrack.addEventListener('mousedown', onDragStart);
  window.addEventListener('mousemove', onDragMove);
  window.addEventListener('mouseup', onDragEnd);

  // Touch Listeners
  progressTrack.addEventListener('touchstart', onDragStart, { passive: false });
  window.addEventListener('touchmove', onDragMove, { passive: false });
  window.addEventListener('touchend', onDragEnd);
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
  let isDragging = false;

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

    if (trackWidth > 0 && !isDragging) {
      controls.progressBar.style.width = `${thumbState.width}px`;
      controls.progressBar.style.transform = `translateX(${thumbState.x}px)`;
    } else if (trackWidth > 0 && isDragging) {
      controls.progressBar.style.width = `${thumbState.width}px`;
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

  setupDragInteraction(
    track,
    controls.progressTrack,
    controls.progressBar,
    (val) => { isDragging = val; },
  );

  track.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  window.requestAnimationFrame(updateUI);
}

export default function init(el) {
  try {
    el.classList.add('con-block');
    decorateContent(el);
  } catch (err) {
    window.lana?.log(`Step card Init Error: ${err}`, LANA_OPTIONS);
  }
}
