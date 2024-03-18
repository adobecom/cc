import { getLibs } from '../../../scripts/utils.js';

export default async function stepInit(data) {
  const miloLibs = getLibs('/libs');
  const { createTag } = await import(`${miloLibs}/utils/utils.js`);
  data.target.classList.add('step-generate');
  data.handleImageTransition(data);
  const config = data.stepConfigs[data.stepIndex];
  const text = config.querySelector('p:not(:has(> picture))');
  const [searchText, btnText]= text.innerText.split('|');
  const svg = config.querySelector('img[src*=svg]');
  const svgClone = svg.cloneNode(true);
  svg.insertAdjacentElement('afterEnd', svgClone);
  const outerDiv = createTag('div', { class: `mobile-genfill layer show-layer layer-${data.stepIndex}` });
  const genfillDiv = createTag('div', { class: 'genfill-prompt body-s' });
  const searchBar = createTag('div', { class: 'genfill-search' }, `${searchText}`);
  const generateBtn = createTag('a', { class: `gray-button generate body-xl next-step` }, `${btnText}`);
  generateBtn.prepend(svg);
  genfillDiv.appendChild(searchBar);
  genfillDiv.appendChild(generateBtn);
  outerDiv.append(genfillDiv);
  data.target.append(outerDiv);
  generateBtn.addEventListener('click', (e) => {
    data.el.dispatchEvent(new CustomEvent(data.nextStepEvent));
  });
}
