import { createEnticement } from '../interactive-elements/interactive-elements.js';
import defineDeviceByScreenSize from '../../scripts/decorate.js';

async function addEnticement(container, enticement, mode) {
  const svgUrl = enticement.querySelector('a').href;
  const enticementText = enticement.innerText;
  const entcmtEl = await createEnticement(`${enticementText}|${svgUrl}`, mode);
  entcmtEl.classList.add('enticement');
  const n = container.children.length;
  const desktopMedia = container.querySelector('.desktop-only');
  const tabletMedia = (n > 2) ? container.querySelector('.tablet-only') : null;
  desktopMedia.insertBefore(entcmtEl, desktopMedia.firstElementChild);
  tabletMedia?.insertBefore(entcmtEl.cloneNode(true), tabletMedia.firstElementChild);
}

function handleClick(a, viewport, deviceLinks) {
  const img = a.querySelector('img');
  const currIndex = deviceLinks[viewport].index;
  const nextIndex = (currIndex + 1) % deviceLinks[viewport].srcList.length;
  img.src = deviceLinks[viewport].srcList[nextIndex];
  deviceLinks[viewport].index = nextIndex;
  return nextIndex;
}

function startAutocycle(a, autoCycleConfig, viewport, deviceLinks, interval) {
  if (autoCycleConfig.isImageClicked) return;
  autoCycleConfig.autocycleInterval = setInterval(() => {
    handleClick(a, viewport, deviceLinks);
    if (autoCycleConfig.isImageClicked
      || deviceLinks[viewport].index === deviceLinks[viewport].srcList.length - 1) {
      clearInterval(autoCycleConfig.autocycleInterval);
    }
  }, interval);
}

function processMedia(ic, miloUtil, autoCycleConfig, deviceLinks, viewport) {
  const media = miloUtil.createTag('div', { class: `media ${viewport}-only` });
  const a = miloUtil.createTag('a', { class: 'genfill-link' });
  const img = miloUtil.createTag('img', { class: 'genfill-image' });
  [img.src] = [deviceLinks[viewport].srcList];
  a.appendChild(img);
  media.appendChild(a);
  ic.appendChild(media);
  a.addEventListener('click', () => {
    autoCycleConfig.isImageClicked = true;
    handleClick(a, viewport, deviceLinks);
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
  const deviceLinks = {
    mobile: { srcList: [], index: 0 },
    tablet: { srcList: [], index: 0 },
    desktop: { srcList: [], index: 0 },
  };
  const mediaElements = currentDom.querySelectorAll('.media');
  viewports.forEach((v, vi) => {
    const media = mediaElements[vi]
      ? mediaElements[vi]
      : currentDom.lastElementChild;
    [...media.querySelectorAll('picture')].forEach((pic, index) => {
      const src = getImgSrc(pic, v);
      deviceLinks[v].srcList.push(src);
      if (index === 0) processMedia(ic, miloUtil, autoCycleConfig, deviceLinks, v);
    });
  });
  const currentVP = defineDeviceByScreenSize().toLocaleLowerCase();
  setTimeout(() => {
    const aTag = ic.querySelector(`.${currentVP}-only a`);
    startAutocycle(aTag, autoCycleConfig, currentVP, deviceLinks, intervalTime);
  }, delayTime);
  addEnticement(ic, enticement, mode);
}
