import articleHead from './article-head.js';
import articleBody from './article-body.js';
import articleBottom from './article-bottom.js';
import metadataBlocks from './metadata-blocks.js';
/* global WebImporter */

export default function magazinePageImporter(main, document) {  
  /* 
    Magazine pages import rules 
  */
  const meta = metadataBlocks(main, document);
  articleHead(main, document, meta);
  articleBody(main, document);
  articleBottom(main, document);

  // Remove double hr after doing the import rules
  document.querySelectorAll('hr + hr').forEach((hr) => {
    hr.remove();
  });

  // Clean up
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

  // Transform the links to the new site
  document.querySelectorAll('.main__article a').forEach((a) => {
    const img = a.querySelector('img:first-child:last-child');
    if (img) {
      a.replaceWith(img);
    } else if (a.href) {
      if (a.href.includes('/magazine/wp-content/uploads/')) {
        if (a.href.startsWith('/')) a.setAttribute('href', `https://substance3d.adobe.com${a.href}`);
        if (a.href.startsWith('http://localhost:3001/')) a.setAttribute('href', `https://substance3d.adobe.com${a.href.slice(21)}`);
      } else {
        if (a.href.startsWith('/')) a.setAttribute('href', `https://main--cc--adobecom.hlx.page${a.href}`);
        if (a.href.startsWith('http://localhost:3001/')) a.setAttribute('href', `https://main--cc--adobecom.hlx.page${a.href.slice(21)}`);
        if (a.href.startsWith('https://substance3d.adobe.com/')) a.setAttribute('href', `https://main--cc--adobecom.hlx.page${a.href.slice(29)}`);
        if (a.href.startsWith('https://main--cc--adobecom.hlx.page/magazine/')) a.setAttribute('href', `https://main--cc--adobecom.hlx.page/creativecloud/3d-ar/magazine${a.href.slice(44)}`);
        if (a.href.endsWith('/')) a.setAttribute('href', a.href.slice(0, -1));
      }
    }
  });

  // Update videos to go to their original source
  document.querySelectorAll('video').forEach((video) => {
    const source = video.querySelector('source').getAttribute('src');
    if (source.startsWith('/magazine/wp-content/')) {
      video.querySelector('source').setAttribute('src', `https://substance3d.adobe.com${source}`);
    } else if (source.startsWith('/')) {
      video.querySelector('source').setAttribute('src', `https://main--cc--adobecom.hlx.page${source}`);
    }
  });
}
