import { getLibs } from '../../scripts/utils.js';

const miloLibs = getLibs('/libs');
const { createTag, loadStyle } = await import(`${miloLibs}/utils/utils.js`);

export default async function init(el) {
  const { decorateBlockBg } = await import(`${miloLibs}/utils/decorate.js`);

  const children = el.querySelectorAll(':scope > div');
  const foreground = children[children.length - 2];

  // Setup background if exists
  if (children.length > 1) {
    children[0].classList.add('background');
    decorateBlockBg(el, children[0], { useHandleFocalpoint: true });
  }
  foreground.classList.add('foreground', 'container');
  const headline = foreground.querySelector('h1, h2, h3, h4, h5, h6');
  const text = headline.closest('div');
  headline.classList.add('heading');
  headline.nextElementSibling?.classList.add('body');
  text.classList.add('text');
  text.classList.add('copy');

  const logoRowContent = children[children.length - 1];

  if (!logoRowContent) return;

  logoRowContent.classList.add('logo-row');

  loadStyle('/creativecloud/blocks/logo-row/logo-row.css');
  const { default: initLogoRowFunc } = await import('../logo-row/logo-row.js');
  initLogoRowFunc(logoRowContent);
}
