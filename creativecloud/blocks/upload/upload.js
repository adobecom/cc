import { createTag } from '../../scripts/utils.js';

function decorateMultiViewport(foreground) {
  const viewports = ['mobile-up', 'tablet-up', 'desktop-up'];
  if (foreground.childElementCount === 2 || foreground.childElementCount === 3) {
    [...foreground.children].forEach((child, index) => {
      child.classList.add('upload-grid', viewports[index]);
      if (foreground.childElementCount === 2 && index === 1) child.className = 'upload-grid tablet-up desktop-up';
    });
  }
  return foreground;
}

function dropZoneAction(para, dropZone) {
  const btn = createTag('button', { type: 'button', class: 'con-button blue action-button button-xl' }, para.innerHTML);
  const input = createTag('input', { type: 'file', name: 'file-upload', id: 'file-upload', class: 'file-upload hide', accept: 'image/*' });
  const clickEls = [btn, dropZone];
  para.classList.add('upload-action-container');
  para.textContent = '';
  para.append(btn, input);

  // Click button or drop zone to trigger file upload
  [...clickEls].forEach((el) => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      input.click();
    });
  });
}

function decorateBlockColumns(content, el) {
  const mediaContainer = createTag('div', { class: 'media-container' });
  const dropZone = createTag('div', { class: 'drop-zone' });
  const dropZoneContainer = createTag('div', { class: 'drop-zone-container' });
  const media = content.querySelector('picture, video');
  media.parentElement.textContent.trim() === '' ? media.parentElement.remove() : media.parentElement;

  const terms = content.querySelector('p:last-child');
  const paras = content.querySelectorAll('p:not(last-child)'); 

  [...paras].forEach((para) => {
    if (para?.querySelector('span[class*=icon-share], span[class*=icon-upload]')) dropZoneAction(para, dropZone);
  });

  mediaContainer.append(media);
  dropZone.append(...paras);
  dropZoneContainer.append(dropZone, terms);
  content.append(mediaContainer, dropZoneContainer);
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
