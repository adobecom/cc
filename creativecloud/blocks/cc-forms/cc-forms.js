/* eslint-disable max-classes-per-file */
import { createTag, getConfig } from '../../scripts/utils.js';
import Textfield from '../../features/cc-forms/components/textfield.js';
import Dropdown from '../../features/cc-forms/components/dropdown.js';
import Checkbox from '../../features/cc-forms/components/checkbox.js';
import { TextContent, Button, ConsentNotice } from '../../features/cc-forms/forms/trials.js';
import DemandBase from '../../features/cc-forms/forms/demandbase.js';

function getOdinEndpoint() {
  const cfg = getConfig();
  if (cfg.env.name === 'prod') return cfg.prod.odinEndpoint;
  if (cfg.env.name === 'stage' || cfg.env.name === 'local') return cfg.stage.odinEndpoint;
  throw new Error('Unknown environment');
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
    this.demandBaseConfig = {
      endpoint: 'https://autocomplete.demandbase.com/forms/autocomplete',
      apiKey: 'DcJ5JpU7attMHR6KoFgKA1oWr7djrtGidd4pC7dD',
      delay: 400, // default
      parentNode: this.form.parentElement,
      fieldMapping: {
        orgname: 'company_name',
        postalcode: 'zip',
        'custom.questions_comments': 'company_name, phone, industry, sub_industry, annual_sales, fortune_1000, forbes_2000, web_site',
        orgsize: 'employee_range',
        industry: 'industry',
        state: 'state',
        country: 'country_name',
      },
      industryMapping: {
        TRANSPORTATION_WAREHOUSING: 'Transportation & Logistics',
        TECHNOLOGY_SOFTWARE_SERVICES: 'Software & Technology',
        EDUCATION_HIGHER_ED: 'Education',
        PROFESSIONAL_TECHNICALSERVICES: 'Business Services',
        TRAVEL_LEISURE_HOSPITALITY: 'Food & Beverage',
        MANUFACTURING_AUTOMOTIVE: 'Automotive',
        ENERGY_MINING_OIL_GAS: 'Mining',
        TECHNOLOGY_HARDWARE: 'Hardware',
        TELECOMMUNICATIONS: 'Telecommunications',
        GOVERNMENT_FEDERAL: 'Government',
        HEALTH_CARE: 'Healthcare & Medical',
        PHARMACEUTICALS_BIOTECH: 'Biotech',
        FINANCIAL_SERVICES: 'Financial Services',
        CONSTRUCTION: 'Construction',
        MEDIA_ENTERTAINMENT: ' Media & Entertainment',
        MANUFACTURING: 'Manufacturing',
        AGRICULTURE_AND_FORESTRY: 'Agriculture',
      },
      payloadMappings: { 'custom.questions_comments': 'company_name, phone, industry, sub_industry, annual_sales, fortune_1000, forbes_2000, web_site' },
    };
    this.createFormComponents();
    el.remove();
  }

  getFormConfig() {
    switch (true) {
      case this.el.classList.contains('perpeptual'):
        return formConfig.perpeptual;
      case this.el.classList.contains('connect'):
        formConfig.connect.blockDataset['form-type'] = this.el.classList.contains('enterprise') ? 'form.connect.enterprise.action' : 'form.connect.action';
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
    // demandbase
    const db = formMetadata.find((el) => el.classList.contains('icon-demandbase-on'));
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
    if (db) {
      // eslint-disable-next-line no-unused-vars
      const demandBase = new DemandBase(this.demandBaseConfig);
    }
  }
}

function isSignedInInitialized(interval = 200) {
  return new Promise((resolve) => {
    function poll() {
      if (window.adobeIMS?.isSignedInUser) resolve();
      else setTimeout(poll, interval);
    }
    poll();
  });
}

export default async function init(el) {
  const formComponent = new CCForms(el);
  if (formComponent.formConfig.type === 'default') return el.remove();
  isSignedInInitialized().then(async () => {
    if (!window.adobeIMS.isSignedInUser()) return window.adobeIMS.signIn();
    const { default: FormConfigurator } = await import(formComponent.formConfig.jsPath);
    const fc = new FormConfigurator(formComponent.form);
    el.remove();
    return fc;
  });
  return 1;
}
