import { createTag } from '../../scripts/utils.js';

const BLOCK = 'firefly-carousel';
const GAP = 8;
const TRANSITION_FALLBACK_MS = 420;
const NAV_DIRECTIONS = {
  PREV: 'prev',
  NEXT: 'next',
};
const NAV_INDEX_DELTAS = {
  [NAV_DIRECTIONS.PREV]: -1,
  [NAV_DIRECTIONS.NEXT]: 1,
};
const NAV_FRAMES = {
  BASE: { beforeActive: 1, offsetMultiplier: -1 },
  NEXT: { beforeActive: 1, offsetMultiplier: -2 },
  PREV_STAGE: { beforeActive: 2, offsetMultiplier: -2 },
  PREV: { beforeActive: 2, offsetMultiplier: -1 },
};
const NAV_SEQUENCES = {
  [NAV_DIRECTIONS.NEXT]: [
    { frame: NAV_FRAMES.NEXT, animate: true },
  ],
  [NAV_DIRECTIONS.PREV]: [
    { frame: NAV_FRAMES.PREV_STAGE, animate: false },
    { frame: NAV_FRAMES.PREV, animate: true },
  ],
};

const ICONS = {
  prompt: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
<path d="M14.4001 12.6001V3.4001C14.4001 2.40752 13.5927 1.6001 12.6001 1.6001H3.4001C2.40752 1.6001 1.6001 2.40752 1.6001 3.4001V6.37431C1.6001 6.70556 1.86885 6.97431 2.2001 6.97431C2.53135 6.97431 2.8001 6.70556 2.8001 6.37431V3.4001C2.8001 3.06924 3.06924 2.8001 3.4001 2.8001H12.6001C12.931 2.8001 13.2001 3.06924 13.2001 3.4001V12.6001C13.2001 12.931 12.931 13.2001 12.6001 13.2001H9.55127C9.22002 13.2001 8.95127 13.4689 8.95127 13.8001C8.95127 14.1313 9.22002 14.4001 9.55127 14.4001H12.6001C13.5927 14.4001 14.4001 13.5927 14.4001 12.6001Z" fill="#292929"/>
<path d="M8.7999 7.79995V11.1941C8.7999 11.5253 8.53115 11.7941 8.1999 11.7941C7.86865 11.7941 7.5999 11.5253 7.5999 11.1941V9.24839L2.42412 14.4242C2.30693 14.5414 2.15341 14.6 1.9999 14.6C1.84639 14.6 1.69287 14.5414 1.57568 14.4242C1.34131 14.1898 1.34131 13.8101 1.57568 13.5757L6.75147 8.39995H4.80576C4.47452 8.39995 4.20576 8.1312 4.20576 7.79995C4.20576 7.4687 4.47452 7.19995 4.80576 7.19995H8.19991C8.53116 7.19995 8.7999 7.4687 8.7999 7.79995Z" fill="#292929"/>
</svg>`,
  navPrev: `<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 11 11" fill="none">
<path fill-rule="evenodd" clip-rule="evenodd" d="M10.8962 5.43899C10.8959 5.04764 10.5786 4.73011 10.1872 4.73L2.43621 4.73L4.95379 2.21243C5.23038 1.93558 5.23035 1.48734 4.95379 1.21047C4.67688 0.933565 4.22778 0.933585 3.95086 1.21047L0.223322 4.93801C-0.0535953 5.21493 -0.0535948 5.66402 0.223323 5.94094L3.95087 9.66946C4.22773 9.94612 4.67692 9.94611 4.9538 9.66946C5.23062 9.3926 5.23052 8.94345 4.95379 8.66653L2.43524 6.14797L10.1872 6.14797C10.5787 6.14787 10.8962 5.83054 10.8962 5.43899Z" fill="white"/>
</svg>`,
  navNext: `<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 11 11" fill="none">
<path d="M0.0149484 5.43996C0.0151864 5.04861 0.332549 4.73109 0.723932 4.73098L8.47491 4.73098L5.95733 2.2134C5.68073 1.93656 5.68076 1.48831 5.95733 1.21145C6.23423 0.934542 6.68334 0.934562 6.96026 1.21145L10.6878 4.93899C10.9647 5.21591 10.9647 5.665 10.6878 5.94192L6.96027 9.67043C6.6834 9.9471 6.23421 9.94709 5.95734 9.67043C5.68051 9.39358 5.68061 8.94443 5.95733 8.6675L8.47589 6.14895L0.723934 6.14895C0.332403 6.14884 0.0149488 5.83152 0.0149484 5.43996Z" fill="white"/>
</svg>`,
};

// Parses carousel items directly from the block DOM. Each item has picture, caption, and deeplink
function parseItemsFromDOM(el) {
  const itemDivs = el.querySelectorAll(':scope > div');
  const items = [];

  itemDivs.forEach((itemDiv) => {
    const [mediaDiv, captionDiv, deeplinkDiv] = itemDiv.children;
    const pictureEl = mediaDiv?.querySelector('picture');
    const deeplinkAnchor = deeplinkDiv?.querySelector('a[href*="firefly.adobe.com"]');
    if (!pictureEl) return;

    items.push({
      pictureEl,
      promptText: captionDiv?.textContent?.trim() || '',
      deeplinkUrl: deeplinkAnchor?.href || '',
    });
  });

  return items;
}

function wrapIndex(index, length) {
  return (index + length) % length;
}

function createPromptPill(promptText, deeplinkUrl) {
  const attrs = {
    class: `${BLOCK}-prompt`,
    title: promptText || '',
    'aria-label': promptText || 'Open in Firefly',
  };
  if (deeplinkUrl) {
    attrs.href = deeplinkUrl;
    attrs.target = '_blank';
    attrs.rel = 'noopener nofollow';
  }
  const pill = createTag(deeplinkUrl ? 'a' : 'div', attrs);

  const text = createTag('span', { class: `${BLOCK}-prompt-text` }, promptText || '');
  const icon = createTag('span', { class: `${BLOCK}-prompt-icon`, 'aria-hidden': 'true' });
  icon.innerHTML = ICONS.prompt;

  pill.append(text, icon);
  return pill;
}

function createCard(item, index) {
  const card = createTag('article', { class: `${BLOCK}-card` });
  card.dataset.slideIndex = String(index);
  const mediaWrapper = createTag('div', { class: `${BLOCK}-media` });
  const clonedPicture = item.pictureEl.cloneNode(true);
  const img = clonedPicture.querySelector('img');
  if (img) img.setAttribute('loading', 'eager');
  mediaWrapper.appendChild(clonedPicture);
  card.append(mediaWrapper, createPromptPill(item.promptText || '', item.deeplinkUrl));
  return card;
}

function createNavButton(direction, onClick) {
  const isPrev = direction === NAV_DIRECTIONS.PREV;
  const button = createTag('button', {
    class: `${BLOCK}-nav-btn ${isPrev ? 'prev' : 'next'}`,
    type: 'button',
    'aria-label': isPrev ? 'Previous slide' : 'Next slide',
  });
  button.innerHTML = isPrev ? ICONS.navPrev : ICONS.navNext;
  button.addEventListener('click', onClick);
  return button;
}

/** Populates the track with only authored carousel cards. */
function buildTrack(track, items) {
  const cards = items.map((item, index) => createCard(item, index));
  track.append(...cards);
  return cards;
}

function getTrackStep(cards) {
  const firstCard = cards[0];
  const cardWidth = firstCard?.getBoundingClientRect().width;
  if (!cardWidth) return null;
  return cardWidth + GAP;
}

function updateActiveCard(cards, currentIndex) {
  cards.forEach((card) => {
    card.classList.toggle('active', Number(card.dataset.slideIndex) === currentIndex);
  });
}

function setCircularOrder(cards, currentIndex, itemCount, beforeActive) {
  const startIndex = wrapIndex(currentIndex - beforeActive, itemCount);
  for (let pos = 0; pos < itemCount; pos += 1) {
    const realIndex = wrapIndex(startIndex + pos, itemCount);
    cards[realIndex].style.order = String(pos + 1);
  }
}

function applyNavFrame(track, cards, state, itemCount, frame, animate = false) {
  const step = getTrackStep(cards);
  if (step === null) return;
  setCircularOrder(cards, state.currentIndex, itemCount, frame.beforeActive);
  updateActiveCard(cards, state.currentIndex);
  track.style.transition = animate ? '' : 'none';
  track.style.transform = `translate3d(${frame.offsetMultiplier * step}px, 0, 0)`;
  if (!animate) {
    track.getBoundingClientRect();
    track.style.transition = '';
  }
}

function waitForTrackTransition(track, onDone) {
  let settled = false;
  const settle = () => {
    if (settled) return;
    settled = true;
    clearTimeout(fallbackTimer);
    onDone();
  };
  const fallbackTimer = setTimeout(settle, TRANSITION_FALLBACK_MS);
  track.addEventListener('transitionend', settle, { once: true });
}

function updateCurrentIndex(state, itemCount, direction) {
  state.currentIndex = wrapIndex(
    state.currentIndex + NAV_INDEX_DELTAS[direction],
    itemCount,
  );
}

function createMoveHandler(track, itemCount, state, applyFrame) {
  return (direction) => {
    if (itemCount <= 1 || state.isAnimating) return;
    state.isAnimating = true;
    NAV_SEQUENCES[direction].forEach(({ frame, animate }) => applyFrame(frame, animate));
    waitForTrackTransition(track, () => {
      updateCurrentIndex(state, itemCount, direction);
      applyFrame(NAV_FRAMES.BASE, false);
      state.isAnimating = false;
    });
  };
}

/** Creates circular prev/next navigation controls. */
function createNavControls(track, navContainer, itemCount, state, cards) {
  const applyFrame = (frame, animate = false) => applyNavFrame(
    track,
    cards,
    state,
    itemCount,
    frame,
    animate,
  );
  const move = createMoveHandler(track, itemCount, state, applyFrame);

  const prevButton = createNavButton(NAV_DIRECTIONS.PREV, () => move(NAV_DIRECTIONS.PREV));
  const nextButton = createNavButton(NAV_DIRECTIONS.NEXT, () => move(NAV_DIRECTIONS.NEXT));
  navContainer.append(prevButton, nextButton);
  applyFrame(NAV_FRAMES.BASE, false);
  return () => applyFrame(NAV_FRAMES.BASE, false);
}

/** Creates the top-level structural containers for the carousel. */
function createCarouselStructure() {
  const viewport = createTag('div', { class: `${BLOCK}-viewport` });
  const track = createTag('div', { class: `${BLOCK}-track` });
  viewport.appendChild(track);
  return { viewport, track };
}

// Keeps the track position up-to-date when the viewport
function observeResize(viewport, updateCarousel) {
  const observer = new ResizeObserver(() => updateCarousel());
  observer.observe(viewport);
}

export default async function init(el) {
  const items = parseItemsFromDOM(el);
  if (!items.length) return;

  el.textContent = '';

  const state = { currentIndex: 0, isAnimating: false };
  const structure = createCarouselStructure();
  const cards = buildTrack(structure.track, items);
  const reposition = createNavControls(
    structure.track,
    structure.viewport,
    items.length,
    state,
    cards,
  );

  el.append(structure.viewport);
  observeResize(structure.viewport, reposition);
}
