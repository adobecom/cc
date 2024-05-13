import { createTag } from '../../../scripts/utils.js';
import { handleImageTransition, getImgSrc } from '../../../blocks/interactive-metadata/interactive-metadata.js';
import { createInteractiveButton } from '../upload/upload.js';
import defineDeviceByScreenSize from '../../../scripts/decorate.js';

let currIndex = 0;
let clicked = false;
let timer = null;
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

async function removeBG(layer, data) {
  if (!layer.querySelector(':scope > picture')) {
    const dimg = layer.closest('.foreground').querySelector('.interactive-holder > picture > img');
    const pic = createTag('picture', {}, dimg.cloneNode(true));
    layer.prepend(pic);
    dimg.src = 'data:,';
    dimg.alt = '';
    /*
      background: linear-gradient(90deg, #000, #000 7px, #FFF 7px, #FFF 14px), linear-gradient(180deg, #fff, #fff 7px, #000 7px, #000 14px);
      background-size: 14px 14px;
    */
  }
  const img = layer.querySelector(":scope > picture > img");
  const { AperitifStrategy } = await import('../../../deps/export-to-ps/aperitifStrategy.js');
  const { MaskProcessor } = await import('../../../deps/export-to-ps/maskProcessor.js');
  await AperitifStrategy.init(
    'https://image-stage.adobe.io/utils/aperitif',
    '6LecjOQZAAAAAO2g37NFPwnIPA6URMXdAzBFZTpZ',
    'nurture-acom-first-touch',
  );
  const strategy = new AperitifStrategy();
  const response = await fetch(img.src.split('?')[0]);
  const blob = await response.blob();
  const file = new File([blob], 'dot.png', blob);
  const maskProcessor = new MaskProcessor(strategy, file);
  const maskBlob = await maskProcessor.mask();
  const imageUrl = URL.createObjectURL(maskBlob);
  img.style.maskImage = `url(${imageUrl})`;
  img.style.maskMode = 'luminance';
  img.style.maskSize = 'contain';
}

function createSubMenu(submenu, data, container, trayItems) {
  const options = submenu.children;
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

function implRemove(layer) {
  // const img = config.ul.querySelector('picture > img');
  // changeBG(img, data);
  removeBG(layer);
}

function implChange(data, config, trayItems, outerDiv) {
  const vp = defineDeviceByScreenSize().toLocaleLowerCase();
  const desktopBtn = trayItems.querySelector('.tray-option.change-btn');
  if(!outerDiv.querySelector('.sb-option')) {
    if (vp !== 'mobile') {
      outerDiv.style.display = 'flex';
      desktopBtn.classList.add('highlighted');
    }
    const sbOption = createTag('div', { class: 'sb-option' });
    createSubMenu(config.ul, data, sbOption, trayItems);
    outerDiv.append(sbOption);
  } else {
    const disp = outerDiv.style.display; 
    if (disp === 'flex') {
      outerDiv.style.display = 'none';
      desktopBtn.classList.remove('highlighted');
    } else {
      outerDiv.style.display = 'flex';
      desktopBtn.classList.add('highlighted');
    }
  }
}

function implNextFlow(currEl, nextEl) {
  currEl.style.display = 'none';
  nextEl.style.display = 'flex';
}

function createTrayButton(data, config, trayItems, subMenuTray, btnMetadata, layer) {
  const vp = defineDeviceByScreenSize().toLocaleLowerCase();
  let trayOption = (vp === 'mobile') ? createTag('a', { class: `gray-button ${config.type}-btn` }) : createTag('div', { class: `tray-option ${config.type}-btn` });
  trayOption.append(config.text);
  appendSVGToButton(config.svg, trayOption);
  if(vp === 'mobile' && config.type === 'change') {
    implChange(data, config, trayItems, trayOption);
  }
  trayOption.addEventListener('click', async (e) => {
    e.preventDefault();
    switch(config.type) {
      case 'remove':
        implRemove(layer);
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
        window.lana.log(`Unknown input type: ${config.type}`);
        break;
    }
    clicked = true;
    if(timer) clearTimeout(timer);
    handleUpload(btnMetadata, layer);
  });
  return trayOption;
}

function createTrayOptions(data, menu, trayItems, subMenuTray, btnMetadata, layer) {
  const options = menu.querySelectorAll(':scope > li');
  [...options].forEach(async (o, i) => {
    const oConfig = {
      text: o.textContent.split('|')[0].trim(),
      svg: o.querySelector(':scope > picture'),
      ul: o.querySelector('ul'),
      type: o.querySelector('span').classList[1].split('icon-')[1],
    }
    const trayOption = createTrayButton(data, oConfig, trayItems, subMenuTray, btnMetadata, layer);
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
  const uploadConfig = {
    svg: btnMetadata.children[1].querySelector('picture'),
    text: btnMetadata.children[1].textContent.split('|')[0],
    delay: btnMetadata.children[1].textContent.split('|')[1],
    type: 'upload',
  };
  const del = (vp === 'mobile' || clicked) ? 0 : uploadConfig.delay;
  timer = setTimeout( async () => {
    if(layer.querySelector('.upload-btn')) return;
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
  // addForegroundImg(layer, config);

  const selectorTray = createTag('div', { class: 'body-m changeBG-tray' });
  const trayItems = createTag('div', { class: 'tray-items' });
  const subMenuTray = createTag('div', { class: 'tray-items submenu' });

  const [ menu, btnMetadata ] = config.querySelectorAll('ol');
  const startOver = handleStartOver(layer, data, config, btnMetadata);
  createTrayOptions(data, menu, trayItems, subMenuTray, btnMetadata, layer);
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
