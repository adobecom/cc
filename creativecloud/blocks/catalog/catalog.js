import { getLibs } from '../../scripts/utils.js';

const miloLibs = getLibs('/libs');
const { loadStyle } = await import(`${miloLibs}/utils/utils.js`);

// Helps with TBT: MWPW-145127
loadStyle(`${miloLibs}/blocks/global-navigation/features/profile/dropdown.css`);

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
      sidenav.setAttribute('daa-lh', 'b1|catalog-sidenav');
      await sidenav.updateComplete;
      if (merchCards) {
        sidenav.filters.addEventListener('click', ({ target }) => {
          merchCards.setAttribute('daa-lh', target.getAttribute('daa-ll'));
        });
        merchCards.sidenav = sidenav;
        merchCards.querySelectorAll('merch-card').forEach((card) => {
          card.setAttribute('daa-lh', `card-${card.name}`);
        });
        merchCards.requestUpdate();
      }
    });
  }
  // decorate sort dropdown
  if (merchCards) {
    const sort = merchCards.shadowRoot.querySelector('#sortButton');
    sort?.querySelectorAll('sp-menu-item').forEach((i) => {
      if (i.value) {
        i?.setAttribute('daa-lh', `sort-${i?.value}`);
      }
    });
  }
  return el;
}
