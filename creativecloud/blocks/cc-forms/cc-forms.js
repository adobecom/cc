/* eslint-disable max-classes-per-file */
import { createTag, getConfig } from '../../scripts/utils.js';
import Textfield from '../../features/cc-forms/components/textfield.js';
import Dropdown from '../../features/cc-forms/components/dropdown.js';
import Checkbox from '../../features/cc-forms/components/checkbox.js';
import { TextContent, Button, ConsentNotice } from '../../features/cc-forms/forms/trials.js';

function getOdinEndpoint() {
  const cfg = getConfig();
  const { host } = window.location;
  if (host.includes('stage.adobe.com') || host.includes('hlx.live')) return cfg.stage.odinEndpoint;
  if (host.includes('adobe.com')) return cfg.prod.odinEndpoint;
  return cfg.live.odinEndpoint;
}

const odinConfig = {
  odinenvironment: getOdinEndpoint(),
  'odin-prepopulate-api': `${getOdinEndpoint()}graphql/execute.json/acom/listvalidationsbylocale;path=/content/dam/acom/validation`,
};

const formConfig = {
  perpeptual: {
    type: 'perpeptual',
    jsPath: '/creativecloud/features/cc-forms/forms/perpeptual.js',
    blockDataset: {
      clientname: 'trials',
      endpoint: '/api2/marketing_common_service',
      'form-type': 'form.perpetual.action',
      'form-submit': 'trials',
      ...odinConfig,
    },
  },
  connect: {
    type: 'connect',
    jsPath: '/creativecloud/features/cc-forms/forms/connect.js',
    blockDataset: {
      clientname: 'connecttrial',
      endpoint: '/api2/connect_trial_creation_service',
      'form-type': this.el.classList.contains('enterprise') ? 'form.connect.enterprise.action' : 'form.connect.action',
      'form-submit': 'trials',
      customValue: 'region,timezone',
      imsAddressMailValue: 'postalcode,state,country',
      rengaUDSValue: 'orgsize',
      userProfileValue: '[country,fname,lname,phonenumber,email,orgname,jobfunction,industry]',
      ...odinConfig,
    },
  },
  subscribe: {
    type: 'subscribe',
    ...odinConfig,
  },
  unsubscribe: {
    type: 'unsubscribe',
    ...odinConfig,
  },
  default: {
    type: 'default',
    blockDataset: { ...odinConfig },
  },
};

class CCForms {
  constructor(el) {
    this.el = el;
    this.formConfig = this.getFormConfig();
    this.form = this.initForm();
    this.setFormDataAttributes();
    this.createFormComponents();
    this.demandBaseConfig = {
      'demandbase-endpoint': 'https://api.demandbase.com/autocomplete',
      'demandbase-apiKey': 'e4086fa3ea9d74ac2aae2719a0e5285dc7075d7b',
      'demandbase-delay': 400,
    };
  }

  getFormConfig() {
    switch (true) {
      case this.el.classList.contains('perpeptual'):
        return formConfig.perpeptual;
      case this.el.classList.contains('connect'):
        return formConfig.connect;
      default:
        return formConfig.default;
    }
  }

  initForm() {
    let formel = null;
    if (this.formConfig.type === 'default') formel = createTag('div', { class: 'form-components' });
    else formel = createTag('form', { novalidate: '' });
    const x = [...this.el.classList].filter(((cn) => cn.startsWith('spacing')))[0] || 'spacing-m';
    const d = createTag('div', { class: `cc-forms ${this.formConfig.type} ${x}` }, formel);
    this.el.classList.remove('cc-forms');
    this.el.classList.add('cc-forms-config');
    this.el.insertAdjacentElement('beforebegin', d);
    return formel;
  }

  setFormDataAttributes() {
    Object.keys(this.formConfig.blockDataset).forEach((k) => {
      this.form.setAttribute(`data-${k}`, this.formConfig.blockDataset[k]);
    });
  }

  createFormComponents() {
    const formComponents = this.el.querySelectorAll(':scope > div > div:nth-child(1) span[class*="cc-form-"]');
    const formMetadata = [...this.el.querySelectorAll(':scope > div > div:nth-child(1) .icon')];
    [...formComponents].forEach(() => {
      const componentConfig = {};
      const c = formMetadata.shift();
      const componentName = [...c.classList].find((cn) => cn.includes('icon-cc-form')).split('icon-')[1];
      componentConfig.type = componentName.toLowerCase();
      if (c.parentElement.nextElementSibling) {
        componentConfig.value = c.parentElement.nextElementSibling;
      }
      while (formMetadata.length && !(/cc-form-/.test(formMetadata[0].classList))) {
        const s = formMetadata.shift();
        const keyName = [...s.classList].find((cn) => cn.includes('icon-')).split('icon-')[1];
        if (componentName.startsWith('cc-form-consent')) {
          if (!componentConfig.concentCfgs) componentConfig.concentCfgs = [];
          componentConfig.concentCfgs.push({ bucketNoticeType: keyName, consetFragment: s.closest('div').nextElementSibling });
        } else {
          componentConfig[keyName] = s.closest('div').nextElementSibling;
        }
      }
      switch (true) {
        case componentName.startsWith('cc-form-text'):
          // eslint-disable-next-line no-unused-vars
          { const tf = new Textfield(this.form, componentConfig); }
          break;
        case componentName.startsWith('cc-form-checkbox'):
          // eslint-disable-next-line no-unused-vars
          { const cb = new Checkbox(this.form, componentConfig); }
          break;
        case componentName.startsWith('cc-form-dropdown'):
          // eslint-disable-next-line no-unused-vars
          { const dd = new Dropdown(this.form, componentConfig); }
          break;
        case componentName.startsWith('cc-form-consent'):
          if (this.formConfig && (this.formConfig.type === 'perpeptual' || this.formConfig.type === 'connect')) {
            // eslint-disable-next-line no-unused-vars
            const cn = new ConsentNotice(this.form, componentConfig);
          }
          break;
        case componentName.startsWith('cc-form-content'):
          // eslint-disable-next-line no-unused-vars
          { const tc = new TextContent(this.form, componentConfig); }
          break;
        case componentName.startsWith('cc-form-button'):
          // eslint-disable-next-line no-unused-vars
          { const btn = new Button(this.form, componentConfig); }
          break;
        default:
          break;
      }
    });
  }
}

function imsInitialized(interval = 200) {
  return new Promise((resolve) => {
    function poll() {
      if (window.adobeIMS?.initialized) resolve();
      else setTimeout(poll, interval);
    }
    poll();
  });
}

export default async function init(el) {
  const formComponent = new CCForms(el);
  if (formComponent.formConfig.type === 'default') return el.remove();
  imsInitialized().then(async () => {
    if (!window.adobeIMS.isSignedInUser()) window.adobeIMS.signIn();
    const { default: FormConfigurator } = await import(formComponent.formConfig.jsPath);
    const fc = new FormConfigurator(formComponent.form);
    el.remove();
    return fc;
  });
  return 1;
}
