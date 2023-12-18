/* eslint-disable chai-friendly/no-unused-expressions */
import { getLibs } from '../../scripts/utils.js';

export default async function init(el) {
  const miloLibs = getLibs();
  import(`${miloLibs}/deps/lit-all.min.js`);
  import(`${miloLibs}/blocks/merch-cards/merch-cards.js`);
  import(`${miloLibs}/features/spectrum-web-components/dist/theme.js`);
  import(`${miloLibs}/features/spectrum-web-components/dist/button.js`);
  import(`${miloLibs}/features/spectrum-web-components/dist/icons/checkmark.js`);
  import(`${miloLibs}/features/spectrum-web-components/dist/icons/chevron.js`);
  import(`${miloLibs}/features/spectrum-web-components/dist/help-text.js`);
  import(`${miloLibs}/features/spectrum-web-components/dist/icon.js`);
  import(`${miloLibs}/features/spectrum-web-components/dist/icons-ui.js`);
  import(`${miloLibs}/features/spectrum-web-components/dist/icons-workflow.js`);
  import(`${miloLibs}/features/spectrum-web-components/dist/menu.js`);
  import(`${miloLibs}/features/spectrum-web-components/dist/overlay.js`);
  import(`${miloLibs}/features/spectrum-web-components/dist/popover.js`);
  import(`${miloLibs}/features/spectrum-web-components/dist/reactive-controllers.js`);
  import(`${miloLibs}/features/spectrum-web-components/dist/search.js`);
  import(`${miloLibs}/features/spectrum-web-components/dist/shared.js`);
  import(`${miloLibs}/features/spectrum-web-components/dist/textfield.js`);
  el.classList.add('merch', 'app');
  el.innerHTML = '';
  return el;
}
