import { getLibs } from '../../scripts/utils.js';

function getNextStepIndex(stepInfo) {
  return (stepInfo.stepIndex + 1) % stepInfo.stepCount;
}

function getPrevStepIndex(stepInfo) {
  return stepInfo.stepIndex - 1 >= 0
    ? stepInfo.stepIndex - 1
    : stepInfo.stepList.length - 1;
}

async function handleNextStep(stepInfo) {
  const eagerLoad = (lcpImg) => {
    lcpImg?.setAttribute('loading', 'eager');
    lcpImg?.setAttribute('fetchpriority', 'high');
  };
  const nextStepIndex = getNextStepIndex(stepInfo);
  stepInfo.stepInit = await loadJSandCSS(stepInfo.stepList[nextStepIndex]);
  const nextImgs = stepInfo.stepConfigs[nextStepIndex].querySelectorAll('img');
  [...nextImgs].forEach(eagerLoad);
}

function handleImageTransition(stepInfo) {
  const stepPic = stepInfo.stepConfigs[stepInfo.stepIndex].querySelector('picture');
  const hasStepPic = !stepPic.querySelector('img').src.includes('.svg');
  if (!hasStepPic) return;
  const stepPicClone = stepPic.cloneNode(true);
  stepPic.insertAdjacentElement('afterEnd', stepPicClone);
  stepInfo.target.querySelector('picture').replaceWith(stepPic);
}

function handleLCPImage(stepInfo) {
  if (stepInfo.stepIndex !== 0) return;
  const pic = stepInfo.target.querySelector('picture');
  const picClone = pic.cloneNode(true);
  stepInfo.stepConfigs[0].querySelector('p').parentElement.prepend(picClone);
}

function handleLayerDisplay(stepInfo) {
  handleImageTransition(stepInfo);
  const currLayer = stepInfo.target.querySelector(`.layer-${stepInfo.stepIndex}`);
  const prevStepIndex = getPrevStepIndex(stepInfo);
  const prevLayer = stepInfo.target.querySelector(`.layer-${prevStepIndex}`);
  prevLayer?.classList.remove('show-layer');
  stepInfo.target.classList.remove(`step-${stepInfo.stepList[prevStepIndex]}`);
  stepInfo.target.classList.add(`step-${stepInfo.stepName}`);
  currLayer.classList.add('show-layer');
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
    handleLayerDisplay(stepInfo);
    handleNextStep(stepInfo);
    return;
  }
  await stepInfo.stepInit(stepInfo);
  const layerName = `.layer-${stepInfo.stepIndex}`;
  handleLCPImage(stepInfo);
  handleLayerDisplay(stepInfo);
  await handleNextStep(stepInfo);
}

function getTargetArea(el) {
  const metadataSec = el.closest('.section');
  const previousSection = metadataSec.previousElementSibling;
  const tmb = previousSection.querySelector('.marquee, .aside');
  tmb?.classList.add('interactive-enabled');
  return tmb.querySelector('.asset');
}

function getWorkFlowInformation(el) {
  let wfName = '';
  const intWorkFlowConfig = {
    'workflow-1': ['generate', 'selector-tray', 'crop', 'start-over'],
    'workflow-2': ['crop', 'crop', 'start-over'],
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
  if (wfNames.includes(wfName)) return intWorkFlowConfig[wfName];
  if (stepList.length) return stepList;
  return [];
}

export default async function init(el) {
  const workflow = getWorkFlowInformation(el);
  if (!workflow.length) return;
  const targetAsset = getTargetArea(el);
  if (!targetAsset) return;
  const stepInit = await loadJSandCSS(workflow[0]);
  const stepInfo = {
    el,
    stepIndex: 0,
    stepName: workflow[0],
    stepList: workflow,
    stepCount: workflow.length,
    stepConfigs: el.querySelectorAll(':scope > div'),
    handleImageTransition,
    stepInit,
    nextStepEvent: 'cc:interactive-switch',
    target: targetAsset,
  };
  await implementWorkflow(el, stepInfo);
  el.addEventListener('cc:interactive-switch', async (e) => {
    console.log('mathuria new event');
    stepInfo.stepIndex = getNextStepIndex(stepInfo);
    stepInfo.stepName = stepInfo.stepList[stepInfo.stepIndex];
    await implementWorkflow(el, stepInfo);
  });
}
