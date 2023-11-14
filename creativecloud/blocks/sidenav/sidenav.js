import { createTag, loadScript } from '../../scripts/miloUtils.js';

await import('../../deps/sidenav.js');
loadScript('/creativecloud/deps/merch-spectrum.min.js');

const getValueFromLabel = (label) => label
  .trim()
  .toLowerCase()
  .replace(/(and|-)/g, '')
  .replace(/\s+/g, '-');

const appendSpSidenavItem = (parent, li) => {
  const label = li.childNodes[0]?.textContent;
  const value = getValueFromLabel(label);
  const item = createTag('sp-sidenav-item', { label, value });
  parent.append(item);
  const childList = li.querySelector('ul');
  if (childList) {
    childList.querySelectorAll('li').forEach((grandChild) => {
      appendSpSidenavItem(item, grandChild);
    });
  }
  parent.append(item);
};

export default function init(el) {
  const paragraph = el.querySelector('p');
  const title = paragraph?.textContent;
  paragraph?.remove();
  const root = el.querySelector('ul');
  if (root) {
    const rootNav = createTag('filter-sidenav', { title });
    root.querySelectorAll(':scope > li').forEach((li) => {
      appendSpSidenavItem(rootNav, li);
    });
    root.parentNode.replaceChild(rootNav, root);
  }
}
