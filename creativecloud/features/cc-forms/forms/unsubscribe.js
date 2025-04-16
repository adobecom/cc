import Trials from './trials.js';

const CONTAINER_PLACEHOLDER = '.form-item';
const CHECKBOX_INPUT_CLASS = '.checkbox-input';
const CHECKBOX_INPUT_CHECKED = '.checkbox-input:checked';
const DATA_SNAME_FALLBACK = 'data-snamefallback';
const REGULAR_EXP_EMAIL = /\S+@\S+\.\S+/;

class Unsubscribe extends Trials {
  constructor(form, authConfig) {
    super(form, authConfig);
    this.form = form;
    this.authConfig = authConfig;
    this.campaignManifest = false;
    this.checkMandatoryParams();
    this.replacePlaceholder();
    this.initialChecked();
    this.observeCheckBoxes();
    this.initializeClickHereLink();
    this.buttonListener();
  }

  checkMandatoryParams() {
    const params = new URLSearchParams(window.location.search);
    const email = params.get('email');
    const p = params.get('p');
    const n = params.get('n');
    if (!((email && this.validateEmail(decodeURIComponent(email)))
            && (p && n))) {
      window.location.href = `${window.location.origin}/404.html`;
    }
  }

  initialChecked() {
    const checkboxes = this.form.querySelectorAll(CHECKBOX_INPUT_CLASS);
    checkboxes.forEach((checkbox, index) => {
      checkbox.checked = (index < 1);
    });
  }

  observeCheckBoxes() {
    const unsubscribeForm = this;
    const { form } = this;
    const checkboxes = this.form.querySelectorAll(CHECKBOX_INPUT_CLASS);
    Array.prototype.forEach.call(checkboxes, (elem, index) => {
      elem.addEventListener('change', (elemChanged) => {
        if (elemChanged.target.checked) {
          checkboxes[index ? 0 : 1].checked = false;
        }
        const checkboxChecked = form.querySelector(CHECKBOX_INPUT_CHECKED);
        unsubscribeForm.toggleSubmitButton(!(checkboxChecked instanceof HTMLElement));
      });
    });
  }

  getParam(name) {
    if (!this.form) {
      return undefined;
    }
    const params = new URLSearchParams(window.location.search);
    const val = params.get(name);
    return val ? decodeURIComponent(val) : undefined;
  }

  createPayLoad() {
    const data = {};
    data.type = this.getParam('type') || undefined;
    data.p = this.getParam('p');
    data.n = this.getParam('n');
    data.src = this.getParam('src');
    if (this.getParam('type') !== 'instructional' && this.getParam('sname') === null) {
      data.type = 'marketing';
    }
    if (this.form.querySelector('.checkbox-input#unsubscribe-all:checked')) {
      data.type = 'all';
    } else if (this.getParam('sname')) {
      data.sname = this.getParam('sname');
      data.type = 'subscription';
    }
    data.legacy = !((this.getParam('legacy') || 'true') !== 'true');
    const payLoad = {};
    payLoad.data = data;
    this.payLoad = payLoad;
  }

  submitAction() {
    this.createPayLoad();
    this.postCommonService(this.accessToken, this.payLoad, this.endPoint);
  }

  replacePlaceholder() {
    const textContainer = document.querySelectorAll(CONTAINER_PLACEHOLDER);
    const sname = this.getParam('sname');
    const rawEmail = this.getParam('email');
    const email = this.sanitizeHTML(rawEmail || '');
    const { form } = this;

    if (textContainer.length === 0) {
      return;
    }

    Array.prototype.forEach.call(textContainer, (elem) => {
      if (email) {
        const newHtml = elem.innerHTML.replace(/{email}/g, `<b>${email}</b>`);
        elem.innerHTML = newHtml;
      }
      const sNameFallback = sname || form.getAttribute(DATA_SNAME_FALLBACK);
      const sNameLabel = this.getParam('slabel') || sNameFallback;
      elem.innerHTML = elem.innerHTML.replace(/{sname}/g, sNameLabel);
    });
  }

  sanitizeHTML(str) {
    if (!this.form) {
      return str;
    }
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  validateEmail(str) {
    if (!this.form) {
      return false;
    }
    return REGULAR_EXP_EMAIL.test(str);
  }

  initializeClickHereLink() {
    const clickHereLink = this.form.querySelector('a[href*="#click_here"]');
    if (!clickHereLink) return;

    clickHereLink.addEventListener('click', (e) => {
      e.preventDefault();
      const toggleCheckbox = this.form.querySelector('input[toggle-hideshow]');
      if (toggleCheckbox) {
        const parentDivInput = toggleCheckbox.closest('.form-item');
        parentDivInput.style.display = 'block';
      }
      const parentDiv = clickHereLink.closest('.form-item');
      if (parentDiv) {
        parentDiv.style.display = 'none';
      }
    });
  }
}

export default Unsubscribe;
