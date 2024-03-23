import { getLibs } from '../../scripts/utils.js';

function getNextStepIndex(stepInfo) {
  return (stepInfo.stepIndex + 1) % stepInfo.stepCount;
}

function getPrevStepIndex(stepInfo) {
  return stepInfo.stepIndex - 1 >= 0
    ? stepInfo.stepIndex - 1
    : stepInfo.stepList.length - 1;
}

function handleImageLayerTransition(target, idx) {
  const layerIA = target.querySelector(`.interactive-area.ia-layer-${idx}`);
  if (!layerIA.classList.contains('ia-hide')) return;
  const visibleIA = target.querySelector('.interactive-area:not(.ia-hide)');
  visibleIA?.classList.add('ia-hide');
  layerIA?.classList.remove('ia-hide');
}

function handleImageTransition(stepInfo, idx = -1, switchImg = false) {
  const layerIA = stepInfo.target.querySelector(`.interactive-area.ia-layer-${stepInfo.stepIndex}`);
  if (switchImg) {
    layerIA?.querySelector('.ia-active-asset')?.classList.remove('ia-active-asset');
    layerIA?.children[idx]?.classList.add('ia-active-asset');
    return;
  }
  handleImageLayerTransition(stepInfo.target, stepInfo.stepIndex);
}

function getDisplayAssets(config) {
  return config.querySelectorAll(':scope > picture > img[src*="media_"], :scope > a[href*=".mp4"], :scope > ul > li picture:nth-child(1)')
} 

async function handleNextStep(stepInfo, layerExists) {
  if (layerExists) return handleImageLayerTransition(stepInfo.target, stepInfo.stepIndex);
  const nextStepIndex = getNextStepIndex(stepInfo);
  stepInfo.stepInit = await loadJSandCSS(stepInfo.stepList[nextStepIndex]);
  let assetConfig = stepInfo.target;
  if (stepInfo.stepIndex !== -1) assetConfig = stepInfo.stepConfigs[nextStepIndex].querySelector('div');
  const assets = getDisplayAssets(assetConfig);
  if (!assets.length) {
    const ias = stepInfo.target.querySelectorAll('.interactive-area');
    if (ias.length) ias[ias.length - 1]?.classList.add(`ia-layer-${nextStepIndex}`);
    return;
  }
  const miloLibs = getLibs('/libs');
  const { createTag } = await import(`${miloLibs}/utils/utils.js`);
  const interactiveArea = createTag('div', { class: `interactive-area ia-layer-${nextStepIndex}`});
  if (stepInfo.stepIndex !== -1) interactiveArea.classList.add('ia-hide');
  interactiveArea.dataset.interactiveFlow = 0;
  [...assets].forEach((asset) => {
    if (asset.nodeName === "IMG") interactiveArea.append(asset.closest('picture'));
    else interactiveArea.append(asset);
  });
  interactiveArea.children[0].classList.add('ia-active-asset');
  stepInfo.target.append(interactiveArea);
}

async function handleLayerDisplay(stepInfo) {
  handleImageTransition(stepInfo);
  const currLayer = stepInfo.target.querySelector(`.layer-${stepInfo.stepIndex}`);
  const prevStepIndex = getPrevStepIndex(stepInfo);
  const prevLayer = stepInfo.target.querySelector(`.layer-${prevStepIndex}`);
  stepInfo.target.classList.remove(`step-${stepInfo.stepList[prevStepIndex]}`);
  stepInfo.target.classList.add(`step-${stepInfo.stepName}`);
  const miloLibs = getLibs('/libs');
  const { decorateDefaultLinkAnalytics } = await import(`${miloLibs}/martech/attributes.js`);
  await decorateDefaultLinkAnalytics(currLayer);
  currLayer.classList.add('show-layer');
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

async function implementWorkflow(el, stepInfo) {
  const currLayer = stepInfo.target.querySelector(`.layer-${stepInfo.stepIndex}`);
  if (currLayer) {
    await handleLayerDisplay(stepInfo);
    await handleNextStep(stepInfo, true);
    return;
  }
  await stepInfo.stepInit(stepInfo);
  const layerName = `.layer-${stepInfo.stepIndex}`;
  await handleLayerDisplay(stepInfo);
  await handleNextStep(stepInfo, false);
}

function getTargetArea(el) {
  const metadataSec = el.closest('.section');
  const previousSection = metadataSec.previousElementSibling;
  const tmb = previousSection.querySelector('.marquee, .aside');
  tmb?.classList.add('interactive-enabled');
  return tmb.querySelector('.asset, .image');
}

function getWorkFlowInformation(el) {
  let wfName = '';
  const intWorkFlowConfig = {
    'workflow-1': ['generate', 'selector-tray', 'crop', 'start-over'],
    'workflow-2': ['crop', 'crop', 'start-over']
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

  if(wfName === 'workflow-genfill') {
    const genArr = new Array(el.childElementCount - 1).fill('generate');
    genArr.push('start-over');
    return genArr;
  }
  if (wfNames.includes(wfName)) return intWorkFlowConfig[wfName];
  if (stepList.length) return stepList;
  return [];
}

async function addBtnAnimation(ia) {
  const miloLibs = getLibs('/libs');
  const { createTag } = await import(`${miloLibs}/utils/utils.js`);
  const btns = ia.querySelectorAll('.layer .gray-button');
  [...btns].forEach(btn => {
    const circle = createTag('div', { class: 'ia-circle' });
    btn.append(circle);
  });
}

function addAnimationToLayer(ia) {
  if (ia.querySelector('.layer .gray-button')) addBtnAnimation(ia);
}

async function renderLayer(stepInfo) {
  let pResolve = null;
  stepInfo.openForExecution = new Promise( function(resolve, reject) { pResolve = resolve });
  stepInfo.stepIndex = getNextStepIndex(stepInfo);
  stepInfo.stepName = stepInfo.stepList[stepInfo.stepIndex];
  await implementWorkflow(stepInfo.el, stepInfo);
  pResolve();
}

function removeAnimation(ia) {
  const btn = ia.querySelector('.layer .gray-button')
  if (btn) {
    btn.querySelector('.ia-circle').style.animation = 'none';
    btn.style.animation = 'none';
  }
}

export default async function init(el) {
  const workflow = getWorkFlowInformation(el);
  if (!workflow.length) return;
  const targetAsset = getTargetArea(el);
  if (!targetAsset) return;
  const stepInfo = {
    el,
    stepIndex: -1,
    stepName: workflow[0],
    stepList: workflow,
    stepCount: workflow.length,
    stepConfigs: el.querySelectorAll(':scope > div'),
    handleImageTransition,
    nextStepEvent: 'cc:interactive-switch',
    target: targetAsset,
    openForExecution: true,
  };
  await handleNextStep(stepInfo, false);
  await renderLayer(stepInfo);
  addAnimationToLayer(targetAsset);
  el.addEventListener('cc:interactive-switch', async (e) => {
    removeAnimation(targetAsset);
    await renderLayer(stepInfo);
  });
}
