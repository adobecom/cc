/* eslint-disable max-len */
import miloLibs from '../../scripts/scripts.js';

const { getConfig } = await import(`${miloLibs}/utils/utils.js`);
const customElem = document.createElement('ft-changebackgroundmarquee');
let excelLink = '';
const configObj = {};
const config = getConfig();
const base = config.codeRoot;

function getImageSrc(node) {
  return Array.from(node).map((el) => el.querySelector('picture > img').src);
}

function getText(node) {
  return Array.from(node).map((el) => el.innerText.trim());
}

function getValue(childrenArr, type) {
  const valueArr = type === 'img' ? getImageSrc(childrenArr) : getText(childrenArr);
  const newData = valueArr.length === 1 ? [valueArr[0], valueArr[0], valueArr[0]] : valueArr.length === 2 ? [valueArr[0], valueArr[0], valueArr[1]] : [valueArr[0], valueArr[1], valueArr[2]];
  return newData;
}

function processDataSet(dataSet) {
  return [...dataSet.children];
}

function getImageUrlValues(dataSet, objKeys, viewportType) {
  const childrenArr = objKeys === 'defaultBgSrc' ? processDataSet(dataSet[0]) : objKeys === 'talentSrc' ? processDataSet(dataSet[1]) : processDataSet(dataSet[2]);
  const getValueArr = getValue(childrenArr, 'img');
  return viewportType === 'desktop' ? getValueArr[2] : viewportType === 'tablet' ? getValueArr[1] : getValueArr[0];
}

function getTextItemValues(dataSet, viewportType, flag) {
  const childrenArr = processDataSet(dataSet);
  if (flag) childrenArr.shift();
  const getValueArr = getValue(childrenArr, 'text');
  return viewportType === 'desktop' ? getValueArr[2] : viewportType === 'tablet' ? getValueArr[1] : getValueArr[0];
}

function getIconAndName(dataSet, viewportType) {
  const childrenArr = processDataSet(dataSet);
  const objArr = {};
  const iconBlock = childrenArr.shift();
  objArr['iconUrl'] = iconBlock.querySelector('picture > img').src;
  objArr['name'] = getTextItemValues(dataSet, viewportType, true);
  return objArr;
}

async function getExcelData(excelLink) {
  const resp = await fetch(excelLink);
  const { data } = await resp.json();
  return data.map((grp) => grp);
}

function getExcelDataCursor(excelJson, type) {
  const foundData = excelJson.find((data) => data.MappedName === type);
  return foundData ? foundData.Value1 : null;
}

function getSrcFromExcelData(name, viewportType, excelData, type) {
  return excelData
    .filter((data) => data.ComponentName === name && data.Viewport === viewportType && data.MappedName === type)
    .flatMap((data) => [data.Value1, data.Value2, data.Value3].filter((value) => value.trim() !== ''));
}

function createConfigExcel(excelJson, configObjData) {
  const viewportTypes = ['desktop', 'tablet', 'mobile'];
  for (const viewportType of viewportTypes) {
    configObjData[viewportType].tryitSrc = getExcelDataCursor(excelJson, 'tryitSrc');
    configObjData[viewportType].cursorSrc = getExcelDataCursor(excelJson, 'cursorSrc');
    const existingGroups = configObjData[viewportType].groups;
    for (const group of existingGroups) {
      const name = group.name;
      const groupsrc = getSrcFromExcelData(name, viewportType, excelJson, 'src');
      const groupswatchSrc = getSrcFromExcelData(name, viewportType, excelJson, 'swatchSrc');
      group.options = [];
      for (let i = 0; i < groupsrc.length; i++) {
        const option = { src: groupsrc[i] };
        if (groupswatchSrc[i]) option.swatchSrc = groupswatchSrc[i];
        group.options.push(option);
      }
    }
  }
}

async function createConfig(el) {
  const dataSet = el.querySelectorAll(':scope > div');
  const viewportTypes = ['mobile', 'tablet', 'desktop'];
  for (const viewportType of viewportTypes) {
    const viewportObj = {};
    for (const objKeys of ['defaultBgSrc', 'talentSrc', 'marqueeTitleImgSrc']) {
      viewportObj[objKeys] = getImageUrlValues(dataSet, objKeys, viewportType);
    }
    configObj[viewportType] = viewportObj;
  }
  excelLink = dataSet[dataSet.length - 1].innerText.trim();
}

export default async function init(el) {
  console.log(el);
  const clone = el.cloneNode(true);
  import(`../../deps/blades/interactivemarquee.js`);
  customElem.config = configObj;
  el.innerText = '';
  el.appendChild(customElem);
  await createConfig(clone);
}
