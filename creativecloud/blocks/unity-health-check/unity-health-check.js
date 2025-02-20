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

export default async function init(el) {
  const unitylibs = getUnityLibs();
  const { default: hcinit } = await import(`${unitylibs}/blocks/unity/HealthCheck.js`);
  await hcinit(el);
}
