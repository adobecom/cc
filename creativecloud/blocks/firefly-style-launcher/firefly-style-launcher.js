import { createTag } from '../../scripts/utils.js';

// ===== CONFIG =====

const PREVIEW_IMG_PARAMS = {
  webpLarge: 'width=1000&format=webply&optimize=medium',
  webpSmall: 'width=500&format=webply&optimize=medium',
  jpgLarge: 'width=1000&format=jpg&optimize=medium',
  jpgSmall: 'width=500&format=jpg&optimize=medium',
};

// Max number of preview rows consumed after the styles row
const MAX_PREVIEW_ROWS = 4;

// ===== UTILITIES =====

function getBaseImageUrlFromPicture(picture) {
  const img = picture?.querySelector('img');
  const src = img?.src;
  if (src) return { baseUrl: src.split('?')[0], img };
  const srcset = picture?.querySelector('source[srcset]')?.srcset;
  if (!srcset) return null;
  const url = srcset.split(',')[0].trim().split(/\s+/)[0];
  const baseUrl = url ? url.split('?')[0] : null;
  return baseUrl && img ? { baseUrl, img } : null;
}

// Rewrites a picture's sources to use optimised params.
// Pass overrideBaseUrl when the picture's src/srcset has already been stripped (deferred previews).
function rewritePreviewPicture(picture, isFirst, overrideBaseUrl) {
  const result = overrideBaseUrl
    ? { baseUrl: overrideBaseUrl, img: picture.querySelector('img') }
    : getBaseImageUrlFromPicture(picture);
  if (!result?.baseUrl || !result?.img) return;
  const { baseUrl, img } = result;
  picture.textContent = '';
  picture.append(
    createTag('source', { type: 'image/webp', srcset: `${baseUrl}?${PREVIEW_IMG_PARAMS.webpLarge}`, media: '(min-width: 600px)' }),
    createTag('source', { type: 'image/webp', srcset: `${baseUrl}?${PREVIEW_IMG_PARAMS.webpSmall}` }),
    createTag('source', { type: 'image/jpeg', srcset: `${baseUrl}?${PREVIEW_IMG_PARAMS.jpgLarge}`, media: '(min-width: 600px)' }),
  );
  img.setAttribute('src', `${baseUrl}?${PREVIEW_IMG_PARAMS.jpgSmall}`);
  img.removeAttribute('loading');
  img.removeAttribute('fetchpriority');
  if (isFirst) {
    img.setAttribute('loading', 'eager');
    img.setAttribute('fetchpriority', 'high');
  } else {
    img.setAttribute('loading', 'lazy');
  }
  picture.append(img);
}

// ===== DOM PARSING =====

function parseStyleLi(li) {
  const picture = li.querySelector('picture');
  if (!picture) return null;
  picture.remove();
  const parts = li.innerHTML
    .split(/<br\s*\/?>/i)
    .map((p) => {
      const t = document.createElement('span');
      t.innerHTML = p;
      return t.textContent.trim();
    })
    .filter(Boolean);
  return { picture, label: parts[0] || '', prompt: parts.slice(1).join(' ').trim() };
}

function parseStyles(row) {
  const styles = [];
  [...row.querySelectorAll('ul > li')].forEach((li) => {
    const result = parseStyleLi(li);
    if (result) {
      styles.push(result);
    } else if (styles.length && !styles[styles.length - 1].prompt) {
      styles[styles.length - 1].prompt = li.textContent.trim();
    }
  });
  return styles;
}

function parsePreviews(rows) {
  return rows.map((row, i) => {
    const children = [...row.querySelectorAll(':scope > div')];
    const picture = children[children.length - 1]?.querySelector('picture') || null;
    if (!picture) return null;
    if (i === 0) {
      rewritePreviewPicture(picture, true);
      return picture;
    }
    // Defer: strip src/srcset, store base URL for on-demand rewrite
    const baseResult = getBaseImageUrlFromPicture(picture);
    if (baseResult?.baseUrl) picture.dataset.previewBaseUrl = baseResult.baseUrl;
    picture.querySelectorAll('source').forEach((s) => s.removeAttribute('srcset'));
    const deferImg = picture.querySelector('img');
    if (deferImg) { deferImg.removeAttribute('src'); deferImg.removeAttribute('srcset'); }
    return picture;
  });
}

// ===== DOM BUILDING =====

function buildStyleItem(style, selected) {
  const li = createTag('li', { class: `fsl-style-item${selected ? ' selected' : ''}`, tabindex: '0' });
  li.append(style.picture);
  // Style thumbnails are above-the-fold; load them eagerly for perceived performance
  const img = style.picture.querySelector('img');
  if (img) {
    img.setAttribute('loading', 'eager');
    img.setAttribute('fetchpriority', 'high');
  }
  li.append(createTag('span', { class: 'fsl-style-label' }, style.label));
  return li;
}

// ===== STATE & INTERACTION =====

function selectStyle(items, promptText, previewArea, styles, previews, idx, skipPrompt = false) {
  items.forEach((item, i) => item.classList.toggle('selected', i === idx));
  if (!skipPrompt) promptText.textContent = styles[idx].prompt;
  const preview = previews[idx];
  if (preview) {
    previewArea.textContent = '';
    const clone = preview.cloneNode(true);
    // eslint-disable-next-line max-len
    if (clone.dataset.previewBaseUrl) rewritePreviewPicture(clone, true, clone.dataset.previewBaseUrl);
    previewArea.append(clone);
  }
}

// ===== INIT =====

export default function init(el) {
  const rows = [...el.querySelectorAll(':scope > div')];
  if (rows.length < 4) return;

  // --- Parse DOM ---
  const promptLabelText = rows[0].querySelector(':scope > div:last-child')?.textContent.trim() || '';
  const promptLabelIcon = rows[0].querySelector('.icon');

  const modelIcon = rows[1].querySelector('.icon');
  const modelNames = [...rows[1].querySelectorAll('ul > li')].map((li) => li.textContent.trim());

  const ctaIcon = rows[2].querySelector('.icon');
  const ctaText = rows[2].querySelector(':scope > div:last-child')?.textContent.trim() || 'Generate';

  const styles = parseStyles(rows[3]);
  const previews = parsePreviews(rows.slice(4, 4 + MAX_PREVIEW_ROWS));

  if (!styles.length) return;

  // --- Build left panel ---
  const left = createTag('div', { class: 'fsl-left' });

  const promptArea = createTag('div', { class: 'fsl-prompt-area' });
  const promptLabel = createTag('div', { class: 'fsl-prompt-label' });
  if (promptLabelIcon) promptLabel.append(promptLabelIcon.cloneNode(true));
  promptLabel.append(document.createTextNode(promptLabelText));
  const promptText = createTag('div', { class: 'fsl-prompt-text', contenteditable: 'true' }, styles[0].prompt);
  promptArea.append(promptLabel, promptText);

  let userEdited = false;
  let restoreTimer = null;
  let currentStyleIdx = 0;

  promptText.addEventListener('input', () => {
    userEdited = true;
    clearTimeout(restoreTimer);
    if (promptText.textContent.trim() === '') {
      restoreTimer = setTimeout(() => {
        promptText.textContent = styles[currentStyleIdx].prompt;
        userEdited = false;
      }, 5000);
    }
  });

  const controls = createTag('div', { class: 'fsl-controls' });

  const modelSelector = createTag('div', { class: 'fsl-model-selector', role: 'button', tabindex: '0' });
  if (modelIcon) modelSelector.append(modelIcon.cloneNode(true));
  modelSelector.append(createTag('span', { class: 'fsl-model-name' }, modelNames[0] || ''));
  modelSelector.append(createTag('span', { class: 'fsl-chevron', 'aria-hidden': 'true' }));

  const modelDisplay = modelSelector.querySelector('.fsl-model-name');
  const dropdown = createTag('ul', { class: 'fsl-model-dropdown', hidden: '' });
  modelNames.forEach((name) => {
    const item = createTag('li', {}, name);
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      modelDisplay.textContent = name;
      dropdown.setAttribute('hidden', '');
      modelSelector.classList.remove('open');
    });
    dropdown.append(item);
  });
  modelSelector.append(dropdown);

  const toggleDropdown = () => {
    const isHidden = dropdown.hasAttribute('hidden');
    if (isHidden) {
      dropdown.removeAttribute('hidden');
      modelSelector.classList.add('open');
    } else {
      dropdown.setAttribute('hidden', '');
      modelSelector.classList.remove('open');
    }
  };
  modelSelector.addEventListener('click', toggleDropdown);
  modelSelector.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleDropdown(); }
  });

  const generateBtn = createTag('button', { class: 'fsl-generate-btn' });
  if (ctaIcon) generateBtn.append(ctaIcon.cloneNode(true));
  generateBtn.append(document.createTextNode(ctaText));

  controls.append(modelSelector, generateBtn);

  const stylesArea = createTag('div', { class: 'fsl-styles-area' });
  const heading = rows[3].querySelector('h4');
  if (heading) stylesArea.append(heading.cloneNode(true));

  const styleList = createTag('ul', { class: 'fsl-style-list' });
  const styleItems = styles.map((style, i) => buildStyleItem(style, i === 0));
  styleItems.forEach((item) => styleList.append(item));
  stylesArea.append(styleList);

  left.append(promptArea, controls, createTag('div', { class: 'fsl-divider' }), stylesArea);

  // --- Build right panel ---
  const right = createTag('div', { class: 'fsl-right' });
  const previewArea = createTag('div', { class: 'fsl-preview' });
  if (previews[0]) previewArea.append(previews[0].cloneNode(true));
  right.append(previewArea);

  // --- Wire style selection ---
  styleItems.forEach((item, i) => {
    item.addEventListener('click', () => {
      currentStyleIdx = i;
      selectStyle(styleItems, promptText, previewArea, styles, previews, i, userEdited);
    });
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        currentStyleIdx = i;
        selectStyle(styleItems, promptText, previewArea, styles, previews, i, userEdited);
      }
    });
  });

  // --- Mount ---
  el.textContent = '';
  el.append(left, right);
}
