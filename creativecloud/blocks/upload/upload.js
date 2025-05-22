import { createTag } from '../../scripts/utils.js';

function decorateMultiViewport(foreground) {
  const viewports = ['mobile-up', 'tablet-up', 'desktop-up'];
  foreground.firstElementChild.classList.add('upload-grid');
  if (foreground.childElementCount === 2 || foreground.childElementCount === 3) {
    [...foreground.children].forEach((child, index) => {
      child.classList.add('upload-grid', viewports[index]);
      if (foreground.childElementCount === 2 && index === 1) child.className = 'upload-grid tablet-up desktop-up';
    });
  }
  return foreground;
}

function decorateUploadEls(para) {
  const btn = createTag(
    'button',
    {
      type: 'button',
      class: 'con-button blue action-button button-xl',
    },
    para.innerHTML,
  );
  const input = createTag(
    'input',
    {
      type: 'file',
      name: 'file-upload',
      id: 'file-upload',
      class: 'file-upload hide',
      accept: 'image/*',
    },
  );
  para.classList.add('upload-action-container');
  para.textContent = '';
  para.append(btn, input);
  return para;
}

function decorateBlockColumns(content) {
  const mediaContainer = createTag('div', { class: 'media-container' });
  const dropZone = createTag('div', { class: 'drop-zone' });
  const dropZoneContainer = createTag('div', { class: 'drop-zone-container' });
  const media = content.querySelector('picture, .video-container.video-holder');
  // eslint-disable-next-line chai-friendly/no-unused-expressions
  media?.parentElement.textContent.trim() === '' ? media?.parentElement.remove() : media?.parentElement;

  const terms = content.querySelector('p:last-child');
  const paras = content.querySelectorAll('p:not(last-child)');
  const getUploadPara = [...paras].filter((para) => para?.querySelector('span[class*=icon-share], span[class*=icon-upload], img[src$=".svg"]:not(.video-container img)'))[0];

  if (!getUploadPara) {
    window.lana?.log(`Failed to create upload button. Upload button equals ${getUploadPara}.`);
    return;
  }

  const uploadEls = decorateUploadEls(getUploadPara, dropZoneContainer, dropZone);
  mediaContainer.append(media);
  dropZone.append(...paras);
  dropZoneContainer.append(dropZone, uploadEls, terms);
  content.append(mediaContainer, dropZoneContainer);
  /* c8 ignore start */
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('active');
  });
  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('active');
  });
  /* c8 ignore end */
  // Click button or drop zone to trigger file upload
  const clickEls = [uploadEls?.firstChild, dropZone];
  [...clickEls].forEach((el) => {
    if (!el) return;
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      uploadEls.lastChild.click();
    });
  });
}

export default async function init(el) {
  el.classList.add('upload-block', 'con-block');
  const rows = el.querySelectorAll(':scope > div');

  rows.forEach((row) => {
    row.classList.add('foreground');
    decorateMultiViewport(row);
    [...row.children].forEach((content) => decorateBlockColumns(content, el));
  });
}
