import '../../deps/merch-sidenav.js';
import { getLibs } from '../../scripts/utils.js';
import '../sidenav/sidenav.js';

export default async function init(el) {
  const libs = getLibs();
  await Promise.all([
    import(`${libs}/deps/lit-all.min.js`),
    import(`${libs}/features/spectrum-web-components/dist/sidenav.js`),
    import(`${libs}/deps/merch-cards.js`),
    import(`${libs}/blocks/merch-cards/merch-cards.js`),
    import(`${libs}/deps/merch-card.js`),
    import(`${libs}/blocks/merch-card/merch-card.js`),
  ]);
  el.classList.add('app');
  el.innerHTML = '';
  return el;
}
