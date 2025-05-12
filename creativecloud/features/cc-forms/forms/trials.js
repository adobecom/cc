/* eslint-disable comma-spacing */
/* eslint-disable consistent-return */
/* eslint-disable class-methods-use-this */
/* eslint-disable max-classes-per-file */
import { createTag, loadStyle } from '../../../scripts/utils.js';

const SELECTOR_BUTTON = '.cc-form-component.con-button.submit';
const BUTTON_DISABLED_CLASS = 'is-disabled';
const DATA_THANK_YOU_PAGE = 'data-thankyoupage';
const DATA_CLIENT_NAME = 'data-clientName';
const DATA_FORM_TYPE = 'data-form-type';
const CONF_KEY_ERROR_GENERIC = 'genericerrorpage';
const CONF_KEY_ERROR_UNAVAILABLE = 'serviceunavailableerrorpage';
const DATA_APIKEY = 'data-apiKey';
const DATA_ENDPOINT = 'data-endpoint';
const SELECTOR_ELEMENTS = '.cc-form-component';
const SELECTOR_CIRCLE_LOADER = '.hawksForms-circleLoader';
const CLASS_CIRCLE_LOADER_VISIBLE = 'visible';
const CIRCLE_LOADER_TIMEOUT = 30000;
const ADDRESS_MAIL_TO = 'data-imsAddressMailValue';
const USER_PROFILE = 'data-userProfileValue';
const REQUEST_CONTENT_TYPE = 'application/json; charset=utf-8';
const INPUT_FIELDS = '.cc-form-component.text';
const STATUS_REDIRECT_MAP = {
  'thank-you-redirect': 'thankyoupage',
  'error-redirect-generic': 'genericerrorpage',
  'error-redirect-restriction': 'restrictionerrorpage',
  'error-redirect-invalid-format': 'invalidformdataerrorpage',
  'error-redirect-jms': 'jmsunknownerrorpage',
  'error-redirect-bama': 'bamaunknownerrorpage',
  'error-redirect-service-unavailable': 'serviceunavailableerrorpage',
};

export class TextContent {
  constructor(formEl, config) {
    this.form = formEl;
    this.fieldConfig = config;
    this.init();
  }

  init() {
    const d = createTag('div', { class: 'form-item' }, this.fieldConfig.value);
    const fieldType = this.fieldConfig.type.split('cc-form-content-').pop();
    if (fieldType) d.classList.add(fieldType);
    this.form.append(d);
  }
}
export class Button {
  constructor(formEl, config) {
    this.form = formEl;
    this.fieldConfig = config;
    this.btnEl = this.createButton();
  }

  createButton() {
    const fieldType = this.fieldConfig.type.split('cc-form-button-').pop();
    switch (fieldType) {
      case 'submit': {
        const a = createTag('a', { href: '#', class: 'con-button blue button-l cc-form-component submit' }, this.fieldConfig.label.innerText.trim());
        a.addEventListener('click', (e) => e.preventDefault());
        const d = createTag('div', { class: 'form-item' }, a);
        this.form.append(d);
        this.setRedirectAttributes();
        return a;
      }
      case 'productskudownload': {
        const downloadURL = window.localStorage.getItem('productSkuDownloadUrl');
        if (!downloadURL) return;
        const a = createTag('a', { href: downloadURL, class: 'is-hidden' }, 'Download Started');
        this.form.append(a);
        a.click();
        window.localStorage.removeItem('productSkuDownloadUrl');
        break;
      }
      default:
        break;
    }
  }

  setRedirectAttributes() {
    Object.keys(this.fieldConfig).forEach((kraw) => {
      if (!STATUS_REDIRECT_MAP[kraw]) return;
      this.form.setAttribute(`data-${STATUS_REDIRECT_MAP[kraw].toLowerCase()}`, this.fieldConfig[kraw].querySelector('a').href);
    });
  }
}

export class ConsentNotice {
  constructor(form, formCongfig) {
    this.form = form;
    this.formCongfig = formCongfig;
    this.cnConfig = this.getCNConfigs();
    this.noticeEl = this.createNoticeEl();
    this.noticeBody = '';
    this.userCountry = new URLSearchParams(window.location.search).get('imsCountry') || undefined;
    this.marketingPermissions = {};
    this.noticeEmailPreset = '';
    this.noticePhonePreset = '';
    if (this.userCountry !== undefined) {
      this.setNoticetags(this.userCountry);
      this.setNoticeBody();
      this.observeNoticeCheckboxes();
    } else {
      this.setNoticetagswithCountryCode();
    }
  }

  createNoticeEl() {
    const notice = createTag('div', { class: 'noticeplaceholder', id: 'noticeplaceholder' });
    const d = createTag('div', { class: 'form-item' }, notice);
    this.form.append(d);
    return notice;
  }

  getCNConfigs() {
    const cnconfig = {
      consumer: {
        soft: {
          countryList: ['ROW'],
          email: 'true',
          emailpreset: 'no',
          phone: 'false',
          phonepreset: '',
        },
        implicit: {
          countryList: ['JP','IN','US'],
          email: 'true',
          emailpreset: 'yes',
          phone: 'false',
          phonepreset: '',
        },
        explicitemail: {
          countryList: ['AU','KR','SG'],
          email: 'true',
          emailpreset: 'no',
          phone: 'false',
          phonepreset: '',
        },
        explicitemailphone: { // to check on any page
          countryList: [],
          email: 'true',
          emailpreset: 'no',
          phone: 'true',
          phonepreset: 'no',
        },
      },
      enterprise: {
        soft: { // to check on any page
          countryList: [],
          email: 'true',
          emailpreset: 'no',
          phone: 'false',
          phonepreset: '',
        },
        implicit: {
          countryList: ['SE','US','FI','PT','LV','FR','UK','IE','EE','IN','ROW'],
          email: 'true',
          emailpreset: 'yes',
          phone: 'true',
          phonepreset: 'yes',
        },
        explicitemail: {
          countryList: ['DE','RU','BE','BG','JP','DK','LT','LU','HU','SG','SI','SK','CH','KR','MT','IT','GR','ES','AT','AU','CY','CZ','PL','RO','NL'],
          email: 'true',
          emailpreset: 'no',
          phone: 'false',
          phonepreset: '',
        },
        explicitemailphone: {
          countryList: ['DE','RU','BE','BG','JP','DK','LT','LU','HU','SG','SI','SK','CH','KR','MT','IT','GR','ES','AT','AU','CY','CZ','PL','RO','NL'],
          email: 'true',
          emailpreset: 'no',
          phone: 'true',
          phonepreset: 'no',
        },
      },
    };
    return cnconfig;
  }

  imsReady({ interval = 200, maxAttempts = 25 } = {}) {
    return new Promise((resolve) => {
      let count = 0;
      function poll() {
        count += 1;
        if (window.adobeIMS?.isSignedInUser) {
          resolve();
        } else if (count + 1 > maxAttempts) {
          resolve();
        } else {
          setTimeout(poll, interval);
        }
      }
      poll();
    });
  }

  setNoticetagswithCountryCode() {
    const promise = this.imsReady();
    return promise.then(() => {
      this.processOnLoggedInUser();
    }).catch(() => {});
  }

  processOnLoggedInUser() {
    const isSignedInUser = window.adobeIMS.isSignedInUser();
    if (!isSignedInUser) return;
    const userProfilePromise = window.adobeIMS.getProfile();
    userProfilePromise.then((profile) => {
      if (!profile.countryCode) return;
      this.setNoticetags(profile.countryCode);
      this.setNoticeBody();
      this.observeNoticeCheckboxes();
      this.form.dispatchEvent(new CustomEvent('cc:consent-ready'));
    }).catch(() => {});
  }

  getUserGroup(userCountry) {
    for (let i = 0; i < this.formCongfig.concentCfgs.length; i += 1) {
      const [btype, ntype] = this.formCongfig.concentCfgs[i].bucketNoticeType.split('-');
      const cl = this.cnConfig[btype][ntype].countryList;
      if (cl.length && cl.includes(userCountry)) {
        return {
          countryCode: userCountry,
          consentFragment: this.formCongfig.concentCfgs[i].consetFragment,
          bucketType: btype,
          noticeType: ntype,
        };
      }
    }
  }

  setNoticetags(userCountry) {
    const consentBody = this.getUserGroup(userCountry);
    if (consentBody?.countryCode) {
      const { childNodes } = consentBody.consentFragment;
      childNodes.forEach((child) => {
        this.noticeEl.appendChild(child);
      });
      this.setNoticeChannels(consentBody.bucketType, consentBody.noticeType);
      return;
    }
    if (userCountry !== 'ROW') this.setNoticetags('ROW');
  }

  setNoticeChannels(bucketType, noticeType) {
    const noticechannelsEmail = this.cnConfig[bucketType][noticeType].email;
    if (noticechannelsEmail === 'true') this.noticeEmailPreset = this.cnConfig[bucketType][noticeType].emailpreset;
    const noticechannelsPhone = this.cnConfig[bucketType][noticeType].phone;
    if (noticechannelsPhone === 'true') this.noticePhonePreset = this.cnConfig[bucketType][noticeType].phonepreset;
    this.setMarketingPermissionAttr();
  }

  setNoticeBody() {
    const consentNotice = this.noticeEl.querySelectorAll('p, .form-items');
    consentNotice.forEach((e) => { this.noticeBody += e.innerHTML; });
    this.noticeEl.setAttribute('data-notice-body', this.noticeBody.trim());
  }

  observeNoticeCheckboxes() {
    const checkboxes = this.noticeEl.querySelectorAll('.cc-form-component.check-item-input');
    [...checkboxes].forEach((elem) => {
      elem.addEventListener('change', (elemChanged) => {
        if (elemChanged.target.id === 'consentexplicitemail' || elemChanged.target.id === 'consentsoft') {
          this.noticeEmailPreset = this.inversePermissionValue(this.noticeEmailPreset);
        } else if (elemChanged.target.id === 'consentexplicitphone') {
          this.noticePhonePreset = this.inversePermissionValue(this.noticePhonePreset);
        }
        this.setMarketingPermissionAttr();
      });
    });
  }

  inversePermissionValue(defaultPermission) {
    return defaultPermission !== undefined && defaultPermission === 'no' ? 'yes' : 'no';
  }

  getBooleanValue(value) {
    return value !== undefined && value === 'yes';
  }

  setMarketingPermissionAttr() {
    if (this.noticeEmailPreset !== '') {
      this.marketingPermissions.EMAIL = this.getBooleanValue(this.noticeEmailPreset);
    }
    if (this.noticePhonePreset !== '') {
      this.marketingPermissions.PHONE = this.getBooleanValue(this.noticePhonePreset);
    }
    this.noticeEl.setAttribute('data-marketing-permissions', JSON.stringify(this.marketingPermissions));
  }
}
class Trials {
  constructor(formContainer, authConfig) {
    this.imslib = window.adobeIMS;
    this.formContainer = formContainer;
    this.authConfig = authConfig;
    this.valid = true;
    this.formConfig = [];
    this.payLoad = {};
    this.clientName = this.formContainer.getAttribute(DATA_CLIENT_NAME) || '';
    this.accessToken = window.localStorage.getItem('accessToken') || window.adobeIMS.getAccessToken();
    this.elements = this.formContainer.querySelectorAll(SELECTOR_ELEMENTS);
    this.thankyouPage = this.formContainer.getAttribute(DATA_THANK_YOU_PAGE) || '';
    this.apikey = this.formContainer.getAttribute(DATA_APIKEY) || '';
    this.endPoint = this.formContainer.getAttribute(DATA_ENDPOINT) || '';
    this.address_mail_to = this.formContainer.hasAttribute(ADDRESS_MAIL_TO) ? this.formContainer.getAttribute(ADDRESS_MAIL_TO).split(',') : '';
    this.userprofile = this.formContainer.hasAttribute(USER_PROFILE) ? this.formContainer.getAttribute(USER_PROFILE).split(',') : '';
    this.circleLoader = this.formContainer.querySelector(SELECTOR_CIRCLE_LOADER);
    this.event = new Event('checkValidation');
    this.inputElements = this.formContainer.querySelectorAll(INPUT_FIELDS);
    this.setFormConfig();
    this.handleEnterKeyPress();
  }

  handleEnterKeyPress() {
    this.inputElements.forEach((element) => {
      element.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' || e.keyCode === 13) e.preventDefault();
      });
    });
  }

  checkValidElements() {
    this.valid = true;
    this.elements.forEach((element) => {
      if (element.getAttribute('data-valid') === 'false') {
        this.valid = false;
      }
    });
  }

  buttonListener() {
    this.formContainer.querySelector(SELECTOR_BUTTON).addEventListener('click', () => {
      this.form.setAttribute('data-show-error', 'true');
      this.formContainer.dispatchEvent(this.event);
      try {
        this.checkValidElements();
        // eslint-disable-next-line chai-friendly/no-unused-expressions
        setTimeout(() => { this.showError === true; }, 100);
      } catch (e) { /* pass */ }
      if (this.valid) {
        this.circleLoaderShow(this.formContainer.querySelector(SELECTOR_BUTTON));
        setTimeout(() => { this.submitAction(); }, 1);
      }
    });
  }

  getUUID() {
    return window.crypto.randomUUID();
  }

  setFormConfig() {
    const formConfig = [];
    Object.keys(STATUS_REDIRECT_MAP).forEach((k) => {
      const redirectUrl = this.authConfig.querySelector(`.icon-${k}`)?.parentElement?.nextElementSibling?.querySelector('a')?.href;
      if (!redirectUrl) return;
      this.formContainer.setAttribute(`data-${STATUS_REDIRECT_MAP[k]}`, redirectUrl);
      formConfig[STATUS_REDIRECT_MAP[k]] = redirectUrl;
    });
    this.formConfig = formConfig;
  }

  getFormConfig(key) {
    return this.formContainer.getAttribute(key) || this.formConfig[CONF_KEY_ERROR_GENERIC];
  }

  postSubmitSuccess(response) {
    const errorMap = {
      NOT_ELIGIBLE_FOR_TRIAL: 'restrictionerrorpage',
      INVALID_PAYLOAD: 'invalidformdataerrorpage',
      UNEXPECTED_JMS_ERROR: 'jmsunknownerrorpage',
      UNEXPECTED_BAMA_ERROR: 'bamaunknownerrorpage',
    };
    let destination = this.thankyouPage;
    if ((this.formContainer.getAttribute(DATA_FORM_TYPE) === 'form.connect.action'
    || this.formContainer.getAttribute(DATA_FORM_TYPE) === 'form.connect.enterprise.action')
    && response.reason && response.reason !== 'SUCCESS' && Object.prototype.hasOwnProperty.call(errorMap, response.reason)) {
      destination = this.getFormConfig(`data-${errorMap[response.reason]}`);
    }
    window.location.href = destination;
  }

  postSubmitFailure(response) {
    let destination = this.getFormConfig(`data-${CONF_KEY_ERROR_GENERIC}`);
    if (response.status === 502 || response.status === 503) {
      destination = this.getFormConfig(`data-${CONF_KEY_ERROR_UNAVAILABLE}`);
    }
    window.location.href = destination;
  }

  createProgressCircle() {
    const pdom = `<div class="spectrum-ProgressCircle-track"></div><div class="spectrum-ProgressCircle-fills">
      <div class="spectrum-ProgressCircle-fillMask1">
        <div class="spectrum-ProgressCircle-fillSubMask1">
          <div class="spectrum-ProgressCircle-fill"></div>
        </div>
      </div>
      <div class="spectrum-ProgressCircle-fillMask2">
        <div class="spectrum-ProgressCircle-fillSubMask2">
          <div class="spectrum-ProgressCircle-fill"></div>
        </div>
      </div>
    </div>`;
    const prgc = createTag('div', { class: 'spectrum-ProgressCircle spectrum-ProgressCircle--indeterminate' }, pdom);
    const layer = createTag('div', { class: 'progress-holder' }, prgc);
    layer.classList.add(SELECTOR_CIRCLE_LOADER);
    return layer;
  }

  circleLoaderHide() {
    this.circleLoader.classList.remove(CLASS_CIRCLE_LOADER_VISIBLE);
  }

  circleLoaderShow(targetEl) {
    loadStyle('/creativecloud/features/cc-forms/components/progress-circle.css');
    const form = this;
    const progressHolder = targetEl.querySelector('.progress-holder');
    if (!progressHolder) {
      form.circleLoader = form.createProgressCircle();
      form.circleLoader.classList.add(CLASS_CIRCLE_LOADER_VISIBLE);
      targetEl.append(form.circleLoader);
    }
    if (targetEl.classList.contains('loading')) targetEl.classList.remove('loading');
    else targetEl.classList.add('loading');
    setTimeout(() => {
      form.circleLoaderHide();
    }, CIRCLE_LOADER_TIMEOUT);
  }

  getPST() {
    const d = new Date();
    const offset = 60000 - 28800000;
    const pst = new Date(d.getTime() + d.getTimezoneOffset() * offset).toJSON();
    return pst;
  }

  escapeXml(unsafe) {
    return unsafe.replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
        default: return '';
      }
    });
  }

  constructDemandbaseValues(payload) {
    return payload;
  }

  getValue(selector, attr) {
    const attribute = attr || 'value';
    try {
      const elem = this.formContainer.querySelector(selector);
      if (!(elem instanceof HTMLElement)) return false;
      if (attribute === 'value') return elem.value;
      return elem.getAttribute(attribute);
    } catch (e) {
      return false;
    }
  }

  setValue(selector, value, attr) {
    const attribute = (typeof attr !== 'undefined') ? attr : 'value';
    const elem = this.formContainer.querySelector(selector);
    if (!(elem instanceof HTMLElement)) return false;
    if (!value) return false;
    if (attr === 'value') {
      elem.value = value;
    } else {
      elem.setAttribute(attribute, value);
    }
    return true;
  }

  getCookieValueByName(cookieName) {
    const name = `${cookieName}=`;
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i += 1) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1);
      if (c.indexOf(name) === 0) return c.substring(name.length, c.length);
    }
    return '';
  }

  setCookie(cookie, value, options) {
    let newCookie = '';
    let cookiePath;
    let cookieExpiration;
    let cookieDomain;
    if (typeof cookie === 'string' && cookie.length && (typeof document.cookie === 'string')) {
      newCookie += `${cookie}=${value}`;
      if (options) {
        cookiePath = options.path;
        if (typeof cookiePath === 'string' && cookiePath.length) {
          newCookie += `; path=${cookiePath}`;
        }
        cookieExpiration = options.expiration;
        if (cookieExpiration instanceof Date) {
          newCookie += `; expires=${cookieExpiration.toUTCString()}`;
        }
        cookieDomain = options.domain;
        if (typeof cookieDomain === 'string' && cookieDomain.length) {
          newCookie += `; domain=${cookieDomain}`;
        }
      }
      document.cookie = newCookie;
    }
  }

  postCommonService(accessToken, payLoad, endPoint) {
    window.fetch(endPoint, {
      method: 'POST',
      headers: {
        'Content-Type': REQUEST_CONTENT_TYPE,
        Authorization: `${accessToken}`,
      },
      body: JSON.stringify(payLoad),
    })
      .then((response) => {
        response.json().then((data) => {
          if (response.status === 200 && (data.successful || data.success)) {
            this.postSubmitSuccess(data);
          } else if (response.status === 200
          && (this.formContainer.getAttribute(DATA_FORM_TYPE) === 'form.connect.action'
          || this.formContainer.getAttribute(DATA_FORM_TYPE) === 'form.connect.enterprise.action')) {
            this.postSubmitSuccess(data);
          } else {
            this.postSubmitFailure(response);
          }
        })
          .catch(() => {
            this.postSubmitFailure(response);
          });
      });
  }

  toggleSubmitButton(disabled) {
    const button = this.formContainer.querySelector(SELECTOR_BUTTON);
    if (disabled) {
      button.classList.add(BUTTON_DISABLED_CLASS);
      button.setAttribute('disabled', 'disabled');
      button.style.pointerEvents = 'none';
    } else {
      button.classList.remove(BUTTON_DISABLED_CLASS);
      button.removeAttribute('disabled');
      button.style.pointerEvents = 'auto';
    }
  }
}

export default Trials;
