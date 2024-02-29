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
  el.innerHTML = '';
  if (merchCards) {
    el.append(merchCards);
    await merchCards.updateComplete;
  }
  requestIdleCallback(async () => {
    if (sidenavEl) {
      const { default: initSidenav } = await import('../sidenav/sidenav.js');
      const sidenav = await initSidenav(sidenavEl);
      await sidenav.updateComplete;
      el.append(sidenav);
      if (merchCards) {
        merchCards.sidenav = sidenav;
        merchCards.requestUpdate();
      }
    }
  });
  return el;
}
