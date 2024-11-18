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
    
    setComponentAttributes(i) {
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
      i.setAttribute('name', fieldType);
      i.setAttribute('id', fieldType);
      const cfgKeys = Object.keys(this.fieldConfig);
      if (cfgKeys.includes('required') || !cfgKeys.includes('optional')) {
        i.setAttribute('required', 'required');
        i.setAttribute('data-required', 'required');
      }
      return cfgKeys;
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
