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

  // create the author bio blocks
  document.querySelectorAll('.exergue--img').forEach((authorBio) => {
    const authorBioCells = [
      ['Icon Block (bio, small)'],
      [authorBio.innerHTML],
    ];
    const authorBioBlock = WebImporter.DOMUtils.createTable(authorBioCells, document);
    authorBio.replaceWith(authorBioBlock);
    // wrap the author bio block in a section
    const sectionMetadataBlockCells = [
      ['Section Metadata'],
      ['style', 'center, grid width 8, L spacing'],
    ];
    const sectionMetadataBlock = WebImporter.DOMUtils.createTable(sectionMetadataBlockCells, document);
    authorBioBlock.after(document.createElement('hr'));
    authorBioBlock.after(sectionMetadataBlock);
    const hr = document.createElement('hr');
    authorBioBlock.before(hr);
    hr.before(sectionMetadataBlock.cloneNode(true));
  });
}
