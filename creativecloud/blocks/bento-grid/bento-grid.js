import { createTag } from '../../scripts/utils.js';

const LANA_OPTIONS = { tags: 'animated-slot-text', errorType: 'i' };

const VIEW_TYPES = ['mobile', 'tablet', 'desktop'];
const MIN_ITEMS_TARGET = 15;

function logError(message, error) {
  window.lana?.log(`Photo gallery ${message}: ${error}`, LANA_OPTIONS);
}

function parseConfigBlock(configContainer) {
  const configMap = {};

  Array.from(configContainer.children).forEach((viewportDiv) => {
    const paragraphs = Array.from(viewportDiv.querySelectorAll('p'));

    if (paragraphs.length === 0) return;

    let currentViewport = null;
    const currentProps = {};

    paragraphs.forEach((p) => {
      const text = p.textContent.trim();
      const separatorIndex = text.indexOf('=');
      if (separatorIndex === -1) return;
      const key = text.slice(0, separatorIndex).trim().toLowerCase();
      const val = text.slice(separatorIndex + 1).trim();
      if (key === 'viewport') {
        currentViewport = val.toLowerCase();
      } else {
        const rowMatch = key.match(/^r-?(\d+)--(.+)/);
        if (rowMatch) {
          const rowNum = parseInt(rowMatch[1], 10);
          const prop = rowMatch[2];
          if (!currentProps[rowNum]) {
            currentProps[rowNum] = { left: 0 };
          }

          if (prop === 'left') {
            currentProps[rowNum].left = parseFloat(val);
          } else if (prop === 'start-index') {
            currentProps[rowNum].startIndex = parseInt(val, 10);
          }
        }
      }
    });
    if (currentViewport) {
      configMap[currentViewport] = currentProps;
    }
  });
  return configMap;
}

function extractPictures(container) {
  if (!container) return [];
  return Array.from(container.children).map((child) => child.innerHTML);
}

function resolveViewData(targetType, availableDataMap) {
  const fallbackOrder = [targetType, 'desktop', 'tablet', 'mobile'];
  const foundKey = fallbackOrder.find((key) => availableDataMap[key]);
  return availableDataMap[foundKey] || {};
}

const createViewElement = (type, config, allRowsContent) => {
  const wrapper = document.createElement('div');
  wrapper.className = `grid-view view-${type}`;
  const rowsFragment = document.createDocumentFragment();

  allRowsContent.forEach((originalRowContent, index) => {
    const rowNum = index + 1;
    const rowConfig = config[rowNum] || { left: 0 };

    let rowContent = originalRowContent;
    if (rowConfig.startIndex && rowConfig.startIndex > 0 && originalRowContent.length > 0) {
      const zeroBasedIndex = rowConfig.startIndex - 1;
      const rotation = zeroBasedIndex % originalRowContent.length;
      rowContent = [
        ...originalRowContent.slice(rotation),
        ...originalRowContent.slice(0, rotation),
      ];
    }

    const multiplier = Math.ceil(MIN_ITEMS_TARGET / (rowContent.length || 1));
    const rowDiv = document.createElement('div');
    rowDiv.className = 'grid-row';

    if (rowConfig.left) {
      rowDiv.style.marginLeft = `${rowConfig.left}px`;
    }

    const itemsFragment = document.createDocumentFragment();
    for (let i = 0; i < multiplier; i += 1) {
      const loadMode = i === 0 ? 'eager' : 'lazy';

      rowContent.forEach((html) => {
        const temp = document.createElement('div');
        temp.innerHTML = html;
        const pic = temp.querySelector('picture');

        if (pic) {
          const item = document.createElement('div');
          item.className = 'grid-item';

          const finalPic = pic.cloneNode(true);
          const img = finalPic.querySelector('img');
          if (img) {
            img.setAttribute('loading', loadMode);
            img.loading = loadMode;
          }

          item.appendChild(finalPic);
          itemsFragment.appendChild(item);
        }
      });
    }

    rowDiv.appendChild(itemsFragment);
    rowsFragment.appendChild(rowDiv);
  });

  wrapper.appendChild(rowsFragment);
  return wrapper;
};

function decorateContent(el) {
  try {
    if (!el) return;

    const children = Array.from(el.children);
    const configContainer = children[0];
    const rowContainers = children.slice(1);

    if (!configContainer || rowContainers.length === 0) {
      logError('Photo Gallery: Missing required structure (Config, Row content).');
      return;
    }

    const configMap = parseConfigBlock(configContainer);

    const allRowsContent = rowContainers.map((container) => extractPictures(container));
    el.innerHTML = '';
    const foreground = createTag('div', { class: 'foreground' });
    el.setAttribute('role', 'region');
    el.setAttribute('aria-label', 'Image Gallery');

    const fragment = document.createDocumentFragment();

    VIEW_TYPES.forEach((type) => {
      const config = resolveViewData(type, configMap);
      if (allRowsContent.length > 0) {
        const viewEl = createViewElement(type, config, allRowsContent);
        fragment.appendChild(viewEl);
      }
    });
    foreground.appendChild(fragment);
    el.appendChild(foreground);
  } catch (err) {
    logError('Failed to decorate Content', err);
  }
}

export default function init(el) {
  try {
    el.classList.add('con-block');
    decorateContent(el);
  } catch (err) {
    window.lana?.log(`Photo banner Init Error: ${err}`, LANA_OPTIONS);
  }
}
