import { createTag } from '../../scripts/utils.js';

import '../../deps/lit-all.min.js';
import '../../deps/merch-spectrum.min.js';
import '../../deps/merch-sidenav.js';

const CATEGORY_TYPE = 'Categories';
const TYPE_TYPE = 'Types';
const getValueFromLabel = (content) => content
  .trim()
  .toLowerCase()
  .replace(/( and )/g, ' ')
  .replace(/-/g, '')
  .replace(/\s+/g, '-');

const getCategories = (arrayCategories) => {
  const tag = createTag('sp-sidenav', { variant: 'multilevel', manageTabIndex: true });
  const merchTag = createTag('merch-sidenav-list', { deeplink: 'category' });
  merchTag.append(tag);
  const mapParents = {};
  arrayCategories.forEach((item) => {
    if (item.Name?.length > 0) {
      const parentName = item.Name.split('|')[0].trim();
      if (!mapParents[parentName]) {
        mapParents[parentName] = createTag('sp-sidenav-item', { label: parentName, value: getValueFromLabel(parentName) });
        tag.append(mapParents[parentName]);
      }
      const childName = item.Name.split('|')[1]?.trim();
      if (childName) {
        const childNode = createTag('sp-sidenav-item', { label: childName, value: getValueFromLabel(childName) });
        mapParents[parentName].append(childNode);
      }
    }
  });
  return merchTag;
};

const getTypes = (arrayTypes) => {
  const tag = createTag('merch-sidenav-checkbox-group', { title: 'Types', deeplink: 'types' });
  arrayTypes.forEach((item) => {
    if (item.Name?.length > 0) {
      const checkbox = createTag('sp-checkbox', { emphasized: '', name: getValueFromLabel(item.Name) });
      checkbox.append(document.createTextNode(item.Name));
      tag.append(checkbox);
    }
  });
  return tag;
};

const appendFilters = async (root, link) => {
  const payload = link.textContent.trim();
  try {
    const resp = await fetch(payload);
    if (resp.ok) {
      const json = await resp.json();
      const arrayCategories = json.data.filter((item) => item.Type === CATEGORY_TYPE);
      if (arrayCategories.length > 0) {
        root.append(getCategories(arrayCategories));
      }
      const arrayTypes = json.data.filter((item) => item.Type === TYPE_TYPE);
      if (arrayTypes.length > 0) {
        root.append(getTypes(arrayTypes));
      }
    }
  } catch (e) {
    console.error(e);
  }
};

function appendSearch(rootNav, searchText) {
  if (searchText) {
    const spectrumSearch = createTag('sp-search', { placeholder: searchText });
    const search = createTag('merch-search', { deeplink: 'search' });
    search.append(spectrumSearch);
    rootNav.append(search);
  }
}

function appendResources(rootNav, resourceLink) {
  const literals = resourceLink.textContent.split(':');
  const title = literals[0].trim();
  const tag = createTag('sp-sidenav', { manageTabIndex: true });
  const merchTag = createTag('merch-sidenav-list', { title });
  merchTag.append(tag);
  const label = literals[1].trim();
  const link = createTag('sp-sidenav-item', { href: resourceLink.href });
  if (resourceLink.href && resourceLink.href.startsWith('http')) {
    link.append(document.createTextNode(label));
    const icon = createTag('sp-icon-link-out-light', { class: 'right', slot: 'icon' });
    link.append(icon);
  }
  tag.append(link);
  rootNav.append(merchTag);
}

export default async function init(el) {
  const title = el.querySelector('h2')?.textContent.trim();
  const rootNav = createTag('merch-sidenav', { title });
  const searchText = el.querySelector('p')?.textContent.trim();
  appendSearch(rootNav, searchText);
  const links = el.querySelectorAll('a');
  await appendFilters(rootNav, links[0]);
  if (links.length > 1) {
    appendResources(rootNav, links[1]);
  }
  const appContainer = el.closest('main > div.section')?.firstElementChild;
  if (appContainer?.classList.contains('app')) {
    appContainer.appendChild(rootNav);
    el.remove();
    const merchCards = appContainer.querySelector('merch-cards');
    if (merchCards) {
      merchCards.sidenav = merchCards.sidenav || rootNav;
      merchCards.requestUpdate();
    }
  } else {
    el.replaceWith(rootNav);
  }
  return rootNav;
}
