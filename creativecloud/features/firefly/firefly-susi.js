import { setLibs } from '../../scripts/utils.js';

const miloLibs = setLibs('/libs');
const { getConfig } = await import(`${miloLibs}/utils/utils.js`);
const config = getConfig();
const fireflyprod = 'https://firefly.adobe.com';
const fireflystage = 'https://firefly-stage.corp.adobe.com';
let env = '';
if (window.origin.includes(config.prodDomains[1])) {
  env = 'prod';
} else {
  env = 'stage';
}

export function redirectWithParam() {
  const url = new URL(window.location.href);
  let prompt;
  if (window.location.search.includes('goToFireflyGenFill')) {
    if (env === 'prod') {
      window.location = `${fireflyprod}/upload/inpaint`;
    } else {
      window.location = `${fireflystage}/upload/inpaint`;
    }
  } else if (window.location.search.includes('goToFireflyEffects')) {
    prompt = url.searchParams.get('goToFireflyEffects');
    if (env === 'prod') {
      window.location = `${fireflyprod}/generate/font-styles?prompt=${prompt}`;
    } else {
      window.location = `${fireflystage}/generate/font-styles?prompt=${prompt}`;
    }
  } else if (window.location.search.includes('goToFirefly')) {
    prompt = url.searchParams.get('goToFirefly');
    if (env === 'prod') {
      window.location = `${fireflyprod}/generate/images?prompt=${prompt}&modelInputVersion=v2`;
    } else {
      window.location = `${fireflystage}/generate/images?prompt=${prompt}&modelInputVersion=v2`;
    }
  }
}

export const signIn = (prompt, paramKey) => {
  const url = new URL(window.location.href);
  url.searchParams.delete('goToFirefly');
  url.searchParams.delete('goToFireflyEffects');
  url.searchParams.delete('goToFireflyGenFill');
  url.searchParams.set(paramKey, encodeURI(prompt));
  if (paramKey === 'goToFirefly') {
    url.searchParams.set('modelInputVersion', 'v2');
    url.searchParams.set('modelConfig', 'v2');
  }
  if (env === 'stage') {
    window.adobeIMS?.signIn({ dctx_id: 'v:2,s,f,bg:firefly2023,2e2b3d80-4e50-11ee-acbc-ab67eaa89524', redirect_uri: url.href });
  } else {
    window.adobeIMS?.signIn({ dctx_id: 'v:2,s,f,bg:firefly2023,cea19bc0-4e72-11ee-888a-c95a795c7f23', redirect_uri: url.href });
  }
  redirectWithParam();
};
