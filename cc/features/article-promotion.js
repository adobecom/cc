export default function init(el) {
  const promo = document.createElement('div');
  promo.classList.add('promotion');
  promo.setAttribute('data-promotion', el.getAttribute('content').toLowerCase());
  document.querySelector('main > div').appendChild(promo);
}
