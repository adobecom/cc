import { setLibs } from '../../scripts/utils.js';

const miloLibs = setLibs('/libs');

const { decorateButtons, decorateBlockBg } = await import(`${miloLibs}/utils/decorate.js`);
const { createTag } = await import(`${miloLibs}/utils/utils.js`);

// [headingSize, bodySize, detailSize]
const typeSizes = ['xxl', 'xl', 'l'];

function decorateText(el) {
  const headings = el.querySelectorAll('h1, h2, h3, h4, h5, h6');
  const heading = headings[headings.length - 1];
  // const iconTitle = headings.length > 1 ? headings[0] : null;
  // iconTitle?.classList.add('icon-area', 'heading-xs', 'icon-title');
  const config = typeSizes;
  const decorate = (headingEl, typeSize) => {
    headingEl.classList.add(`heading-${typeSize[0]}`);
    const bodyEl = headingEl.nextElementSibling;
    bodyEl?.classList.add(`body-${typeSize[1]}`);
    bodyEl?.nextElementSibling?.classList.add(`body-${typeSize[1]}`, 'pricing');
    const iconAreaElements = headingEl.previousElementSibling;
    const iconText = createTag('div', { class: 'heading-xs icon-text' });
    iconText.textContent = iconAreaElements.textContent;
    // iconAreaElements.innerText = '';
    iconAreaElements.appendChild(iconText);
    iconAreaElements?.classList.add('icon-area');
  };
  decorate(heading, config);
  // const iconAreaElements = el.querySelectorAll('.icon-area');
  // outerDiv.appendChild(iconAreaElements[0]);
  // el.insertBefore(outerDiv, el.children[0]);
}

function extendButtonsClass(text) {
  const buttons = text.querySelectorAll('.con-button');
  if (buttons.length === 0) return;
  buttons.forEach((button) => { button.classList.add('button-justified-mobile'); });
}

const decorateImage = (media) => {
  media.classList.add('image');
  const imageLink = media.querySelector('a');
  const picture = media.querySelector('picture');

  if (imageLink && picture && !imageLink.parentElement.classList.contains('modal-img-link')) {
    imageLink.textContent = '';
    imageLink.append(picture);
  }
};

export default async function init(el) {
  const isLight = el.classList.contains('light');
  if (!isLight) el.classList.add('dark');
  const children = el.querySelectorAll(':scope > div');
  const foreground = children[children.length - 1];
  if (children.length > 1) {
    children[0].classList.add('background');
    decorateBlockBg(el, children[0], { useHandleFocalpoint: true });
  }
  foreground.classList.add('foreground', 'container');
  const headline = foreground.querySelector('h1, h2, h3, h4, h5, h6');
  const text = headline.closest('div');
  text.classList.add('text');
  const mediaElements = foreground.querySelectorAll(':scope > div:not([class])');
  const media = mediaElements[0];
  if (media && !media.querySelector('video, a[href*=".mp4"]')) {
    const interactiveBox = createTag('div', { class: 'interactive-container' });
    interactiveBox.appendChild(media);
    media.classList.add('media');
    decorateImage(media);
    foreground.appendChild(interactiveBox);
  }

  const firstDivInForeground = foreground.querySelector(':scope > div');
  if (firstDivInForeground?.classList.contains('media')) el.classList.add('row-reversed');

  decorateButtons(text, 'button-l');
  decorateText(text);
  extendButtonsClass(text);
}
