import { createTag } from '../../../scripts/utils.js';

function selectorTrayWithImgs(layer, data) {
  const selectorTray = createTag('div', { class: 'body-s selector-tray' });
  const trayItems = createTag('div', { class: 'tray-items' });
  const allUls = data.stepConfigs[data.stepIndex].querySelectorAll('ul');
  const dpth = data.displayPath;
  let pathIdx = 0;
  const configUl = (dpth >= 0 && allUls.length > dpth) ? allUls[dpth] : allUls[0];
  if (dpth >= 0 && allUls.length > dpth) {
    for (let i = 0; i < dpth; i += 1) pathIdx += allUls[i].querySelectorAll('li').length;
  }
  const pics = configUl.querySelectorAll('picture');
  let displayImg = null;
  [...pics].forEach((pic, idx) => {
    if (idx % 2 === 0) {
      displayImg = [data.getImgSrc(pic), pic.querySelector('img').alt];
      return;
    }
    const analyticsHolder = createTag('div', { class: 'interactive-link-analytics-text' }, pic.querySelector('img').alt);
    const src = data.getImgSrc(pic);
    const outline = createTag('div', { class: 'tray-thumbnail-outline' });
    const a = createTag('a', { class: 'tray-thumbnail-img', href: '#' }, outline);
    a.style.backgroundImage = `url(${src})`;
    if (pathIdx === 0) a.classList.add('thumbnail-selected');
    [a.dataset.dispSrc, a.dataset.dispAlt] = displayImg;
    a.dataset.dispPth = pathIdx;
    a.append(analyticsHolder);
    trayItems.append(a);
    pathIdx += 1;
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
      await data.handleImageTransition(data, trObj);
      data.el.dispatchEvent(new CustomEvent(data.nextStepEvent));
      e.target.closest('.tray-items').querySelector('a.tray-thumbnail-img').classList.add('thumbnail-selected');
    });
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
