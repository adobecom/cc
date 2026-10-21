/* eslint-disable chai-friendly/no-unused-expressions */
/* eslint-disable max-len */
import ReactiveStore from './reactiveStore.js';
import { getNonprofitIconTag, NONPRFIT_ICONS } from './icons.js';

export default function nonprofitSelect(props) {
  const {
    createTag,
    name,
    label,
    placeholder,
    noOptionsText = window.mph['nonprofit-no-search-result-found'],
    loadingText = window.mph['nonprofit-loading'],
    required = true,
    disabled = false,
    hideIcon = false,
    options = [],
    store,
    debounce,
    labelKey = 'label',
    valueKey = 'value',
    renderOption,
    footerTag,
  } = props;

  let onInput;
  let onSelect;

  const optionsStore = store || new ReactiveStore(options);
  let localOptions = [...options];
  let localSelection = null;

  const controlTag = createTag('div', { class: 'np-control' });
  const labelTag = createTag('label', { class: 'np-label', for: name }, label);
  const searchTag = createTag('input', {
    class: 'np-input np-select-search',
    type: 'text',
    placeholder,
    'data-for': name,
  });
  const valueTag = createTag('input', {
    class: `np-select-value${required ? ' np-required-field' : ''}`,
    name,
    type: 'hidden',
  });

  if (required) {
    searchTag.setAttribute('required', 'required');
    valueTag.setAttribute('required', 'required');
  }
  if (disabled) {
    searchTag.setAttribute('disabled', 'disabled');
    valueTag.setAttribute('disabled', 'disabled');
  }

  const listContainerTag = createTag('div', { class: 'np-select-list-container' });
  const listTag = createTag('ul', { class: 'np-select-list', 'data-for': name, tabindex: -1 });
  const liveRegionTag = createTag('div', { class: 'np-sr-only', 'aria-live': 'polite', role: 'status' });

  let searchTimeout;
  let abortController;

  const showList = () => {
    listContainerTag.style.display = 'block';
  };

  const hideList = () => {
    abortController?.abort();
    listTag.scrollTop = 0;
    listContainerTag.style.display = 'none';

    // Handle loss of focus depending on whether there's a selection
    if (!localSelection) {
      searchTag.value = '';
      if (!store) {
        optionsStore.update(localOptions);
      }
    } else {
      searchTag.value = localSelection[labelKey];
      const selectionToRestore = localSelection;
      setTimeout(() => {
        if (document.body.contains(searchTag)) optionsStore.update([selectionToRestore]);
      }, 0);
    }
  };

  let hasNewInput = false;

  // Search onChange
  searchTag.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    abortController?.abort();

    hasNewInput = true;

    abortController = new AbortController();
    searchTimeout = setTimeout(() => {
      onInput && onInput(searchTag.value, abortController);
      if (!store) {
        const filteredOptions = localOptions.filter((option) => option[labelKey].toLowerCase().includes(searchTag.value.toLowerCase()));
        optionsStore.update(filteredOptions);
      }
      showList();
    }, debounce);
  });

  let focusedFromList = false;
  let suppressShowOnFocus = false;
  searchTag.addEventListener('focus', () => {
    if (suppressShowOnFocus) {
      suppressShowOnFocus = false;
      return;
    }
    if (debounce && !searchTag.value) return;
    if (!focusedFromList) searchTag.select();
    else focusedFromList = false;
    showList();
  });

  searchTag.addEventListener('keydown', (ev) => {
    if (ev.code !== 'ArrowDown') return;
    ev.preventDefault();
    if (ev.code === 'ArrowDown') {
      const listItem = listContainerTag.querySelector('.np-select-item');
      if (listItem) listItem.focus();
    }
  });

  let rerendering = false;
  const focusOut = (ev) => {
    if (rerendering) return;
    if (!ev.relatedTarget) {
      hideList();
      return;
    }
    const selectTag = ev.relatedTarget.closest('.np-select-list-tag');
    // If the newly focused item is part of the select, don't hide list
    if (selectTag || ev.relatedTarget === searchTag) return;
    hideList();
  };

  searchTag.addEventListener('focusout', focusOut);

  let keyboardFocusedId;

  // Render select elements
  optionsStore.subscribe((storeOptions, loading) => {
    rerendering = true;

    // Empty the list
    listTag.replaceChildren();

    storeOptions.forEach((option) => {
      const itemTag = createTag('li', {
        class: 'np-select-list-tag np-select-item',
        tabindex: -1,
        'data-value': option[valueKey],
      });

      if (renderOption) {
        renderOption(option, itemTag);
      } else {
        itemTag.textContent = option[labelKey];
      }

      // Keyboard navigation and selection handing

      const selectItem = () => {
        onSelect && onSelect(option);
        searchTag.value = option[labelKey];
        valueTag.value = option[valueKey];
        valueTag.dispatchEvent(new Event('input'));
        localSelection = option;
        hasNewInput = false;
        const shouldRestoreFocus = document.activeElement === itemTag;
        hideList();
        if (shouldRestoreFocus) {
          suppressShowOnFocus = true;
          searchTag.focus();
        }
      };

      itemTag.addEventListener('keydown', (ev) => {
        if (ev.code === 'Tab') return;
        if (!['ArrowDown', 'ArrowUp', 'Enter'].includes(ev.code)) {
          focusedFromList = true;
          searchTag.focus();
          return;
        }
        ev.preventDefault();

        if (ev.code === 'Enter') {
          selectItem();
          return;
        }

        let sibling;
        if (ev.code === 'ArrowDown') {
          sibling = ev.target.nextElementSibling;
        }
        if (ev.code === 'ArrowUp') {
          sibling = ev.target.previousElementSibling;
        }
        if (sibling && !sibling.classList.contains('np-select-loader')) {
          sibling.focus();
          return;
        }

        if (ev.code === 'ArrowDown' && footerTag) {
          footerTag.querySelector('a, button, [tabindex]')?.focus();
        }
      });

      itemTag.addEventListener('click', selectItem);

      itemTag.addEventListener('focus', (ev) => {
        keyboardFocusedId = ev.target.getAttribute('data-value');
      });

      itemTag.addEventListener('focusout', (ev) => {
        if (rerendering) return;
        keyboardFocusedId = null;
        focusOut(ev);
      });

      listTag.append(itemTag);
    });

    const infoTagKeydown = () => {
      focusedFromList = true;
      searchTag.focus();
    };

    if (!loading && storeOptions.length === 0) {
      const noOptionsTag = createTag(
        'div',
        { class: 'np-select-list-tag np-select-no-options', tabindex: -1 },
        noOptionsText,
      );
      noOptionsTag.addEventListener('keydown', infoTagKeydown);
      noOptionsTag.addEventListener('focusout', focusOut);
      listTag.append(noOptionsTag);
    }

    if (loading) {
      const loadingTag = createTag(
        'div',
        { class: 'np-select-list-tag np-select-loader', tabindex: -1 },
        `${loadingText}...`,
      );
      loadingTag.addEventListener('keydown', infoTagKeydown);
      loadingTag.addEventListener('focusout', focusOut);
      listTag.append(loadingTag);
    }

    if (keyboardFocusedId) {
      const itemToFocus = listTag.querySelector(`li[data-value='${keyboardFocusedId}']`);
      if (itemToFocus) itemToFocus.focus();
    }

    if (loading) {
      liveRegionTag.textContent = `${loadingText}...`;
    } else if (storeOptions.length === 0) {
      liveRegionTag.textContent = noOptionsText;
    } else {
      liveRegionTag.textContent = `${storeOptions.length} result${storeOptions.length === 1 ? '' : 's'}, use arrow keys to navigate`;
    }

    rerendering = false;
  });

  listContainerTag.append(listTag);
  if (footerTag) {
    listContainerTag.append(footerTag);
    footerTag.addEventListener('focusout', focusOut);
    footerTag.addEventListener('keydown', (ev) => {
      if (ev.code !== 'ArrowUp') return;
      ev.preventDefault();
      const items = listTag.querySelectorAll('.np-select-item');
      items[items.length - 1]?.focus();
    });
  }

  controlTag.append(labelTag, searchTag, valueTag, listContainerTag, liveRegionTag);

  if (!hideIcon) {
    const arrowIconTag = getNonprofitIconTag(NONPRFIT_ICONS.CHEVRON_DOWN);
    controlTag.append(arrowIconTag);
  }

  controlTag.onInput = (handler) => {
    onInput = handler;
  };

  controlTag.onSelect = (handler) => {
    onSelect = handler;
  };

  controlTag.onScroll = (handler) => {
    listTag.addEventListener('scroll', (ev) => {
      abortController = new AbortController();
      handler(ev.target, abortController, hasNewInput);
    });
  };

  controlTag.enable = () => {
    searchTag.removeAttribute('disabled');
    valueTag.removeAttribute('disabled');
  };

  controlTag.clear = (withFocus = true) => {
    searchTag.value = '';
    valueTag.value = '';
    valueTag.dispatchEvent(new Event('input'));
    localSelection = null;
    if (!store) {
      optionsStore.update(localOptions);
    }
    if (withFocus) {
      searchTag.focus();
    }
  };

  controlTag.updateOptions = (newOptions) => {
    optionsStore.update(newOptions);
    localOptions = newOptions;
  };

  controlTag.getValue = () => valueTag.value;

  return controlTag;
}
