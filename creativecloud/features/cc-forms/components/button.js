import { createTag } from '../../../scripts/utils.js';
class Button {
    constructor(formEl, config) {
        this.form = formEl;
        this.fieldConfig = config;
        this.btnEl = this.createButton();
    }

    createButton() {
      const a = createTag('a', { href: '#', class: 'con-button blue button-l' }, this.fieldConfig['label'].innerText.trim());
      a.addEventListener('click', (e) => e.preventDefault());
      const d = createTag('div', { class: 'form-item' }, a);
      this.form.append(d);
      return a;
    }
}

export default Button;
