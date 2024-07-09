import { createTag } from '../../../scripts/utils.js';

export default async function stepInit(data) {
  data.target.classList.add('step-crop');
  const config = data.stepConfigs[data.stepIndex];
  const layer = createTag('div', { class: `layer layer-${data.stepIndex}` });
  const cropCTA = createTag('a', { class: 'gray-button body-m crop-button', href: '#' });
  const svg = config.querySelector('img[src*=".svg"')?.closest('picture');
  const lastp = config.querySelector(':scope > div > p:last-child');
  const textContent = lastp.textContent.trim();
  if (svg) {
    svg.insertAdjacentElement('afterend', svg.cloneNode(true));
    cropCTA.appendChild(createTag('div', { class: 'crop-icon-container' }, svg));
  }
  if (textContent) cropCTA.appendChild(document.createTextNode(textContent));
  cropCTA.addEventListener('click', async (e) => {
    e.preventDefault();
    await data.openForExecution;
    if (layer.classList.contains('disable-click')) return;
    layer.classList.add('disable-click');
    data.el.dispatchEvent(new CustomEvent(data.nextStepEvent));
  });
  layer.append(cropCTA);
  return layer;
}
