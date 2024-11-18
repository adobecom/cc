import { createTag, getLibs } from '../../../scripts/utils.js';
const miloLibs = getLibs();
const { decorateButtons } = await import(`${miloLibs}/utils/decorate.js`);

class Button {
    constructor(formEl, config) {
        this.form = formEl;
        this.fieldConfig = config;
        this.btnEl = this.createButton();
    }

    createButton() {
      const a = createTag('a', { href: '#'});
      a.style.fontWeight = 'bold';
      const d = createTag('div', { class: 'form-item' }, a);
      a.addEventListener('click', (e) => { e.preventDefault(); });
      this.form.append(d);
      const cfgKeys = Object.keys(this.fieldConfig);
      [...cfgKeys].forEach((ck) => {
        switch(ck) {
          case 'label':
            a.innerHTML = this.fieldConfig[ck].innerText.trim();
            break;
          case 'thank-you-refirect':
            this.form.setAttribute('data-thankyoupage', this.fieldConfig[ck].querySelector('a').href);
            break;
          case 'error-redirect':
            this.form.setAttribute('data-genericerrorpage', this.fieldConfig[ck].querySelector('a').href);
            break;
        }
      });
      decorateButtons(d);
      return a;
    }
}

export default Button;
