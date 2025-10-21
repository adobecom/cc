import { getLibs } from '../../scripts/utils.js';

export default async function init(el) {
  const miloLibs = getLibs('/libs');
  const { decorateButtons } = await import(`${miloLibs}/utils/decorate.js`);
  const showcaseContentElem = el.querySelector(':scope > div');
  // Add class to container for styling
  showcaseContentElem.classList.add('firefly-model-showcase-content');
  // Decorate buttons
  el.classList.add('l-button');
  await decorateButtons(el);
}
