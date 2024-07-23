function getUnityLibs(prodLibs, project = 'unity') {
  let libs = '';
  const { hostname, origin } = window.location;
  if (project === 'unity') { libs = `${origin}/unitylibs`; return libs; }
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
  const projectName = 'cc';
  const unitylibs = getUnityLibs('/unitylibs', projectName);
  const { default: wfinit } = await import(`${unitylibs}/core/workflow/workflow.js`);
  wfinit(el, projectName, unitylibs);
}
