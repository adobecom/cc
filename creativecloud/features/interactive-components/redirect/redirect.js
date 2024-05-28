import { createTag } from '../../../scripts/utils.js';

export default async function stepInit(data) {
  data.target.classList.add('step-redirect');
  const config = data.stepConfigs[data.stepIndex];
  const layer = createTag('div', { class: `layer layer-${data.stepIndex}` });
  const RedirectCTA = createTag('a', { class: 'redirect-button body-xl', href: '#' });
  console.log(config.innerHTML);
  const svg = config.querySelector('img[src*=".svg"]');
  if (svg) {
    const svgClone = svg.cloneNode(true);
    const svgCTACont = createTag('div', { class: 'svg-icon-container' });
    svgCTACont.append(svgClone);
    RedirectCTA.prepend(svgCTACont);
  }
  const lastp = config.querySelector(':scope > div > p:last-child');
  const btnText = lastp.textContent.trim();
  const btnLink = lastp.querySelector('a');
  if (btnText) RedirectCTA.appendChild(document.createTextNode(btnText.trim()));
  if (btnLink) RedirectCTA.href = btnLink.href;
  layer.append(RedirectCTA);
  return layer;
}
