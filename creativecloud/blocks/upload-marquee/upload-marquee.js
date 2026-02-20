import { setLibs } from '../../scripts/utils.js';

const miloLibs = setLibs('/libs');
let createTag;
let decorateBlockBg;

function decorateMultiViewport(foreground) {
  const viewports = ['mobile-up', 'tablet-up', 'desktop-up'];
  foreground.firstElementChild?.classList.add('upload-grid');

  if (foreground.childElementCount === 2 || foreground.childElementCount === 3) {
    [...foreground.children].forEach((child, index) => {
      child.classList.add('upload-grid', viewports[index]);
      if (foreground.childElementCount === 2 && index === 1) {
        child.className = 'upload-grid tablet-up desktop-up';
      }
    });
  } else if (foreground.childElementCount === 1) {
    foreground.firstElementChild?.classList.add('mobile-up', 'tablet-up', 'desktop-up');
  }

  return foreground;
}

function decorateUploadEls(para, index) {
  const button = createTag(
    'button',
    {
      type: 'button',
      class: 'con-button blue action-button button-xl no-track',
      'daa-ll': `${para.textContent.trim()}|UnityWidget`,
    },
    para.innerHTML,
  );

  const input = createTag(
    'input',
    {
      type: 'file',
      name: `file-upload-${index}`,
      id: `file-upload-${index}`,
      class: 'file-upload hide',
      accept: 'image/*',
    },
  );

  para.classList.add('upload-action-container');
  para.textContent = '';
  para.append(button, input);
  return para;
}

function decorateUploadColumns(content, index) {
  const mediaContainer = createTag('div', { class: 'media-container' });
  const dropZone = createTag('div', { class: 'drop-zone' });
  const dropZoneContainer = createTag('div', { class: 'drop-zone-container' });

  const media = content.querySelector('picture, .video-container.video-holder');
  if (media) {
    mediaContainer.append(media);
    if (media.parentElement?.tagName === 'P' && media.parentElement.textContent.trim() === '') {
      media.parentElement.remove();
    }
  }

  const terms = content.querySelector('p:last-child');
  const paras = [...content.querySelectorAll('p:not(:last-child)')].filter(
    (para) => para.textContent.trim() !== '' || para.querySelector('img, svg'),
  );

  const uploadPara = paras.find(
    (para) => para.querySelector('span[class*=icon-share], span[class*=icon-upload], img[src$=".svg"]:not(.video-container img)'),
  );

  if (!uploadPara) {
    window.lana?.log('Failed to create upload button for upload-marquee block.');
    return null;
  }

  const uploadEls = decorateUploadEls(uploadPara, index);
  const dropZoneDefaultIcon = createTag('p', { class: 'drop-zone-default-icon' });
  const dropZoneDefaultIconImage = createTag('img', {
    src: 'https://main--cc--adobecom.aem.page/cc-shared/assets/img/default-picture.svg',
    alt: '',
  });
  dropZoneDefaultIcon.append(dropZoneDefaultIconImage);
  const textParas = paras.filter((para) => para !== uploadPara);
  const headingPara = textParas[0];
  const bodyPara = textParas[1];

  if (headingPara) headingPara.classList.add('drop-zone-heading');
  if (bodyPara) bodyPara.classList.add('drop-zone-body');

  dropZone.append(dropZoneDefaultIcon, ...paras);
  dropZoneContainer.append(dropZone, terms);
  content.textContent = '';
  content.append(mediaContainer, dropZoneContainer);

  dropZone.addEventListener('dragover', (event) => {
    event.preventDefault();
    dropZone.classList.add('active');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('active');
  });

  [uploadEls.firstElementChild, dropZone].forEach((el) => {
    if (!el) return;
    el.addEventListener('click', (event) => {
      event.stopPropagation();
      uploadEls.lastElementChild?.click();
    });
  });

  return content;
}

function buildMarqueeContent(marqueeCell) {
  const marqueeContent = createTag('div', { class: 'upload-marquee-content' });
  [...marqueeCell.children].forEach((child) => marqueeContent.append(child.cloneNode(true)));

  const brandingPara = marqueeContent.querySelector(':scope > p:first-child');
  if (brandingPara) {
    const [firstPicture, secondPicture] = [...brandingPara.querySelectorAll('picture')];
    if (firstPicture && secondPicture) {
      const brandingRow = createTag('span', { class: 'upload-marquee-branding-row' });
      const firstWrap = createTag('span', { class: 'upload-marquee-branding-first' });
      const secondWrap = createTag('span', { class: 'upload-marquee-branding-second' });

      firstWrap.append(firstPicture.cloneNode(true));
      secondWrap.append(secondPicture.cloneNode(true));
      brandingRow.append(firstWrap, secondWrap);

      brandingPara.textContent = '';
      brandingPara.classList.add('upload-marquee-branding');
      brandingPara.append(brandingRow);
    }
  }

  const ctaLink = marqueeContent.querySelector('p strong a[href], p:last-of-type a[href]');
  if (ctaLink) {
    ctaLink.classList.add('con-button', 'upload-marquee-cta');
  }

  return marqueeContent;
}

export default async function init(el) {
  ({ decorateBlockBg } = (await import(`${miloLibs}/utils/decorate.js`)));
  ({ createTag } = (await import(`${miloLibs}/utils/utils.js`)));

  el.classList.add('upload-marquee-block', 'con-block');

  const rows = el.querySelectorAll(':scope > div');
  if (rows.length < 3) return;

  const backgroundRow = rows[0];
  const marqueeRow = rows[1];
  const uploadRow = rows[2];

  if (backgroundRow.textContent.trim() !== '') {
    backgroundRow.classList.add('background');
    decorateBlockBg(el, backgroundRow, { useHandleFocalpoint: true });
  }

  const marqueeCell = marqueeRow.querySelector(':scope > div');
  if (!marqueeCell) return;

  uploadRow.classList.add('foreground');
  decorateMultiViewport(uploadRow);

  [...uploadRow.children].forEach((content, index) => {
    decorateUploadColumns(content, index + 1);
  });

  const layout = createTag('div', { class: 'upload-marquee-layout' });
  const leftCol = createTag('div', { class: 'upload-marquee-left' });
  const rightCol = createTag('div', { class: 'upload-marquee-right' });
  const uploadsWrapper = createTag('div', { class: 'upload-marquee-uploads' });
  const mediaWrapper = createTag('div', { class: 'upload-marquee-media' });

  leftCol.append(buildMarqueeContent(marqueeCell));

  [...uploadRow.children].forEach((content) => {
    const media = content.querySelector(':scope > .media-container');
    const dropZone = content.querySelector(':scope > .drop-zone-container');
    const viewportClasses = [...content.classList].filter((cls) => ['mobile-up', 'tablet-up', 'desktop-up'].includes(cls));

    if (dropZone) {
      dropZone.classList.add(...viewportClasses);
      uploadsWrapper.append(dropZone);
    }

    if (media) {
      media.classList.add(...viewportClasses);
      mediaWrapper.append(media);
    }
  });

  if (!uploadsWrapper.children.length || !mediaWrapper.children.length) return;

  leftCol.append(uploadsWrapper);
  rightCol.append(mediaWrapper);
  layout.append(leftCol, rightCol);

  const foreground = createTag('div', { class: 'foreground' });
  foreground.append(layout);

  el.textContent = '';
  el.append(foreground);
}
