export default async function init(el, promotionPath = '/creativecloud/promotions/hub') {
  const promotionName = el.getAttribute('data-promotion');
  const response = await window.fetch(`${promotionPath}/${promotionName}.plain.html`);
  if (!response.ok) {
    return;
  }
  const promotionContent = await response.text();
  if (!promotionContent.length) {
    return;
  }

  el.appendChild(document.createRange()
    .createContextualFragment(promotionContent));
}
