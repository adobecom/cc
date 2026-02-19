import { createTag } from '../../scripts/utils.js';

const BLOCK = 'firefly-carousel';
const GAP = 8;
const LANA_OPTIONS = { tags: BLOCK, errorType: 'i' };
const CGEN_ID = '3NQZB4NT';
const CDN_BASE = 'https://cdn.cp.adobe.io/content/2/dcx';
const FIREFLY_BASE = 'https://firefly.adobe.com/open';

const SEL_REAL_CARD = `.${BLOCK}-card:not(.is-clone)`;

const ICONS = {
  prompt: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
<path d="M14.4001 12.6001V3.4001C14.4001 2.40752 13.5927 1.6001 12.6001 1.6001H3.4001C2.40752 1.6001 1.6001 2.40752 1.6001 3.4001V6.37431C1.6001 6.70556 1.86885 6.97431 2.2001 6.97431C2.53135 6.97431 2.8001 6.70556 2.8001 6.37431V3.4001C2.8001 3.06924 3.06924 2.8001 3.4001 2.8001H12.6001C12.931 2.8001 13.2001 3.06924 13.2001 3.4001V12.6001C13.2001 12.931 12.931 13.2001 12.6001 13.2001H9.55127C9.22002 13.2001 8.95127 13.4689 8.95127 13.8001C8.95127 14.1313 9.22002 14.4001 9.55127 14.4001H12.6001C13.5927 14.4001 14.4001 13.5927 14.4001 12.6001Z" fill="#292929"/>
<path d="M8.7999 7.79995V11.1941C8.7999 11.5253 8.53115 11.7941 8.1999 11.7941C7.86865 11.7941 7.5999 11.5253 7.5999 11.1941V9.24839L2.42412 14.4242C2.30693 14.5414 2.15341 14.6 1.9999 14.6C1.84639 14.6 1.69287 14.5414 1.57568 14.4242C1.34131 14.1898 1.34131 13.8101 1.57568 13.5757L6.75147 8.39995H4.80576C4.47452 8.39995 4.20576 8.1312 4.20576 7.79995C4.20576 7.4687 4.47452 7.19995 4.80576 7.19995H8.19991C8.53116 7.19995 8.7999 7.4687 8.7999 7.79995Z" fill="#292929"/>
</svg>`,
  pause: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
<path d="M20 1C30.4934 1 39 9.50659 39 20C39 30.4934 30.4934 39 20 39C9.50659 39 1 30.4934 1 20C1 9.50659 9.50659 1 20 1Z" fill="#242424" stroke="white" stroke-width="2"/>
<path d="M18.855 11.5352H13.516V28.6192H18.855V11.5352Z" fill="white"/>
<path d="M26.329 11.5352H20.99V28.6192H26.329V11.5352Z" fill="white"/>
</svg>`,
  play: `<svg viewBox="0 0 16 16" focusable="false" aria-hidden="true">
<path d="M5 3.5l7 4.5-7 4.5V3.5z" />
</svg>`,
  navPrev: `<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 11 11" fill="none">
<path fill-rule="evenodd" clip-rule="evenodd" d="M10.8962 5.43899C10.8959 5.04764 10.5786 4.73011 10.1872 4.73L2.43621 4.73L4.95379 2.21243C5.23038 1.93558 5.23035 1.48734 4.95379 1.21047C4.67688 0.933565 4.22778 0.933585 3.95086 1.21047L0.223322 4.93801C-0.0535953 5.21493 -0.0535948 5.66402 0.223323 5.94094L3.95087 9.66946C4.22773 9.94612 4.67692 9.94611 4.9538 9.66946C5.23062 9.3926 5.23052 8.94345 4.95379 8.66653L2.43524 6.14797L10.1872 6.14797C10.5787 6.14787 10.8962 5.83054 10.8962 5.43899Z" fill="white"/>
</svg>`,
  navNext: `<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 11 11" fill="none">
<path d="M0.0149484 5.43996C0.0151864 5.04861 0.332549 4.73109 0.723932 4.73098L8.47491 4.73098L5.95733 2.2134C5.68073 1.93656 5.68076 1.48831 5.95733 1.21145C6.23423 0.934542 6.68334 0.934562 6.96026 1.21145L10.6878 4.93899C10.9647 5.21591 10.9647 5.665 10.6878 5.94192L6.96027 9.67043C6.6834 9.9471 6.23421 9.94709 5.95734 9.67043C5.68051 9.39358 5.68061 8.94443 5.95733 8.6675L8.47589 6.14895L0.723934 6.14895C0.332403 6.14884 0.0149488 5.83152 0.0149484 5.43996Z" fill="white"/>
</svg>`,
};

/** Returns the ARIA label and SVG icon for the given playback state. */
function getPlaybackAttrs(isPlaying) {
  return {
    label: isPlaying ? 'Pause all videos' : 'Play all videos',
    icon: isPlaying ? ICONS.pause : ICONS.play,
  };
}

/** Normalizes various API response shapes into a flat array of items. */
function normalizeItems(response) {
  let rawItems = [];
  if (Array.isArray(response)) rawItems = response;
  else if (Array.isArray(response?.data)) rawItems = response.data;

  return rawItems.map((item) => ({
    id: item.ID || '',
    promptText: item.title || '',
    urn: item.urn || '',
    posterUrl: item.image_url || '',
  }));
}

/** Fetches and normalizes carousel items from a JSON endpoint. */
async function fetchCarouselItems(jsonUrl) {
  try {
    const resp = await fetch(jsonUrl);
    if (!resp.ok) throw new Error(`Failed to fetch JSON: ${resp.status}`);
    const payload = await resp.json();
    return normalizeItems(payload);
  } catch (err) {
    window.lana?.log(`Unable to fetch firefly carousel data: ${err}`, LANA_OPTIONS);
    return [];
  }
}

function buildVideoUrl(assetId) {
  if (!assetId) return '';
  return `${CDN_BASE}/${assetId}/content/manifest/version/0/component/path/output/resource`;
}

function buildFireflyUrl(urn, cgenId = CGEN_ID) {
  if (!urn) return '';
  const base = `${FIREFLY_BASE}?assetOrigin=community&assetType=VideoGeneration&id=${urn}`;
  return cgenId ? `${base}&promoid=${cgenId}&mv=other` : base;
}

function createPromptPill(promptText, promptLink) {
  const attrs = {
    class: `${BLOCK}-prompt`,
    title: promptText || '',
    'aria-label': promptText || 'Open in Firefly',
  };
  if (promptLink) {
    attrs.href = promptLink;
    attrs.target = '_blank';
    attrs.rel = 'noopener nofollow';
  }
  const pill = createTag(promptLink ? 'a' : 'div', attrs);

  const text = createTag('span', { class: `${BLOCK}-prompt-text` }, promptText || '');
  const icon = createTag('span', { class: `${BLOCK}-prompt-icon`, 'aria-hidden': 'true' });
  icon.innerHTML = ICONS.prompt;

  pill.append(text, icon);
  return pill;
}

function createPlaybackButton(isPlaying) {
  const { label, icon } = getPlaybackAttrs(isPlaying);
  const button = createTag('button', {
    class: `${BLOCK}-playback`,
    type: 'button',
    'aria-label': label,
    'aria-pressed': String(isPlaying),
  });
  button.innerHTML = icon;
  return button;
}

function createCard(item, isPlaying) {
  const card = createTag('article', { class: `${BLOCK}-card` });

  const video = createTag('video', {
    class: `${BLOCK}-video`,
    src: buildVideoUrl(item.id),
    poster: item.posterUrl || '',
    muted: '',
    loop: '',
    playsinline: '',
    autoplay: '',
    preload: 'metadata',
    'aria-label': item.promptText || 'Firefly generated video',
  });

  if (!item.id) video.removeAttribute('autoplay');

  const playbackButton = createPlaybackButton(isPlaying);
  const prompt = createPromptPill(item.promptText || '', buildFireflyUrl(item.urn));

  card.append(video, prompt, playbackButton);
  return { card, video, playbackButton };
}

function createNavButton(direction, onClick) {
  const isPrev = direction === 'prev';
  const button = createTag('button', {
    class: `${BLOCK}-nav-btn ${isPrev ? 'prev' : 'next'}`,
    type: 'button',
    'aria-label': isPrev ? 'Previous slide' : 'Next slide',
  });
  button.innerHTML = isPrev ? ICONS.navPrev : ICONS.navNext;
  button.addEventListener('click', onClick);
  return button;
}

/**
 * Populates the track with carousel cards, adding leading/trailing
 * clones when there are multiple items for visual edge padding.
 */
function buildTrack(track, items, isPlaying) {
  const videos = [];
  const playbackButtons = [];
  const hasClones = items.length > 1;

  if (hasClones) track.style.setProperty('--ff-clone-count', '1');

  const appendCard = (item, isClone = false) => {
    const { card, video, playbackButton } = createCard(item, isPlaying);
    if (isClone) card.classList.add('is-clone');
    track.appendChild(card);
    videos.push(video);
    playbackButtons.push(playbackButton);
  };

  if (hasClones) appendCard(items[items.length - 1], true);
  items.forEach((item) => appendCard(item));
  if (hasClones) appendCard(items[0], true);

  return { videos, playbackButtons };
}

/** Updates every playback button's icon and ARIA attributes to reflect the current state. */
function syncPlaybackUI(playbackButtons, isPlaying) {
  const { label, icon } = getPlaybackAttrs(isPlaying);
  playbackButtons.forEach((button) => {
    button.setAttribute('aria-label', label);
    button.setAttribute('aria-pressed', String(isPlaying));
    button.innerHTML = icon;
  });
}

/** Plays or pauses every video element in the carousel. */
async function setAllVideosState(videos, shouldPlay) {
  await Promise.allSettled(
    videos.map(async (video) => {
      if (!video.src) return;
      if (shouldPlay) {
        video.muted = true;
        try {
          await video.play();
        } catch (err) {
          window.lana?.log(`Autoplay blocked in firefly carousel: ${err}`, LANA_OPTIONS);
        }
      } else {
        video.pause();
      }
    }),
  );
}

/**
 * Returns the pixel offset for the current slide relative to the
 */
function computeTrackOffset(track, currentIndex) {
  const firstCard = track.querySelector(SEL_REAL_CARD);
  const cardWidth = firstCard?.getBoundingClientRect().width;
  if (!cardWidth) return null;
  return -(currentIndex * (cardWidth + GAP));
}

/**
 * Creates prev/next navigation buttons, appends them to the provided
 * container, and returns a reposition callback for resize handling.
 */
function createNavControls(track, navContainer, itemCount, state) {
  let prevButton;
  let nextButton;

  const reposition = () => {
    const offset = computeTrackOffset(track, state.currentIndex);
    if (offset !== null) {
      track.style.transform = `translate3d(${offset}px, 0, 0)`;
    }

    const realCards = track.querySelectorAll(SEL_REAL_CARD);
    realCards.forEach((card, i) => card.classList.toggle('active', i === state.currentIndex));

    prevButton.disabled = state.currentIndex === 0;
    nextButton.disabled = state.currentIndex === itemCount - 1;
  };

  prevButton = createNavButton('prev', () => {
    if (state.currentIndex === 0) return;
    state.currentIndex -= 1;
    reposition();
  });

  nextButton = createNavButton('next', () => {
    if (state.currentIndex === itemCount - 1) return;
    state.currentIndex += 1;
    reposition();
  });

  navContainer.append(prevButton, nextButton);
  reposition();
  return reposition;
}

/** Extracts the JSON data URL authored inside the block element. */
function extractJsonUrl(el) {
  return el.querySelector('a')?.href;
}

/** Creates the top-level structural containers for the carousel. */
function createCarouselStructure() {
  const viewport = createTag('div', { class: `${BLOCK}-viewport` });
  const track = createTag('div', { class: `${BLOCK}-track` });
  viewport.appendChild(track);
  return { viewport, track };
}

/** Wires click handlers on non-clone playback buttons to toggle play/pause. */
function bindPlaybackControls(playbackButtons, videos, state) {
  playbackButtons.forEach((button) => {
    if (button.closest('.is-clone')) return;
    button.addEventListener('click', async (e) => {
      e.preventDefault();
      state.isPlaying = !state.isPlaying;
      syncPlaybackUI(playbackButtons, state.isPlaying);
      await setAllVideosState(videos, state.isPlaying);
    });
  });
}

/**
 * Keeps the track position up-to-date when the viewport or card
 * dimensions change (e.g. window resize, orientation change).
 */
function observeResize(viewport, updateCarousel) {
  const observer = new ResizeObserver(() => updateCarousel());
  observer.observe(viewport);
}

export default async function init(el) {
  const jsonUrl = extractJsonUrl(el);
  if (!jsonUrl) return;

  const items = await fetchCarouselItems(jsonUrl);
  if (!items.length) return;

  el.textContent = '';

  const state = { currentIndex: 0, isPlaying: true };
  const structure = createCarouselStructure();
  const { videos, playbackButtons } = buildTrack(structure.track, items, state.isPlaying);
  const reposition = createNavControls(
    structure.track,
    structure.viewport,
    items.length,
    state,
  );

  bindPlaybackControls(playbackButtons, videos, state);
  el.append(structure.viewport);
  observeResize(structure.viewport, reposition);
  await setAllVideosState(videos, state.isPlaying);
}
