import { getLibs } from '../../scripts/utils.js';

/** container block */
export default async function init(el) {
  const libs = getLibs();
  const sidenavEl = el.querySelector('.sidenav');
  const merchCardsEl = el.querySelector('.merch-cards');
  merchCardsEl.classList.add('four-merch-cards');
  const { default: initMerchCards } = await import(`${libs}/blocks/merch-cards/merch-cards.js`);
  el.innerHTML = '';
  el.append(await initMerchCards(merchCardsEl));
  const { default: initSidenav } = await import('../sidenav/sidenav.js');
  initSidenav({ default: initSidenav });
  el.append(await initSidenav(sidenavEl));
}
