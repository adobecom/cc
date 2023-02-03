/* global WebImporter */
export default function createAccordionBlocks(main, document) {
  const accordions = document.querySelectorAll('.accordion');

  // fast return
  if (!accordions) {
    return;
  }

  accordions.forEach((accordion) => {
    const parentClasses = accordion.parentElement.classList;
    const items = accordion.querySelectorAll('.spectrum-Accordion-item');
    const cells = [['Accordion (seo)']];

    if (items) {
      items.forEach((item) => {
        const text = document.createTextNode(
          item.querySelector('.spectrum-Accordion-itemHeader').textContent,
        );
        const content = item.querySelector('.spectrum-Accordion-itemContent');

        cells.push([text]);
        cells.push([content]);
      });
    }
    const accBlockTable = WebImporter.DOMUtils.createTable(
      cells,
      document,
    );
    if (parentClasses.contains('dexter-FlexContainer-Items')) {
      parentClasses.remove('dexter-FlexContainer-Items');
    }
    accordion.before(accBlockTable);
    accordion.before(document.createElement('hr'));
    accordion.remove();
  });
}
