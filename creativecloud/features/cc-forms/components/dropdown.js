import { createTag } from '../../../scripts/utils.js';

const SELECTOR_DROPDOWN = '.spectrum-Dropdown';
const CLASS_IS_SELECTED = 'is-selected';
const CLASS_IS_PLACEHOLDER = 'is-placeholder';
const CLASS_HIDDEN = 'is-hidden';
const ATTR_DROPDOWN_TYPE = 'data-dropdown-type';
const ATTR_DROPDOWN_PARENT = 'data-dropdown-parent';
const ATTR_DROPDOWN_SOURCE = 'data-dropdown-source';
const ATTR_DROPDOWN_CONFIGURE_FOR = 'data-configureFor';
const ATTR_DROPDOWN_NAME = 'data-dropdown-name';
const ATTR_DROPDOWN_LABEL = 'data-dropdown-label';
const ATTR_SORT_PROPERTY = 'data-sort-property';
const SELECTOR_MENU = '.spectrum-Menu';
const SELECTOR_MENU_ITEM = '.spectrum-Menu-item';
const SELECTOR_DROPDOWN_LABEL = '.spectrum-Dropdown-label';
const SELECTOR_DROPDOWN_TRIGGER = '.spectrum-Dropdown-trigger';
const SELECTOR_DROPDOWN_POPOVER = '.spectrum-Dropdown-popover';
const DROPDOWN_HIDDEN_ID = 'ptDownloadForm';
const DROPDOWN_HIDDEN_ATTR_PLABEL = 'data-plabel';
const DATA_ODIN_ENVIRONMENT = 'data-odinEnvironment';
const COUNTRIES_ALL_API = 'listallcountries';
const REGIONS_BY_PATH_API = 'listallregionsbypath;path=';
const COUNTRIES_BY_PATH_API = 'listallcountriesbypath;path=';
const GRAPHQL_ENDPOINT = 'graphql/execute.json/acom/';
const DATA_ODIN_US_PATH = '/content/dam/acom/country/us/en/';
const SLASH = '/';

// Dropdown
class Dropdown {
    data = [];
    constructor(formEl, config) {
        this.form = formEl;
        this.fieldConfig = config;
        this.dropdown = this.createDropdown();
        // this.type = this.dropdown.getAttribute(ATTR_DROPDOWN_TYPE);
        // this.parentName = this.dropdown.getAttribute(ATTR_DROPDOWN_PARENT);
        this.parent = false;
        this.child = false;
        // this.configureFor = this.dropdown.getAttribute(ATTR_DROPDOWN_CONFIGURE_FOR) || false;
        // this.source = this.dropdown.getAttribute(ATTR_DROPDOWN_SOURCE) || false;
        // if (this.source && this.form && this.form.getAttribute(DATA_ODIN_ENVIRONMENT) && this.source.indexOf('https://') === -1) {
        //     this.source = this.form.getAttribute(DATA_ODIN_ENVIRONMENT) + this.source;
        // }
        // this.name = this.dropdown.getAttribute(ATTR_DROPDOWN_NAME);
        // this.label = this.dropdown.getAttribute(ATTR_DROPDOWN_LABEL);
        // this.sortProperty = this.dropdown.getAttribute(ATTR_SORT_PROPERTY);
        // this.elemLabel = this.dropdown.querySelector(SELECTOR_DROPDOWN_LABEL);
        // this.elemButton = this.dropdown.querySelector(SELECTOR_DROPDOWN_TRIGGER);
        // this.value = this.elemButton.value;
        this.isOpen = false;
        this.valid = true;
        this.keysSoFar = '';
        this.searchIndex = -1;
        this.activeItem = '';
        this.required = !!(this.dropdown.getAttribute('data-form-required'));
        // this.init();
    }

    createDropdown() {
      const i = createTag('select');
      const d = createTag('div', { class: 'form-item' }, i);
      this.form.append(d);
      const cfgKeys = Object.keys(this.fieldConfig);
      if (cfgKeys.includes('required') || !cfgKeys.includes('optional')) i.setAttribute('required', 'required');
      [...cfgKeys].forEach((ck) => {
        switch(ck) {
          case 'label':
            const l = this.fieldConfig[ck].innerText.trim();
            const lel = createTag('label', {}, l);
            d.prepend(lel);
            i.setAttribute('aria-label', l);
            break;
          case 'disclaimer':
            const disclaimerDiv = createTag('div', {}, this.fieldConfig[ck].innerText.trim());
            d.append(disclaimerDiv);
            break;
          case 'placeholder':
            i.setAttribute('placeholder', this.fieldConfig[ck].innerText.trim());
            break
          case 'read-only':
            i.setAttribute('readonly', 'readonly');
            break;
          case 'error-required':
            const er = createTag('div', {class: CLASS_HIDDEN}, this.fieldConfig[ck].innerText.trim());
            d.append(er);
            break;
          case 'error-validation':
            const ev = createTag('div', {class: CLASS_HIDDEN}, this.fieldConfig[ck].innerText.trim());
            d.append(ev);
            break;
        }
      });
      return i;

    }

    isValid() {
        this.value = this.elemButton.value;
        this.valid = false;

        if (!this.required) {
            this.valid = true;
        }
        if (this.required && !!(this.value)) {
            this.valid = true;
        }
        if (this.required && this.dropdown.classList.contains('is-disabled')) {
            this.valid = true;
        }

        this.form.setAttribute('data-valid', this.valid);
        if (this.valid) {
            this.dropdown.classList.remove('is-invalid');
            this.elemButton.classList.remove('is-invalid');
        } else {
            this.dropdown.classList.add('is-invalid');
            this.elemButton.classList.add('is-invalid');
        }
        return this.valid;
    }

    init() {
        if (this.type === 'dependent' && this.parentName) {
            this.listenParentChanges();
            this.updateDropdown();
        }

        if (this.type === 'independent' && this.source) {
            this.loadData();
        }
        if (this.form) {
            this.form.addEventListener('checkValidation', () => this.isValid());
        }
        this.elemButton.addEventListener('blur', () => this.isValid());

        this.handleClickClose();
        this.handleClick();
        this.DropKeyEvents();

        if (this.name === 'productsku') {
            this.handleProductSKUChange();
        }

        if (this.name === 'purchaseintent') {
            this.handlePurchaseIntentChange();
        }
    }

    handlePurchaseIntentChange() {
        if (!window.digitalData) return;
        const primaryProduct = window.digitalData.primaryProduct
            ? window.digitalData.primaryProduct : {};
        const productInfo = primaryProduct.productInfo ? primaryProduct.productInfo : {};
        productInfo.purchaseIntent = 'NotAnswered';
        primaryProduct.productInfo = productInfo;
        window.digitalData.primaryProduct = primaryProduct;
        this.dropdown.addEventListener('change', (event) => {
            event.preventDefault();
            if (event.detail && event.detail.label) {
                if (event.detail.label === 'Yes') {
                    window.digitalData.primaryProduct.productInfo.purchaseIntent = 'Yes';
                } else if (event.detail.label === 'No') {
                    window.digitalData.primaryProduct.productInfo.purchaseIntent = 'No';
                }
            }
        });
    }

    handleProductSKUChange() {
        this.dropdown.addEventListener('change', (event) => {
            event.preventDefault();
            if (!window.digitalData) return;
            const elem = event.target.closest(SELECTOR_DROPDOWN);
            const hiddenEl = elem.querySelector('#ptDownloadForm');
            const plabel = hiddenEl && hiddenEl.hasAttribute(DROPDOWN_HIDDEN_ATTR_PLABEL)
                ? hiddenEl.getAttribute(DROPDOWN_HIDDEN_ATTR_PLABEL) : '';
            const selectedFile = event.detail && event.detail.label
                ? event.detail.label.trim() : '';
            const daall = plabel.concat(' | ', selectedFile);
            const primaryProduct = window.digitalData.primaryProduct
                ? window.digitalData.primaryProduct : {};
            const productInfo = primaryProduct.productInfo ? primaryProduct.productInfo : {};
            productInfo.productName = daall;
            primaryProduct.productInfo = productInfo;
            window.digitalData.primaryProduct = primaryProduct;
        });
    }

    handleClickClose() {
        document.addEventListener('click', (event) => {
            const dropdowns = this.form.querySelectorAll('.spectrum-Dropdown');
            Array.prototype.forEach.call(dropdowns, (drop) => {
                if (!drop.contains(event.target)) {
                    this.closeDropdown(drop);
                    if (this.activeItem) {
                        this.deFocusElement(this.activeItem);
                        this.activeItem = '';
                    }
                }
            });
        });
    }

    handleClick() {
        this.dropdown.addEventListener('click', (event) => {
            event.preventDefault();
            const elem = event.target.closest(SELECTOR_DROPDOWN);
            const dropdownTrigger = elem.querySelector(SELECTOR_DROPDOWN_TRIGGER);
            const dropdownLabel = elem.querySelector(SELECTOR_DROPDOWN_LABEL);
            const menuItem = event.target.closest(SELECTOR_MENU_ITEM);

            if (dropdownTrigger) {
                if (!this.dropdown.classList.contains('is-open')) {
                    this.toggleOpen();
                } else {
                    this.closeDropdown(this.dropdown);
                }
            }
            if (this.activeItem) {
                this.deFocusElement(this.activeItem);
                this.activeItem = '';
            }

            if (menuItem) {
                const menuLabel = menuItem.querySelector('.spectrum-Menu-itemLabel');
                if (!menuLabel && !dropdownLabel) {
                    return;
                }
                dropdownLabel.innerHTML = menuLabel.innerHTML;
                event.stopPropagation();
                this.handleMenuChange(menuItem.parentElement, menuItem);
            }
        });
    }

    loadData() {
        window.fetch(this.source)
            .then(response => response.json())
            .then((data) => {
                this.dataMapping(data);
            })
            .catch((error) => {});
    }

    dataMapping(data) {
        let dataMapped;
        switch (this.configureFor) {
            case 'productsku':
                dataMapped = this.mapProductSku(data);
                this.populatePlabel(data);
                break;
            case 'country':
                dataMapped = this.sortCountries(data.data[Object.keys(data.data)[0]].items);
                break;
            default:
                dataMapped = this.sortList(data.data[Object.keys(data.data)[0]].items);
        }
        this.updateList(dataMapped);
    }

    mapProductSku(data) {
        const items = data.data[Object.keys(data.data)[0]].items[0].version[0].language_os;
        const listItems = [];
        items.forEach((item) => {
            let filesize = parseInt(item.filesize, 10);
            let fileSizeSKU = '';
            if (filesize < 1024) {
                // for bytes
                fileSizeSKU = `${filesize}Bytes`;
            } else {
                // For KB
                filesize = (filesize / 1024).toFixed(2);
                if (filesize > 1024) {
                    // check for MB or GB
                    filesize = (filesize / 1024).toFixed(2);
                    if (filesize > 1024) {
                        filesize = (filesize / 1024).toFixed(2);
                        fileSizeSKU = `${filesize}GB`;
                    } else {
                        fileSizeSKU = `${filesize}MB`;
                    }
                } else {
                    fileSizeSKU = `${filesize}KB`;
                }
            }
            listItems.push({ title: `${item.platform} | ${item.language} | ${fileSizeSKU}`, value: item.fileurl, sku: item.sku });
        });
        return listItems;
    }

    populatePlabel(data) {
        const hiddenEl = document.getElementById(DROPDOWN_HIDDEN_ID);
        const productLabel = data.data[Object.keys(data.data)[0]].items[0].version[0].productlabel;
        if (hiddenEl.hasAttribute(DROPDOWN_HIDDEN_ATTR_PLABEL)) {
            hiddenEl.setAttribute(DROPDOWN_HIDDEN_ATTR_PLABEL, productLabel);
        }
    }

    sortList(items) {
        if (this.sortProperty === 'none') return items;
        return items.sort((a, b) => ((a[this.sortProperty] > b[this.sortProperty]) ? 1 : -1));
    }

    sortCountries(items) {
        const sortedTopCountries = [];
        const sortedCountries = [];
        for (let i = 0; i < items.length; i += 1) {
            if (items[i].isTop) {
                sortedTopCountries.push(items[i]);
            } else {
                sortedCountries.push(items[i]);
            }
        }
        sortedTopCountries.sort(function (a, b) {
            return (a.value > b.value) ? -1 : 1;
        });
        sortedCountries.sort(function (a, b) {
            return (a.value > b.value) ? 1 : -1;
        });
        return sortedTopCountries.concat(sortedCountries);
    }

    listenParentChanges() {
        this.parent = document.querySelector(`.spectrum-Dropdown[data-dropdown-name="${this.parentName}"]`);
        if (!(this.parent instanceof HTMLElement)) return;
        this.parent.addEventListener('change', (event) => {
            if (this.parentName === 'country') {
                let fetchRegionSource;
                const countrySourceAPI = this.parent.getAttribute(ATTR_DROPDOWN_SOURCE);
                const hasCountriesALL = countrySourceAPI.includes(COUNTRIES_ALL_API);
                const hasCountriesByPathAPI = countrySourceAPI.includes(COUNTRIES_BY_PATH_API);

                // backward compatibility for existing authored content on prod
                if (hasCountriesALL && !hasCountriesByPathAPI) {
                    fetchRegionSource = this.form.getAttribute(DATA_ODIN_ENVIRONMENT)
                        + GRAPHQL_ENDPOINT + REGIONS_BY_PATH_API + DATA_ODIN_US_PATH
                        + event.detail.value;
                } else {
                    const s = this.parent.getAttribute(ATTR_DROPDOWN_SOURCE);
                    const replaceByRegion = s.replace(COUNTRIES_BY_PATH_API, REGIONS_BY_PATH_API);
                    fetchRegionSource = this.form.getAttribute(DATA_ODIN_ENVIRONMENT)
                    + replaceByRegion + SLASH + event.detail.value;
                }

                this.resetRegionDropdown();

                // going to make window fetch based on country selected in dropdown
                window.fetch(fetchRegionSource)
                    .then(response => response.json())
                    .then((data) => {
                        const items = data.data[Object.keys(data.data)[0]]?.item.child;
                        this.data = items;
                        this.reset();
                        if (items !== null && items.length > 0) {
                            this.sortList(items);
                        }
                        this.updateList(items);
                        this.updateDropdown();
                    })
                    .catch((error) => { });
            } else {
                this.data = event.detail.child;
                this.reset();
                const items = event.detail.child;
                if (items !== null && items.length > 0) this.sortList(items);
                this.updateList(items);
                this.updateDropdown();
            }
        });
    }

    resetRegionDropdown() {
        this.data = [];
        this.updateDropdown();
    }

    updateDropdown() {
        if (!this.data || this.data.length < 1) {
            this.reset();
            this.disable(true);
        } else {
            this.disable(false);
        }
    }

    reset() {
        this.elemLabel.innerHTML = this.label;
        this.elemLabel.classList.add(CLASS_IS_PLACEHOLDER);
        this.elemButton.setAttribute('value', '');
    }

    disable(force) {
        this.elemButton[force ? 'setAttribute' : 'removeAttribute']('disabled', 'true');
        this.elemButton.classList[force ? 'add' : 'remove']('is-disabled');
        this.dropdown.classList[force ? 'add' : 'remove']('is-disabled');
    }

    toggleOpen(force) {
        if (this.elemButton.disabled) {
            return;
        }

        this.isOpen = force !== undefined ? force : !this.dropdown.classList.contains('is-open');
        const fieldButton = this.dropdown.querySelector(SELECTOR_DROPDOWN_TRIGGER);
        const popover = this.dropdown.querySelector(SELECTOR_DROPDOWN_POPOVER);

        this.dropdown[this.isOpen ? 'setAttribute' : 'removeAttribute']('aria-expanded', 'true');
        this.dropdown.classList.toggle('is-open', this.isOpen);
        fieldButton.classList.toggle(CLASS_IS_SELECTED, this.isOpen);

        if (popover) {
            popover.style.zIndex = 1;
            popover.classList.toggle('is-open', this.isOpen);
        }

        if (this.isOpen) {
            this.openDropdown = this.dropdown;
            this.dropdown.tabIndex = 1;
            if (popover) {
                popover.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                });
            }
        }
    }

    closeAndFocusDropdown(dropdown) {
        if (dropdown) {
            this.toggleOpen(false);
            const fieldButton = dropdown.querySelector(SELECTOR_DROPDOWN_TRIGGER);
            if (fieldButton) {
                fieldButton.focus();
            }
        }
    }

    setDropdownValue(dropdown, value, label, childJson) {
        const menu = dropdown.querySelector(SELECTOR_MENU);
        const menuItem = dropdown.querySelector(`.spectrum-Menu-item[data-value="${value}"]`);

        if (menuItem) {
            const selectedMenuItem = menu.querySelector('.spectrum-Menu-item.is-selected');
            if (selectedMenuItem) {
                selectedMenuItem.classList.remove(CLASS_IS_SELECTED);
                selectedMenuItem.removeAttribute('aria-selected');
            }

            menuItem.classList.add(CLASS_IS_SELECTED);
            menuItem.setAttribute('aria-selected', 'true');

            if (!label) {
                const menuLabel = menuItem.querySelector('.spectrum-Menu-itemLabel');
                if (menuLabel) {
                    // eslint-disable-next-line no-param-reassign
                    label = menuLabel.innerHTML;
                }
            }
        }

        dropdown.querySelector('button').value = value;

        const fieldButton = dropdown.querySelector(SELECTOR_DROPDOWN_TRIGGER);
        if (fieldButton && label) {
            const dropdownLabel = fieldButton.querySelector(SELECTOR_DROPDOWN_LABEL);
            if (dropdownLabel) {
                dropdownLabel.classList.remove(CLASS_IS_SELECTED);
                dropdownLabel.classList.remove(CLASS_IS_PLACEHOLDER);
                dropdownLabel.innerHTML = label;
            }
        }

        const child = JSON.parse(childJson);
        const event = new window.CustomEvent('change', {
            bubbles: true,
            detail: {
                label,
                value,
                child,
            },
        });

        dropdown.dispatchEvent(event);
    }

    DropKeyEvents() {
        this.dropdown.addEventListener('keydown', (event) => {
            const inp = String.fromCharCode(event.keyCode);
            if (/^[ A-Za-z0-9_@./+-]*$/.test(inp)) {
                this.dropAutoSuggest(event);
            } else if (event.keyCode === 13) {
                this.selectDropDownMenu(event);
            } else if (event.keyCode === 38) {
                this.moveUp(event);
            } else if (event.keyCode === 40) {
                this.moveDown(event);
            } else if (event.keyCode === 27) {
                this.closeDropdown(this.dropdown);
                if (this.activeItem) {
                    this.deFocusElement(this.activeItem);
                    this.activeItem = '';
                }
            }
        });
    }

    moveDown(event) {
        event.preventDefault();
        this.list = this.form.querySelector('.spectrum-Dropdown.is-open').querySelectorAll('.spectrum-Menu-itemLabel');
        const nextItem = this.activeItem.nextElementSibling;

        if (nextItem) {
            this.focusElement(nextItem);
        } else {
            this.focusElement(this.list[0].offsetParent);
        }
    }

    moveUp(event) {
        event.preventDefault();
        this.list = this.form.querySelector('.spectrum-Dropdown.is-open').querySelectorAll('.spectrum-Menu-itemLabel');
        const prevItem = this.activeItem.previousElementSibling;

        if (prevItem) {
            this.focusElement(prevItem);
        } else {
            this.focusElement(this.list[this.list.length - 1].offsetParent);
        }
    }

    selectDropDownMenu(event) {
        event.preventDefault();
        const elem = event.target.closest(SELECTOR_DROPDOWN);
        const dropdownTrigger = elem.querySelector(SELECTOR_DROPDOWN_TRIGGER);
        if (dropdownTrigger) {
            if (!this.dropdown.classList.contains('is-open')) {
                this.toggleOpen();
            } else {
                this.closeDropdown(this.dropdown);
            }
        }
        if (this.activeItem) {
            this.handleMenuChange(this.activeItem.parentElement, this.activeItem);
            this.deFocusElement(this.activeItem);
            this.activeItem = '';
        }
    }

    dropAutoSuggest(event) {
        this.list = this.form.querySelector('.spectrum-Dropdown.is-open').querySelectorAll('.spectrum-Menu-itemLabel');
        const { key } = event;
        if (!this.keysSoFar) {
            for (let i = 0; i < this.list.length; i += 1) {
                if (this.list[i].classList.contains('is-selected')) {
                    this.searchIndex = i;
                }
            }
        }
        this.keysSoFar += key.toLocaleLowerCase();
        this.clearKeysSoFarAfterDelay();
        let nextMatch = this.findMatchInRang(this.list,
            this.keysSoFar.length > 1 ? this.searchIndex : this.searchIndex + 1,
            this.list.length - 1);
        if (!nextMatch) {
            nextMatch = this.findMatchInRang(this.list, 0, this.searchIndex);
        }
        if (nextMatch) {
            this.focusElement(nextMatch.offsetParent);
        }
    }

    clearKeysSoFarAfterDelay() {
        if (this.keyClear) {
            clearTimeout(this.keyClear);
            this.keyClear = null;
        }
        this.keyClear = setTimeout((function () {
            this.keysSoFar = '';
            this.keyClear = null;
        }).bind(this), 500);
    }

    findMatchInRang(list, startIndex, endIndex) {
        for (let n = startIndex; n <= endIndex; n += 1) {
            const label = list[n].innerText;
            if (label && label.toLocaleLowerCase().indexOf(this.keysSoFar) === 0) {
                this.searchIndex = n;
                return list[n];
            }
        }
        return null;
    }

    focusElement(element) {
        if (this.activeItem) {
            this.deFocusElement(this.activeItem);
        }
        const parentDropdown = this.form.querySelector('.spectrum-Dropdown-popover.is-open');
        const openDropdown = parentDropdown.querySelector('.spectrum-Menu');
        this.activeItem = element;
        if (openDropdown.scrollHeight > openDropdown.clientHeight) {
            const scrollBottom = openDropdown.clientHeight + openDropdown.scrollTop;
            const elementBottom = this.activeItem.offsetTop
            + this.activeItem.offsetHeight;
            if (elementBottom > scrollBottom) {
                openDropdown.scrollTop = elementBottom - openDropdown.clientHeight;
            } else if (this.activeItem.offsetTop < openDropdown.scrollTop) {
                openDropdown.scrollTop = this.activeItem.offsetTop;
            }
        }
        this.activeItem.classList.add('focused');
    }

    deFocusElement(element) {
        element.classList.remove('focused');
    }

    handleMenuChange(menu, menuItem) {
        const value = menuItem.getAttribute('data-value');
        const child = menuItem.getAttribute('data-child');
        const menuLabel = menuItem.querySelector('.spectrum-Menu-itemLabel');
        const label = menuLabel.innerHTML;

        const dropdown = menu.closest(SELECTOR_DROPDOWN);
        if (dropdown) {
            this.toggleOpen(false);
            this.setDropdownValue(dropdown, value, label, child);
            setTimeout(this.isValid(), 1);
        }
    }

    updateList(items) {
        let prevItem = false;
        this.dropdown.querySelector(SELECTOR_MENU).innerHTML = '';
        if (!items) {
            this.disable(true);
        } else {
            this.data = items;
            this.disable(false);
            items.forEach((item) => {
                const textNode = document.createTextNode(`${item.title}`);
                const itemLabel = document.createElement('span');
                const listItem = document.createElement('li');
                const listItemDivider = document.createElement('li');
                listItemDivider.setAttribute('class', 'spectrum-Menu-divider');
                listItem.setAttribute('data-value', item.value);
                listItem.setAttribute('data-isTop', item.isTop);
                listItem.setAttribute('class', 'spectrum-Menu-item');
                listItem.setAttribute('role', 'option');
                listItem.setAttribute('sku', item.sku);
                if (item.child) {
                    listItem.setAttribute('data-child', JSON.stringify(item.child));
                }
                listItem.appendChild(itemLabel);
                itemLabel.setAttribute('class', 'spectrum-Menu-itemLabel');
                itemLabel.setAttribute('aria-label', `${item.title}`);
                itemLabel.appendChild(textNode);
                if (!item.isTop && prevItem && prevItem.isTop) {
                    this.dropdown.querySelector(SELECTOR_MENU).appendChild(listItemDivider);
                }
                this.dropdown.querySelector(SELECTOR_MENU).appendChild(listItem);
                prevItem = item;
            });
        }
    }

    closeDropdown(drop) {
        this.isOpen = !drop.classList.contains('is-open');
        drop[this.isOpen ? 'setAttribute' : 'removeAttribute']('aria-expanded', 'true');
        drop.classList.remove('is-open');
        drop.querySelector(SELECTOR_DROPDOWN_POPOVER).classList.remove('is-open');
    }
}

export default Dropdown;
