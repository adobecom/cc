import { createTag } from '../../scripts/utils.js';
import Textfield from '/creativecloud/features/cc-forms/components/textfield.js';
import Dropdown from '/creativecloud/features/cc-forms/components/dropdown.js';
import Checkbox from '/creativecloud/features/cc-forms/components/checkbox.js';

const formConfig = {
  'perpeptual': {
    'type': 'perpeptual',
    'js': '/creativecloud/features/cc-forms/forms/perpeptual.js',
    'blockDataset': {
      'clientname': 'trials',
      'endpoint': '/api2/marketing_common_service',
      'form-type': 'form.perpetual.action'
    }
  },
  'connect': {
    'type': 'connect'
  },
  'subscribe': {
    'type': 'subscribe'
  },
  'unsubscribe': {
    'type': 'unsubscribe'
  }
}

class CCForms {
  constructor(el) {
    this.el = el;
    this.form = this.initForm();
    this.formConfig = this.getFormConfig();
    this.setFormDataAttributes();
    this.createFormComponents();
  }
  
  getFormConfig() {
    switch(true) {
      case this.el.classList.contains('perpeptual'):
        return formConfig['perpeptual'];
      case this.el.classList.contains('subscribe'):
        return formConfig['subscribe'];
      default:
        return {}
    }
  }

  initForm() {
    const f = createTag('form');
    this.el.prepend(f);
    return f;
  }

  setFormDataAttributes() {
    Object.keys(this.formConfig.blockDataset).forEach((k) => {
      this.form.setAttribute(`data-${k}`, this.formConfig.blockDataset[k]);
    });
  }

  createFormComponents() {
    const formComponents = this.el.querySelectorAll(':scope > div span[class*="cc-form-"]');
    const formMetadata = [...this.el.querySelectorAll(':scope > div .icon')];
    [...formComponents].forEach((fc) => {
      const componentConfig = {};
      const c = formMetadata.shift();
      const componentName = [...c.classList].find((cn) => cn.includes('icon-cc-form')).split('icon-')[1];
      componentConfig.type = componentName;
      if (c.parentElement.nextElementSibling) componentConfig.value = c.parentElement.nextElementSibling;
      while(formMetadata.length && !(/cc-form-/.test(formMetadata[0].classList))) {
        const s = formMetadata.shift();
        const keyName = [...s.classList].find((cn) => cn.includes('icon-')).split('icon-')[1];
        componentConfig[keyName] = s.closest('div').nextElementSibling;
      }
      switch(true) {
        case componentName.startsWith('cc-form-text'):
          new Textfield(this.form, componentConfig);
          break;
        case componentName.startsWith('cc-form-dropdown'):
          // new Dropdown(this.form, componentConfig);
          break;
        case componentName.startsWith('cc-form-button'):
          console.log('button');
          break;
        case componentName.startsWith('cc-form-checkbox'):
          new Checkbox(this.form, componentConfig);
          break;
        case componentName.startsWith('cc-form-consent'):
          console.log('consent');
          break;
        case componentName.startsWith('cc-form-content'):
          console.log('content');
          break;
        default:
          break;
      }
    });
  }
}

export default async function init(el) {
    new CCForms(el);
}