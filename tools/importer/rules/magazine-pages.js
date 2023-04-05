import articleHead from './magazine-pages/article-head.js';
import articleBody from './magazine-pages/article-body.js';
import articleBottom from './magazine-pages/article-bottom.js';
import metadataBlocks from './magazine-pages/metadata-blocks.js';
/* global WebImporter */

export default function magazinePageImporter(main, document) {

  /* 
    magazine pages import rules 
  */
  const meta = metadataBlocks(main, document);
  articleHead(main, document, meta);
  articleBody(main, document);
  articleBottom(main, document);

  // Remove double hr
  document.querySelectorAll('hr + hr').forEach((hr) => {
    hr.remove();
  });
  // Clean up the page
  WebImporter.DOMUtils.remove(main, [
    '.c-nav__close',
    '.feds-header-wrapper',
    '.navbar3D',
    'o-section__launcher--stretchHeight',
    'o-credits',
    '.section3D .section3D__content',
    '.main__article .tag-group',
    '.main__aside',
    '#feds-footer',
    '.pswp',
    '#onetrust-consent-sdk',
    '#ot-cookie-button',
    '#ot-cookie-settings',
  ]);

  document.querySelectorAll('a').forEach((a) => {
    if (a.href && a.href.startsWith('/magazine/wp-content/')) {
      a.setAttribute('href', `https://substance3d.adobe.com${a.href}`);
      const img = a.querySelector('img:first-child:last-child');
      if (img) a.replaceWith(img);
    } else {
      if (a.href.startsWith('/magazine')) a.setAttribute('href', `/products/substance3d${a.href}`);
      if (a.href.endsWith('/')) a.setAttribute('href', a.href.slice(0, -1));
      if (a.href.startsWith('/')) a.setAttribute('href', `https://main--cc--adobecom.hlx.page${a.href}`);
    }
  });
  document.querySelectorAll('video').forEach((video) => {
    const source = video.querySelector('source').getAttribute('src');
    if (source.startsWith('/magazine/wp-content/')) {
      video.querySelector('source').setAttribute('src', `https://substance3d.adobe.com${source}`);
    } else if (source.startsWith('/')) {
      video.querySelector('source').setAttribute('src', `https://main--cc--adobecom.hlx.page${source}`);
    }
  });
}
