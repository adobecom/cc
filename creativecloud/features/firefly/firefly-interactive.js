import { setLibs } from '../../scripts/utils.js';

const miloLibs = setLibs('/libs');
const { createTag } = await import(`${miloLibs}/utils/utils.js`);
const { createSelectorTray, createEnticement, createPromptField } = await import('../interactive-elements/interactive-elements.js');

function eventOnGenerate(generateButton, media) {
  generateButton.addEventListener('click', async () => {
    const textToImageButton = media.querySelector('#TextToImage');
    const textEffectsButton = media.querySelector('#TextEffects');
    let prompt = '';
    let promptDefault = false;
    const userprompt = media.querySelector('.promptText')?.value;
    const placeholderprompt = media.querySelector('.promptText')?.getAttribute('placeholder');
    if (userprompt === '') {
      promptDefault = true;
      prompt = placeholderprompt;
    } else {
      prompt = userprompt;
    }
    if (textToImageButton.classList.contains('selected')) {
      if (promptDefault) {
        generateButton.setAttribute('daa-ll', 'SubmitTextToImage');
      } else {
        generateButton.setAttribute('daa-ll', 'SubmitTextToImageUserContent');
      }
      const { signIn } = await import('./firefly-susi.js');
      signIn(prompt, 'goToFirefly');
    }
    if (textEffectsButton.classList.contains('selected')) {
      if (promptDefault) {
        generateButton.setAttribute('daa-ll', 'SubmitTextEffects');
      } else {
        generateButton.setAttribute('daa-ll', 'SubmitTextEffectsUserContent');
      }
      // eslint-disable-next-line import/no-cycle
      const { signIn } = await import('./firefly-susi.js');
      signIn(prompt, 'goToFireflyEffects');
    }
  });
}

function createGenFillPrompt(element) {
  const genfillPrompt = createTag('div', { class: 'genfillPrompt' });
  const prompt = createTag('p');
  prompt.innerText = `${element?.innerText?.split('|')[0].split('(')[0]}`;
  genfillPrompt.appendChild(prompt);
  const promptText = createTag('p', { class: 'genfillPromptUsed' });
  promptText.innerText = `${element?.innerText?.split('|')[0].split('(')[1].replaceAll(')', '')}`;
  genfillPrompt.appendChild(promptText);
  return genfillPrompt;
}

export default function setInteractiveFirefly(media) {
  //const media = el.querySelector('.media');

  const allP = media.querySelectorAll('p');
  const enticementMode = allP[0].innerText.split('(')[1]?.replaceAll(')', '');
  const selectorTrayMode = allP[2].innerText.split('(')[1]?.replaceAll(')', '');
  const interactiveElemsText = Array.from(allP);
  [...allP].forEach(async (elem) => {
    if (elem.querySelector('strong')) {
      elem.remove();
      const index = interactiveElemsText.indexOf(elem);
      interactiveElemsText.splice(index, 1);
    }
  });

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
  let j = 4;
  for (let i = 0; i <= interactiveElemsText.length - 2;) {
    const optionPromptMode = allP[j].innerText.split('(')[1]?.replaceAll(')', '');
    const option = {
      id: `${interactiveElemsText[i].innerText.split('|')[0]}`,
      text: `${interactiveElemsText[i].innerText.split('|')[1]}`,
      svg: `${interactiveElemsText[i].innerText.split('|')[2]}`,
      analytics: `Select${interactiveElemsText[i].innerText.split('|')[0]}`,
      pos: i + 2,
      promptmode: `${optionPromptMode}`,
    };
    i += 3;
    j += 6;
    selections.push(option);
  }

  let textToImagePos = 0;
  let genFillPos = 0;
  let textEffectPos = 0;
  let ttiPromptMode = '';
  let genfillPromptMode = '';
  let tePromptMode = '';
  selections.forEach((item) => {
    if (item.id === 'TextToImage') {
      textToImagePos = item.pos;
      ttiPromptMode = item.promptmode;
    } else if (item.id === 'GenerativeFill') {
      genFillPos = item.pos;
      genfillPromptMode = item.promptmode;
    } else if (item.id === 'TextEffects') {
      textEffectPos = item.pos;
      tePromptMode = item.promptmode;
    }
  });

  const fireflyOptions = createSelectorTray(selections, selectorTrayMode);
  fireflyOptions.classList.add('fireflySelectorTray');
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

  const genfillPrompt = createGenFillPrompt(interactiveElemsText[genFillPos - 1]);

  // Create prompt field
  let fireflyPrompt = '';
  if (firstOption.getAttribute('id') === 'TextToImage') {
    fireflyPrompt = createPromptField(`${interactiveElemsText[textToImagePos - 1].innerText.split('|')[0]}`, `${interactiveElemsText[textToImagePos - 1].innerText.split('|')[1]}`, ttiPromptMode);
    fireflyPrompt.classList.add('fireflyPrompt');
    media.appendChild(fireflyPrompt);
    const generateButton = media.querySelector('#promptbutton');
    eventOnGenerate(generateButton, media);
  } else if (firstOption.getAttribute('id') === 'TextEffects') {
    fireflyPrompt = createPromptField(`${interactiveElemsText[textEffectPos - 1].innerText.split('|')[0]}`, `${interactiveElemsText[textEffectPos - 1].innerText.split('|')[1]}`, tePromptMode);
    fireflyPrompt.classList.add('fireflyPrompt');
    media.appendChild(fireflyPrompt);
    const generateButton = media.querySelector('#promptbutton');
    eventOnGenerate(generateButton, media);
  } else if (firstOption.getAttribute('id') === 'GenerativeFill') {
    fireflyPrompt = createPromptField(`${interactiveElemsText[genFillPos - 1].innerText.split('|')[0]}`, `${interactiveElemsText[genFillPos - 1].innerText.split('|')[1]}`, genfillPromptMode);
    fireflyPrompt.classList.add('genfillPromptBar');
    media.appendChild(genfillPrompt);
    media.appendChild(fireflyPrompt);
    const genFillButton = media.querySelector('#genfill');
    genFillButton.addEventListener('click', async () => {
      const { signIn } = await import('./firefly-susi.js');
      signIn('', 'goToFireflyGenFill');
    });
  }

  /* Handle action on click of each firefly option button */

  textToImageButton.addEventListener('click', () => {
    textToImageButton.classList.add('selected');
    generativeFillButton.classList.remove('selected');
    textEffectsButton.classList.remove('selected');
    textToImageButton.querySelector('img').classList.add('svgselected');

    textEffectsButton.querySelector('img').classList.remove('svgselected');
    generativeFillButton.querySelector('img').classList.remove('svgselected');

    if (media.querySelector('.genfillPrompt')) {
      media.removeChild(genfillPrompt);
    }

    if (media.querySelector('#tryGenFill')) {
      media.removeChild(media.querySelector('#tryGenFill'));
    }

    interactiveElemsText[textToImagePos].classList.remove('hide');
    interactiveElemsText[genFillPos].classList.add('hide');
    interactiveElemsText[textEffectPos].classList.add('hide');

    const genFillButtonTemp = media.querySelector('#genfill');
    if (genFillButtonTemp) genFillButtonTemp.remove();
    const fireflyPromptTemp = media.querySelector('#promptbar');
    if (fireflyPromptTemp) {
      fireflyPromptTemp.remove();
    }
    const textToImagePrompt = createPromptField(`${interactiveElemsText[textToImagePos - 1].innerText.split('|')[0]}`, `${interactiveElemsText[textToImagePos - 1].innerText.split('|')[1]}`, ttiPromptMode);
    textToImagePrompt.classList.add('fireflyPrompt');
    media.appendChild(textToImagePrompt);
    const generateButton = media.querySelector('#promptbutton');
    eventOnGenerate(generateButton, media);
  });

  generativeFillButton.addEventListener('click', () => {
    textToImageButton.classList.remove('selected');
    generativeFillButton.classList.add('selected');
    textEffectsButton.classList.remove('selected');
    generativeFillButton.querySelector('img').classList.add('svgselected');

    textEffectsButton.querySelector('img').classList.remove('svgselected');
    textToImageButton.querySelector('img').classList.remove('svgselected');

    interactiveElemsText[textToImagePos].classList.add('hide');
    interactiveElemsText[genFillPos].classList.remove('hide');
    interactiveElemsText[textEffectPos].classList.add('hide');

    const fireflyPromptTemp = media.querySelector('#promptbar');
    if (fireflyPromptTemp) {
      fireflyPromptTemp.remove();
    }
    fireflyPrompt = createPromptField(`${interactiveElemsText[genFillPos - 1].innerText.split('|')[0]}`, `${interactiveElemsText[genFillPos - 1].innerText.split('|')[1]}`, genfillPromptMode, 'SubmitGenerativeFill');
    fireflyPrompt.classList.add('genfillPromptBar');
    media.appendChild(fireflyPrompt);
    const genFillButton = media.querySelector('#genfill');
    genFillButton.addEventListener('click', async () => {
      const { signIn } = await import('./firefly-susi.js');
      signIn('', 'goToFireflyGenFill');
    });
    media.appendChild(genfillPrompt);
  });

  textEffectsButton.addEventListener('click', () => {
    textToImageButton.classList.remove('selected');
    generativeFillButton.classList.remove('selected');
    textEffectsButton.classList.add('selected');
    textEffectsButton.querySelector('img').classList.add('svgselected');

    generativeFillButton.querySelector('img').classList.remove('svgselected');
    textToImageButton.querySelector('img').classList.remove('svgselected');

    if (media.querySelector('.genfillPrompt')) {
      media.removeChild(genfillPrompt);
    }

    if (media.querySelector('#tryGenFill')) {
      media.removeChild(media.querySelector('#tryGenFill'));
    }

    interactiveElemsText[textToImagePos].classList.add('hide');
    interactiveElemsText[genFillPos].classList.add('hide');
    interactiveElemsText[textEffectPos].classList.remove('hide');

    const genFillButtonTemp = media.querySelector('#genfill');
    if (genFillButtonTemp) genFillButtonTemp.remove();
    const fireflyPromptTemp = media.querySelector('#promptbar');
    if (fireflyPromptTemp) {
      fireflyPromptTemp.remove();
    }
    const textEffectPrompt = createPromptField(`${interactiveElemsText[textEffectPos - 1].innerText.split('|')[0]}`, `${interactiveElemsText[textEffectPos - 1].innerText.split('|')[1]}`, tePromptMode);
    textEffectPrompt.classList.add('fireflyPrompt');
    media.appendChild(textEffectPrompt);
    const generateButton = media.querySelector('#promptbutton');
    eventOnGenerate(generateButton, media);
  });
}
