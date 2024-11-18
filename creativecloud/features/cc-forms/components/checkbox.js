import { createTag } from '../../../scripts/utils.js';

const CLASS_HIDDEN = 'is-hidden';
const SELECTOR_PREFIX_MESSAGE = '.error-message-';
class Checkbox {
    constructor(formEl, config) {
        this.form = formEl;
        this.fieldConfig = config;
        this.checkboxInput = this.createCheckbox();
        this.id = this.checkboxInput.id;
        this.name = this.checkboxInput.name;
        this.type = this.checkboxInput.getAttribute('type');
        this.required = !!(this.checkboxInput.hasAttribute('data-required'));
        this.value = this.checkboxInput.value;
        this.valid = true;
        this.init();
    }

    init() {
        this.form.addEventListener('checkValidation', () => this.isValid());
        this.checkboxInput.addEventListener('change', () => this.isValid());
    }

    setComponentAttributes(i) {
      const fieldType = this.fieldConfig.type.split('-').pop();
      switch(fieldType) {
        case 'accept-agreement':
          i.setAttribute('name', 'accept-agreement');
          i.setAttribute('id', 'accept-agreement');
          break;
        case 'consent-explicit-email':
          i.setAttribute('name', 'consentexplicitemail');
          i.setAttribute('id', 'consentexplicitemail');
          break;
        case 'consent-explicit-phone':
          i.setAttribute('name', 'consentexplicitphone');
          i.setAttribute('id', 'consentexplicitphone');
          break;
        case 'consent-soft':
          i.setAttribute('name', 'consentsoft');
          i.setAttribute('id', 'consentsoft');
          break;
        case 'unsubscribe-all':
          i.setAttribute('name', 'unsubscribe-all');
          i.setAttribute('id', 'unsubscribe-all');
          break;
        case 'unsubscribe-instructional':
          i.setAttribute('name', 'unsubscribe-instructional');
          i.setAttribute('id', 'unsubscribe-instructional');
          break;
        case 'unsubscribe-sname':
          i.setAttribute('name', 'unsubscribe-sname');
          i.setAttribute('id', 'unsubscribe-sname');
          break;
        default:
          break;
      }
      const cfgKeys = Object.keys(this.fieldConfig);
      if (cfgKeys.includes('required') || !cfgKeys.includes('optional')) {
        i.setAttribute('required', 'required');
        i.setAttribute('data-required', 'required');
      }
      return cfgKeys;
    }

    createCheckbox() {
      const i = createTag('input', { type: 'checkbox', class: 'cc-form-component check-item-input checkbox-input'});
      const checkWrap = createTag('div', { class: 'check-item-wrap checkbox-input-wrap' }, i);
      const checkIcon = createTag('span', { class: 'check-item-button checkbox-button'});
      checkWrap.append(checkIcon);
      const d = createTag('div', { class: 'form-item' }, checkWrap);
      this.form.append(d);
      const cfgKeys = this.setComponentAttributes(i);
      [...cfgKeys].forEach((ck) => {
        switch(ck) {
          case 'label':
            const ltxt = this.fieldConfig[ck].innerText.trim();
            const l = createTag('label', { class: 'check-item-label checkbox-label' }, ltxt);
            checkWrap.append(l);
            i.setAttribute('aria-label', ltxt);
            break;
          case 'checked':
            i.setAttribute('checked', 'checked');
            break;
          case 'error-required':
            const er = createTag('div', { class: `field-detail ${CLASS_HIDDEN} error-message error-message-required` }, this.fieldConfig[ck].innerText.trim());
            d.append(er);
            break;
        }
      });
      return i;
    }

    showMessage(type) {
        const elem = this.checkboxInput.closest('.form-item').querySelector(`${SELECTOR_PREFIX_MESSAGE}${type}`);
        if (elem) elem.classList.remove(CLASS_HIDDEN);
    }

    hideMessage(type) {
        const elem = this.checkboxInput.closest('.form-item').querySelector(`${SELECTOR_PREFIX_MESSAGE}${type}`);
        if (elem) elem.classList.add(CLASS_HIDDEN);
    }

    isValid() {
        this.valid = false;
        if (!this.required) this.valid = true;
        if (this.required && this.checkboxInput.checked) this.valid = true;
        this.checkboxInput.setAttribute('data-valid', this.valid);
        this.hideMessage('required');
        if (!this.valid) this.showMessage('required');
        return this.valid;
    }
}

export default Checkbox;
