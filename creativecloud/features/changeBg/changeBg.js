const customElem = document.createElement('ft-changebackgroundmarquee');
customElem.config = {
  mobile: { groups: [] },
  tablet: { groups: [] },
  desktop: { groups: [] },
};

function getImageSrc(viewport, pic) {
  let imageSrc = '';
  if (viewport === 'mobile') imageSrc = pic.querySelector('source[type="image/webp"]:not([media])');
  else imageSrc = pic.querySelector('source[type="image/webp"][media]');
  return imageSrc.srcset;
}

function createLayer(viewport, property, layerConfig) {
  const mediaUrl = getImageSrc(viewport, layerConfig);
  customElem.config[viewport][property] = mediaUrl;
  return 1;
}

function createEnticement(viewport, property, entConfig) {
  const enticementText = entConfig.querySelector('a').textContent.trim();
  const enticementIcon = entConfig.querySelector('a').href;
  if (property[0] !== '') {
    customElem.config[viewport][property[0]] = enticementText;
  }
  customElem.config[viewport][property[1]] = enticementIcon;
  return 1;
}

function createGroups(vp, current, swatchArr, srcArr) {
  const obj = {
    name: current.innerText.trim(),
    iconUrl: current.querySelector('a').href,
  };
  if (swatchArr && srcArr) {
    obj.options = [];
    srcArr.forEach((src, i) => {
      const optionObj = {
        src: getImageSrc(vp, src),
        swatchSrc: getImageSrc(vp, swatchArr[i]),
      };
      obj.options.push(optionObj);
    });
  } else if (srcArr) {
    obj.options = [];
    srcArr.forEach((src) => {
      const optionObj = { src };
      obj.options.push(optionObj);
    });
  }
  customElem.config[vp].groups.push(obj);
}

export default function changeBg(el) {
  const layers = ['defaultBgSrc', 'marqueeTitleImgSrc', 'talentSrc'];
  const layerRows = [...el.querySelectorAll(':scope > div')];
  ['mobile', 'tablet', 'desktop'].forEach((vp, vi) => {
    let currentRowIndex = 0;
    layers.forEach((layer) => {
      currentRowIndex += createLayer(vp, layer, layerRows[currentRowIndex].querySelectorAll('picture')[vi]);
    });
    currentRowIndex += createEnticement(vp, ['tryitText', 'tryitSrc'], layerRows[currentRowIndex]);
    if (vp === 'desktop') {
      currentRowIndex += createEnticement(vp, ['', 'cursorSrc'], layerRows[currentRowIndex]);
    } else {
      currentRowIndex += 1;
    }
    while (currentRowIndex < layerRows.length) {
      let temprowid = currentRowIndex;
      while (temprowid + 1 < layerRows.length && layerRows[temprowid + 1].getElementsByTagName('a').length === 0) {
        temprowid += 1;
      }
      const current = layerRows[currentRowIndex].querySelector('div');
      if (currentRowIndex + 2 === temprowid) {
        const swatchArr = layerRows[currentRowIndex + 1].querySelectorAll('picture');
        const srcArr = layerRows[currentRowIndex + 2].querySelectorAll('div')[vi].querySelectorAll('picture');
        createGroups(vp, current, swatchArr, srcArr);
      } else if (currentRowIndex + 1 === temprowid) {
        const srcArr = layerRows[currentRowIndex + 1].querySelectorAll('div')[vi].innerText.split(',');
        createGroups(vp, current, '', srcArr);
      } else {
        createGroups(vp, current);
      }
      currentRowIndex = temprowid + 1;
    }
  });
  el.innerHTML = '';
  el.append(customElem);
}
