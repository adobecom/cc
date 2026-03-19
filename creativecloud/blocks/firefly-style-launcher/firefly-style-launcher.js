import { createTag } from '../../scripts/utils.js';

function getCaptionFromListItem(item) {
  const textParts = [];

  [...item.childNodes].some((node) => {
    if (node.nodeName === 'PICTURE') return false;
    if (node.nodeName === 'BR') return textParts.join('').trim().length > 0;
    textParts.push(node.textContent || '');
    return false;
  });

  return textParts.join(' ').replace(/\s+/g, ' ').trim();
}

function getLauncherData(el) {
  const rows = [...el.querySelectorAll(':scope > div')];
  const chooserContent = rows[0]?.firstElementChild;
  const heading = chooserContent?.querySelector('h4');
  const listItems = chooserContent
    ? [...chooserContent.children]
      .filter((child) => child.tagName === 'UL')
      .flatMap((list) => [...list.querySelectorAll(':scope > li')])
    : [];
  const previewRows = rows.slice(1);

  return {
    heading,
    items: listItems
      .map((item, index) => {
        const thumbnail = item.querySelector('picture');
        const preview = previewRows[index]?.querySelector('picture');

        if (!thumbnail || !preview) return null;

        return {
          caption: getCaptionFromListItem(item) || `Style ${index + 1}`,
          thumbnail: thumbnail.cloneNode(true),
          preview: preview.cloneNode(true),
        };
      })
      .filter(Boolean),
  };
}

function updateActiveItem(items, buttons, previewFrame, activeIndex) {
  buttons.forEach((button, index) => {
    const isActive = index === activeIndex;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });

  previewFrame.replaceChildren(items[activeIndex].preview.cloneNode(true));
}

function buildThumbnailItem(item, index, items, buttons, previewFrame) {
  const listItem = createTag('li', { class: 'firefly-style-launcher-thumbnail-item' });
  const button = createTag('button', {
    type: 'button',
    class: 'firefly-style-launcher-thumbnail',
    'aria-label': item.caption,
    'aria-pressed': 'false',
  });
  const media = createTag('div', { class: 'firefly-style-launcher-thumbnail-media' });
  const caption = createTag('span', { class: 'firefly-style-launcher-thumbnail-caption' }, item.caption);

  media.append(item.thumbnail.cloneNode(true));
  button.append(media, caption);
  button.addEventListener('click', () => updateActiveItem(items, buttons, previewFrame, index));

  buttons.push(button);
  listItem.append(button);

  return listItem;
}

export default async function init(el) {
  const { heading, items } = getLauncherData(el);

  if (!items.length) return;

  el.classList.add('con-block');

  const layout = createTag('div', { class: 'firefly-style-launcher-layout' });
  const sidebar = createTag('div', { class: 'firefly-style-launcher-sidebar' });
  const promptPlaceholder = createTag('div', { class: 'firefly-style-launcher-prompt-placeholder' });
  const copy = createTag('div', { class: 'copy' });
  const thumbnailsSection = createTag('div', { class: 'firefly-style-launcher-thumbnails' });
  const thumbnailList = createTag('ul', { class: 'firefly-style-launcher-thumbnail-list' });
  const previewPanel = createTag('div', { class: 'firefly-style-launcher-preview' });
  const promptContainer = createTag('div', { class: 'upload-marquee-prompt-container' });
  const previewFrame = createTag('div', { class: 'firefly-style-launcher-preview-frame' });
  const buttons = [];

  if (heading) {
    const headingEl = heading.cloneNode(true);
    headingEl.classList.add('firefly-style-launcher-heading');
    thumbnailsSection.append(headingEl);
  }

  items.forEach((item, index) => {
    thumbnailList.append(buildThumbnailItem(item, index, items, buttons, previewFrame));
  });

  thumbnailsSection.append(thumbnailList);
  copy.append(promptContainer);
  promptPlaceholder.append(copy);
  previewPanel.append(previewFrame);
  sidebar.append(promptPlaceholder, thumbnailsSection);
  layout.append(sidebar, previewPanel);

  el.replaceChildren(layout);
  updateActiveItem(items, buttons, previewFrame, 0);
}
