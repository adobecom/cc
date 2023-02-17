/* global WebImporter */
export default function articleBody(main, document) {
  const bottomOfThePage = document.querySelector('.section3D.quiet');
  if (!bottomOfThePage) return;
  
  // create the share block
  const shareBlockCells = [
    ['Share'],
    [''],
  ];
  const shareBlock = WebImporter.DOMUtils.createTable(shareBlockCells, document);
  bottomOfThePage.before(shareBlock);
  // create the section metadata block
  const sectionMetadataBlockCells = [
    ['Section Metadata'],
    ['style', 'grid width 8, M spacing'],
  ];
  const sectionMetadataBlock = WebImporter.DOMUtils.createTable(sectionMetadataBlockCells, document);
  bottomOfThePage.before(sectionMetadataBlock);

  // create the aside inline blocks
  document.querySelectorAll('.main__article .has-background.has-very-light-gray-background-color').forEach((asideInline) => {
    const div = document.createElement('div');
    div.innerHTML = asideInline.innerHTML;
    const asideInlineCells = [
      ['Aside (Inline)'],
      ['#f5f5f5'],
      [[document.body.querySelector('img').cloneNode()], [div]],
    ];
    const asideInlineBlock = WebImporter.DOMUtils.createTable(asideInlineCells, document);
    asideInline.replaceWith(asideInlineBlock);
  });
}
