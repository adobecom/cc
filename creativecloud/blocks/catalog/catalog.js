import '../../deps/merch-sidenav.js';
import { getLibs } from '../../scripts/utils.js';
import '../sidenav/sidenav.js';

export default async function init(el) {
  const libs = getLibs();
  await Promise.all([
    import(`${libs}/blocks/merch-cards/merch-cards.js`),
    import(`${libs}/deps/merch-cards.js`),
  ]);
  el.classList.add('app');
  el.innerHTML = '';
  return el;
}
