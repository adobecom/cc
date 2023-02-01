import { addRow } from '../utils.js';

export default function createAccordionBlocks(main, document) {
  const accordions = document.querySelectorAll('.accordion');

  // fast return
  if (!accordions) {
    return;
  }

  accordions.forEach((accordion) => {
    const parentClasses = accordion.parentElement.classList;
    const items = accordion.querySelectorAll('.spectrum-Accordion-item');
    const accBlockTable = document.createElement('table');

    addRow(accBlockTable, document.createTextNode('Accordion (seo)'));

    if (items) {
      items.forEach((item) => {
        const text = document.createTextNode(
          item.querySelector('.spectrum-Accordion-itemHeader').textContent,
        );
        const content = item.querySelector('.spectrum-Accordion-itemContent');

        addRow(accBlockTable, text);
        addRow(accBlockTable, content);
      });
    }
    accordion.insertAdjacentElement('beforebegin', accBlockTable);
    accordion.insertAdjacentElement('beforebegin', document.createElement('hr'));
    // eslint-disable-next-line no-unused-expressions
    parentClasses.contains('dexter-FlexContainer-Items') && parentClasses.remove('dexter-FlexContainer-Items');
    accordion.remove();
  });
}
