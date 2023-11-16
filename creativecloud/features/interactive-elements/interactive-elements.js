import { setLibs } from '../../scripts/utils.js';

const miloLibs = setLibs('/libs');
const { createTag } = await import(`${miloLibs}/utils/utils.js`);
const interactiveCss = await import('./interactive-elements.css', {
  assert: { type: 'css' }
});
document.adoptedStyleSheets = [interactiveCss.default];

const DESKTOP_SIZE = 1200;
const MOBILE_SIZE = 600;

function defineDeviceByScreenSize() {
  const screenWidth = window.innerWidth;
  if (screenWidth >= DESKTOP_SIZE) {
    return 'DESKTOP';
  }
  if (screenWidth <= MOBILE_SIZE) {
    return 'MOBILE';
  }
  return 'TABLET';
}

export function createPromptField(prompt, buttonText, mode, trackingValue = '') {
  const promptField = createTag('div', { id: 'promptbar', class: 'promptbar' });
  let promptInput = '';
  if (mode !== 'genfill') {
    promptInput = createTag('input', { class: 'promptText', id: 'promptinput', placeholder: `${prompt}`, autofocus: 'true', maxlength: '250' });
  }
  const promptButton = createTag('button', { class: 'con-button blue button-xl button-justified-mobile', id: 'promptbutton', 'daa-ll': trackingValue }, `${buttonText}`);

  if (mode === 'light') {
    promptField.classList.add('light');
    promptInput.classList.add('light');
  } else if (mode === 'genfill') {
    promptButton.setAttribute('id', 'genfill');
    promptField.classList.remove('promptbar');
  }
  if (mode !== 'genfill') {
    promptField.append(promptInput);
  }
  promptField.append(promptButton);

  const device = defineDeviceByScreenSize();
  if (device === 'TABLET') {
    promptButton.classList.remove('button-xl');
    if (!promptButton.classList.contains('button-l')) {
      promptButton.classList.add('button-l');
    }
  } else if (device === 'MOBILE') {
    promptButton.classList.remove('button-xl');
    promptButton.classList.remove('button-l');
  } else if (device === 'DESKTOP') {
    if (!promptButton.classList.contains('button-xl')) {
      promptButton.classList.add('button-xl');
    }
    promptButton.classList.remove('button-l');
  }
  return promptField;
}

export function createEnticement(enticementDetail, mode) {
  const enticementDiv = createTag('div');
  const svgImage = createTag('img', { class: 'enticementArrow', alt: '' });
  svgImage.src = enticementDetail.split('|')[1];
  const arrowText = enticementDetail.split('|')[0];
  const enticementText = createTag('h2', { class: 'enticementText heading-l' }, arrowText);
  enticementDiv.appendChild(enticementText);
  enticementDiv.appendChild(svgImage);
  if (mode === 'light') {
    enticementText.classList.add('light');
  }
  return enticementDiv;
}

export function createSelectorTray(interactiveSelections, mode) {
  const options = createTag('div', { class: 'options' });
  [...interactiveSelections].forEach(async (option) => {
    const button = createTag('button', { class: 'options', id: `${option.id}`, 'daa-ll': `${option.analytics}` });
    const span = createTag('span', { class: 'button-text' }, `${option.text}`);
    const svgButton = document.createElement('img', { alt: '' });
    svgButton.src = option.svg.trim();
    svgButton.classList.add('optionsvg');
    const device = defineDeviceByScreenSize();
    if (mode === 'light') {
      button.classList.add('light');
      options.classList.add('light');
    }
    if (((device === 'DESKTOP' || device === 'TABLET') && options.getElementsByTagName('button').length < 4) || (device === 'MOBILE' && options.getElementsByTagName('button').length < 3)) {
      button.prepend(svgButton);
      button.appendChild(span);
      options.append(button);
    }
  });
  options.lastChild.classList.add('last-button');
  return options;
}
