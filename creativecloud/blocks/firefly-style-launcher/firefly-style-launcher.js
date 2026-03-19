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

function getPromptTextarea(el) {
  return el.querySelector('#promptInput, .ex-unity-widget textarea');
}

function setPromptValue(el, promptText) {
  const promptInput = getPromptTextarea(el);
  if (!promptInput) return false;
  promptInput.value = promptText || '';
  return true;
}

function getLauncherData(el) {
  const rows = [...el.querySelectorAll(':scope > div')];
  const chooserContent = rows[0]?.firstElementChild;
  const heading = chooserContent?.querySelector('h4');
  const previewRows = rows.slice(1);
  const items = [];
  let pendingItems = [];

  if (chooserContent) {
    [...chooserContent.children].forEach((child) => {
      if (child.tagName === 'UL') {
        const listItems = [...child.querySelectorAll(':scope > li')];
        const nextItems = listItems.map((item) => ({
          caption: getCaptionFromListItem(item),
          prompt: '',
          thumbnail: item.querySelector('picture')?.cloneNode(true),
        }));

        items.push(...nextItems);
        pendingItems = nextItems;
      } else if (child.tagName === 'P' && pendingItems.length) {
        const prompt = child.textContent.trim();
        pendingItems.forEach((item) => {
          item.prompt = prompt;
        });
        pendingItems = [];
      }
    });
  }

  return {
    heading,
    items: items
      .map((item, index) => {
        const previewPictures = [...(previewRows[index]?.querySelectorAll('picture') || [])];
        const preview = previewPictures[previewPictures.length - 1];

        if (!item.thumbnail || !preview) return null;

        return {
          caption: item.caption || `Style ${index + 1}`,
          prompt: item.prompt,
          thumbnail: item.thumbnail.cloneNode(true),
          preview: preview.cloneNode(true),
        };
      })
      .filter(Boolean),
  };
}

function updateActiveItem(el, items, buttons, previewFrame, activeIndex) {
  el.dataset.activePromptIndex = String(activeIndex);

  buttons.forEach((button, index) => {
    const isActive = index === activeIndex;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });

  previewFrame.replaceChildren(items[activeIndex].preview.cloneNode(true));
  setPromptValue(el, items[activeIndex].prompt);
}

function buildThumbnailItem(el, item, index, items, buttons, previewFrame) {
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
  button.addEventListener('click', () => updateActiveItem(el, items, buttons, previewFrame, index));

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
    thumbnailList.append(buildThumbnailItem(el, item, index, items, buttons, previewFrame));
  });

  thumbnailsSection.append(thumbnailList);
  copy.append(promptContainer);
  promptPlaceholder.append(copy);
  previewPanel.append(previewFrame);
  sidebar.append(promptPlaceholder, thumbnailsSection);
  layout.append(sidebar, previewPanel);

  el.replaceChildren(layout);
  updateActiveItem(el, items, buttons, previewFrame, 0);

  if (!getPromptTextarea(el)) {
    const observer = new MutationObserver(() => {
      if (!getPromptTextarea(el)) return;
      const activeIndex = Number(el.dataset.activePromptIndex || 0);
      setPromptValue(el, items[activeIndex]?.prompt || '');
      observer.disconnect();
    });

    observer.observe(el, { childList: true, subtree: true });
  }
}
