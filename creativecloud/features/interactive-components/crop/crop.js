import { getLibs } from '../../../scripts/utils.js';

export default async function stepInit(data) {
  const miloLibs = getLibs('/libs');
  const { createTag } = await import(`${miloLibs}/utils/utils.js`);
  const config = data.stepConfigs[data.stepIndex];
  const layer = createTag('div', { class: `layer layer-${data.stepIndex}` });
  const cropCTA = createTag('a', { class: 'gray-button body-m crop-button', href: "#" });
  const pic = config.querySelector('picture');
  if (!pic.querySelector('img[src*=".svg"]')) data.handleImageTransition(data);
  const svg = config.querySelector('img[src*=".svg"');
  if (svg) cropCTA.append(svg.closest('picture'));
  cropCTA.innerHTML += config.textContent.trim();
  cropCTA.addEventListener('click', async (e) => {
    await data.openForExecution;
    data.el.dispatchEvent(new CustomEvent(data.nextStepEvent));
  });
  layer.append(cropCTA);
  data.target.append(layer);
}
