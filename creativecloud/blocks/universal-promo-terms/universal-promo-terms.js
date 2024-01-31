const OFFER_ID_API_BASE = 'https://aos-stage.adobe.io/offers/';
const SELECTOR_ID_API_BASE = 'https://aos-stage.adobe.io/offers:search.selector';
const STAGE_OFFER_ID_API_BASE = 'https://aos-stage.adobe.io/offers/';
const STAGE_SELECTOR_ID_API_BASE = 'https://aos-stage.adobe.io/offers:search.selector';
const API_KEY = 'PlatformDocs';

function searchToObject() {
  var pairs = window.location.search.substring(1).split("&"),
    obj = {},
    pair,
    i;

  for ( i in pairs ) {
    if ( pairs[i] === "" ) continue;

    pair = pairs[i].split("=");
    obj[ decodeURIComponent( pair[0] ) ] = decodeURIComponent( pair[1] );
  }

  return obj;
}

function getEnv(env) {
  if (env) return env;
  if (window.location.origin.includes('localhost') || window.location.origin.includes('hlx')) return 'stage';
  return 'production';
}

async function getTermsHTML(search) {
  const env = getEnv(search.env);
  let promoTerms
  if (!search.offer_selector_ids) {
    const fetchURL = `${env === 'stage' ? STAGE_OFFER_ID_API_BASE : OFFER_ID_API_BASE}${search.offer_id}${window.location.search}${search.api_key ? '' : `&api_key=${API_KEY}`}`;
    const res = await fetch(fetchURL);
    if (!res.ok) return false;
    const json = await res.json();
    promoTerms = json[0]?.promo_terms;
  } else {
    const fetchURL = `${env === 'stage' ? STAGE_SELECTOR_ID_API_BASE : SELECTOR_ID_API_BASE}${window.location.search}${search.api_key ? '' : `&api_key=${API_KEY}`}`;
    const res = await fetch(fetchURL);
    if (!res.ok) return false;
    const json = await res.json();
    promoTerms = json[0]?.offers[0]?.promo_terms;
  }

  if (!promoTerms || !promoTerms.header || !promoTerms.text) {
    return false;
  }
  return `<div class="container"><h1>${promoTerms.header}</h1><p>${promoTerms.text}</p></div>`;
}

export default async function init(el) {
  const search = searchToObject();
  const env = getEnv(search.env);
  const termsHTML = await getTermsHTML(search);
  if(!termsHTML && env !== 'stage') {
    window.location = '404.html';
  } else {
    el.innerHTML = termsHTML;
  }
}
