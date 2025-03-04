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
const CHINA_SIGNED_IN_HOME_PATH = '/cn/creativecloud/roc/home';

const locales = {
  '': { ietf: 'en-US', tk: 'hah7vzn.css' },
  ae_ar: { ietf: 'ar-AE', tk: 'lpk1hwn.css', dir: 'rtl' },
  ae_en: { ietf: 'en', tk: 'hah7vzn.css' },
  africa: { ietf: 'en', tk: 'hah7vzn.css' },
  ar: { ietf: 'ar', tk: 'lpk1hwn.css', dir: 'rtl' },
  ar_es: { ietf: 'es-AR', tk: 'hah7vzn.css' },
  at: { ietf: 'de-AT', tk: 'hah7vzn.css' },
  au: { ietf: 'en-AU', tk: 'hah7vzn.css' },
  be_en: { ietf: 'en-BE', tk: 'hah7vzn.css' },
  be_fr: { ietf: 'fr-BE', tk: 'hah7vzn.css' },
  be_nl: { ietf: 'nl-BE', tk: 'qxw8hzm.css' },
  bg: { ietf: 'bg-BG', tk: 'qxw8hzm.css' },
  br: { ietf: 'pt-BR', tk: 'hah7vzn.css' },
  ca_fr: { ietf: 'fr-CA', tk: 'hah7vzn.css' },
  ca: { ietf: 'en-CA', tk: 'hah7vzn.css' },
  ch_de: { ietf: 'de-CH', tk: 'hah7vzn.css' },
  ch_fr: { ietf: 'fr-CH', tk: 'hah7vzn.css' },
  ch_it: { ietf: 'it-CH', tk: 'hah7vzn.css' },
  cl: { ietf: 'es-CL', tk: 'hah7vzn.css' },
  cn: { ietf: 'zh-CN', tk: 'qxw8hzm' },
  co: { ietf: 'es-CO', tk: 'hah7vzn.css' },
  cr: { ietf: 'es-419', tk: 'hah7vzn.css' },
  cy_en: { ietf: 'en-CY', tk: 'hah7vzn.css' },
  cz: { ietf: 'cs-CZ', tk: 'qxw8hzm.css' },
  de: { ietf: 'de-DE', tk: 'hah7vzn.css' },
  dk: { ietf: 'da-DK', tk: 'qxw8hzm.css' },
  ec: { ietf: 'es-419', tk: 'hah7vzn.css' },
  ee: { ietf: 'et-EE', tk: 'qxw8hzm.css' },
  eg_ar: { ietf: 'ar', tk: 'qxw8hzm.css', dir: 'rtl' },
  eg_en: { ietf: 'en-GB', tk: 'hah7vzn.css' },
  el: { ietf: 'el', tk: 'qxw8hzm.css' },
  es: { ietf: 'es-ES', tk: 'hah7vzn.css' },
  fi: { ietf: 'fi-FI', tk: 'qxw8hzm.css' },
  fr: { ietf: 'fr-FR', tk: 'hah7vzn.css' },
  gr_el: { ietf: 'el', tk: 'qxw8hzm.css' },
  gr_en: { ietf: 'en-GR', tk: 'hah7vzn.css' },
  gt: { ietf: 'es-419', tk: 'hah7vzn.css' },
  hk_en: { ietf: 'en-HK', tk: 'hah7vzn.css' },
  hk_zh: { ietf: 'zh-HK', tk: 'jay0ecd' },
  hu: { ietf: 'hu-HU', tk: 'qxw8hzm.css' },
  id_en: { ietf: 'en', tk: 'hah7vzn.css' },
  id_id: { ietf: 'id', tk: 'qxw8hzm.css' },
  ie: { ietf: 'en-GB', tk: 'hah7vzn.css' },
  il_en: { ietf: 'en-IL', tk: 'hah7vzn.css' },
  il_he: { ietf: 'he', tk: 'qxw8hzm.css', dir: 'rtl' },
  in_hi: { ietf: 'hi', tk: 'qxw8hzm.css' },
  in: { ietf: 'en-GB', tk: 'hah7vzn.css' },
  it: { ietf: 'it-IT', tk: 'hah7vzn.css' },
  jp: { ietf: 'ja-JP', tk: 'dvg6awq' },
  kr: { ietf: 'ko-KR', tk: 'qjs5sfm' },
  kw_ar: { ietf: 'ar', tk: 'qxw8hzm.css', dir: 'rtl' },
  kw_en: { ietf: 'en-GB', tk: 'hah7vzn.css' },
  la: { ietf: 'es-LA', tk: 'hah7vzn.css' },
  langstore: { ietf: 'en-US', tk: 'hah7vzn.css' },
  lt: { ietf: 'lt-LT', tk: 'qxw8hzm.css' },
  lu_de: { ietf: 'de-LU', tk: 'hah7vzn.css' },
  lu_en: { ietf: 'en-LU', tk: 'hah7vzn.css' },
  lu_fr: { ietf: 'fr-LU', tk: 'hah7vzn.css' },
  lv: { ietf: 'lv-LV', tk: 'qxw8hzm.css' },
  mena_ar: { ietf: 'ar', tk: 'qxw8hzm.css', dir: 'rtl' },
  mena_en: { ietf: 'en', tk: 'hah7vzn.css' },
  mt: { ietf: 'en-MT', tk: 'hah7vzn.css' },
  mx: { ietf: 'es-MX', tk: 'hah7vzn.css' },
  my_en: { ietf: 'en-GB', tk: 'hah7vzn.css' },
  my_ms: { ietf: 'ms', tk: 'qxw8hzm.css' },
  ng: { ietf: 'en-GB', tk: 'hah7vzn.css' },
  nl: { ietf: 'nl-NL', tk: 'qxw8hzm.css' },
  no: { ietf: 'no-NO', tk: 'qxw8hzm.css' },
  nz: { ietf: 'en-GB', tk: 'hah7vzn.css' },
  pe: { ietf: 'es-PE', tk: 'hah7vzn.css' },
  ph_en: { ietf: 'en', tk: 'hah7vzn.css' },
  ph_fil: { ietf: 'fil-PH', tk: 'qxw8hzm.css' },
  pl: { ietf: 'pl-PL', tk: 'qxw8hzm.css' },
  pr: { ietf: 'es-419', tk: 'hah7vzn.css' },
  pt: { ietf: 'pt-PT', tk: 'hah7vzn.css' },
  qa_ar: { ietf: 'ar', tk: 'qxw8hzm.css', dir: 'rtl' },
  qa_en: { ietf: 'en-GB', tk: 'hah7vzn.css' },
  ro: { ietf: 'ro-RO', tk: 'qxw8hzm.css' },
  ru: { ietf: 'ru-RU', tk: 'qxw8hzm.css' },
  sa_ar: { ietf: 'ar', tk: 'qxw8hzm.css', dir: 'rtl' },
  sa_en: { ietf: 'en', tk: 'hah7vzn.css' },
  se: { ietf: 'sv-SE', tk: 'qxw8hzm.css' },
  sg: { ietf: 'en-SG', tk: 'hah7vzn.css' },
  si: { ietf: 'sl-SI', tk: 'qxw8hzm.css' },
  sk: { ietf: 'sk-SK', tk: 'qxw8hzm.css' },
  th_en: { ietf: 'en', tk: 'hah7vzn.css' },
  th_th: { ietf: 'th', tk: 'lqo2bst.css' },
  tr: { ietf: 'tr-TR', tk: 'qxw8hzm.css' },
  tw: { ietf: 'zh-TW', tk: 'jay0ecd' },
  ua: { ietf: 'uk-UA', tk: 'qxw8hzm.css' },
  uk: { ietf: 'en-GB', tk: 'hah7vzn.css' },
  vn_en: { ietf: 'en-GB', tk: 'hah7vzn.css' },
  vn_vi: { ietf: 'vi', tk: 'qxw8hzm.css' },
  za: { ietf: 'en-GB', tk: 'hah7vzn.css' },
  cis_en: { ietf: 'en', tk: 'rks2kng.css' },
  cis_ru: { ietf: 'ru', tk: 'qxw8hzm.css' },
  sea: { ietf: 'en', tk: 'hah7vzn.css' },
};

const stageDomainsMap = {
  'www.stage.adobe.com': {
    'www.adobe.com(?!\\/*\\S*\\/(mini-plans|plans-fragments\\/modals|genuine(\\.html)?\\/?)\\S*)': 'origin',
    'business.adobe.com': 'business.stage.adobe.com',
    'helpx.adobe.com': 'helpx.stage.adobe.com',
    'blog.adobe.com': 'blog.stage.adobe.com',
    'developer.adobe.com': 'developer-stage.adobe.com',
    'news.adobe.com': 'news.stage.adobe.com',
    'firefly.adobe.com': 'firefly-stage.corp.adobe.com',
    'creativecloud.adobe.com': 'stage.creativecloud.adobe.com',
    'projectneo.adobe.com': 'stg.projectneo.adobe.com',
  },
  '--cc--adobecom.(hlx|aem).live': {
    'www.adobe.com(?!\\/*\\S*\\/(mini-plans|plans-fragments\\/modals|genuine(\\.html)?\\/?)\\S*)': 'origin',
    'business.adobe.com': 'business.stage.adobe.com',
    'helpx.adobe.com': 'helpx.stage.adobe.com',
    'blog.adobe.com': 'blog.stage.adobe.com',
    'developer.adobe.com': 'developer-stage.adobe.com',
    'news.adobe.com': 'news.stage.adobe.com',
    'firefly.adobe.com': 'firefly-stage.corp.adobe.com',
    'creativecloud.adobe.com': 'stage.creativecloud.adobe.com',
    'projectneo.adobe.com': 'stg.projectneo.adobe.com',
  },
  '--cc--adobecom.(hlx|aem).page': {
    'www.adobe.com(?!\\/*\\S*\\/(mini-plans|plans-fragments\\/modals|genuine(\\.html)?\\/?)\\S*)': 'origin',
    'business.adobe.com': 'business.stage.adobe.com',
    'helpx.adobe.com': 'helpx.stage.adobe.com',
    'blog.adobe.com': 'blog.stage.adobe.com',
    'developer.adobe.com': 'developer-stage.adobe.com',
    'news.adobe.com': 'news.stage.adobe.com',
    'firefly.adobe.com': 'firefly-stage.corp.adobe.com',
    'creativecloud.adobe.com': 'stage.creativecloud.adobe.com',
    'projectneo.adobe.com': 'stg.projectneo.adobe.com',
  },
  '.graybox.adobe.com': { 'www.adobe.com(?!\\/*\\S*\\/(mini-plans|plans-fragments\\/modals|genuine(\\.html)?\\/?)\\S*)': 'origin' },
};

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
        && !hostname.includes('aem.page')
        && !hostname.includes('aem.live')
        && !hostname.includes('localhost')) {
        libs = prodLibs;
        return libs;
      }
      const branch = new URLSearchParams(window.location.search).get('milolibs') || 'main';
      if (branch === 'local') { libs = 'http://localhost:6456/libs'; return libs; }
      const env = hostname.includes('.hlx.') ? 'hlx' : 'aem';
      if (branch.indexOf('--') > -1) { libs = `https://${branch}.${env}.live/libs`; return libs; }
      libs = `https://${branch}--milo--adobecom.${env}.live/libs`;
      return libs;
    }, () => libs,
  ];
})();

const miloLibs = setLibs('/libs');

// eslint-disable-next-line object-curly-newline
const { createTag, localizeLink, getConfig, loadStyle, loadLink, loadScript, createIntersectionObserver } = await import(`${miloLibs}/utils/utils.js`);
// eslint-disable-next-line max-len
export { createTag, loadStyle, loadLink, loadScript, localizeLink, createIntersectionObserver, getConfig };

function defineDeviceByScreenSize() {
  const DESKTOP_SIZE = 1200;
  const MOBILE_SIZE = 600;
  const screenWidth = window.innerWidth;
  if (screenWidth >= DESKTOP_SIZE) {
    return 'DESKTOP';
  }
  if (screenWidth <= MOBILE_SIZE) {
    return 'MOBILE';
  }
  return 'TABLET';
}

function heroForegroundImage(firstBlock) {
  const rows = [...firstBlock.querySelectorAll(':scope > div')];
  if (rows.length > 1 && rows[0].textContent !== '') rows.shift();
  const mainRowIndex = rows.findIndex((row) => {
    const firstColText = row.children[0].textContent.toLowerCase().trim();
    return !firstColText.includes('con-block-row-');
  });
  return rows[mainRowIndex];
}

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
    const firstBlock = fragmentLink ? area.querySelector('body > div > div') : area.querySelector('body > main > div > div');
    let fgDivs = null;
    switch (true) {
      case firstBlock?.classList.contains('changebg'): {
        firstBlock.querySelector(':scope > div:nth-child(1)').querySelectorAll('img').forEach(eagerLoad);
        import(`${getConfig().codeRoot}/deps/interactive-marquee-changebg/changeBgMarquee.js`);
        break;
      }
      case firstBlock?.classList.contains('marquee') || firstBlock?.classList.contains('hero-marquee'): {
        // Load image eagerly for specific breakpoint
        const viewport = defineDeviceByScreenSize();
        const bgImages = firstBlock.querySelectorAll('div').length > 1 ? firstBlock.querySelector('div') : null;
        const lcpImgVP = {
          MOBILE: 'div:first-child img',
          TABLET: 'div:nth-child(2) img',
          DESKTOP: 'div:last-child img',
        };
        if (bgImages?.querySelectorAll('img').length === 1 && bgImages.querySelectorAll('div').length === 1) eagerLoad(bgImages?.querySelector('div img'));
        else eagerLoad(bgImages?.querySelector(`:scope ${lcpImgVP[viewport]}`));
        // Foreground image
        if (firstBlock?.classList.contains('hero-marquee')) {
          const foreground = heroForegroundImage(firstBlock);
          const imageHidden = (viewport === 'TABLET' && firstBlock?.classList.contains('media-hidden-tablet')) || (viewport === 'MOBILE' && firstBlock?.classList.contains('media-hidden-mobile'));
          if (!imageHidden) eagerLoad(foreground.querySelector('img'));
        } else eagerLoad(firstBlock.querySelector(':scope div:last-child > div img'));
        break;
      }
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
    if (!lcpImgSet || window.document.querySelector('body > main > div > div > a.fragment')) loadLCPImage(area, options);
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

const CONFIG = {
  contentRoot: '/cc-shared',
  codeRoot: '/creativecloud',
  imsClientId: 'adobedotcom-cc',
  locales,
  geoRouting: 'on',
  prodDomains: ['www.adobe.com', 'helpx.adobe.com', 'business.adobe.com'],
  stageDomainsMap,
  decorateArea,
  adobeid: {
    api_parameters: { check_token: { guest_allowed: true } },
    enableGuestAccounts: true,
    enableGuestTokenForceRefresh: true,
  },
  stage: {
    pdfViewerClientId: '9f7f19a46bd542e2b8548411e51eb4d4',
    pdfViewerReportSuite: 'adbadobenonacdcqa',
    psUrl: 'https://stage.photoshop.adobe.com',
    odinEndpoint: 'https://stage-odin.adobe.com/',
  },
  live: {
    pdfViewerClientId: '9047b46d4bbe4033a0eed98f74d7d9d2',
    pdfViewerReportSuite: 'adbadobenonacdcqa',
  },
  prod: {
    pdfViewerClientId: '409019ebd2d546c0be1a0b5a61fe65df',
    pdfViewerReportSuite: 'adbadobenonacdcprod',
    psUrl: 'https://photoshop.adobe.com',
    odinEndpoint: 'https://odin.adobe.com/',
  },
  page: { pdfViewerClientId: '9f6ffa6b76bf4c87a3e09e20b218d439' },
  hlxPage: { pdfViewerClientId: 'b70362e4031e4fdfb4ad5ce1ffef61a0' },
  hlxLive: { pdfViewerClientId: 'fb748b00ec814d308f5115dbc1daeea5' },
  jarvis: {
    id: 'adobedotcom2',
    version: '1.83',
    onDemand: false,
  },
  htmlExclude: [
    /www\.adobe\.com\/(\w\w(_\w\w)?\/)?express(\/.*)?/,
    /www\.adobe\.com\/(\w\w(_\w\w)?\/)?go(\/.*)?/,
    /www\.adobe\.com\/(\w\w(_\w\w)?\/)?learn(\/.*)?/,
  ],
};

export const scriptInit = async () => {
  const isSignedInHomepage = window.location.pathname.includes(CHINA_SIGNED_IN_HOME_PATH);
  const trialsCheck = document.querySelector('head > meta[name="trialsims"]');
  if (trialsCheck && trialsCheck.content.toLowerCase() === 'on') {
    CONFIG.imsClientId = 'trials1';
    CONFIG.adobeid = {
      api_parameters: {},
      scope: 'AdobeID,openid,gnav,update_profile.mrktPerm,update_profile.job_function,update_profile.industry,update_profile.phoneNumber,update_profile.address.mail_to,update_profile.job_title,update_profile.company,additional_info.address.mail_to,additional_info.job_function,additional_info.industry,additional_info.job_title,additional_info.company,trials_ro,pps.read,firefly_api,additional_info.roles,read_organizations',
      is_mandatory_sign_in: true,
      redirect_uri: window.location.href,
    };
  }
  const { loadArea, setConfig, loadLana } = await import(`${miloLibs}/utils/utils.js`);
  setConfig({ ...CONFIG, miloLibs });
  if (isSignedInHomepage) acomsisCookieHandler();
  decorateArea();
  (function loadStyles() {
    const paths = [`${miloLibs}/styles/styles.css`];
    paths.forEach((path) => {
      const link = document.createElement('link');
      link.setAttribute('rel', 'stylesheet');
      link.setAttribute('href', path);
      document.head.appendChild(link);
    });
  }());
  (async function loadPage() {
    loadLana({ clientId: 'cc' });
    await loadArea();
  }());
};
