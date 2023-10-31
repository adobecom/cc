let excelLink = '';
const configObj = {};
const base = `${window.location.origin}/creativecloud`;
const assetsRoot = `${base}/assets`;
const customElem = document.createElement('ft-changebackgroundmarquee');
const defaultBgLInk = [];
function getImageSrc(node) {
    return Array.from(node).map((el) => {
      const a = el.querySelector('a');
    //   const img = a.querySelector('source');
      return a.href;
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
      viewportObj.groups.push({iconUrl: arr.iconUrl, name: arr.name});
    }
    // TODO: uncomment when needed
    configObj[viewportType] = viewportObj;
  }
  // customElem.config = configObj;
  excelLink = dataSet[dataSet.length - 1].innerText.trim();
}

async function getExcelData(link) {
  const resp = await fetch(link);
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

// export default async function init(el) {
// //   import(`${base}/deps/interactive-marquee-changebg/ft-everyonechangebgmarquee-8e121e97.js`);
// //     console.log('el', el);
// //   const clone = el.cloneNode(true);
// //   const firstDiv = el.querySelector('div');
// //   const links = firstDiv.querySelectorAll('a');
// //   [...links].forEach((link) => {
// //     const img = new Image();
// //     img.fetchPriority = 'high';
// //     img.src = `${link.href}`;
// //   });
// //   await createConfig(clone, configObj);
// //   console.log('configObj2', customElem.config);
// //   const excelJsonData = await getExcelData(excelLink);
// //   createConfigExcel(excelJsonData, customElem.config);
// //   el.innerText = '';
// //   el.appendChild(customElem);
// //   console.log('configObj3', customElem.config);
// }

function getAssests() {
  customElem.config = {
    desktop: {
      marqueeTitleImgSrc: `https://changebg--cc--suhjainadobe.hlx.live/drafts/suhjain/assets-interactive-marquee/desktop/media_1ecd480463ad12637e596ee086dec2f2ec15bca12.png?format=webply`,
      talentSrc: `https://changebg--cc--suhjainadobe.hlx.live/drafts/suhjain/assets-interactive-marquee/desktop/media_1f5cd02cf46306e3e94d2dd1c301489599e0decbb.png?format=webply`,
      defaultBgSrc: `https://changebg--cc--suhjainadobe.hlx.live/drafts/suhjain/assets-interactive-marquee/desktop/defaultbg.png?format=webply`,
      tryitSrc: `https://changebg--cc--suhjainadobe.hlx.live/drafts/suhjain/assets-interactive-marquee/tryit.svg`,
      tryitText: 'Try it',
      cursorSrc: `https://changebg--cc--suhjainadobe.hlx.live/drafts/suhjain/assets-interactive-marquee/desktop/dt-mouse-arrow.svg`,
      groups: [
        {
          name: 'Remove Background',
          iconUrl: `https://changebg--cc--suhjainadobe.hlx.live/drafts/suhjain/assets-interactive-marquee/remove-background-icon.svg`,
        },
        {
          name: 'Change Photo',
          iconUrl: `https://changebg--cc--suhjainadobe.hlx.live/drafts/suhjain/assets-interactive-marquee/change-photo-icon.svg`,
          options: [
            {
              src: `https://changebg--cc--suhjainadobe.hlx.live/drafts/suhjain/assets-interactive-marquee/desktop/media_1c6207a67c23a8aac1fc673b00a0709597108383e.jpeg`,
              swatchSrc: `https://changebg--cc--suhjainadobe.hlx.live/drafts/suhjain/assets-interactive-marquee/media_178998ef2e42f9da793da13c5fa2c666a88244e1a.jpeg`,
            },
            {
              src: `https://changebg--cc--suhjainadobe.hlx.live/drafts/suhjain/assets-interactive-marquee/desktop/media_1d3224f95359b57b3058277dd61e42703b4c80f8c.jpeg`,
              swatchSrc: `https://changebg--cc--suhjainadobe.hlx.live/drafts/suhjain/assets-interactive-marquee/media_1890e29f4e69d9ef3f1f9374322e554f0eb4cc3a8.jpeg`,
            },
            {
              src: `https://changebg--cc--suhjainadobe.hlx.live/drafts/suhjain/assets-interactive-marquee/desktop/media_12e4d603ff6ec7cd3f87ff1a8a80ee30e891d91fb.jpeg`,
              swatchSrc: `https://changebg--cc--suhjainadobe.hlx.live/drafts/suhjain/assets-interactive-marquee/media_17b16658049c0007cd1ff44ab069a5dae3d497b27.jpeg`,
            },
          ],
        },
        {
          name: 'Change Color',
          iconUrl: `https://changebg--cc--suhjainadobe.hlx.live/drafts/suhjain/assets-interactive-marquee/change-color-icon.svg`,
          options: [
            { src: '#31A8FF' },
            { src: '#7F66E6' },
            { src: '#31F7FF' },
          ],
        },
        {
          name: 'Change Pattern',
          iconUrl: `https://changebg--cc--suhjainadobe.hlx.live/drafts/suhjain/assets-interactive-marquee/change-pattern-icon.svg`,
          options: [
            {
              src: `https://changebg--cc--suhjainadobe.hlx.live/drafts/suhjain/assets-interactive-marquee/desktop/media_1e5f0dde8b87f7df5f0ac4204af775d8dca0c9ae4.jpeg`,
              swatchSrc: `https://changebg--cc--suhjainadobe.hlx.live/drafts/suhjain/assets-interactive-marquee/media_1c1dba01879e4c649e0057e3a32f73f2a4b5d7d10.jpeg`,
            },
            {
              src: `https://changebg--cc--suhjainadobe.hlx.live/drafts/suhjain/assets-interactive-marquee/desktop/media_122eee5e2de5125356f5d674079026da06ac8148d.jpeg`,
              swatchSrc: `https://changebg--cc--suhjainadobe.hlx.live/drafts/suhjain/assets-interactive-marquee/media_1550358bbdc7509c3027dafa289586705fdaf223e.jpeg`,
            },
            {
              src: `https://changebg--cc--suhjainadobe.hlx.live/drafts/suhjain/assets-interactive-marquee/desktop/media_1f874ae7861d4b25d4e123217b24146b4449a9a38.jpeg`,
              swatchSrc: `https://changebg--cc--suhjainadobe.hlx.live/drafts/suhjain/assets-interactive-marquee/media_11791a3a979984c3865d457ee54d8cb40e2daa974.jpeg`,
            },
          ],
        },
      ],
    },
    tablet: {
      marqueeTitleImgSrc: `https://changebg--cc--suhjainadobe.hlx.live/drafts/suhjain/assets-interactive-marquee/tablet/media_178b471c39e081933fa5361ac916194b0afdce975.png?format=webply`,
      talentSrc: `https://changebg--cc--suhjainadobe.hlx.live/drafts/suhjain/assets-interactive-marquee/tablet/media_1df39bd0e23f818e6c0e7ef9d6a35b7ea911be8b2.png?format=webply`,
      defaultBgSrc: `https://changebg--cc--suhjainadobe.hlx.live/drafts/suhjain/assets-interactive-marquee/tablet/media_1eb30d9fb492f8746beaaca63331ecc4cf3ada9cb.jpeg`,
      tryitSrc: `https://changebg--cc--suhjainadobe.hlx.live/drafts/suhjain/assets-interactive-marquee/tryit.svg`,
      tryitText: 'Try it',
      groups: [
        {
          name: 'Remove Background',
          iconUrl: `https://changebg--cc--suhjainadobe.hlx.live/drafts/suhjain/assets-interactive-marquee/remove-background-icon.svg`,
        },
        {
          name: 'Change Photo',
          iconUrl: `https://changebg--cc--suhjainadobe.hlx.live/drafts/suhjain/assets-interactive-marquee/change-photo-icon.svg`,
          options: [
            {
              src: `https://changebg--cc--suhjainadobe.hlx.live/drafts/suhjain/assets-interactive-marquee/tablet/media_15b4d2588f135edf8d528d5a81b078342f9bb449b.jpeg`,
              swatchSrc: `https://changebg--cc--suhjainadobe.hlx.live/drafts/suhjain/assets-interactive-marquee/media_178998ef2e42f9da793da13c5fa2c666a88244e1a.jpeg`,
            },
          ],
        },
        {
          name: 'Change Color',
          iconUrl: `https://changebg--cc--suhjainadobe.hlx.live/drafts/suhjain/assets-interactive-marquee/change-color-icon.svg`,
          options: [
            { src: '#31A8FF' },
          ],
        },
        {
          name: 'Change Pattern',
          iconUrl: `${assetsRoot}/change-pattern-icon.svg`,
          options: [
            {
              src: `https://changebg--cc--suhjainadobe.hlx.live/drafts/suhjain/assets-interactive-marquee/tablet/media_156a0847e949506991877bbc651ebf41bef4bb3be.jpeg`,
              swatchSrc: `https://changebg--cc--suhjainadobe.hlx.live/drafts/suhjain/assets-interactive-marquee/media_1c1dba01879e4c649e0057e3a32f73f2a4b5d7d10.jpeg`,
            },
          ],
        },
      ],
    },
    mobile: {
      marqueeTitleImgSrc: `https://changebg--cc--suhjainadobe.hlx.live/drafts/suhjain/assets-interactive-marquee/mobile/media_18206fcf6e7a17d51e324c79e84d89c453081f551.jpeg?format=webply`,
      talentSrc: `https://changebg--cc--suhjainadobe.hlx.live/drafts/suhjain/assets-interactive-marquee/mobile/media_17fbe5525a6d4a53db0ef6dd84324dc52a86977cb.png?format=webply`,
      defaultBgSrc: `https://changebg--cc--suhjainadobe.hlx.live/drafts/suhjain/assets-interactive-marquee/mobile/media_1f58b1c83685c0c2b61aa47e6dddec0a5a913dba4.png?format=webply`,
      tryitSrc: `https://changebg--cc--suhjainadobe.hlx.live/drafts/suhjain/assets-interactive-marquee/tryit.svg`,
      tryitText: 'Try it',
      groups: [
        {
          name: 'Remove Background',
          iconUrl: `https://changebg--cc--suhjainadobe.hlx.live/drafts/suhjain/assets-interactive-marquee/remove-background-icon.svg`,
        },
        {
          name: 'Change Photo',
          iconUrl: `https://changebg--cc--suhjainadobe.hlx.live/drafts/suhjain/assets-interactive-marquee/change-photo-icon.svg`,
          options: [
            {
              src: `https://changebg--cc--suhjainadobe.hlx.live/drafts/suhjain/assets-interactive-marquee/mobile/media_10d610e50c0693186f9fea2878e4ccaf632721746.jpeg`,
              swatchSrc: `https://changebg--cc--suhjainadobe.hlx.live/drafts/suhjain/assets-interactive-marquee/media_178998ef2e42f9da793da13c5fa2c666a88244e1a.jpeg`,
            },
          ],
        },
        {
          name: 'Change Color',
          iconUrl: `https://changebg--cc--suhjainadobe.hlx.live/drafts/suhjain/assets-interactive-marquee/change-color-icon.svg`,
          options: [
            { src: '#31A8FF' },
          ],
        },
        {
          name: 'Change Pattern',
          iconUrl: `${assetsRoot}/change-pattern-icon.svg`,
          options: [
            {
              src: `https://changebg--cc--suhjainadobe.hlx.live/drafts/suhjain/assets-interactive-marquee/mobile/media_18658b1087531668846f43a3f2acc7d1243b00130.jpeg`,
              swatchSrc: `https://changebg--cc--suhjainadobe.hlx.live/drafts/suhjain/assets-interactive-marquee/media_1c1dba01879e4c649e0057e3a32f73f2a4b5d7d10.jpeg`,
            },
          ],
        },
      ],
    },
  };
}

export default function init(el) {
// prefetch the mobile background image
if (matchMedia('screen and (max-width: 599px)').matches) {
  const img = new Image();
  img.fetchPriority = 'high';
  // img.src = `https://cc-preprod.scene7.com/is/image/CCQA01Author/defaultbgnewMobile?$png$&jpegSize=100&wid=599`;
  img.src = `https://changebg--cc--suhjainadobe.hlx.live/drafts/suhjain/assets-interactive-marquee/mobile/media_1f58b1c83685c0c2b61aa47e6dddec0a5a913dba4.png?format=webply`;
  const img1 = new Image();
  img1.fetchPriority = 'high';
  img1.src = `https://changebg--cc--suhjainadobe.hlx.live/drafts/suhjain/assets-interactive-marquee/mobile/media_18206fcf6e7a17d51e324c79e84d89c453081f551.jpeg?format=webply`;
  const img2 = new Image();
  img2.fetchPriority = 'high';
  img2.src = `https://changebg--cc--suhjainadobe.hlx.live/drafts/suhjain/assets-interactive-marquee/mobile/media_17fbe5525a6d4a53db0ef6dd84324dc52a86977cb.png?format=webply`;
}
  import(`${base}/deps/interactive-marquee-changebg/ft-everyonechangebgmarquee-8e121e97.js`);
  getAssests(el);
  el.replaceChildren(customElem);
}
