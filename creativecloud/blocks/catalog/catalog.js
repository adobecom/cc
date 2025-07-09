import { getLibs } from '../../scripts/utils.js';

const miloLibs = getLibs('/libs');
const { loadStyle } = await import(`${miloLibs}/utils/utils.js`);
const { polyfills } = await import(`${miloLibs}/blocks/merch/merch.js`);

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

export function updateCatalogLh(catalogEl, newValue) {
  if (newValue) {
    catalogEl.setAttribute('daa-lh', newValue);
  }
}

export function enableAnalytics(catalog, merchCards, sidenav) {
  merchCards.querySelectorAll('merch-card').forEach((card) => {
    card.querySelectorAll('a[daa-ll]').forEach((anchor) => {
      const ll = anchor.getAttribute('daa-ll');
      anchor.setAttribute('daa-ll', `${ll.slice(0, ll.indexOf('--'))}--${card.name}`);
    });
  });
  merchCards.addEventListener('merch-card-collection:sort', ({ detail }) => {
    handleCustomAnalyticsEvent(`${detail?.value === 'authored' ? 'popularity' : detail?.value}--sort`, merchCards);
  });
  merchCards.addEventListener('merch-card-collection:showmore', () => {
    handleCustomAnalyticsEvent('showmore', merchCards);
  });
  merchCards.addEventListener('merch-card:action-menu-toggle', ({ detail }) => {
    handleCustomAnalyticsEvent(`menu-toggle--${detail.card}`, merchCards);
  });
  sidenav.search.addEventListener('merch-search:change', ({ detail }) => {
    handleCustomAnalyticsEvent(`${detail.value}--search`, sidenav.search);
  });
  merchCards.addEventListener('click', ({ target }) => {
    if (target.tagName === 'MERCH-ICON') {
      const card = target.closest('merch-card');
      handleCustomAnalyticsEvent(`merch-icon-click--${card?.name}`, merchCards);
    }
  });

  sidenav.setAttribute('daa-lh', 'nopzn|catalog');
  sidenav.filters.addEventListener('merch-sidenav:select', ({ target }) => {
    if (!target || target.oldValue === target.selectedValue) return;
    const hasDaaLh = !!catalog.getAttribute('daa-lh');
    updateCatalogLh(catalog, target.selectedValue);
    if (hasDaaLh) handleCustomAnalyticsEvent(`${target.selectedValue}--cat`, target);
    target.oldValue = target.selectedValue;
  });
}

/** container block */
export default async function init(el) {
  await polyfills();
  el.classList.add('app');
  const libs = getLibs();
  const sidenavEl = el.querySelector('.sidenav');
  const merchCardsEl = el.querySelector('.merch-card-collection');
  el.innerHTML = '';
  let merchCards;
  if (merchCardsEl) {
    el.appendChild(merchCardsEl);
    merchCardsEl.classList.add('four-merch-cards');
    const { default: initMerchCards } = await import(`${libs}/blocks/merch-card-collection/merch-card-collection.js`);
    merchCards = await initMerchCards(merchCardsEl);
  }
  if (sidenavEl) {
    (merchCards?.updateComplete ?? Promise.resolve()).then(async () => {
      const { default: initSidenav } = await import('../sidenav/sidenav.js');
      const sidenav = await initSidenav(sidenavEl);
      el.prepend(sidenav);
      await sidenav.updateComplete;
      if (merchCards) {
        merchCards.sidenav = sidenav;
        merchCards.requestUpdate();
        enableAnalytics(el, merchCards, sidenav);
      }
      el.querySelectorAll('sp-sidenav-item').forEach((item) => {
        item.removeAttribute('daa-ll');
      });
    });
  }
  return el;
}
