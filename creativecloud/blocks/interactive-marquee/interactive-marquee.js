/* eslint-disable prefer-destructuring */
import miloLibs from '../../scripts/scripts.js';

const { getConfig } = await import(`${miloLibs}/utils/utils.js`);
const config = getConfig();
// const configkeys = ['tryitImage'];
const obj = {};
let customElem;
let excelJson;
// configkeys.forEach((key, idx) => {
//   obj[key] = data[idx].value;
//   if()
// })

const base = config.codeRoot;

function renderBlade() {
  console.log('----------------------');
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

function getSrc(node) {
  const arr = [];
  node.forEach((el) => {
    arr.push(el.querySelector('picture > img').src);
  });
  return arr;
}

function getText(node) {
  const arr = [];
  node.forEach((el) => {
    arr.push(el.innerText.trim());
  });
  return arr;
}

// function getImg() {
//   const img = '';
//   return img;
// }

// export function getData(node, id) {
//   const [nodekey] = node;
//   const text = nodekey.textContent;
//   const nodeCollection = [...node];
//   nodeCollection.shift();
//   if (text === 'Tryit Image Cursor') {
//     const imgSrc = getImg();
//     tryitImage = imgSrc;
//   } else if (text === 'Cursor') {
//     const imgSrc = getImg();
//     cursorImage = imgSrc;
//   } else if (text === 'Remove Background Icon') {
//     const imgSrc = getImg();
//     backgroundIcon = imgSrc;
//   } else if (text === 'Change Photo Icon') {
//     const imgSrc = getImg();
//     changePhotoIcon = imgSrc;
//   } else if (text === 'Change Pattern Icon') {
//     const imgSrc = getImg();
//     changePatternIcon = imgSrc;
//   } else if (text === 'Change Color Icon') {
//     const imgSrc = getImg();
//     changeColorIcon = imgSrc;
//   } else if (text === 'Marquee Title') {
//     if (node.length > 0) {
//       const imgValue = getSrc(nodeCollection);
//       if (imgValue.length === 1) {
//         mobileMarqueeTitle = imgValue[0];
//         tabletMarqueeTitle = imgValue[0];
//         desktopMarqueeTitle = imgValue[0];
//       } else if (imgValue.length === 2) {
//         mobileMarqueeTitle = imgValue[0];
//         tabletMarqueeTitle = imgValue[0];
//         desktopMarqueeTitle = imgValue[1];
//       } else {
//         [mobileMarqueeTitle, tabletMarqueeTitle, desktopMarqueeTitle] = imgValue;
//       }
//     }
//   } else if (text === 'Tryit Text') {
//     if (node.length > 0) {
//       const nodetext = getText(nodeCollection);
//       if (nodetext.length === 1) {
//         mobileTryIttext = nodetext[0];
//         tabletTryIttext = nodetext[0];
//         desktopTryIttext = nodetext[0];
//       } else if (nodetext.length === 2) {
//         mobileTryIttext = nodetext[0];
//         tabletTryIttext = nodetext[0];
//         desktopTryIttext = nodetext[1];
//       } else {
//         [mobileTryIttext, tabletTryIttext, desktopTryIttext] = nodetext;
//       }
//     }
//   } else if (text === 'Foreground') {
//     if (node.length > 0) {
//       const imgValue = getSrc(nodeCollection);
//       if (imgValue.length === 1) {
//         mobileForeground = imgValue[0];
//         tabletForeground = imgValue[0];
//         desktopforeground = imgValue[0];
//       } else if (imgValue.length === 2) {
//         mobileForeground = imgValue[0];
//         tabletForeground = imgValue[0];
//         desktopforeground = imgValue[1];
//       } else {
//         [mobileForeground, tabletForeground, desktopforeground] = imgValue;
//       }
//     }
//   } else if (text === 'Background') {
//     if (node.length > 0) {
//       const imgValue = getSrc(nodeCollection);
//       if (imgValue.length === 1) {
//         mobileBackground = imgValue[0];
//         tabletBackground = imgValue[0];
//         desktopBackground = imgValue[0];
//       } else if (imgValue.length === 2) {
//         mobileBackground = imgValue[0];
//         tabletBackground = imgValue[0];
//         desktopBackground = imgValue[1];
//       } else {
//         [mobileBackground, tabletBackground, desktopBackground] = imgValue;
//       }
//     }
//   } else if (text === 'Remove Background Text') {
//     if (node.length > 0) {
//       const nodetext = getText(nodeCollection);
//       if (nodetext.length === 1) {
//         mobileRemoveBackText = nodetext[0];
//         tabletRemoveBackText = nodetext[0];
//         desktopRemoveBackText = nodetext[0];
//       } else if (nodetext.length === 2) {
//         mobileRemoveBackText = nodetext[0];
//         tabletRemoveBackText = nodetext[0];
//         desktopRemoveBackText = nodetext[1];
//       } else {
//         [mobileRemoveBackText, tabletRemoveBackText, desktopRemoveBackText] = nodetext;
//       }
//     }
//   } else if (text === 'Change Photo Text') {
//     if (node.length > 0) {
//       const nodetext = getText(nodeCollection);
//       if (nodetext.length === 1) {
//         mobChangePhotoText = nodetext[0];
//         tabChangePhotoText = nodetext[0];
//         dskChangePhotoText = nodetext[0];
//       } else if (nodetext.length === 2) {
//         mobChangePhotoText = nodetext[0];
//         tabChangePhotoText = nodetext[0];
//         dskChangePhotoText = nodetext[1];
//       } else {
//         [mobChangePhotoText, tabChangePhotoText, dskChangePhotoText] = nodetext;
//       }
//     }
//   } else if (text === 'Change Color Text') {
//     if (node.length > 0) {
//       const nodetext = getText(nodeCollection);
//       if (nodetext.length === 1) {
//         mobChangeColorText = nodetext[0];
//         tabChangeColorText = nodetext[0];
//         dskChangeColorText = nodetext[0];
//       } else if (nodetext.length === 2) {
//         mobChangeColorText = nodetext[0];
//         tabChangeColorText = nodetext[0];
//         dskChangeColorText = nodetext[1];
//       } else {
//         [mobChangeColorText, tabChangeColorText, dskChangeColorText] = nodetext;
//       }
//     }
//   } else if (text === 'Change Pattern Text') {
//     if (node.length > 0) {
//       const nodetext = getText(nodeCollection);
//       if (nodetext.length === 1) {
//         mobChangePatternText = nodetext[0];
//         tabChangePatternText = nodetext[0];
//         dskChangePatternText = nodetext[0];
//       } else if (nodetext.length === 2) {
//         mobChangePatternText = nodetext[0];
//         tabChangePatternText = nodetext[0];
//         dskChangePatternText = nodetext[1];
//       } else {
//         [mobChangePatternText, tabChangePatternText, dskChangePatternText] = nodetext;
//       }
//     }
//   }
// }

export function getData(node, id) {
  const node1 = [...node];
  if (id === 0) {
    if (node.length > 0) {
      const imgValue = getSrc(node1);
      if (imgValue.length === 1) {
        obj.mobileBackground = imgValue[0];
        obj.tabletBackground = imgValue[0];
        obj.desktopBackground = imgValue[0];
      } else if (imgValue.length === 2) {
        obj.mobileBackground = imgValue[0];
        obj.tabletBackground = imgValue[0];
        obj.desktopBackground = imgValue[1];
      } else {
        [obj.mobileBackground, obj.tabletBackground, obj.desktopBackground] = imgValue;
      }
    }
  } else if (id === 1) {
    if (node.length > 0) {
      const imgValue = getSrc(node1);
      if (imgValue.length === 1) {
        obj.tabletForeground = imgValue[0];
        obj.mobileForeground = imgValue[0];
        obj.desktopforeground = imgValue[0];
      } else if (imgValue.length === 2) {
        obj.mobileForeground = imgValue[0];
        obj.tabletForeground = imgValue[0];
        obj.desktopforeground = imgValue[1];
      } else {
        [obj.mobileForeground, obj.tabletForeground, obj.desktopforeground] = imgValue;
      }
    }
  } else if (id === 2) {
    if (node.length > 0) {
      const imgValue = getSrc(node1);
      if (imgValue.length === 1) {
        obj.mobileMarqueeTitle = imgValue[0];
        obj.tabletMarqueeTitle = imgValue[0];
        obj.desktopMarqueeTitle = imgValue[0];
      } else if (imgValue.length === 2) {
        obj.mobileMarqueeTitle = imgValue[0];
        obj.tabletMarqueeTitle = imgValue[0];
        obj.desktopMarqueeTitle = imgValue[1];
      } else {
        [obj.mobileMarqueeTitle, obj.tabletMarqueeTitle, obj.desktopMarqueeTitle] = imgValue;
      }
    }
  } else if (id === 3) {
    if (node.length > 0) {
      const nodetext = getText(node1);
      if (nodetext.length === 1) {
        obj.mobileTryIttext = nodetext[0];
        obj.tabletTryIttext = nodetext[0];
        obj.desktopTryIttext = nodetext[0];
      } else if (nodetext.length === 2) {
        obj.mobileTryIttext = nodetext[0];
        obj.tabletTryIttext = nodetext[0];
        obj.desktopTryIttext = nodetext[1];
      } else {
        [obj.mobileTryIttext, obj.tabletTryIttext, obj.desktopTryIttext] = nodetext;
      }
    }
  } else if (id === 4) {
    const iconBlock = node1.shift();
    obj.backgroundIcon = iconBlock.querySelector('picture > img').src;
    const nodetext = getText(node1);
    if (nodetext.length === 1) {
      obj.mobileRemoveBackText = nodetext[0];
      obj.tabletRemoveBackText = nodetext[0];
      obj.desktopRemoveBackText = nodetext[0];
    } else if (nodetext.length === 2) {
      obj.mobileRemoveBackText = nodetext[0];
      obj.tabletRemoveBackText = nodetext[0];
      obj.desktopRemoveBackText = nodetext[1];
    } else {
      [obj.mobileRemoveBackText, obj.tabletRemoveBackText, obj.desktopRemoveBackText] = nodetext;
    }
  } else if (id === 5) {
    const iconBlock = node1.shift();
    obj.changePhotoIcon = iconBlock.querySelector('picture > img').src;
    const nodetext = getText(node1);
    if (nodetext.length === 1) {
      obj.mobChangePhotoText = nodetext[0];
      obj.tabChangePhotoText = nodetext[0];
      obj.dskChangePhotoText = nodetext[0];
    } else if (nodetext.length === 2) {
      obj.mobChangePhotoText = nodetext[0];
      obj.tabChangePhotoText = nodetext[0];
      obj.dskChangePhotoText = nodetext[1];
    } else {
      [obj.mobChangePhotoText, obj.tabChangePhotoText, obj.dskChangePhotoText] = nodetext;
    }
  } else if (id === 6) {
    const iconBlock = node1.shift();
    obj.changeColorIcon = iconBlock.querySelector('picture > img').src;
    const nodetext = getText(node1);
    if (nodetext.length === 1) {
      obj.mobChangeColorText = nodetext[0];
      obj.tabChangeColorText = nodetext[0];
      obj.dskChangeColorText = nodetext[0];
    } else if (nodetext.length === 2) {
      obj.mobChangeColorText = nodetext[0];
      obj.tabChangeColorText = nodetext[0];
      obj.dskChangeColorText = nodetext[1];
    } else {
      [obj.mobChangeColorText, obj.tabChangeColorText, obj.dskChangeColorText] = nodetext;
    }
  } else if (id === 7) {
    const iconBlock = node1.shift();
    obj.changePatternIcon = iconBlock.querySelector('picture > img').src;
    const nodetext = getText(node1);
    if (nodetext.length === 1) {
      obj.mobChangePatternText = nodetext[0];
      obj.tabChangePatternText = nodetext[0];
      obj.dskChangePatternText = nodetext[0];
    } else if (nodetext.length === 2) {
      obj.mobChangePatternText = nodetext[0];
      obj.tabChangePatternText = nodetext[0];
      obj.dskChangePatternText = nodetext[1];
    } else {
      [obj.mobChangePatternText, obj.tabChangePatternText, obj.dskChangePatternText] = nodetext;
    }
  } else if (id === 8) {
    excelJson = node1[0].innerText.trim();
  }
  renderBlade();
}

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

async function getJson() {
  const arr = await getExcelData();
  arr.forEach((grp) => {
    if (grp.Data === 'Tryit Image Cursor') {
      obj.tryitImage = grp.Value1;
    } else if (grp.Data === 'Cursor') {
      obj.cursorImage = grp.Value1;
    } else if (grp.Data === 'Desktop Change Photo images') {
      obj.desktopChnagePhotoImage1 = grp.Value1;
      obj.desktopChnagePhotoImage2 = grp.Value2;
      obj.desktopChnagePhotoImage3 = grp.Value3;
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
      obj.desktopChangePatternImage1 = grp.Value1;
      obj.desktopChangePatternImage2 = grp.Value2;
      obj.desktopChangePatternImage3 = grp.Value3;
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
  renderBlade();
}

export default function init(el) {
  const dataSet = el.querySelectorAll(':scope > div');
  import(`${base}/deps/blades/9c8d172e.js`);
  customElem = document.createElement('ft-changebackgroundmarquee');
  dataSet.forEach((data, id) => {
    const { children } = data;
    getData(children, id);
  });
  el.innerText = '';
  el.appendChild(customElem);
  getJson();
}
