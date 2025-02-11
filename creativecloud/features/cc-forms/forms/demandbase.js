/* eslint-disable no-restricted-syntax */
/* eslint-disable no-continue */
/* eslint-disable class-methods-use-this */
import { createTag } from '../../../scripts/utils.js';

const SELECTOR_MENU = '.db-Menu';
const SELECTOR_MENU_ITEM = '.db-Menu-item';
const ATTRIBUTE_DEMAND_BASE_VALUE = 'data-demandbase-value';

class DemandBase {
  constructor(dbConf) {
    if (typeof dbConf !== 'object') {
      return;
    }
    this.element = dbConf;
    this.form = this.element.parentNode;
    this.endpoint = this.element.endpoint;
    this.apiKey = this.element.apiKey;
    this.delay = this.element.delay;
    this.industryMapping = this.element.industryMapping;
    this.fieldMapping = this.element.fieldMapping;
    this.payLoadMapping = this.element.payLoadMapping;

    this.registerDemandBaseHandlers();
  }

  waitAndFireDemandBase(e) {
    const content = e.target.value;
    switch (e.keyCode) {
      case 27:
      case 9:
        this.clearSuggestionList(e);
        break;
      case 13:
        this.handleEnterKey(e);
        break;
      case 38:
        this.handleUpArrow(e);
        break;
      case 40:
        this.handleDownArrow(e);
        break;
      default:
        setTimeout(
          this.doDemandBase.bind(this, e, content + e.key),
          this.delay,
        );
    }
  }

  clearSuggestionList(e) {
    this.popoverHide(e);
    e.target.removeAttribute('list');
  }

  handleEnterKey(e) {
    e.preventDefault();
    const itemHighlighted = e.target.parentNode.querySelector(`${SELECTOR_MENU} .is-highlighted`);
    if (itemHighlighted) {
      e.target.value = itemHighlighted.getAttribute(ATTRIBUTE_DEMAND_BASE_VALUE);
      const itemData = JSON.parse(itemHighlighted.getAttribute('data-demandbase-json'));
      this.prepopulateFields(itemData);
    }
    this.popoverHide(e);
  }

  handleUpArrow(e) {
    const list = this.getListElement(e);
    const items = list.querySelectorAll(SELECTOR_MENU_ITEM);
    const itemHighlighted = this.getItemHighlighted(list);
    let itemHighlight = items.length - 1;
    if (itemHighlighted > 0) {
      itemHighlight = itemHighlighted - 1;
    }
    if (items[itemHighlighted] instanceof HTMLElement) {
      items[itemHighlighted].classList.remove('is-highlighted');
    }
    items[itemHighlight].classList.add('is-highlighted');
  }

  handleDownArrow(e) {
    const list = this.getListElement(e);
    const items = list.querySelectorAll(SELECTOR_MENU_ITEM);
    const itemHighlighted = this.getItemHighlighted(list);
    let itemHighlight = 0;
    if (itemHighlighted > -1) {
      itemHighlight = itemHighlighted + 1;
    }
    if (itemHighlighted >= items.length - 1) {
      itemHighlight = 0;
    }

    if (items[itemHighlighted] instanceof HTMLElement) {
      items[itemHighlighted].classList.remove('is-highlighted');
    }

    items[itemHighlight].classList.add('is-highlighted');
  }

  getItemHighlighted(list) {
    const items = list.querySelectorAll('li');
    let highlightedItem = -1;
    items.forEach((item, index) => {
      if (item.classList.contains('is-highlighted')) {
        highlightedItem = index;
      }
    });
    return highlightedItem;
  }

  handleClickOutside(e) {
    if (!e.target.classList.contains('db-Popover')) {
      this.popoverHide(e);
      document.removeEventListener('click', this.handleClickOutside);
    }
  }

  popoverShow(e) {
    e.target.parentNode.classList.add('is-open');
    e.target.parentNode.querySelector('.db-Popover')?.classList
      .add('is-open');
    document.addEventListener('click', this.handleClickOutside.bind(this));
  }

  popoverHide(e) {
    e.target.parentNode.classList.remove('is-open');
    e.target.parentNode.querySelector('.db-Popover')?.classList
      .remove('is-open');
  }

  doDemandBase(e, contentThen) {
    const contentNow = e.target.value;
    if (contentNow !== contentThen) return;
    const payload = {
      auth: this.apiKey,
      term: contentNow,
    };
    fetch(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.picks?.length) {
          this.fillList(e, json);
          this.popoverShow(e);
        }
      })
      .catch(() => { });
  }

  getListElement(e) {
    let list = e.target.parentNode.querySelector(SELECTOR_MENU);
    if (!list) {
      const popover = createTag('div', { class: 'db-Popover is-open' });
      popover.style.marginTop = `${e.target.offsetHeight + 5}px`;
      list = createTag('ul', { class: 'db-Menu' });
      list.setAttribute('role', 'listbox');
      list.style.width = `${e.target.offsetWidth}px`;
      popover.appendChild(list);
      e.target.parentNode.appendChild(popover);
    }
    return list;
  }

  fillList(e, json) {
    const list = this.getListElement(e);
    list.innerHTML = '';
    json.picks.forEach((item) => {
      const li = createTag('li', { class: 'db-Menu-item' });
      const label = createTag('div', { class: 'db-Menu-itemLabel' });
      li.setAttribute('role', 'option');
      li.setAttribute(ATTRIBUTE_DEMAND_BASE_VALUE, item.company_name);
      li.setAttribute('data-demandbase-json', JSON.stringify(item));
      label.innerHTML = `${item.company_name}<div>${item.street_address || ''} ${item.city || ''} ${item.country_name || ''}</div>`;
      li.appendChild(label);
      list.appendChild(li);
    });
    const listItems = list.querySelectorAll('[data-demandbase-value]');
    listItems.forEach((item) => {
      item.addEventListener('click', () => {
        const itemData = JSON.parse(item.getAttribute('data-demandbase-json'));
        e.target.parentNode.querySelector('.cc-form-component[name="orgname"]').value = item.getAttribute(ATTRIBUTE_DEMAND_BASE_VALUE);
        this.popoverHide(e);
        this.prepopulateFields(itemData);
      });
    });
  }

  updateSelectField(selectEl, fieldValue) {
    const optionMatch = selectEl.querySelector(`option[value="${fieldValue}"]`);
    if (!optionMatch) return;
    selectEl.querySelectorAll('option[selected]')?.forEach((o) => o.removeAttribute('selected'));
    selectEl.selectedIndex = optionMatch.index;
    if (selectEl.id === 'country') selectEl?.dispatchEvent(new Event('change', { bubbles: true }));
  }

  handleSelectField(selectEl, key, fieldValue) {
    if (key === 'orgsize') {
      this.handleOrgSizeSelect(selectEl, fieldValue);
      return;
    }
    this.updateSelectField(selectEl, fieldValue);
  }

  handleOrgSizeSelect(selectEl, fieldValue) {
    const options = selectEl.querySelectorAll('option');
    for (const opt of options) {
      if (!opt.value) continue;
      if (opt.value.includes('-')) {
        const [lr, ur] = opt.value.split('-').map(Number);
        if (fieldValue >= lr && fieldValue <= ur) {
          this.updateSelectField(selectEl, opt.value);
          break;
        }
      } else if (opt.value.endsWith('+') && fieldValue >= parseInt(opt.value, 10)) {
        this.updateSelectField(selectEl, opt.value);
        break;
      }
    }
  }

  async waitForDataRender(el) {
    return new Promise((resolve) => {
      let attempts = 0;
      function checkFields(e) {
        attempts += 1;
        if (attempts >= 25) resolve();
        else if (e.hasAttribute('data-loading')) setTimeout(() => { checkFields(e); }, 200);
        else resolve();
      }
      checkFields(el);
    });
  }

  prepopulateFields(itemData) {
    const { fieldMapping } = this;
    const keyArr = ['country', ...Object.keys(fieldMapping)];
    fieldMapping.country = 'country';

    keyArr.forEach(async (key) => {
      const fieldName = fieldMapping[key];
      if (!fieldName || fieldName === 'company_name' || /[.,]/.test(fieldName)) return;
      const fieldValue = this.convert(itemData[fieldName], fieldName);
      const inputEl = this.form.querySelector(`input.cc-form-component[name=${key}]`);
      const selectEl = this.form.querySelector(`select.cc-form-component[name=${key}]`);

      if (key === 'country' && selectEl) {
        if (selectEl.disabled) return;
        this.updateSelectField(selectEl, fieldValue);
        return;
      }

      if (key === 'state' && selectEl) {
        await this.waitForDataRender(selectEl);
      }

      if (inputEl) {
        inputEl.value = fieldValue;
      } else if (selectEl) {
        this.handleSelectField(selectEl, key, fieldValue);
      }
    });
  }

  convert(fieldValue, fieldName) {
    let convertedValue = fieldValue;
    if (fieldName === 'industry') {
      convertedValue = this.industryMapping[fieldValue];
    }
    if (!convertedValue || convertedValue === 'Unknown') convertedValue = '';
    return convertedValue;
  }

  registerDemandBaseHandlers() {
    const elem = this.form.querySelector('input.cc-form-component[name="orgname"]');
    if (!(elem instanceof HTMLElement)) {
      return;
    }
    elem.setAttribute('autocomplete', 'off');
    elem.addEventListener('keydown', (e) => this.waitAndFireDemandBase(e));
  }
}
export default DemandBase;
