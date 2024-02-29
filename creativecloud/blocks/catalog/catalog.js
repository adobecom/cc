import { getLibs } from '../../scripts/utils.js';

/** container block */
export default async function init(el) {
  el.classList.add('app');
  const libs = getLibs();
  const sidenavEl = el.querySelector('.sidenav');
  const merchCardsEl = el.querySelector('.merch-cards');
  let merchCards;
  if (merchCardsEl) {
    merchCardsEl.classList.add('four-merch-cards');
    const { default: initMerchCards } = await import(`${libs}/blocks/merch-cards/merch-cards.js`);
    merchCards = await initMerchCards(merchCardsEl);
  }
  let sidenav;
  if (sidenavEl) {
    const { default: initSidenav } = await import('../sidenav/sidenav.js');
    sidenav = await initSidenav(sidenavEl);
  }
  el.innerHTML = '';
  if (merchCards) el.append(merchCards);
  if (sidenav) {
    el.append(sidenav);
    if (merchCards) {
      merchCards.sidenav = sidenav;
      merchCards.requestUpdate();
    }
  }
  return el;
}
