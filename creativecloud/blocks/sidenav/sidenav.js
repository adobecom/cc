import { createTag, loadScript } from '../../scripts/miloUtils.js';

loadScript('/creativecloud/deps/merch-spectrum.min.js');
await import('../../deps/sidenav.js');

const getValueFromLabel = (label) => label
  .trim()
  .toLowerCase()
  .replace(/(and|-)/g, '')
  .replace(/\s+/g, '-');

const appendSidenavItem = (parent, li) => {
  const label = li.childNodes[0]?.textContent;
  const value = getValueFromLabel(label);
  const item = createTag('sp-sidenav-item', { label, value });
  parent.append(item);
  const childList = li.querySelector('ul');
  if (childList) {
    childList.querySelectorAll('li').forEach((grandChild) => {
      appendSidenavItem(item, grandChild);
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
      appendSidenavItem(rootNav, li);
    });
    root.parentNode.replaceChild(rootNav, root);
  }
}
