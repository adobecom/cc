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
    this.textfield.addEventListener('input', () => {
      this.form.setAttribute('data-show-error', 'true');
      this.isValid();
    });
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
    if (this.fieldConfig.type.startsWith('cc-form-text-textarea')) {
      const ta = createTag('textarea', {});
      const taid = this.fieldConfig.type.startsWith('cc-form-text-textarea-') ? this.fieldConfig.type.split('cc-form-text-textarea-')?.pop() : 'textarea';
      ta.setAttribute('name', taid);
      ta.setAttribute('id', taid);
      i.replaceWith(ta);
      return ta;
    }
    const fieldType = this.fieldConfig.type.split('cc-form-text-').pop();
    switch (fieldType) {
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
        i.setAttribute('pattern', '^(?=.*[0-9a-zA-Z])[0-9a-zA-Z\\- ]*$');
        break;
      case 'website':
        i.setAttribute('pattern', '^((ftp|http|https):\\/\\/)??(www\\.)?(?!.*(ftp|http|https|www\\.)).+[a-zA-Z0-9_\\-]+(\\.[a-zA-Z]+)+((\\/\\w*)*(\\/\\w+\\?[a-zA-Z0-9_]+=\\w+(&[a-zA-Z0-9_]+=\\w+)*)?)?\\/?$');
        break;
      case 'orgname':
        break;
      case 'fname':
        i.setAttribute('pattern', '[a-zA-Z0-9]+');
        break;
      case 'lname':
        i.setAttribute('pattern', '[a-zA-Z0-9]+');
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
    const showError = this.form.getAttribute('data-show-error') === 'true';
    if (!showError) return this.valid;
    this.value = this.textfield.value;
    this.valid = false;
    this.textfield.setCustomValidity('');
    this.textfield.reportValidity();
    if (!this.pattern && !this.required) this.valid = true;
    if (!this.pattern && this.required && this.value.trim() !== '') this.valid = true;
    if (this.pattern && this.textfield.validity.valid) this.valid = true;
    if (this.required && this.value.trim() === '') this.valid = false;
    if (!this.required && this.value.trim() === '') this.valid = true;
    if (this.readonly) this.valid = true;
    if (this.required && this.value.trim() === '') {
      this.valid = false;
    }
    this.textfield.setAttribute('data-valid', this.valid);
    if (this.required && this.value.trim() === '' && showError) {
      const elem = this.textfield.closest('.form-item').querySelector(`${SELECTOR_PREFIX_MESSAGE}required`);
      this.textfield.setCustomValidity(`${elem.innerText}`);
      this.textfield.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      this.textfield.reportValidity();
      this.form.setAttribute('data-show-error', 'false');
    } else if (!this.valid && showError) {
      const elem = this.textfield.closest('.form-item').querySelector(`${SELECTOR_PREFIX_MESSAGE}invalid`);
      this.textfield.setCustomValidity(`${elem.innerText}`);
      this.textfield.reportValidity();
    }
    return this.valid;
  }
}
export default Textfield;
