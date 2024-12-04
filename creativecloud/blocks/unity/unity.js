import { loadLink, loadScript } from '../../scripts/utils.js';

function getUnityLibs(prodLibs = '/unitylibs') {
  const { hostname } = window.location;
  if (!hostname.includes('hlx.page')
    && !hostname.includes('hlx.live')
    && !hostname.includes('localhost')) {
    return prodLibs;
  }
  const branch = new URLSearchParams(window.location.search).get('unitylibs') || 'main';
  if (branch.indexOf('--') > -1) return `https://${branch}.hlx.live/unitylibs`;
  return `https://${branch}--unity--adobecom.hlx.live/unitylibs`;
}

export default async function init(el) {
  const unitylibs = getUnityLibs();
  const promiseArr = [loadLink(`${unitylibs}/core/styles/styles.css`, { rel: 'stylesheet', callback: res }), loadScript(`${unitylibs}/core/workflow/workflow.js`, 'module', { mode: 'async' }];
  const { default: wfinit } = await Promise.all(promiseArr);
  await wfinit(el, 'cc', unitylibs);
}
