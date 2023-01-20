import { addRow } from "../utils.js";


function addMarqueeRowWithMultipleColumns(table, count, ...content) {
  const newRow = table.insertRow(-1);
  let loopCounter = 1;

  while (loopCounter <= count) {
    const newCell = newRow.insertCell(loopCounter - 1);
    newCell.appendChild(content[loopCounter - 1]);
    loopCounter += 1;
  }

  let rowLoopCounter = 0;
  while (rowLoopCounter < table.rows.length - 1) {
    table.rows[rowLoopCounter].cells[0].setAttribute('colspan', count);
    rowLoopCounter += 1;
  }
}


export default function createMarqueeBlocks(main, document) {
  const marquees = document.querySelectorAll('#marquee');

  // fast return
  if (!marquees) {
    return;
  }

  marquees.forEach((marquee) => {

    // Create table for marquee
    const marqueeBlockTable = document.createElement('table');
    addRow(marqueeBlockTable, document.createTextNode('Marquee'));

    // Check if marquee has background video
    if (marquee.querySelector('.has-video.dexter-Background')) {
      const backgroundVideoURL = marquee.querySelector('.has-video.dexter-Background').querySelector('video').querySelector('source').getAttribute('src');
      const bgvideoa = document.createElement('a');
      bgvideoa.innerHTML = backgroundVideoURL;
      bgvideoa.setAttribute('href', backgroundVideoURL);
      addRow(marqueeBlockTable, bgvideoa);
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
          iconImage = "https://www.adobe.com/" + image.getAttribute('src');
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
    iconImageUrl ? textElement.appendChild(iconImageUrl) : '';
    marqueeHeading ? textElement.appendChild(marqueeHeading) : '';
    marqueeContent ? textElement.appendChild(marqueeContent) : '';
    marqueeWhiteBorderButton ? textElement.appendChild(marqueeWhiteBorderButton) : '';
    textElement.appendChild(document.createTextNode('\u00A0'));
    marqueePrimaryCtaButton ? textElement.appendChild(marqueePrimaryCtaButton) : '';

    addMarqueeRowWithMultipleColumns(marqueeBlockTable, 2, textElement, document.createTextNode(" "));

    marquee.insertAdjacentElement('beforebegin', marqueeBlockTable);
    marquee.insertAdjacentElement('beforebegin', document.createElement('hr'));
    marquee.remove();
  });
}
