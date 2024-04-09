import { createTag } from '../../../scripts/utils.js';

export default async function stepInit(data) {
  data.target.classList.add('step-generate');
  const config = data.stepConfigs[data.stepIndex];
  const layer = createTag('div', { class: `layer layer-${data.stepIndex}` });
  const [searchText, btnText, position] = config.textContent.trim().split('|');
  if (position) layer.classList.add(`generate-${position.toLowerCase().trim()}`);
  const genfillDiv = createTag('div', { class: 'generate-prompt-button body-m' });
  const searchBar = createTag('div', { class: 'generate-text' }, `${searchText}`);
  const searchBarContainer = createTag('div', { class: 'generate-text-container' }, searchBar);
  const generateBtn = createTag('a', { class: 'gray-button generate-button next-step', href: '#' });
  const analyticsHolder = createTag('div', { class: 'interactive-link-analytics-text' }, `${searchText} - `);
  const svg = config.querySelector('img[src*=".svg"]')?.closest('picture');
  if (svg) {
    svg.insertAdjacentElement('afterend', svg.cloneNode(true));
    generateBtn.appendChild(svg);
  }
  generateBtn.appendChild(analyticsHolder);
  generateBtn.appendChild(document.createTextNode(btnText));
  genfillDiv.appendChild(searchBarContainer);
  genfillDiv.appendChild(generateBtn);
  layer.appendChild(genfillDiv);
  generateBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    if (layer.classList.contains('disable-click')) return;
    layer.classList.add('disable-click');
    await data.openForExecution;
    data.el.dispatchEvent(new CustomEvent(data.nextStepEvent));
  });
  return layer;
}
