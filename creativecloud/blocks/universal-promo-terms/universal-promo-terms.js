import { getLibs, getConfig } from '../../scripts/utils.js';

const OFFER_ID_API_BASE = 'https://aos.adobe.io/offers/';
const SELECTOR_ID_API_BASE = 'https://aos.adobe.io/offers:search.selector';
const STAGE_OFFER_ID_API_BASE = 'https://aos-stage.adobe.io/offers/';
const STAGE_SELECTOR_ID_API_BASE = 'https://aos-stage.adobe.io/offers:search.selector';
const API_KEY = 'universalPromoTerm';
const SERVICE_PROVIDERS = 'PROMO_TERMS';
const PLACEHOLDERS = {
  campaignStart: ['{{campaignStart}}', '{{startDate}}', '{{ campaignStart }}', '{{ startDate }}'],
  campaignEnd: ['{{campaignEnd}}', '{{endDate}}', '{{ campaignEnd }}', '{{ endDate }}'],
};

const FALLBACK_URLS = {
  CCSN: { INDIVIDUAL: { EDU: 'https://www.adobe.com/{{prefix}}offer-terms/ccm-ste-introductory.html' } },
  STKS: { INDIVIDUAL: { COM: 'https://www.adobe.com/products/special-offers/stock-cci-terms.html' } },
};

/**
 * Resolves the locale info from a locale parameter using config.locales.
 * Input format is always lang_COUNTRY (e.g., de_DE, fr_FR, en_US).
 * @param {URLSearchParams} params - URL search parameters containing the locale
 * @returns {{ ietf: string, prefix: string }} The resolved IETF locale and URL prefix
 */
export function getLocaleInfo(params) {
  const localeParam = params.get('locale');
  const { locales, locale } = getConfig();

  if (!localeParam) {
    return { ietf: locale?.ietf || 'en-US', prefix: locale?.prefix || '' };
  }

  // Convert lang_COUNTRY to IETF format (lang-COUNTRY)
  const ietfInput = localeParam.replace('_', '-');

  if (!locales) {
    return { ietf: ietfInput, prefix: '' };
  }

  // Search through locales to find matching IETF value
  let match = Object.entries(locales).find(
    ([, value]) => value.ietf?.toLowerCase() === ietfInput.toLowerCase(),
  );

  if (!match) {
    match = Object.entries(locales).find(
      ([, value]) => value.ietf?.toLowerCase() === ietfInput.split('-')[0].toLowerCase(),
    );
  }

  if (match) {
    const [key, value] = match;
    const prefix = key ? `${key}/` : '';
    return { ietf: value.ietf, prefix };
  }

  // Fallback: return the converted IETF format
  return { ietf: ietfInput, prefix: '' };
}

function getEnv(env) {
  if (env) return env;
  if (window.location.hostname === 'www.adobe.com') return 'production';
  return 'stage';
}

const replacePlaceholderText = (text, params) => {
  let finalText = text;
  Object.keys(PLACEHOLDERS).forEach((key) => {
    if (params.get(key)) {
      PLACEHOLDERS[key].forEach((updateTarget) => {
        let replacement = params.get(key);
        if (key.toLowerCase().includes('start') || key.toLowerCase().includes('end')) {
          replacement = new Date(replacement).toLocaleDateString();
        }
        finalText = finalText.replaceAll(updateTarget, replacement);
      });
    }
  });
  return finalText;
};

/**
 * Returns promo term HTML from API.
 * @param {*} params
 * @param {*} el
 * @param {*} env
 * @param {*} search
 * @returns
 */
async function getTermsHTML(params, el, env, search) {
  const locationSearch = search ?? window.location.search;
  let promoTerms;
  let offer;
  if (!params.get('offer_selector_ids')) {
    let fetchURL = `${env === 'stage' ? STAGE_OFFER_ID_API_BASE : OFFER_ID_API_BASE}${params.get('offer_id')}${locationSearch}`;
    fetchURL += params.get('api_key') ? '' : `&api_key=${API_KEY}`;
    fetchURL += params.get('service_providers') ? '' : `&service_providers=${SERVICE_PROVIDERS}`;

    const res = await fetch(fetchURL);
    if (!res.ok) return false;
    [offer] = await res.json();
    promoTerms = offer?.promo_terms;
  } else {
    let fetchURL = `${env === 'stage' ? STAGE_SELECTOR_ID_API_BASE : SELECTOR_ID_API_BASE}${locationSearch}`;
    fetchURL += params.get('api_key') ? '' : `&api_key=${API_KEY}`;
    fetchURL += params.get('service_providers') ? '' : `&service_providers=${SERVICE_PROVIDERS}`;

    const res = await fetch(fetchURL);
    if (!res.ok) return false;
    [offer] = await res.json();
    promoTerms = offer?.promo_terms;
  }

  let alternateURL = null;
  if (!promoTerms && offer) {
    const {
      customer_segment: customerSegment,
      product_code: productCode,
      market_segments: [marketSegment],
    } = offer;
    const { prefix } = getLocaleInfo(params) || { prefix: '' };
    alternateURL = FALLBACK_URLS[productCode]?.[customerSegment]?.[marketSegment];
    if (!alternateURL?.includes('{{prefix}}')) {
      // us only page (e.g: stock)
      alternateURL = undefined;
    } else {
      alternateURL = alternateURL?.replace('{{prefix}}', prefix);
    }
  }
  if (!promoTerms || !promoTerms.header || !promoTerms.text) {
    return [false, alternateURL];
  }
  const termsHtml = replacePlaceholderText(promoTerms.text, params);
  return [`<div class="container">${el.innerHTML}<h1>${promoTerms.header}</h1><p>${termsHtml}</p></div>`, undefined];
}

export default async function init(el, search) {
  const params = new URLSearchParams(search ?? window.location.search);
  const env = getEnv(params.get('env'));
  const [termsHTML, alternateURL] = await getTermsHTML(params, el, env, search);
  if (alternateURL) {
    window.location.href = alternateURL;
  } else if (!termsHTML && env !== 'stage') {
    window.location.href = '/404.html';
  } else {
    const miloLibs = getLibs('/libs');
    const { sanitizeHtml } = await import(`${miloLibs}/utils/sanitizeHtml.js`);
    const html = sanitizeHtml(termsHTML);
    el.innerHTML = '';
    el.append(html);
  }
}
