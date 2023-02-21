/* global WebImporter */
export default function articleBottom(main, document) {
  const bottomOfThePage = document.querySelector('.section3D.quiet');
  if (!bottomOfThePage) return;
  
  bottomOfThePage.before(document.createElement('hr'));

  // create the section metadata block
  const sectionMetadataBlockCells = [
    ['Section Metadata'],
    ['style', 'center, grid width 8, L spacing'],
    ['background', '#e5e5e5'],
  ];
  const sectionMetadataBlock = WebImporter.DOMUtils.createTable(sectionMetadataBlockCells, document);
  bottomOfThePage.before(sectionMetadataBlock);

  // to-do: add the related articles
}
