import { createTag } from '../../../scripts/utils.js';

function getGenerateConfig(data) {
  console.log('data', data);
  let genCfg = null;
  if (data.stepIndex !== 0) {
    genCfg = data.stepConfigs[data.stepIndex].querySelector('ul, ol');
  }
  const lastp = data.stepConfigs[data.stepIndex].querySelector(':scope > div > :last-child');
  if (!genCfg) return lastp;
  const dpth = data.displayPath;
  const allCfgs = genCfg.querySelectorAll('li');
  const selectCfg = (dpth >= 0 && allCfgs.length > dpth) ? allCfgs[dpth] : allCfgs[0];
  return selectCfg;
}

export default async function stepInit(data) {
  data.target.classList.add('step-generate');
  const config = data.stepConfigs[data.stepIndex];
  const layer = createTag('div', { class: `layer layer-${data.stepIndex}` });
  const gerenateCfg = getGenerateConfig(data);
  const firstp = config.querySelector(':scope > div > ul:first-of-type') || null;
  console.log('lastp', firstp, gerenateCfg);
  const labelBtn = createTag('div', { class: 'label-text' });
  if (firstp) {
    const labelText = firstp.textContent.trim();
    labelBtn.appendChild(document.createTextNode(labelText));
    const firstsvg = firstp?.querySelector('img[src*=".svg"]')?.closest('picture');
    if (firstsvg) {
      firstsvg.insertAdjacentElement('afterend', firstsvg.cloneNode(true));
      labelBtn.appendChild(firstsvg);
    }
  }
  console.log('gerenateCfg', gerenateCfg);
  const [searchText, btnText] = gerenateCfg.textContent.trim().split('|');
  const genfillDiv = createTag('div', { class: 'generate-prompt-button body-m' });
  const searchBar = createTag('div', { class: 'generate-text' }, `${searchText}`);
  const searchBarContainer = createTag('div', { class: 'generate-text-container' }, searchBar);
  const generateBtn = createTag('a', { class: 'gray-button generate-button next-step', href: '#' });
  const analyticsHolder = createTag('div', { class: 'interactive-link-analytics-text' }, `${searchText} - `);
  const lastsvg = config.querySelector('img[src*=".svg"]')?.closest('picture');
  if (lastsvg) {
    lastsvg.insertAdjacentElement('afterend', lastsvg.cloneNode(true));
    generateBtn.appendChild(lastsvg);
  }
  generateBtn.appendChild(analyticsHolder);
  generateBtn.appendChild(document.createTextNode(btnText));
  genfillDiv.appendChild(searchBarContainer);
  genfillDiv.appendChild(generateBtn);
  const generateLayer = createTag('div', { class: 'generate-layer' });
  generateLayer.appendChild(genfillDiv);
  labelBtn ? generateLayer.appendChild(labelBtn) : '';
  layer.appendChild(generateLayer);
  generateBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    if (layer.classList.contains('disable-click')) return;
    layer.classList.add('disable-click');
    await data.openForExecution;
    data.el.dispatchEvent(new CustomEvent(data.nextStepEvent));
  });
  return layer;
}
