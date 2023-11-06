/* eslint-disable no-useless-return */
// import changeBg from '../../features/changeBg/changeBg.js';

// export default async function init(el) {
//   if (el.classList.contains('changebg')) {
//     changeBg(el);
//     return;
//   }
// }

/* eslint-disable no-restricted-syntax */
let excelLink = '';
const configObj = {};
const customElem = document.createElement('ft-changebackgroundmarquee');

async function getExcelData(link) {
  const resp = await fetch(link);
  const { data } = await resp.json();
  return data;
}

export function getSrcFromExcelData(name, viewportType, excelData, type) {
  return excelData
    .filter((data) => data.MenuName === name
    && data.Viewport === viewportType
    && data.ResourceName === type)
    .flatMap((data) => [data.Value1, data.Value2, data.Value3].filter((value) => value.trim() !== ''));
}

export function createConfigExcel(excelJson, configObjData) {
  const viewportTypes = ['mobile', 'tablet', 'desktop'];
  for (const viewportType of viewportTypes) {
    const existingGroups = configObjData[viewportType].groups;
    for (const group of existingGroups) {
      const { name } = group;
      const groupsrc = getSrcFromExcelData(name, viewportType, excelJson, 'src');
      const groupswatchSrc = getSrcFromExcelData(name, viewportType, excelJson, 'swatchSrc');
      group.options = groupsrc.map((src, i) => {
        const option = { src };
        if (groupswatchSrc[i]) option.swatchSrc = groupswatchSrc[i];
        return option;
      });
      if (group.options.length === 0) {
        delete group.options;
      }
    }
  }
}

export function configExcelData(jsonData) {
  jsonData.forEach((item) => {
    const { Viewport, ResourceName, Value1, MenuName } = item;
    if (Viewport && ResourceName && Value1) {
      if (!configObj[Viewport]) {
        configObj[Viewport] = {};
        configObj[Viewport].groups = [];
      }
      if (ResourceName !== 'iconUrl' && ResourceName !== 'src' && ResourceName !== 'swatchSrc') {
        configObj[Viewport][ResourceName] = Value1;
      } else if (ResourceName === 'iconUrl') {
        const obj = {};
        obj.name = MenuName;
        obj[ResourceName] = Value1;
        configObj[Viewport].groups.push(obj);
      }
    }
  });
  return configObj;
}

export default async function init(el) {
  const firstDiv = el.querySelectorAll(':scope > div');
  excelLink = firstDiv[0].innerText.trim();
  const excelJsonData = await getExcelData(excelLink);
  customElem.config = configExcelData(excelJsonData);
  createConfigExcel(excelJsonData, customElem.config);
  el.replaceWith(customElem);
}

