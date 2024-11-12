import { createTag } from '../../../scripts/utils.js';

const CLASS_HIDDEN = 'is-hidden';
const SELECTOR_PREFIX_MESSAGE = '.hawksForms-message--';

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

    createTextField() {
      const i = createTag('input', { type: 'text'});
      const d = createTag('div', { class: 'form-item' }, i);
      this.form.append(d);
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

    init() {
        this.form.addEventListener('checkValidation', () => this.isValid());
        this.textfield.addEventListener('blur', () => this.isValid());
    }

    fixRequiredAttribute() {
        if (this.textfield.hasAttribute('data-required')) {
            this.textfield.removeAttribute('data-required');
            this.textfield.setAttribute('required', 'required');
        }
    }

    showMessage(type) {
        const elem = this.form.querySelector(`${SELECTOR_PREFIX_MESSAGE}${type}`);
        if (elem) {
            elem.classList.remove(CLASS_HIDDEN);
        }
    }

    hideMessage(type) {
        const elem = this.form.querySelector(`${SELECTOR_PREFIX_MESSAGE}${type}`);
        if (elem) {
            elem.classList.add(CLASS_HIDDEN);
        }
    }

    isValid() {
        this.value = this.textfield.value;
        this.fixRequiredAttribute();
        this.valid = false;
        if (!this.pattern && !this.required) {
            this.valid = true;
        }
        if (!this.pattern && this.required && this.value !== '') {
            this.valid = true;
        }
        if (this.pattern && this.textfield.validity.valid) {
            this.valid = true;
        }
        if (this.required && this.value === '') {
            this.valid = false;
        }

        if (this.readonly) {
            this.valid = true;
        }
        this.form.setAttribute('data-valid', this.valid);
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
