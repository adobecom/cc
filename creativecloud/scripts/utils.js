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
  // Americas
  ar: { ietf: 'es-AR', tk: 'oln4yqj.css' },
  br: { ietf: 'pt-BR', tk: 'inq1xob.css' },
  ca: { ietf: 'en-CA', tk: 'pps7abe.css' },
  ca_fr: { ietf: 'fr-CA', tk: 'vrk5vyv.css' },
  cl: { ietf: 'es-CL', tk: 'oln4yqj.css' },
  co: { ietf: 'es-CO', tk: 'oln4yqj.css' },
  la: { ietf: 'es-LA', tk: 'oln4yqj.css' },
  mx: { ietf: 'es-MX', tk: 'oln4yqj.css' },
  pe: { ietf: 'es-PE', tk: 'oln4yqj.css' },
  '': { ietf: 'en-US', tk: 'hah7vzn.css' },
  // EMEA
  africa: { ietf: 'en', tk: 'pps7abe.css' },
  be_fr: { ietf: 'fr-BE', tk: 'vrk5vyv.css' },
  be_en: { ietf: 'en-BE', tk: 'pps7abe.css' },
  be_nl: { ietf: 'nl-BE', tk: 'cya6bri.css' },
  cy_en: { ietf: 'en-CY', tk: 'pps7abe.css' },
  dk: { ietf: 'da-DK', tk: 'aaz7dvd.css' },
  de: { ietf: 'de-DE', tk: 'vin7zsi.css' },
  ee: { ietf: 'et-EE', tk: 'aaz7dvd.css' },
  es: { ietf: 'es-ES', tk: 'oln4yqj.css' },
  fr: { ietf: 'fr-FR', tk: 'vrk5vyv.css' },
  gr_en: { ietf: 'en-GR', tk: 'pps7abe.css' },
  ie: { ietf: 'en-GB', tk: 'pps7abe.css' },
  il_en: { ietf: 'en-IL', tk: 'pps7abe.css' },
  it: { ietf: 'it-IT', tk: 'bbf5pok.css' },
  lv: { ietf: 'lv-LV', tk: 'aaz7dvd.css' },
  lt: { ietf: 'lt-LT', tk: 'aaz7dvd.css' },
  lu_de: { ietf: 'de-LU', tk: 'vin7zsi.css' },
  lu_en: { ietf: 'en-LU', tk: 'pps7abe.css' },
  lu_fr: { ietf: 'fr-LU', tk: 'vrk5vyv.css' },
  hu: { ietf: 'hu-HU', tk: 'aaz7dvd.css' },
  mt: { ietf: 'en-MT', tk: 'pps7abe.css' },
  mena_en: { ietf: 'en', tk: 'pps7abe.css' },
  nl: { ietf: 'nl-NL', tk: 'cya6bri.css' },
  no: { ietf: 'no-NO', tk: 'aaz7dvd.css' },
  pl: { ietf: 'pl-PL', tk: 'aaz7dvd.css' },
  pt: { ietf: 'pt-PT', tk: 'inq1xob.css' },
  ro: { ietf: 'ro-RO', tk: 'aaz7dvd.css' },
  sa_en: { ietf: 'en', tk: 'pps7abe.css' },
  ch_de: { ietf: 'de-CH', tk: 'vin7zsi.css' },
  si: { ietf: 'sl-SI', tk: 'aaz7dvd.css' },
  sk: { ietf: 'sk-SK', tk: 'aaz7dvd.css' },
  ch_fr: { ietf: 'fr-CH', tk: 'vrk5vyv.css' },
  fi: { ietf: 'fi-FI', tk: 'aaz7dvd.css' },
  se: { ietf: 'sv-SE', tk: 'fpk1pcd.css' },
  ch_it: { ietf: 'it-CH', tk: 'bbf5pok.css' },
  tr: { ietf: 'tr-TR', tk: 'aaz7dvd.css' },
  ae_en: { ietf: 'en', tk: 'pps7abe.css' },
  uk: { ietf: 'en-GB', tk: 'pps7abe.css' },
  at: { ietf: 'de-AT', tk: 'vin7zsi.css' },
  cz: { ietf: 'cs-CZ', tk: 'aaz7dvd.css' },
  bg: { ietf: 'bg-BG', tk: 'aaz7dvd.css' },
  ru: { ietf: 'ru-RU', tk: 'aaz7dvd.css' },
  ua: { ietf: 'uk-UA', tk: 'aaz7dvd.css' },
  il_he: { ietf: 'he', tk: 'nwq1mna.css', dir: 'rtl' },
  ae_ar: { ietf: 'ar', tk: 'nwq1mna.css', dir: 'rtl' },
  mena_ar: { ietf: 'ar', tk: 'dis2dpj.css', dir: 'rtl' },
  sa_ar: { ietf: 'ar', tk: 'nwq1mna.css', dir: 'rtl' },
  // Asia Pacific
  au: { ietf: 'en-AU', tk: 'pps7abe.css' },
  hk_en: { ietf: 'en-HK', tk: 'pps7abe.css' },
  in: { ietf: 'en-GB', tk: 'pps7abe.css' },
  id_id: { ietf: 'id', tk: 'czc0mun.css' },
  id_en: { ietf: 'en', tk: 'pps7abe.css' },
  my_ms: { ietf: 'ms', tk: 'sxj4tvo.css' },
  my_en: { ietf: 'en-GB', tk: 'pps7abe.css' },
  nz: { ietf: 'en-GB', tk: 'pps7abe.css' },
  ph_en: { ietf: 'en', tk: 'pps7abe.css' },
  ph_fil: { ietf: 'fil-PH', tk: 'ict8rmp.css' },
  sg: { ietf: 'en-SG', tk: 'pps7abe.css' },
  th_en: { ietf: 'en', tk: 'pps7abe.css' },
  in_hi: { ietf: 'hi', tk: 'aaa8deh.css' },
  th_th: { ietf: 'th', tk: 'lqo2bst.css' },
  cn: { ietf: 'zh-CN', tk: 'puu3xkp' },
  hk_zh: { ietf: 'zh-HK', tk: 'jay0ecd' },
  tw: { ietf: 'zh-TW', tk: 'jay0ecd' },
  jp: { ietf: 'ja-JP', tk: 'dvg6awq' },
  kr: { ietf: 'ko-KR', tk: 'qjs5sfm' },
  // Langstore Support.
  langstore: { ietf: 'en-US', tk: 'hah7vzn.css' },
  // geo expansion MWPW-125686
  za: { ietf: 'en-GB', tk: 'pps7abe.css' }, // South Africa (GB English)
  ng: { ietf: 'en-GB', tk: 'pps7abe.css' }, // Nigeria (GB English)
  cr: { ietf: 'es-419', tk: 'oln4yqj.css' }, // Costa Rica (Spanish Latin America)
  ec: { ietf: 'es-419', tk: 'oln4yqj.css' }, // Ecuador (Spanish Latin America)
  pr: { ietf: 'es-419', tk: 'oln4yqj.css' }, // Puerto Rico (Spanish Latin America)
  gt: { ietf: 'es-419', tk: 'oln4yqj.css' }, // Guatemala (Spanish Latin America)
  eg_ar: { ietf: 'ar', tk: 'nwq1mna.css', dir: 'rtl' }, // Egypt (Arabic)
  kw_ar: { ietf: 'ar', tk: 'nwq1mna.css', dir: 'rtl' }, // Kuwait (Arabic)
  qa_ar: { ietf: 'ar', tk: 'nwq1mna.css', dir: 'rtl' }, // Qatar (Arabic)
  eg_en: { ietf: 'en-GB', tk: 'pps7abe.css' }, // Egypt (GB English)
  kw_en: { ietf: 'en-GB', tk: 'pps7abe.css' }, // Kuwait (GB English)
  qa_en: { ietf: 'en-GB', tk: 'pps7abe.css' }, // Qatar (GB English)
  gr_el: { ietf: 'el', tk: 'fnx0rsr.css' }, // Greece (Greek)
  vn_en: { ietf: 'en-GB', tk: 'hah7vzn.css' },
  vn_vi: { ietf: 'vi', tk: 'qxw8hzm.css' },
  cis_ru: { ietf: 'ru', tk: 'qxw8hzm.css' },
  cis_en: { ietf: 'en', tk: 'pps7abe.css' },
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
