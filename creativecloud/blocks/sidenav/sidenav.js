import { createTag } from '../../scripts/utils.js';
import { html, css, LitElement } from '/creativecloud/deps/lit-all.min.js';
import('/creativecloud/deps/merch-spectrum.min.js');
import('../../deps/sidenav.js');

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
  paragraph?.remove();
  const root = el.querySelector('ul');
  if (root) {
    const title = paragraph?.textContent;
    const rootNav = createTag('filter-sidenav', { title });
    root.querySelectorAll(':scope > li').forEach((li) => {
      appendSidenavItem(rootNav, li);
    });
    root.parentNode.replaceChild(rootNav, root);
  }
}
