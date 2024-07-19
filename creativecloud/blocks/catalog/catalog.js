import { getLibs } from '../../scripts/utils.js';

const miloLibs = getLibs('/libs');
const { loadStyle } = await import(`${miloLibs}/utils/utils.js`);
const EVENT_MERCH_CARD_ACTION_MENU_TOGGLE = 'merch-card:action-menu-toggle';

const EVENT_MERCH_SEARCH_CHANGE = 'merch-search:change';

const EVENT_MERCH_CARD_COLLECTION_SORT = 'merch-card-collection:sort';

const EVENT_MERCH_CARD_COLLECTION_SHOWMORE = 'merch-card-collection:showmore';
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

const addCustomAnalyticsListeners = (events, component) => {
  events.forEach((e) => {
    component.addEventListener(e, ({ detail }) => {
      const eventSuffix = e.substring(e.indexOf(':'));
      const eventName = detail.value ? `${detail.value}--${eventSuffix}` : e;
      handleCustomAnalyticsEvent(eventName, component);
    });
  });
};

/** container block */
export default async function init(el) {
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
      el.appendChild(sidenav);
      await sidenav.updateComplete;
      if (merchCards) {
        addCustomAnalyticsListeners(
          [
            EVENT_MERCH_CARD_COLLECTION_SORT,
            EVENT_MERCH_CARD_COLLECTION_SHOWMORE,
            EVENT_MERCH_CARD_ACTION_MENU_TOGGLE,
          ],
          merchCards,
        );
        sidenav.search.addEventListener(EVENT_MERCH_SEARCH_CHANGE, ({ detail }) => {
          handleCustomAnalyticsEvent(`${detail.value}--search`, sidenav.search);
        });
        merchCards.addEventListener('click', ({ target }) => {
          if (target.tagName === 'MERCH-ICON') {
            handleCustomAnalyticsEvent('merch-icon-click', merchCards);
          }
        });

        sidenav.filters.addEventListener('merch-sidenav:select', ({ target }) => {
          const lh = el.getAttribute('daa-lh');
          const mepValue = lh?.substring(lh.indexOf('|')) || '';
          el.setAttribute('daa-lh', `${target?.selectedValue || 'all'}${mepValue}`);
        });

        merchCards.sidenav = sidenav;
        merchCards.querySelectorAll('merch-card').forEach(async (card) => {
          card.querySelectorAll('a[daa-ll]').forEach((anchor) => {
            const ll = anchor.getAttribute('daa-ll');
            anchor.setAttribute('daa-ll', `${ll.slice(0, ll.indexOf('--'))}--${card.name}`);
          });
        });
        merchCards.requestUpdate();
      }
    });
  }
  return el;
}
