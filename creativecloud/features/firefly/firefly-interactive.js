import { getLibs } from '../../scripts/utils.js';

function focusOnInput(media) {
  const input = media.querySelector('.prompt-text');
  if (input) {
    input.focus();
    input.classList.add('blinking-cursor');
    if (input.classList.contains('light')) input.classList.add('blink-light');
    input.addEventListener('click', () => { input.classList.remove('blinking-cursor'); input.classList.remove('blink-light'); });
  }
}

function eventOnGenerate(generateButton, media) {
  const btnConfigs = {
    TextToImage: ['SubmitTextToImage', 'SubmitTextToImageUserContent', 'goToFirefly'],
    TextEffects: ['SubmitTextEffects', 'SubmitTextEffectsUserContent', 'goToFireflyEffects'],
  };
  generateButton.addEventListener('click', async (e) => {
    const userprompt = media.querySelector('.prompt-text')?.value;
    const placeholderprompt = media.querySelector('.prompt-text')?.getAttribute('placeholder');
    const prompt = userprompt || placeholderprompt;
    const selected = media.querySelector('.selected');
    const className = selected.getAttribute('class').split(' ')[1].trim();
    if (Object.keys(btnConfigs).includes(className)) {
      const btnConfig = btnConfigs[className];
      const dall = userprompt === '' ? btnConfig[0] : btnConfig[1];
      e.target.setAttribute('daa-ll', dall);
      const { signIn } = await import('./firefly-susi.js');
      signIn(prompt, btnConfig[2]);
    }
  });
}

async function createGenFillPrompt(element) {
  const { createTag } = await import(`${getLibs()}/utils/utils.js`);
  const genfillPrompt = createTag('div', { class: 'genfill-prompt' });
  const promptConfig = element?.split('|')[0].split('[');
  const prompt = createTag('p', '', `${promptConfig[0]}`);
  const promptText = createTag('p', { class: 'genfill-promptused' }, `${promptConfig[1].replaceAll(']', '').trim()}`);
  genfillPrompt.append(prompt, promptText);
  return genfillPrompt;
}

function hideRemoveElements(option, media, mediaP) {
  media.querySelector('#promptbar')?.remove();
  media.querySelector('.genfill-prompt')?.remove();
  const selector = media.querySelector('.firefly-selectortray');
  let i = 0;
  [...selector.childNodes].forEach((el) => {
    if (el.getAttribute('class') === option.getAttribute('class')) {
      el.querySelector('img').classList.add('svgselected');
      el.classList.add('selected');
      mediaP[i].classList.remove('hide');
    } else {
      el.classList.remove('selected');
      el.querySelector('img').classList.remove('svgselected');
      mediaP[i].classList.add('hide');
    }
    i += 1;
  });
}

async function eventOnSelectorOption(selOption, promptDet, media, mediaP, createPromptField) {
  hideRemoveElements(selOption, media, mediaP);
  const promptText = promptDet.promptpos.split('|');
  if (selOption.classList.contains('GenerativeFill')) {
    const genfilprompt = await createPromptField(`${promptText[0]}`, `${promptText[1]}`, promptDet.promptmode, 'SubmitGenerativeFill');
    media.appendChild(genfilprompt);
    genfilprompt.classList.add('genfill-promptbar');
    const genFillButton = media.querySelector('#genfill');
    genFillButton.addEventListener('click', async () => {
      const { signIn } = await import('./firefly-susi.js');
      signIn('', 'goToFireflyGenFill');
    });
  } else {
    const prompt = await createPromptField(`${promptText[0]}`, `${promptText[1]}`, promptDet.promptmode);
    media.appendChild(prompt);
    prompt.classList.add('firefly-prompt');
    const generateButton = media.querySelector('#promptbutton');
    eventOnGenerate(generateButton, media);
    focusOnInput(media);
  }
}

export default async function setInteractiveFirefly(el) {
  const enticementMode = el.classList.contains('light') ? 'light' : 'dark';
  const interactiveElemMode = el.classList.contains('light') ? 'dark' : 'light';
  const buttons = el.querySelectorAll('.con-button');
  [...buttons].forEach((button) => { if (button.innerText.includes('Firefly')) button.setAttribute('daa-ll', 'getfirefly'); });
  const media = el.querySelector('.media');
  const allP = media.querySelectorAll('p:not(:empty)');
  const allAnchorTag = media.querySelectorAll('a');
  // Get InteractiveSelection Value
  const selections = [];
  const ttiDetail = {};
  const genfDetail = {};
  const teDetail = {};
  const fireflyDomain = [
    'firefly.adobe.com',
  ];
  const allSelections = [...media.querySelectorAll('p:not(:empty)')].filter((p) => p.innerText.trim().toLowerCase().includes(fireflyDomain[0]));
  allSelections.forEach((s) => {
    const optionPromptMode = interactiveElemMode;
    const selectorValues = s.innerText.split('|');
    let selectorOption = '';
    if (selectorValues[0].includes('generate/images')) {
      ttiDetail.promptmode = optionPromptMode;
      ttiDetail.promptpos = s.nextElementSibling.innerText;
      selectorOption = 'TextToImage';
    } else if (selectorValues[0].includes('upload/inpaint')) {
      genfDetail.promptmode = 'genfill';
      genfDetail.promptpos = s.nextElementSibling.innerText;
      selectorOption = 'GenerativeFill';
    } else if (selectorValues[0].includes('generate/font-styles')) {
      teDetail.promptmode = optionPromptMode;
      teDetail.promptpos = s.nextElementSibling.innerText;
      selectorOption = 'TextEffects';
    }
    const option = {
      id: `${selectorOption}`,
      text: `${s.querySelectorAll('a')[1].textContent.trim()}`,
      svg: `${s.querySelectorAll('a')[1].href}`,
      analytics: `Select${selectorOption}`,
    };
    selections.push(option);
  });

  [...allP].forEach((s) => { if (!s.querySelector('picture') && !s.querySelector('video')) s.remove(); });
  const mediaP = media.querySelectorAll('p:not(:empty)');
  [...mediaP].forEach((image) => { image.classList.add('hide'); });

  const { createSelectorTray, createEnticement, createPromptField } = await import('../interactive-elements/interactive-elements.js');
  // Set Enticement
  const enticementText = allAnchorTag[0].textContent.trim();
  const enticementIcon = allAnchorTag[0].href;
  const enticementDiv = await createEnticement(`${enticementText}|${enticementIcon}`, enticementMode);
  media.appendChild(enticementDiv, media.firstChild);

  const fireflyOptions = await createSelectorTray(selections, interactiveElemMode);
  fireflyOptions.classList.add('firefly-selectortray');
  media.append(fireflyOptions);

  const ttiOption = media.querySelector('.TextToImage');
  const genFillOption = media.querySelector('.GenerativeFill');
  const teOption = media.querySelector('.TextEffects');
  const firstOption = media.querySelector('.selector-tray > button');

  hideRemoveElements(firstOption, media, mediaP);

  const genfillPrompt = await createGenFillPrompt(genfDetail.promptpos);

  // Create prompt field for first option on page load
  const firstOptionDetail = allP[3].innerText.split('|');
  const fireflyPrompt = await createPromptField(`${firstOptionDetail[0]}`, `${firstOptionDetail[1]}`, interactiveElemMode);
  if (firstOption.classList.contains('TextToImage') || firstOption.classList.contains('TextEffects')) {
    fireflyPrompt.classList.add('firefly-prompt');
    media.appendChild(fireflyPrompt);
    const generateButton = media.querySelector('#promptbutton');
    eventOnGenerate(generateButton, media);
  } else if (firstOption.classList.contains('GenerativeFill')) {
    fireflyPrompt.classList.add('genfill-promptbar');
    media.append(genfillPrompt, fireflyPrompt);
    const genFillButton = media.querySelector('#genfill');
    genFillButton.addEventListener('click', async () => {
      const { signIn } = await import('./firefly-susi.js');
      signIn('', 'goToFireflyGenFill');
    });
  }

  focusOnInput(media);
  /* Handle action on click of each firefly option button */

  ttiOption.addEventListener('click', () => {
    eventOnSelectorOption(ttiOption, ttiDetail, media, mediaP, createPromptField);
  });

  genFillOption.addEventListener('click', () => {
    eventOnSelectorOption(genFillOption, genfDetail, media, mediaP, createPromptField);
    media.appendChild(genfillPrompt);
  });

  teOption.addEventListener('click', () => {
    eventOnSelectorOption(teOption, teDetail, media, mediaP, createPromptField);
  });
}
