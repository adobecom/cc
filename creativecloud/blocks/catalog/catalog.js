import { getLibs } from '../../scripts/utils.js';

const makePause = async (timeout = 0) => new Promise((resolve) => setTimeout(resolve, timeout));

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
  }
  if (sidenavEl) {
    (merchCards?.updateComplete ?? Promise.resolve()).then(async () => {
      const { default: initSidenav } = await import('../sidenav/sidenav.js');
      const sidenav = await initSidenav(sidenavEl);
      el.append(sidenav);
      await sidenav.updateComplete;
      if (merchCards) {
        merchCards.sidenav = sidenav;
        merchCards.requestUpdate();
      }
    });
  }
  await makePause(1000);
  return el;
}
