export default function createIconBlock(main, document) {
  const el = document.querySelector('#express');

  // all different blocks
  const metaDatas = el.querySelectorAll('.position');

  // icon block selectors
  const textImageMetaData = metaDatas[0];

  // find image
  const image = textImageMetaData.querySelector('.image img');

  // find title content
  let titleElement = textImageMetaData.querySelector('.text h2');
  if (!titleElement) {
    titleElement = textImageMetaData.querySelector('.title h2');
  }
  const titleContent = titleElement.textContent;

  // find description content
  const descriptionContent =
    textImageMetaData.querySelector('.text p').textContent;

  // icon block cell creation
  const title = document.createElement('h2');
  title.innerHTML = titleContent;
  const description = document.createElement('p');
  description.innerHTML = descriptionContent;
  const contentCell = document.createElement('div');
  contentCell.appendChild(image);
  contentCell.appendChild(title);
  contentCell.appendChild(description);

  const cells = [['icon-block (fullwidth, large)'], [contentCell]];

  // icon block table
  const table = WebImporter.DOMUtils.createTable(cells, document);

  el.insertAdjacentElement('beforebegin', table);

  // coloumns selectors
  const columnsMetaData = metaDatas[1];

  // find flex elements
  const columns = [];
  const flexItems = columnsMetaData.querySelectorAll('.flex');
  flexItems.forEach((flex) => {
    if (flex.className.indexOf('aem-GridColumn') === -1) {
      const image = flex.querySelector('.image img');
      const titleContent = flex.querySelector('.text p').textContent;
      const linkElement = flex.querySelector('.dexter-Cta a');

      // column creation
      const column = document.createElement('div');
      column.appendChild(image);
      const titleParent = document.createElement('p');
      const title = document.createElement('a');
      title.href = linkElement.href;
      title.target = linkElement.target;
      title.innerHTML = titleContent;
      titleParent.appendChild(title);
      column.appendChild(titleParent);
      columns.push(column);
    }
  });

  // columns cell creation
  const columnCells = [['Columns(contained, middle)'], columns];

  // columns Table
  const columnTable = WebImporter.DOMUtils.createTable(columnCells, document);

  el.insertAdjacentElement('beforebegin', columnTable);

  // section metadata cell creation
  const sectionMetadataCells = [
    ['Section Metadata'],
    ['style', 'xxxl spacing'],
  ];

  // section metadata Table
  const sectionMetaDataTable = WebImporter.DOMUtils.createTable(
    sectionMetadataCells,
    document
  );

  el.insertAdjacentElement('beforebegin', sectionMetaDataTable);

  el.insertAdjacentElement('beforebegin', document.createElement('hr'));

  el.remove();
}
