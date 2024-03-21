import { getLibs } from '../../../scripts/utils.js';

export default async function stepInit(data) {
  const miloLibs = getLibs('/libs');
  const { createTag } = await import(`${miloLibs}/utils/utils.js`);
  data.target.classList.add('step-start-over');
  data.handleImageTransition(data);
  const config = data.stepConfigs[data.stepIndex];
  const layer = createTag('div', { class: `layer layer-${data.stepIndex}` });
  const startOverCTA = createTag('a', { class: 'gray-button start-over-button body-xl next-step', href: "#" });
  const svg = config.querySelector('img[src*=".svg"');
  if (svg) startOverCTA.append(svg.closest('picture'));
  const textContent = config.textContent.trim();
  if (textContent) {
    const textNode = document.createTextNode(textContent);
    startOverCTA.appendChild(textNode);
  }
  startOverCTA.addEventListener('click', async (e) => {
    await data.openForExecution;
    data.el.dispatchEvent(new CustomEvent(data.nextStepEvent));
  });
  layer.append(startOverCTA);
  data.target.append(layer);
}

