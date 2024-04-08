import { createTag } from '../../../scripts/utils.js';
import { handleImageTransition, getImgSrc } from '../../../blocks/interactive-metadata/interactive-metadata.js';

function getTrayConfig(data) {
  const dpth = data.displayPath;
  const allUls = data.stepConfigs[data.stepIndex].querySelectorAll('ul');
  const configUl = (dpth >= 0 && allUls.length > dpth) ? allUls[dpth] : allUls[0];
  return configUl;
}

function getStartingPathIdx(data) {
  let pathIdx = 0;
  const dpth = data.displayPath;
  const allUls = data.stepConfigs[data.stepIndex].querySelectorAll('ul');
  if (allUls.length < dpth) return pathIdx;
  for (let i = 0; i < dpth; i += 1) pathIdx += allUls[i].querySelectorAll('li').length;
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
    e.target.closest('.tray-items').querySelector('a.tray-thumbnail-img').classList.add('thumbnail-selected');
  });
}

function selectorTrayWithImgs(layer, data) {
  const selectorTray = createTag('div', { class: 'body-s selector-tray' });
  const trayItems = createTag('div', { class: 'tray-items' });
  const configUl = getTrayConfig(data);
  const pics = configUl.querySelectorAll('picture');
  let pathIdx = getStartingPathIdx(data);
  let displayImg = null;
  [...pics].forEach((pic, idx) => {
    if (idx % 2 === 0) {
      displayImg = [getImgSrc(pic), pic.querySelector('img').alt];
      return;
    }
    const a = createSelectorThumbnail(pic, pathIdx, displayImg);
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
  const trayConfig = config.querySelectorAll('ul > li');
  const isGenerateTray = [...trayConfig].filter((li) => (li.querySelector('img[src*="media_"]').length >= 2));
  let selectorTray = null;
  if (isGenerateTray) selectorTray = selectorTrayWithImgs(layer, data);
  if (title) selectorTray.prepend(trayTitle);
  layer.append(selectorTray);
  return layer;
}
