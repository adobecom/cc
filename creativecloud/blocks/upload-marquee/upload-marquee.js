import { createTag, getLibs, getScreenSizeCategory } from '../../scripts/utils.js';

// ===== CONFIG =====
const miloLibs = getLibs('/libs');
const VIEWPORTS = ['mobile-up', 'tablet-up', 'desktop-up'];
const DEFAULT_DROPZONE_ICON = '/cc-shared/assets/svg/s2-icon-default-image-20-n.svg';
const AnalyticsKeys = {
  uploadAssetCTA: 'Upload asset CTA|UnityWidget',
  editPhotosCTA: 'Edit Photos CTA|UnityWidget',
};

let uploadColumnCounter = 0;

// ===== LCP / MEDIA PRIORITY =====
const LCP_IMAGE_PARAMS = {
  webpLarge: 'width=1000&format=webply&optimize=medium',
  webpSmall: 'width=500&format=webply&optimize=medium',
  jpgLarge: 'width=1000&format=jpg&optimize=medium',
  jpgSmall: 'width=500&format=jpg&optimize=medium',
};

function getBaseImageUrlFromPicture(picture) {
  if (!picture) return null;

  const img = picture.querySelector('img');
  const imgSrc = img?.src;
  if (imgSrc) {
    return { baseUrl: imgSrc.split('?')[0], img };
  }

  const srcset = picture.querySelector('source[srcset]')?.srcset;
  if (!srcset) return null;

  const url = srcset.split(',')[0].trim().split(/\s+/)[0];
  const baseUrl = url ? url.split('?')[0] : null;
  return baseUrl && img ? { baseUrl, img } : null;
}

function rewritePictureToOurSizes(picture) {
  const result = getBaseImageUrlFromPicture(picture);
  if (!result?.baseUrl || !result.img) return null;

  const { baseUrl, img } = result;

  picture.textContent = '';
  picture.append(
    createTag('source', {
      type: 'image/webp',
      srcset: `${baseUrl}?${LCP_IMAGE_PARAMS.webpLarge}`,
      media: '(min-width: 600px)',
    }),
    createTag('source', {
      type: 'image/webp',
      srcset: `${baseUrl}?${LCP_IMAGE_PARAMS.webpSmall}`,
    }),
    createTag('source', {
      type: 'image/jpeg',
      srcset: `${baseUrl}?${LCP_IMAGE_PARAMS.jpgLarge}`,
      media: '(min-width: 600px)',
    }),
  );

  img.setAttribute('src', `${baseUrl}?${LCP_IMAGE_PARAMS.jpgSmall}`);
  img.removeAttribute('loading');
  img.removeAttribute('fetchpriority');
  picture.append(img);
  return img;
}

function setUploadRowMediaPriority(uploadRow) {
  const screenCategory = getScreenSizeCategory({ mobile: 599, tablet: 1199 });
  const activeColumnIndex = { mobile: 0, tablet: 1, desktop: 2 }[screenCategory];

  [...uploadRow.children].forEach((column, index) => {
    const isActive = index === activeColumnIndex;
    const picture = column.querySelector('picture');

    if (picture) {
      const img = rewritePictureToOurSizes(picture);
      if (img) {
        img.setAttribute('loading', isActive ? 'eager' : 'lazy');
        if (isActive) img.setAttribute('fetchpriority', 'high');
      }
    }

    const video = column.querySelector('video');
    if (video) {
      video.setAttribute('preload', isActive ? 'auto' : 'metadata');
    }
  });
}

// ===== LOGGING =====
function logUploadMarqueeInfo(message, errorType = 'i') {
  window.lana?.log(message, { tags: 'upload-marquee', errorType });
}

// ===== ID HELPERS =====
function nextUploadColumnId() {
  uploadColumnCounter += 1;
  return uploadColumnCounter;
}

function buildScopedId(prefix, columnId) {
  return `${prefix}-${columnId}`;
}

// ===== DATA EXTRACTION =====
function extractUploadContentParts(content) {
  const media = content.querySelector('picture, .video-container.video-holder');
  const terms = content.querySelector('p:last-child');
  const mediaPara = media?.closest('p');

  const hasUploadMarker = (para) => para.querySelector(
    'span[class*=icon-share], span[class*=icon-upload], img[src$=".svg"]:not(.video-container img)',
  );

  const candidateParagraphs = [
    ...content.querySelectorAll('p:not(:last-child)'),
  ].filter(
    (para) => para.textContent.trim() !== '' || para.querySelector('img, svg'),
  );

  const uploadPara = candidateParagraphs.find((para) => hasUploadMarker(para));

  const contentParagraphs = candidateParagraphs.filter((para) => {
    const isMediaOnlyPara = para === mediaPara
      && !hasUploadMarker(para)
      && para.textContent.trim() === '';
    return !isMediaOnlyPara;
  });

  const textParas = contentParagraphs.filter((para) => para !== uploadPara);
  const headingPara = textParas[0];
  const bodyPara = textParas[1];

  return {
    media,
    terms,
    contentParagraphs,
    uploadPara,
    headingPara,
    bodyPara,
  };
}

// ===== DOM BUILDERS =====
// TODO: See if it could be simplified
function applyViewportClasses(foreground) {
  foreground.firstElementChild?.classList.add('upload-grid');

  if (
    foreground.childElementCount === 2
    || foreground.childElementCount === 3
  ) {
    [...foreground.children].forEach((child, index) => {
      child.classList.add('upload-grid', VIEWPORTS[index]);
      if (foreground.childElementCount === 2 && index === 1) {
        child.className = 'upload-grid tablet-up desktop-up';
      }
    });
  } else if (foreground.childElementCount === 1) {
    foreground.firstElementChild?.classList.add(...VIEWPORTS);
  }

  return foreground;
}

function getViewportClasses(el) {
  return [...el.classList].filter((cls) => VIEWPORTS.includes(cls));
}

function buildDropZoneIcon() {
  const defaultIcon = createTag('p', { class: 'drop-zone-default-icon' });
  const image = createTag('img', { src: DEFAULT_DROPZONE_ICON, alt: '' });
  defaultIcon.setAttribute('aria-hidden', 'true');
  defaultIcon.append(image);
  return defaultIcon;
}

function assignDropZoneTextIds(headingPara, bodyPara, columnId) {
  const describedByIds = [];

  if (headingPara) {
    headingPara.classList.add('drop-zone-heading');
    headingPara.id = buildScopedId('drop-zone-heading', columnId);
    describedByIds.push(headingPara.id);
  }
  if (bodyPara) {
    bodyPara.classList.add('drop-zone-body');
    bodyPara.id = buildScopedId('drop-zone-body', columnId);
    describedByIds.push(bodyPara.id);
  }

  return describedByIds;
}

function makeDecorativeMediaNonFocusable(container) {
  container.querySelectorAll('picture, picture img').forEach((el) => {
    el.setAttribute('tabindex', '-1');
    el.setAttribute('role', 'presentation');
  });
}

async function buildUploadActionControls(para) {
  const button = createTag(
    'a',
    {
      tabindex: '0',
      class: 'con-button blue action-button button-xl no-track',
      'daa-ll': AnalyticsKeys.uploadAssetCTA,
    },
    para.innerHTML,
  );
  makeDecorativeMediaNonFocusable(button);
  const input = createTag('input', {
    type: 'file',
    name: 'file-upload',
    id: 'file-upload',
    class: 'file-upload hide',
    accept: 'image/*',
    'aria-hidden': 'true',
  });

  button.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      input.click();
    }
  });

  para.classList.add('upload-action-container');
  para.textContent = '';
  para.append(button, input);
  return { fileInput: input };
}

// ===== EVENT BINDERS =====
function wireDropZoneAccessibility(dropZone, fileInput) {
  dropZone.setAttribute('tabindex', '-1');

  dropZone.addEventListener('click', (event) => {
    event.stopPropagation();
    fileInput?.click();
  });
}

async function buildDropZone(uploadParts, columnId) {
  const dropZone = createTag('div', { class: 'drop-zone' });
  const { fileInput } = await buildUploadActionControls(uploadParts.uploadPara);
  assignDropZoneTextIds(
    uploadParts.headingPara,
    uploadParts.bodyPara,
    columnId,
  );

  wireDropZoneAccessibility(dropZone, fileInput);
  dropZone.append(buildDropZoneIcon(), ...uploadParts.contentParagraphs);

  return dropZone;
}

function replaceUploadColumnContent(
  content,
  mediaContainer,
  dropZoneContainer,
  terms,
) {
  content.textContent = '';
  content.append(mediaContainer, dropZoneContainer);
  if (terms) {
    dropZoneContainer.append(terms);
  }
}

function buildMarqueeContent(marqueeCell) {
  const marqueeContent = createTag('div', { class: 'upload-marquee-content' });
  [...marqueeCell.children].forEach((child) => marqueeContent.append(child.cloneNode(true)));

  const brandingPara = marqueeContent.querySelector(':scope > p:first-child');
  const [firstPicture, secondPicture] = brandingPara
    ? [...brandingPara.querySelectorAll('picture')]
    : [];
  if (firstPicture && secondPicture) {
    const brandingRow = createTag('span', { class: 'upload-marquee-branding-row' });
    const firstWrap = createTag('span', { class: 'upload-marquee-branding-first' });
    const secondWrap = createTag('span', { class: 'upload-marquee-branding-second' });
    firstWrap.append(firstPicture.cloneNode(true));
    secondWrap.append(secondPicture.cloneNode(true));
    brandingRow.append(firstWrap, secondWrap);

    brandingPara.textContent = '';
    brandingPara.classList.add('upload-marquee-branding');
    brandingPara.append(brandingRow);
    brandingRow.querySelectorAll('picture img, img').forEach((img) => {
      img.setAttribute('loading', 'eager');
    });
  }

  const ctaLink = marqueeContent.querySelector('p strong a[href]');
  if (ctaLink) {
    ctaLink.classList.add('con-button', 'upload-marquee-cta', 'no-track');
    ctaLink.setAttribute('aria-label', ctaLink.textContent.trim());
    ctaLink.setAttribute('daa-ll', AnalyticsKeys.editPhotosCTA);
  }

  const ctaParentPara = ctaLink?.closest('p');
  const heading = marqueeContent.querySelector(':scope > h1');
  const descriptionPara = heading?.nextElementSibling?.tagName === 'P'
    ? heading.nextElementSibling : null;
  const allParas = [...marqueeContent.querySelectorAll(':scope > p')];
  const lastPara = allParas[allParas.length - 1];
  if (
    lastPara
    && lastPara !== ctaParentPara
    && lastPara !== brandingPara
    && lastPara !== descriptionPara
    && lastPara.textContent.trim()
  ) {
    lastPara.classList.add('upload-marquee-dropzone-label');
  }

  return marqueeContent;
}

function buildLayout() {
  const layout = createTag('div', { class: 'upload-marquee-layout' });
  const leftCol = createTag('div', { class: 'upload-marquee-left' });
  const rightCol = createTag('div', { class: 'upload-marquee-right' });
  const uploadsWrapper = createTag('div', { class: 'upload-marquee-uploads' });
  const mediaWrapper = createTag('div', { class: 'upload-marquee-media' });

  return {
    layout,
    leftCol,
    rightCol,
    uploadsWrapper,
    mediaWrapper,
  };
}

function appendColumns(viewportContent, uploadsWrapper, mediaWrapper) {
  viewportContent.forEach(({ media, dropZone, viewportClasses }) => {
    if (dropZone && uploadsWrapper) {
      dropZone.classList.add(...viewportClasses);
      uploadsWrapper.append(dropZone);
    }
    if (media) {
      media.classList.add(...viewportClasses);
      mediaWrapper.append(media);
    }
  });
}

function collectViewportContent(row, extractMedia) {
  return [...row.children].map((content) => ({
    media: extractMedia(content),
    dropZone: content.querySelector(':scope > .drop-zone-container'),
    viewportClasses: getViewportClasses(content),
  }));
}

function extractMediaFromColumn(content) {
  const media = content.querySelector('picture, .video-container.video-holder');
  if (!media) return null;

  const mediaContainer = createTag('div', { class: 'media-container' });
  mediaContainer.append(media);
  return mediaContainer;
}

async function decorateUploadColumn(content) {
  const columnId = nextUploadColumnId();
  const mediaContainer = createTag('div', { class: 'media-container' });
  const dropZoneContainer = createTag('div', { class: 'drop-zone-container' });
  const uploadParts = extractUploadContentParts(content);

  if (uploadParts.media) {
    mediaContainer.append(uploadParts.media);
    if (
      uploadParts.media.parentElement?.tagName === 'P'
      && uploadParts.media.parentElement.textContent.trim() === ''
    ) {
      uploadParts.media.parentElement.remove();
    }
  }

  if (!uploadParts.uploadPara) {
    logUploadMarqueeInfo(
      'Failed to create upload button for upload-marquee block.',
    );
    return;
  }

  const dropZone = await buildDropZone(uploadParts, columnId);
  dropZoneContainer.append(dropZone);
  replaceUploadColumnContent(
    content,
    mediaContainer,
    dropZoneContainer,
    uploadParts.terms,
  );
}

function setupLayoutDragAndDrop(layout, uploadsWrapper) {
  let activeDropZone;

  const setActiveDropZone = () => {
    const dropZones = [
      ...uploadsWrapper.querySelectorAll(
        ':scope > .drop-zone-container > .drop-zone',
      ),
    ];
    const nextDropZone = dropZones.find((zone) => zone.offsetParent !== null) || dropZones[0];
    if (activeDropZone && activeDropZone !== nextDropZone) {
      activeDropZone.classList.remove('active');
    }
    activeDropZone = nextDropZone;
    activeDropZone?.classList.add('active');
  };

  const clearActiveDropZone = () => {
    activeDropZone?.classList.remove('active');
    activeDropZone = null;
  };

  layout.addEventListener('dragenter', (event) => {
    event.preventDefault();
    setActiveDropZone();
  });

  layout.addEventListener('dragover', (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    setActiveDropZone();
  });

  layout.addEventListener('dragleave', (event) => {
    event.preventDefault();
    clearActiveDropZone();
  });

  document.addEventListener('dragend', () => clearActiveDropZone());

  layout.addEventListener('drop', (event) => {
    event.preventDefault();
    setActiveDropZone();
    const fileInput = activeDropZone?.querySelector('.file-upload');
    const files = event.dataTransfer?.files;
    if (files?.length && fileInput) {
      try {
        fileInput.files = files;
      } catch {
        // TODO: Trigger lana log
        // Some browsers may not allow assigning FileList directly.
      }
      fileInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
    clearActiveDropZone();
  });

  uploadsWrapper.querySelectorAll('.drop-zone').forEach((zone) => {
    zone.addEventListener('drop', () => {
      clearActiveDropZone();
    });
  });

  window.addEventListener('drop', () => clearActiveDropZone());
  window.addEventListener('dragend', () => clearActiveDropZone());
}

function decorateContentRow(row) {
  row.classList.add('foreground');
  applyViewportClasses(row);
  setUploadRowMediaPriority(row);
}

function mountLayout(el, { layout, leftCol, rightCol }, mediaWrapper) {
  rightCol.append(mediaWrapper);
  layout.append(leftCol, rightCol);
  const foreground = createTag('div', { class: 'foreground' });
  foreground.append(layout);
  el.textContent = '';
  el.append(foreground);
}

function appendMarqueeContent(marqueeRow, leftCol) {
  const marqueeCell = marqueeRow.querySelector(':scope > div');
  if (!marqueeCell) return false;
  leftCol.append(buildMarqueeContent(marqueeCell));
  return true;
}

async function initDropzoneVariant(el, uploadRow, layoutParts) {
  const { layout, leftCol, uploadsWrapper, mediaWrapper } = layoutParts;

  for (let i = 0; i < uploadRow.children.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await decorateUploadColumn(uploadRow.children[i]);
  }

  appendColumns(
    collectViewportContent(uploadRow, (c) => c.querySelector(':scope > .media-container')),
    uploadsWrapper,
    mediaWrapper,
  );

  if (!uploadsWrapper.children.length || !mediaWrapper.children.length) return;

  leftCol.append(uploadsWrapper);
  setupLayoutDragAndDrop(layout, uploadsWrapper);
  mountLayout(el, layoutParts, mediaWrapper);
}

async function initPromptVariant(el, mediaRow, layoutParts) {
  const { leftCol, mediaWrapper } = layoutParts;

  // 'copy' class is required by Unity to locate and inject the prompt bar
  leftCol.classList.add('copy');
  const promptContainer = createTag('div', { class: 'upload-marquee-prompt-container' });
  leftCol.append(promptContainer);

  appendColumns(
    collectViewportContent(mediaRow, extractMediaFromColumn),
    null,
    mediaWrapper,
  );

  if (!mediaWrapper.children.length) return;
  mountLayout(el, layoutParts, mediaWrapper);
}

export default async function init(el) {
  const { decorateBlockBg } = await import(`${miloLibs}/utils/decorate.js`);

  el.classList.add('upload-marquee-block', 'con-block');
  const rows = el.querySelectorAll(':scope > div');
  if (rows.length < 3) return;

  const [backgroundRow, marqueeRow, contentRow] = rows;
  const isPromptVariant = el.classList.contains('unity-prompt');

  if (backgroundRow.textContent.trim() !== '') {
    backgroundRow.classList.add('background');
    decorateBlockBg(el, backgroundRow, { useHandleFocalpoint: true });
  }

  decorateContentRow(contentRow);
  const layoutParts = buildLayout();
  if (!appendMarqueeContent(marqueeRow, layoutParts.leftCol)) return;

  if (isPromptVariant) {
    await initPromptVariant(el, contentRow, layoutParts);
  } else {
    await initDropzoneVariant(el, contentRow, layoutParts);
  }
}
