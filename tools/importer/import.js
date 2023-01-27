/* eslint-disable no-unused-vars */
/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
/* global WebImporter */
/* eslint-disable no-console, class-methods-use-this */

/*
  import rules
*/

import createAccordionBlocks from './rules/accordion.js';
import createMarqueeBlocks from './rules/marquee.js';
import createIconBlock from './rules/iconblock.js';

export default {
  /**
   * Apply DOM operations to the provided document and return
   * the root element to be then transformed to Markdown.
   * @param {HTMLDocument} document The document
   * @param {string} url The url of the page imported
   * @param {string} html The raw html (the document is cleaned up during preprocessing)
   * @param {object} params Object containing some parameters given by the import process.
   * @returns {HTMLElement} The root element to be transformed
   */
  transformDOM: ({
    // eslint-disable-next-line no-unused-vars
    document,
    url,
    html,
    params,
  }) => {
    const main = document.body;

    main.querySelectorAll('s').forEach((s) => {
      const span = document.createElement('span');
      span.innerHTML = s.innerHTML;
      s.replaceWith(span);
    });

    /*
      blocks
    */
    createAccordionBlocks(main, document);
    createMarqueeBlocks(main, document);
    createIconBlock(main, document);

    /*
      clean
    */

    // use helper method to remove header, footer, etc.
    WebImporter.DOMUtils.remove(main, [
      '.globalnavfooter',
      '.globalnavheader',
      '.modalContainer',
      'header',
      'footer',
      // [Docx issue] : Image files having blob issue while converting to png.
      'img[src="/content/dam/cc/us/en/creative-cloud/cc_express_appicon_256.svg"]',
      'img[src="/content/dam/cct/creativecloud/business/teams/mnemonics/cc-express.svg"]',
      // [Docx issue] : Image files having dimension issue with type image/avif.
      'img[src="https://cc-prod.scene7.com/is/image/CCProdAuthor/dt_illustration_category_riverflow1_700x525?$pjpeg$&jpegSize=200&wid=764"]',
      'img[src="https://cc-prod.scene7.com/is/image/CCProdAuthor/dt_illustration_category_riverflow2_700x525?$pjpeg$&jpegSize=200&wid=764"]',
      'img[src="https://cc-prod.scene7.com/is/image/CCProdAuthor/dt_illustration_category_riverflow3_700x525?$pjpeg$&jpegSize=200&wid=764"]',
      'img[src="https://cc-prod.scene7.com/is/image/CCProdAuthor/dt_illustration_category_riverflow4_700x525?$pjpeg$&jpegSize=200&wid=764"]',
      // [Docx issue] : Image files having width and height as float.
      'img[src="/content/dam/cc/us/en/products/draw/Draw_EOL_Page_icon-Ps.svg"]',
      'img[src="/content/dam/cc/us/en/products/sketch/Sketch_EOL_Page_icon-Ca.svg"]',
      'img[src="/content/dam/cct/creativecloud/business/teams/mnemonics/mnemonic-Fresco-32x32.svg"]',
      'img[src="/content/dam/cc/icons/icon-mobile-tablet-desktop.svg"]',
    ]);

    return main;
  },
};
