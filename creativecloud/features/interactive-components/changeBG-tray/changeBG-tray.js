import { createTag } from '../../../scripts/utils.js';
import { handleImageTransition, getImgSrc } from '../../../blocks/interactive-metadata/interactive-metadata.js';
import { createInteractiveButton } from '../upload/upload.js';
import defineDeviceByScreenSize from '../../../scripts/decorate.js';

let currIndex = 0;
const mobileFlow = ['remove', 'change', 'upload', 'remove', 'change', 'start-over'];

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

async function changeBG(img, data) {
    const trObj = { src: img.src, alt: img.alt, useCfg: true };
    await handleImageTransition(data, trObj);
}

function createSubMenu(submenu, data, container, trayItems) {
  const options = submenu.children;
  console.log(options);
  let displayImg = null;
  [...options].forEach((op) => {
    const [thumbnailPic, displayPic] = op.children;
    displayImg = [getImgSrc(displayPic), displayPic.querySelector('img').alt];
    const a = createSelectorThumbnail(thumbnailPic, displayImg, null);
    a.classList.add('submenu-icon');
    a.addEventListener('click', async (e) => {
      changeBG(displayPic.querySelector('img'), data);
    });
    container.append(a);
  })
}

// TODO: make this a separate function
function appendSVGToButton(picture, button) {
  if (!picture) return;
  const svg = picture.querySelector('img[src*=svg]');
  if (!svg) return;
  const svgClone = svg.cloneNode(true);
  const svgCTACont = createTag('a', { class: 'tray-thumbnail-img' });
  svgCTACont.append(svgClone);
  button.prepend(svgCTACont);
}

function implRemove(data, config) {
  const img = config.ul.querySelector('picture > img');
  changeBG(img, data);
}

function implChange(data, config, trayItems, outerDiv) {
  if(!outerDiv.querySelector('.sb-option')) {
    const sbOption = createTag('div', { class: 'sb-option' });
    createSubMenu(config.ul, data, sbOption, trayItems);
    outerDiv.append(sbOption);
  } else {
    // TODO: toggle submenu
    console.log('toggle submenu');
  }
}

function implNextFlow(currEl, nextEl) {
  currEl.style.display = 'none';
  nextEl.style.display = 'flex';
}

function createTrayButton(data, config, trayItems, subMenuTray) {
  const vp = defineDeviceByScreenSize().toLocaleLowerCase();
  let trayOption = (vp === 'mobile') ? createTag('a', { class: `gray-button ${config.type}-btn` }) : createTag('div', { class: 'tray-option' });
  trayOption.append(config.text);
  appendSVGToButton(config.svg, trayOption);
  if(vp === 'mobile' && config.type === 'change') {
    implChange(data, config, trayItems, trayOption);
  }
  trayOption.addEventListener('click', async (e) => {
    e.preventDefault();
    switch(config.type) {
      case 'remove':
        implRemove(data, config);
        currIndex = (currIndex + 1) % 6;
        if (vp === 'mobile') implNextFlow(trayOption, trayItems.querySelector(`.${mobileFlow[currIndex]}-btn`));
        break;
      case 'change':
        if(vp === 'mobile') { 
          implChange(data, config, trayItems, trayOption);
          currIndex = (currIndex + 1) % 6;
          const nextEl = (trayItems.closest('.layer').querySelector(`.${mobileFlow[currIndex]}-btn`));
          implNextFlow(trayOption, nextEl);
        }
        else implChange(data, config, trayItems, subMenuTray);
        break;
      default:
        break;
    }
  });
  return trayOption;
}

function createTrayOptions(data, menu, trayItems, subMenuTray) {
  const options = menu.querySelectorAll(':scope > li');
  console.log(options.length);
  [...options].forEach(async (o, i) => {
    const oConfig = {
      text: o.textContent.split('|')[0].trim(),
      svg: o.querySelector(':scope > picture'),
      ul: o.querySelector('ul'),
      type: o.querySelector('span').classList[1].split('icon-')[1],
    }
    const trayOption = createTrayButton(data, oConfig, trayItems, subMenuTray);
    console.log(trayOption);
    if (i === 0) trayOption.style.display = 'flex';
    trayItems.append(trayOption);
  });
}

async function createPSflow(btnMetadata, layer) {
  const psConfig = {
    svg: btnMetadata.children[2].querySelector('picture'),
    text: btnMetadata.children[2].textContent.split('|')[0],
    type: 'PS'
  };
  const psBtn = await createInteractiveButton(psConfig);
  psBtn.addEventListener('click', (e) => {
    console.log('See more in PS');
  });
  layer.append(psBtn);
}

function handleUploadClick(btn, btnMetadata, layer) {
  const vp = defineDeviceByScreenSize().toLocaleLowerCase();
  btn.addEventListener('change', async (event) => {
    const pic = layer.querySelector('picture');
    const image = pic.querySelector('img');
    const file = event.target.files[0];
    if (file) {
      const fileSize = file.size/1000000; // ask
      if (fileSize > 25) {
        console.log('ADD TOAST NOTIFICATION');
        return;
      }
      const sources = pic.querySelectorAll('source');
      sources.forEach((source) => source.remove());
      const imageUrl = URL.createObjectURL(file);
      image.src = imageUrl;
    }
    btn.style.display = 'none';
    if (vp === 'mobile') {
      currIndex = (currIndex + 1) % 6;
      const nextEl = (layer.querySelector(`.${mobileFlow[currIndex]}-btn`));
      implNextFlow(btn, nextEl);
    } else {
      createPSflow(btnMetadata, layer);
    }
  });
}

function handleUpload(btnMetadata, layer) {
  const vp = defineDeviceByScreenSize().toLocaleLowerCase();
  const tItems = layer.querySelector('.tray-items');
  const uploadConfig = {
    svg: btnMetadata.children[1].querySelector('picture'),
    text: btnMetadata.children[1].textContent.split('|')[0],
    delay: btnMetadata.children[1].textContent.split('|')[1],
    type: 'upload',
  };
  const del = (vp === 'mobile') ? 0 : uploadConfig.delay;
  setTimeout( async () => {
    const button = await createInteractiveButton(uploadConfig);
    if (vp === 'mobile') button.classList.add('gray-button');
    layer.append(button);
    handleUploadClick(button, btnMetadata, layer);
  }, del);
}

function handleStartOver(layer, data, config, btnMetadata) {
  const vp = defineDeviceByScreenSize().toLocaleLowerCase();
  const svg = btnMetadata.querySelector('picture');
  const text = btnMetadata.firstElementChild.textContent;
  const startOver = createTag('div', { class: 'start-over' });
  startOver.append(svg, text);
  startOver.addEventListener('click', async (e) => {
    const [ bg, fg ] = config.querySelectorAll('p > picture');
    const currfgPic = layer.querySelector('picture');
    const bgI = bg.querySelector('img');
    const oldFG = fg.cloneNode(true);
    const obj = { src: bgI.src, alt: bgI.alt, useCfg: true };
    await handleImageTransition(data, obj);
    currfgPic.replaceWith(oldFG);
    if (vp === 'mobile') {
      currIndex = (currIndex + 1) % 6;
      const nextEl = (layer.querySelector(`.${mobileFlow[currIndex]}-btn`));
      implNextFlow(startOver, nextEl);
    }
  });
  return startOver;
}

function addForegroundImg(layer, config) {
  const fg = [...config.querySelectorAll('p')][1];
  const fgClone = fg.querySelector('picture').cloneNode(true);
  layer.append(fgClone);
}

function changeBgSelectorTray(layer, data, config) {
  const vp = defineDeviceByScreenSize().toLocaleLowerCase();
  addForegroundImg(layer, config);

  const selectorTray = createTag('div', { class: 'body-m changeBG-tray' });
  const trayItems = createTag('div', { class: 'tray-items' });
  const subMenuTray = createTag('div', { class: 'tray-items submenu' });

  const [ menu, btnMetadata ] = config.querySelectorAll('ol');
  const startOver = handleStartOver(layer, data, config, btnMetadata);
  createTrayOptions(data, menu, trayItems, subMenuTray);
  handleUpload(btnMetadata, layer);
  if (vp === 'mobile') {
    startOver.classList.remove('start-over');
    startOver.classList.add('gray-button', 'start-over-btn');
  }
  trayItems.appendChild(startOver);
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
