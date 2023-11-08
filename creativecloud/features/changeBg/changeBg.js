/* eslint-disable no-restricted-syntax */
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
  const configObj = {};
  jsonData.forEach((item) => {
    const { Viewport, ResourceName, Value1, MenuName } = item;
    if (Viewport && ResourceName && Value1) {
      if (!configObj[Viewport]) configObj[Viewport] = { groups: [] };
      if (!['iconUrl', 'src', 'swatchSrc'].includes(ResourceName)) {
        configObj[Viewport][ResourceName] = Value1;
      } else if (ResourceName === 'iconUrl') {
        const obj = { name: MenuName, [ResourceName]: Value1 };
        configObj[Viewport].groups.push(obj);
      }
    }
  });
  return configObj;
}

export default async function changeBg(el) {
  let marqueeAssetsData = '';
  const customElem = document.createElement('ft-changebackgroundmarquee');
  marqueeAssetsData = el.querySelector(':scope > div').innerText.trim();
  const excelJsonData = await getExcelData(marqueeAssetsData);
  customElem.config = configExcelData(excelJsonData);
  createConfigExcel(excelJsonData, customElem.config);
  // const a = el.querySelector('.imarquee-mobile');
  // a.style.display = 'none';
  el.append(customElem);
}
