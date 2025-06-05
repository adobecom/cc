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
  const a = createTag('a', {
    class: 'tray-thumbnail-img',
    href: '#',
    role: 'radio',
    ...(pic.querySelector('img') && pic.querySelector('img').alt && { 'aria-label': pic.querySelector('img').alt }),
  }, outline);
  a.style.backgroundImage = `url(${src})`;
  [a.dataset.dispSrc, a.dataset.dispAlt] = displayImg;
  a.dataset.dispPth = pathId;
  const img = createTag('img', { class: 'preload-img', src });
  const analyticsHolder = createTag('div', { class: 'interactive-link-analytics-text' }, pic.querySelector('img').alt);
  a.append(img, analyticsHolder);
  if (pathId === 0) a.classList.add('thumbnail-selected');
  return a;
}

function attachArrowNavigation(container) {
  const getRadioItems = () => Array.from(container.querySelectorAll('a[role="radio"]'));

  container.addEventListener('keydown', (e) => {
    if (!['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'].includes(e.key)) return;

    const radios = getRadioItems();
    const currentIndex = radios.indexOf(document.activeElement);
    if (currentIndex === -1) return;

    const direction = (e.key === 'ArrowRight' || e.key === 'ArrowDown') ? 1 : -1;
    const nextIndex = (currentIndex + direction + radios.length) % radios.length;

    radios[nextIndex].focus();
    e.preventDefault();
  });
}

function attachThumbnailEvents(a, data, layer) {
  ['mouseover', 'touchstart', 'focus', 'keyup'].forEach((event) => {
    a.addEventListener(event, async (e) => {
      const curra = e.target.nodeName === 'A' ? e.target : e.target.closest('a');
      const selected = e.target.closest('.tray-items')?.querySelectorAll('.thumbnail-selected');
      [...selected].forEach((s) => {
        s.classList.remove('thumbnail-selected');
        s.setAttribute('aria-checked', 'false');
      });
      curra.classList.add('thumbnail-selected');
      curra.setAttribute('aria-checked', 'true');
      const trObj = { src: curra.dataset.dispSrc, alt: curra.dataset.dispAlt, useCfg: true };
      await handleImageTransition(data, trObj);
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
  const selectorTray = createTag('div', { class: 'body-s selector-tray', role: 'radiogroup', 'aria-labelledby': 'tray-title' });
  const trayItems = createTag('div', { class: 'tray-items' });
  const configTray = getTrayConfig(data);
  let pathIdx = getStartingPathIdx(data);
  const pics = [...configTray.querySelectorAll('li picture')];
  const thumbnails = pics.filter((p) => parseInt(p.querySelector('img').getAttribute('width'), 10) <= 500);
  const displayImgs = pics.filter((p) => parseInt(p.querySelector('img').getAttribute('width'), 10) > 500);
  [...thumbnails].forEach((thumbnailPic, idx) => {
    const displayPic = displayImgs[idx];
    const displayImg = [getImgSrc(displayPic), displayPic.querySelector('img').alt];
    const a = createSelectorThumbnail(thumbnailPic, pathIdx, displayImg);
    trayItems.append(a);
    pathIdx += 1;
    attachThumbnailEvents(a, data, layer);
  });
  selectorTray.append(trayItems);
  attachArrowNavigation(selectorTray);
  return selectorTray;
}

export default async function stepInit(data) {
  data.target.classList.add('step-selector-tray');
  const config = data.stepConfigs[data.stepIndex];
  const layer = createTag('div', { class: `layer layer-${data.stepIndex}` });
  const title = config.querySelector('p:first-child');
  let trayTitle = null;
  if (title) trayTitle = createTag('div', { class: 'tray-title', id: 'tray-title' }, title.innerText.trim());
  const selectorTray = selectorTrayWithImgs(layer, data);
  if (title) selectorTray.prepend(trayTitle);
  layer.append(selectorTray);
  return layer;
}
