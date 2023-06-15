import { getLibs } from '../../scripts/utils.js';

const miloLibs = getLibs();
const { createTag } = await import(`${miloLibs}/utils/utils.js`);
const { decorateBlockAnalytics, decorateLinkAnalytics } = await import(`${miloLibs}/martech/attributes.js`);

export default function init(block) {
  const firstCell = block.querySelector(':scope > div:first-child');
  const secondCell = block.querySelector(':scope > div:nth-child(2)');
  if (!firstCell || !secondCell) return;

  const checkbox = createTag('input', { type: 'checkbox' });
  const label = createTag('label', { class: 'checkmark' }, secondCell.firstElementChild.innerHTML);
  const div = createTag('div', { class: 'checkbox-container' }, checkbox);
  label.prepend(div);
  secondCell.replaceChildren(label);

  const cta = firstCell.querySelector('a');
  cta.classList.add('con-button', 'outline');
  cta.setAttribute('aria-disabled', 'true');
  cta.setAttribute('tabindex', '-1');

  checkbox.addEventListener('change', () => {
    if (checkbox.checked) {
      cta.removeAttribute('aria-disabled');
      cta.removeAttribute('tabindex');
    } else {
      cta.setAttribute('aria-disabled', 'true');
      cta.setAttribute('tabindex', '-1');
    }
  });

  decorateBlockAnalytics(block);
  decorateLinkAnalytics(block, []);
};
