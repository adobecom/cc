import { createTag, getConfig } from '../../scripts/utils.js';
import Textfield from '/creativecloud/features/cc-forms/components/textfield.js';
import Dropdown from '/creativecloud/features/cc-forms/components/dropdown.js';
import Checkbox from '/creativecloud/features/cc-forms/components/checkbox.js';
class TextContent {
  constructor(formEl, config) {
      this.form = formEl;
      this.fieldConfig = config;
      this.init();
  }

  init() {
    const d = createTag('div', { class: 'form-item' }, this.fieldConfig.value);
    this.form.append(d);
    return;
  }
}
class Button {
  constructor(formEl, config) {
      this.form = formEl;
      this.fieldConfig = config;
      this.btnEl = this.createButton();
  }

  createButton() {
    const a = createTag('a', { href: '#', class: 'con-button blue button-l cc-form-component submit' }, this.fieldConfig['label'].innerText.trim());
    a.addEventListener('click', (e) => e.preventDefault());
    const d = createTag('div', { class: 'form-item' }, a);
    this.form.append(d);
    return a;
  }
}

function getOdinEndpoint() {
  const cfg = getConfig();
  const { host } = window.location;
  if (host.includes('stage.adobe.com' || 'hlx.live')) return cfg.stage.odinEndpoint;
  if (host.includes('adobe.com')) return cfg.prod.odinEndpoint;
  return cfg.live.odinEndpoint;
}

const formConfig = {
  'perpeptual': {
    'type': 'perpeptual',
    'js': '/creativecloud/features/cc-forms/forms/perpeptual.js',
    'blockDataset': {
      'clientname': 'trials',
      'endpoint': '/api2/marketing_common_service',
      'form-type': 'form.perpetual.action',
      'odinenvironment' : getOdinEndpoint(),
      'odin-prepopulate-api': `${getOdinEndpoint()}graphql/execute.json/acom/listvalidationsbylocale;path=/content/dam/acom/validation`,
      'form-submit': 'trials',
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
    const f = createTag('form', { novalidate: '' });
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
      componentConfig.type = componentName.toLowerCase();
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
        case componentName.startsWith('cc-form-checkbox'):
          new Checkbox(this.form, componentConfig);
          break;
        case componentName.startsWith('cc-form-button'):
          new Button(this.form, componentConfig);
          break;
        // case componentName.startsWith('cc-form-dropdown'):
        //   new Dropdown(this.form, componentConfig);
        //   break;
        case componentName.startsWith('cc-form-consent'):
          new TextContent(this.form, componentConfig);
          break;
        case componentName.startsWith('cc-form-content'):
          new TextContent(this.form, componentConfig);
          break;
        default:
          break;
      }
    });
  }
}

export default async function init(el) {
    const formComponent = new CCForms(el);
    const { default: FormConfigurator} = await import(formComponent.formConfig["js"]);
    const formVariant = new FormConfigurator(formComponent.form);
}
