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

// Add project-wide style path here.
const STYLES = '/cclibs/styles/styles.css';

// Use '/libs' if your live site maps '/libs' to milo's origin.
const LIBS = '/libs';

// Add any config options.
const CONFIG = {
  codeRoot: '/cclibs',
  contentRoot: '/creativecloud',
  imsClientId: 'ccmilo', 
  locales: {
    '': { ietf: 'en-US', tk: 'hah7vzn.css' },
    de: { ietf: 'de-DE', tk: 'hah7vzn.css' },
    kr: { ietf: 'ko-KR', tk: 'zfo3ouc' },
    TH_th: { ietf: 'TH–th', tk: 'zfo3ouc' },
  },
  geoRouting: 'on',
  locales: {
    '': { ietf: 'en-US', tk: 'hah7vzn.css' },
    de: { ietf: 'de-DE', tk: 'hah7vzn.css' },
    kr: { ietf: 'ko-KR', tk: 'zfo3ouc' },
    prodDomains: ['www.adobe.com'],
  },
};

// Load LCP image immediately
(async function loadLCPImage() {
  const lcpImg = document.querySelector('img');
  lcpImg?.setAttribute('loading', 'eager');
}());

function decoratePromotion() {
  if (document.querySelector('main .promotion') instanceof HTMLElement) {
    return;
  }

  const promotionElement = document.querySelector('head meta[name="promotion"]');
  if (!promotionElement) {
    return;
  }

  const promo = document.createElement('div');
  promo.classList.add('promotion');
  promo.setAttribute('data-promotion', promotionElement.getAttribute('content').toLowerCase());
  document.querySelector('main > div').appendChild(promo);
}

/*
 * ------------------------------------------------------------
 * Edit below at your own risk
 * ------------------------------------------------------------
 */

const { setLibs } = await import('./utils.js');
const miloLibs = setLibs(LIBS);

(function loadStyles() {
  const paths = [`${miloLibs}/styles/styles.css`];
  if (STYLES) { paths.push(STYLES); }
  paths.forEach((path) => {
    const link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', path);
    document.head.appendChild(link);
  });
}());

(async function loadPage() {
  const { loadArea, loadDelayed, setConfig } = await import(`${miloLibs}/utils/utils.js`);
  decoratePromotion();
  setConfig({ ...CONFIG, miloLibs });
  await loadArea();
  loadDelayed();
}());
