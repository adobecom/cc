import { getLibs } from '../../scripts/utils.js';

/** container block */
export default async function init(el) {
  el.classList.add('container');
  const libs = getLibs();
  const sidenavEl = el.querySelector('.sidenav');
  const merchCardsEl = el.querySelector('.merch-cards');
  el.innerHTML = '';
  if (merchCardsEl) {
    merchCardsEl.classList.add('four-merch-cards');
    const { default: initMerchCards } = await import(`${libs}/blocks/merch-cards/merch-cards.js`);
    el.append(await initMerchCards(merchCardsEl));
  }
  if (sidenavEl) {
    const { default: initSidenav } = await import('../sidenav/sidenav.js');
    el.append(await initSidenav(sidenavEl));
  }
  return el;
}
