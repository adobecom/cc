import { getLibs } from '../../scripts/utils.js';
import { default as defineDeviceByScreenSize } from '../../scripts/decorate.js';

function getImgSrc(pic) {
  const viewport = defineDeviceByScreenSize() === 'MOBILE' ? 'mobile' : 'desktop';
  let source = '';
  if (viewport === 'mobile')
    source = pic.querySelector('source[type="image/webp"]:not([media])');
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

function loadImg(img) {
  if (!img) return;
  return new Promise((res) => {
    img.loading = 'eager';
    if (img.complete) {
      res();
      return;
    }
    img.onload = () => res();
    img.onerror = () => res();
    setTimeout(() => res(), 800);
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
  const img = createTag('img', { src: src, alt: alt });
  const pic = createTag('picture', {}, img);
  await loadImg(img);
  replaceEl.replaceWith(pic);
  target.classList.add('show-image');
  target.classList.remove('show-video');
}

async function createDisplayVideo(target, replaceEl, src) {
  const miloLibs = getLibs('/libs');
  const { createTag } = await import(`${miloLibs}/utils/utils.js`);
  const source = createTag('source', { src: src, type: 'video/mp4' });
  const video = createTag('video', {}, source);
  video.load();
  replaceEl.replaceWith(video);
  target.classList.add('show-video');
  target.classList.remove('show-image');
  video.play();
}

async function handleImageTransition(stepInfo, transitionCfg = {}) {
  const config = stepInfo.stepConfigs[stepInfo.stepIndex].querySelector('div');
  const trgtPic = stepInfo.target.querySelector(':scope > picture');
  const trgtVideo = stepInfo.target.querySelector(':scope > video');
  if (transitionCfg.useCfg) {
    if (transitionCfg.src) await createDisplayImg(stepInfo.target, trgtPic, transitionCfg.src, transitionCfg.alt);
    else await createDisplayVideo(stepInfo.target, trgtVideo, transitionCfg.vsrc);
    return
  }
  const displayPics = config.querySelectorAll(':scope > p > picture img[src*="media_"]');
  const displayVideos = config.querySelectorAll(':scope > p > a[href*=".mp4"]');
  const displayPath = stepInfo.displayPath;
  if (displayPics.length) await createDisplayImg(stepInfo.target, trgtPic, getImgSrc(displayPics[displayPath].closest('picture')), displayPics[displayPath].alt);
  else if (displayVideos.length) await createDisplayVideo(stepInfo.target, trgtVideo, displayVideos[displayPath].href);
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
  const { decorateDefaultLinkAnalytics } = await import(
    `${miloLibs}/martech/attributes.js`
  );
  await handleImageTransition(stepInfo);
  await loadAllImgs(currLayer.querySelectorAll('img[src*="media_"]'));
  await decorateDefaultLinkAnalytics(currLayer);
  stepInfo.target.classList.add(`step-${stepInfo.stepName}`);
  if (prevStepIndex) {
    stepInfo.target.classList.remove(`step-${stepInfo.stepList[prevStepIndex]}`);
  }
  currLayer.classList.add('show-layer');
  if (currLayer === prevLayer) return;
  prevLayer?.classList.remove('show-layer');
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

async function implementWorkflow(stepInfo) {
  const currLayer = stepInfo.target.querySelector(`.layer-${stepInfo.stepIndex}`);
  const layer = await stepInfo.stepInit(stepInfo);
  if (currLayer) layer.replaceWith(layer);
  else stepInfo.target.append(layer);
  await handleLayerDisplay(stepInfo);
  await handleNextStep(stepInfo);
}

async function getTargetArea(el) {
  const miloLibs = getLibs('/libs');
  const { createTag } = await import(`${miloLibs}/utils/utils.js`);
  const metadataSec = el.closest('.section');
  const previousSection = metadataSec.previousElementSibling;
  const intEnb = previousSection.querySelector('.marquee, .aside');
  if (!intEnb) return
  intEnb.classList.add('interactive-enabled');
  const assets = intEnb.querySelectorAll('.asset picture, .image picture');
  const iArea = createTag('div', { class: `interactive-holder show-image` });
  const pic = assets[assets.length - 1];
  const newPic = pic.cloneNode(true);
  const p = createTag('p', {}, newPic);
  el.querySelector(':scope > div > div').prepend(p);
  pic.querySelector('img').src = getImgSrc(pic);
  [...pic.querySelectorAll('source')].forEach((s) => s.remove());
  const videoSource = createTag('source', { src: ''});
  const video = createTag('video', {playsinline: '', autoplay: '', muted: '', loop: '', src: '', type: "video/mp4"}, videoSource);
  iArea.append(pic, video);
  intEnb.querySelector('.asset, .image').append(iArea);
  return iArea;
}

async function addBtnAnimation(ia) {
  const miloLibs = getLibs('/libs');
  const { createTag } = await import(`${miloLibs}/utils/utils.js`);
  const btns = ia.querySelectorAll('.layer .gray-button');
  [...btns].forEach((btn) => {
    const circle = createTag('div', { class: 'ia-circle' });
    btn.append(circle);
    btn.addEventListener('mouseover', (e) => {
      removeAnimation(ia);
    });
  });
}

function addAnimationToLayer(ia) {
  const btn = ia.querySelector('.layer .gray-button');
  if (btn) return addBtnAnimation(ia);
}

async function renderLayer(stepInfo) {
  let pResolve = null;
  let pReject = null;
  stepInfo.openForExecution = new Promise(function (resolve, reject) {
    pResolve = resolve;
    pReject = reject;
  });
  try {
    stepInfo.stepIndex = getNextStepIndex(stepInfo);
    if (stepInfo.stepIndex === 0) stepInfo.displayPath = 0;
    stepInfo.stepName = stepInfo.stepList[stepInfo.stepIndex];
    await implementWorkflow(stepInfo);
    pResolve();
  } catch (err) {
    window.lana.log(err);
    pReject();
  }
}

function removeAnimation(ia) {
  const btn = ia.querySelector('.layer .gray-button');
  if (!btn) return;
  btn.querySelector('.ia-circle').style.animation = 'none';
  btn.style.animation = 'none';
}

function getWorkFlowInformation(el) {
  let wfName = '';
  const intWorkFlowConfig = {
    'workflow-1': ['generate', 'selector-tray', 'crop', 'start-over'],
    'workflow-2': ['crop', 'crop', 'start-over'],
    'workflow-3': ['generate', 'selector-tray', 'generate', 'selector-tray', 'crop', 'start-over'],
    'workflow-4': ['selector-tray'],
  };
  const wfNames = Object.keys(intWorkFlowConfig);
  const stepList = [];
  [...el.classList].forEach((cn) => {
    if (cn.match('workflow-')) {
      wfName = cn;
      return;
    }
    if (cn.match('step-')) {
      stepList.push(cn.split('-')[1]);
    }
  });

  if (wfName === 'workflow-genfill') {
    const genArr = new Array(el.childElementCount - 1).fill('generate');
    genArr.push('start-over');
    return genArr;
  }
  if (wfNames.includes(wfName)) return intWorkFlowConfig[wfName];
  if (stepList.length) return stepList;
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
    openForExecution: true,
    handleImageTransition,
    getImgSrc,
  };

  await handleNextStep(stepInfo);
  await renderLayer(stepInfo);
  addAnimationToLayer(targetAsset);

  el.addEventListener('cc:interactive-switch', async (e) => {
    await renderLayer(stepInfo);
  });
}
