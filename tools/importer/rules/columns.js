/* global WebImporter */
export default function guessColumnsBlocks(main, document) {
  const containers = [...document.body.querySelectorAll('.dexter-FlexContainer-Items')].filter((c) => {
    // ignore empty containers and single element containers
    if (c.childElementCount < 2) return false;
    let ancestor = c; let keep;
    do {
      ancestor = ancestor.parentElement.closest('.dexter-FlexContainer-Items');
      keep = !ancestor || (ancestor.childElementCount < 2);
    } while (ancestor && keep);
    return keep;
  });

  containers.forEach((container) => {
    if (container.closest('table') || container.querySelector('h1')) return; // exclude existing blocks or hero
    let columns = [...container.children];
    if (columns.length === 0) return;
    if (columns.length > 0 && columns[0].classList.contains('title')) {
      container.before(columns[0]);
      columns = columns.slice(1);
    }
    if (columns.length === 0) return;
    if (columns.length > 1) {
      const cells = [['Columns']];
      columns.forEach((col) => {
        const row = [];
        row.push(col.innerHTML);
        cells.push(row);
      });
      const table = WebImporter.DOMUtils.createTable(cells, document);
      container.replaceWith(table);
    } else {
      const tc = columns[0].textContent.trim();
      if (tc !== '') {
        container.append(document.createElement('hr'));
      }
    }
  });
}
