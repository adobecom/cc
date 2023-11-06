let excelLink = '';
const configObj = {};
const customElem = document.createElement('ft-changebackgroundmarquee');

async function getExcelData(link) {
  const resp = await fetch(link);
  const { data } = await resp.json();
  return data.map((grp) => grp);
}

function getExcelDataCursor(excelJson, type) {
  const foundData = excelJson.find((data) => data.ResourceName === type);
  return foundData ? foundData.Value1 : null;
}

function getSrcFromExcelData(name, viewportType, excelData, type) {
  return excelData
    .filter((data) => data.MenuName === name
    && data.Viewport === viewportType
    && data.ResourceName === type)
    .flatMap((data) => [data.Value1, data.Value2, data.Value3].filter((value) => value.trim() !== ''));
}

function createConfigExcel(excelJson, configObjData) {
  const viewportTypes = ['desktop', 'tablet', 'mobile'];
  for (const viewportType of viewportTypes) {
    configObjData[viewportType].tryitSrc = getExcelDataCursor(excelJson, 'tryitSrc');
    if (viewportType == 'desktop') {
      configObjData[viewportType].cursorSrc = getExcelDataCursor(excelJson, 'cursorSrc');
    }
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
      if (group.options.length === 0) {
        delete group.options;
      }
    }
  }
}

function configExcelData(jsonData) {
  customElem.config = configObj;
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
}

export default async function init(el) {
  const firstDiv = el.querySelectorAll(':scope > div');
  excelLink = firstDiv[0].innerText.trim();
  const excelJsonData = await getExcelData(excelLink);
  configExcelData(excelJsonData);
  createConfigExcel(excelJsonData, customElem.config);
  console.log('rearrangedData', configObj);
  el.replaceWith(customElem);
}