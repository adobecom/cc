/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

/*
 * ------------------------------------------------------------
 * Edit below at your own risk
 * ------------------------------------------------------------
 */

/**
 * The decision engine for where to get Milo's libs from.
 */
export const [setLibs, getLibs] = (() => {
  let libs;
  return [
    (prodLibs, force = false) => {
      if (force) {
        libs = prodLibs;
        return libs;
      }
      const { hostname } = window.location;
      if (!hostname.includes('hlx.page')
        && !hostname.includes('hlx.live')
        && !hostname.includes('localhost')) {
        libs = prodLibs;
        return libs;
      }
      const branch = new URLSearchParams(window.location.search).get('milolibs') || 'main';
      if (branch === 'local') { libs = 'http://localhost:6456/libs'; return libs; }
      if (branch.indexOf('--') > -1) { libs = `https://${branch}.hlx.live/libs`; return libs; }
      libs = `https://${branch}--milo--adobecom.hlx.live/libs`;
      return libs;
    }, () => libs,
  ];
})();

const miloLibs = setLibs('/libs');

const { createTag, localizeLink, getConfig, loadStyle } = await import(`${miloLibs}/utils/utils.js`);
export { createTag, loadStyle, localizeLink };

function getDecorateAreaFn() {
  let lcpImgSet = false;

  // Load LCP image immediately
  const eagerLoad = (lcpImg) => {
    lcpImg?.setAttribute('loading', 'eager');
    lcpImg?.setAttribute('fetchpriority', 'high');
    if (lcpImg) lcpImgSet = true;
  };

  function replaceDotMedia(area = document) {
    const currUrl = new URL(window.location);
    const pathSeg = currUrl.pathname.split('/').length;
    if (pathSeg >= 3) return;
    const resetAttributeBase = (tag, attr) => {
      area.querySelectorAll(`${tag}[${attr}^="./media_"]`).forEach((el) => {
        el[attr] = `${new URL(`${getConfig().contentRoot}${el.getAttribute(attr).substring(1)}`, window.location).href}`;
      });
    };
    resetAttributeBase('img', 'src');
    resetAttributeBase('source', 'srcset');
  }

  async function loadLCPImage(area = document, { fragmentLink = null } = {}) {
    const firstBlock = area.querySelector('body > main > div > div');
    let fgDivs = null;
    switch (true) {
      case firstBlock?.classList.contains('changebg'): {
        firstBlock.querySelector(':scope > div:nth-child(1)').querySelectorAll('img').forEach(eagerLoad);
        import(`${getConfig().codeRoot}/deps/interactive-marquee-changebg/changeBgMarquee.js`);
        break;
      }
      case firstBlock?.classList.contains('marquee'):
        firstBlock.querySelectorAll('img').forEach(eagerLoad);
        break;
      case firstBlock?.classList.contains('interactive-marquee'):
        firstBlock.querySelector(':scope > div:nth-child(1)').querySelectorAll('img').forEach(eagerLoad);
        fgDivs = firstBlock.querySelector(':scope > div:nth-child(2)').querySelectorAll('div:not(:first-child)');
        fgDivs.forEach((d) => eagerLoad(d.querySelector('img')));
        if (!firstBlock.classList.contains('changebg')) loadStyle('/creativecloud/blocks/interactive-marquee/milo-marquee.css');
        break;
      case !!fragmentLink:
        if (window.document.querySelector('a.fragment') === fragmentLink && !window.document.querySelector('img[loading="eager"]')) {
          eagerLoad(area.querySelector('img'));
        }
        break;
      default:
        if (!fragmentLink) eagerLoad(area.querySelector('img'));
        break;
    }
  }

  return (area, options) => {
    replaceDotMedia();
    if (!lcpImgSet) loadLCPImage(area, options);
  };
}

export const decorateArea = getDecorateAreaFn();
