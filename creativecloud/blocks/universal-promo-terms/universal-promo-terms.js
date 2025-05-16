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
 * Sanitizes an HTML string by removing disallowed tags and attributes.
 *
 * @param {string} html - The HTML string to sanitize.
 * @returns {string} - The sanitized HTML string.
 *
 * @description
 * This function parses the input HTML string into a DOM structure, then iterates
 * through all elements and their attributes. It removes any elements that are not
 * in the allowedTags list and removes attributes that are not in the allowedAttrs
 * list or are deemed unsafe (e.g., JavaScript URLs or event handlers).
 *
 * Allowed tags: ['p', 'strong', 'em', 'b', 'i', 'a', 'ul', 'ol', 'li', 'br', 'span']
 * Allowed attributes:
 *   - 'a': ['href']
 *   - 'span': ['style']
 *
 * Unsafe attributes:
 *   - Attributes starting with "on" (e.g., onclick)
 *   - 'href' attributes with "javascript:" URLs
 */
const sanitizeHtml = (html) => {
  const allowedTags = ['p', 'strong', 'em', 'b', 'i', 'a', 'ul', 'ol', 'li', 'br', 'span'];
  const allowedAttrs = { a: ['href'], span: ['style'] };

  const doc = new DOMParser().parseFromString(html, 'text/html');

  [...doc.body.querySelectorAll('*')].forEach((el) => {
    if (!allowedTags.includes(el.tagName.toLowerCase())) {
      el.remove();
      return;
    }

    [...el.attributes].forEach((attr) => {
      const name = attr.name.toLowerCase();
      const value = attr.value.trim().toLowerCase();
      const tag = el.tagName.toLowerCase();

      const safeAttr = (allowedAttrs[tag] || []).includes(name);
      const unsafeValue = name === 'href' && /^javascript:/i.test(value);
      const isEvent = name.startsWith('on');

      if (!safeAttr || unsafeValue || isEvent) el.removeAttribute(attr.name);
    });
  });

  return doc.body.innerHTML;
};

/**
 * Returns promo term HTML from API
 * @param {*} params
 * @param {*} el
 * @param {*} env
 * @param {*} search
 * @returns
 */
async function getTermsHTML(params, el, env, search) {
  const locationSearch = search ?? window.location.search;
  let promoTerms;
  if (!params.get('offer_selector_ids')) {
    let fetchURL = `${env === 'stage' ? STAGE_OFFER_ID_API_BASE : OFFER_ID_API_BASE}${params.get('offer_id')}${locationSearch}`;
    fetchURL += params.get('api_key') ? '' : `&api_key=${API_KEY}`;
    fetchURL += params.get('service_providers') ? '' : `&service_providers=${SERVICE_PROVIDERS}`;

    const res = await fetch(fetchURL);
    if (!res.ok) return false;
    const json = await res.json();
    promoTerms = json[0]?.promo_terms;
  } else {
    let fetchURL = `${env === 'stage' ? STAGE_SELECTOR_ID_API_BASE : SELECTOR_ID_API_BASE}${locationSearch}`;
    fetchURL += params.get('api_key') ? '' : `&api_key=${API_KEY}`;
    fetchURL += params.get('service_providers') ? '' : `&service_providers=${SERVICE_PROVIDERS}`;

    const res = await fetch(fetchURL);
    if (!res.ok) return false;
    const json = await res.json();
    promoTerms = json[0]?.offers[0]?.promo_terms;
  }

  if (!promoTerms || !promoTerms.header || !promoTerms.text) {
    return false;
  }
  const termsHtml = replacePlaceholderText(promoTerms.text, params);
  const safeHtml = sanitizeHtml(termsHtml);
  const safeHeader = sanitizeHtml(promoTerms.header);
  return `<div class="container">${el.innerHTML}<h1>${safeHeader}</h1><div>${safeHtml}</div></div>`;
}

export default async function init(el, search) {
  const params = new URLSearchParams(search ?? window.location.search);
  const env = getEnv(params.get('env'));
  const termsHTML = await getTermsHTML(params, el, env, search);
  if (!termsHTML && env !== 'stage') {
    window.location = '404.html';
  } else {
    el.innerHTML = termsHTML;
  }
}
