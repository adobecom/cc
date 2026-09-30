import { getLibs } from '../../scripts/utils.js';

export function decorateText(el) {
  if (!el) return;
  const headings = el.querySelectorAll('h1, h2, h3, h4, h5, h6');
  const heading = headings[headings.length - 1];
  heading.classList.add('heading-xl');
  heading.nextElementSibling?.classList.add('body-m');
  heading.previousElementSibling?.classList.add('detail-m');
}

export function extendButtonsClass(text) {
  text?.querySelectorAll('.con-button').forEach((button) => {
    button.classList.add('button-justified-mobile');
  });
}

export async function decorateFeatures(paragraphs, parentEl, lastChild, createTag) {
  if (!paragraphs?.length || !parentEl) return;

  const mnemonicList = createTag('div', { class: 'mnemonic-list' });
  const productList = createTag('div', { class: 'product-list' });
  // no action area when CTAs are hidden
  const anchor = lastChild ?? paragraphs[0];
  paragraphs.forEach((paragraph) => {
    const title = paragraph.querySelector('strong');
    const picture = paragraph.querySelector('picture');
    const product = createTag('div', { class: 'product-item' });
    if (picture) product.appendChild(picture);
    if (title) product.appendChild(title);
    productList.appendChild(product);
  });
  mnemonicList.appendChild(productList);
  parentEl.insertBefore(mnemonicList, anchor);
  paragraphs.forEach((paragraph) => paragraph.remove());
}

export function appendFeatures(el, foreground, text, promiseArr, getConfig, loadStyle, createTag) {
  if (!el || !foreground || !text || !promiseArr) return;
  const paragraphs = Array.from(foreground.querySelectorAll(':scope p:not([class])'));
  const actionArea = text.querySelector('.action-area');
  // heading + following icons = one group; drop non-product lines
  const groups = [];
  let current = null;
  paragraphs.forEach((paragraph) => {
    const hasPicture = !!paragraph.querySelector('picture');
    const hasHeading = !!paragraph.querySelector('strong');
    if (hasHeading && !hasPicture) {
      current = [paragraph];
      groups.push(current);
    } else if (hasPicture && current) {
      current.push(paragraph);
    } else {
      current = null;
    }
  });
  const featureGroups = groups.filter((group) => group.length > 1);
  if (!featureGroups.length) return;
  featureGroups.forEach((group) => decorateFeatures(group, text, actionArea, createTag));
  promiseArr.push(loadStyle(`${getConfig().base}/blocks/mnemonic-list/mnemonic-list.css`));
}

export default async function init(el) {
  const miloLibs = getLibs('/libs');
  const { decorateBlockBg, decorateButtons, loadCDT } = await import(`${miloLibs}/utils/decorate.js`);
  const { createTag, getConfig, loadStyle } = await import(`${miloLibs}/utils/utils.js`);
  const children = el.querySelectorAll(':scope > div');
  const foreground = children[children.length - 1];
  if (children.length > 1) {
    children[0].classList.add('background');
    decorateBlockBg(el, children[0], { useHandleFocalpoint: true });
  }
  foreground?.classList.add('foreground', 'container');
  const headline = foreground?.querySelector('h1, h2, h3, h4, h5, h6');
  const text = headline?.closest('div');
  text?.classList.add('text');
  decorateText(text);
  decorateButtons(text, 'button-l');
  extendButtonsClass(text);
  const promiseArr = [];
  appendFeatures(el, foreground, text, promiseArr, getConfig, loadStyle, createTag);
  if (el.classList.contains('countdown-timer')) {
    promiseArr.push(loadCDT(text, el.classList));
  }
  await Promise.allSettled(promiseArr);
}
