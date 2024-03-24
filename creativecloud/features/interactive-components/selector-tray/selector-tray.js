import { getLibs } from '../../../scripts/utils.js';

function selectorTrayWithImgs(data, config, createTag) {
  const selectorTray = createTag('div', { class: 'body-s selector-tray' });
  const trayItems = createTag('div', { class: 'body-xl tray-items' });
  const isHorizontal = config.querySelector('ul > li').querySelectorAll('img[src*="media_"')?.length > 2;
  if (isHorizontal) trayItems.classList.add('horizontal');
  const imgs = config.querySelectorAll('picture');
  let selectedOption = 0;
  [...imgs].forEach((timg, idx) => {
    timg.classList.add(`thumbnail-idx-${idx}`);
    const trayLabel = createTag('div', { class: 'tray-item-label' }, `Generate variant ${timg.alt}`);
    const a = createTag('a', { class: 'tray-thumbnail-img', href: "#" }, timg);
    a.dataset.thumbnailIdx = idx;
    a.append(trayLabel);
    if (idx === 0) a.classList.add('thumbnail-selected');
    trayItems.append(a);

    a.addEventListener('mouseover', (e) => {
      e.target.closest('.tray-items')?.querySelector('.thumbnail-selected')?.classList.remove('thumbnail-selected');
    });

    a.addEventListener('touchstart', (e) => {
      e.target.closest('.tray-items')?.querySelector('.thumbnail-selected')?.classList.remove('thumbnail-selected');
    });

    a.addEventListener('click', async (e) => {
      e.preventDefault();
      e.target.closest('.tray-items').querySelector('a.tray-thumbnail-img').classList.add('thumbnail-selected');
      await data.openForExecution;
      data.displayPath = idx;
      data.handleImageTransition(data, idx+1);
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
