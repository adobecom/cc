
import { createTag } from '../../../scripts/utils.js';
import { handleImageTransition, getImgSrc } from '../../../blocks/interactive-metadata/interactive-metadata.js';
import { createInteractiveButton } from '../upload/upload.js';
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
  elem.parentElement.style.display = 'flex';
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
      sbOption = createTag('div', { class: 'sb-option', id: `sub${i}` });
      createSubMenu(subMenu, data, sbOption);
      subMenuTray.append(sbOption);
    }
    handleClick(trayOption, data, sbOption);
  });
}

async function createPSflow(btnMetadata, layer) {
  const psConfig = {
    svg: btnMetadata.children[2].querySelector('picture'),
    text: btnMetadata.children[2].textContent.split('|')[0],
    type: 'PS'
  };
  const psBtn = await createInteractiveButton(psConfig, layer);
  psBtn.addEventListener('click', (e) => {
    console.log('See more in PS');
  });
  layer.append(psBtn);
}

function handleUploadClick(btn, btnMetadata, layer) {
  btn.addEventListener('change', async (event) => {
    const pic = layer.querySelector('picture');
    const image = pic.querySelector('img');
    const file = event.target.files[0];
    if (file) {
      console.log('file', file.size/1000000); // ask
      const fileSize = file.size/1000000;
      if (fileSize > 25) {
        console.log('ADD TOAST NOTIFICATION');
        return;
      }
      const sources = pic.querySelectorAll('source');
      sources.forEach((source) => source.remove());
      const imageUrl = URL.createObjectURL(file);
      image.src = imageUrl;
      // add loader
    }
    // show PS button
    btn.style.display = 'none';
    createPSflow(btnMetadata, layer);
  });
}

function handleUpload(btnMetadata, layer) {
  const uploadConfig = {
    svg: btnMetadata.children[1].querySelector('picture'),
    text: btnMetadata.children[1].textContent.split('|')[0],
    delay: btnMetadata.children[1].textContent.split('|')[1],
    type: 'upload',
  };
  setTimeout(async () => {
    const button = await createInteractiveButton(uploadConfig, layer);
    layer.append(button);
    handleUploadClick(button, btnMetadata, layer);
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
    const oldFG = config.fgPic.cloneNode(true);
    oldFG.classList.add('fg-img');
    const obj = { src: bgI.src, alt: bgI.alt, useCfg: true };
    await handleImageTransition(data, obj);
    config.fgClone.replaceWith(oldFG);
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
  const currentVP = defineDeviceByScreenSize().toLocaleLowerCase();
  const [ bg, fg ] = config.querySelectorAll('p');
  const fgClone = fg.querySelector('picture').cloneNode(true);
  fgClone.classList.add('fg-img');
  layer.append(fgClone);
  const selectorTray = createTag('div', { class: 'body-m selector-tray change-bg' });
  const trayItems = createTag('div', { class: 'tray-items' });
  const subMenuTray = createTag('div', { class: 'tray-items submenu' });
  const [ menu, btnMetadata ] = config.querySelectorAll('ol');
  if (currentVP === 'mobile') {
    console.log(btnMetadata);
    return null;
  }

  createTrayOp(menu, data, trayItems, subMenuTray);
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
