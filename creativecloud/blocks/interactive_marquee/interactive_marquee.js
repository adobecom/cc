import { getConfig } from '../../utils/utils.js';

const config = getConfig();
const base = config.miloLibs || config.codeRoot;
// const params = new URLSearchParams(window.location.search);
let tryitImage = '';
let cursorImage = '';
let backgroundIcon = '';
let changePhotoIcon = '';
let changePatternIcon = '';
let changeColorIcon = '';
let desktopmarqueetitle = '';
let desktopTryIttext = '';
let desktopforeground = '';
let desktopbackground = '';
let desktopChnagePhotoImage1 = '';
let desktopChnagePhotoImage2 = '';
let desktopChnagePhotoImage3 = '';
let desktopChangePhotoIcon1 = '';
let desktopChangePhotoIcon2 = '';
let desktopChangePhotoIcon3 = '';
let desktopChangePatternImage1 = '';
let desktopChangePatternImage2 = '';
let desktopChangePatternImage3 = '';
let desktopChangePatternIcon1 = '';
let desktopChangePatternIcon2 = '';
let desktopChangePatternIcon3 = '';
let desktopChangeColorText1 = '';
let desktopChangeColorText2 = '';
let desktopChangeColorText3 = '';
let tabletMarqueeTitle = '';
let tabletTryIttext = '';
let tabletForeground = '';
let tabletBackground = '';
let tabletChnagePhotoImage1 = '';
let tabletChangePatternImage1 = '';
let tabletChangeColorText1 = '';
let tabletChangePatternIcon1 = '';
let tabletChangePhotoIcon1 = '';
let MobileMarqueeTitle = '';
let mobileTryIttext = '';
let mobileForeground = '';
let mobileBackground = '';
let mobileChnagePhotoImage1 = '';
let mobileChangePhotoIcon1 = '';
let mobileChangePatternImage1 = '';
let mobileChangePatternIcon1 = '';
let mobileChangeColorText1 = '';

function renderBlade(container) {
  import(`${base}/deps/blades/9c8d172e.js`);
  const customElem = document.createElement('ft-changebackgroundmarquee');
  customElem.config = {
    'desktop': {
      'marqueeTitleImgSrc': `${desktopmarqueetitle}`,
      'talentSrc':`${desktopforeground}`,
      'defaultBgSrc': `${desktopbackground}`,
      'tryitSrc': `${tryitImage}`,
      'tryitText': `${desktopTryIttext}`,
      'cursorSrc': `${cursorImage}`,
      'groups': [
        {
          'name': 'Remove Background',
          'iconUrl': `${backgroundIcon}`,
        },
        {
          'name': 'Change Photo',
          'iconUrl': `${changePhotoIcon}`,
          'options': [
            {
              'src': `${desktopChnagePhotoImage1}`,
              'swatchSrc': `${desktopChangePhotoIcon1}`,
            },
            {
              'src': `${desktopChnagePhotoImage2}`,
              'swatchSrc': `${desktopChangePhotoIcon2}`,
            },
            {
              'src': `${desktopChnagePhotoImage3}`,
              'swatchSrc': `${desktopChangePhotoIcon3}`,
            }
          ]
        },
        {
          'name': 'Change Color',
          'iconUrl': `${changeColorIcon}`,
          'options': [
            {
              'src': `${desktopChangeColorText1}`,
            },
            {
              'src': `${desktopChangeColorText2}`,
            },
            {
              'src': `${desktopChangeColorText3}`,
            }
          ]
        },
        {
          'name': 'Change Pattern',
          'iconUrl': `${changePatternIcon}`,
          'options': [
            {
              'src': `${desktopChangePatternImage1}`,
              'swatchSrc': `${desktopChangePatternIcon1}`
            },
            {
              'src': `${desktopChangePatternImage2}`,
              'swatchSrc': `${desktopChangePatternIcon2}`
            },
            {
              'src': `${desktopChangePatternImage3}`,
              'swatchSrc': `${desktopChangePatternIcon3}`
            }
          ]
        }
      ]
    },
    'tablet': {
      'marqueeTitleImgSrc': `${tabletMarqueeTitle}`,
      'talentSrc': `${tabletForeground}`,
      'defaultBgSrc': `${tabletBackground}`,
      'tryitSrc': `${tryitImage}`,
      'tryitText': `${tabletTryIttext}`,
      'groups': [
        {
          'name': 'Remove Background',
          'iconUrl': `${backgroundIcon}`,
        },
        {
          'name': 'Change Photo',
          'iconUrl': `${changePhotoIcon}`,
          'options': [
            {
              'src': `${tabletChnagePhotoImage1}`,
              'swatchSrc': `${tabletChangePhotoIcon1}`,
            }
          ]
        },
        {
          'name': 'Change Color',
          'iconUrl': `${changeColorIcon}`,
          'options': [
            {
              'src': `${tabletChangeColorText1}`,
            }
          ]
        },
        {
          'name': 'Change Pattern',
          'iconUrl': `${changePatternIcon}`,
          'options': [
            {
              'src': `${tabletChangePatternImage1}`,
              'swatchSrc': `${tabletChangePatternIcon1}`,
            }
          ]
        }
      ]
    },
    'mobile': {
      'marqueeTitleImgSrc': `${MobileMarqueeTitle}`,
      'talentSrc': `${mobileForeground}`,
      'defaultBgSrc': `${mobileBackground}`,
      'tryitSrc': `${tryitImage}`,
      'tryitText': `${mobileTryIttext}`,
      'groups': [
        {
          'name': 'Remove Background',
          'iconUrl': `${backgroundIcon}`,
        },
        {
          'name': 'Change Photo',
          'iconUrl': `${changePhotoIcon}`,
          'options': [
            {
              'src': `${mobileChnagePhotoImage1}`,
              'swatchSrc': `${mobileChangePhotoIcon1}`,
            }
          ]
        },
        {
          'name': 'Change Color',
          'iconUrl': `${changeColorIcon}`,
          'options': [
            {
              'src': `${mobileChangeColorText1}`,
            }
          ]
        },
        {
          'name': 'Change Pattern',
          'iconUrl': `${changePatternIcon}`,
          'options': [
            {
              'src': `${mobileChangePatternImage1}`,
              'swatchSrc': `${mobileChangePatternIcon1}`,
            }
          ]
        }
      ]
    }
  };
  container.parentNode.insertBefore(customElem, container);
  container.innerText = '';
}

function getSrc(node1) {
  const img = node1.querySelectorAll('picture > img');
  const arr = [];
  if (img.length === 1) {
    return img[0].src;
  }
  img.forEach((el) => {
    arr.push(el.src);
  });
  return arr;
}

function getData(node, node1) {
  const text = node.textContent;
  if (text === 'Tryit Image') {
    const imgSrc = getSrc(node1);
    tryitImage = imgSrc;
  } else if (text === 'Cursor') {
    const imgSrc = getSrc(node1);
    cursorImage = imgSrc;
  } else if (text === 'Remove Background Icon') {
    const imgSrc = getSrc(node1);
    backgroundIcon = imgSrc;
  } else if (text === 'Change Photo Icon') {
    const imgSrc = getSrc(node1);
    changePhotoIcon = imgSrc;
  } else if (text === 'Change Pattern Icon') {
    const imgSrc = getSrc(node1);
    changePatternIcon = imgSrc;
  } else if (text === 'Change Color Icon') {
    const imgSrc = getSrc(node1);
    changeColorIcon = imgSrc;
  } else if (text === 'Desktop Marquee Title') {
    const imgSrc = getSrc(node1);
    desktopmarqueetitle = imgSrc;
  } else if (text === 'Desktop Tryit Text') {
    const text = node1.innerText.trim();
    desktopTryIttext = text;
  } else if (text == 'Desktop Foreground') {
    const imgSrc = getSrc(node1);
    desktopforeground = imgSrc;
  } else if (text == 'Desktop Background') {
    const imgSrc = getSrc(node1);
    desktopbackground = imgSrc;
  } else if (text == 'Desktop Change Photo images') {
    const imgSrc = getSrc(node1);
    desktopChnagePhotoImage1 = imgSrc[0];
    desktopChnagePhotoImage2 = imgSrc[1];
    desktopChnagePhotoImage3 = imgSrc[2];
  } else if (text == 'Desktop Change Photo Thumbnails') {
    const imgSrc = getSrc(node1);
    desktopChangePhotoIcon1 = imgSrc[0];
    desktopChangePhotoIcon2 = imgSrc[1];
    desktopChangePhotoIcon3 = imgSrc[2];
  } else if (text == 'Desktop Change Pattern Images') {
    const imgSrc = getSrc(node1);
    desktopChangePatternImage1 = imgSrc[0];
    desktopChangePatternImage2 = imgSrc[1];
    desktopChangePatternImage3 = imgSrc[2];
  } else if (text == 'Desktop Change Pattern Thumbnails') {
    const imgSrc = getSrc(node1);
    desktopChangePatternIcon1 = imgSrc[0];
    desktopChangePatternIcon2 = imgSrc[1];
    desktopChangePatternIcon3 = imgSrc[2];
  } else if (text == 'Desktop Change Color Text') {
    const text = node1.innerText.trim().split(',');
    desktopChangeColorText1 = text[0].trim();
    desktopChangeColorText2 = text[1].trim();
    desktopChangeColorText3 = text[2].trim();
  } else if (text == 'Tablet Marquee Title') {
    const imgSrc = getSrc(node1);
    tabletMarqueeTitle = imgSrc;
  } else if (text == 'Tablet Tryit Text') {
    const text = node1.innerText.trim();
    tabletTryIttext = text;
  } else if (text == 'Tablet Foreground') {
    const imgSrc = getSrc(node1);
    tabletForeground = imgSrc;
  } else if (text == 'Tablet background') {
    const imgSrc = getSrc(node1);
    tabletBackground = imgSrc;
  } else if (text == 'Tablet Change Photo Images') {
    const imgSrc = getSrc(node1);
    tabletChnagePhotoImage1 = imgSrc;
  } else if (text == 'Tablet Change Photo Thumbnails') {
    const imgSrc = getSrc(node1);
    tabletChangePhotoIcon1 = imgSrc;
  } else if (text == 'Tablet Change Pattern Images') {
    const imgSrc = getSrc(node1);
    tabletChangePatternImage1 = imgSrc;
  } else if (text == 'Tablet Change Pattern Thumbnails') {
    const imgSrc = getSrc(node1);
    tabletChangePatternIcon1 = imgSrc;
  } else if (text == 'Tablet Change Color Text') {
    const text = node1.innerText.trim().split(',');
    tabletChangeColorText1 = text[0].trim();
  } else if (text == 'Mobile Marquee Title') {
    const imgSrc = getSrc(node1);
    MobileMarqueeTitle = imgSrc;
  } else if (text == 'Mobile Tryit text') {
    const text = node1.innerText.trim();
    mobileTryIttext = text;
  } else if (text == 'Mobile Foreground') {
    const imgSrc = getSrc(node1);
    mobileForeground = imgSrc;
  } else if (text == 'Mobile Background') {
    const imgSrc = getSrc(node1);
    mobileBackground = imgSrc;
  } else if (text == 'Mobile Change Photo Images') {
    const imgSrc = getSrc(node1);
    mobileChnagePhotoImage1 = imgSrc;
  } else if (text == 'Mobile Change Photo Thumbnails') {
    const imgSrc = getSrc(node1);
    mobileChangePhotoIcon1 = imgSrc;
  } else if (text == 'Mobile Change Pattern Images') {
    const imgSrc = getSrc(node1);
    mobileChangePatternImage1 = imgSrc;
  } else if (text == 'Mobile Change Pattern Thumbnails') {
    const imgSrc = getSrc(node1);
    mobileChangePatternIcon1 = imgSrc;
  } else if (text == 'Mobile Change Color Text') {
    const text = node1.innerText.trim().split(',');
    mobileChangeColorText1 = text[0].trim();
  }
};

export default function init(el) {
  const dataSet = el.querySelectorAll(':scope > div');
  dataSet.forEach((data) => {
    const {children} = data;
    // console.log('children: ', children[1]);
    if(children[0].innerText.trim()) {
      // console.log('notess', children[0].innerText.trim());
      getData(children[0], children[1]);
    }
  });
  renderBlade(el);
};