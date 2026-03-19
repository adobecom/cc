import { createTag } from '../../scripts/utils.js';

function normalizeText(text) {
  return (text || '').replace(/\s+/g, ' ').trim();
}

function getCaptionFromListItem(item) {
  const textParts = [];
  [...item.childNodes].some((node) => {
    if (node.nodeName === 'PICTURE') return false;
    if (node.nodeName === 'BR') return textParts.join('').trim().length > 0;
    textParts.push(node.textContent || '');
    return false;
  });
  return normalizeText(textParts.join(' '));
}

function getInlinePromptFromListItem(item, caption) {
  const fullText = normalizeText(item.textContent);

  if (!caption || !fullText.startsWith(caption)) return '';

  return fullText.slice(caption.length).trim();
}

function getPromptTextarea(el) {
  return el.querySelector('#promptInput, .ex-unity-widget textarea');
}

function setPromptValue(el, promptText) {
  const promptInput = getPromptTextarea(el);
  if (!promptInput) return;
  promptInput.value = promptText || '';
}

function parseStyleItems(chooserContent) {
  const listItems = [...(chooserContent?.querySelectorAll(':scope > ul > li') || [])];
  const items = [];
  let pendingPromptItem = null;

  listItems.forEach((item) => {
    const thumbnail = item.querySelector('picture');

    if (thumbnail) {
      const caption = getCaptionFromListItem(item);
      const inlinePrompt = getInlinePromptFromListItem(item, caption);
      const styleItem = {
        caption: caption || `Style ${items.length + 1}`,
        prompt: inlinePrompt,
        thumbnail: thumbnail.cloneNode(true),
      };

      items.push(styleItem);
      pendingPromptItem = inlinePrompt ? null : styleItem;
      return;
    }

    if (pendingPromptItem) {
      pendingPromptItem.prompt = normalizeText(item.textContent);
      pendingPromptItem = null;
    }
  });

  return items;
}

function getLauncherData(el) {
  const rows = [...el.querySelectorAll(':scope > div')];
  const chooserContent = rows[0]?.firstElementChild;
  const heading = chooserContent?.querySelector('h4');
  const previewRows = rows.slice(1);
  const styleItems = parseStyleItems(chooserContent);

  return {
    heading,
    items: styleItems
      .map((item, index) => {
        const previewPictures = [...(previewRows[index]?.querySelectorAll('picture') || [])];
        const preview = previewPictures[previewPictures.length - 1];

        if (!preview) return null;

        const previewNode = preview.cloneNode(true);
        if (index === 0) {
          const previewImage = previewNode.querySelector('img');
          if (previewImage) {
            previewImage.setAttribute('loading', 'eager');
            previewImage.setAttribute('fetchpriority', 'high');
          }
        }

        return {
          caption: item.caption,
          prompt: item.prompt,
          thumbnail: item.thumbnail.cloneNode(true),
          preview: previewNode,
        };
      })
      .filter(Boolean),
  };
}

function updateActiveItem(el, items, buttons, previewFrame, activeIndex) {
  const activeItem = items[activeIndex];
  if (!activeItem) return;

  buttons.forEach((button, index) => {
    const isActive = index === activeIndex;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });

  previewFrame.replaceChildren(activeItem.preview.cloneNode(true));
  setPromptValue(el, activeItem.prompt);
}

function buildThumbnailItem(item, index, onSelect, buttons) {
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
  button.addEventListener('click', () => onSelect(index));

  buttons.push(button);
  listItem.append(button);

  return listItem;
}

export default function init(el) {
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
  let activeIndex = 0;

  const handleSelection = (nextIndex) => {
    activeIndex = nextIndex;
    updateActiveItem(el, items, buttons, previewFrame, activeIndex);
  };

  if (heading) {
    const headingEl = heading.cloneNode(true);
    headingEl.classList.add('firefly-style-launcher-heading');
    thumbnailsSection.append(headingEl);
  }

  items.forEach((item, index) => {
    thumbnailList.append(buildThumbnailItem(item, index, handleSelection, buttons));
  });

  thumbnailsSection.append(thumbnailList);
  copy.append(promptContainer);
  promptPlaceholder.append(copy);
  previewPanel.append(previewFrame);
  sidebar.append(promptPlaceholder, thumbnailsSection);
  layout.append(sidebar, previewPanel);

  el.replaceChildren(layout);
  handleSelection(0);

  if (!getPromptTextarea(el)) {
    const observer = new MutationObserver(() => {
      if (!getPromptTextarea(el)) return;
      setPromptValue(el, items[activeIndex]?.prompt || '');
      observer.disconnect();
    });

    observer.observe(el, { childList: true, subtree: true });
  }
}
