export default async function init(el) {
  if (el.classList.contains('changebg')) {
    const { default: changeBg } = await import('../../features/changeBg/changeBg.js');
    changeBg(el);
  }
}
