import { createEnticement } from '../interactive-elements/interactive-elements.js';
import defineDeviceByScreenSize from '../../scripts/decorate.js';

async function addEnticement(container, enticement, mode) {
  const svgUrl = enticement.querySelector('a').href;
  const enticementText = enticement.innerText;
  const entcmtEl = await createEnticement(`${enticementText}|${svgUrl}`, mode);
  entcmtEl.classList.add('enticement');
  const viewports = ['tablet', 'desktop'];
  viewports.forEach((v) => {
    const mDiv = container.querySelector(`.${v}-only`);
    mDiv.insertBefore(entcmtEl.cloneNode(true), mDiv.firstElementChild);
  });
}

function handleClick(a, viewport, deviceConfig) {
  const img = a.querySelector('img');
  const currIndex = deviceConfig[viewport].index;
  const nextIndex = (currIndex + 1) % deviceConfig[viewport].srcList.length;
  img.src = deviceConfig[viewport].srcList[nextIndex];
  img.alt = deviceConfig[viewport].altList[nextIndex];
  a.setAttribute('daa-ll', img.alt);
  deviceConfig[viewport].index = nextIndex;
  return nextIndex;
}

function startAutocycle(a, autoCycleConfig, viewport, deviceConfig, interval) {
  if (autoCycleConfig.isImageClicked) return;
  autoCycleConfig.autocycleInterval = setInterval(() => {
    handleClick(a, viewport, deviceConfig);
    if (autoCycleConfig.isImageClicked
      || deviceConfig[viewport].index === deviceConfig[viewport].srcList.length - 1) {
      clearInterval(autoCycleConfig.autocycleInterval);
    }
  }, interval);
}

function processMedia(ic, miloUtil, autoCycleConfig, deviceConfig, viewport) {
  const media = miloUtil.createTag('div', { class: `media ${viewport}-only` });
  const a = miloUtil.createTag('a', { class: 'genfill-link' });
  const img = miloUtil.createTag('img', { class: 'genfill-image' });
  [img.alt] = [deviceConfig[viewport].altList];
  [img.src] = [deviceConfig[viewport].srcList];
  a.setAttribute('daa-ll', img.alt);
  a.appendChild(img);
  media.appendChild(a);
  ic.appendChild(media);
  a.addEventListener('click', () => {
    autoCycleConfig.isImageClicked = true;
    if (autoCycleConfig.autocycleInterval) clearInterval(autoCycleConfig.autocycleInterval);
    handleClick(a, viewport, deviceConfig);
  });
}

function getImgSrc(pic, viewport) {
  let source = '';
  if (viewport === 'mobile') source = pic.querySelector('source[type="image/webp"]:not([media])');
  else source = pic.querySelector('source[type="image/webp"][media]');
  return source.srcset;
}

export default async function decorateGenfill(el, miloUtil) {
  const autoCycleConfig = {
    autocycleInterval: null,
    isImageClicked: false,
  };
  const ic = el.querySelector('.interactive-container');
  const heading = ic.closest('.foreground').querySelector('h1, h2, h3, h4, h5, h6');
  const hText = heading.id
    .split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('');
  const allP = ic.querySelectorAll('.media:first-child p');
  const pMetadata = [...allP].filter((p) => !p.querySelector('picture'));
  const [enticement, timer = null] = [...pMetadata];
  enticement.classList.add('enticement-detail');
  timer?.classList.add('timer');
  const mode = el.classList.contains('light') ? 'light' : 'dark';
  const timerValues = timer ? timer.innerText.split('|') : null;
  const [intervalTime = 2000, delayTime = 1000] = (timerValues && timerValues.length > 1)
    ? timerValues : [2000];
  [enticement, timer].forEach((i) => i?.remove());
  const currentDom = ic.cloneNode(true);
  ic.innerHTML = '';
  const viewports = ['mobile', 'tablet', 'desktop'];
  const deviceConfig = {
    mobile: { srcList: [], altList: [], index: 0 },
    tablet: { srcList: [], altList: [], index: 0 },
    desktop: { srcList: [], altList: [], index: 0 },
  };
  const mediaElements = currentDom.querySelectorAll('.media');
  viewports.forEach((v, vi) => {
    const media = mediaElements[vi]
      ? mediaElements[vi]
      : currentDom.lastElementChild;
    [...media.querySelectorAll('picture')].forEach((pic, index) => {
      const src = getImgSrc(pic, v);
      deviceConfig[v].srcList.push(src);
      const altTxt = pic.querySelector('img').alt
        ? `${pic.querySelector('img').alt}|Marquee|${hText}`
        : `Image-${v}-${index}|Marquee|${hText}`;
      deviceConfig[v].altList.push(altTxt);
      if (index === 0) processMedia(ic, miloUtil, autoCycleConfig, deviceConfig, v);
    });
  });
  const currentVP = defineDeviceByScreenSize().toLocaleLowerCase();
  setTimeout(() => {
    const aTag = ic.querySelector(`.${currentVP}-only a`);
    startAutocycle(aTag, autoCycleConfig, currentVP, deviceConfig, intervalTime);
  }, delayTime);
  addEnticement(ic, enticement, mode);
}
