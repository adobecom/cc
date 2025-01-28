/* eslint-disable max-len */
/* eslint-disable class-methods-use-this */
/* eslint-disable eqeqeq */
import { createTag } from '../../../scripts/utils.js';

const CLASS_HIDDEN = 'is-hidden';
const SELECTOR_PREFIX_MESSAGE = '.error-message-';
const ATTR_DROPDOWN_TYPE = 'data-dropdown-type';
const ATTR_DROPDOWN_PARENT = 'data-dropdown-parent';
const ATTR_DROPDOWN_SOURCE = 'data-dropdown-source';
const ATTR_DROPDOWN_NAME = 'data-dropdown-name';
const ATTR_SORT_PROPERTY = 'data-sort-property';
const DROPDOWN_HIDDEN_ID = 'ptDownloadForm';
const DROPDOWN_HIDDEN_ATTR_PLABEL = 'data-plabel';
const DATA_ODIN_ENVIRONMENT = 'data-odinEnvironment';
const COUNTRIES_ALL_API = 'listallcountries';
const REGIONS_BY_PATH_API = 'listallregionsbypath;path=';
const COUNTRIES_BY_PATH_API = 'listallcountriesbypath;path=';
const PRODUCT_CODE_DETAILS = 'graphql/execute.json/acom/listskuproductandversions';
const GRAPHQL_ENDPOINT = 'graphql/execute.json/acom/';
const DATA_ODIN_US_PATH = '/content/dam/acom/country/us/en/';
const SLASH = '/';

class Dropdown {
  data = [];

  constructor(formEl, config) {
    this.form = formEl;
    this.fieldConfig = config;
    this.dropdown = this.createDropdown();
    this.type = this.dropdown.getAttribute(ATTR_DROPDOWN_TYPE);
    this.parentName = this.dropdown.getAttribute(ATTR_DROPDOWN_PARENT);
    this.parent = false;
    this.child = false;
    this.source = this.dropdown.getAttribute(ATTR_DROPDOWN_SOURCE);
    this.source = this.dropdown.getAttribute(ATTR_DROPDOWN_SOURCE) || false;
    if (this.source && this.form && this.form.getAttribute(DATA_ODIN_ENVIRONMENT) && this.source.indexOf('https://') === -1) {
      this.source = this.form.getAttribute(DATA_ODIN_ENVIRONMENT) + this.source;
    }
    this.name = this.dropdown.getAttribute(ATTR_DROPDOWN_NAME);
    this.sortProperty = this.dropdown.getAttribute(ATTR_SORT_PROPERTY);
    this.value = this.dropdown.value;
    this.valid = true;
    this.required = !!(this.dropdown.getAttribute('data-form-required'));
    this.init();
  }

  getDroprownConfigurations(dtype) {
    const dropdownConfigurations = {
      'freemium-purchase-intent': {
        'dropdown-name': 'freemiumpurchaseintent',
        'dropdown-source': 'graphql/execute.json/acom/fieldvalues;path=/content/dam/acom/connectfreemium/us/en',
      },
      'connect-purchase-intent': {
        'dropdown-name': 'connectpurchaseintent',
        'dropdown-source': 'graphql/execute.json/acom/fieldvalues;path=/content/dam/acom/connecttrialpurchaseintent/us/en',
      },
      country: {
        'dropdown-name': 'country',
        'dropdown-source': 'graphql/execute.json/acom/listallcountries',
      },
      estunitship: {
        'dropdown-name': 'estunitship',
        'dropdown-source': 'graphql/execute.json/acom/fieldvalues;path=/content/dam/acom/estunitship/us/en',
      },
      industry: {
        'dropdown-name': 'industry',
        'dropdown-source': 'graphql/execute.json/acom/fieldvalues;path=/content/dam/acom/industry/us/en',
      },
      jobfunction: {
        'dropdown-name': 'jobfunction',
        'dropdown-source': 'graphql/execute.json/acom/fieldvalues;path=/content/dam/acom/jobfunction/us/en',
      },
      jobtitle: {
        'dropdown-name': 'jobtitle',
        'dropdown-source': 'graphql/execute.json/acom/fieldvalues;path=/content/dam/acom/jobtitle/us/en',
      },
      orgsize: {
        'dropdown-name': 'orgsize',
        'dropdown-source': 'graphql/execute.json/acom/fieldvalues;path=/content/dam/acom/orgsize/us/en',
      },
      'product-sku': {
        'dropdown-name': 'productsku',
        'dropdown-source': `graphql/execute.json/acom/listskuproductversiondetails;pname=${this.productname};ver=${this.version}`,
      },
      'purchase-intent': {
        'dropdown-name': 'purchaseintent',
        'dropdown-source': 'graphql/execute.json/acom/fieldvalues;path=/content/dam/acom/purchaseintent/us/en',
      },
      state: {
        'dropdown-name': 'state',
        'dropdown-source': null,
      },
      region: {
        'dropdown-name': 'region',
        'dropdown-source': 'graphql/execute.json/acom/fieldvalues;path=/content/dam/acom/connectregions/us/en',
      },
      timeframe: {
        'dropdown-name': 'timeframe',
        'dropdown-source': 'graphql/execute.json/acom/fieldvalues;path=/content/dam/acom/timeframe/us/en',
      },
      timezone: {
        'dropdown-name': 'timezone',
        'dropdown-source': 'graphql/execute.json/acom/fieldvalues;path=/content/dam/acom/timezone/us/en',
      },
      'user-type': {
        'dropdown-name': 'usertype',
        'dropdown-source': 'graphql/execute.json/acom/fieldvalues;path=/content/dam/acom/usertype/us/en',
      },
      'existing-user': {
        'dropdown-name': 'usertype',
        'dropdown-source': 'graphql/execute.json/acom/fieldvalues;path=/content/dam/acom/existinguser/us/en',
      },
    };
    return dropdownConfigurations[dtype] ? dropdownConfigurations[dtype] : null;
  }

  createDropdown() {
    const i = createTag('select', { class: 'menu cc-form-component' });
    const d = createTag('div', { class: 'form-item' }, i);
    this.form.append(d);
    const cfgKeys = this.setTypeAttributes(i, d);
    [...cfgKeys].forEach((ckraw) => {
      const ck = ckraw.toLowerCase();
      switch (ck) {
        case 'label': {
          const l = this.fieldConfig[ck].innerText.trim();
          const lel = createTag('label', {}, l);
          d.prepend(lel);
          i.setAttribute('aria-label', l);
        }
          break;
        case 'disclaimer':
          d.append(createTag('div', { class: 'field-detail disclaimer' }, this.fieldConfig[ck].innerText.trim()));
          break;
        case 'placeholder': {
          const ptext = this.fieldConfig[ck].innerText.trim();
          i.setAttribute('placeholder', ptext);
          const pi = createTag('option', { value: '', disabled: 'disabled', selected: 'selected', hidden: 'true' }, ptext);
          i.append(pi);
        }
          break;
        case 'read-only':
          i.setAttribute('readonly', 'readonly');
          break;
        case 'optional':
          i.removeAttribute('required');
          i.removeAttribute('data-form-required');
          break;
        case 'sort-value':
          i.setAttribute(ATTR_SORT_PROPERTY, 'value');
          break;
        case 'sort-id':
          i.setAttribute(ATTR_SORT_PROPERTY, 'id');
          break;
        case 'sort-title':
          i.setAttribute(ATTR_SORT_PROPERTY, 'title');
          break;
        case 'error-required': {
          const er = createTag('div', { class: `field-detail ${CLASS_HIDDEN} error-message error-message-required` }, this.fieldConfig[ck].innerText.trim());
          d.append(er);
        }
          break;
        default:
          break;
      }
    });
    return i;
  }

  createPtDownloadElement(d) {
    window.fetch(`${this.form.getAttribute(DATA_ODIN_ENVIRONMENT)}/${PRODUCT_CODE_DETAILS}`)
      .then((response) => response.json())
      .then((data) => {
        const hiddenPtEl = createTag('input', { type: 'hidden', id: 'ptDownloadForm', name: 'ptDownloadForm' });
        d.append(hiddenPtEl);
        const { items } = data.data[Object.keys(data.data)[0]];
        let email = '';
        let ctxid = '';
        let value = '';
        // eslint-disable-next-line no-restricted-syntax
        for (const item of items) {
          if (item.productname == this.productname) {
            if (item.emailtemplate) email = item.emailtemplate;
            if (item.imscontextid) ctxid = item.imscontextid;
            if (item.productcode) value = item.productcode;
            break;
          }
        }
        hiddenPtEl.setAttribute('data-plabel', '');
        hiddenPtEl.setAttribute('data-email', email);
        hiddenPtEl.setAttribute('data-ctxid', ctxid);
        hiddenPtEl.setAttribute('value', value);
      })
      .catch(() => {});
  }

  setTypeAttributes(i, d) {
    const fieldType = this.fieldConfig.type.split('cc-form-dropdown-').pop();
    const cfgKeys = Object.keys(this.fieldConfig);
    if (fieldType == 'product-sku') {
      const pnameId = cfgKeys.find((item) => item.match(/product-name-/));
      const verId = cfgKeys.find((item) => item.match(/product-version-/));
      if (pnameId) this.productname = pnameId.split('product-name-')[1].trim();
      if (verId) this.version = verId.split('product-version-')[1].trim();
      this.createPtDownloadElement(d);
    }
    const typeAttrs = this.getDroprownConfigurations(fieldType);
    if (!typeAttrs) return cfgKeys;
    Object.keys(typeAttrs).forEach((k) => {
      i.setAttribute(`data-${k}`, typeAttrs[k]);
    });
    i.setAttribute('name', typeAttrs['dropdown-name']);
    i.setAttribute('id', typeAttrs['dropdown-name']);
    i.setAttribute('required', 'required');
    i.setAttribute('data-form-required', 'required');
    i.setAttribute(ATTR_DROPDOWN_TYPE, 'independent');
    const dependentParent = cfgKeys.find((k) => k.includes('dependent'));
    if (dependentParent) {
      i.setAttribute(ATTR_DROPDOWN_TYPE, 'dependent');
      i.setAttribute(ATTR_DROPDOWN_PARENT, dependentParent.split('-')[1]);
    }
    return cfgKeys;
  }

  isValid() {
    this.value = this.dropdown.value;
    this.valid = false;
    this.dropdown.setCustomValidity('');
    this.dropdown.reportValidity();
    if (!this.required) this.valid = true;
    if (this.required && !!(this.value)) this.valid = true;
    if (this.required && this.dropdown.disabled) this.valid = true;
    this.dropdown.setAttribute('data-valid', this.valid);
    if (this.valid) {
      this.dropdown.closest('.form-item').querySelector(SELECTOR_PREFIX_MESSAGE)?.classList.add(CLASS_HIDDEN);
      return this.valid;
    }
    const elem = this.dropdown.closest('.form-item').querySelector(`${SELECTOR_PREFIX_MESSAGE}required`);
    if (!elem) return this.valid;
    if (this.showError) {
      this.dropdown.setCustomValidity(`${elem.innerText}`);
      this.dropdown.reportValidity();
      this.showError = false;
    }
    return this.valid;
  }
  init() {
    if (this.type === 'dependent' && this.parentName) {
      this.listenParentChanges();
      this.updateDropdown();
    }
    if (this.type === 'independent' && this.source) this.loadData();
    if (this.form) this.form.addEventListener('checkValidation', () => this.isValid());
    this.dropdown.addEventListener('change', () => this.isValid());
    if (this.name === 'productsku') this.handleProductSKUChange();
    else if (this.name === 'purchaseintent') this.handlePurchaseIntentChange();
    else {
      this.dropdown.addEventListener('change', (event) => {
        event.target.querySelector('option[selected="selected"')?.removeAttribute('selected');
        event.target.querySelectorAll('option')[event.target.selectedIndex]?.setAttribute('selected', 'selected');
      });
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
      event.target.querySelector('option[selected="selected"')?.removeAttribute('selected');
      event.target.querySelectorAll('option')[event.target.selectedIndex]?.setAttribute('selected', 'selected');
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
      event.target.querySelector('option[selected="selected"')?.removeAttribute('selected');
      event.target.querySelectorAll('option')[event.target.selectedIndex]?.setAttribute('selected', 'selected');
      if (!window.digitalData) return;
      const elem = event.target.closest('.form-item');
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

  loadData() {
    window.fetch(this.source)
      .then((response) => response.json())
      .then((data) => {
        this.dataMapping(data);
      })
      .catch(() => {});
  }

  dataMapping(data) {
    let dataMapped;
    switch (this.name) {
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
        fileSizeSKU = `${filesize}Bytes`;
      } else {
        filesize = (filesize / 1024).toFixed(2);
        if (filesize > 1024) {
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
    if (hiddenEl?.hasAttribute(DROPDOWN_HIDDEN_ATTR_PLABEL)) {
      hiddenEl?.setAttribute(DROPDOWN_HIDDEN_ATTR_PLABEL, productLabel);
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
      if (items[i].isTop) sortedTopCountries.push(items[i]);
      else sortedCountries.push(items[i]);
    }
    sortedTopCountries.sort((a, b) => ((a.value > b.value) ? -1 : 1));
    sortedCountries.sort((a, b) => ((a.value > b.value) ? 1 : -1));
    return sortedTopCountries.concat(sortedCountries);
  }

  listenParentChanges() {
    this.parent = this.form.querySelector(`.menu[data-dropdown-name="${this.parentName}"]`);
    if (!(this.parent instanceof HTMLElement)) return;
    this.parent.addEventListener('change', (event) => {
      if (this.parentName === 'country') {
        let fetchRegionSource;
        const countrySourceAPI = this.parent.getAttribute(ATTR_DROPDOWN_SOURCE);
        const hasCountriesALL = countrySourceAPI.includes(COUNTRIES_ALL_API);
        const hasCountriesByPathAPI = countrySourceAPI.includes(COUNTRIES_BY_PATH_API);
        if (hasCountriesALL && !hasCountriesByPathAPI) {
          fetchRegionSource = this.form.getAttribute(DATA_ODIN_ENVIRONMENT)
              + GRAPHQL_ENDPOINT + REGIONS_BY_PATH_API + DATA_ODIN_US_PATH
              + event.target.value;
        } else {
          const s = this.parent.getAttribute(ATTR_DROPDOWN_SOURCE);
          const replaceByRegion = s.replace(COUNTRIES_BY_PATH_API, REGIONS_BY_PATH_API);
          fetchRegionSource = this.form.getAttribute(DATA_ODIN_ENVIRONMENT)
          + replaceByRegion + SLASH + event.target.value;
        }
        this.resetRegionDropdown();
        window.fetch(fetchRegionSource)
          .then((response) => response.json())
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
          .catch(() => { });
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
    this.dropdown.setAttribute('value', '');
  }

  disable(force) {
    if (force) this.dropdown.setAttribute('disabled', 'disabled');
    else this.dropdown.removeAttribute('disabled');
  }

  // eslint-disable-next-line consistent-return
  updateList(items) {
    this.dropdown.innerHTML = '';
    if (!items) return this.disable(true);
    this.data = items;
    this.disable(false);
    const placeholderItem = createTag('option', { value: '', disabled: 'disabled', selected: 'selected', hidden: 'true' }, this.dropdown.getAttribute('placeholder'));
    this.dropdown.append(placeholderItem);
    items.forEach((item) => {
      const listItem = createTag('option', { value: item.value }, item.title);
      listItem.setAttribute('data-value', item.value);
      listItem.setAttribute('data-isTop', item.isTop);
      listItem.setAttribute('role', 'option');
      listItem.setAttribute('sku', item.sku);
      if (item.child) listItem.setAttribute('data-child', JSON.stringify(item.child));
      this.dropdown.append(listItem);
    });
  }
}

export default Dropdown;
