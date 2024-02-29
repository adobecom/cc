import { createTag, localizeLink, getLibs } from '../../scripts/utils.js';

const CATEGORY_ID_PREFIX = 'categories/';
const TYPE_ID_PREFIX = 'types/';

// allows improve TBT by returning control to the main thread.
// eslint-disable-next-line no-promise-executor-return
const makePause = async (timeout = 0) => new Promise((resolve) => setTimeout(resolve, timeout));

const getIdLeaf = (id) => (id?.substring(id.lastIndexOf('/') + 1) || id).toLowerCase();

const getCategories = (items, isMultilevel, mapCategories) => {
  const configuration = { manageTabIndex: true };
  if (isMultilevel) {
    configuration.variant = 'multilevel';
  }
  const mapParents = [];
  const tag = createTag('sp-sidenav', configuration);
  const merchTag = createTag('merch-sidenav-list', { deeplink: 'category' });
  merchTag.append(tag);
  items.forEach((item) => {
    if (item) {
      let parent = tag;
      const value = getIdLeaf(item.id);
      // first token is type, second is parent category
      const isParent = item.id.split('/').length <= 2;
      const itemTag = createTag('sp-sidenav-item', { label: item.name, value });
      if (isParent) {
        mapParents[value] = itemTag;
        tag.append(itemTag);
      } else {
        const parentId = getIdLeaf(item.id.substring(0, item.id.lastIndexOf('/')));
        if (isMultilevel) {
          if (!mapParents[parentId]) {
            const parentItem = mapCategories[parentId];
            if (parentItem) {
              mapParents[parentId] = createTag('sp-sidenav-item', { label: parentItem.name, parentId });
              tag.append(mapParents[parentId]);
            }
          }
          parent = mapParents[parentId];
        }
        parent?.append(itemTag);
      }
    }
  });
  return merchTag;
};

const getTypes = (arrayTypes, typeText) => {
  const tag = createTag('merch-sidenav-checkbox-group', { title: typeText, deeplink: 'types' });
  arrayTypes.forEach((item) => {
    if (item.name?.length > 0) {
      const checkbox = createTag('sp-checkbox', {
        emphasized: '',
        name: getIdLeaf(item.id),
      });
      checkbox.append(item.name);
      tag.append(checkbox);
    }
  });
  return tag;
};

const appendFilters = async (root, link, explicitCategoriesElt, typeText) => {
  try {
    const resp = await fetch(link);
    if (resp.ok) {
      const json = await resp.json();
      const mapCategories = {};
      let categoryValues = [];
      const types = [];
      json.data.forEach((item) => {
        if (item.id?.startsWith(CATEGORY_ID_PREFIX)) {
          const value = getIdLeaf(item.id);
          mapCategories[value] = item;
          categoryValues.push(value);
        } else if (item.id?.startsWith(TYPE_ID_PREFIX)) {
          types.push(item);
        }
      });
      if (explicitCategoriesElt) {
        categoryValues = Array.from(explicitCategoriesElt.querySelectorAll('li'))
          .map((item) => item.textContent.trim().toLowerCase());
      }
      let shallowCategories = true;
      if (categoryValues.length > 0) {
        await makePause();
        const items = categoryValues.map((value) => mapCategories[value]);
        const parentValues = new Set(items.map((value) => value?.id.split('/')[1]));
        // all parent will always be here without children,
        // so shallow is considered below 2 parents
        shallowCategories = parentValues.size <= 2;
        const categoryTags = getCategories(items, !shallowCategories, mapCategories);
        root.append(categoryTags);
      }
      if (typeText && types.length > 0) {
        await makePause();
        root.append(getTypes(types, typeText));
      }
    }
  } catch (e) {
    window.lana?.log(`unable to properly fetch sidenav data: ${e}`);
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
  const libs = getLibs();
  const merchSidenavDep = import('../../deps/merch-sidenav.js');
  const deps = Promise.all([
    merchSidenavDep,
    // eslint-disable-next-line import/no-unresolved, import/no-absolute-path
    import('/libs/deps/lit-all.min.js'),
    import(`${libs}/features/spectrum-web-components/dist/theme.js`),
    import(`${libs}/features/spectrum-web-components/dist/base.js`),
    import(`${libs}/features/spectrum-web-components/dist/shared.js`),
    import(`${libs}/features/spectrum-web-components/dist/sidenav.js`),
    import(`${libs}/features/spectrum-web-components/dist/search.js`),
    import(`${libs}/features/spectrum-web-components/dist/checkbox.js`),
    import(`${libs}/features/spectrum-web-components/dist/button.js`),
    import(`${libs}/features/spectrum-web-components/dist/dialog.js`),
    import(`${libs}/features/spectrum-web-components/dist/overlay.js`),
  ]);

  const title = el.querySelector('h2,h3')?.textContent.trim();
  await merchSidenavDep;
  const rootNav = createTag('merch-sidenav', { title });
  const searchText = el.querySelector('p > strong')?.textContent.trim();
  const typeText = el.querySelector('p > em')?.textContent.trim();
  await deps;
  el.replaceWith(rootNav);
  appendSearch(rootNav, searchText);
  // eslint-disable-next-line prefer-const
  let [endpoint, resourcesLink] = el.querySelectorAll('a');
  if (endpoint) {
    await makePause();
    endpoint = localizeLink(endpoint.textContent.trim(), null, true);
    const explicitCategories = el.querySelector('ul');
    performance.mark('sidenav:appendFilters:start');
    await appendFilters(rootNav, endpoint, explicitCategories, typeText);
    performance.mark('sidenav:appendFilters:end');
    performance.measure('sidenav:appendFilters', 'sidenav:appendFilters:start', 'sidenav:appendFilters:end');
  }
  if (resourcesLink) {
    await makePause();
    appendResources(rootNav, resourcesLink);
  }
  return rootNav;
}
