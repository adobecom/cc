import { createTag } from '../../../scripts/utils.js';

function getGenerateConfig(data, flag) {
  const { stepConfigs, stepIndex, displayPath } = data;
  const genCfg = flag ? stepConfigs[stepIndex].querySelector('ul:last-of-type, ol:last-of-type') : null;
  const lastElement = stepConfigs[stepIndex].querySelector(':scope > div > :last-child');
  if (!genCfg) return lastElement;
  const allCfgs = genCfg.querySelectorAll('li');
  return (displayPath >= 0 && allCfgs.length > displayPath) ? allCfgs[displayPath] : allCfgs[0];
}

export default async function stepInit(data) {
  const { stepConfigs, stepIndex, target } = data;
  target.classList.add('step-generate');
  const config = stepConfigs[stepIndex];
  const imgElements = config.querySelectorAll('picture img');
  const svgElements = Array.from(imgElements).filter((img) => img.src.endsWith('.svg'));
  const flag = svgElements.length > 1;
  const labelBtn = createTag('div', { class: 'label-text' });
  if (flag) {
    const firstSvgElement = svgElements[0];
    const labelText = firstSvgElement.closest('p').nextElementSibling.textContent.trim();
    labelBtn.appendChild(document.createTextNode(labelText));
    const firstSvgPicture = firstSvgElement.closest('picture');
    if (firstSvgPicture) {
      firstSvgPicture.insertAdjacentElement('afterend', firstSvgPicture.cloneNode(true));
      labelBtn.appendChild(firstSvgPicture);
    }
  }
  const layer = createTag('div', { class: `layer layer-${stepIndex}` });
  const generateCfg = getGenerateConfig(data, flag);
  const [searchText, btnText] = generateCfg.textContent.trim().split('|');
  const genfillDiv = createTag('div', { class: 'generate-prompt-button body-m' });
  const searchBar = createTag('div', { class: 'generate-text' }, searchText);
  const searchBarContainer = createTag('div', { class: 'generate-text-container' }, searchBar);
  const generateBtn = createTag('a', { class: 'gray-button generate-button next-step', href: '#', 'aria-label': `${btnText}, ${searchText}` });
  const analyticsHolder = createTag('div', { class: 'interactive-link-analytics-text' }, `${searchText} - `);
  const lastSvgPicture = svgElements[svgElements.length - 1]?.closest('picture');
  if (lastSvgPicture) {
    lastSvgPicture.insertAdjacentElement('afterend', lastSvgPicture.cloneNode(true));
    generateBtn.appendChild(lastSvgPicture);
  }
  generateBtn.appendChild(analyticsHolder);
  generateBtn.appendChild(document.createTextNode(btnText));
  genfillDiv.appendChild(searchBarContainer);
  genfillDiv.appendChild(generateBtn);
  const generateLayer = createTag('div', { class: 'generate-layer' });
  generateLayer.appendChild(genfillDiv);
  if (flag) generateLayer.appendChild(labelBtn);
  layer.appendChild(generateLayer);
  generateBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    if (!layer.classList.contains('disable-click')) {
      layer.classList.add('disable-click');
      await data.openForExecution;
      data.el.dispatchEvent(new CustomEvent(data.nextStepEvent));
    }
  });
  return layer;
}
