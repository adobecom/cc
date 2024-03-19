import { getLibs } from '../../../scripts/utils.js';

export default async function stepInit(data) {
  const miloLibs = getLibs('/libs');
  const { createTag } = await import(`${miloLibs}/utils/utils.js`);
  data.target.classList.add('step-crop');
  const pTags = data.stepConfigs[data.stepIndex].querySelectorAll('p');
  const layer = createTag('div', { class: `mobile-genfill layer layer-${data.stepIndex}` });
  const startOverCTA = createTag('a', { class: 'gray-button start-over body-xl next-step' });
  [...pTags].forEach((p) => {
    const pic = p.querySelector('picture');
    if (!pic) {
      startOverCTA.innerHTML += p.textContent.trim();
      return;
    }
    const picClone = pic.cloneNode(true);
    const isSVG = pic.querySelector('img[src*=".svg"');
    if (isSVG) startOverCTA.prepend(picClone);
    else data.target.querySelector('picture').replaceWith(picClone);
  });
  startOverCTA.addEventListener('click', (e) => {
    data.el.dispatchEvent(new CustomEvent(data.nextStepEvent));
  });
  layer.append(startOverCTA);
  data.target.append(layer);
}
