const OFFER_ID_API_BASE = 'https://aos.adobe.io/offers/';
const SELECTOR_ID_API_BASE = 'https://aos.adobe.io/offers:search.selector';
const STAGE_OFFER_ID_API_BASE = 'https://aos-stage.adobe.io/offers/';
const STAGE_SELECTOR_ID_API_BASE = 'https://aos-stage.adobe.io/offers:search.selector';
const API_KEY = 'universalPromoTerm';

function getEnv(env) {
  if (env) return env;
  if (window.location.origin.includes('localhost') || window.location.origin.includes('hlx')) return 'stage';
  return 'production';
}

async function getTermsHTML(params, el, env, search) {
  const locationSearch = search ?? window.location.search;
  let promoTerms;
  if (!params.get('offer_selector_ids')) {
    const fetchURL = `${env === 'stage' ? STAGE_OFFER_ID_API_BASE : OFFER_ID_API_BASE}${params.get('offer_id')}${locationSearch}${params.get('api_key') ? '' : `&api_key=${API_KEY}`}`;
    const res = await fetch(fetchURL);
    if (!res.ok) return false;
    const json = await res.json();
    promoTerms = json[0]?.promo_terms;
  } else {
    const fetchURL = `${env === 'stage' ? STAGE_SELECTOR_ID_API_BASE : SELECTOR_ID_API_BASE}${locationSearch}${params.get('api_key') ? '' : `&api_key=${API_KEY}`}`;
    const res = await fetch(fetchURL);
    if (!res.ok) return false;
    const json = await res.json();
    promoTerms = json[0]?.offers[0]?.promo_terms;
  }

  if (!promoTerms || !promoTerms.header || !promoTerms.text) {
    return false;
  }
  return `<div class="container">${el.innerHTML}<h1>${promoTerms.header}</h1><p>${promoTerms.text}</p></div>`;
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
