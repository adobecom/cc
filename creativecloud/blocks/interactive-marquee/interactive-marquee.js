/* eslint-disable prefer-destructuring */
import miloLibs from '../../scripts/scripts.js';

const { getConfig } = await import(`${miloLibs}/utils/utils.js`);
const config = getConfig();
// TODO: check if obj shoould be global or not
const obj = {};
const customElem = document.createElement('ft-changebackgroundmarquee');
let excelJson;

const base = config.codeRoot;

function renderBlade() {
  console.log('----------------------');
  // createConfig func
  // create obj with 3 keys desktop, mobile tablet.
  // within those keys, have the following keys, marqueeTitleImgSrc, talentSrc,defaultBgSrc...groups...
  // get sharepoint doc data and update the necessary values in the obj
  // get sharepoint excel data save the sharepoint excel data in another global variable excelData
  // call another func to updateObjwithExcelData(obj, excelData, loadHeavyImages=False)
  // call renderBlade and assign obj directly to customelem.config = obj
  // updateObjwithExcelData(obj, excelData, loadHeavyImages=True)
  customElem.config = {
    desktop: {
      marqueeTitleImgSrc: `${obj.desktopMarqueeTitle}`,
      talentSrc: `${obj.desktopforeground}`,
      defaultBgSrc: `${obj.desktopBackground}`,
      tryitSrc: `${obj.tryitImage}` || './assets/tryit.svg',
      tryitText: `${obj.desktopTryIttext}`,
      cursorSrc: `${obj.cursorImage}` || './assets/dt-Mouse-arrow.svg',
      groups: [
        {
          name: `${obj.desktopRemoveBackText}`,
          iconUrl: `${obj.backgroundIcon}` || './assets/remove-background-icon.svg',
        },
        {
          name: `${obj.dskChangePhotoText}`,
          iconUrl: `${obj.changePhotoIcon}` || './assets/change-photo-icon.svg',
          options: [
            {
              src: `${obj.desktopChnagePhotoImage1}`,
              swatchSrc: `${obj.ChangePhotoIcon1}`,
            },
            {
              src: `${obj.desktopChnagePhotoImage2}`,
              swatchSrc: `${obj.ChangePhotoIcon2}`,
            },
            {
              src: `${obj.desktopChnagePhotoImage3}`,
              swatchSrc: `${obj.ChangePhotoIcon3}`,
            },
          ],
        },
        {
          name: `${obj.dskChangeColorText}`,
          iconUrl: `${obj.changeColorIcon}` || './assets/change-color-icon.svg',
          options: [
            { src: `${obj.desktopChangeColorText1}` },
            { src: `${obj.desktopChangeColorText2}` },
            { src: `${obj.desktopChangeColorText3}` },
          ],
        },
        {
          name: `${obj.dskChangePatternText}`,
          iconUrl: `${obj.changePatternIcon}` || './assets/change-pattern-icon.svg',
          options: [
            {
              src: `${obj.desktopChangePatternImage1}`,
              swatchSrc: `${obj.ChangePatternIcon1}`,
            },
            {
              src: `${obj.desktopChangePatternImage2}`,
              swatchSrc: `${obj.ChangePatternIcon2}`,
            },
            {
              src: `${obj.desktopChangePatternImage3}`,
              swatchSrc: `${obj.ChangePatternIcon3}`,
            },
          ],
        },
      ],
    },
    tablet: {
      marqueeTitleImgSrc: `${obj.tabletMarqueeTitle}`,
      talentSrc: `${obj.tabletForeground}`,
      defaultBgSrc: `${obj.tabletBackground}`,
      tryitSrc: `${obj.tryitImage}`,
      tryitText: `${obj.tabletTryIttext}`,
      groups: [
        {
          name: `${obj.tabletRemoveBackText}`,
          iconUrl: `${obj.backgroundIcon}` || './assets/remove-background-icon.svg',
        },
        {
          name: `${obj.tabChangePhotoText}`,
          iconUrl: `${obj.changePhotoIcon}` || './assets/change-photo-icon.svg',
          options: [
            {
              src: `${obj.tabletChnagePhotoImage1}`,
              swatchSrc: `${obj.ChangePhotoIcon1}`,
            },
          ],
        },
        {
          name: `${obj.tabChangeColorText}`,
          iconUrl: `${obj.changeColorIcon}` || './assets/change-color-icon.svg',
          options: [
            { src: `${obj.tabletChangeColorText1}` },
          ],
        },
        {
          name: `${obj.tabChangePatternText}`,
          iconUrl: `${obj.changePatternIcon}` || './assets/change-pattern-icon.svg',
          options: [
            {
              src: `${obj.tabletChangePatternImage1}`,
              swatchSrc: `${obj.ChangePatternIcon1}`,
            },
          ],
        },
      ],
    },
    mobile: {
      marqueeTitleImgSrc: `${obj.mobileMarqueeTitle}`,
      talentSrc: `${obj.mobileForeground}`,
      defaultBgSrc: `${obj.mobileBackground}`,
      tryitSrc: `${obj.tryitImage}`,
      tryitText: `${obj.mobileTryIttext}`,
      groups: [
        {
          name: `${obj.mobileRemoveBackText}`,
          iconUrl: `${obj.backgroundIcon}` || './assets/remove-background-icon.svg',
        },
        {
          name: `${obj.mobChangePhotoText}`,
          iconUrl: `${obj.changePhotoIcon}` || './assets/change-photo-icon.svg',
          options: [
            {
              src: `${obj.mobileChnagePhotoImage1}`,
              swatchSrc: `${obj.ChangePhotoIcon1}`,
            },
          ],
        },
        {
          name: `${obj.mobChangeColorText}`,
          iconUrl: `${obj.changeColorIcon}` || './assets/change-color-icon.svg',
          options: [
            { src: `${obj.mobileChangeColorText1}` },
          ],
        },
        {
          name: `${obj.mobChangePatternText}`,
          iconUrl: `${obj.changePatternIcon}` || './assets/change-pattern-icon.svg',
          options: [
            {
              src: `${obj.mobileChangePatternImage1}`,
              swatchSrc: `${obj.ChangePatternIcon1}`,
            },
          ],
        },
      ],
    },
  };
}

function getImageSrc(node) {
  return Array.from(node).map((el) => {
    const a = el.querySelector('picture > img').src;
    const newA = a.split(".png")[0] + ".png";
    return newA;
  });
}

function getText(node) {
  return Array.from(node).map((el) => el.innerText.trim());
}

function setImages(type, node1, mobileProp, tabletProp, desktopProp) {
  if (node1.length > 0) {
    const dataValue = type === 'img' ? getImageSrc(node1) : getText(node1);
    if (dataValue.length === 1) {
      obj[mobileProp] = dataValue[0];
      obj[tabletProp] = dataValue[0];
      obj[desktopProp] = dataValue[0];
    } else if (dataValue.length === 2) {
      obj[mobileProp] = dataValue[0];
      obj[tabletProp] = dataValue[0];
      obj[desktopProp] = dataValue[1];
    } else {
      [obj[mobileProp], obj[tabletProp], obj[desktopProp]] = dataValue;
    }
  }
}

export function getSharepointDocData(node, id) {
  const node1 = [...node];
  if (id === 0) {
    setImages('img', node1, 'mobileBackground', 'tabletBackground', 'desktopBackground');
  } else if (id === 1) {
    setImages('img', node1, 'mobileForeground', 'tabletForeground', 'desktopforeground');
  } else if (id === 2) {
    setImages('img', node1, 'mobileMarqueeTitle', 'tabletMarqueeTitle', 'desktopMarqueeTitle');
  } else if (id === 3) {
    setImages('text', node1, 'mobileTryIttext', 'tabletTryIttext', 'desktopTryIttext');
  } else if (id === 4) {
    const iconBlock = node1.shift();
    obj.backgroundIcon = iconBlock.querySelector('picture > img').src;
    setImages('text', node1, 'mobileRemoveBackText', 'tabletRemoveBackText', 'desktopRemoveBackText');
  } else if (id === 5) {
    const iconBlock = node1.shift();
    obj.changePhotoIcon = iconBlock.querySelector('picture > img').src;
    setImages('text', node1, 'mobChangePhotoText', 'tabChangePhotoText', 'dskChangePhotoText');
  } else if (id === 6) {
    const iconBlock = node1.shift();
    obj.changeColorIcon = iconBlock.querySelector('picture > img').src;
    setImages('text', node1, 'mobChangeColorText', 'tabChangeColorText', 'dskChangeColorText');
  } else if (id === 7) {
    const iconBlock = node1.shift();
    obj.changePatternIcon = iconBlock.querySelector('picture > img').src;
    setImages('text', node1, 'mobChangePatternText', 'tabChangePatternText', 'dskChangePatternText');
  } else if (id === 8) {
    excelJson = node1[0].innerText.trim();
  }
}

// function reRenderBlade() {
//   const dskChangePhoto = [
//     {
//       src: `${obj.desktopChnagePhotoImage1}`,
//       swatchSrc: `${obj.ChangePhotoIcon1}`,
//     },
//     {
//       src: `${obj.desktopChnagePhotoImage2}`,
//       swatchSrc: `${obj.ChangePhotoIcon2}`,
//     },
//     {
//       src: `${obj.desktopChnagePhotoImage3}`,
//       swatchSrc: `${obj.ChangePhotoIcon3}`,
//     },
//   ];
//   customElem.config.desktop.groups[1].options = dskChangePhoto;
//   console.log('1', customElem.config.desktop.groups[1]);
// }

async function getExcelData() {
  const resp = await fetch('https://main--cc--adobecom.hlx.page/drafts/suhjain/book.json');
  const html = await resp.json();
  const { data } = html;
  const arr = [];
  data.forEach((grp) => {
    arr.push(grp);
  });
  return arr;
}

async function getSharepointExcelData({ loadHeavyImages = false } = {}) {
  const arr = await getExcelData();
  arr.forEach((grp) => {
    if (grp.Data === 'Tryit Image Cursor') {
      obj.tryitImage = grp.Value1;
    } else if (grp.Data === 'Cursor') {
      obj.cursorImage = grp.Value1;
    } else if (grp.Data === 'Desktop Change Photo images') {
      if (loadHeavyImages) {
        obj.desktopChnagePhotoImage1 = grp.Value1;
        obj.desktopChnagePhotoImage2 = grp.Value2;
        obj.desktopChnagePhotoImage3 = grp.Value3;
      }
    } else if (grp.Data === 'Change Photo Thumbnails') {
      obj.ChangePhotoIcon1 = grp.Value1;
      obj.ChangePhotoIcon2 = grp.Value2;
      obj.ChangePhotoIcon3 = grp.Value3;
    } else if (grp.Data === 'Desktop Change Color Text') {
      obj.desktopChangeColorText1 = grp.Value1;
      obj.desktopChangeColorText2 = grp.Value2;
      obj.desktopChangeColorText3 = grp.Value3;
    } else if (grp.Data === 'Change Pattern Thumbnails') {
      obj.ChangePatternIcon1 = grp.Value1;
      obj.ChangePatternIcon2 = grp.Value2;
      obj.ChangePatternIcon3 = grp.Value3;
    } else if (grp.Data === 'Desktop Change Pattern Images') {
      if (loadHeavyImages) {
        obj.desktopChangePatternImage1 = grp.Value1;
        obj.desktopChangePatternImage2 = grp.Value2;
        obj.desktopChangePatternImage3 = grp.Value3;
      }
    } else if (grp.Data === 'Tablet  Change Photo images') {
      obj.tabletChnagePhotoImage1 = grp.Value1;
    } else if (grp.Data === 'Tablet  Change Pattern images') {
      obj.tabletChangePatternImage1 = grp.Value1;
    } else if (grp.Data === 'Tablet Change Color Text') {
      obj.tabletChangeColorText1 = grp.Value1;
    } else if (grp.Data === 'Mobile  Change Photo images') {
      obj.mobileChnagePhotoImage1 = grp.Value1;
    } else if (grp.Data === 'Mobile  Change Pattern images') {
      obj.mobileChangePatternImage1 = grp.Value1;
    } else if (grp.Data === 'Mobile Change Color Text') {
      obj.mobileChangeColorText1 = grp.Value1;
    }
  });
}

export default function init(el) {
  const dataSet = el.querySelectorAll(':scope > div');
  dataSet.forEach((data, id) => {
    const { children } = data;
    getSharepointDocData(children, id);
  });
  renderBlade();
  el.innerText = '';
  el.appendChild(customElem);
  import(`${base}/deps/blades/9c8d172e.js`);
  // getSharepointExcelData({ loadHeavyImages: true });
  // renderBlade();
}
