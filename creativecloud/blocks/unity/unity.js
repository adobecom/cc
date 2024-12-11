import { loadLink, loadScript } from '../../scripts/utils.js';

async function priorityLoad(parr) {
  const promiseArr = [];
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
    } else {
      promiseArr.push(fetch(p));
    }
  });
  try {
    await Promise.all(promiseArr);
  } catch (e) { /* do not error out if call fails */ }
}

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
  const promiseArr = [
    `${unitylibs}/core/styles/styles.css`,
    `${unitylibs}/core/workflow/workflow.js`,
    `${unitylibs}/scripts/utils.js`,
    `${unitylibs}/core/workflow/workflow-photoshop/workflow-photoshop.js`,
    `${unitylibs}/core/workflow/workflow-photoshop/workflow-photoshop.css`,
    `${unitylibs}/core/steps/upload-btn.js`,
    `${unitylibs}/core/steps/app-connector.js`,
  ];
  await priorityLoad(promiseArr);
  const promiseSvgArr = [];
  const allSvgs = el.querySelectorAll('img[src*=svg]');
  [...allSvgs].slice(0, 6).forEach((s) => promiseSvgArr.push(s.src));
  await priorityLoad(promiseSvgArr);
  const { default: wfinit } = await import(`${unitylibs}/core/workflow/workflow.js`);
  await wfinit(el, 'cc', unitylibs);
}
