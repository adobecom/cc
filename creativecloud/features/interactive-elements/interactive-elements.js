import { setLibs } from '../../scripts/utils.js';

const miloLibs = setLibs('/libs');
const { createTag } = await import(`${miloLibs}/utils/utils.js`);
const { default: defineDeviceByScreenSize } = await import('../../scripts/decorate.js');

export function createPromptField(prompt, buttonText, mode, trackingValue = '') {
  const promptField = createTag('div', { id: 'promptbar', class: 'promptbar' });
  let promptInput = '';
  if (mode !== 'genfill') promptInput = createTag('input', { class: 'prompt-text', id: 'promptinput', placeholder: `${prompt}`, autofocus: 'true', maxlength: '250' });
  const promptButton = createTag('button', { class: 'con-button blue button-justified-mobile', id: 'promptbutton', 'daa-ll': trackingValue }, `${buttonText}`);

  if (mode === 'light') {
    promptField.classList.add('light');
    promptInput.classList.add('light');
  } else if (mode === 'genfill') {
    promptButton.setAttribute('id', 'genfill');
    promptField.classList.remove('promptbar');
  }
  if (mode !== 'genfill') promptField.append(promptInput);
  promptField.append(promptButton);

  const device = defineDeviceByScreenSize();
  if (device === 'TABLET') promptButton.classList.add('button-l');
  else if (device === 'DESKTOP') promptButton.classList.add('button-xl');
  return promptField;
}

export function createEnticement(enticementDetail, mode) {
  const enticementDiv = createTag('div');
  const svgImage = createTag('img', { class: 'enticement-arrow', alt: '' });
  let arrowText;
  [arrowText, svgImage.src] = enticementDetail.split('|');
  const enticementText = createTag('h2', { class: 'enticement-text heading-l' }, arrowText);
  enticementDiv.append(enticementText, svgImage);
  if (mode === 'light') enticementText.classList.add('light');
  return enticementDiv;
}

export function createSelectorTray(interactiveSelections, mode) {
  const options = createTag('div', { class: 'options' });
  [...interactiveSelections].forEach(async (option) => {
    const button = createTag('button', { class: 'options', id: `${option.id}`, 'daa-ll': `${option.analytics}` });
    const span = createTag('span', { class: 'button-text' }, `${option.text}`);
    const svgButton = createTag('img', { alt: '', class: 'optionsvg' });
    svgButton.src = option.svg.trim();
    const device = defineDeviceByScreenSize();
    if (mode === 'light') {
      button.classList.add('light');
      options.classList.add('light');
    }
    const buttonCount = options.querySelectorAll('button').length;
    if (((device === 'DESKTOP' || device === 'TABLET') && buttonCount < 4) || (device === 'MOBILE' && buttonCount < 3)) {
      button.prepend(svgButton);
      button.appendChild(span);
      options.append(button);
    }
  });
  options.lastChild.classList.add('last-button');
  return options;
}
