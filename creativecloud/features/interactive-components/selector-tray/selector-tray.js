import { getLibs } from '../../../scripts/utils.js';

function setForegroundImage(a, config, target) {
  const thumbnailImg = a.querySelector('picture');
  let thumbnailIdx = null;
  [...thumbnailImg.classList].forEach((cn) => {
    if (cn.match('thumbnail-idx-')) thumbnailIdx = cn.split('-')[2];
  });
  const displayImg = config.querySelector(`picture.display-idx-${thumbnailIdx}`);
  const displayImgClone = displayImg.cloneNode(true);
  displayImg.insertAdjacentElement('afterEnd', displayImgClone);
  target.querySelector('picture').replaceWith(displayImg);
}

function selectorTrayWithImgs(data, config, createTag) {
  data.handleImageTransition(data);
  const selectorTray = createTag('div', { class: 'body-s selector-tray' });
  const trayItems = createTag('div', { class: 'body-xl tray-items' });
  const isHorizontal = config.querySelector('ul > li').querySelectorAll('img[src*="media_"')?.length > 2;
  if (isHorizontal) trayItems.classList.add('horizontal');
  const imgs = config.querySelectorAll('picture');
  [...imgs].forEach((timg, idx) => {
    if (idx%2 === 0) return;
    timg.classList.add(`thumbnail-idx-${idx}`);
    imgs[idx - 1].classList.add(`display-idx-${idx}`);
    const a = createTag('a', {}, timg);
    trayItems.append(a);
    a.addEventListener('click', (e) => {
      const aTag = e.target.nodeName === 'A' ? e.target : e.target.closest('a');
      setForegroundImage(e.target, config, data.target);
      data.el.dispatchEvent(new CustomEvent(data.nextStepEvent));
    });
  });
  selectorTray.append(trayItems);
  return selectorTray;
}

export default async function stepInit(data) {
  const miloLibs = getLibs('/libs');
  const { createTag } = await import(`${miloLibs}/utils/utils.js`);
  data.target.classList.add('step-selector-tray');
  const config = data.stepConfigs[data.stepIndex];
  const layer = createTag('div', { class: `layer layer-${data.stepIndex}` });
  const title = config.querySelector('p:first-child');
  let trayTitle = null;
  if (title) trayTitle = createTag('div', { class: 'body-xl tray-title' }, title.innerText.trim());
  const trayConfig = config.querySelectorAll('ul > li');
  const isGenerateTray = [...trayConfig].filter(li => (li.querySelector('img[src*="media_"]').length >= 2));
  let selectorTray = null;
  if (isGenerateTray) selectorTray = selectorTrayWithImgs(data, config, createTag);
  if (title) selectorTray.prepend(trayTitle);
  layer.append(selectorTray);
  data.target.append(layer);
}
