import { loadLink, loadScript } from '../../scripts/utils.js';

function getUnityLibs(prodLibs = '/unitylibs') {
  const { hostname } = window.location;
  if (!hostname.includes('hlx.page')
    && !hostname.includes('hlx.live')
    && !hostname.includes('aem.page')
    && !hostname.includes('aem.live')
    && !hostname.includes('localhost')) {
    return prodLibs;
  }
  const branch = new URLSearchParams(window.location.search).get('unitylibs') || 'main';
  const env = hostname.includes('.hlx.') ? 'hlx' : 'aem';
  if (branch.indexOf('--') > -1) return `https://${branch}.${env}.live/unitylibs`;
  return `https://${branch}--unity--adobecom.${env}.live/unitylibs`;
}

async function priorityLoad(parr) {
  const promiseArr = [];
  const allowedBaseUrl = getUnityLibs();
  parr.forEach((p) => {
    if (p.endsWith('.js')) {
      const pr = loadScript(p, 'module', { mode: 'async' });
      promiseArr.push(pr);
    } else if (p.endsWith('.css')) {
      const pr = new Promise((res) => { loadLink(p, { rel: 'stylesheet', callback: res }); });
      promiseArr.push(pr);
    } else if (p.endsWith('.json')) {
      const pr = new Promise((res) => { loadLink(p, { as: 'fetch', crossorigin: 'anonymous', rel: 'preload', callback: res }); });
      promiseArr.push(pr);
    } else if (p.startsWith(allowedBaseUrl)) {
      promiseArr.push(fetch(p));
    }
  });
  try {
    await Promise.all(promiseArr);
  } catch (e) { /* do not error out if call fails */ }
}

export default async function init(el) {
  const unitylibs = getUnityLibs();
  const promiseArr = [
    `${unitylibs}/core/styles/styles.css`,
    `${unitylibs}/scripts/utils.js`,
    `${unitylibs}/core/workflow/workflow.js`,
  ];
  await priorityLoad(promiseArr);
  const { default: wfinit } = await import(`${unitylibs}/core/workflow/workflow.js`);
  await wfinit(el, 'cc', unitylibs, 'v2');
}
