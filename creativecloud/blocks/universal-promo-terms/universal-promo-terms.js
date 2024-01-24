const OFFER_ID_API_BASE = 'https://aos-stage.adobe.io/offers/02CBBA6AB01085A7F70EDA1A17521394';
const SELECTOR_ID_API_BASE = 'https://aos-stage.adobe.io/offers:search.selector';
const STAGE_OFFER_ID_API_BASE = 'https://aos-stage.adobe.io/offers/02CBBA6AB01085A7F70EDA1A17521394';
const STAGE_SELECTOR_ID_API_BASE = 'https://aos-stage.adobe.io/offers:search.selector';

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
  if (window.location.origin.includes('localshot') || window.location.origin.includes('hlx')) return 'stage';
  return 'production';
}

export default async function init(el) {
  const search = searchToObject();
  const env = getEnv(search.env);
  if (!search.offer_selector_ids) {
    const res = await fetch(`${env === 'stage' ? STAGE_OFFER_ID_API_BASE : OFFER_ID_API_BASE}${window.location.search}`);
    const json = await res.json();
    const promoTerms = json[0].promo_terms;
    el.innerHTML = `<div class="container"><h1>${promoTerms.header}</h1><p>${promoTerms.text}</p></div>`;
  } else {
    const res = await fetch(`${env === 'stage' ? STAGE_SELECTOR_ID_API_BASE : SELECTOR_ID_API_BASE}${window.location.search}`);
    const json = await res.json();
    const promoTerms = json[0].offers[0].promo_terms;
    el.innerHTML = `<div class="container"><h1>${promoTerms.header}</h1><p>${promoTerms.text}</p></div>`;
  }
}
