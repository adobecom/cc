const viewports = ['mobile', 'tablet', 'desktop'];
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
  return imageSrc.srcset.replace('./', '/');
}

function createLayer(viewport, property, layerConfig) {
  const mediaUrl = getImageSrc(viewport, layerConfig);
  customElem.config[viewport][property] = mediaUrl;
  return 1;
}

function createEnticement(viewport, property, entConfig) {
  const enticementText = entConfig.querySelector('a').textContent.trim();
  const enticementIcon = entConfig.querySelector('a').href;
  customElem.config[viewport][property[0]] = enticementText;
  customElem.config[viewport][property[1]] = enticementIcon;
  return 1;
}

function createChangeBgGroups(viewport, group, swatches, backgrounds) {
  const groupName = group.textContent.trim();
  const groupIcon = group.querySelector('a').href;
  const groupObj = {
    name: groupName,
    iconUrl: groupIcon,
  };
  if (swatches) {
    groupObj.options = [];
    const bgImgs = backgrounds.querySelectorAll('picture');
    bgImgs.forEach((bgImg, i) => {
      const optionObj = {};
      optionObj.swatchSrc = getImageSrc(viewport, swatches[i]);
      optionObj.src = getImageSrc(viewport, bgImg);
      groupObj.options.push(optionObj);
    });
  } else if (backgrounds) {
    groupObj.options = [];
    const bgs = backgrounds.querySelectorAll('p');
    bgs.forEach((bgP) => {
      const optionObj = {};
      optionObj.src = bgP.textContent.trim();
      groupObj.options.push(optionObj);
    });
  }
  customElem.config[viewport].groups.push(groupObj);
}

export default async function changeBg(el) {
  const layers = ['defaultBgSrc', 'marqueeTitleImgSrc', 'talentSrc'];
  const layerRows = [...el.querySelectorAll(':scope > div')];
  viewports.forEach((vp, vi) => {
    let currentRowIndex = 0;
    layers.forEach((layer) => {
      currentRowIndex += createLayer(vp, layer, layerRows[currentRowIndex].querySelectorAll('picture')[vi]);
    });
    currentRowIndex += createEnticement(vp, ['tryitText', 'tryitSrc'], layerRows[currentRowIndex]);
    const groups = el.querySelectorAll(':scope > div:nth-child(n + 5) > div:only-child');
    [...groups].forEach((group) => {
      const swatchDiv = group.parentNode.nextElementSibling;
      const backgroundDiv = group.parentNode.nextElementSibling.nextElementSibling;
      const swatches = swatchDiv.querySelectorAll('picture').length > 1 ? swatchDiv.querySelectorAll('picture') : null;
      let backgrounds = null;
      if (swatches) backgrounds = backgroundDiv.querySelectorAll('div').length > 1 ? backgroundDiv.querySelectorAll('div')[vi] : null;
      else backgrounds = swatchDiv.querySelectorAll('div').length > 1 ? swatchDiv.querySelectorAll('div')[vi] : null;
      createChangeBgGroups(vp, group, swatches, backgrounds);
    });
  });

  el.innerHTML = '';
  el.append(customElem);
}
