import { getLibs } from '../../../scripts/utils.js';

function setForegroundImage(a, target) {
  const displayImg = a.querySelector('.tray-display-img');
  const displayImgClone = displayImg.cloneNode(true);
  displayImg.insertAdjacentElement('afterEnd', displayImgClone);
  target.querySelector('picture').replaceWith(displayImg);
}

function selectorTrayImgs(el, selectorTray, item, target, createTag) {
  const [ displayImg, thumbnailImg ] = item.querySelectorAll('picture');
  const thumbnailImgClone = thumbnailImg.cloneNode(true);
  thumbnailImg.insertAdjacentElement('afterEnd', thumbnailImgClone);
  const displayImgClone = displayImg.cloneNode(true);
  displayImg.insertAdjacentElement('afterEnd', displayImgClone);
  const a = createTag('a');
  displayImg.classList.add('tray-display-img');
  a.append(thumbnailImg);
  a.append(displayImg);
  selectorTray.append(a);
  a.addEventListener('click', (e) => {
    const aTag = e.target.nodeName === 'A' ? e.target : e.target.closest('a')
    setForegroundImage(aTag, target);
    el.dispatchEvent(new CustomEvent('cc:interactive-switch'));
  });
}

export default async function stepInit(data) {
  const miloLibs = getLibs('/libs');
  const { createTag } = await import(`${miloLibs}/utils/utils.js`);
  data.target.classList.add('step-selector-tray');
  const layer = createTag('div', { class: `layer layer-${data.stepIndex}` });
  const selectorTray = createTag('div', { class: 'body-s selector-tray' });
  const title = data.config.querySelector('p:first-child');
  if (title) {
    const trayTitle = createTag('div', { class: 'body-xl tray-title' }, title.innerText.trim());
    selectorTray.append(trayTitle);
  }
  const trayConfig = data.config.querySelectorAll('ul > li');
  const trayItems = createTag('div', { class: 'body-xl tray-items' });
  selectorTray.append(trayItems);
  [...trayConfig].forEach((cfg, i) => {
    if (cfg.querySelector('img')) selectorTrayImgs(data.el, trayItems, cfg, data.target, createTag);
  });
  layer.append(selectorTray);
  data.target.append(layer);
}
