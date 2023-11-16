import { setLibs } from '../../scripts/utils.js';

const miloLibs = setLibs('/libs');
const { createTag, loadStyle } = await import(`${miloLibs}/utils/utils.js`);
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
  prompt.innerText = `${element?.innerText?.split('|')[0].split('(')[0]}`
  genfillPrompt.appendChild(prompt);
  const promptText = createTag('p', { class: 'genfillPromptUsed' });
  promptText.innerText = `${element?.innerText?.split('|')[0].split('(')[1].replaceAll(')', '')}`;
  genfillPrompt.appendChild(promptText);
  return genfillPrompt;
}

export function setInteractiveFirefly(media) {

  // Get all the element from media div
  const allP = media.querySelectorAll('p');
  const enticementMode = allP[0].innerText.split('(')[1]?.replaceAll(')', '');
  const selectorTrayMode = allP[2].innerText.split('(')[1]?.replaceAll(')', '');
  const option1PromptMode = allP[4].innerText.split('(')[1]?.replaceAll(')', '');
  const option2PromptMode = allP[10].innerText.split('(')[1]?.replaceAll(')', '');
  const option3PromptMode = allP[16].innerText.split('(')[1]?.replaceAll(')', '');
  [...allP].forEach(async (elem) => {
    if (elem.querySelector('strong')) {
      elem.remove();
    }
  });

  const interactiveElemsText = media.querySelectorAll('p');

  //Set Enticement
  const enticement = media.querySelector('h2');
  const enticementDiv = createEnticement(enticement.innerText, enticementMode);
  enticement.classList.add('hide');
  media.appendChild(enticementDiv, media.firstChild);

  //Set InteractiveSelection
  const option1 = {
    id: `${interactiveElemsText[0].innerText.split('|')[2]}`,
    text: `${interactiveElemsText[0].innerText.split('|')[1]}`,
    svg: `${interactiveElemsText[0].innerText.split('|')[0]}`,
    analytics: `Select${interactiveElemsText[0].innerText.split('|')[2]}`,
  }

  const option2 = {
    id: `${interactiveElemsText[3].innerText.split('|')[2]}`,
    text: `${interactiveElemsText[3].innerText.split('|')[1]}`,
    svg: `${interactiveElemsText[3].innerText.split('|')[0]}`,
    analytics: `Select${interactiveElemsText[3].innerText.split('|')[2]}`,
  }

  const option3 = {
    id: `${interactiveElemsText[6].innerText.split('|')[2]}`,
    text: `${interactiveElemsText[6].innerText.split('|')[1]}`,
    svg: `${interactiveElemsText[6].innerText.split('|')[0]}`,
    analytics: `Select${interactiveElemsText[6].innerText.split('|')[2]}`,
  }

  let textToImagePos = 0;
  let genFillPos = 0;
  let textEffectPos = 0;
  let ttiPromptMode = '';
  let genfillPromptMode = '';
  let tePromptMode = '';
  if (option1.id === 'TextToImage' && option2.id === 'GenerativeFill' && option3.id === 'TextEffects') {
    textToImagePos = 2;
    genFillPos = 5;
    textEffectPos = 8;
    ttiPromptMode = option1PromptMode;
    genfillPromptMode = option2PromptMode;
    tePromptMode = option3PromptMode;
  } else if (option1.id === 'GenerativeFill' && option2.id === 'TextToImage' && option3.id === 'TextEffects') {
    textToImagePos = 5;
    genFillPos = 2;
    textEffectPos = 8;
    ttiPromptMode = option2PromptMode;
    genfillPromptMode = option1PromptMode;
    tePromptMode = option3PromptMode;
  } else if (option1.id === 'TextToImage' && option2.id === 'TextEffects' && option3.id === 'GenerativeFill') {
    textToImagePos = 2;
    genFillPos = 8;
    textEffectPos = 5;
    ttiPromptMode = option1PromptMode;
    genfillPromptMode = option3PromptMode;
    tePromptMode = option2PromptMode;
  } else if (option1.id === 'TextEffects' && option2.id === 'TextToImage' && option3.id === 'GenerativeFill') {
    textToImagePos = 5;
    genFillPos = 8;
    textEffectPos = 2;
    ttiPromptMode = option2PromptMode;
    genfillPromptMode = option3PromptMode;
    tePromptMode = option1PromptMode;
  } else if (option1.id === 'TextEffects' && option2.id === 'GenerativeFill' && option3.id === 'TextToImage') {
    textToImagePos = 8;
    genFillPos = 5;
    textEffectPos = 2;
    ttiPromptMode = option3PromptMode;
    genfillPromptMode = option2PromptMode;
    tePromptMode = option1PromptMode;
  } else if (option1.id === 'GenerativeFill' && option2.id === 'TextEffects' && option3.id === 'TextToImage') {
    textToImagePos = 8;
    genFillPos = 2;
    textEffectPos = 5;
    ttiPromptMode = option3PromptMode;
    genfillPromptMode = option1PromptMode;
    tePromptMode = option2PromptMode;
  }

  const selctions = [];
  selctions.push(option1);
  selctions.push(option2);
  selctions.push(option3);


  const fireflyOptions = createSelectorTray(selctions, selectorTrayMode);
  fireflyOptions.classList.add('fireflySelectorTray');
  media.append(fireflyOptions);

  const textToImageButton = media.querySelector('#TextToImage');
  const generativeFillButton = media.querySelector('#GenerativeFill');
  const textEffectsButton = media.querySelector('#TextEffects');
  const firstOption = media.querySelector('.options > button')
  firstOption.classList.add('selected');
  firstOption.querySelector('img').classList.add('svgselected');

  /* Set the default image */
  interactiveElemsText[5].classList.add('hide');
  interactiveElemsText[8].classList.add('hide');

  // Hide the prompt and option text for media
  interactiveElemsText[0].classList.add('hide');
  interactiveElemsText[1].classList.add('hide');
  interactiveElemsText[3].classList.add('hide');
  interactiveElemsText[4].classList.add('hide');
  interactiveElemsText[6].classList.add('hide');
  interactiveElemsText[7].classList.add('hide');


  const genfillPrompt = createGenFillPrompt(interactiveElemsText[genFillPos - 1]);

  //Create prompt field
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
      const { signIn } = await import('./fireflySUSI.js');
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
    const fireflyPrompt = createPromptField(`${interactiveElemsText[textToImagePos - 1].innerText.split('|')[0]}`, `${interactiveElemsText[textToImagePos - 1].innerText.split('|')[1]}`, ttiPromptMode);
    fireflyPrompt.classList.add('fireflyPrompt');
    media.appendChild(fireflyPrompt)
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
      const { signIn } = await import('./fireflySUSI.js');
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
    const fireflyPrompt = createPromptField(`${interactiveElemsText[textEffectPos - 1].innerText.split('|')[0]}`, `${interactiveElemsText[textEffectPos - 1].innerText.split('|')[1]}`, tePromptMode);
    fireflyPrompt.classList.add('fireflyPrompt');
    media.appendChild(fireflyPrompt);
    const generateButton = media.querySelector('#promptbutton');
    eventOnGenerate(generateButton, media);
  });
}
