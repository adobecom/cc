import { createTag, getScreenSizeCategory } from '../../scripts/utils.js';

const CONFIG = {
  CARD_LIMIT: { desktop: 15, tablet: 9, mobile: 10 },
  API: {
    PRODUCT: 'creativecloud',
    BASE_URL: '/stock-api/Rest/Media/1/Search/Collections',
  },
  VIEWPORT: { mobile: 599, tablet: 1199 },
  EAGER_LOAD_COUNT: 6,
};

// Default block properties
const DEFAULT_PROPS = {
  collectionId: null,
  buttonText: 'Edit this template',
  freeTagText: null,
};

// CSS Class Names
const CLASSES = {
  CARD: 'pre-yt-card',
  CARD_INNER: 'pre-yt-card-inner',
  IMAGE_WRAPPER: 'image-wrapper',
  VIDEO_WRAPPER: 'video-wrapper',
  BUTTON: 'pre-yt-button',
  INFO_BUTTON: 'pre-yt-info-button',
  CLOSE_CARD_BUTTON: 'pre-yt-close-card-button',
  OVERLAY_CLOSE: 'pre-yt-overlay-close',
  INFO_OVERLAY: 'pre-yt-info-overlay',
  OVERLAY_TEXT: 'pre-yt-overlay-text',
  FREE_TAG: 'pre-yt-free-tag',
  GRID: 'pre-yt-grid',
  SHIMMER: 'shimmer',
  EXPANDED: 'expanded',
  INFO_VISIBLE: 'info-visible',
};

// SVG Icons
const ICONS = {
  close: `
    <svg width="32" height="22" viewBox="0 0 32 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="31" height="22" rx="11" fill="white"/>
      <path d="M16.2883 10.7253L19.2951 7.71885C19.4643 7.54966 19.4643 7.27557 19.2951 7.10638C19.1259 6.93719 18.8518 6.93719 18.6826 7.10638L15.6758 10.1129L12.669 7.10638C12.4999 6.93719 12.2258 6.93719 12.0566 7.10638C11.8874 7.27557 11.8874 7.54966 12.0566 7.71885L15.0633 10.7253L12.0566 13.7318C11.8874 13.901 11.8874 14.1751 12.0566 14.3443C12.1412 14.4289 12.252 14.4712 12.3628 14.4712C12.4736 14.4712 12.5844 14.4289 12.669 14.3443L15.6758 11.3378L18.6826 14.3443C18.7672 14.4289 18.878 14.4712 18.9888 14.4712C19.0996 14.4712 19.2105 14.4289 19.2951 14.3443C19.4642 14.1751 19.4642 13.901 19.2951 13.7318L16.2883 10.7253Z" fill="#292929"/>
    </svg>
  `,
  info: `
    <svg width="32" height="22" viewBox="0 0 32 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15.6752 15.7781C12.8886 15.7781 10.6221 13.5116 10.6221 10.725C10.6221 7.93845 12.8886 5.67188 15.6752 5.67188C18.4617 5.67188 20.7283 7.93845 20.7283 10.725C20.7283 13.5116 18.4617 15.7781 15.6752 15.7781ZM15.6752 6.53812C13.3663 6.53812 11.4883 8.41613 11.4883 10.725C11.4883 13.0339 13.3663 14.9119 15.6752 14.9119C17.9841 14.9119 19.8621 13.0339 19.8621 10.725C19.8621 8.41613 17.9841 6.53812 15.6752 6.53812Z" fill="#292929"/>
    <path d="M15.6756 7.98826C15.8088 7.98357 15.9386 8.03092 16.0375 8.12029C16.2282 8.33111 16.2282 8.65218 16.0375 8.863C15.9397 8.95454 15.8095 9.00338 15.6756 8.99873C15.5391 9.00421 15.4065 8.95233 15.31 8.85566C15.2164 8.7587 15.1661 8.62794 15.1706 8.49325C15.1635 8.35755 15.2108 8.22462 15.3021 8.12399C15.4024 8.02886 15.5377 7.97969 15.6756 7.98826Z" fill="#292929"/>
    <path d="M15.6753 13.6487C15.4362 13.6487 15.2422 13.4547 15.2422 13.2155V10.4234C15.2422 10.1842 15.4362 9.99023 15.6753 9.99023C15.9144 9.99023 16.1084 10.1842 16.1084 10.4234V13.2155C16.1084 13.4547 15.9144 13.6487 15.6753 13.6487Z" fill="#292929"/>
  </svg>
  `,
};

/**
 * Cleans URL by removing escaped forward slashes.
 */
const cleanUrl = (url) => (url ? url.replace(/\\\//g, '/') : '');

/**
 * Generates template deep link URL.
 */
const createTemplateDeepLink = (templateId) => `https://premierepro.app.link/1RdAjG4WyYb?template_id=${templateId}`;

/**
 * Detects if the user is on an iOS device.
 */
const isIOSDevice = () => {
  const ua = navigator.userAgent;
  const isiPhone = /iPhone/i.test(ua);
  const isiPad = /iPad/i.test(ua) || (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 0);
  return isiPhone || isiPad;
};

/**
 * Logs errors to analytics.
 */
const logError = (message) => {
  window.lana?.log(message, { tags: 'prm-yt-gallery' });
};

const setAriaHidden = (elementOrSelector, hidden, parent = document) => {
  let element = elementOrSelector;

  if (typeof elementOrSelector === 'string') {
    element = parent.querySelector(elementOrSelector);
  }

  if (element) {
    element.setAttribute('aria-hidden', hidden ? 'true' : 'false');
  }
};

/**
 * Normalizes API item to consistent internal structure.
 */
const normalizeItem = (apiItem) => ({
  image: cleanUrl(apiItem.thumbnail_url),
  altText: apiItem.title || 'premiere youtube card',
  deepLinkUrl: createTemplateDeepLink(apiItem.id),
  video: cleanUrl(apiItem.video_preview_url),
  isFree: apiItem.is_free || false,
});

/**
 * Builds Adobe Stock API URL with query parameters.
 */
const buildApiUrl = (collectionId, offset, limit) => {
  const params = new URLSearchParams({
    'search_parameters[offset]': offset,
    'search_parameters[limit]': limit,
    ff_9909481692: '1',
    'search_parameters[enable_templates]': '1',
    'search_parameters[order]': 'creation',
    'search_parameters[gallery_id]': collectionId,
  });
  return `${CONFIG.API.BASE_URL}?${params.toString()}`;
};

/**
 * Fetches data from Adobe Stock API.
 */
const fetchAdobeStockData = async ({ collectionId, offset = 0, limit }) => {
  try {
    const apiUrl = buildApiUrl(collectionId, offset, limit);
    const headers = { 'x-product': CONFIG.API.PRODUCT };

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    logError(`Failed to fetch Adobe Stock data: ${error.message}`);
    return null;
  }
};

/**
 * Maps property labels to their corresponding keys.
 */
const PROPERTY_MAP = {
  'collection-id': 'collectionId',
  button: 'buttonText',
  'free-tag-text': 'freeTagText',
};

/**
 * Parses block properties from the authoring table.
 */
const parseBlockProps = (block) => {
  const props = { ...DEFAULT_PROPS };
  const rows = Array.from(block.children);

  rows.forEach((row) => {
    const cols = row.querySelectorAll('div');
    if (cols.length < 2) return;

    const label = cols[0].textContent.trim().toLowerCase();
    const value = cols[1].textContent.trim();

    if (value && PROPERTY_MAP[label]) {
      props[PROPERTY_MAP[label]] = value;
    }
  });

  return props;
};

/**
 * Plays video with fade-in effect.
 */
const playVideo = (video) => {
  if (!video.paused && !video.ended) return;
  video.currentTime = 0;
  video.addEventListener('canplay', () => {
    video.style.opacity = 1;
    video.play().catch((error) => {
      logError(`Failed to play video: ${error.message}`);
    });
  }, { once: true });
};

/**
 * Expands a card and starts video playback.
 */
const expandCard = (card, video) => {
  card.classList.add(CLASSES.EXPANDED);

  setAriaHidden(`.${CLASSES.CLOSE_CARD_BUTTON}`, false, card);
  setAriaHidden(`.${CLASSES.INFO_BUTTON}`, false, card);

  if (video && !card.classList.contains(CLASSES.INFO_VISIBLE)) {
    playVideo(video);
  }
};

/**
 * Collapses a card and stops video playback.
 */
const collapseCard = (card, video) => {
  card.classList.remove(CLASSES.EXPANDED, CLASSES.INFO_VISIBLE);
  card.querySelector(`.${CLASSES.OVERLAY_TEXT}`).scrollTop = 0;

  setAriaHidden(`.${CLASSES.CLOSE_CARD_BUTTON}`, true, card);
  setAriaHidden(`.${CLASSES.INFO_BUTTON}`, true, card);

  if (video) video.pause();
};

/**
 * Creates a reusable close button.
 */
const createCloseButton = (className, ariaLabel, onClick, tabIndex = 0, ariaHidden = true) => {
  const button = createTag('button', {
    class: className,
    'aria-label': ariaLabel,
    type: 'button',
    tabIndex,
    'aria-hidden': ariaHidden ? 'true' : 'false',
  });
  button.insertAdjacentHTML('beforeend', ICONS.close);
  button.addEventListener('click', (e) => {
    e.stopPropagation();
    onClick();
  });
  if (window.innerWidth > CONFIG.VIEWPORT.mobile) {
    button.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e?.preventDefault();
        e?.stopPropagation();
        onClick();
      }
    });
  }
  return button;
};

/**
 * Creates the info button for showing template details.
 */
const createInfoButton = () => {
  const button = createTag('button', {
    class: CLASSES.INFO_BUTTON,
    'aria-label': 'Show info',
    type: 'button',
    tabindex: '0',
    'aria-hidden': 'true',
  });
  button.insertAdjacentHTML('beforeend', ICONS.info);
  return button;
};

/**
 * Creates the "Edit this template" button.
 */
const createEditButton = (buttonText) => {
  const button = createTag('a', { class: CLASSES.BUTTON, tabindex: '0' });
  button.textContent = buttonText;
  return button;
};

/**
 * Creates the info overlay with text container.
 */
const createInfoOverlay = () => {
  const overlay = createTag('div', { class: CLASSES.INFO_OVERLAY });
  const overlayText = createTag('p', { class: CLASSES.OVERLAY_TEXT, tabindex: '-1' });
  overlay.append(overlayText);
  return overlay;
};

/**
 * Creates an image element with lazy/eager loading.
 */
const createImageElement = (src, eager = false) => createTag('img', {
  src,
  loading: eager ? 'eager' : 'lazy',
});

/**
 * Creates a video element with standard settings.
 */
const createVideoElement = (src, posterUrl) => {
  const video = createTag('video', { src, poster: posterUrl, tabindex: '-1' });
  video.controls = false;
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.preload = 'metadata';
  return video;
};

/**
 * Creates the close button for a specific card.
 */
const createCloseCardButton = (card) => {
  const video = card.querySelector(`.${CLASSES.VIDEO_WRAPPER} video`);
  return createCloseButton(
    CLASSES.CLOSE_CARD_BUTTON,
    'Close card',
    () => {
      collapseCard(card, video);
      if (window.innerWidth > CONFIG.VIEWPORT.mobile) { card?.querySelector('.pre-yt-info-button')?.focus(); }
    },
  );
};

/**
 * Creates a shimmer card placeholder with all UI elements.
 */
const createShimmerCard = (buttonText) => {
  const card = createTag('div', {
    class: `${CLASSES.CARD} ${CLASSES.SHIMMER}`,
    tabindex: '0',
  });
  const cardInner = createTag('div', { class: CLASSES.CARD_INNER });
  const imageWrapper = createTag('div', { class: CLASSES.IMAGE_WRAPPER });
  const videoWrapper = createTag('div', { class: CLASSES.VIDEO_WRAPPER });

  // Add edit button only on iOS devices
  if (isIOSDevice()) {
    videoWrapper.append(createEditButton(buttonText));
  }

  videoWrapper.append(
    createInfoButton(),
    createCloseCardButton(card),
    createInfoOverlay(),
  );

  cardInner.append(imageWrapper, videoWrapper);
  card.append(cardInner);

  return card;
};

/**
 * Removes shimmer effect once image loads.
 */
const handleImageLoad = (card, img) => {
  const removeShimmer = () => card.classList.remove(CLASSES.SHIMMER);

  if (img.complete) {
    removeShimmer();
  } else {
    img.addEventListener('load', removeShimmer, { once: true });
    img.addEventListener('error', removeShimmer, { once: true });
  }
};

/**
 * Updates card with actual content from API data.
 */
const updateCardWithData = (card, item, eager = false) => {
  const imageWrapper = card.querySelector(`.${CLASSES.IMAGE_WRAPPER}`);
  const videoWrapper = card.querySelector(`.${CLASSES.VIDEO_WRAPPER}`);
  const button = card.querySelector(`.${CLASSES.BUTTON}`);
  const overlayText = card.querySelector(`.${CLASSES.OVERLAY_TEXT}`);

  // Add and handle image loading
  const img = createImageElement(item.image, eager);
  handleImageLoad(card, img);
  imageWrapper.append(img);
  const overlayTextId = `overlay-text-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Update overlay text
  if (overlayText) {
    overlayText.textContent = item.altText;
    overlayText.ariaLive = 'polite';
    overlayText.id = overlayTextId;
  }

  // Update button deep link and aria-describedby
  if (button && item.deepLinkUrl) {
    button.href = item.deepLinkUrl;
    button.setAttribute('aria-describedby', overlayTextId);
  }

  // Add video if available
  if (item.video && videoWrapper) {
    videoWrapper.append(createVideoElement(item.video, item.image));
  }
};

/**
 * Shows info overlay and pauses video.
 */
const showInfoOverlay = (card, video, closeOverlayButton) => {
  card.classList.add(CLASSES.INFO_VISIBLE);
  if (video) video.pause();

  setAriaHidden(`.${CLASSES.INFO_BUTTON}`, true, card);

  if (closeOverlayButton) {
    closeOverlayButton.tabindex = 0;
    setAriaHidden(closeOverlayButton, false);
    closeOverlayButton.focus();
  }
};

/**
 * Hides info overlay and resumes video.
 */
const hideInfoOverlay = (card, video) => {
  card.classList.remove(CLASSES.INFO_VISIBLE);

  setAriaHidden(`.${CLASSES.OVERLAY_CLOSE}`, true, card);
  setAriaHidden(`.${CLASSES.INFO_BUTTON}`, false, card);

  if (video) {
    video.play().catch((error) => {
      logError(`Failed to resume video after closing info overlay: ${error.message}`);
    });
  }
  card.querySelector(`.${CLASSES.OVERLAY_TEXT}`).scrollTop = 0;
};

/**
 * Handles tab navigation within the overlay.
 */
const handleOverlayTabNavigation = (e, card, editButton, closeCardButton) => {
  if (e.key !== 'Tab' || e.shiftKey) return;

  e.preventDefault();
  if (editButton) {
    card.overlayJustClosed = true;
    editButton.focus();
  } else if (closeCardButton) {
    closeCardButton.focus();
  }
};

/**
 * Handles tab navigation from close card button to next card.
 */
const handleCloseCardTabNavigation = (e, card) => {
  if (e.key !== 'Tab' || e.shiftKey) return;

  const grid = card.closest(`.${CLASSES.GRID}`);
  if (!grid) return;

  const cards = Array.from(grid.querySelectorAll(`.${CLASSES.CARD}`));
  const currentIndex = cards.indexOf(card);
  const nextCard = cards[currentIndex + 1];

  if (nextCard) {
    e.preventDefault();
    nextCard.focus();
  }
};

/**
 * Handles tab navigation from edit button to info button.
 */
const handleEditButtonTabNavigation = (e, infoButton, card) => {
  if (e.key === 'Tab' && !e.shiftKey) {
    e.preventDefault();
    if (card.classList.contains(CLASSES.INFO_VISIBLE)) {
      handleCloseCardTabNavigation(e, card);
    } else {
      infoButton.focus();
    }
  }
};

/**
 * Sets up info overlay interactions for a card.
 */
const setupInfoOverlay = (card) => {
  const infoButton = card.querySelector(`.${CLASSES.INFO_BUTTON}`);
  const overlay = card.querySelector(`.${CLASSES.INFO_OVERLAY}`);
  const closeCardButton = card.querySelector(`.${CLASSES.CLOSE_CARD_BUTTON}`);
  const video = card.querySelector(`.${CLASSES.VIDEO_WRAPPER} video`);
  const editButton = card.querySelector(`.${CLASSES.BUTTON}`);

  if (!infoButton || !overlay) return;
  // Create and append overlay close button
  // chnage here
  const closeOverlayButton = createCloseButton(
    CLASSES.OVERLAY_CLOSE,
    'Close text description',
    () => {
      hideInfoOverlay(card, video);
      if (window.innerWidth > CONFIG.VIEWPORT.mobile) {
        card?.querySelector('.pre-yt-info-button')?.focus();
      } else {
        card.querySelector(`.${CLASSES.CLOSE_CARD_BUTTON}`).focus();
      }
    },
    -1,
  );
  overlay.appendChild(closeOverlayButton);

  // Info button click handler
  infoButton.addEventListener('click', (e) => {
    e.stopPropagation();
    showInfoOverlay(card, video, closeOverlayButton);
  });

  // Keyboard navigation handlers
  closeOverlayButton.addEventListener('keydown', (e) => {
    handleOverlayTabNavigation(e, card, editButton, closeCardButton);
  });

  if (editButton) {
    editButton.addEventListener('keydown', (e) => {
      handleEditButtonTabNavigation(e, infoButton, card);
    });
  }

  if (closeCardButton) {
    closeCardButton.setAttribute('tabindex', '0');
    closeCardButton.addEventListener('keydown', (e) => {
      handleCloseCardTabNavigation(e, card);
    });
  }
};

/**
 * Sets up card interaction handlers (hover, focus, click).
 */
const setupCardInteractions = (card) => {
  const video = card.querySelector(`.${CLASSES.VIDEO_WRAPPER} video`);

  // Mobile/Tablet: expand on click, Desktop: expand on hover
  if (getScreenSizeCategory(CONFIG.VIEWPORT) === 'mobile' || getScreenSizeCategory(CONFIG.VIEWPORT) === 'tablet') {
    card.addEventListener('click', () => expandCard(card, video));
  } else {
    // Desktop: expand on hover
    card.addEventListener('mouseenter', () => expandCard(card, video));
    card.addEventListener('mouseleave', () => collapseCard(card, video));
  }

  // Keyboard navigation: expand on focus (only if coming from outside the card)
  card.addEventListener('focusin', (e) => {
    if (!card.contains(e.relatedTarget)) {
      expandCard(card, video);
    }
  });
  card.addEventListener('focusout', (e) => {
    if (!card.contains(e.relatedTarget)) {
      collapseCard(card, video);
    }
  });

  // Setup info overlay
  setupInfoOverlay(card);
};

/**
 * Sets up interactions for all cards in the container.
 */
const setupVideoHoverBehavior = (container) => {
  const cards = container.querySelectorAll(`.${CLASSES.CARD}`);
  cards.forEach((card) => setupCardInteractions(card));
};

/**
 * Renders shimmer placeholder cards.
 */
const renderShimmerGrid = (container, buttonText, cardLimit) => {
  const shimmerCards = Array.from({ length: cardLimit }, () => createShimmerCard(buttonText));
  container.append(...shimmerCards);
};

/**
 * Adds free tag to a card if needed.
 */
const addFreeTagToCard = (card, freeTagText) => {
  if (!freeTagText) return;

  const freeTag = createTag('div', { class: CLASSES.FREE_TAG });
  freeTag.textContent = freeTagText;
  card.append(freeTag);
};

/**
 * Updates cards with fetched data from API.
 */
const updateCardsWithData = (container, data, cardLimit, freeTagText) => {
  const cards = container.querySelectorAll(`.${CLASSES.CARD}`);
  const items = data?.files?.slice(0, cardLimit) || [];

  items.forEach((rawItem, index) => {
    const card = cards[index];
    if (!card) return;

    const item = normalizeItem(rawItem);
    const eager = index < CONFIG.EAGER_LOAD_COUNT;

    updateCardWithData(card, item, eager);

    if (item.isFree) {
      addFreeTagToCard(card, freeTagText);
    }
  });

  setupVideoHoverBehavior(container);
};

/**
 * Initializes the gallery block.
 */
export default async function init(el) {
  const blockProps = parseBlockProps(el);

  if (!blockProps.collectionId) {
    logError('Collection ID is required for prm-yt-gallery');
    return;
  }

  // Clear block content and setup grid
  el.innerHTML = '';
  const viewport = getScreenSizeCategory(CONFIG.VIEWPORT);
  const cardLimit = CONFIG.CARD_LIMIT[viewport];
  const grid = createTag('div', { class: CLASSES.GRID });
  el.append(grid);

  // Render shimmer placeholders
  renderShimmerGrid(grid, blockProps.buttonText, cardLimit);

  // Fetch and populate data
  const data = await fetchAdobeStockData({
    collectionId: blockProps.collectionId,
    offset: 0,
    limit: 96,
  });

  if (data) {
    updateCardsWithData(grid, data, cardLimit, blockProps.freeTagText);
  }
}
