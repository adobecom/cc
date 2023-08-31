/* eslint-disable no-restricted-syntax */
/* eslint-disable no-self-assign */
/* eslint-disable prefer-destructuring */
import miloLibs from '../../scripts/scripts.js';

const { getConfig } = await import(`${miloLibs}/utils/utils.js`);
const config = getConfig();
const customElem = document.createElement('ft-changebackgroundmarquee');
let excelJsonData = '';
let excelLink = '';
const base = config.codeRoot;
const configObj = {};

function getImageSrc(node) {
  return Array.from(node).map((el) => {
    const a = el.querySelector('picture > img').currentSrc;
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

async function getExcelData(excelLink) {
  const resp = await fetch(`${excelLink}`);
  const html = await resp.json();
  const { data } = html;
  const arr = [];
  data.forEach((grp) => {
    arr.push(grp);
  });
  return arr;
}

function getExcelDataCursor(excelJson, type) {
  const foundData = excelJson.find((data) => data.MappedName === type);
  if (foundData) {
    return foundData.Value1;
  }
  return null;
}

function getSrcFromExcelData(name, viewportType, excelData, type) {
  const arr = [];
  excelData.forEach((data) => {
    if (data.ComponentName === name && data.Viewport === viewportType && data.MappedName === type) {
      if (data.Value1.trim() !== '') {
        arr.push(data.Value1);
      }
      if (data.Value2.trim() !== '') {
        arr.push(data.Value2);
      }
      if (data.Value3.trim() !== '') {
        arr.push(data.Value3);
      }
    }
  });
  return arr;
}

function createConfigExcel(excelJson, configObjData) {
  for (const viewportType of ['desktop', 'tablet', 'mobile']) {
    configObjData[`${viewportType}`].tryitSrc = getExcelDataCursor(excelJson, 'tryitSrc');
    configObjData[`${viewportType}`].cursorSrc = getExcelDataCursor(excelJson, 'cursorSrc');
    const existingGroups = configObjData[`${viewportType}`].groups;
    for (const group of existingGroups) {
      const name = group.name;
      const groupsrc = getSrcFromExcelData(name, viewportType, excelJson, 'src');
      const groupswatchSrc = getSrcFromExcelData(name, viewportType, excelJson, 'swatchSrc');
      if (groupsrc.length > 0 && groupswatchSrc.length > 0) {
        group.options = [];
        for (let i = 0; i < groupsrc.length; i++) {
          group.options.push({'src': groupsrc[i], 'swatchSrc': groupswatchSrc[i]});
        }
      }
      if (groupsrc.length > 0 && groupswatchSrc.length === 0) {
        group.options = [];
        for (let i = 0; i < groupsrc.length; i++) {
          group.options.push({'src': groupsrc[i]});
        }
      }
    }
  }
}

async function createConfig(el) {
  const dataSet = el.querySelectorAll(':scope > div');
  for (const viewportType of ['desktop', 'tablet', 'mobile']) {
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
  customElem.config = configObj;
  excelLink = dataSet[dataSet.length - 1].innerText.trim();
}

export default async function init(el) {
  const clone = el.cloneNode(true);
  createConfig(clone);
  el.innerText = '';
  el.appendChild(customElem);
  import(`${base}/deps/blades/interactivemarquee.js`);
  excelJsonData = await getExcelData(excelLink);
  createConfigExcel(excelJsonData, configObj);
  console.log('configObj', customElem.config);
}
