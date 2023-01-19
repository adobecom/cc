import createAccordionBlocks from "./rules/accordion.js";


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
    document, url, html, params,
  }) => {
    const main = document.body;

    /*
      blocks
    */

      createAccordionBlocks(main, document);
    

      WebImporter.DOMUtils.remove(main, [
        '.modalContainer',
      '.globalNavHeader',
      'header',
      'footer'
      ]);

      return main;
    },
  };
