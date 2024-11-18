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

    setValidationPattern(i) {
      const fieldType = this.fieldConfig.type.split('-').pop();
      switch(fieldType) {
        case 'contributor':
          i.setAttribute('pattern', "\^[^\\^,\\.\\?\\{\\}\\(\\)\\[\\]]+$");
          break;
        case 'email':
          i.setAttribute('pattern', "^[a-zA-Z0-9_.\\-]+@[a-z0-9_.\\-]{3,}\\.[a-z]{2,6}$");
          break;
        case 'phonenumber':
          i.setAttribute('pattern', "^[0-9a-zA-Z\\-]*$");
          break;
        case 'postalcode':
          i.setAttribute('pattern', "^[0-9a-zA-Z\\-]*$");
          break;
        case 'website':
          i.setAttribute('pattern', "^((ftp|http|https):\\/\\/)??(www\\.)?(?!.*(ftp|http|https|www\\.)).+[a-zA-Z0-9_\\-]+(\\.[a-zA-Z]+)+((\\/\\w*)*(\\/\\w+\\?[a-zA-Z0-9_]+=\\w+(&[a-zA-Z0-9_]+=\\w+)*)?)?\\/?$");
          break;
        default:
          i.setAttribute('pattern', '[a-zA-Z0-9]+');
          break;
      }
    }

    createTextField() {
      const i = createTag('input', { type: 'text cc-form-component' });
      const d = createTag('div', { class: 'form-item' }, i);
      this.form.append(d);
      this.setValidationPattern(i);
      const cfgKeys = Object.keys(this.fieldConfig);
      if (cfgKeys.includes('required') || !cfgKeys.includes('optional')) {
        i.setAttribute('required', 'required');
        i.setAttribute('data-required', 'required');
      }
      [...cfgKeys].forEach((ck) => {
        switch(ck) {
          case 'label':
            const l = this.fieldConfig[ck].innerText.trim();
            const lel = createTag('label', {}, l);
            d.prepend(lel);
            i.setAttribute('aria-label', l);
            break;
          case 'disclaimer':
            const disclaimerDiv = createTag('div', { class: `field-detail` }, this.fieldConfig[ck].innerText.trim());
            d.append(disclaimerDiv);
            break;
          case 'placeholder':
            i.setAttribute('placeholder', this.fieldConfig[ck].innerText.trim());
            break
          case 'read-only':
            i.setAttribute('readonly', 'readonly');
            break;
          case 'error-required':
            const er = createTag('div', { class: `field-detail ${CLASS_HIDDEN} error-message error-message-required` }, this.fieldConfig[ck].innerText.trim());
            d.append(er);
            break;
          case 'error-validation':
            const ev = createTag('div', { class: `field-detail ${CLASS_HIDDEN} error-message error-message-invalid` }, this.fieldConfig[ck].innerText.trim());
            d.append(ev);
            break;
        }
      });
      return i;
    }

    init() {
      this.textfield.addEventListener('blur', () => this.isValid() );
      this.form.addEventListener('checkValidation', () => this.isValid());
    }

    showMessage(type) {
        const elem = this.textfield.parentElement.querySelector(`${SELECTOR_PREFIX_MESSAGE}${type}`);
        if (elem) elem.classList.remove(CLASS_HIDDEN);
    }

    hideMessage(type) {
        const elem = this.textfield.parentElement.querySelector(`${SELECTOR_PREFIX_MESSAGE}${type}`);
        if (elem) elem.classList.add(CLASS_HIDDEN);
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
        this.hideMessage('invalid');
        this.hideMessage('required');
        if (!this.valid && this.value === '') {
            this.showMessage('required');
        } else if (!this.valid) {
            this.showMessage('invalid');
        }
        return this.valid;
    }
}

export default Textfield;