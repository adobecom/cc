import { createTag } from '../../../scripts/utils.js';

const CLASS_HIDDEN = 'is-hidden';
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

    createCheckbox() {
      const i = createTag('input', { type: 'checkbox'});
      const s = createTag('span', { class: 'input-checkbox'}, i);
      const d = createTag('div', { class: 'form-item' }, s);
      this.form.append(d);
      const cfgKeys = Object.keys(this.fieldConfig);
      if (cfgKeys.includes('required') || !cfgKeys.includes('optional')) i.setAttribute('required', 'required');
      [...cfgKeys].forEach((ck) => {
        switch(ck) {
          case 'label':
            const l = this.fieldConfig[ck].innerText.trim();
            const lel = createTag('label', {}, l);
            s.append(lel);
            i.setAttribute('aria-label', l);
            break;
          case 'checked':
            i.setAttribute('checked', 'checked');
            break;
          case 'error-required':
            const er = createTag('div', {class: CLASS_HIDDEN}, this.fieldConfig[ck].innerText.trim());
            d.append(er);
            break;
        }
      });
      return i;
    }

    init() {
        this.form.addEventListener('checkValidation', () => this.isValid());
        this.checkboxInput.addEventListener('change', () => this.isValid());
    }

    fixRequiredAttribute() {
        if (this.checkboxInput.hasAttribute('data-required')) {
            this.checkboxInput.removeAttribute('data-required');
            this.checkboxInput.setAttribute('required', 'required');
        }
    }

    showMessage() {
        const elem = this.form;
        this.form.classList.add('is-invalid');
        this.form.querySelector('.spectrum-Checkbox').classList.add('is-invalid');
        if (elem) elem.classList.remove(CLASS_HIDDEN);
    }

    hideMessage() {
        const elem = this.form;
        this.form.classList.remove('is-invalid');
        this.form.querySelector('.spectrum-Checkbox').classList.remove('is-invalid');
        if (elem) elem.classList.add(CLASS_HIDDEN);
    }

    isValid() {
        this.fixRequiredAttribute();
        this.valid = false;
        if (!this.required) this.valid = true;
        if (this.required && this.checkboxInput.checked) this.valid = true;
        this.form.setAttribute('data-valid', this.valid);
        this.hideMessage();
        if (!this.valid) this.showMessage();
        return this.valid;
    }
}

export default Checkbox;
