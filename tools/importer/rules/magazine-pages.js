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

  /*
    clean
  */
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
}
