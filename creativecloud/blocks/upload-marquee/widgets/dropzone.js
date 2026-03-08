import { createTag } from '../../../scripts/utils.js';

// ===== CONFIG =====
const VIEWPORTS = ['mobile-up', 'tablet-up', 'desktop-up'];
const DEFAULT_DROPZONE_ICON = '/cc-shared/assets/svg/s2-icon-upload-20-n.svg';
const AnalyticsKeys = { uploadAssetCTA: 'Upload asset CTA|UnityWidget' };

let uploadColumnCounter = 0;

// ===== HELPERS =====
function logDropzoneInfo(message) {
  window.lana?.log(message, { tags: 'upload-marquee', errorType: 'i' });
}

function nextUploadColumnId() {
  uploadColumnCounter += 1;
  return uploadColumnCounter;
}

function buildScopedId(prefix, columnId) {
  return `${prefix}-${columnId}`;
}

export function applyViewportClasses(row) {
  if (row.childElementCount === 2 || row.childElementCount === 3) {
    [...row.children].forEach((child, index) => {
      child.classList.add('upload-grid', VIEWPORTS[index]);
      if (row.childElementCount === 2 && index === 1) {
        child.className = 'upload-grid tablet-up desktop-up';
      }
    });
  } else if (row.childElementCount === 1) {
    row.firstElementChild?.classList.add(...VIEWPORTS);
  }
}

// ===== DOM BUILDERS =====
function buildDropZoneIcon() {
  const defaultIcon = createTag('p', { class: 'drop-zone-default-icon' });
  const image = createTag('img', { src: DEFAULT_DROPZONE_ICON, alt: '' });
  defaultIcon.setAttribute('aria-hidden', 'true');
  defaultIcon.append(image);
  return defaultIcon;
}

function extractContentParts(content) {
  const terms = content.querySelector('p:last-child');

  const hasUploadMarker = (para) => para.querySelector(
    'span[class*=icon-share], span[class*=icon-upload], img[src$=".svg"]',
  );

  const candidateParagraphs = [
    ...content.querySelectorAll('p:not(:last-child)'),
  ].filter(
    (para) => para.textContent.trim() !== '' || para.querySelector('img, svg'),
  );

  const uploadPara = candidateParagraphs.find((para) => hasUploadMarker(para));
  const textParas = candidateParagraphs.filter((para) => para !== uploadPara);

  return {
    terms,
    uploadPara,
    contentParagraphs: candidateParagraphs,
    headingPara: textParas[0],
    bodyPara: textParas[1],
  };
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
    id: buildScopedId('file-upload', columnId),
    class: 'file-upload hide',
    accept: 'image/*',
    'aria-label': `${buttonLabel} ${filePickerAriaSuffix}`,
  });

  para.classList.add('upload-action-container');
  para.textContent = '';
  para.append(button, input);
  return { fileInput: input };
}

function wireDropZoneAccessibility(dropZone, fileInput, describedByIds, dropZoneAriaLabel) {
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

async function buildDropZone(parts, columnId, getAriaLabels) {
  const { dropZoneAriaLabel } = await getAriaLabels();
  const dropZone = createTag('div', { class: 'drop-zone' });
  const { fileInput } = await buildUploadActionControls(
    parts.uploadPara,
    columnId,
    getAriaLabels,
  );
  const describedByIds = assignDropZoneTextIds(parts.headingPara, parts.bodyPara, columnId);
  wireDropZoneAccessibility(dropZone, fileInput, describedByIds, dropZoneAriaLabel);
  dropZone.append(buildDropZoneIcon(), ...parts.contentParagraphs);
  return dropZone;
}

// ===== DRAG AND DROP =====
export function setupLayoutDragAndDrop(layout, uploadsWrapper) {
  let activeDropZone;

  const setActiveDropZone = () => {
    const dropZones = [
      ...uploadsWrapper.querySelectorAll(':scope > .drop-zone-container > .drop-zone'),
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
        // Some browsers do not allow assigning FileList directly.
      }
      fileInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
    clearActiveDropZone();
  });

  uploadsWrapper.querySelectorAll('.drop-zone').forEach((zone) => {
    zone.addEventListener('drop', () => clearActiveDropZone());
  });

  window.addEventListener('drop', () => clearActiveDropZone());
  window.addEventListener('dragend', () => clearActiveDropZone());
}

// ===== COLUMN DECORATOR =====
async function decorateDropzoneColumn(column, getAriaLabels) {
  const columnId = nextUploadColumnId();
  const parts = extractContentParts(column);

  if (!parts.uploadPara) {
    logDropzoneInfo('No upload action found in dropzone fragment column.');
    return null;
  }

  const dropZone = await buildDropZone(parts, columnId, getAriaLabels);
  const dropZoneContainer = createTag('div', { class: 'drop-zone-container' });
  const viewportClasses = [...column.classList].filter((cls) => VIEWPORTS.includes(cls));
  dropZoneContainer.classList.add(...viewportClasses);
  dropZoneContainer.append(dropZone);

  if (parts.terms) {
    dropZoneContainer.append(parts.terms);
  }

  return dropZoneContainer;
}

// ===== DEFAULT EXPORT =====
export default async function decorate(block, getAriaLabels) {
  const contentRow = block.firstElementChild;
  if (!contentRow) return null;

  applyViewportClasses(contentRow);

  const uploadsWrapper = createTag('div', { class: 'upload-marquee-uploads' });

  for (let i = 0; i < contentRow.children.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    const dropZoneContainer = await decorateDropzoneColumn(contentRow.children[i], getAriaLabels);
    if (dropZoneContainer) uploadsWrapper.append(dropZoneContainer);
  }

  if (!uploadsWrapper.children.length) return null;

  return {
    element: uploadsWrapper,
    setupInteraction: (layout) => setupLayoutDragAndDrop(layout, uploadsWrapper),
  };
}
