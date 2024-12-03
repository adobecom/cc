import { createTag } from '../../../scripts/utils.js';

const CLASS_HIDDEN = 'is-hidden';
const SELECTOR_PREFIX_MESSAGE = '.error-message-';

class Textfield {
  constructor(formEl, config) {
    this.form = formEl;
    this.fieldConfig = config;
    this.textfield = this.createTextField();
    this.id = this.textfield.id;
    this.name = this.textfield.name;
    this.type = this.textfield.getAttribute('type');
    this.required = this.textfield.hasAttribute('data-required');
    this.readonly = this.textfield.hasAttribute('readonly');
    this.pattern = this.textfield.hasAttribute('pattern') ? this.textfield.getAttribute('pattern') : false;
    this.value = this.textfield.value;
    this.maxlength = this.textfield.getAttribute('maxlength');
    this.placeholder = this.textfield.getAttribute('placeholder');
    this.valid = true;
    this.init();
  }

  init() {
    this.textfield.addEventListener('blur', () => this.isValid());
    this.form.addEventListener('checkValidation', () => this.isValid());
  }

  createTextField() {
    let i = createTag('input', { type: 'text', class: 'cc-form-component' });
    i = this.setTypeAttributes(i);
    const d = createTag('div', { class: 'form-item' }, i);
    this.form.append(d);
    const cfgKeys = Object.keys(this.fieldConfig);
    [...cfgKeys].forEach((ckraw) => {
      const ck = ckraw.toLowerCase();
      if (ck.startsWith('max-length')) return i.setAttribute('maxlength', parseInt(ck.split('-').pop(), 10));
      if (ck.startsWith('max-lines')) return i.setAttribute('rows', parseInt(ck.split('-').pop(), 10));
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
        case 'placeholder':
          i.setAttribute('placeholder', this.fieldConfig[ck].innerText.trim());
          if (i.nodeName === 'TEXTAREA') i.innerHTML = this.fieldConfig[ck].innerText.trim();
          break;
        case 'optional':
          i.removeAttribute('required');
          i.removeAttribute('data-required');
          break;
        case 'hidden':
          d.classList.add(CLASS_HIDDEN);
          break;
        case 'read-only':
          i.setAttribute('readonly', 'readonly');
          break;
        case 'error-required': {
          const er = createTag('div', { class: `field-detail ${CLASS_HIDDEN} error-message error-message-required` }, this.fieldConfig[ck].innerText.trim());
          d.append(er);
        }
          break;
        case 'error-validation': {
          const ev = createTag('div', { class: `field-detail ${CLASS_HIDDEN} error-message error-message-invalid` }, this.fieldConfig[ck].innerText.trim());
          d.append(ev);
        }
          break;
        default:
          break;
      }
      return 1;
    });
    return i;
  }

  setTypeAttributes(i) {
    const fieldType = this.fieldConfig.type.split('cc-form-text-').pop();
    switch (fieldType) {
      case 'textarea': {
        const ta = createTag('textarea', {});
        i.setAttribute('name', fieldType);
        i.setAttribute('id', fieldType);
        i.replaceWith(createTag('textarea', {}));
        return ta;
      }
      case 'contributor':
        i.setAttribute('pattern', '^[^\\^,\\.\\?\\{\\}\\(\\)\\[\\]]+$');
        break;
      case 'email':
        i.setAttribute('pattern', '^[a-zA-Z0-9_.\\-]+@[a-z0-9_.\\-]{3,}\\.[a-z]{2,6}$');
        break;
      case 'phonenumber':
        i.setAttribute('pattern', '^[0-9a-zA-Z\\-]*$');
        break;
      case 'postalcode':
        i.setAttribute('pattern', '^[0-9a-zA-Z\\-]*$');
        break;
      case 'website':
        i.setAttribute('pattern', '^((ftp|http|https):\\/\\/)??(www\\.)?(?!.*(ftp|http|https|www\\.)).+[a-zA-Z0-9_\\-]+(\\.[a-zA-Z]+)+((\\/\\w*)*(\\/\\w+\\?[a-zA-Z0-9_]+=\\w+(&[a-zA-Z0-9_]+=\\w+)*)?)?\\/?$');
        break;
      default:
        i.setAttribute('pattern', '[a-zA-Z0-9]+');
        break;
    }
    i.setAttribute('name', fieldType);
    i.setAttribute('id', fieldType);
    i.setAttribute('required', 'required');
    i.setAttribute('data-required', 'required');
    return i;
  }

  isValid() {
    this.value = this.textfield.value;
    this.valid = false;
    if (!this.pattern && !this.required) this.valid = true;
    if (!this.pattern && this.required && this.value !== '') this.valid = true;
    if (this.pattern && this.textfield.validity.valid) this.valid = true;
    if (this.required && this.value === '') this.valid = false;
    if (this.readonly) this.valid = true;
    this.textfield.setAttribute('data-valid', this.valid);
    if (!this.valid && this.value === '') {
      const elem = this.textfield.closest('.form-item').querySelector(`${SELECTOR_PREFIX_MESSAGE}required`);
      this.textfield.setCustomValidity(`${elem.innerText}`);
      this.textfield.reportValidity();
      const cb = () => {
        el.setCustomValidity('');
        el.reportValidity();
        this.textfield.removeEventListener('input', cb);
      };
      this.textfield.addEventListener('input', cb);
    } else if (!this.valid) {
      const elem = this.textfield.closest('.form-item').querySelector(`${SELECTOR_PREFIX_MESSAGE}invalid`);
      this.textfield.setCustomValidity(`${elem.innerText}`);
      this.textfield.reportValidity();
      const cb = () => {
        el.setCustomValidity('');
        el.reportValidity();
        this.textfield.removeEventListener('input', cb);
      };
      this.textfield.addEventListener('input', cb);
    }
    return this.valid;
  }
}

export default Textfield;
