import { getLibs } from '../../scripts/utils.js';

export default async function init(el) {
  if (el.classList.contains('changebg')) {
    import(`/creativecloud/deps/interactive-marquee-changebg/changeBgMarquee.js`);
    const { default: changeBg } = await import('../../features/changeBg/changeBg.js');
    changeBg(el);
    return;
  }
}
