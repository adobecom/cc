import { createTag } from '../../scripts/utils.js';

export default async function init(el) {
  const fg = el.querySelector('div:first-child');
  const link = el.querySelector('a').innerHTML;

  for (const child of fg.children) {
    child.classList.toggle('btn-area', !!child.querySelector('picture'));
    child.classList.toggle('text', !child.querySelector('picture'));
  }
  fg.classList.add('foreground');

  const btnEl = document.querySelector(".btn-area");
  const wcWebSharing = createTag('wc-web-sharing', { class: 'web-sharing', link });
  btnEl.appendChild(wcWebSharing);

  const shadow = wcWebSharing.attachShadow({ mode: "open" });
  const pic = btnEl.querySelector('picture');
  if (pic) shadow.appendChild(pic);

  wcWebSharing.addEventListener('click', async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'send', url: link });
      } catch (err) {
        window.lana.log(`Error using navigator object: ${err}`, { tags: 'errorType=error,module=share-link' });
      }
    } else {
      window.lana.log('Web Share API is not supported in your browser', { tags: 'errorType=error,module=share-link' });
    }
  });
}
