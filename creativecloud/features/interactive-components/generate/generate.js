import { getLibs } from '../../../scripts/utils.js';

export default async function stepInit(data) {
  const miloLibs = getLibs('/libs');
  const { createTag } = await import(`${miloLibs}/utils/utils.js`);
  data.target.classList.add('step-generate');
  data.handleImageTransition(data);
  const config = data.stepConfigs[data.stepIndex];
  const text = config.textContent.trim();
  const [searchText, btnText, position] = text.split('|');
  const outerDiv = createTag('div', { class: `layer layer-${data.stepIndex}` });
  if (position) outerDiv.classList.add(`generate-${position.toLowerCase().trim()}`);
  const genfillDiv = createTag('div', { class: 'generate-prompt-button body-m' });
  const searchBar = createTag('div', { class: 'generate-text' }, `${searchText}`);
  const searchBarContainer = createTag('div', { class: 'generate-text-container' }, searchBar);
  const generateBtn = createTag('a', { class: `gray-button generate-button next-step`, href: "#" });
  const svg = config.querySelector('img[src*=".svg"]')?.closest('picture');
  if (svg) generateBtn.appendChild(svg);
  if (btnText) {
    const textNode = document.createTextNode(btnText);
    generateBtn.appendChild(textNode);
  }
  genfillDiv.appendChild(searchBarContainer);
  genfillDiv.appendChild(generateBtn);
  outerDiv.appendChild(genfillDiv);
  data.target.append(outerDiv);
  generateBtn.addEventListener('click', async (e) => {
    await data.openForExecution;
    data.el.dispatchEvent(new CustomEvent(data.nextStepEvent));
  });
}
