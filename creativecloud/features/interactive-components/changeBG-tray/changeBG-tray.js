import { createTag } from '../../../scripts/utils.js';
import { handleImageTransition, getImgSrc } from '../../../blocks/interactive-metadata/interactive-metadata.js';
import { createUploadButton } from '../upload/upload.js';
import defineDeviceByScreenSize from '../../../scripts/decorate.js';

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

async function handleClick(img, data) {
    const trObj = { src: img.src, alt: img.alt, useCfg: true };
    await handleImageTransition(data, trObj);
}

function createSubMenu(submenu, data, container) {
  const options = submenu.children;
  console.log(options);
  let displayImg = null;
  [...options].forEach((op) => {
    const [thumbnailPic, displayPic] = op.children;
    displayImg = [getImgSrc(displayPic), displayPic.querySelector('img').alt];
    const a = createSelectorThumbnail(thumbnailPic, displayImg, null);
    a.addEventListener('click', async (e) => {
      handleClick(displayPic.querySelector('img'), data);
    });
    container.append(a);
  })
}

function appendSVGToButton(picture, button) {
  if (!picture) return;
  const svg = picture.querySelector('img[src*=svg]');
  if (!svg) return;
  const svgClone = svg.cloneNode(true);
  const svgCTACont = createTag('a', { class: 'tray-thumbnail-img' });
  svgCTACont.append(svgClone);
  button.prepend(svgCTACont);
}

function createButton(data, config, subMenuTray) {
  const trayOption = createTag('div', { class: 'tray-option' });
  trayOption.append(config.text);
  appendSVGToButton(config.svg, trayOption);
  trayOption.addEventListener('click', async (e) => {
    e.preventDefault();
    let img = null;
    switch(config.type) {
      case 'remove':
        img = config.ul.querySelector('picture > img');
        handleClick(img, data);
        break;
      case 'change':
        img = config.ul.querySelectorAll('picture > img');
        if(!subMenuTray.querySelector('.sb-option')) {
          const sbOption = createTag('div', { class: 'sb-option' });
          createSubMenu(config.ul, data, sbOption);
          subMenuTray.append(sbOption);
        }
        break;
      default:
        break;
    }
  });
  return trayOption;
}

function createTrayOp(data, menu, trayItems, subMenuTray) {
  const options = menu.querySelectorAll(':scope > li');
  console.log(options);
  let displayImg = null;
  [...options].forEach((o, i) => {
    const oConfig = {
      text: o.textContent.trim(),
      svg: o.querySelector(':scope > picture'),
      ul: o.querySelector('ul'),
      type: o.querySelector('span').classList[1].split('icon-')[1]
    }
    const trayOption = createButton(data, oConfig, subMenuTray);
    console.log(trayOption);
    trayItems.append(trayOption);
  });
}

function handleUpload(btnMetadata, layer) {
  const uploadConfig = {
    svg: btnMetadata.children[1].querySelector('picture'),
    text: btnMetadata.children[1].textContent.split('|')[0],
    delay: btnMetadata.children[1].textContent.split('|')[1],
  };
  setTimeout(() => {
    createUploadButton(uploadConfig, layer);
  }, uploadConfig.delay);
}

function createStartOver(data, btnMetadata, config) {
  const bgI = config.bgPic.querySelector('img');
  const svg = btnMetadata.querySelector('picture');
  const text = btnMetadata.firstElementChild.textContent;
  const startOver = createTag('div', { class: 'tray-reset' });
  startOver.append(svg, text);
  startOver.addEventListener('click', async (e) => {
    console.log(config);
    // const oldFG = config.fgPic.cloneNode(true);
    // oldFG.classList.add('fg-img');
    // const obj = { src: bgI.src, alt: bgI.alt, useCfg: true };
    // await handleImageTransition(data, obj);
    // config.fgClone.replaceWith(oldFG);
  });
  return startOver;
}

function handleStartOver(bg, fg, fgClone, btnMetadata, data) {
  const soConfig = {
    bgPic: bg.querySelector('picture'),
    fgPic: fg.querySelector('picture'),
    fgClone: fgClone
  };
  return createStartOver(data, btnMetadata, soConfig);
}

function changeBgSelectorTray(layer, data, config) {
  const [ bg, fg ] = config.querySelectorAll('p');
  const fgClone = fg.querySelector('picture').cloneNode(true);
  fgClone.classList.add('fg-img');
  layer.append(fgClone);
  const selectorTray = createTag('div', { class: 'body-m selector-tray change-bg' });
  const trayItems = createTag('div', { class: 'tray-items' });
  const subMenuTray = createTag('div', { class: 'tray-items submenu' });
  const [ menu, btnMetadata ] = config.querySelectorAll('ol');
  console.log(menu);
  createTrayOp(data, menu, trayItems, subMenuTray);
  handleUpload(btnMetadata, layer);
  const startOver = handleStartOver(bg, fg, fgClone, btnMetadata, data);
  trayItems.append(startOver);
  
  selectorTray.append(trayItems, subMenuTray);
  return selectorTray;
}

export default async function stepInit(data) {
  data.target.classList.add('step-change-bg-tray');
  const config = data.stepConfigs[data.stepIndex];
  const layer = createTag('div', { class: `layer layer-${data.stepIndex}` });
  const selectorTray = changeBgSelectorTray(layer, data, config);
  layer.append(selectorTray);
  return layer;
}
