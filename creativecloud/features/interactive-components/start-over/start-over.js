import { getLibs } from '../../../scripts/utils.js';

export default async function stepInit(data) {
  const miloLibs = getLibs('/libs');
  const { createTag } = await import(`${miloLibs}/utils/utils.js`);
  data.target.classList.add('step-crop');
  const pTags = data.stepConfigs[data.stepIndex].querySelectorAll('p');
  const layer = createTag('div', { class: `layer layer-${data.stepIndex}` });
  const startOverCTA = createTag('a', { class: 'gray-button body-s next-step start-over-button' });
  [...pTags].forEach((p) => {
    const img = p.querySelector('img');
    if (img) {
      const picClone = img.closest('picture').cloneNode(true);
      if (img.src.includes('.svg')) startOverCTA.prepend(picClone);
      else data.target.querySelector('picture').replaceWith(picClone);
    } else {
      startOverCTA.innerHTML += p.textContent.trim();
    }
  });
  startOverCTA.addEventListener('click', (e) => {
    data.el.dispatchEvent(new CustomEvent('cc:interactive-switch'));
  });
  layer.append(startOverCTA);
  data.target.append(layer);
}
