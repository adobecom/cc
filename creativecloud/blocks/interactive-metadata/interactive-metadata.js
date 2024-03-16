import { getLibs, createTag } from '../../scripts/utils.js';

function getNextStepIndex(stepInfo) {
  return (stepInfo.stepIndex + 1) % stepInfo.stepCount;
}

function getPrevStepIndex(stepInfo) {
  return stepInfo.stepIndex - 1 >= 0
    ? stepInfo.stepIndex - 1
    : stepInfo.stepList.length - 1;
}

function handleNextStep(stepInfo) {
  const eagerLoad = (lcpImg) => {
    lcpImg?.setAttribute('loading', 'eager');
    lcpImg?.setAttribute('fetchpriority', 'high');
  };
  const nextStepIndex = getNextStepIndex(stepInfo);
  const nextImgs = stepInfo.stepConfigs[nextStepIndex].querySelectorAll('img');
  [...nextImgs].forEach(eagerLoad);
}

function handleImageTransition(target, stepInfo) {
  const stepPic = stepInfo.stepConfigs[stepInfo.stepIndex].querySelector('picture');
  const hasStepPic = !stepPic.querySelector('img').src.includes('.svg');
  if (!hasStepPic) return;
  const stepPicClone = stepPic.cloneNode(true);
  stepPic.insertAdjacentElement('afterEnd', stepPicClone);
  target.querySelector('picture').replaceWith(stepPic);
}

function handleLCPImage(target, stepInfo) {
  if (stepInfo.stepIndex !== 0) return;
  const pic = target.querySelector('picture');
  const picClone = pic.cloneNode(true);
  stepInfo.stepConfigs[0].querySelector('p').parentElement.prepend(picClone);
}

function handleLayerDisplay(target, stepInfo) {
  handleImageTransition(target, stepInfo);
  const currLayer = target.querySelector(`.layer-${stepInfo.stepIndex}`);
  const prevStepIndex = getPrevStepIndex(stepInfo);
  const prevLayer = target.querySelector(`.layer-${prevStepIndex}`);
  prevLayer?.classList.remove('show-layer');
  target.classList.remove(`step-${stepInfo.stepList[prevStepIndex]}`);
  target.classList.add(`step-${stepInfo.stepName}`);
  currLayer.classList.add('show-layer');
}

async function implementWorkflow(el, target, stepInfo) {
  const miloLibs = getLibs('/libs');
  const { loadStyle } = await import(`${miloLibs}/utils/utils.js`);
  const currLayer = target.querySelector(`.layer-${stepInfo.stepIndex}`);
  if (currLayer) {
    handleLayerDisplay(target, stepInfo);
    handleNextStep(stepInfo);
    return;
  }
  const stepJS = `${window.location.origin}/creativecloud/features/interactive-components/${stepInfo.stepName}/${stepInfo.stepName}.js`;
  const stepCSS = `${window.location.origin}/creativecloud/features/interactive-components/${stepInfo.stepName}/${stepInfo.stepName}.css`;
  loadStyle(stepCSS);
  const { default: stepInit } = await import(stepJS);
  await stepInit({
    target,
    config: stepInfo.stepConfigs[stepInfo.stepIndex],
    stepIndex: stepInfo.stepIndex,
  });
  const layerName = `.layer-${stepInfo.stepIndex}`;
  handleLCPImage(target, stepInfo);
  handleLayerDisplay(target, stepInfo);
  nextStepEventListener(el, target, layerName, stepInfo);
  handleNextStep(stepInfo);
}

function nextStepEventListener(el, target, layerName, stepInfo) {
  const nextSteps = target.querySelectorAll(`${layerName} .next-step`);
  nextSteps.forEach((nextStep) => {
    nextStep.addEventListener('click', async (e) => {
      stepInfo.stepIndex = getNextStepIndex(stepInfo);
      stepInfo.stepName = stepInfo.stepList[stepInfo.stepIndex];
      await implementWorkflow(el, target, stepInfo);
    });
  });
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
    'workflow-1': ['generate', 'crop', 'start-over'],
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
  const stepInfo = {
    stepIndex: 0,
    stepName: workflow[0],
    stepList: workflow,
    stepCount: workflow.length,
    stepConfigs: el.querySelectorAll(':scope > div'),
    handleImageTransition,
  };
  await implementWorkflow(el, targetAsset, stepInfo);
}
