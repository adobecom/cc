import { createTag } from '../../../scripts/utils.js';
import { handleImageTransition, getImgSrc } from '../../../blocks/interactive-metadata/interactive-metadata.js';
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

function createSubMenu(op, data) {
  const [thumbnailPic, displayPic] = op.children;
  const displayImg = [getImgSrc(displayPic), displayPic.querySelector('img').alt];
  const a = createSelectorThumbnail(thumbnailPic, displayImg, null);
  a.classList.add('submenu-icon');
  a.addEventListener('click', async (e) => {
    changeBG(displayPic.querySelector('img'), data);
  });
  return a;
}

// function implRemove(layer) {
//   removeBG(layer);
// }

// function implChange(data, config, trayItems, outerDiv) {
//   const vp = defineDeviceByScreenSize().toLocaleLowerCase();
//   const desktopBtn = trayItems.querySelector('.tray-option.change-btn');
//   if(!outerDiv.querySelector('.sb-option')) {
//     if (vp !== 'mobile') {
//       outerDiv.style.display = 'flex';
//       desktopBtn.classList.add('highlighted');
//     }
//     const sbOption = createTag('div', { class: 'sb-option' });
//     createSubMenu(config.ul, data, sbOption, trayItems);
//     outerDiv.append(sbOption);
//   } else {
//     const disp = outerDiv.style.display; 
//     if (disp === 'flex') {
//       outerDiv.style.display = 'none';
//       desktopBtn.classList.remove('highlighted');
//     } else {
//       outerDiv.style.display = 'flex';
//       desktopBtn.classList.add('highlighted');
//     }
//   }
// }

function implNextFlow(currEl, nextEl) {
  currEl.style.display = 'none';
  nextEl.style.display = 'flex';
}

function createTrayButton(btnText, btnSvg, btnType) {
  let btn = createTag('a', { class: `gray-button tray-option ${btnType}-btn` });
  btn.dataset.animationcfg = 'animated_v2';
  if (btnSvg) btn.append(btnSvg);
  const btnTxtCont = createTag('span', {class: `tray-item-text`}, btnText);
  btn.append(btnTxtCont);
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    switch(btnType) {
      case 'remove':
        handleRemoveBg(layer);
        break;
      case 'change':
        handleChangeBg(data, config, trayItems, trayOption);
        break;
      case 'start-over':
        handleStartOver(data, config, trayItems, trayOption);
        break;
      default:
        break;
    }
    // clicked = true;
    // if(timer) clearTimeout(timer);
    // handleUpload(btnMetadata, layer);
  });
  return btn;
}

function createUploadBtn(cfg) {
  const [btnText, btnDelay = null] = cfg.textContent.split('|');
  const btnSvg = cfg.querySelector('picture');
  const btn = createTag('a', { class: `upload-btn body-xl` }, btnText);
  const inputBtn = createTag('input', { class: 'inputFile', type: 'file'});
  btn.append(btnSvg, inputBtn);
  return btn;
  // timer = setTimeout( async () => {
  //   if(layer.querySelector('.upload-btn')) return;
  //   const button = await createInteractiveButton(uploadConfig);
  //   if (vp === 'mobile') button.classList.add('gray-button');
  //   layer.append(button);
  //   handleUploadClick(button, btnMetadata, layer);
  // }, del);
}

function createTrayOptions(btnCfg, data) {
  const btnText = btnCfg.textContent.split('|')[0].trim();
  const btnSvg = btnCfg.querySelector(':scope > picture');
  const iconOption = [...btnCfg.querySelector('.icon').classList]?.filter((c) => c.match('icon-'));
  let btnType = '';
  if (iconOption.length) {
    const icParts = iconOption[0].split('-');
    icParts.shift();
    btnType = icParts.join('-');
  }
  const btn = createTrayButton(btnText, btnSvg, btnType);
  const subMenu = btnCfg.querySelector('ul');
  if (!subMenu) return [btn, null];
  const subOpt = createTag('div', { class: 'sb-option' });
  const subItems = subMenu.querySelectorAll('li');
  [...subItems].forEach( (i) => {
    const subItem = createSubMenu(i, data);
    subOpt.append(subItem);
  })
  return [btn, subOpt];
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

function handleMenuClick(btn, submenu) {
  btn.addEventListener('click', () => {
    if (submenu.style.display === 'flex') submenu.style.display = 'none';
    else submenu.style.display = 'flex';
  });
}

function changeBgSelectorTray(data, config) {
  const selectorTray = createTag('div', { class: 'heading-xs changeBG-tray' });
  const trayItems = createTag('div', { class: 'tray-items' });
  const subMenuTray = createTag('div', { class: 'tray-items submenu' });

  const traycfg = config.querySelector('ol').querySelectorAll(':scope > li');
  [...traycfg].forEach( (btncfg, idx) => {
    const [btn, subMenu] = createTrayOptions(btncfg, data);
    handleMenuClick(btn, subMenu);
    trayItems.append(btn);
    if (subMenu) subMenuTray.append(subMenu);
  });
  selectorTray.append(trayItems, subMenuTray);
  return selectorTray;
}

function changeBgUpload(config) {
  const uploadCfg = config.querySelectorAll('ol').length > 1 ? config.querySelectorAll('ol')[1] : null;
  if (!uploadCfg) return null;
  const btnCfg = createUploadBtn(uploadCfg.querySelector('.icon-upload')?.closest('li'));
  const [btnText, btnDelay = null] = btnCfg.textContent.split('|');
  const btnSvg = btnCfg.querySelector('picture');
  const btn = createTag('a', { class: `upload-btn body-xl` });
  const inputBtn = createTag('input', { class: 'inputFile', type: 'file'});
  btn.append(btnSvg, btnText, inputBtn);
  return btn;
}

export default async function stepInit(data) {
  data.target.classList.add('step-change-bg-tray');
  const config = data.stepConfigs[data.stepIndex];
  const layer = createTag('div', { class: `layer layer-${data.stepIndex}` });
  const selectorTray = changeBgSelectorTray(data, config);
  const uploadBtn = changeBgUpload(config);
  selectorTray.append(uploadBtn);
  layer.append(selectorTray);
  if (uploadBtn) layer.append(uploadBtn);
  return layer;
}
