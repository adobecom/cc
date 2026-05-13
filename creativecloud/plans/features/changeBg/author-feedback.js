document.getElementsByTagName('head')[0].insertAdjacentHTML(
  'beforeend',
  '<link rel="stylesheet" href="/creativecloud/features/changeBg/author-feedback.css" />',
);

const LCP_SECTION_TITLES = ['background', 'foreground', 'text'];
const enticement = ['tryit', 'cursor'];
let rowID = 0;

const IMAGE_DIMENSIONS = [
  [599, 591], // mobile
  [1199, 747], // tablet
  [1920, 860], // desktop
];

const THUMBNAILS_DIMENSIONS = [
  [70, 70], // image 1 thumbnail
  [70, 70], // image 2 thumbnail
  [70, 70], // image 3 thumbnail
];

const notificationsContainer = document.createElement('div');
notificationsContainer.className = 'notifications';
const errors = [];

function notify(message, className) {
  const messageContainer = document.createElement('div');
  messageContainer.innerHTML = message;
  messageContainer.className = className;

  notificationsContainer.append(messageContainer);
}

function analyze(el) {
  const rows = el.querySelectorAll(':scope > div');
  function checkHexColor(rowIdx) {
    const row = rows[rowIdx];
    const cells = [...row.children];
    cells.forEach((cell) => {
      const colors = cell.innerText.split(',');
      colors.forEach((color) => {
        if (!color.match(/^#[0-9A-Fa-f]{6}$/)) {
          errors.push(`bad color format at row ${rowIdx}; format should be #rrggbb, found '${color}'`);
          notify(errors[errors.length - 1], 'error');
        }
      });
    });
  }

  function checkEnticement(rowIdx) {
    const row = rows[rowIdx];
    if (!row.querySelector('a') && rowIdx === 3) {
      errors.push(`Expecting tryit text and link at row${rowIdx}`);
      notify(errors[errors.length - 1], 'error');
    } else if (!row.querySelector('a') && rowIdx === 4) {
      errors.push(`Expecting Cursor text and link at row${rowIdx}`);
      notify(errors[errors.length - 1], 'error');
    }
  }

  function checkImages3(rowIdx, dimensions) {
    const row = rows[rowIdx];

    const cells = [...row.children];
    cells.forEach((cell, colIdx) => {
      const pictures = cell.querySelectorAll('picture');

      if (!dimensions[colIdx] && pictures.length > 1) {
        errors.push(`row ${rowIdx}, col ${colIdx} should be empty`);
        notify(errors[errors.length - 1], 'error');
        return;
      }

      if (dimensions[colIdx] && (pictures.length === 0)) {
        errors.push(`expected an image in row ${rowIdx}, col ${colIdx}`);
        notify(errors[errors.length - 1], 'error');
        return;
      }
      pictures.forEach((picture) => {
        if (picture) {
          let currentSrc = '';
          if (colIdx === 0) {
            currentSrc = picture.querySelector('source[type="image/webp"]:not([media])').srcset;
          } else {
            currentSrc = picture.querySelector('source[type="image/webp"][media]').srcset;
          }
          const ss = currentSrc.replace('./', '/');
          const img = new Image();
          img.src = `${ss}`;
          img.onload = () => {
            const { width } = img;
            const { height } = img;
            if (width !== dimensions[colIdx][0] || height !== dimensions[colIdx][1]) {
              errors.push(`wrong image size in row ${rowIdx}, col ${colIdx}: ${[img.width, img.height]}, expecting ${dimensions[colIdx]}`);
              notify(errors[errors.length - 1], 'error');
            }
          };
        }
      });
    });
  }
  // check LCP images
  LCP_SECTION_TITLES.forEach((lcp, lcpIdx) => {
    const dimensions = [...IMAGE_DIMENSIONS];
    if (lcpIdx === 1) {
      dimensions[0] = [548, 334];
    }
    checkImages3(rowID, dimensions);
    rowID += 1;
  });

  // check Enticement
  enticement.forEach((ele) => {
    checkEnticement(rowID, ele);
    rowID += 1;
  });

  while (rowID < rows.length) {
    let temprowid = rowID;
    while (temprowid + 1 < rows.length && rows[temprowid + 1].getElementsByTagName('a').length === 0) {
      temprowid += 1;
    }
    const dimensions = [...IMAGE_DIMENSIONS];
    const swtchDimention = [...THUMBNAILS_DIMENSIONS];
    checkEnticement(rowID, '');
    if (rowID + 2 === temprowid) {
      checkImages3(rowID + 2, dimensions);
      checkImages3(rowID + 1, swtchDimention);
    } else if (rowID + 1 === temprowid) {
      checkHexColor(rowID + 1);
    }
    rowID = temprowid + 1;
  }
}

export default async function debug(el) {
  await analyze(el);
  const debugContainer = document.createElement('div');
  debugContainer.className = 'debug';
  el.append(debugContainer);
  el.append(notificationsContainer);
}
