/* eslint-disable no-case-declarations */

export default async function init(el) {
  switch (true) {
    case el.classList.contains('changebg'):
      const { default: changeBg } = await import('../../features/changeBg/changeBg.js');
      changeBg(el);
      break;
    default:
      // default case
      break;
  }
}
