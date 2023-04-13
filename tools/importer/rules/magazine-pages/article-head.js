/* global WebImporter */
export default function articleHead(main, document, meta) {
  const img = document.querySelector('.o-section__launcher--stretchHeight img');
  const text = document.querySelector('.main__header');
  if (!img || !text) return;
  
  // the aside block
  const cells = [['Marquee (Split, One-Third)'], ['#1E1E1E']];
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
    imageElement.insertAdjacentHTML('beforeend', imageCredits.textContent);
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

  // handle mnemonics
  const logos = document.querySelector('.main__header .magazineItem3D__logos');
  if (logos) {
    textElement.insertAdjacentElement('afterbegin', logos);
    logos.querySelectorAll('img').forEach((img) => {
      const alt = img.getAttribute('alt');
      const a = document.createElement('a');
      a.setAttribute('href', `https://main--cc--adobecom.hlx.page/products/substance3d/${alt.toLowerCase().replace(/ /g, '-')}`);
      let src = img.getAttribute('src');
      if (src.endsWith('.svg') || src.includes('.svg?')) {
        // add svgs inside links using milo format
        a.innerHTML = `https://main--cc--adobecom.hlx.page/cc/img/icons/${alt.toLowerCase().replace(/ /g, '-')}.svg | ${alt}`;
        img.replaceWith(a);
      } else {
        // add links after <img> tags
        img.after(a);
      }
    });
  }

  cells.push([textElement, imageElement]);
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
  home.innerHTML = '<a href="https://main--cc--adobecom.hlx.page/products/substance3d/">Substance 3D</a>';
  breadcrumbsList.append(home);
  const magazine = document.createElement('li');
  magazine.innerHTML = '<a href="https://main--cc--adobecom.hlx.page/products/substance3d/magazine/">Magazine</a>';
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
