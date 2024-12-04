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
  await Promise.all([
    loadScript(`${unitylibs}/core/workflow/workflow.js`, 'module'),
    loadScript(`${unitylibs}/scripts/utils.js`, 'module'),
    loadScript(`${unitylibs}/core/workflow/workflow-photoshop/widget.js`, 'module'),
    loadScript(`${unitylibs}/core/workflow/workflow-photoshop/action-binder.js`, 'module'),
    new Promise((res) => { loadLink(`${unitylibs}/core/styles/styles.css`, { rel: 'stylesheet', callback: res }); }),
    new Promise((res) => { loadLink(`${unitylibs}/core/workflow/workflow-photoshop/widget.css`, { rel: 'stylesheet', callback: res }); }),
  ]);
  const { default: wfinit } = await import(`${unitylibs}/core/workflow/workflow.js`);
  await wfinit(el, 'cc', unitylibs);
}
