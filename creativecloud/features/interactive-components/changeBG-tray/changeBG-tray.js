import { createTag, loadStyle } from '../../../scripts/utils.js';
import { handleImageTransition, getImgSrc } from '../../../blocks/interactive-metadata/interactive-metadata.js';
import { createUploadButton } from '../upload/upload.js';

function createSelectorThumbnail(pic, displayImg, outline) {
  const src = getImgSrc(pic);
  const a = createTag('a', { class: 'tray-thumbnail-img', href: '#' }, outline);
  a.style.backgroundImage = `url(${src})`;
  [a.dataset.dispSrc, a.dataset.dispAlt] = displayImg;
  const img = createTag('img', { class: 'preload-img', src });
  const analyticsHolder = createTag('div', { class: 'interactive-link-analytics-text' }, pic.querySelector('img').alt);
  a.append(img, analyticsHolder);
  return a;
}

function toggleSubMenu(elem) {
  [...elem.parentElement.children].forEach((el) => {
    el.style.display = 'none';
  });
  elem.style.display = 'flex';
}

function handleClick(elem, data, sbOption) {
  elem.addEventListener('click', async (e) => {
    e.preventDefault();
    if (sbOption) {
      toggleSubMenu(sbOption);
    }
    const curra = e.target.nodeName === 'A' ? e.target : e.target.querySelector('a');
    const trObj = { src: curra.dataset.dispSrc, alt: curra.dataset.dispAlt, useCfg: true };
    await handleImageTransition(data, trObj);
  });
}

function createStartOver(btnMetadata) {
  const svg = btnMetadata.querySelector('picture');
  const text = btnMetadata.firstElementChild.textContent;
  const startOver = createTag('div', { class: 'tray-reset' });
  startOver.append(svg, text);
  startOver.addEventListener('click', async (e) => {
    console.log("start over");
  });
  return startOver;
}

function createSubMenu(submenu, data, container) {
  const options = submenu.children;
  let displayImg = null;
  [...options].forEach((op) => {
    const [thumbnailPic, displayPic] = op.children;
    displayImg = [getImgSrc(displayPic), displayPic.querySelector('img').alt];
    const a = createSelectorThumbnail(thumbnailPic, displayImg, null);
    container.append(a);
    handleClick(a, data, null);
  })
}

function createTrayOp(menu, data, trayItems, subMenuTray) {
  const options = menu.children;
  let displayImg = null;
  [...options].forEach((o, i) => {
    const [thumbnailPic, displayPic, subMenu = null] = o.children;
    const optionText = o.textContent.trim();
    displayImg = [getImgSrc(displayPic), displayPic.querySelector('img').alt];
    const a = createSelectorThumbnail(thumbnailPic, displayImg, null);
    const trayOption = createTag('div', { class: 'tray-option' });
    trayOption.append(a, optionText);
    trayItems.append(trayOption);
    let sbOption = null;
    if(subMenu) {
      sbOption = createTag('div', { class: 'submenu-option', id: `sub${i}` });
      createSubMenu(subMenu, data, sbOption);
      subMenuTray.append(sbOption);
    }
    handleClick(trayOption, data, sbOption);
  });
}

function changeBgSelectorTray(layer, data, config, media) {
  const selectorTray = createTag('div', { class: 'body-m selector-tray change-bg' });
  const trayItems = createTag('div', { class: 'tray-items' });
  const subMenuTray = createTag('div', { class: 'tray-items submenu' });
  const [ menu, btnMetadata ] = config.querySelectorAll('ol');
  createTrayOp(menu, data, trayItems, subMenuTray);
  // TODO: create uploadConfig
  // TODO: create continue in PS
  // TODO: start - over
  // TODO: add delay in upload
  // TODO: add loader
  // TODO: handle mobile view
  const uploadPic = btnMetadata.children[1].querySelector('picture');
  const [ uploadText, uploadDelay ] = btnMetadata.children[1].textContent.split('|');
  createUploadButton(uploadText, uploadPic, layer);
  const startOver = createStartOver(btnMetadata);
  trayItems.append(startOver);
  selectorTray.append(trayItems, subMenuTray);
  return selectorTray;
}


export default async function stepInit(data) {
  data.target.classList.add('step-change-bg-tray');
  const config = data.stepConfigs[data.stepIndex];
  const [ bg, fg ] = config.querySelectorAll('p');
  const fgClone = fg.querySelector('picture').cloneNode(true);
  fgClone.classList.add('fg-img');
  const layer = createTag('div', { class: `layer layer-${data.stepIndex}` });
  const selectorTray = changeBgSelectorTray(layer, data, config, fgClone);
  layer.append(selectorTray);
  layer.append(fgClone);
  return layer;
}
