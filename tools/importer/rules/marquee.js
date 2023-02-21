/* global WebImporter */
export default function createMarqueeBlocks(main, document) {
  const marquees = main.querySelectorAll('#marquee');

  // fast return
  if (!marquees.length) {
    return;
  }

  const textElement = document.createElement('div');

  marquees.forEach((marquee) => {
    // Create table for marquee
    const cells = [['Marquee']];

    // Check if marquee has background video
    const videoWrapper = marquee.querySelector('.video-Wrapper source');
    if (videoWrapper) {
      const backgroundVideoURL = videoWrapper.getAttribute('src');
      const a = document.createElement('a');
      a.innerHTML = backgroundVideoURL;
      a.setAttribute('href', backgroundVideoURL);
      cells.push([a]);
    }

    // Check if marquee has icon
    const images = marquee.querySelectorAll('img');
    let imgLink = null;
    let imgSrc = null;
    images.forEach((image) => {
      if (imgSrc) {
        return;
      }
      const alt = image.getAttribute('alt');
      const src = image.getAttribute('src');
      if (alt && alt.indexOf('icon') > -1) {
        if (src && src.indexOf('https') === -1) {
          imgSrc = `https://www.adobe.com/${image.getAttribute('src')}`;
        } else {
          imgSrc = image.getAttribute('src');
        }
        imgLink = document.createElement('a');
        imgLink.innerHTML = imgSrc;
        imgLink.setAttribute('href', imgSrc);
      }
    });
    textElement.appendChild(imgLink);

    // Check if marquee has h1 heading
    let marqueeHeading = null;
    if (marquee.querySelector('h1').textContent) {
      marqueeHeading = document.createElement('h1');
      marqueeHeading.innerHTML = marquee.querySelector('h1').textContent;
      textElement.appendChild(marqueeHeading);
    }

    // Check if marquee has content
    let marqueeContent = null;
    if (marquee.querySelector('p').textContent) {
      marqueeContent = document.createElement('p');
      marqueeContent.innerHTML = marquee.querySelector('p').textContent;
      textElement.appendChild(marqueeContent);
    }

    // Check if marquee has white border cta
    let marqueeWhiteBorderButton = null;
    const button = marquee.querySelector('.spectrum-Button--overBackground');
    if (button) {
      marqueeWhiteBorderButton = document.createElement('a');
      const italicsElement = document.createElement('I');
      italicsElement.appendChild(button);
      marqueeWhiteBorderButton.appendChild(italicsElement);
      marqueeWhiteBorderButton.setAttribute('href', button.getAttribute('href'));
      textElement.appendChild(marqueeWhiteBorderButton);
    }

    // Check if marquee has primary cta
    let marqueePrimaryCtaButton = null;
    const accent = marquee.querySelector('.spectrum-Button--accent');
    if (accent) {
      marqueePrimaryCtaButton = document.createElement('b');
      const marqueePrimaryContent = document.createElement('a');
      marqueePrimaryContent.appendChild(accent);
      marqueePrimaryContent.setAttribute('href', accent.getAttribute('href'));
      marqueePrimaryCtaButton.appendChild(marqueePrimaryContent);
      const space = document.createElement('span');
      space.innerHTML = '\u00A0';
      textElement.appendChild(space);
      textElement.appendChild(marqueePrimaryCtaButton);
    }
    cells.push([textElement, ' ']);
    const marqueeBlockTable = WebImporter.DOMUtils.createTable(
      cells,
      document,
    );
    marquee.before(document.createElement('hr'));
    marquee.replaceWith(marqueeBlockTable);
  });
}
