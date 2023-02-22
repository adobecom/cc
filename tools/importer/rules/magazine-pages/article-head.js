/* global WebImporter */
export default function articleHead(main, document, meta) {
  const img = document.querySelector('.o-section__launcher--stretchHeight img');
  const text = document.querySelector('.main__header');
  if (!img || !text) return;
  
  // the aside block
  const cells = [['Aside (Split, Small, Dark)']];
  const textElement = document.createElement('div');
  const imageElement = document.createElement('div');

  // Check if text has background video or image
  const videoWrapper = text.querySelector('.video-Wrapper source');
  if (videoWrapper) {
    const backgroundVideoURL = videoWrapper.getAttribute('src');
    const a = document.createElement('a');
    a.innerHTML = backgroundVideoURL;
    a.setAttribute('href', backgroundVideoURL);
    imageElement.append(a);
  } else {
    imageElement.append(img);
  }
  const imageCredits = document.querySelector('.poppertooltip');
  if (imageCredits) {
    const marqueeImageCredits = document.createElement('p');
    marqueeImageCredits.innerHTML = imageCredits.textContent;
    imageElement.append(marqueeImageCredits);
    imageCredits.remove();
  }

  if (meta.cardDetail) {
    const marqueeDetail = document.createElement('p');
    marqueeDetail.innerHTML = meta.cardDetail;
    textElement.append(marqueeDetail);
  }

  if (meta.cardTitle) {
    const marqueeHeading = document.createElement('h1');
    marqueeHeading.innerHTML = meta.cardTitle;
    textElement.append(marqueeHeading);
  }

  if (meta.cardDescription) {
    const marqueeDescription = document.createElement('p');
    marqueeDescription.innerHTML = meta.cardDescription;
    textElement.append(marqueeDescription);
  }

  cells.push([imageElement]);
  cells.push([textElement, ' ']);
  const marqueeBlockTable = WebImporter.DOMUtils.createTable(
    cells,
    document,
  );
  text.replaceWith(marqueeBlockTable);
  marqueeBlockTable.after(document.createElement('hr'));
  
  // the breadcrumbs block
  const div = document.createElement('div');
  marqueeBlockTable.before(div);
  const breadcrumbsList = document.createElement('ul');
  const home = document.createElement('li');
  home.innerHTML = '<a href="https://main--cc--adobecom.hlx.page/creativecloud/3d-ar/">Substance 3D</a>';
  breadcrumbsList.append(home);
  const magazine = document.createElement('li');
  magazine.innerHTML = '<a href="https://main--cc--adobecom.hlx.page/creativecloud/3d-ar/magazine">Magazine</a>';
  breadcrumbsList.append(magazine);
  const breadcrumbsCells = [
    ['Breadcrumbs'],
    [breadcrumbsList],
  ];
  const breadcrumbsTable = WebImporter.DOMUtils.createTable(
    breadcrumbsCells,
    document,
  );
  div.replaceWith(breadcrumbsTable);
}
