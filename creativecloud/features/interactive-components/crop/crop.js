import { getLibs } from '../../../scripts/utils.js';

export default async function stepInit(data) {
  const miloLibs = getLibs('/libs');
  const { createTag } = await import(`${miloLibs}/utils/utils.js`);
  const pTags = data.stepConfigs[data.stepIndex].querySelectorAll('p');
  const layer = createTag('div', { class: `layer layer-${data.stepIndex}` });
  const cropCTA = createTag('a', { class: 'gray-button body-m crop-button' });
  [...pTags].forEach((p) => {
    const pic = p.querySelector('picture');
    if (!pic) {
      cropCTA.innerHTML += p.textContent.trim();
      return;
    }
    const picClone = pic.cloneNode(true);
    const isSVG = pic.querySelector('img[src*=".svg"');
    if (isSVG) cropCTA.prepend(picClone);
    else data.target.querySelector('picture').replaceWith(picClone);
  });
  cropCTA.addEventListener('click', (e) => {
    data.el.dispatchEvent(new CustomEvent(data.nextStepEvent));
  });
  layer.append(cropCTA);
  data.target.append(layer);
}
