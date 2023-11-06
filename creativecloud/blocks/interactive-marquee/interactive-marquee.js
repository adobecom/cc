/* eslint-disable no-useless-return */
import changeBg from '../../features/changeBg/changeBg.js';

export default async function init(el) {
  if (el.classList.contains('changebg')) {
    changeBg(el);
    return;
  }
}
