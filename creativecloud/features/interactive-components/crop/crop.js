import { getLibs } from '../../../scripts/utils.js';

export default async function stepInit(data) {
  const miloLibs = getLibs('/libs');
  const { createTag } = await import(`${miloLibs}/utils/utils.js`);
  data.target.classList.add('step-crop');
  const config = data.stepConfigs[data.stepIndex];
  const layer = createTag('div', { class: `layer layer-${data.stepIndex}` });
  const cropCTA = createTag('a', { class: 'gray-button body-m crop-button', href: "#" });
  const svg = config.querySelector('img[src*=".svg"')?.closest('picture');
  if (svg) cropCTA.appendChild(createTag('div', { class: `crop-icon-container` }, svg));
  if (config.textContent) cropCTA.appendChild(document.createTextNode(config.textContent.trim()));
  cropCTA.addEventListener('click', async (e) => {
    e.preventDefault();
    await data.openForExecution;
    data.el.dispatchEvent(new CustomEvent(data.nextStepEvent));
  });
  layer.append(cropCTA);
  return layer;
}
