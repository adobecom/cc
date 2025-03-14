import { getLibs } from '../../scripts/utils.js';

const miloLibs = getLibs('/libs');
const { loadStyle } = await import(`${miloLibs}/utils/utils.js`);
const { polyfills } = await import(`${miloLibs}/blocks/merch/merch.js`);

const DEFAULT_LH = 'b1|plans';

// Helps with TBT: MWPW-145127
loadStyle(`${miloLibs}/blocks/global-navigation/features/profile/dropdown.css`);

function handleCustomAnalyticsEvent(eventName, element) {
  let daaLhValue = '';
  let daaLhElement = element.closest('[daa-lh]');
  while (daaLhElement) {
    if (daaLhValue) {
      daaLhValue = `|${daaLhValue}`;
    }
    const daaLhAttrValue = daaLhElement.getAttribute('daa-lh');
    daaLhValue = `${daaLhAttrValue}${daaLhValue}`;
    daaLhElement = daaLhElement.parentElement.closest('[daa-lh]');
  }
  // eslint-disable-next-line no-underscore-dangle
  window._satellite?.track('event', {
    xdm: {},
    data: { web: { webInteraction: { name: `${eventName}|${daaLhValue}` } } },
  });
}

export function updatePlansLh(plans, newValue) {
  if (newValue) {
    const lh = plans.getAttribute('daa-lh');
    const value = (lh?.indexOf(DEFAULT_LH) === 0) ? lh?.substring(DEFAULT_LH.length) : lh;
    const mepValue = value?.substring(value.indexOf('|')) || '';
    plans.setAttribute('daa-lh', `${newValue || 'all'}${mepValue}`);
  }
}

export function enableAnalytics(plans, collection, sidenav) {
  collection.querySelectorAll('merch-card').forEach((card) => {
    card.querySelectorAll('a[daa-ll]').forEach((anchor) => {
      const ll = anchor.getAttribute('daa-ll');
      anchor.setAttribute('daa-ll', `${ll.slice(0, ll.indexOf('--'))}--${card.name}`);
    });
  });
  collection.addEventListener('merch-card-collection:sort', ({ detail }) => {
    handleCustomAnalyticsEvent(`${detail?.value === 'authored' ? 'popularity' : detail?.value}--sort`, collection);
  });
  collection.addEventListener('merch-card-collection:showmore', () => {
    handleCustomAnalyticsEvent('showmore', collection);
  });
  collection.addEventListener('merch-card:action-menu-toggle', ({ detail }) => {
    handleCustomAnalyticsEvent(`menu-toggle--${detail.card}`, collection);
  });
  sidenav.search.addEventListener('merch-search:change', ({ detail }) => {
    handleCustomAnalyticsEvent(`${detail.value}--search`, sidenav.search);
  });
  collection.addEventListener('click', ({ target }) => {
    if (target.tagName === 'MERCH-ICON') {
      const card = target.closest('merch-card');
      handleCustomAnalyticsEvent(`merch-icon-click--${card?.name}`, collection);
    }
  });

  sidenav.filters.addEventListener('merch-sidenav:select', ({ target }) => {
    updatePlansLh(plans, target?.selectedValue);
  });
}

/** container block */
export default async function init(el) {
  await polyfills();
  
  el.classList.add('app');
  const sidenav = el.querySelector('merch-sidenav');
  const collection = el.querySelector('.merch-card-collection');
  el.innerHTML = '';

  if (sidenav) {
    el.append(sidenav);
    await sidenav.updateComplete;
  }
  if (collection) {
    el.append(collection);
    collection.sidenav = sidenav;
    collection.requestUpdate();
    enableAnalytics(el, collection, sidenav);
  }

  return el;
}
