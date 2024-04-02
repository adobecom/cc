import { getLibs } from '../../scripts/utils.js';
import defineDeviceByScreenSize from '../../scripts/decorate.js';

function getImgSrc(pic) {
  const viewport = defineDeviceByScreenSize() === 'MOBILE' ? 'mobile' : 'desktop';
  let source = '';
  if (viewport === 'mobile') source = pic.querySelector('source[type="image/webp"]:not([media])');
  else source = pic.querySelector('source[type="image/webp"][media]');
  return source.srcset;
}

function getNextStepIndex(stepInfo) {
  return (stepInfo.stepIndex + 1) % stepInfo.stepList.length;
}

function getPrevStepIndex(stepInfo) {
  return stepInfo.stepIndex - 1 >= 0
    ? stepInfo.stepIndex - 1
    : stepInfo.stepList.length - 1;
}

async function loadJSandCSS(stepName) {
  const miloLibs = getLibs('/libs');
  const { loadStyle } = await import(`${miloLibs}/utils/utils.js`);
  const stepJS = `${window.location.origin}/creativecloud/features/interactive-components/${stepName}/${stepName}.js`;
  const stepCSS = `${window.location.origin}/creativecloud/features/interactive-components/${stepName}/${stepName}.css`;
  loadStyle(stepCSS);
  const { default: initFunc } = await import(stepJS);
  return initFunc;
}

function loadImg(img) {
  return new Promise((res) => {
    img.loading = 'eager';
    img.fetchpriority = 'high';
    if (img.complete) res();
    else {
      img.onload = () => res();
      img.onerror = () => res();
    }
  });
}

async function loadAllImgs(imgs) {
  const promiseLst = [];
  [...imgs].forEach((img) => {
    promiseLst.push(loadImg(img));
  });
  await Promise.allSettled(promiseLst);
}

async function createDisplayImg(target, replaceEl, src, alt) {
  const miloLibs = getLibs('/libs');
  const { createTag } = await import(`${miloLibs}/utils/utils.js`);
  const img = createTag('img', { src, alt });
  const pic = createTag('picture', {}, img);
  await loadImg(img);
  replaceEl.replaceWith(pic);
  target.classList.add('show-image');
  target.classList.remove('show-video');
}

async function createDisplayVideo(target, replaceEl, src) {
  const miloLibs = getLibs('/libs');
  const { createTag } = await import(`${miloLibs}/utils/utils.js`);
  const { pathname, hash } = new URL(src);
  const attrs = { playsinline: '', autoplay: '', muted: '' };
  const isAutoplay = hash?.includes('autoplay');
  const isAutoplayOnce = hash?.includes('autoplay1');
  if (isAutoplay && !isAutoplayOnce) attrs.loop = '';
  const source = createTag('source', { src: pathname, type: 'video/mp4' });
  const video = createTag('video', attrs, source);
  replaceEl.replaceWith(video);
  try {
    video.load();
    await video.play();
  } catch (err) {
    return;
  }
  target.classList.add('show-video');
  target.classList.remove('show-image');
}

async function handleImageTransition(stepInfo, transitionCfg = {}) {
  const config = stepInfo.stepConfigs[stepInfo.stepIndex].querySelector('div');
  const trgtPic = stepInfo.target.querySelector(':scope > picture');
  const trgtVideo = stepInfo.target.querySelector(':scope > video');
  if (transitionCfg.useCfg) {
    if (transitionCfg.src) {
      await createDisplayImg(stepInfo.target, trgtPic, transitionCfg.src, transitionCfg.alt);
    } else {
      await createDisplayVideo(stepInfo.target, trgtVideo, transitionCfg.vsrc);
    }
    return;
  }
  const displayPics = config.querySelectorAll(':scope > p > picture img[src*="media_"]');
  const displayVideos = config.querySelectorAll(':scope > p > a[href*=".mp4"]');
  const { displayPath } = stepInfo;
  if (displayPics.length) {
    const imgIdx = (displayPath < displayPics.length) ? displayPath : 0;
    const picSrc = getImgSrc(displayPics[imgIdx].closest('picture'));
    await createDisplayImg(stepInfo.target, trgtPic, picSrc, displayPics[imgIdx].alt);
  } else if (displayVideos.length) {
    const vidIdx = (displayPath < displayVideos.length) ? displayPath : 0;
    await createDisplayVideo(stepInfo.target, trgtVideo, displayVideos[vidIdx].href);
  }
}

async function handleNextStep(stepInfo) {
  const nextStepIndex = getNextStepIndex(stepInfo);
  stepInfo.stepInit = await loadJSandCSS(stepInfo.stepList[nextStepIndex]);
  await loadAllImgs(stepInfo.stepConfigs[nextStepIndex].querySelectorAll('img[src*="svg"]'));
}

async function handleLayerDisplay(stepInfo) {
  const currLayer = stepInfo.target.querySelector(`.layer-${stepInfo.stepIndex}`);
  const prevStepIndex = getPrevStepIndex(stepInfo);
  const prevLayer = stepInfo.target.querySelector(`.layer-${prevStepIndex}`);
  const miloLibs = getLibs('/libs');
  const { decorateDefaultLinkAnalytics } = await import(`${miloLibs}/martech/attributes.js`);
  await handleImageTransition(stepInfo);
  await loadAllImgs(currLayer.querySelectorAll('img[src*="media_"]'));
  await decorateDefaultLinkAnalytics(currLayer);
  if (prevStepIndex) stepInfo.target.classList.remove(`step-${stepInfo.stepList[prevStepIndex]}`);
  stepInfo.target.classList.add(`step-${stepInfo.stepName}`);
  currLayer.classList.add('show-layer');
  if (currLayer === prevLayer) return;
  prevLayer?.classList.remove('show-layer');
}

async function implementWorkflow(stepInfo) {
  const currLayer = stepInfo.target.querySelector(`.layer-${stepInfo.stepIndex}`);
  const layer = await stepInfo.stepInit(stepInfo);
  if (currLayer) currLayer.replaceWith(layer);
  else stepInfo.target.append(layer);
  await handleLayerDisplay(stepInfo);
  await handleNextStep(stepInfo);
}

function checkRenderStatus(targetBlock, res) {
  if (targetBlock.querySelector('.text') && targetBlock.querySelector('.image')) res();
  else setTimeout(() => checkRenderStatus(targetBlock, res), 100);
}

function intEnbReendered(targetBlock) {
  return new Promise((res, rej) => {
    try {
      checkRenderStatus(targetBlock, res);
    } catch (err) {
      rej();
    }
  });
}

async function getTargetArea(el) {
  const miloLibs = getLibs('/libs');
  const { createTag } = await import(`${miloLibs}/utils/utils.js`);
  const metadataSec = el.closest('.section');
  const intEnb = metadataSec.querySelector('.marquee, .aside');
  if (!intEnb) return null;
  await intEnbReendered(intEnb);
  intEnb.classList.add('interactive-enabled');
  const assets = intEnb.querySelectorAll('.asset picture, .image picture');
  const iArea = createTag('div', { class: 'interactive-holder show-image' });
  const pic = assets[assets.length - 1];
  const newPic = pic.cloneNode(true);
  const p = createTag('p', {}, newPic);
  el.querySelector(':scope > div > div').prepend(p);
  pic.querySelector('img').src = getImgSrc(pic);
  [...pic.querySelectorAll('source')].forEach((s) => s.remove());
  const video = createTag('video');
  const assetArea = intEnb.querySelector('.asset, .image');
  const container = pic.closest('p');
  iArea.append(pic, video);
  if (container) container.replaceWith(iArea);
  else assetArea.append(iArea);
  if (intEnb.classList.contains('heading-top')) {
    const h = intEnb.querySelector('.text').querySelector('h1, h2, h3, h4, h5, h6');
    if (h) {
      const htxt = h.textContent;
      const hTxtTop = createTag('div', { class: 'mobile-top-title' }, htxt);
      intEnb.querySelector('.image').prepend(hTxtTop);
    }
  }
  const enticementArrow = assetArea.querySelector(':scope > p img[src*="svg"]');
  if (enticementArrow) {
    const entP = enticementArrow.closest('p');
    const entTxt = createTag('div', { class: 'enticement-message' }, entP.textContent);
    const enticement = createTag('div', { class: 'enticement-container' });
    enticementArrow.classList.add('enticement-svg');
    enticement.append(entTxt, enticementArrow);
    entP.replaceWith(enticement);
  }
  return iArea;
}

function animationCallback(btn) {
  if (!btn) return;
  btn.classList.add('animated');
  btn.addEventListener('mouseover', () => { btn.classList.remove('animated'); });
}

async function addLayerAnimation(asset) {
  const ioEl = asset.querySelector('.gray-button');
  if (!ioEl) return;
  const miloLibs = getLibs('/libs');
  const { createIntersectionObserver } = await import(`${miloLibs}/utils/utils.js`);
  createIntersectionObserver({
    el: ioEl,
    callback: animationCallback,
    options: { threshold: 0.7 },
  });
}

async function renderLayer(stepInfo) {
  stepInfo.openForExecution = new Promise((resolve, reject) => {
    stepInfo.stepIndex = getNextStepIndex(stepInfo);
    if (stepInfo.stepIndex === 0) stepInfo.displayPath = 0;
    stepInfo.stepName = stepInfo.stepList[stepInfo.stepIndex];
    implementWorkflow(stepInfo)
      .then(() => resolve())
      .catch(() => reject());
  });
}

function getWorkFlowInformation(el) {
  let wfName = '';
  const intWorkFlowConfig = {
    'workflow-generate-crop': ['generate', 'selector-tray', 'crop', 'start-over'],
    'workflow-generate-repeat-crop': ['generate', 'selector-tray', 'generate', 'selector-tray', 'crop', 'start-over'],
    'workflow-hue-sat': ['slider-tray'],
  };
  const wfNames = Object.keys(intWorkFlowConfig);
  [...el.classList].forEach((cn) => { if (cn.match('workflow-')) wfName = cn; });
  if (wfName === 'workflow-genfill') {
    const genArr = new Array(el.childElementCount - 1).fill('generate');
    genArr.push('start-over');
    return genArr;
  }
  if (wfNames.includes(wfName)) {
    return intWorkFlowConfig[wfName];
  }
  if (wfName) {
    const stepReplace = { selectortray: 'selector-tray', startover: 'start-over' };
    const replaceNames = Object.keys(stepReplace);
    const wfList = wfName.split('workflow-')[1].split('-');
    wfList.forEach((w, i) => { if (replaceNames.includes(w)) wfList[i] = stepReplace[w]; });
    return wfList;
  }
  return [];
}

export default async function init(el) {
  const workflow = getWorkFlowInformation(el);
  if (!workflow.length) return;
  const targetAsset = await getTargetArea(el);
  if (!targetAsset) return;
  const stepInfo = {
    el,
    stepIndex: -1,
    stepName: '',
    stepList: workflow,
    stepConfigs: el.querySelectorAll(':scope > div'),
    nextStepEvent: 'cc:interactive-switch',
    target: targetAsset,
    displayPath: 0,
    openForExecution: Promise.resolve(true),
    handleImageTransition,
    getImgSrc,
  };
  await handleNextStep(stepInfo);
  await renderLayer(stepInfo);
  await addLayerAnimation(targetAsset);
  if (workflow.length === 1) return;
  el.addEventListener('cc:interactive-switch', async () => {
    await renderLayer(stepInfo);
  });
}
