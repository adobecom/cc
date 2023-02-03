/* global WebImporter */
export default function createMarqueeBlocks(main, document) {
  const marquees = document.querySelectorAll('#marquee');

  // fast return
  if (!marquees) {
    return;
  }

  marquees.forEach((marquee) => {
    // Create table for marquee
    const cells = [['Marquee']];

    // Check if marquee has background video
    if (marquee.querySelector('.has-video.dexter-Background')) {
      const backgroundVideoURL = marquee.querySelector('.has-video.dexter-Background').querySelector('video').querySelector('source').getAttribute('src');
      const bgvideoa = document.createElement('a');
      bgvideoa.innerHTML = backgroundVideoURL;
      bgvideoa.setAttribute('href', backgroundVideoURL);
      cells.push([bgvideoa]);
    }

    // Check if marquee has icon
    const images = marquee.querySelectorAll('img');
    let iconImageUrl = null;
    let iconImage = null;
    images.forEach((image) => {
      if (iconImage) {
        return;
      }
      if (image.getAttribute('alt').indexOf('icon') > -1) {
        if (image.getAttribute('src').indexOf('https') === -1) {
          iconImage = `https://www.adobe.com/${image.getAttribute('src')}`;
        } else {
          iconImage = image.getAttribute('src');
        }
        iconImageUrl = document.createElement('a');
        iconImageUrl.innerHTML = iconImage;
        iconImageUrl.setAttribute('href', iconImage);
      }
    });

    // Check if marquee has h1 heading
    let marqueeHeading = null;
    if (marquee.querySelector('h1').textContent) {
      marqueeHeading = document.createElement('h1');
      marqueeHeading.appendChild(document.createTextNode(marquee.querySelector('h1').textContent));
    }

    // Check if marquee has content
    let marqueeContent = null;
    if (marquee.querySelector('p').textContent) {
      marqueeContent = document.createElement('p');
      marqueeContent.innerHTML = marquee.querySelector('p').textContent;
    }

    // Check if marquee has white border cta
    let marqueeWhiteBorderButton = null;
    if (marquee.querySelector('.spectrum-Button--overBackground')) {
      marqueeWhiteBorderButton = document.createElement('a');
      const italicsElement = document.createElement('I');
      italicsElement.appendChild(document.createTextNode(marquee.querySelector('.spectrum-Button--overBackground').textContent));
      marqueeWhiteBorderButton.appendChild(italicsElement);
      marqueeWhiteBorderButton.setAttribute('href', marquee.querySelector('.spectrum-Button--overBackground').getAttribute('href'));
    }

    // Check if marquee has primary cta
    let marqueePrimaryCtaButton = null;
    if (marquee.querySelector('.spectrum-Button--accent')) {
      marqueePrimaryCtaButton = document.createElement('b');
      const marqueePrimaryContent = document.createElement('a');
      marqueePrimaryContent.appendChild(document.createTextNode(marquee.querySelector('.spectrum-Button--accent').textContent));
      marqueePrimaryContent.setAttribute('href', marquee.querySelector('.spectrum-Button--accent').getAttribute('href'));
      marqueePrimaryCtaButton.appendChild(marqueePrimaryContent);
    }

    // Append all elementa of marquee in a div and add to block
    const textElement = document.createElement('div');
    if (iconImageUrl) {
      textElement.appendChild(iconImageUrl);
    }
    if (marqueeHeading) {
      textElement.appendChild(marqueeHeading);
    }
    if (marqueeContent) {
      textElement.appendChild(marqueeContent);
    }
    if (marqueeWhiteBorderButton) {
      textElement.appendChild(marqueeWhiteBorderButton);
    }
    textElement.appendChild(document.createTextNode('\u00A0'));
    if (marqueePrimaryCtaButton) {
      textElement.appendChild(marqueePrimaryCtaButton);
    }
    cells.push([textElement, ' ']);
    const marqueeBlockTable = WebImporter.DOMUtils.createTable(
      cells,
      document,
    );
    marquee.before(marqueeBlockTable);
    marquee.before(document.createElement('hr'));
    marquee.remove();
  });
}
