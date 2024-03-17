import { getLibs } from '../../../scripts/utils.js';

export default async function stepInit(data) {
  const miloLibs = getLibs('/libs');
  const { createTag } = await import(`${miloLibs}/utils/utils.js`);
  const pTags = data.stepConfigs[data.stepIndex].querySelectorAll('p');
  const layer = createTag('div', { class: `layer layer-${data.stepIndex}` });
  const cropCTA = createTag('a', { class: 'gray-button body-s crop-button' });
  [...pTags].forEach((p) => {
    const img = p.querySelector('img');
    if (img) {
      const picClone = img.closest('picture').cloneNode(true);
      if (img.src.includes('.svg')) cropCTA.prepend(picClone);
      else data.target.querySelector('picture').replaceWith(picClone);
    } else {
      cropCTA.innerHTML += p.textContent.trim();
    }
  });
  cropCTA.addEventListener('click', (e) => {
    data.el.dispatchEvent(new CustomEvent('cc:interactive-switch'));
  });
  layer.append(cropCTA);
  data.target.append(layer);
}
