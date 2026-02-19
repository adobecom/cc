import { setLibs } from '../../scripts/utils.js';

const miloLibs = setLibs('/libs');
let createTag;
let decorateBlockBg;

function decorateUploadEls(para) {
  const btn = createTag(
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

/**
 * Pick the upload variant to use: prefer the one with "drag and drop" for desktop copy.
 * @param {NodeListOf<Element>} variants - div[data-valign="middle"] from section 3
 * @returns {Element} chosen variant
 */
function pickUploadVariant(variants) {
  const dragDrop = [...variants].find((v) => v.textContent.includes('drag and drop'));
  return dragDrop || variants[0];
}

/**
 * Build drop zone and media from one upload variant (same structure as upload block content).
 * @param {Element} variant - one div[data-valign="middle"] with 5 p's (media, upload btn, copy, file req, legal)
 * @returns {{ mediaContainer: HTMLElement, dropZoneContainer: HTMLElement } | null}
 */
function buildUploadFromVariant(variant) {
  const mediaContainer = createTag('div', { class: 'media-container' });
  const dropZone = createTag('div', { class: 'drop-zone' });
  const dropZoneContainer = createTag('div', { class: 'drop-zone-container' });

  const media = variant.querySelector('picture, .video-container.video-holder');
  if (media) mediaContainer.append(media);
  const mediaParent = media?.parentElement;
  if (media && mediaParent?.tagName === 'P' && mediaParent.textContent.trim() === '') {
    mediaParent.remove();
  }

  const terms = variant.querySelector('p:last-child');
  let paras = variant.querySelectorAll('p:not(:last-child)');
  paras = [...paras].filter((p) => p.textContent.trim() !== '' || p.querySelector('img, svg, .con-button'));
  const getUploadPara = paras.find((para) => para?.querySelector('span[class*=icon-share], span[class*=icon-upload], img[src$=".svg"]:not(.video-container img)'));

  if (!getUploadPara) {
    window.lana?.log('Failed to create upload button. No upload icon paragraph in upload-marquee variant.');
    return null;
  }

  const uploadEls = decorateUploadEls(getUploadPara);
  /* Everything inside the dashed drop zone: icon, blue button, "Or drag and drop", file req, legal */
  dropZone.append(...paras);
  dropZoneContainer.append(dropZone, terms);

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('active');
  });
  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('active');
  });

  const clickEls = [uploadEls?.firstChild, dropZone];
  [...clickEls].forEach((el) => {
    if (!el) return;
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      uploadEls.lastChild.click();
    });
  });

  return { mediaContainer, dropZoneContainer };
}

export default async function init(el) {
  ({ decorateBlockBg } = (await import(`${miloLibs}/utils/decorate.js`)));
  ({ createTag } = (await import(`${miloLibs}/utils/utils.js`)));

  el.classList.add('upload-marquee-block', 'con-block');

  const rows = el.querySelectorAll(':scope > div');
  if (rows.length < 3) return;

  const themeSection = rows[0];
  const marqueeSection = rows[1];
  const uploadSection = rows[2];

  themeSection.classList.add('background');
  decorateBlockBg(el, themeSection, { useHandleFocalpoint: true });

  // const themeCell = themeSection.querySelector('[data-valign="middle"]');
  // const themeValue = themeCell?.querySelector('strong')?.textContent?.trim();
  // if (themeValue) {
  //   el.dataset.theme = themeValue;
  // }

  const marqueeCell = marqueeSection.querySelector('[data-valign="middle"]');
  const uploadVariants = uploadSection.querySelectorAll('[data-valign="middle"]');
  if (!marqueeCell || !uploadVariants.length) return;

  const chosenVariant = pickUploadVariant(uploadVariants);
  const built = buildUploadFromVariant(chosenVariant);
  if (!built) return;

  const { mediaContainer, dropZoneContainer } = built;

  const layout = createTag('div', { class: 'upload-marquee-layout' });
  const leftCol = createTag('div', { class: 'upload-marquee-left' });
  const rightCol = createTag('div', { class: 'upload-marquee-right' });

  const marqueeContent = createTag('div', { class: 'upload-marquee-content' });
  [...marqueeCell.children].forEach((child) => marqueeContent.append(child.cloneNode(true)));

  /* Style "Edit photos with AI" as a light button (not a plain link) */
  const ctaLink = marqueeContent.querySelector('a[href]');
  if (ctaLink) {
    ctaLink.classList.add('con-button', 'upload-marquee-cta');
  }

  leftCol.append(marqueeContent, dropZoneContainer);
  rightCol.append(mediaContainer);

  layout.append(leftCol, rightCol);

  const foreground = createTag('div', { class: 'foreground' });
  foreground.append(layout);

  el.textContent = '';
  el.append(themeSection, foreground);
}
