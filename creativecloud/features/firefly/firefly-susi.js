import { getLibs } from '../../scripts/utils.js';

const { getConfig } = await import(`${getLibs()}/utils/utils.js`);
const config = getConfig();
const fireflyprod = 'https://firefly.adobe.com';
const fireflystage = 'https://firefly-stage.corp.adobe.com';
const env = window.origin.includes(config.prodDomains[0]) ? 'prod' : 'stage';

function generateRandomSeed(min = 1, max = 100000) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function redirectWithParam() {
  const url = new URL(window.location.href);
  let prompt;
  let windowLocation = '';
  const queryParam = 'ff_channel=adobe_com&ff_campaign=ffly_homepage&ff_source=firefly_seo';
  if (window.location.search.includes('goToFireflyGenFill')) {
    windowLocation = env === 'prod' ? `${fireflyprod}/upload/inpaint?${queryParam}` : `${fireflystage}/upload/inpaint?&${queryParam}`;
  } else if (window.location.search.includes('goToFireflyEffects')) {
    prompt = url.searchParams.get('goToFireflyEffects');
    const effectsPath = `generate/font-styles?prompt=${prompt}&${queryParam}`;
    windowLocation = env === 'prod' ? `${fireflyprod}/${effectsPath}` : `${fireflystage}/${effectsPath}`;
  } else if (window.location.search.includes('goToFirefly')) {
    prompt = url.searchParams.get('goToFirefly');
    const fireflyPath = `generate/images?prompt=${prompt}&${queryParam}&seed=${generateRandomSeed()}&seed=${generateRandomSeed()}&seed=${generateRandomSeed()}&seed=${generateRandomSeed()}&modelInputVersion=v2&modelConfig=v2`;
    windowLocation = env === 'prod' ? `${fireflyprod}/${fireflyPath}` : `${fireflystage}/${fireflyPath}`;
  }
  if (windowLocation) window.location = windowLocation;
}

export const signIn = (prompt, paramKey) => {
  const url = new URL(window.location.href);
  url.searchParams.delete('goToFirefly', 'goToFireflyEffects', 'goToFireflyGenFill', 'prompt', 'seed', 'ff_channel', 'ff_campaign', 'ff_source');
  url.searchParams.set(paramKey, encodeURI(prompt));
  const stageSigninObj = { dctx_id: 'v:2,s,f,bg:firefly2023,2e2b3d80-4e50-11ee-acbc-ab67eaa89524', redirect_uri: url.href };
  const prodSigninObj = { dctx_id: 'v:2,s,f,bg:firefly2023,cea19bc0-4e72-11ee-888a-c95a795c7f23', redirect_uri: url.href };
  if (env === 'stage') window.adobeIMS?.signIn(stageSigninObj);
  else window.adobeIMS?.signIn(prodSigninObj);
};
