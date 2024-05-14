import { createTag } from '../../../scripts/utils.js';
import { handleImageTransition, getImgSrc } from '../../../blocks/interactive-metadata/interactive-metadata.js';
import defineDeviceByScreenSize from '../../../scripts/decorate.js';

function isDeviceMobile() {
  const MOBILE_SIZE = 600;
  let screenWidth = window.innerWidth;
  if (screen.orientation.type.startsWith('landscape')) screenWidth = window.innerHeight;
  return screenWidth <= MOBILE_SIZE ? true : false;
}

function createSelectorThumbnail(pic, displayImg, outline) {
  const src = getImgSrc(pic);
  const a = createTag('a', { class: 'tray-thumbnail-img', href: '#' }, outline);
  [a.dataset.dispSrc, a.dataset.dispAlt] = displayImg;
  const img = createTag('img', { class: 'preload-img', src });
  const analyticsHolder = createTag('div', { class: 'interactive-link-analytics-text' }, pic.querySelector('img').alt);
  a.append(img, analyticsHolder);
  return a;
}

function continueInPs(uploadBtn, config) {
  const uploadCfg = config.querySelectorAll('ol').length > 1 ? config.querySelectorAll('ol')[1] : null;
  if (!uploadCfg) return null;
  const btnCfg = uploadCfg.querySelector('.icon-upload-ps')?.closest('li');
  const btnText = btnCfg.textContent;
  const btnSvg = btnCfg.querySelector('picture');
  const btn = createTag('a', { class: `psgateway-handler continueps-btn body-xl` });
  btn.append(btnSvg, btnText)
  uploadBtn.replaceWith(btn);
  btn.addEventListener('click', () => {
    handleContinueInPs();
  });
  return btn;
}

function handleContinueInPs() {
  console.log('continue in ps');
}

function renderMobileStep(layer, mobileStep, stepName = null) {
  let i = mobileStep.activeStep;
  if (stepName) {
    const stepIdx = mobileStep.stepList.indexOf(stepName);
    i = stepIdx !== -1 ? stepIdx : i;
  }
  mobileStep.activeStep = (i + 1) % mobileStep.stepList.length;
  layer.querySelector('.show-btn')?.classList.remove('show-btn');
  layer.querySelector('.show-submenu')?.classList.remove('show-submenu');
  const showBtn = layer.querySelector(`.${mobileStep.stepList[mobileStep.activeStep]}-btn`);
  showBtn.classList.add('show-btn');
  if (showBtn.dataset?.submenu) {
    layer.querySelector(`.${showBtn.dataset.submenu}`).classList.add('show-submenu');
    showBtn.classList.add('m-highlighted');
  }
}

async function handleChangeBg(layer, bgImg, data) {
    const subjectImg = layer.querySelector(":scope > picture > img");
    if (!subjectImg || !subjectImg.style.maskImage) {
      await handleRemoveBg(layer);
    }
    const trObj = { src: bgImg.src, alt: bgImg.alt, useCfg: true };
    await handleImageTransition(data, trObj);
}

async function handleRemoveBg(layer) {
  const layerImg = layer.querySelector(':scope > picture > img');
  if (layerImg && layerImg.style.maskImage) return;
  if (!layerImg) {
    const dimg = layer.closest('.foreground').querySelector('.interactive-holder > picture > img');
    const pic = createTag('picture', {}, dimg.cloneNode(true));
    layer.prepend(pic);
    dimg.src = 'data:,';
    dimg.alt = '';
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

function createSubMenu(op, layer, data, mobileStep) {
  const [thumbnailPic, displayPic] = op.children;
  const displayImg = [getImgSrc(displayPic), displayPic.querySelector('img').alt];
  const a = createSelectorThumbnail(thumbnailPic, displayImg, null);
  a.classList.add('submenu-icon');
  a.addEventListener('click', async () => {
    await handleChangeBg(layer, displayPic.querySelector('img'), data);
  });
  return a;
}

function createTrayButton(layer, data, mobileStep, btnText, btnSvg, btnType) {
  let btn = createTag('a', { class: `gray-button tray-option ${btnType}-btn` });
  if (btnSvg) btn.append(btnSvg);
  const btnTxtCont = createTag('span', {class: `tray-item-text`}, btnText);
  btn.append(btnTxtCont);
  btn.addEventListener('click', async (e) => {
    layer.querySelector('.upload-btn').classList.add('show-desktop-upload');
    e.preventDefault();
    switch(btnType) {
      case 'remove':
        await handleRemoveBg(layer);
        renderMobileStep(layer, mobileStep);
        break;
      case 'start-over':
        await handleStartOver(layer, data, mobileStep);
        break;
      default:
        break;
    }
  });
  return btn;
}

function createTrayOptions(btnCfg, layer, data, mobileStep, idx) {
  const btnText = btnCfg.textContent.split('|')[0].trim();
  const btnSvg = btnCfg.querySelector(':scope > picture');
  const iconOption = [...btnCfg.querySelector('.icon').classList]?.filter((c) => c.match('icon-'));
  let btnType = '';
  if (iconOption.length) {
    const icParts = iconOption[0].split('-');
    icParts.shift();
    btnType = icParts.join('-');
  }
  const btn = createTrayButton(layer, data, mobileStep, btnText, btnSvg, btnType);
  const subMenu = btnCfg.querySelector('ul');
  if (!subMenu) return [btn, null];
  btn.dataset.submenu = `submenu-${idx}`;
  const subOpt = createTag('div', { class: `sb-option submenu-${idx}` });
  const subItems = subMenu.querySelectorAll('li');
  [...subItems].forEach( (i) => {
    const subItem = createSubMenu(i, layer, data, mobileStep);
    subOpt.append(subItem);
  })
  return [btn, subOpt];
}

function handleUploadImage(layer, config, btn, mobileStep) {
  btn.addEventListener('change', (event) => {
    if (!layer.querySelector(':scope > picture > img')) {
      const img = createTag('img', {});
      const pic = createTag('picture', {}, img);
      layer.prepend(pic);
    }
    const image = layer.querySelector(':scope > picture > img');
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      image.src = imageUrl;
      if (!isDeviceMobile()) continueInPs(btn, config);
      renderMobileStep(layer, mobileStep, 'upload');
    }
  });
}

async function handleStartOver(layer, data, mobileStep) {
  const defaultCfg = data.stepConfigs[data.stepIndex];
  const defaultPic = defaultCfg.querySelector('picture');
  const src = getImgSrc(defaultPic);
  const alt = defaultPic.querySelector('img').alt;
  const obj = { src, alt, useCfg: true };
  await handleImageTransition(data, obj);
  layer.querySelector(':scope > picture').style.opacity = 0;
  layer.querySelector(':scope > picture')?.remove();
  renderMobileStep(layer, mobileStep, 'start-over');
}

function handleMenuClick(btn, submenu) {
  btn.addEventListener('click', () => {
    const isMobile = defineDeviceByScreenSize() === 'MOBILE';
    const showClass = isMobile ? 'show-submenu' : 'show-desktop-submenu';
    const showBtnClass = isMobile ? 'm-highlighted' : 'd-highlighted';
    submenu.classList.toggle(showClass);
    btn.classList.toggle(showBtnClass);
  });
}

function changeBgSelectorTray(data, layer, config, mobileStep) {
  const selectorTray = createTag('div', { class: 'heading-xs changeBG-tray' });
  const trayItems = createTag('div', { class: 'tray-items' });
  const subMenuTray = createTag('div', { class: 'tray-items submenu' });

  const traycfg = config.querySelector('ol').querySelectorAll(':scope > li');
  [...traycfg].forEach( (btncfg, idx) => {
    const [btn, subMenu] = createTrayOptions(btncfg, layer, data, mobileStep, idx);
    trayItems.append(btn);
    if (subMenu) {
      handleMenuClick(btn, subMenu);
      subMenuTray.append(subMenu);
    }
  });
  selectorTray.append(subMenuTray, trayItems);
  return selectorTray;
}

function changeBgUpload(layer, config, mobileStep) {
  const uploadCfg = config.querySelectorAll('ol').length > 1 ? config.querySelectorAll('ol')[1] : null;
  if (!uploadCfg) return null;
  const btnCfg = uploadCfg.querySelector('.icon-upload')?.closest('li');
  const [btnText, btnDelay = 0] = btnCfg.textContent.split('|');
  const btnSvg = btnCfg.querySelector('picture');
  const btn = createTag('a', { class: `psgateway-handler upload-btn body-xl` });
  const inputBtn = createTag('input', { class: 'inputFile', type: 'file'});
  btn.append(btnSvg, btnText, inputBtn);
  if(btn) layer.append(btn);
  setTimeout(() => {
    btn.classList.add('show-desktop-upload');
  }, btnDelay);
  btn.addEventListener('click', () => {
    handleUploadImage(layer, config, btn, mobileStep);
  });
}

function createStepList(config) {
  const excludeIcon = ['upload', 'start-over', 'upload-ps'];
  const spans = config.querySelectorAll('li .icon');
  const iAllClass = [...spans].map((s) => { 
    const ic = [...s.classList].filter((c) => c.match('icon-'))[0].split('-');
    ic.shift();
    return ic.join('-');
  });
  const hasUpload = iAllClass.includes('upload');
  const hasStartOver = iAllClass.includes('start-over');
  const iMobileClass = iAllClass.filter( (iac) => !excludeIcon.includes(iac));
  let steps = iMobileClass.slice();
  if (hasUpload) steps = steps.concat(['upload'], iMobileClass);
  if (hasStartOver) steps = steps.concat(['start-over']);
  return steps
}

export default async function stepInit(data) {
  data.target.classList.add('step-change-bg-tray');
  const config = data.stepConfigs[data.stepIndex];
  const layer = createTag('div', { class: `layer layer-${data.stepIndex}` });
  const mobileStep = {
    activeStep: -1,
    stepList: createStepList(config),
  };
  const selectorTray = changeBgSelectorTray(data, layer, config, mobileStep);
  changeBgUpload(layer, config, mobileStep);
  layer.append(selectorTray);
  renderMobileStep(layer, mobileStep);
  return layer;
}
