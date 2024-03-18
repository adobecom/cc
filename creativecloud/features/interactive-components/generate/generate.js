// import { getLibs } from '../../../scripts/utils.js';

// export default async function stepInit(data) {
//   const miloLibs = getLibs('/libs');
//   const { createTag } = await import(`${miloLibs}/utils/utils.js`);


//   const pTags = data.stepConfigs[data.stepIndex].querySelectorAll('p');
//   const layer = createTag('div', { class: `layer layer-${data.stepIndex}` });
//   const generateCTA = createTag('a', { class: 'gray-button body-s next-step generate-button' });
//   [...pTags].forEach((p) => {
//     const img = p.querySelector('img');
//     if (img) {
//       const picClone = img.closest('picture').cloneNode(true);
//       if (img.src.includes('.svg')) generateCTA.prepend(picClone);
//       else data.stepInfo.handleImageTransition(data);
//     } else {
//       generateCTA.innerHTML += p.textContent.trim();
//     }
//   });
//   generateCTA.addEventListener('click', (e) => {
//     data.el.dispatchEvent(new CustomEvent(data.nextStepEvent));
//   });
//   layer.append(generateCTA);
//   data.target.append(layer);
// }



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
  const generateBtn = createTag('a', { class: `generate body-xl next-step` }, `${btnText}`);
  generateBtn.prepend(svg);
  genfillDiv.appendChild(searchBar);
  genfillDiv.appendChild(generateBtn);
  outerDiv.append(genfillDiv);
  data.target.append(outerDiv);
  generateBtn.addEventListener('click', (e) => {
    data.el.dispatchEvent(new CustomEvent(data.nextStepEvent));
  });
}
