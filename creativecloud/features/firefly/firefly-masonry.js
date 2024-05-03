const { focusOnInput } = await import('./firefly-interactive.js');
const { createPromptField, createEnticement } = await import('../interactive-elements/interactive-elements.js');

function addKeyEvent(promptInput, promptButton) {
  promptInput.addEventListener('keydown', (event) => {
    if (event.keyCode === 13) {
      event.preventDefault();
      promptButton.click();
    }
    if (event.target.value.length === 0 && event.keyCode === 32) {
      if (event.preventDefault) event.preventDefault();
      else event.returnValue = false;
    }
  });
}

function handleTouchDevice(mediaContainer, delay) {
  let tapCount = 0;
  const aTag = mediaContainer.querySelector('a');
  const imgContent = mediaContainer.querySelector('.image-content');
  aTag.addEventListener('touchstart', (e) => {
    e.preventDefault();
    tapCount += 1;
    if (tapCount === 2) aTag.click();
    imgContent.style.opacity = 1;
    setTimeout(() => {
      tapCount = 0;
      imgContent.style.opacity = 0;
    }, delay);
  });
}

function getImgSrc(pic, viewport = '') {
  let source = '';
  if (viewport === 'mobile') source = pic.querySelector('source[type="image/webp"]:not([media])');
  else source = pic.querySelector('source[type="image/webp"][media]');
  return source.srcset;
}

async function createEmbellishment(allP, media, mediaMobile, ic, mode, miloUtil, interactiveMode) {
  const [promptText, buttonText] = allP[4].innerText.split('|');
  const fireflyPrompt = await createPromptField(`${promptText}`, `${buttonText}`, `ff-masonry, ${interactiveMode}`);
  fireflyPrompt.classList.add('ff-masonry-prompt');
  const enticementText = allP[0].textContent.trim();
  const enticementIcon = allP[0].querySelector('a').href;
  const enticementDiv = await createEnticement(`${enticementText}|${enticementIcon}`, mode);
  const mediaDiv = [mediaMobile, media];
  mediaDiv.forEach((div) => {
    div.appendChild(fireflyPrompt.cloneNode(true));
    div.appendChild(enticementDiv.cloneNode(true));
    const promptButton = div.querySelector('.masonry-generate');
    const promptInput = div.querySelector('.masonry-prompttext');
    promptButton.addEventListener('click', async (e) => {
      const userprompt = promptInput?.value;
      const dall = userprompt === '' ? 'SubmitTextToImage' : 'SubmitTextToImageUserContent';
      e.target.setAttribute('daa-ll', dall);
      if (userprompt === '') {
        window.location.href = allP[4].querySelector('a').href;
      } else {
        const { default: signIn } = await import('./firefly-susi.js');
        signIn(userprompt, 'goToFirefly');
      }
    });
    focusOnInput(null, miloUtil.createTag, promptButton);
    addKeyEvent(promptInput, promptButton);
    ic.appendChild(div);
  });
}

function processMasonryMedia(gridDiv, miloUtil, allP, mediaDetail) {
  const lastIndex = mediaDetail.imgSrc.length - 1;
  const mediaContainer = miloUtil.createTag('div', { class: 'image-container' });
  const a = miloUtil.createTag('a', { href: `${mediaDetail.href[lastIndex]}` });
  const img = miloUtil.createTag('img', { src: `${mediaDetail.imgSrc[lastIndex]}`, class: 'prompt-image', alt: `${mediaDetail.alt[lastIndex]}` });
  const imgPromptContainer = miloUtil.createTag('div', { class: 'image-content' });
  const imgPrompt = miloUtil.createTag('p', { }, mediaDetail.prompt[lastIndex].trim());
  const imgHoverIcon = miloUtil.createTag('img', { alt: '', class: 'hoversvg' });
  imgHoverIcon.src = allP[2].querySelector('a').href;
  imgPromptContainer.appendChild(imgPrompt);
  imgPromptContainer.appendChild(imgHoverIcon);
  a.append(img);
  a.appendChild(imgPromptContainer);
  mediaContainer.appendChild(a);
  handleTouchDevice(mediaContainer, 2000);

  const spanWidth = mediaDetail.spans[lastIndex];
  mediaContainer.classList.add(`ff-grid-${spanWidth.trim().replace(' ', '-')}`);
  gridDiv.appendChild(mediaContainer);
}

function setImgAttrs(a, imagePrompt, src, prompt, href) {
  const image = new Image();
  image.src = src;
  image.onload = () => {
    a.querySelector('img').src = src;
    imagePrompt.querySelector('p').innerText = prompt;
    a.href = href;
    a.classList.remove('preload');
  };
}

function handleAutoCycle(a, mediaDetail, imagePrompt) {
  const nextIndex = (mediaDetail.index + 1) % mediaDetail.imgSrc.length;
  const { imgSrc, prompt, href } = mediaDetail;
  const src = imgSrc[nextIndex];
  const nextPrompt = prompt[nextIndex];
  const nextHref = href[nextIndex];
  setImgAttrs(a, imagePrompt, src, nextPrompt, nextHref);
  mediaDetail.index = nextIndex;
  return nextIndex;
}

function startAutocycle(a, imagePrompt, mediaDetail, interval) {
  const autocycleInterval = setInterval(() => {
    a.classList.add('preload');
    handleAutoCycle(a, mediaDetail, imagePrompt);
    if (mediaDetail.index === mediaDetail.imgSrc.length - 1) {
      clearInterval(autocycleInterval);
    }
  }, interval);
}

function processMobileMedia(ic, mediaMobile, miloUtil, allP, mediaDetail) {
  const { imgSrc, href, prompt, alt } = mediaDetail;
  const currentIndex = mediaDetail.index;
  const mediaContainer = miloUtil.createTag('div', { class: 'image-container' });
  const a = miloUtil.createTag('a', { href: `${href[currentIndex]}` });
  const img = miloUtil.createTag('img', { src: `${imgSrc[currentIndex]}`, class: 'prompt-image', alt: `${alt[currentIndex]}` });
  const imageHover = miloUtil.createTag('div', { class: 'image-content' });
  const imgHoverText = miloUtil.createTag('p', { }, allP[2].innerText.trim());
  const imgHoverIcon = miloUtil.createTag('img', { alt: '', class: 'hoversvg' });
  imgHoverIcon.src = allP[2].querySelector('a').href;
  imageHover.prepend(imgHoverIcon);
  imageHover.appendChild(imgHoverText);

  const imgPrompt = miloUtil.createTag('div', { class: 'image-prompt' });
  const promptText = miloUtil.createTag('p', { }, prompt[currentIndex].trim());
  const promptUsed = miloUtil.createTag('span', { class: 'prompt-used' }, allP[1].innerText.trim());
  imgPrompt.appendChild(promptUsed);
  imgPrompt.appendChild(promptText);

  a.append(img);
  a.appendChild(imageHover);
  mediaContainer.appendChild(a);
  mediaContainer.appendChild(imgPrompt);
  mediaMobile.appendChild(mediaContainer);
  ic.appendChild(mediaMobile);

  const aTag = ic.querySelector('.mobile-only a');
  const imagePrompt = ic.querySelector('.mobile-only .image-prompt');
  const ROOT_MARGIN = 1000;
  miloUtil.createIntersectionObserver({
    el: aTag,
    options: { rootMargin: `${ROOT_MARGIN}px` },
    callback: (target) => {
      setTimeout(() => {
        startAutocycle(target, imagePrompt, mediaDetail, 4000);
      }, 1000);
    },
  });
  handleTouchDevice(mediaContainer, 2000);
}

export default async function setMultiImageMarquee(el, miloUtil) {
  const enticementMode = el.classList.contains('light') ? 'light' : 'dark';
  const interactiveMode = el.classList.contains('light') ? 'dark' : 'light';
  const ic = el.querySelector('.interactive-container');
  const mediaElements = el.querySelector('.asset');
  const allP = mediaElements.querySelectorAll('p:not(:empty)');
  ic.innerHTML = '';
  const mediaDetail = {
    imgSrc: [], prompt: [], href: [], index: 0, spans: [], alt: [],
  };
  const media = miloUtil.createTag('div', { class: 'asset grid-layout' });
  const mediaMobile = miloUtil.createTag('div', { class: 'asset mobile-only' });
  const gridDiv = miloUtil.createTag('div', { class: 'grid-container' });
  [...allP].forEach((s) => {
    if (s.querySelector('picture')) {
      const src = getImgSrc(s);
      const prompt = allP[[...allP].indexOf(s) + 1].innerText;
      const { href } = allP[[...allP].indexOf(s) + 1].querySelector('a');
      let [, alt, span] = s.querySelector('img').getAttribute('alt').split('|');
      if (!alt && !span) {
        alt = '';
        span = s.querySelector('img').getAttribute('alt');
      }
      mediaDetail.imgSrc.push(src);
      mediaDetail.prompt.push(prompt);
      mediaDetail.href.push(href);
      mediaDetail.spans.push(span);
      mediaDetail.alt.push(alt);
      // Desktop and Tablet
      processMasonryMedia(gridDiv, miloUtil, allP, mediaDetail);
    }
  });
  // For grid view
  media.appendChild(gridDiv);
  // For mobile view
  processMobileMedia(ic, mediaMobile, miloUtil, allP, mediaDetail);

  createEmbellishment(allP, media, mediaMobile, ic, enticementMode, miloUtil, interactiveMode);
}
