import { createTag } from '../../scripts/utils.js';

function parseStyleLi(li) {
  const picture = li.querySelector('picture');
  if (!picture) return null;
  const clone = li.cloneNode(true);
  clone.querySelector('picture').remove();
  const parts = clone.innerHTML
    .split(/<br\s*\/?>/i)
    .map((p) => {
      const t = document.createElement('span');
      t.innerHTML = p;
      return t.textContent.trim();
    })
    .filter(Boolean);
  return { picture: picture.cloneNode(true), label: parts[0] || '', prompt: parts.slice(1).join(' ').trim() };
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
  return rows.map((row) => {
    const children = [...row.querySelectorAll(':scope > div')];
    return children[children.length - 1]?.querySelector('picture') || null;
  });
}

function buildStyleItem(style, selected) {
  const li = createTag('li', { class: `fsl-style-item${selected ? ' selected' : ''}` });
  li.append(style.picture);
  li.append(createTag('span', { class: 'fsl-style-label' }, style.label));
  return li;
}

function selectStyle(items, promptText, previewArea, styles, previews, idx, skipPrompt = false) {
  items.forEach((item, i) => item.classList.toggle('selected', i === idx));
  if (!skipPrompt) promptText.textContent = styles[idx].prompt;
  const preview = previews[idx];
  if (preview) {
    previewArea.textContent = '';
    previewArea.append(preview.cloneNode(true));
  }
}

const MODEL_MAP = {
  'Firefly Image 3':               { modelId: 'adobe-firefly',     modelVersion: 'image3' },
  'Firefly Image 4 Ultra':         { modelId: 'adobe-firefly',     modelVersion: 'image4_ultra' },
  'Firefly Image 4':               { modelId: 'adobe-firefly',     modelVersion: 'image4_standard' },
  'Firefly Image 5':               { modelId: 'firefly_image',     modelVersion: 'image5' },
  'FLUX.2 [pro]':                  { modelId: 'flux',              modelVersion: 'fluxPro-2' },
  'FLUX.1 Kontext [max]':          { modelId: 'flux',              modelVersion: 'fluxKontextMax' },
  'FLUX.1 Kontext [pro]':          { modelId: 'flux',              modelVersion: 'fluxKontextPro' },
  'FLUX1.1 [pro]':                 { modelId: 'fluxPro',           modelVersion: '1.1' },
  'FLUX1.1 [pro] Ultra Raw':       { modelId: 'fluxUltra',         modelVersion: '1.1', raw: true },
  'FLUX1.1 [pro] Ultra':           { modelId: 'fluxUltra',         modelVersion: '1.1' },
  'Gemini 3.1 (w/ Nano Banana 2)': { modelId: 'gemini-flash',      modelVersion: 'nano-banana-3' },
  'Gemini 2.5 (w/ Nano Banana)':   { modelId: 'gemini-flash',      modelVersion: 'nano-banana' },
  'Gemini 3 (w/ Nano Banana Pro)': { modelId: 'gemini-flash',      modelVersion: 'nano-banana-2' },
  'Imagen 3':                      { modelId: 'imagen',            modelVersion: '3.0-generate-002' },
  'Imagen 4':                      { modelId: 'imagen',            modelVersion: '4.0-generate-preview' },
  'Ideogram 3.0':                  { modelId: 'ideogram',          modelVersion: '3.0-generate' },
  'GPT Image 1':                   { modelId: 'gpt-4o-image',      modelVersion: '' },
  'GPT Image 1.5':                 { modelId: 'gpt-image',         modelVersion: '1.5' },
  'Runway Gen-4 Image':            { modelId: 'runway-gen4-image', modelVersion: '' },
};

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
  const previews = parsePreviews(rows.slice(4, 8));

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
    });
    dropdown.append(item);
  });
  modelSelector.append(dropdown);

  const toggleDropdown = () => {
    const isHidden = dropdown.hasAttribute('hidden');
    if (isHidden) dropdown.removeAttribute('hidden');
    else dropdown.setAttribute('hidden', '');
  };
  modelSelector.addEventListener('click', toggleDropdown);
  modelSelector.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleDropdown(); }
  });

  const generateBtn = createTag('button', { class: 'fsl-generate-btn' });
  if (ctaIcon) generateBtn.append(ctaIcon.cloneNode(true));
  generateBtn.append(document.createTextNode(ctaText));
  generateBtn.addEventListener('click', () => {
    const prompt = `${promptText.textContent.trim()}, ${styles[currentStyleIdx].label}`;
    const modelName = modelDisplay.textContent.trim();
    const { modelId = modelName, modelVersion = '', raw } = MODEL_MAP[modelName] || {};
    const hData = encodeURIComponent(JSON.stringify({
      version: '1.1',
      module: 'ImageGeneration',
      config: {
        type: 'set',
        referrer: 'ACOM',
        prompt,
        modelId,
        modelVersion,
        ...(raw && { raw }),
        generate: false,
      },
    }));
    window.open(`https://firefly.adobe.com/hub?hData=${hData}`, '_blank');
  });

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
  });

  // --- Mount ---
  el.textContent = '';
  el.append(left, right);
}
