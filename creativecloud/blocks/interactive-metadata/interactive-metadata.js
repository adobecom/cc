import { getLibs, createTag, loadStyle } from '../../scripts/utils.js';
import defineDeviceByScreenSize from '../../scripts/decorate.js';

export function getImgSrc(pic) {
  const viewport = defineDeviceByScreenSize() === 'MOBILE' ? 'mobile' : 'desktop';
  let source = '';
  if (viewport === 'mobile') source = pic.querySelector('source[type="image/webp"]:not([media])');
  else source = pic.querySelector('source[type="image/webp"][media]');
  return source?.srcset;
}

function getNextStepIndex(stepInfo) {
  return (stepInfo.stepIndex + 1) % stepInfo.stepList.length;
}

function getPrevStepIndex(stepInfo) {
  return stepInfo.stepIndex - 1 >= 0
    ? stepInfo.stepIndex - 1
    : stepInfo.stepList.length - 1;
}

function animationCallback(btn) {
  btn.classList.add('animated');
  ['mouseover', 'focus'].forEach((event) => {
    btn.addEventListener(event, () => { btn.classList.remove('animated'); });
  });
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

async function loadJSandCSS(stepName) {
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

function preloadAsset(nextStepIndex, stepInfo) {
  const das = stepInfo.stepConfigs[nextStepIndex]
    .querySelectorAll(':scope > div > p > picture img[src*="media_"], :scope > div > p > a[href*=".mp4"]');
  if (!das.length) return;
  const { displayPath } = stepInfo;
  const daIdx = (displayPath < das.length) ? displayPath : 0;
  const da = das[daIdx];
  if (da.nodeName === 'A') {
    const { pathname } = new URL(da.href);
    const video = createTag('video', { src: pathname });
    video.load();
  } else if (da.nodeName === 'IMG') {
    const src = getImgSrc(da.closest('picture'));
    fetch(src);
  }
}

async function loadAllImgs(imgs) {
  const promiseLst = [];
  [...imgs].forEach((img) => {
    promiseLst.push(loadImg(img));
  });
  await Promise.allSettled(promiseLst);
}

async function createDisplayImg(target, replaceEl, src, alt) {
  const newImg = createTag('img', { src, alt });
  const img = replaceEl.querySelector('img');
  await loadImg(newImg);
  img.src = src;
  img.alt = alt;
  target.classList.add('show-image');
  target.classList.remove('show-video');
}

async function createDisplayVideo(target, video, src, poster = '') {
  const { pathname, hash } = new URL(src);
  const attrs = { src: pathname, playsinline: '', autoplay: '', muted: '', type: 'video/mp4' };
  if (poster !== '') attrs.poster = poster;
  if (hash?.includes('autoplay1') || !video.hasAttribute('loop')) video?.removeAttribute('loop');
  else attrs.loop = '';
  Object.keys(attrs).forEach((attr) => video?.setAttribute(attr, attrs[attr]));
  try {
    video?.load();
    video.oncanplaythrough = async () => {
      await video.play();
    };
  } catch (err) { return; }
  target.classList.add('show-video');
  target.classList.remove('show-image');
}

export async function handleImageTransition(stepInfo, transitionCfg = {}) {
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
  const displayVideos = config.querySelectorAll(':scope > p > a[href*=".mp4"], :scope > p > video');
  const { displayPath } = stepInfo;
  if (displayPics.length) {
    const imgIdx = (displayPath < displayPics.length) ? displayPath : 0;
    const picSrc = getImgSrc(displayPics[imgIdx].closest('picture'));
    await createDisplayImg(stepInfo.target, trgtPic, picSrc, displayPics[imgIdx].alt);
  } else if (displayVideos.length) {
    const vidIdx = (displayPath < displayVideos.length) ? displayPath : 0;
    if (displayVideos[vidIdx].nodeName === 'A') {
      const posterImg = displayVideos[vidIdx].getAttribute('data-video-poster') ? displayVideos[vidIdx].getAttribute('data-video-poster') : '';
      await createDisplayVideo(stepInfo.target, trgtVideo, displayVideos[vidIdx].href, posterImg);
    } else if (displayVideos[vidIdx].nodeName === 'VIDEO') {
      const posterImg = displayVideos[vidIdx].getAttribute('poster') ? displayVideos[vidIdx].getAttribute('poster') : '';
      await createDisplayVideo(
        stepInfo.target,
        trgtVideo,
        displayVideos[vidIdx].dataset.videoSource,
        posterImg,
      );
    }
  }
}

async function handleNextStep(stepInfo) {
  const nextStepIndex = getNextStepIndex(stepInfo);
  stepInfo.stepInit = await loadJSandCSS(stepInfo.stepList[nextStepIndex]);
  await loadAllImgs(stepInfo.stepConfigs[nextStepIndex].querySelectorAll('img[src*="svg"]'));
  preloadAsset(nextStepIndex, stepInfo);
}

async function handleLayerDisplay(stepInfo) {
  const clsLayer = stepInfo.target.querySelector('.layer-placeholder');
  const currLayer = stepInfo.target.querySelector(`.layer-${stepInfo.stepIndex}`);
  const prevStepIndex = getPrevStepIndex(stepInfo);
  const prevLayer = stepInfo.target.querySelector(`.layer-${prevStepIndex}`);
  const miloLibs = getLibs('/libs');
  const { decorateDefaultLinkAnalytics } = await import(`${miloLibs}/martech/attributes.js`);
  await handleImageTransition(stepInfo);
  await loadAllImgs(currLayer.querySelectorAll('img[src*="media_"]'));
  await decorateDefaultLinkAnalytics(currLayer);
  if (prevStepIndex !== stepInfo.stepIndex) stepInfo.target.classList.remove(`step-${stepInfo.stepList[prevStepIndex]}`);
  if (clsLayer) clsLayer.remove();
  stepInfo.target.classList.add(`step-${stepInfo.stepName}`);
  currLayer.classList.add('show-layer');
  if (currLayer === prevLayer) return;
  prevLayer?.classList.remove('show-layer');
}

async function implementWorkflow(stepInfo) {
  const currLayer = stepInfo.target.querySelector(`.layer-${stepInfo.stepIndex}`);
  const layer = await stepInfo.stepInit(stepInfo);
  if (currLayer) currLayer.replaceWith(layer);
  else {
    stepInfo.target.append(layer);
    if (stepInfo.stepIndex === 0) await addLayerAnimation(stepInfo.target);
  }
  await handleLayerDisplay(stepInfo);
  if (stepInfo.stepList.length === 1) return;
  await handleNextStep(stepInfo);
}

function checkRenderStatus(targetBlock, res, rej, etime, rtime) {
  if (etime > 20000) { rej(); return; }
  if (targetBlock.querySelector('.text') && targetBlock.querySelector('.asset, .image')) res();
  else setTimeout(() => checkRenderStatus(targetBlock, res, rej, etime + rtime), rtime);
}

function intEnbReendered(targetBlock) {
  return new Promise((res, rej) => {
    try {
      checkRenderStatus(targetBlock, res, rej, 0, 100);
    } catch (err) { rej(); }
  });
}

function decorateEnticementArrow(aa) {
  const enticementArrow = aa.querySelector(':scope > p img[src*="svg"]');
  if (!enticementArrow) return;
  const entP = enticementArrow.closest('p');
  const entTxt = createTag('div', { class: 'enticement-message' }, entP.textContent);
  const enticement = createTag('div', { class: 'enticement-container' });
  enticementArrow.classList.add('enticement-svg');
  enticement.append(entTxt, enticementArrow);
  entP.replaceWith(enticement);
}

function decorateMobileHeading(intEnb) {
  if (!intEnb.classList.contains('mobile-heading-top')) return;
  const h = intEnb.querySelector('.text').querySelector('h1, h2, h3, h4, h5, h6');
  if (!h) return;
  const htxt = h.textContent;
  const hTxtTop = createTag('div', { class: 'mobile-heading-top' }, htxt);
  intEnb.querySelector('.image, .asset').prepend(hTxtTop);
}

function createInteractiveArea(el, asset) {
  const iArea = createTag('div', { class: 'interactive-holder' });
  const newPic = asset.cloneNode(true);
  const p = createTag('p', {}, newPic);
  el.querySelector(':scope > div > div').prepend(p);
  const imgElem = asset.querySelector('img');
  let assetElem = '';
  if (imgElem) {
    imgElem.src = getImgSrc(asset);
    assetElem = createTag('video');
    iArea.classList.add('show-image');
    [...asset.querySelectorAll('source')].forEach((s) => s.remove());
  } else {
    assetElem = createTag('picture');
    const img = createTag('img', { alt: '' });
    assetElem.append(img);
    if (!asset.src) asset.src = asset.dataset.videoSource;
    iArea.classList.add('show-video');
  }
  iArea.append(asset, assetElem);
  const clsLayer = createTag('div', { class: 'layer layer-placeholder show-layer' });
  iArea.append(clsLayer);
  if (el.classList.contains('light')) iArea.classList.add('light');
  else if (el.classList.contains('dark')) iArea.classList.add('dark');
  return iArea;
}

async function getTargetArea(el) {
  const metadataSec = el.closest('.section');
  const intEnb = metadataSec.querySelector('.marquee, .aside');
  if (!intEnb) return null;
  try {
    intEnb.classList.add('interactive-enabled');
    await intEnbReendered(intEnb);
  } catch (err) { return null; }
  const assets = intEnb.querySelectorAll('.asset picture, .image picture, .asset a.video, .image a.video, .asset video, .image video');
  const container = assets[assets.length - 1].closest('p');
  const iArea = createInteractiveArea(el, assets[assets.length - 1]);
  const assetArea = intEnb.querySelector('.asset, .image');
  if (container) container.replaceWith(iArea);
  else assetArea.append(iArea);
  decorateMobileHeading(intEnb);
  decorateEnticementArrow(assetArea);
  return iArea;
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
    'workflow-generate-select-generate': ['generate', 'selector-tray', 'generate', 'crop', 'start-over'],
    'workflow-generate-select': ['generate', 'selector-tray', 'start-over'],
    'workflow-generate-selector': ['generate', 'selector-tray', 'generate', 'start-over'],
    'workflow-generate-triple-selector': ['generate', 'selector-tray', 'generate', 'selector-tray', 'generate', 'selector-tray', 'start-over'],
    'workflow-startover': ['start-over', 'start-over'],
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
  const stepInfo = {
    el,
    stepIndex: -1,
    stepName: '',
    stepList: workflow,
    stepConfigs: el.querySelectorAll(':scope > div'),
    nextStepEvent: 'cc:interactive-switch',
    displayPath: 0,
    openForExecution: Promise.resolve(true),
  };
  await handleNextStep(stepInfo);
  const targetAsset = await getTargetArea(el);
  if (!targetAsset) return;
  stepInfo.target = targetAsset;
  await renderLayer(stepInfo);
  if (workflow.length === 1) return;
  el.addEventListener('cc:interactive-switch', async () => {
    await renderLayer(stepInfo);
  });
}
