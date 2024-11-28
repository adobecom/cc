/* eslint-disable max-classes-per-file */
import { createTag, getConfig, setConfig } from '../../scripts/utils.js';
import Textfield from '../../features/cc-forms/components/textfield.js';
import Dropdown from '../../features/cc-forms/components/dropdown.js';
import Checkbox from '../../features/cc-forms/components/checkbox.js';
import { ConsentNotice } from '../../features/cc-forms/forms/trials.js';

class TextContent {
  constructor(formEl, config) {
    this.form = formEl;
    this.fieldConfig = config;
    this.init();
  }

  init() {
    const d = createTag('div', { class: 'form-item' }, this.fieldConfig.value);
    this.form.append(d);
  }
}
class Button {
  constructor(formEl, config) {
    this.form = formEl;
    this.fieldConfig = config;
    this.btnEl = this.createButton();
  }

  createButton() {
    const a = createTag('a', { href: '#', class: 'con-button blue button-l cc-form-component submit' }, this.fieldConfig.label.innerText.trim());
    a.addEventListener('click', (e) => e.preventDefault());
    const d = createTag('div', { class: 'form-item' }, a);
    this.form.append(d);
    return a;
  }
}

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
    ...odinConfig,
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
      case this.el.classList.contains('subscribe'):
        return formConfig.subscribe;
      default:
        return formConfig.default;
    }
  }

  initForm() {
    if (this.formConfig.type === 'default') {
      const d = createTag('div', { class: 'form-components' });
      this.el.prepend(d);
      return d;
    }
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
        const keyName = [...s.classList].find((cn) => cn.includes('icon-')).split('icon-')[1].toLowerCase();
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
        case componentName.startsWith('cc-form-button'):
          // eslint-disable-next-line no-unused-vars
          { const btn = new Button(this.form, componentConfig); }
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
  if (window.adobeIMS?.initialized) throw new Error('Trials IMS pre-initialization error!!');
  const formComponent = new CCForms(el);
  if (formComponent.formConfig.type === 'default') return;
  if (formComponent.formConfig.type === 'perpeptual' || formComponent.formConfig.type === 'connect') {
    // const cfg = getConfig();
    // cfg.imsClientId = 'trials1';
    // cfg.adobeid.client_id = 'trials1';
    // eslint-disable-next-line max-len
    // cfg.adobeid.scope = 'AdobeID,openid,gnav,update_profile.mrktPerm,update_profile.job_function,update_profile.industry,update_profile.phoneNumber,update_profile.address.mail_to,update_profile.job_title,update_profile.company,additional_info.address.mail_to,additional_info.job_function,additional_info.industry,additional_info.job_title,additional_info.company,trials_ro,pps.read,firefly_api,additional_info.roles,read_organizations';
    // cfg.adobeid.api_parameters = {};
    // cfg.adobeid.enableGuestAccounts = false;
    // cfg.adobeid.enableGuestTokenForceRefresh = false;
    // cfg.adobeid.redirect_uri = window.location.href.includes('.adobe.com') ? window.location.href : "https://www.adobe.com";
    // setConfig(cfg);
  }
  imsInitialized().then(async () => {
    // const disableSigIn = new URLSearchParams(window.location.search).get('disableSignIn');
    // if (!disableSigIn && !window.adobeIMS.isSignedInUser()) window.adobeIMS.signIn();
    const { default: FormConfigurator } = await import(formComponent.formConfig.jsPath);
    const fc = new FormConfigurator(formComponent.form);
    return fc;
  });
}
