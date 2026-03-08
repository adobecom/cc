import { createTag, getConfig, getLibs } from '../../scripts/utils.js';

// ===== CONFIG =====
const miloLibs = getLibs('/libs');
const VIEWPORTS = ['mobile-up', 'tablet-up', 'desktop-up'];
const DEFAULT_DROPZONE_ICON = '/cc-shared/assets/svg/s2-icon-upload-20-n.svg';
const ARIA_PLACEHOLDER_KEYS = {
  dropZoneAriaLabel: 'upload-marquee-drop-zone-aria-label',
  layoutAriaLabel: 'upload-marquee-layout-aria-label',
  filePickerAriaSuffix: 'file-picker',
};
const ARIA_LABEL_DEFAULTS = {
  dropZoneAriaLabel:
    'Upload your asset. Drag and drop a file, or press Enter to browse.',
  layoutAriaLabel:
    'Asset upload area. Drag and drop files anywhere in this section.',
  filePickerAriaSuffix: 'file picker',
};
const AnalyticsKeys = {
  uploadAssetCTA: 'Upload asset CTA|UnityWidget',
  editPhotosCTA: 'Edit Photos CTA|UnityWidget',
};

// Widget registry: maps block class names found in fragments to their decorator modules.
// Add a new entry here to support a new widget variant; no other code changes required.
const WIDGET_REGISTRY = {
  'upload-dropzone': () => import('./widgets/dropzone.js'),
  'prompt-bar': () => import('./widgets/prompt-bar.js'),
};

let uploadColumnCounter = 0;

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

// ===== ARIA / LOCALIZATION =====
function createAriaLabelsLoader() {
  let labelsPromise;
  return async function getAriaLabels() {
    if (!labelsPromise) {
      labelsPromise = (async () => {
        try {
          const config = getConfig();
          const { replaceKeyArray } = await import(
            `${miloLibs}/features/placeholders.js`
          );
          const labelKeys = Object.keys(ARIA_PLACEHOLDER_KEYS);
          const localizedValues = await replaceKeyArray(
            labelKeys.map((key) => ARIA_PLACEHOLDER_KEYS[key]),
            config,
          );
          return labelKeys.reduce((acc, key, index) => {
            acc[key] = localizedValues[index] || ARIA_LABEL_DEFAULTS[key];
            return acc;
          }, {});
        } catch (err) {
          logUploadMarqueeInfo(
            `Failed to fetch upload marquee aria labels: ${err}`,
          );
          return { ...ARIA_LABEL_DEFAULTS };
        }
      })();
    }
    return labelsPromise;
  };
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

async function buildUploadActionControls(para, columnId, getAriaLabels) {
  const buttonLabel = para.textContent.trim().split('|')[0].trim() || 'Upload your image';
  const { filePickerAriaSuffix } = await getAriaLabels();
  const button = createTag(
    'span',
    {
      class: 'con-button blue action-button button-xl no-track',
      'daa-ll': AnalyticsKeys.uploadAssetCTA,
      'aria-hidden': 'true',
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
    'aria-label': `${buttonLabel} ${filePickerAriaSuffix}`,
  });

  para.classList.add('upload-action-container');
  para.textContent = '';
  para.append(button, input);
  return { fileInput: input };
}

// ===== EVENT BINDERS =====
function wireDropZoneAccessibility(
  dropZone,
  fileInput,
  describedByIds,
  dropZoneAriaLabel,
) {
  dropZone.setAttribute('role', 'button');
  dropZone.setAttribute('tabindex', '0');
  dropZone.setAttribute('aria-label', dropZoneAriaLabel);

  if (fileInput?.id) {
    dropZone.setAttribute('aria-controls', fileInput.id);
  }
  if (describedByIds.length) {
    dropZone.setAttribute('aria-describedby', describedByIds.join(' '));
  }

  dropZone.addEventListener('click', (event) => {
    event.stopPropagation();
    fileInput?.click();
  });

  dropZone.addEventListener('keydown', (event) => {
    if (event.target !== dropZone) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      fileInput?.click();
    }
  });
}

async function buildDropZone(uploadParts, columnId, getAriaLabels) {
  const { dropZoneAriaLabel } = await getAriaLabels();
  const dropZone = createTag('div', { class: 'drop-zone' });
  const { fileInput } = await buildUploadActionControls(
    uploadParts.uploadPara,
    columnId,
    getAriaLabels,
  );
  const describedByIds = assignDropZoneTextIds(
    uploadParts.headingPara,
    uploadParts.bodyPara,
    columnId,
  );

  wireDropZoneAccessibility(
    dropZone,
    fileInput,
    describedByIds,
    dropZoneAriaLabel,
  );
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
  }

  const ctaLink = marqueeContent.querySelector(
    'p strong a[href], p:last-of-type a[href]',
  );
  if (ctaLink) {
    ctaLink.classList.add('con-button', 'upload-marquee-cta', 'no-track');
    ctaLink.setAttribute('aria-label', ctaLink.textContent.trim());
    ctaLink.setAttribute('daa-ll', AnalyticsKeys.editPhotosCTA);
  }

  return marqueeContent;
}

function buildLayout(layoutAriaLabel) {
  const layout = createTag('div', {
    class: 'upload-marquee-layout',
    role: 'region',
    'aria-label': layoutAriaLabel,
  });
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
    if (dropZone) {
      dropZone.classList.add(...viewportClasses);
      uploadsWrapper.append(dropZone);
    }
    if (media) {
      media.classList.add(...viewportClasses);
      mediaWrapper.append(media);
    }
  });
}

function collectViewportContent(uploadRow) {
  return [...uploadRow.children].map((content) => {
    const media = content.querySelector(':scope > .media-container');
    const dropZone = content.querySelector(':scope > .drop-zone-container');
    const viewportClasses = [...content.classList].filter((cls) => VIEWPORTS.includes(cls));
    return { media, dropZone, viewportClasses };
  });
}

function extractMediaFromColumn(content) {
  const media = content.querySelector('picture, .video-container.video-holder');
  if (!media) return null;

  const mediaContainer = createTag('div', { class: 'media-container' });
  mediaContainer.append(media.cloneNode(true));
  return mediaContainer;
}

function collectPromptViewportContent(mediaRow) {
  return [...mediaRow.children].map((content) => {
    const viewportClasses = [...content.classList].filter((cls) => VIEWPORTS.includes(cls));
    const media = extractMediaFromColumn(content);
    return { media, viewportClasses };
  });
}

function appendPromptMedia(viewportContent, mediaWrapper) {
  viewportContent.forEach(({ media, viewportClasses }) => {
    if (media) {
      media.classList.add(...viewportClasses);
      mediaWrapper.append(media);
    }
  });
}

async function decorateUploadColumn(content, getAriaLabels) {
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

  const dropZone = await buildDropZone(uploadParts, columnId, getAriaLabels);
  dropZoneContainer.append(dropZone);
  replaceUploadColumnContent(
    content,
    mediaContainer,
    dropZoneContainer,
    uploadParts.terms,
  );
}

// ===== FRAGMENT SUPPORT =====

/**
 * Returns true when a block row contains a single fragment link and nothing else.
 * Used to detect the new 4-row authoring format vs. the legacy 3-row format.
 */
function isFragmentLink(row) {
  const cell = row.firstElementChild;
  if (!cell || row.childElementCount !== 1) return false;
  if (cell.childElementCount !== 1) return false;
  const para = cell.firstElementChild;
  if (para?.tagName !== 'P') return false;
  const link = para.querySelector('a[href]');
  return !!(link && para.children.length === 1 && para.children[0] === link);
}

async function fetchWidgetFragment(url) {
  try {
    const { origin, pathname } = new URL(url);
    const res = await fetch(`${origin}${pathname}.plain.html`);
    if (!res.ok) return null;
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.querySelector('body > div > div[class]');
  } catch (err) {
    logUploadMarqueeInfo(`Failed to fetch widget fragment: ${err}`);
    return null;
  }
}

async function loadWidgetFromFragment(widgetRow, getAriaLabels) {
  const link = widgetRow.querySelector('a[href]');
  if (!link) return null;

  const blockEl = await fetchWidgetFragment(link.href);
  if (!blockEl) return null;

  const widgetType = [...blockEl.classList].find((cls) => WIDGET_REGISTRY[cls]);
  if (!widgetType) {
    logUploadMarqueeInfo(`Unknown widget type in fragment: ${blockEl.className}`);
    return null;
  }

  const { default: decorate } = await WIDGET_REGISTRY[widgetType]();
  return decorate(blockEl, getAriaLabels);
}

/**
 * Builds the right-column media wrapper from the side image row (row 3 in the
 * new 4-row authoring format). Each cell in the row is one viewport variant.
 */
function buildSideImageWrapper(sideImageRow) {
  applyViewportClasses(sideImageRow);
  const mediaWrapper = createTag('div', { class: 'upload-marquee-media' });

  [...sideImageRow.children].forEach((cell) => {
    const picture = cell.querySelector('picture, .video-container.video-holder');
    if (!picture) return;
    const viewportClasses = [...cell.classList].filter((cls) => VIEWPORTS.includes(cls));
    const mediaContainer = createTag('div', { class: 'media-container' });
    mediaContainer.classList.add(...viewportClasses);
    mediaContainer.append(picture.cloneNode(true));
    mediaWrapper.append(mediaContainer);
  });

  return mediaWrapper;
}

// ===== VARIANT INITS =====

/**
 * New fragment-based variant.
 * Row layout: [background] [marquee header] [widget fragment link] [side images]
 * The widget (dropzone, prompt bar, etc.) is loaded from the fragment URL in row 3.
 */
async function initFragmentVariant(el, marqueeRow, widgetRow, sideImageRow, getAriaLabels) {
  const { layoutAriaLabel } = await getAriaLabels();
  const { layout, leftCol, rightCol, mediaWrapper } = buildLayout(layoutAriaLabel);

  const marqueeCell = marqueeRow.querySelector(':scope > div');
  if (!marqueeCell) return;
  leftCol.append(buildMarqueeContent(marqueeCell));

  const widget = await loadWidgetFromFragment(widgetRow, getAriaLabels);
  if (!widget?.element) {
    logUploadMarqueeInfo('Failed to load widget from fragment for upload-marquee.');
    return;
  }

  if (widget.leftColClass) leftCol.classList.add(widget.leftColClass);
  leftCol.append(widget.element);

  const sideImages = buildSideImageWrapper(sideImageRow);
  if (!sideImages.children.length) return;

  [...sideImages.children].forEach((mc) => mediaWrapper.append(mc));
  rightCol.append(mediaWrapper);
  layout.append(leftCol, rightCol);

  widget.setupInteraction?.(layout);

  const foreground = createTag('div', { class: 'foreground' });
  foreground.append(layout);
  el.textContent = '';
  el.append(foreground);
}

/**
 * Legacy upload/dropzone variant (3-row authoring).
 * Kept for backward compatibility with existing authored pages.
 */
async function initUploadVariant(el, marqueeRow, uploadRow, getAriaLabels) {
  const { setupLayoutDragAndDrop } = await import('./widgets/dropzone.js');

  uploadRow.classList.add('foreground');
  applyViewportClasses(uploadRow);

  for (let i = 0; i < uploadRow.children.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await decorateUploadColumn(uploadRow.children[i], getAriaLabels);
  }

  const { layoutAriaLabel } = await getAriaLabels();
  const { layout, leftCol, rightCol, uploadsWrapper, mediaWrapper } = buildLayout(layoutAriaLabel);

  const marqueeCell = marqueeRow.querySelector(':scope > div');
  if (!marqueeCell) return;

  leftCol.append(buildMarqueeContent(marqueeCell));
  appendColumns(
    collectViewportContent(uploadRow),
    uploadsWrapper,
    mediaWrapper,
  );

  if (!uploadsWrapper.children.length || !mediaWrapper.children.length) return;

  leftCol.append(uploadsWrapper);
  rightCol.append(mediaWrapper);
  layout.append(leftCol, rightCol);
  setupLayoutDragAndDrop(layout, uploadsWrapper);

  const foreground = createTag('div', { class: 'foreground' });
  foreground.append(layout);

  el.textContent = '';
  el.append(foreground);
}

/**
 * Legacy prompt variant (3-row authoring, unity-prompt class).
 * Kept for backward compatibility with existing authored pages.
 */
async function initPromptVariant(el, marqueeRow, mediaRow, getAriaLabels) {
  mediaRow.classList.add('foreground');
  applyViewportClasses(mediaRow);

  const { layoutAriaLabel } = await getAriaLabels();
  const { layout, leftCol, rightCol, mediaWrapper } = buildLayout(layoutAriaLabel);

  leftCol.classList.add('copy');

  const marqueeCell = marqueeRow.querySelector(':scope > div');
  if (!marqueeCell) return;

  leftCol.append(buildMarqueeContent(marqueeCell));

  const promptContainer = createTag('div', { class: 'upload-marquee-prompt-container' });
  leftCol.append(promptContainer);

  appendPromptMedia(collectPromptViewportContent(mediaRow), mediaWrapper);

  if (!mediaWrapper.children.length) return;

  rightCol.append(mediaWrapper);
  layout.append(leftCol, rightCol);

  const foreground = createTag('div', { class: 'foreground' });
  foreground.append(layout);

  el.textContent = '';
  el.append(foreground);
}

export default async function init(el) {
  const { decorateBlockBg } = await import(`${miloLibs}/utils/decorate.js`);
  const getAriaLabels = createAriaLabelsLoader();

  el.classList.add('upload-marquee-block', 'con-block');
  const rows = [...el.querySelectorAll(':scope > div')];
  if (rows.length < 3) return;

  const [backgroundRow, marqueeRow, ...contentRows] = rows;

  if (backgroundRow.textContent.trim() !== '') {
    backgroundRow.classList.add('background');
    decorateBlockBg(el, backgroundRow, { useHandleFocalpoint: true });
  }

  // New 4-row format: [background] [header] [widget fragment link] [side images]
  if (contentRows.length >= 2 && isFragmentLink(contentRows[0])) {
    await initFragmentVariant(el, marqueeRow, contentRows[0], contentRows[1], getAriaLabels);
    return;
  }

  // Legacy 3-row format: [background] [header] [content with mixed media + widget]
  const [contentRow] = contentRows;
  const isPromptVariant = el.classList.contains('unity-prompt');

  if (isPromptVariant) {
    await initPromptVariant(el, marqueeRow, contentRow, getAriaLabels);
  } else {
    await initUploadVariant(el, marqueeRow, contentRow, getAriaLabels);
  }
}
