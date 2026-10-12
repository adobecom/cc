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
const SESSION_CATALOG_POST_ADOBEID_RELOAD = 'cc-catalog-post-adobeid-reload';

const LANA_OPTIONS = {
  tags: 'utils',
  errorType: 'i',
  severity: 'error',
};

/** True for services.adobe.com and *.services.adobe.com (e.g. adobeid-na1.services.adobe.com). */
function isAdobeServicesHost(hostname) {
  return hostname === 'services.adobe.com' || hostname.endsWith('.services.adobe.com');
}

/**
 * Reload once when landing on a /catalog URL after the Adobe services auth flow
 * so IMS-dependent UI can hydrate.
 * Uses sessionStorage so we do not loop if referrer is still present after reload.
 */
export function maybeRefreshCatalogFromAdobeId() {
  if (!window.location.pathname.includes('/catalog')) return;
  if (sessionStorage.getItem(SESSION_CATALOG_POST_ADOBEID_RELOAD) === 'true') {
    sessionStorage.removeItem(SESSION_CATALOG_POST_ADOBEID_RELOAD);
    return;
  }
  try {
    if (!document.referrer) return;
    const { hostname } = new URL(document.referrer);
    if (!isAdobeServicesHost(hostname)) return;
  } catch {
    return;
  }
  sessionStorage.setItem(SESSION_CATALOG_POST_ADOBEID_RELOAD, 'true');
  window.location.reload();
}

export const locales = {
  // Americas
  ar: { ietf: 'es-AR', tk: 'oln4yqj.css' },
  br: { ietf: 'pt-BR', tk: 'inq1xob.css' },
  ca: { ietf: 'en-CA', tk: 'pps7abe.css', base: '' },
  ca_fr: { ietf: 'fr-CA', tk: 'vrk5vyv.css', base: 'fr' },
  cl: { ietf: 'es-CL', tk: 'oln4yqj.css' },
  co: { ietf: 'es-CO', tk: 'oln4yqj.css' },
  la: { ietf: 'es-LA', tk: 'oln4yqj.css' },
  mx: { ietf: 'es-MX', tk: 'oln4yqj.css' },
  pe: { ietf: 'es-PE', tk: 'oln4yqj.css' },
  '': { ietf: 'en-US', tk: 'hah7vzn.css' },
  // EMEA
  africa: { ietf: 'en', tk: 'pps7abe.css', base: '' },
  be_fr: { ietf: 'fr-BE', tk: 'vrk5vyv.css', base: 'fr' },
  be_en: { ietf: 'en-BE', tk: 'pps7abe.css', base: '' },
  be_nl: { ietf: 'nl-BE', tk: 'cya6bri.css' },
  cy_en: { ietf: 'en-CY', tk: 'pps7abe.css' },
  dk: { ietf: 'da-DK', tk: 'aaz7dvd.css' },
  de: { ietf: 'de-DE', tk: 'vin7zsi.css' },
  ee: { ietf: 'et-EE', tk: 'aaz7dvd.css' },
  es: { ietf: 'es-ES', tk: 'oln4yqj.css' },
  fr: { ietf: 'fr-FR', tk: 'vrk5vyv.css' },
  gr_en: { ietf: 'en-GR', tk: 'pps7abe.css', base: '' },
  ie: { ietf: 'en-GB', tk: 'pps7abe.css', base: '' },
  il_en: { ietf: 'en-IL', tk: 'pps7abe.css', base: '' },
  it: { ietf: 'it-IT', tk: 'bbf5pok.css' },
  lv: { ietf: 'lv-LV', tk: 'aaz7dvd.css' },
  lt: { ietf: 'lt-LT', tk: 'aaz7dvd.css' },
  lu_de: { ietf: 'de-LU', tk: 'vin7zsi.css' },
  lu_en: { ietf: 'en-LU', tk: 'pps7abe.css', base: '' },
  lu_fr: { ietf: 'fr-LU', tk: 'vrk5vyv.css', base: 'fr' },
  hu: { ietf: 'hu-HU', tk: 'aaz7dvd.css' },
  mt: { ietf: 'en-MT', tk: 'pps7abe.css' },
  mena_en: { ietf: 'en', tk: 'pps7abe.css', base: '' },
  nl: { ietf: 'nl-NL', tk: 'cya6bri.css' },
  no: { ietf: 'no-NO', tk: 'aaz7dvd.css' },
  pl: { ietf: 'pl-PL', tk: 'aaz7dvd.css' },
  pt: { ietf: 'pt-PT', tk: 'inq1xob.css' },
  ro: { ietf: 'ro-RO', tk: 'aaz7dvd.css' },
  sa_en: { ietf: 'en', tk: 'pps7abe.css', base: '' },
  ch_de: { ietf: 'de-CH', tk: 'vin7zsi.css' },
  si: { ietf: 'sl-SI', tk: 'aaz7dvd.css' },
  sk: { ietf: 'sk-SK', tk: 'aaz7dvd.css' },
  ch_fr: { ietf: 'fr-CH', tk: 'vrk5vyv.css', base: 'fr' },
  fi: { ietf: 'fi-FI', tk: 'aaz7dvd.css' },
  se: { ietf: 'sv-SE', tk: 'fpk1pcd.css' },
  ch_it: { ietf: 'it-CH', tk: 'bbf5pok.css' },
  tr: { ietf: 'tr-TR', tk: 'aaz7dvd.css' },
  ae_en: { ietf: 'en', tk: 'pps7abe.css', base: '' },
  uk: { ietf: 'en-GB', tk: 'pps7abe.css' },
  at: { ietf: 'de-AT', tk: 'vin7zsi.css' },
  cz: { ietf: 'cs-CZ', tk: 'aaz7dvd.css' },
  bg: { ietf: 'bg-BG', tk: 'aaz7dvd.css' },
  ru: { ietf: 'ru-RU', tk: 'aaz7dvd.css' },
  ua: { ietf: 'uk-UA', tk: 'aaz7dvd.css' },
  il_he: { ietf: 'he', tk: 'nle2tdz.css', dir: 'rtl' },
  ae_ar: { ietf: 'ar', tk: 'dis2dpj.css', dir: 'rtl' },
  mena_ar: { ietf: 'ar', tk: 'dis2dpj.css', dir: 'rtl' },
  sa_ar: { ietf: 'ar', tk: 'dis2dpj.css', dir: 'rtl' },
  // Asia Pacific
  au: { ietf: 'en-AU', tk: 'pps7abe.css' },
  hk_en: { ietf: 'en-HK', tk: 'pps7abe.css', base: '' },
  in: { ietf: 'en-GB', tk: 'pps7abe.css' },
  id_id: { ietf: 'id', tk: 'czc0mun.css' },
  id_en: { ietf: 'en', tk: 'pps7abe.css', base: '' },
  my_ms: { ietf: 'ms', tk: 'sxj4tvo.css' },
  my_en: { ietf: 'en-GB', tk: 'pps7abe.css', base: '' },
  nz: { ietf: 'en-GB', tk: 'pps7abe.css', base: '' },
  ph_en: { ietf: 'en', tk: 'pps7abe.css', base: '' },
  ph_fil: { ietf: 'fil-PH', tk: 'ict8rmp.css' },
  sg: { ietf: 'en-SG', tk: 'pps7abe.css', base: '' },
  th_en: { ietf: 'en', tk: 'pps7abe.css', base: '' },
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
  za: { ietf: 'en-GB', tk: 'pps7abe.css', base: '' }, // South Africa (GB English)
  ng: { ietf: 'en-GB', tk: 'pps7abe.css', base: '' }, // Nigeria (GB English)
  cr: { ietf: 'es-419', tk: 'oln4yqj.css' }, // Costa Rica (Spanish Latin America)
  ec: { ietf: 'es-419', tk: 'oln4yqj.css' }, // Ecuador (Spanish Latin America)
  pr: { ietf: 'es-419', tk: 'oln4yqj.css' }, // Puerto Rico (Spanish Latin America)
  gt: { ietf: 'es-419', tk: 'oln4yqj.css' }, // Guatemala (Spanish Latin America)
  eg_ar: { ietf: 'ar', tk: 'dis2dpj.css', dir: 'rtl' }, // Egypt (Arabic)
  kw_ar: { ietf: 'ar', tk: 'dis2dpj.css', dir: 'rtl' }, // Kuwait (Arabic)
  qa_ar: { ietf: 'ar', tk: 'dis2dpj.css', dir: 'rtl' }, // Qatar (Arabic)
  eg_en: { ietf: 'en-GB', tk: 'pps7abe.css', base: '' }, // Egypt (GB English)
  kw_en: { ietf: 'en-GB', tk: 'pps7abe.css', base: '' }, // Kuwait (GB English)
  qa_en: { ietf: 'en-GB', tk: 'pps7abe.css', base: '' }, // Qatar (GB English)
  gr_el: { ietf: 'el', tk: 'fnx0rsr.css' }, // Greece (Greek)
  vn_en: { ietf: 'en-GB', tk: 'hah7vzn.css', base: '' },
  vn_vi: { ietf: 'vi', tk: 'qxw8hzm.css' },
  cis_ru: { ietf: 'ru', tk: 'qxw8hzm.css' },
  cis_en: { ietf: 'en', tk: 'pps7abe.css', base: '' },
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
    'www.adobe.com': 'www.adobe.com',
    'business.adobe.com': 'business.adobe.com',
    'helpx.adobe.com': 'helpx.adobe.com',
    'blog.adobe.com': 'blog.adobe.com',
    'developer.adobe.com': 'developer.adobe.com',
    'news.adobe.com': 'news.adobe.com',
    'firefly.adobe.com': 'firefly.adobe.com',
    'creativecloud.adobe.com': 'creativecloud.adobe.com',
    'projectneo.adobe.com': 'projectneo.adobe.com',
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
      if (!['.aem.', '.hlx.', '.stage.', 'localhost', '.da.'].some((i) => hostname.includes(i))) {
        libs = prodLibs;
        return libs;
      }
      const branch = new URLSearchParams(window.location.search).get('milolibs') || 'main';
      if (!/^[a-zA-Z0-9_-]+$/.test(branch)) throw new Error('Invalid branch name.');
      if (branch === 'local') { libs = 'http://localhost:6456/libs'; return libs; }
      if (branch === 'main' && hostname.includes('.stage.')) { libs = prodLibs; return libs; }
      const env = hostname.includes('.hlx.') ? 'hlx' : 'aem';
      if (branch.indexOf('--') > -1) { libs = `https://${branch}.${env}.live/libs`; return libs; }
      libs = `https://${branch}--milo--adobecom.${env}.live/libs`;
      return libs;
    }, () => libs,
  ];
})();

const miloLibs = setLibs('/libs');

// eslint-disable-next-line object-curly-newline
const { createTag, localizeLinkAsync, getConfig, getMetadata, loadStyle, loadLink, loadScript, createIntersectionObserver, lingoActive, getCountry } = await import(`${miloLibs}/utils/utils.js`);

async function getGeoLocaleInfo() {
  const { locale } = getConfig();
  if (!lingoActive() || !Object.keys(locale.regions ?? {}).length) {
    return locale;
  }
  const country = (await getCountry())?.toLowerCase();
  const geoLocale = Object.entries(locale.regions).find(([, v]) => v.region === country)?.[1];
  return geoLocale ?? locale;
}

// eslint-disable-next-line max-len
export { createTag, loadStyle, loadLink, loadScript, localizeLinkAsync, createIntersectionObserver, getConfig, getGeoLocaleInfo };

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

export function isSignedInInitialized(interval = 200) {
  return new Promise((resolve) => {
    function poll() {
      if (window.adobeIMS?.isSignedInUser) resolve();
      else setTimeout(poll, interval);
    }
    poll();
  });
}

export function getScreenSizeCategory(overridenBreakpoints) {
  const DEFAULT_BREAKPOINTS = { mobile: 599, tablet: 899 };
  const { mobile, tablet } = { ...DEFAULT_BREAKPOINTS, ...overridenBreakpoints };
  const MEDIA_QUERIES = {
    mobile: window.matchMedia(`(max-width: ${mobile}px)`),
    tablet: window.matchMedia(`(min-width: ${mobile + 1}px) and (max-width: ${tablet}px)`),
    desktop: window.matchMedia(`(min-width: ${tablet + 1}px)`),
  };
  if (MEDIA_QUERIES.mobile.matches) {
    return 'mobile';
  }
  if (MEDIA_QUERIES.tablet.matches) {
    return 'tablet';
  }
  return 'desktop';
}

export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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

const MAS_FRAGMENT_API = 'https://www.adobe.com/mas/io/fragment';
const DEFAULT_MAS_FRAGMENT_API_KEY = 'wcms-commerce-ims-ro-user-milo';

const MAS_GEO_MAP = {
  ar: 'AR_es',
  be_en: 'BE_en',
  be_fr: 'BE_fr',
  be_nl: 'BE_nl',
  br: 'BR_pt',
  ca: 'CA_en',
  ch_de: 'CH_de',
  ch_fr: 'CH_fr',
  ch_it: 'CH_it',
  cl: 'CL_es',
  co: 'CO_es',
  la: 'DO_es',
  mx: 'MX_es',
  pe: 'PE_es',
  africa: 'MU_en',
  dk: 'DK_da',
  de: 'DE_de',
  ee: 'EE_et',
  eg_ar: 'EG_ar',
  eg_en: 'EG_en',
  es: 'ES_es',
  fr: 'FR_fr',
  gr_el: 'GR_el',
  gr_en: 'GR_en',
  ie: 'IE_en',
  il_he: 'IL_he',
  it: 'IT_it',
  lv: 'LV_lv',
  lt: 'LT_lt',
  lu_de: 'LU_de',
  lu_en: 'LU_en',
  lu_fr: 'LU_fr',
  my_en: 'MY_en',
  my_ms: 'MY_ms',
  hu: 'HU_hu',
  mt: 'MT_en',
  mena_en: 'DZ_en',
  mena_ar: 'DZ_ar',
  nl: 'NL_nl',
  no: 'NO_nb',
  pl: 'PL_pl',
  pt: 'PT_pt',
  ro: 'RO_ro',
  si: 'SI_sl',
  sk: 'SK_sk',
  fi: 'FI_fi',
  se: 'SE_sv',
  tr: 'TR_tr',
  uk: 'GB_en',
  at: 'AT_de',
  cz: 'CZ_cs',
  bg: 'BG_bg',
  ru: 'RU_ru',
  ua: 'UA_uk',
  au: 'AU_en',
  in_en: 'IN_en',
  in_hi: 'IN_hi',
  id_en: 'ID_en',
  id_id: 'ID_id',
  nz: 'NZ_en',
  sa_ar: 'SA_ar',
  sa_en: 'SA_en',
  sg: 'SG_en',
  cn: 'CN_zh',
  tw: 'TW_zh',
  hk_zh: 'HK_zh',
  jp: 'JP_ja',
  kr: 'KR_ko',
  za: 'ZA_en',
  ng: 'NG_en',
  cr: 'CR_es',
  ec: 'EC_es',
  pr: 'US_es', // not a typo, should be US
  gt: 'GT_es',
  cis_en: 'TM_en',
  cis_ru: 'TM_ru',
  sea: 'SG_en',
  th_en: 'TH_en',
  th_th: 'TH_th',
};

const MAS_EXTRA_LOCALES = { pr: 'es_PR' };

const MARKET_LOCALE_OVERRIDES = { en: { AU: 'en_GB', IN: 'en_GB', GB: 'en_GB' } };

const MAS_LINK_SELECTOR = 'a[href*="mas.adobe.com/studio.html"]';
const preloadedMasFragments = new Set();

function getMasLocale(miloLocale, geoCountry) {
  const geo = (miloLocale?.prefix || 'US_en').replace('/', '');
  let [country = 'US', language = 'en'] = (MAS_GEO_MAP[geo] ?? geo).split('_', 2);
  country = country.toUpperCase();
  language = language.toLowerCase();
  const marketOverride = MARKET_LOCALE_OVERRIDES[language]?.[geoCountry];
  return { locale: marketOverride ?? MAS_EXTRA_LOCALES[geo] ?? `${language}_${country}`, country: geoCountry ?? country };
}

async function preloadMasFragment(a) {
  let url;
  try {
    url = new URL(a.href);
  } catch {
    return;
  }
  if (url.hostname !== 'mas.adobe.com' || !url.pathname.endsWith('/studio.html')) return;
  const params = new URLSearchParams(url.hash.replace(/^#/, ''));
  const fragment = params.get('fragment') || params.get('query');
  if (!fragment || preloadedMasFragments.has(fragment)) return;
  preloadedMasFragments.add(fragment);

  const { locale, country } = getMasLocale(getConfig().locale, (await getCountry())?.toUpperCase());
  const apiKey = getConfig().commerce?.['wcs-api-key'] ?? DEFAULT_MAS_FRAGMENT_API_KEY;
  let endpoint = `${MAS_FRAGMENT_API}?id=${fragment}&api_key=${apiKey}&locale=${locale}`;
  if (country && !locale.endsWith(`_${country}`)) endpoint += `&country=${country}`;

  // Explicitly low priority: default fetch-preload priority is High, same tier as the LCP
  // image's fetchpriority="high" below, and would compete with it for bandwidth. We still
  // fire synchronously (same tick, still ahead of the block's own much-later fetch) - this
  // only tells the browser to let the image win if the connection is contended.
  loadLink(endpoint, { rel: 'preload', as: 'fetch', crossorigin: 'anonymous', type: 'application/json', fetchpriority: 'low' });
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
    const firstSection = area.querySelector('body > main > div');
    let fgDivs = null;
    switch (true) {
      case firstBlock?.classList.contains('changebg'): {
        firstBlock.querySelector(':scope > div:nth-child(1)').querySelectorAll('img').forEach(eagerLoad);
        import(`${getConfig().codeRoot}/deps/interactive-marquee-changebg/changeBgMarquee.js`);
        break;
      }
      case firstBlock?.classList.contains('marquee') || firstBlock?.classList.contains('hero-marquee') || firstBlock?.classList.contains('upload-marquee'): {
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
          const uploadBlock = firstSection?.querySelector(':scope > div.upload > div');
          if (uploadBlock) {
            const gridIndex = {
              MOBILE: 1,
              TABLET: 2,
              DESKTOP: 3,
            }[viewport];
            const grid = uploadBlock.querySelector(`:scope > div:nth-child(${gridIndex})`);
            const img = grid?.querySelector('picture > img');
            if (img) eagerLoad(img);
          }
        } else if (firstBlock?.classList.contains('upload-marquee')) {
          const rows = [...firstBlock.querySelectorAll(':scope > div')];
          const contentRow = rows[2];
          const gridIndex = {
            MOBILE: 0,
            TABLET: 1,
            DESKTOP: 2,
          }[viewport];
          const column = contentRow?.querySelectorAll(':scope > div')[gridIndex];
          const img = column?.querySelector('picture > img');
          if (img) eagerLoad(img);
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

  function scanForMasLinks(area, { fragmentLink } = {}) {
    if (fragmentLink) {
      if (fragmentLink.closest('.section')?.dataset.idx === '0') {
        area?.querySelectorAll(MAS_LINK_SELECTOR).forEach(preloadMasFragment);
      }
      return;
    }
    (area ?? document).querySelector('body > main > div')
      ?.querySelectorAll(MAS_LINK_SELECTOR)
      .forEach(preloadMasFragment);
  }

  return (area, options) => {
    if (isRootPage()) replaceDotMedia();
    if (!lcpImgSet || window.document.querySelector('body > main > div > div > a.fragment')) loadLCPImage(area, options);
    scanForMasLinks(area, options);
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
      window.lana?.log('Homepage IMS check failed', { ...LANA_OPTIONS, ...e });
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
  commerce: { 'wcs-api-key': 'wcms-commerce-ims-ro-user-milo-cc' },
  imsClientId: 'adobedotcom-cc',
  iconsExcludeBlocks: ['unity', 'cc-forms', 'interactive-metadata', 'firefly-howto'],
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
    nonprofit: {
      apiUrl: 'https://sandbox-api.goodstack.io/v1',
      publishableKey: 'sandbox_pk_8b320cc4-5950-4263-a3ac-828c64f6e19b',
    },
  },
  live: {
    pdfViewerClientId: 'feb0b9f286f14b2480aed397e1d1f055',
    pdfViewerReportSuite: 'adbadobenonacdcqa',
  },
  prod: {
    pdfViewerClientId: '409019ebd2d546c0be1a0b5a61fe65df',
    pdfViewerReportSuite: 'adbadobenonacdcprod',
    psUrl: 'https://photoshop.adobe.com',
    odinEndpoint: 'https://odin.adobe.com/',
    nonprofit: {
      apiUrl: 'https://api.goodstack.io/v1',
      publishableKey: 'pk_ea675372-2eb2-4cf1-8b6a-358087bf8df5',
    },
  },
  page: { pdfViewerClientId: 'c5d622cbd8d64c618c1802587e022e05' },
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
    /www\.adobe\.com\/(\w\w(_\w\w)?\/)?benefits(\/.*)?/,
    /www\.adobe\.com\/(\w\w(_\w\w)?\/)?download(\/.*)?/,
    /creativecloud\.adobe\.com\/(\w\w(_\w\w)?\/)?apps\/download\/substance3d(?:-[^/?#]+)?(\/.*)?(#_dnt)?$/,
  ],
  autoBlocks: [{ audio: '.mp3' }, { audio: '.m4a' }, { audio: '.aac' }],
  brandConciergeAA: 'cc:app-reco',
  uniqueSiteId: 'da-cc',
  dynamicNavKey: 'bacom',
  mepLingoCountryToRegion: {
    africa: ['ke', 'mu', 'ng', 'za'],
    la: ['ag', 'ar', 'bo', 'cl', 'co', 'cr', 'cu', 'do', 'ec', 'gt', 'hn', 'mx', 'ni', 'pa', 'pe', 'pr', 'py', 'sv', 'uy', 've'],
    mena_en: ['ae', 'af', 'bh', 'dz', 'eg', 'iq', 'ir', 'jo', 'kw', 'lb', 'ly', 'ma', 'om', 'ps', 'qa', 'sa', 'sy', 'tn', 'ye'],
    cis_en: ['am', 'az', 'ge', 'kz', 'kg', 'md', 'tj', 'tm', 'uz'],
  },
};

export const scriptInit = async () => {
  maybeRefreshCatalogFromAdobeId();
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
    const paths = [];
    const stylesPrefix = getMetadata('foundation') === 'c2' ? '/c2' : '';
    paths.push(`${miloLibs}${stylesPrefix}/styles/styles.css`);
    if (getMetadata('theme') === 'doodlebug') paths.push('/creativecloud/styles/doodlebug.css');
    const skin = getMetadata('skin');
    if (skin) paths.push(`${miloLibs}/styles/skins/${skin}.css`);
    paths.forEach((path) => {
      const link = document.createElement('link');
      link.setAttribute('rel', 'stylesheet');
      link.setAttribute('href', path);
      document.head.appendChild(link);
    });
  }());

  async function loadPage() {
    loadLana({ clientId: 'cc' });
    await loadArea();
  }
  loadPage();

  // DA Live Preview
  (async function loadDa() {
    if (!new URL(window.location.href).searchParams.get('dapreview')) return;
    // eslint-disable-next-line import/no-unresolved
    import('https://da.live/scripts/dapreview.js').then(({ default: daPreview }) => daPreview(loadPage));
  }());
};
