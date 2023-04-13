export async function addPromoContent(el, promoPath) {
  const promotionName = el.getAttribute('data-promotion');
  const response = await window.fetch(`${promoPath}/${promotionName}.plain.html`);
  if (!response.ok) return;
  const promotionContent = await response.text();
  if (!promotionContent.length) return;
  el.appendChild(document.createRange().createContextualFragment(promotionContent));
}
export default async function init(el, promoPath = '/creativecloud/promotions/hub') {
  const promoEl = document.createElement('div');
  promoEl.classList.add('promotion');
  promoEl.setAttribute('data-promotion', el.toLowerCase());
  document.querySelector('main > div').appendChild(promoEl);
  await addPromoContent(promoEl, promoPath);
}
