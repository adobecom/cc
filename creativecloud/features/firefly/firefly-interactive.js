import { setLibs } from '../../scripts/utils.js';

const miloLibs = setLibs('/libs');
const { createTag } = await import(`${miloLibs}/utils/utils.js`);
const { createSelectorTray, createEnticement, createPromptField } = await import('../interactive-elements/interactive-elements.js');

let interactiveElemsText;
let media;
function eventOnGenerate(generateButton) {
  const btnConfigs = {
    TextToImage: ['SubmitTextToImage', 'SubmitTextToImageUserContent', 'goToFirefly'],
    TextEffects: ['SubmitTextEffects', 'SubmitTextEffectsUserContent', 'goToFireflyEffects'],
  };
  generateButton.addEventListener('click', async (e) => {
    const userprompt = media.querySelector('.promptText')?.value;
    const placeholderprompt = media.querySelector('.promptText')?.getAttribute('placeholder');
    const prompt = userprompt || placeholderprompt;
    const selected = media.querySelector('.selected');
    if (Object.keys(btnConfigs).includes(selected.id)) {
      const btnConfig = btnConfigs[selected.id];
      const dall = userprompt === '' ? btnConfig[0] : btnConfig[1];
      e.target.setAttribute('daa-ll', dall);
      const { signIn } = await import('./firefly-susi.js');
      signIn(prompt, btnConfig[2]);
    }
  });
}

function createGenFillPrompt(element) {
  const genfillPrompt = createTag('div', { class: 'genfill-prompt' });
  const promptConfig = element?.innerText?.split('|')[0].split('(');
  const prompt = createTag('p', '', `${promptConfig[0]}`);
  const promptText = createTag('p', { class: 'genfill-promptused' }, `${promptConfig[1].replaceAll(')', '')}`);
  genfillPrompt.append(prompt, promptText);
  return genfillPrompt;
}

function hideRemoveElements(option) {
  const selector = media.querySelector('.firefly-selectortray');
  [...selector.childNodes].forEach((el) => {
    if (el.id === option.id) {
      el.querySelector('img').classList.add('svgselected');
      el.classList.add('selected');
    } else {
      el.classList.remove('selected');
      el.querySelector('img').classList.remove('svgselected');
    }
  });
  if (option.id === 'TextToImage' || option.id === 'TextEffects') {
    media.querySelector('.genfill-prompt')?.remove();
    media.querySelector('#tryGenFill')?.remove();
    media.querySelector('#genfill')?.remove();
    media.querySelector('#promptbar')?.remove();
  } else if (option.id === 'GenerativeFill') {
    media.querySelector('#promptbar')?.remove();
  }
}

export default function setInteractiveFirefly(el) {
  const buttons = el.querySelectorAll('.con-button');
  [...buttons].forEach((button) => { if (button.innerText.includes('Firefly')) button.setAttribute('daa-ll', 'getfirefly'); });
  media = el.querySelector('.media');
  const allStrong = media.querySelectorAll('p:not(:empty) strong');
  [...allStrong].forEach((s) => s.remove());
  interactiveElemsText = media.querySelectorAll('p:not(:empty');
  const enticementMode = allStrong[0].innerText.split('(')[1]?.replaceAll(')', '');
  const selectorTrayMode = allStrong[2].innerText.split('(')[1]?.replaceAll(')', '');

  // Remove the prompt and option text for media
  interactiveElemsText[0].remove();
  interactiveElemsText[1].remove();
  interactiveElemsText[3].remove();
  interactiveElemsText[4].remove();
  interactiveElemsText[6].remove();
  interactiveElemsText[7].remove();

  // Set Enticement
  const enticement = media.querySelector('h2');
  const enticementDiv = createEnticement(enticement.innerText, enticementMode);
  enticement.classList.add('hide');
  media.appendChild(enticementDiv, media.firstChild);

  // Set InteractiveSelection
  const selections = [];
  let j = 3;
  for (let i = 0; i <= interactiveElemsText.length - 2;) {
    const optionPromptMode = allStrong[j].innerText.split('(')[1]?.replaceAll(')', '');
    const selectorValues = interactiveElemsText[i].innerText.split('|');
    const option = {
      id: `${selectorValues[0]}`,
      text: `${selectorValues[1]}`,
      svg: `${selectorValues[2]}`,
      analytics: `Select${selectorValues[0]}`,
      pos: i + 2,
      promptmode: `${optionPromptMode}`,
    };
    i += 3;
    j += 3;
    selections.push(option);
  }
  const textToImageDetail = {};
  const genFillDetail = {};
  const textEffectDetail = {};
  selections.forEach((item) => {
    if (item.id === 'TextToImage') {
      textToImageDetail.pos = item.pos;
      textToImageDetail.promptmode = item.promptmode;
    } else if (item.id === 'GenerativeFill') {
      genFillDetail.pos = item.pos;
      genFillDetail.promptmode = item.promptmode;
    } else if (item.id === 'TextEffects') {
      textEffectDetail.pos = item.pos;
      textEffectDetail.promptmode = item.promptmode;
    }
  });

  const fireflyOptions = createSelectorTray(selections, selectorTrayMode);
  fireflyOptions.classList.add('firefly-selectortray');
  media.append(fireflyOptions);

  const textToImageButton = media.querySelector('#TextToImage');
  const generativeFillButton = media.querySelector('#GenerativeFill');
  const textEffectsButton = media.querySelector('#TextEffects');
  const firstOption = media.querySelector('.options > button');

  firstOption.classList.add('selected');
  firstOption.querySelector('img').classList.add('svgselected');

  // Set the default image
  interactiveElemsText[5].classList.add('hide');
  interactiveElemsText[8].classList.add('hide');

  const genfillPrompt = createGenFillPrompt(interactiveElemsText[genFillDetail.pos - 1]);

  // Create prompt field for firt option on page load
  let fireflyPrompt = '';
  const firstOptionDetail = interactiveElemsText[1].innerText.split('|');
  const firstOptionPromptMode = allStrong[3].innerText.split('(')[1]?.replaceAll(')', '');
  fireflyPrompt = createPromptField(`${firstOptionDetail[0]}`, `${firstOptionDetail[1]}`, firstOptionPromptMode);
  if (firstOption.getAttribute('id') === 'TextToImage' || firstOption.getAttribute('id') === 'TextEffects') {
    fireflyPrompt.classList.add('firefly-prompt');
    media.appendChild(fireflyPrompt);
    const generateButton = media.querySelector('#promptbutton');
    eventOnGenerate(generateButton);
  } else if (firstOption.getAttribute('id') === 'GenerativeFill') {
    fireflyPrompt.classList.add('genfill-promptbar');
    media.append(genfillPrompt, fireflyPrompt);
    const genFillButton = media.querySelector('#genfill');
    genFillButton.addEventListener('click', async () => {
      const { signIn } = await import('./firefly-susi.js');
      signIn('', 'goToFireflyGenFill');
    });
  }

  /* Handle action on click of each firefly option button */

  textToImageButton.addEventListener('click', () => {
    hideRemoveElements(textToImageButton);
    interactiveElemsText[textToImageDetail.pos].classList.remove('hide');
    interactiveElemsText[genFillDetail.pos].classList.add('hide');
    interactiveElemsText[textEffectDetail.pos].classList.add('hide');
    const promptDetail = interactiveElemsText[textToImageDetail.pos - 1].innerText.split('|');
    const textToImagePrompt = createPromptField(`${promptDetail[0]}`, `${promptDetail[1]}`, textToImageDetail.promptmode);
    textToImagePrompt.classList.add('firefly-prompt');
    media.appendChild(textToImagePrompt);
    const generateButton = media.querySelector('#promptbutton');
    eventOnGenerate(generateButton);
  });

  generativeFillButton.addEventListener('click', () => {
    hideRemoveElements(generativeFillButton);
    interactiveElemsText[textToImageDetail.pos].classList.add('hide');
    interactiveElemsText[genFillDetail.pos].classList.remove('hide');
    interactiveElemsText[textEffectDetail.pos].classList.add('hide');
    const promptDetail = interactiveElemsText[genFillDetail.pos - 1].innerText.split('|');
    fireflyPrompt = createPromptField(`${promptDetail[0]}`, `${promptDetail[1]}`, genFillDetail.promptmode, 'SubmitGenerativeFill');
    fireflyPrompt.classList.add('genfill-promptbar');
    media.appendChild(fireflyPrompt);
    const genFillButton = media.querySelector('#genfill');
    genFillButton.addEventListener('click', async () => {
      const { signIn } = await import('./firefly-susi.js');
      signIn('', 'goToFireflyGenFill');
    });
    media.appendChild(genfillPrompt);
  });

  textEffectsButton.addEventListener('click', () => {
    hideRemoveElements(textEffectsButton);
    interactiveElemsText[textToImageDetail.pos].classList.add('hide');
    interactiveElemsText[genFillDetail.pos].classList.add('hide');
    interactiveElemsText[textEffectDetail.pos].classList.remove('hide');
    const promptDetail = interactiveElemsText[textEffectDetail.pos - 1].innerText.split('|');
    const textEffectPrompt = createPromptField(`${promptDetail[0]}`, `${promptDetail[1]}`, textEffectDetail.promptmode);
    textEffectPrompt.classList.add('firefly-prompt');
    media.appendChild(textEffectPrompt);
    const generateButton = media.querySelector('#promptbutton');
    eventOnGenerate(generateButton);
  });
}
