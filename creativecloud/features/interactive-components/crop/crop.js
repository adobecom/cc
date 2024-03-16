import { getLibs } from '../../../scripts/utils.js';

export default async function stepInit(data) {
  const miloLibs = getLibs('/libs');
  const { createTag } = await import(`${miloLibs}/utils/utils.js`);
  data.target.classList.add('step-crop');
  const pTags = data.config.querySelectorAll('p');
  const layer = createTag('div', { class: `layer layer-${data.stepIndex}` });
  const generateCTA = createTag('a', { class: 'gray-button body-s next-step crop-button' });
  [...pTags].forEach((p) => {
    const img = p.querySelector('img');
    if (img) {
      const picClone = img.closest('picture').cloneNode(true);
      if (img.src.includes('.svg')) generateCTA.prepend(picClone);
      else data.target.querySelector('picture').replaceWith(picClone);
    } else {
      generateCTA.innerHTML += p.textContent.trim();
    }
  });
  layer.append(generateCTA);
  data.target.append(layer);
}
