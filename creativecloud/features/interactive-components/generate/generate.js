import { getLibs } from '../../../scripts/utils.js';

export default async function stepInit(data) {
  const miloLibs = getLibs('/libs');
  const { createTag } = await import(`${miloLibs}/utils/utils.js`);
  data.target.classList.add('step-generate');
  const config = data.stepConfigs[data.stepIndex];
  const layer = createTag('div', { class: `layer layer-${data.stepIndex}` });
  const [searchText, btnText, position] = config.textContent.trim().split('|');
  if (position) layer.classList.add(`generate-${position.toLowerCase().trim()}`);
  const genfillDiv = createTag('div', { class: 'generate-prompt-button body-m' });
  const searchBar = createTag('div', { class: 'generate-text' }, `${searchText}`);
  const searchBarContainer = createTag('div', { class: 'generate-text-container' }, searchBar);
  const generateBtn = createTag('a', { class: 'gray-button generate-button next-step', href: '#' });
  const svg = config.querySelector('img[src*=".svg"]')?.closest('picture');
  if (svg) generateBtn.appendChild(svg.cloneNode(true));
  if (btnText) generateBtn.appendChild(document.createTextNode(btnText));
  genfillDiv.appendChild(searchBarContainer);
  genfillDiv.appendChild(generateBtn);
  layer.appendChild(genfillDiv);
  generateBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    await data.openForExecution;
    data.el.dispatchEvent(new CustomEvent(data.nextStepEvent));
  });
  return layer;
}
