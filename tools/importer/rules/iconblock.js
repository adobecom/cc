/* global WebImporter */
export default function createIconBlock(main, document) {
  const el = main.querySelector('#express');

  // fast return
  if (!el) {
    return;
  }

  // some marquee has id 'express'(not iconblock)
  if (el.querySelector('[daa-lh="mobile-marquee"]')) {
    return;
  }

  // all different blocks
  const metaData = el.querySelectorAll('.position');

  // icon block selectors
  const textImageMetaData = metaData[0];

  // find image
  const imageElement = textImageMetaData.querySelector('.image img');
  let imageSrc = imageElement?.getAttribute('src');
  if (imageSrc && imageSrc.indexOf('https') === -1) {
    imageSrc = `https://www.adobe.com${imageSrc}`;
  }
  const imageLink = document.createElement('a');
  imageLink.innerHTML = imageSrc;
  imageLink.setAttribute('href', imageSrc);

  // find title content
  let titleElement = textImageMetaData.querySelector('.text h2');
  if (!titleElement) {
    titleElement = textImageMetaData.querySelector('.title h2');
  }
  const titleContent = titleElement.textContent;

  // find description content
  const descriptionContent = textImageMetaData.querySelector('.text p').textContent;

  // icon block cell creation
  const title = document.createElement('h2');
  title.innerHTML = titleContent;
  const description = document.createElement('p');
  description.innerHTML = descriptionContent;
  const contentCell = document.createElement('div');
  contentCell.appendChild(imageLink);
  contentCell.appendChild(title);
  contentCell.appendChild(description);

  const cells = [['icon-block (fullwidth, large)'], [contentCell]];

  // icon block table
  const table = WebImporter.DOMUtils.createTable(cells, document);

  // coloumns selectors
  const columnsMetaData = metaData[1];

  // find flex elements
  const columns = [];
  const flexItems = columnsMetaData.querySelectorAll('.flex');
  flexItems.forEach((flex) => {
    if (flex.className.indexOf('aem-GridColumn') === -1) {
      const imageElementColumn = columnsMetaData.querySelector('.image img');
      let imageSrcColumn = imageElementColumn?.getAttribute('src');
      if (imageSrcColumn && imageSrcColumn.indexOf('https') === -1) {
        imageSrcColumn = `https://www.adobe.com${imageSrcColumn}`;
      }
      const imageLinkColumn = document.createElement('a');
      imageLinkColumn.innerHTML = imageSrcColumn;
      imageLinkColumn.setAttribute('href', imageSrcColumn);
      const titleContentColumn = flex.querySelector('.text p').textContent;
      const linkElement = flex.querySelector('.dexter-Cta a');

      // column creation
      const column = document.createElement('div');
      column.appendChild(imageLinkColumn);
      const titleParent = document.createElement('p');
      linkElement.innerHTML = titleContentColumn;
      titleParent.appendChild(linkElement);
      column.appendChild(titleParent);
      columns.push(column);
    }
  });

  // columns cell creation
  const columnCells = [['Columns(contained, middle)'], columns];

  // columns Table
  const columnTable = WebImporter.DOMUtils.createTable(columnCells, document);

  // section metadata cell creation
  const sectionMetadataCells = [
    ['Section Metadata'],
    ['style', 'xxxl spacing'],
  ];

  // section metadata Table
  const sectionMetaDataTable = WebImporter.DOMUtils.createTable(
    sectionMetadataCells,
    document,
  );
  el.before(document.createElement('hr'));
  el.replaceWith(table, columnTable, sectionMetaDataTable);
}
