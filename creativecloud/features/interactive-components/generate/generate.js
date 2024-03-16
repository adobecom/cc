import { getLibs } from '../../../scripts/utils.js';

export default async function stepInit(data) {
  const miloLibs = getLibs('/libs');
  const { createTag } = await import(`${miloLibs}/utils/utils.js`);
  const pTags = data.config.querySelectorAll('p');
  const layer = createTag('div', { class: `layer layer-${data.stepIndex}` });
  const generateCTA = createTag('a', { class: 'gray-button body-s next-step generate-button' });
  [...pTags].forEach((p) => {
    const img = p.querySelector('img');
    if (img) {
      const picClone = img.closest('picture').cloneNode(true);
      if (img.src.includes('.svg')) generateCTA.prepend(picClone);
      else data.stepInfo.handleImageTransition();
    } else {
      generateCTA.innerHTML += p.textContent.trim();
    }
  });
  generateCTA.addEventListener('click', (e) => {
    data.el.dispatchEvent(new CustomEvent('cc:interactive-switch'));
  });
  layer.append(generateCTA);
  data.target.append(layer);
}
