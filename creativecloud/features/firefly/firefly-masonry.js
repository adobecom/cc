function isTouchDevice() {
  return ('ontouchstart' in window)
    || (navigator.maxTouchPoints > 0)
    || (navigator.msMaxTouchPoints > 0);
}

function handleTouchDevice(mediaContainer, delay) {
  let tapCount = 0;
  mediaContainer.querySelector('a').addEventListener('click', (e) => {
    e.preventDefault();
    tapCount += 1;
    if (tapCount === 1) {
      mediaContainer.querySelector('.image-content').style.opacity = 1;
      setTimeout(() => {
        tapCount = 0;
        mediaContainer.querySelector('.image-content').style.opacity = 0;
      }, delay);
    } else if (tapCount === 2) {
      window.location.href = mediaContainer.querySelector('a').href;
    }
  });
}

function createImageLayout(allMedia, createTag, spans, media) {
  const gridDiv = createTag('div', { class: 'grid-container' });
  [...allMedia].forEach((img, i) => {
    const spanWidth = spans[i] ? spans[i] : 'span-4';
    img.classList.add(`ff-grid-${spanWidth.trim().replace(' ', '-')}`);
    gridDiv.appendChild(img);
  });
  media.appendChild(gridDiv);
}

function getImgSrc(pic, viewport = '') {
  let source = '';
  if (viewport === 'mobile') source = pic.querySelector('source[type="image/webp"]:not([media])');
  else source = pic.querySelector('source[type="image/webp"][media]');
  return source.srcset;
}

async function createEmbellishment(allP, media, ic, mode, createTag) {
  const { createPromptField, createEnticement } = await import('../interactive-elements/interactive-elements.js');
  const { focusOnInput } = await import('./firefly-interactive.js');
  const [promptText, buttonText] = allP[4].innerText.split('|');
  const fireflyPrompt = await createPromptField(`${promptText}`, `${buttonText}`, 'ff-masonry');
  fireflyPrompt.classList.add('ff-masonry-prompt');
  media.appendChild(fireflyPrompt);
  const input = fireflyPrompt.querySelector('.masonry-prompttext');
  focusOnInput(media, createTag, input);
  const promptButton = fireflyPrompt.querySelector('#promptbutton');
  promptButton.addEventListener('click', async (e) => {
    const userprompt = media.querySelector('.masonry-prompttext')?.value;
    const dall = userprompt === '' ? 'SubmitTextToImage' : 'SubmitTextToImageUserContent';
    e.target.setAttribute('daa-ll', dall);
    if (userprompt === '') {
      window.location.href = allP[4].querySelector('a').href;
    } else {
      const { default: signIn } = await import('./firefly-susi.js');
      signIn(userprompt, 'goToFirefly');
    }
  });

  const enticementText = allP[0].textContent.trim();
  const enticementIcon = allP[0].querySelector('a').href;
  const enticementDiv = await createEnticement(`${enticementText}|${enticementIcon}`, mode);
  media.appendChild(enticementDiv);
  ic.appendChild(media);
}

function processMasonryMedia(ic, miloUtil, allP, enticementMode, mediaDetail) {
  const allMedia = [];
  const media = miloUtil.createTag('div', { class: 'asset grid-layout' });
  for (let i = 0; i < mediaDetail.imgSrc.length; i += 1) {
    const mediaContainer = miloUtil.createTag('div', { class: 'image-container' });
    const a = miloUtil.createTag('a', { href: `${mediaDetail.href[i]}` });
    a.style.backgroundImage = `url(${mediaDetail.imgSrc[i]})`;
    const imgPromptContainer = miloUtil.createTag('div', { class: 'image-content' });
    const imgPrompt = miloUtil.createTag('p', { }, mediaDetail.prompt[i].trim());
    const imgHoverIcon = miloUtil.createTag('img', { alt: '', class: 'hoversvg' });
    imgHoverIcon.src = allP[2].querySelector('a').href;
    imgPromptContainer.appendChild(imgPrompt);
    imgPromptContainer.appendChild(imgHoverIcon);
    a.appendChild(imgPromptContainer);
    mediaContainer.appendChild(a);
    allMedia.push(mediaContainer);
    if (isTouchDevice()) {
      handleTouchDevice(mediaContainer, 2000);
    }
  }
  createImageLayout(allMedia, miloUtil.createTag, mediaDetail.spans, media);
  createEmbellishment(allP, media, ic, enticementMode, miloUtil.createTag);
}

function setImgAttrs(a, imagePrompt, src, prompt, href) {
  const image = new Image();
  image.src = src;
  image.onload = () => {
    a.style.backgroundImage = `url(${src})`;
    imagePrompt.querySelector('p').innerText = prompt;
    a.href = href;
    a.classList.remove('preload');
  };
}

function handleAutoCycle(a, mediaDetail, imagePrompt) {
  const currIndex = mediaDetail.index;
  const nextIndex = (currIndex + 1) % mediaDetail.imgSrc.length;
  const src = mediaDetail.imgSrc[nextIndex];
  const prompt = mediaDetail.prompt[nextIndex];
  const href = mediaDetail.href[nextIndex];
  setImgAttrs(a, imagePrompt, src, prompt, href);
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

function processMobileMedia(ic, miloUtil, allP, mode, mediaDetail) {
  const mediaMobile = miloUtil.createTag('div', { class: 'asset mobile-only' });
  const mediaContainer = miloUtil.createTag('div', { class: 'image-container' });
  const a = miloUtil.createTag('a', { href: `${mediaDetail.href[mediaDetail.index]}` });
  a.style.backgroundImage = `url(${mediaDetail.imgSrc[mediaDetail.index]})`;
  const imageHover = miloUtil.createTag('div', { class: 'image-content' });
  const imgHoverText = miloUtil.createTag('p', { }, allP[2].innerText.trim());
  const imgHoverIcon = miloUtil.createTag('img', { alt: '', class: 'hoversvg' });
  imgHoverIcon.src = allP[2].querySelector('a').href;
  imageHover.prepend(imgHoverIcon);
  imageHover.appendChild(imgHoverText);
  const imgPrompt = miloUtil.createTag('div', { class: 'image-prompt' });
  const promptText = miloUtil.createTag('p', { }, mediaDetail.prompt[mediaDetail.index].trim());
  const promptUsed = miloUtil.createTag('span', { class: 'prompt-used' }, allP[1].innerText.trim());
  imgPrompt.appendChild(promptUsed);
  imgPrompt.appendChild(promptText);
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
        startAutocycle(target, imagePrompt, mediaDetail, 3000);
      }, 1000);
    },
  });
  if (isTouchDevice()) {
    handleTouchDevice(mediaContainer, 1000);
  }
  createEmbellishment(allP, mediaMobile, ic, mode, miloUtil.createTag);
}

export default async function setMultiImageMarquee(el, miloUtil) {
  const enticementMode = el.classList.contains('light') ? 'light' : 'dark';
  const ic = el.querySelector('.interactive-container');
  const mediaElements = el.querySelector('.asset');
  const allP = mediaElements.querySelectorAll('p:not(:empty)');
  ic.innerHTML = '';
  const mediaDetail = { imgSrc: [], prompt: [], href: [], index: 0, spans: [] };
  [...allP].forEach((s) => {
    if (s.querySelector('picture')) {
      mediaDetail.imgSrc.push(getImgSrc(s));
      const prompt = allP[[...allP].indexOf(s) + 1].innerText;
      mediaDetail.prompt.push(prompt);
      mediaDetail.href.push(allP[[...allP].indexOf(s) + 1].querySelector('a').href);
      mediaDetail.spans.push(s.querySelector('img').getAttribute('alt'));
    }
  });
  processMasonryMedia(ic, miloUtil, allP, enticementMode, mediaDetail);
  processMobileMedia(ic, miloUtil, allP, enticementMode, mediaDetail);
}
