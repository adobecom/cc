import { getLibs } from '../../scripts/utils.js';
const miloLibs = getLibs('/libs');
const { decorateButtons } = await import(`${miloLibs}/utils/decorate.js`);

export default async function init(el) {
  const btnLink = el.querySelector('a').href;

   decorateButtons(el.querySelector('div > div'), 'button-l');
   const aTag = el.querySelector('a');
   aTag.href = '';
  
  aTag.addEventListener('click', async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'send', url: btnLink });
      } catch (err) {
        window.lana.log(`Error using navigator object: ${err}`, { tags: 'errorType=error,module=share-link' });
      }
    } else {
      window.lana.log('Web Share API is not supported in your browser', { tags: 'errorType=error,module=share-link' });
    }
  });
}
