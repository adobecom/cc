function getUnityLibs(prodLibs = '/unitylibs') {
  let libs = '';
  const { hostname, origin } = window.location;
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
  const { default: wfinit } = await import(`${unitylibs}/core/workflow/workflow.js`);
  wfinit(el, 'cc', unitylibs);
}
