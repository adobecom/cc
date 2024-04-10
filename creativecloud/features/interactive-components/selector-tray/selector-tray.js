import { createTag } from '../../../scripts/utils.js';
import { handleImageTransition, getImgSrc } from '../../../blocks/interactive-metadata/interactive-metadata.js';

function getTrayConfig(data) {
  const dpth = data.displayPath;
  const allTrays = data.stepConfigs[data.stepIndex].querySelectorAll('ul, ol');
  const configTray = (dpth >= 0 && allTrays.length > dpth) ? allTrays[dpth] : allTrays[0];
  return configTray;
}

function getStartingPathIdx(data) {
  let pathIdx = 0;
  const dpth = data.displayPath;
  const allTrays = data.stepConfigs[data.stepIndex].querySelectorAll('ul, ol');
  if (allTrays.length < dpth) return pathIdx;
  for (let i = 0; i < dpth; i += 1) pathIdx += allTrays[i].querySelectorAll('li').length;
  return pathIdx;
}

function createSelectorThumbnail(pic, pathId, displayImg) {
  const src = getImgSrc(pic);
  const outline = createTag('div', { class: 'tray-thumbnail-outline' });
  const a = createTag('a', { class: 'tray-thumbnail-img', href: '#' }, outline);
  a.style.backgroundImage = `url(${src})`;
  [a.dataset.dispSrc, a.dataset.dispAlt] = displayImg;
  a.dataset.dispPth = pathId;
  const img = createTag('img', { class: 'preload-img', src });
  const analyticsHolder = createTag('div', { class: 'interactive-link-analytics-text' }, pic.querySelector('img').alt);
  a.append(img, analyticsHolder);
  if (pathId === 0) a.classList.add('thumbnail-selected');
  return a;
}

function attachThumbnailEvents(a, data, layer) {
  ['mouseover', 'touchstart', 'focus'].forEach((event) => {
    a.addEventListener(event, (e) => {
      e.target.closest('.tray-items')?.querySelector('.thumbnail-selected')?.classList.remove('thumbnail-selected');
    });
  });
  a.addEventListener('click', async (e) => {
    e.preventDefault();
    if (layer.classList.contains('disable-click')) return;
    layer.classList.add('disable-click');
    const curra = e.target.nodeName === 'A' ? e.target : e.target.closest('a');
    await data.openForExecution;
    data.displayPath = parseInt(curra.dataset.dispPth, 10);
    const trObj = { src: curra.dataset.dispSrc, alt: curra.dataset.dispAlt, useCfg: true };
    await handleImageTransition(data, trObj);
    data.el.dispatchEvent(new CustomEvent(data.nextStepEvent));
  });
}

function selectorTrayWithImgs(layer, data) {
  const selectorTray = createTag('div', { class: 'body-s selector-tray' });
  const trayItems = createTag('div', { class: 'tray-items' });
  const configTray = getTrayConfig(data);
  const options = configTray.querySelectorAll('li');
  let pathIdx = getStartingPathIdx(data);
  let displayImg = null;
  [...options].forEach((o) => {
    const [thumbnailPic, displayPic] = o.querySelectorAll('picture');
    displayImg = [getImgSrc(displayPic), displayPic.querySelector('img').alt];
    const a = createSelectorThumbnail(thumbnailPic, pathIdx, displayImg);
    trayItems.append(a);
    pathIdx += 1;
    attachThumbnailEvents(a, data, layer);
  });
  selectorTray.append(trayItems);
  return selectorTray;
}

export default async function stepInit(data) {
  data.target.classList.add('step-selector-tray');
  const config = data.stepConfigs[data.stepIndex];
  const layer = createTag('div', { class: `layer layer-${data.stepIndex}` });
  const title = config.querySelector('p:first-child');
  let trayTitle = null;
  if (title) trayTitle = createTag('div', { class: 'tray-title' }, title.innerText.trim());
  const selectorTray = selectorTrayWithImgs(layer, data);
  if (title) selectorTray.prepend(trayTitle);
  layer.append(selectorTray);
  return layer;
}
