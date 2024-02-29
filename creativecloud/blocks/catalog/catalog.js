import { getLibs } from '../../scripts/utils.js';

/** container block */
export default async function init(el) {
  const libs = getLibs();
  const [merchCards, sidenav] = await Promise.all([
    import(`${libs}/blocks/merch-cards/merch-cards.js`)
      .then(({ default: initMerchCards }) => {
        const merchCardsEl = el.querySelector('.merch-cards');
        merchCardsEl.classList.add('four-merch-cards');
        return initMerchCards(merchCardsEl);
      }),
    import('../sidenav/sidenav.js')
      .then(({ default: initSidenav }) => initSidenav(el.querySelector('.sidenav'))),
  ]);
  el.innerHTML = '';
  el.append(merchCards, sidenav);
}
