/* eslint-disable no-restricted-syntax */
/* eslint-disable max-len */
import miloLibs from '../../scripts/scripts.js';

const { getConfig } = await import(`${miloLibs}/utils/utils.js`);
const customElem = document.createElement('ft-changebackgroundmarquee');
let excelLink = '';
const configObj = {};
const config = getConfig();
const base = config.codeRoot;

const decorateBlockBg = (node) => {
  const viewports = ['mobile-only', 'tablet-only', 'desktop-only'];
  const { children } = node;
  const childCount = node.childElementCount;
  if (childCount === 2) {
    children[0].classList.add(viewports[0], viewports[1]);
    children[1].classList.add(viewports[2]);
  }

  [...children].forEach(async (child, index) => {
    if (childCount === 3) {
      child.classList.add(viewports[index], 'blade');
    }
  });
  console.log('1---------------');
};

function getImageSrc(node) {
  return Array.from(node).map((el) => {
    const a = el.querySelector('picture > img').src;
    return a;
  });
}

function getText(node) {
  return Array.from(node).map((el) => el.innerText.trim());
}

function getValue(childrenArr, type) {
  const valueArr = type === 'img' ? getImageSrc(childrenArr) : getText(childrenArr);
  let newData = [];
  if (valueArr.length === 1) {
    newData = [valueArr[0], valueArr[0], valueArr[0]];
  } else if (valueArr.length === 2) {
    newData = [valueArr[0], valueArr[0], valueArr[1]];
  } else {
    newData = [valueArr[0], valueArr[1], valueArr[2]];
  }
  return newData;
}

function processDataSet(dataSet) {
  const { children } = dataSet;
  const childrenArr = [...children];
  return childrenArr;
}

function getImageUrlValues(dataSet, objKeys, viewportType) {
  let childrenArr = '';
  if (objKeys === 'defaultBgSrc') {
    childrenArr = processDataSet(dataSet[0]);
  } else if (objKeys === 'talentSrc') {
    childrenArr = processDataSet(dataSet[1]);
  } else if (objKeys === 'marqueeTitleImgSrc') {
    childrenArr = processDataSet(dataSet[2]);
  }
  const getValueArr = getValue(childrenArr, 'img');
  if (viewportType === 'desktop') {
    return getValueArr[2];
  } else if (viewportType === 'tablet') {
    return getValueArr[1];
  }
  return getValueArr[0];
}

function getTextItemValues(dataSet, viewportType, flag) {
  const childrenArr = processDataSet(dataSet);
  if (flag) {
    childrenArr.shift();
  }
  const getValueArr = getValue(childrenArr, 'text');
  if (viewportType === 'desktop') {
    return getValueArr[2];
  } else if (viewportType === 'tablet') {
    return getValueArr[1];
  }
  return getValueArr[0];
}

function getIconAndName(dataSet, viewportType) {
  const childrenArr = processDataSet(dataSet);
  const objArr = [];
  const iconBlock = childrenArr.shift();
  objArr['iconUrl'] = iconBlock.querySelector('picture > img').src;
  objArr['name'] = getTextItemValues(dataSet, viewportType, true);
  return objArr;
}

async function createConfig(el) {
  customElem.config = configObj;
  const dataSet = el.querySelectorAll(':scope > div');
  for (const viewportType of ['mobile', 'tablet', 'desktop']) {
    const viewportObj = {};
    for (const objKeys of ['defaultBgSrc', 'talentSrc', 'marqueeTitleImgSrc']) {
      viewportObj[objKeys] = getImageUrlValues(dataSet, objKeys, viewportType);
    }
    viewportObj['tryitText'] = getTextItemValues(dataSet[3], viewportType);
    viewportObj['groups'] = [];
    for (let i = 4; i < dataSet.length - 1; i++) {
      const arr = getIconAndName(dataSet[i], viewportType);
      viewportObj.groups.push({'iconUrl': arr.iconUrl, 'name': arr.name});
    }
    // TODO: uncomment when needed
    configObj[viewportType] = viewportObj;
  }
  // customElem.config = configObj;
  excelLink = dataSet[dataSet.length - 1].innerText.trim();
  console.log('2---------------------');
  el.innerText = '';
  el.appendChild(customElem);
}

export default async function init(el) {
  const dataSet = el.querySelectorAll(':scope > div');
  if (dataSet.length > 1) {
    dataSet[0].classList.add('background');
    decorateBlockBg(dataSet[0]);
  }
  import(`${base}/deps/blades/interactivemarquee.js`);
  createConfig(el);
}
