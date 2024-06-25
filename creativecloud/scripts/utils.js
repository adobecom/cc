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
const COOKIE_SIGNED_IN = 'acomsis';
const COOKIE_SIGNED_IN_STAGE = 'acomsis_stage';

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

const { createTag, localizeLink, getConfig, loadStyle, createIntersectionObserver } = await import(`${miloLibs}/utils/utils.js`);
export { createTag, loadStyle, localizeLink, createIntersectionObserver, getConfig };

function getDecorateAreaFn() {
  let lcpImgSet = false;

  // Load LCP image immediately
  const eagerLoad = (lcpImg) => {
    lcpImg?.setAttribute('loading', 'eager');
    lcpImg?.setAttribute('fetchpriority', 'high');
    if (lcpImg) lcpImgSet = true;
  };

  function isRootPage() {
    const currUrl = new URL(window.location);
    const pathSeg = currUrl.pathname.split('/').length;
    const locale = getConfig().locale?.prefix;
    return (locale === '' && pathSeg < 3) || (locale !== '' && pathSeg < 4);
  }

  function replaceDotMedia(area = document) {
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
    if (isRootPage()) replaceDotMedia();
    if (!lcpImgSet) loadLCPImage(area, options);
  };
}

export async function acomsisCookieHandler() {
  const getCookie = (name) => document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`))
    ?.split('=')[1];

  async function imsCheck() {
    const { loadIms } = await import(`${miloLibs}/utils/utils.js`);
    let isSignedInUser = false;
    try {
      await loadIms();
      if (window.adobeIMS?.isSignedInUser()) {
        await window.adobeIMS.validateToken();
        // validate token rejects and falls into the following catch block.
        isSignedInUser = true;
      }
    } catch (e) {
      window.lana?.log('Homepage IMS check failed', e);
    }
    if (!isSignedInUser) {
      document.getElementById('ims-body-style')?.remove();
    }
    return isSignedInUser;
  }
  imsCheck().then((isSignedInUser) => {
    const isStage = window.location.host.includes('stage');
    const acomsisCokie = isStage ? getCookie(COOKIE_SIGNED_IN_STAGE) : getCookie(COOKIE_SIGNED_IN);
    if (isSignedInUser && !acomsisCokie) {
      const date = new Date();
      date.setTime(date.getTime() + (365 * 24 * 60 * 60 * 1000));
      document.cookie = `${isStage ? COOKIE_SIGNED_IN_STAGE : COOKIE_SIGNED_IN}=1;path=/;expires=${date.toUTCString()};domain=${isStage ? 'www.stage.' : ''}adobe.com;`;
      window.location.reload();
    }
    if (!isSignedInUser && acomsisCokie) {
      if (!isStage) {
        document.cookie = `${COOKIE_SIGNED_IN}=;path=/;expires=${new Date(0).toUTCString()};`;
        document.cookie = `${COOKIE_SIGNED_IN}=;path=/;expires=${new Date(0).toUTCString()};domain=adobe.com;`;
      } else {
        document.cookie = `${COOKIE_SIGNED_IN_STAGE}=;path=/;expires=${new Date(0).toUTCString()};domain=www.stage.adobe.com;`;
      }
      window.location.reload();
    }
  });
}

export const decorateArea = getDecorateAreaFn();
