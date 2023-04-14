export default function init(el) {
  const promo = document.createElement('div');
  promo.classList.add('promotion');
  if (el!== null) promo.setAttribute('data-promotion', el.toLowerCase());
  document.querySelector('main > div').appendChild(promo);
}
