/* global WebImporter */
export default function metadataBlocks(main, document) {
  const h1 = document.querySelector('h1');
  const heroDescription = document.querySelector('h1 + p');
  const meta = {};
  meta.cardTitle = (h1) ? h1.textContent : '';
  meta.cardDetail = (h1) ? h1.parentElement.textContent.split(h1.textContent)[0].trim() : '';
  meta.cardDescription = (heroDescription) ? heroDescription.textContent : '';

  // set the meta title
  const title = document.querySelector('title');
  if (title) {
    meta.Title = `Adobe Substance 3D - ${title.innerHTML.replace(/[\n\t]/gm, '')}`;
  } else {
    meta.Title = meta.cardTitle ?? '';
  }

  // set the meta description
  const desc = document.querySelector('[property="og:description"]');
  if (desc) {
    meta.Description = desc.content;
  } else {
    meta.Description = meta.cardDescription ?? '';
  }

  // set the meta image
  const img = document.querySelector('[property="og:image"]');
  if (img) {
    const el = document.createElement('img');
    el.src = img.content;
    meta.Image = el;
    meta.cardImg = el.cloneNode();
  } else {
    meta.Image = '';
    meta.cardImg = '';
  }

  // set the meta publication date
  const dateTime = document.querySelector('[property="article:published_time"]');
  if (dateTime) {
    const date = dateTime.content.split('T')[0];
    meta.PublicationDate = date;
  } else {
    meta.PublicationDate = '';
  }

  // set the meta tags
  const tags = Array.from(document.querySelectorAll('.main__header span.tag'));
  if (tags) {
    const tagsArray = [];
    tags.forEach((tag) => {
      tagsArray.push(tag.innerHTML.trim());
    });
    meta.Tags = tagsArray.join(', ');
  } else {
    meta.Tags = '';
  }
  
  // create the metadata block
  const metadataBlockCells = [
    ['Metadata'],
    ['Title', meta.Title],
    ['Image ', meta.Image],
    ['Description', meta.Description],
    ['Publication Date', meta.PublicationDate],
    ['Tags', meta.Tags],
  ];
  const metadataBlock = WebImporter.DOMUtils.createTable(metadataBlockCells, document);
  main.append(metadataBlock);
  metadataBlock.before(document.createElement('hr'));

  // create the caas card metadata block
  if (meta.cardDescription === '') { meta.cardDescription = meta.Description }
  if (meta.cardDetail === '') { meta.cardDetail = meta.PublicationDate }
  const caasCardMetadataBlockCells = [
    ['Card Metadata'],
    ['ContentType', 'Article'],
    ['CardImage ', meta.cardImg],
    ['CardImageAltText', meta.cardTitle],
    ['Details', meta.cardDetail],
    ['Title', meta.cardTitle],
    ['Description', meta.cardDescription],
  ];
  const caasCardMetadataBlock = WebImporter.DOMUtils.createTable(caasCardMetadataBlockCells, document);
  main.append(caasCardMetadataBlock);

  // returning the meta object might be usefull to other rules
  return meta;
}
