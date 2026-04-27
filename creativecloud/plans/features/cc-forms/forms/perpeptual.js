/* eslint-disable no-underscore-dangle */
import Trials from './trials.js';

const SELECTOR = {
  NO_LEAD: '#nolead',
  JOB_TITLE: '#jobtitle',
  COMPANY: '#orgname',
  PHONE_NUMBER: '#phonenumber',
  JOB_FUNCTION: '#jobfunction',
  INDUSTRY: '#industry',
  POSTAL_CODE: '#postalcode',
  STATE: '#state',
  PRODUCT_SKU: '#productsku',
  PRODUCT: '#product',
  ORG_SIZE: '#orgsize',
  PURCHASE_TIMEFRAME: '#timeframe',
  EMP_USING_PRODUCT: '#estunitship',
  PT_DOWNLOAD_FORM: '#ptDownloadForm',
  WEBSITE: '#website',
  COUNTRY: '#country',
  USER_TYPE: '#usertype',
  EMAIL_TEMPLATE: '#email_template',
  ACTIONS: '#actions',
  EXISTING_USER: '#existinguser',
  PURCHASE_INTEND: '#purchaseintent',
  BUTTON: '.cc-form-component.con-button.submit',
};
const REQUEST_CONTENT_TYPE = 'application/json; charset=utf-8';
const TRIALS_DOWNLOAD = 'trial_downloads';
const NOTICE_ID = '#noticeplaceholder';
const ATTRIBUTE = {
  DATA_EMAIL: 'data-email',
  DATA_CTX_ID: 'data-ctxid',
  DATA_THANK_YOU_PAGE: 'data-thankyoupage',
};

class PerpetualTrials extends Trials {
  constructor(form, authConfig) {
    super(form, authConfig);
    this.form = form;
    this.authConfig = authConfig;
    this.initVars();
    this.thankyouPage = this.form.getAttribute(ATTRIBUTE.DATA_THANK_YOU_PAGE);
    const notice = this.form.querySelector(NOTICE_ID);
    if (notice) {
      const xf = notice.querySelector('.fragment');
      if (xf) {
        this.buttonListener();
      } else {
        this.form.addEventListener('cc:consent-ready', () => { this.buttonListener(); });
      }
    } else {
      this.form.addEventListener('cc:consent-ready', () => { this.buttonListener(); });
    }
    const ptDownloadForm = document.getElementById('ptDownloadForm');
    if (ptDownloadForm) {
      const contextId = ptDownloadForm.getAttribute(ATTRIBUTE.DATA_CTX_ID)
        ? ptDownloadForm.getAttribute(ATTRIBUTE.DATA_CTX_ID) : TRIALS_DOWNLOAD;
      const ptrialAC = `Adobe.com_ptrials_${ptDownloadForm.value}:Adobe.com_ptrials_${this.thankyouPage}`;
      window.adobeid.api_parameters = { authorize: { state: { ac: ptrialAC }, ctx_id: contextId } };
    }
  }

  initVars() {
    this.isNoLeadProduct = this.getValue(SELECTOR.NO_LEAD);
    this.orgSize = '';
    this.setOrgFlag = false;
    this.rengaUri = `/api2/marketing_get_uds?api_key=${this.apikey}`;
    try { this.locale = this.imslib.adobeid.locale; } catch (e) { this.locale = 'en_US'; }
    const userProfilePromise = this.imslib.getProfile();
    userProfilePromise.then((profile) => {
      if (!profile.userId) return;
      this.imsProfile = profile;
      this.populateForm();
    });
  }

  populateForm() {
    if (!this.imsProfile) return;
    // eslint-disable-next-line consistent-return
    if (this.isNoLeadProduct) return this.setValue(SELECTOR.PRODUCT_SKU, this.autoSelectBit());
    if (this.form.querySelector('[data-dropdown-name=country]') instanceof HTMLElement) {
      try {
        const elemButton = this.form.querySelector('[data-dropdown-name=country]');
        elemButton.querySelector('option[selected=selected]').removeAttribute('selected');
        elemButton.querySelector(`option[data-value=${this.imsProfile.countryCode}]`).setAttribute('selected', 'selected');
        const dropdown = this.form.querySelector('[name=country]');
        dropdown.setAttribute('disabled', 'true');
        const event = new Event('change', { bubbles: true });
        elemButton.querySelector(`option[data-value=${this.imsProfile.countryCode}]`).dispatchEvent(event);
      } catch (e) { /* pass */ }
    }
    this.setValue(SELECTOR.JOB_TITLE, this.imsProfile.job_title);
    this.setValue(SELECTOR.COMPANY, this.imsProfile.company);
    this.setValue(SELECTOR.PHONE_NUMBER, this.imsProfile.phoneNumber);
    this.setValue(SELECTOR.PRODUCT_SKU, this.autoSelectBit());
    this.setValue(SELECTOR.JOB_FUNCTION, this.imsProfile.job_function);
    this.setValue(SELECTOR.POSTAL_CODE, this.imsProfile['address.mail_to'] && this.imsProfile['address.mail_to'].postalZip ? this.imsProfile['address.mail_to'].postalZip : '');
    // if (this.form.querySelector(SELECTOR.ORG_SIZE)) this.setOrgSize();
  }

  // eslint-disable-next-line class-methods-use-this
  autoSelectBit() {
    let OSName = 'Unsupported';
    let OSSelect = '';
    const { userAgent } = window.navigator;
    if (userAgent.indexOf('Win') !== -1) OSName = 'Windows |';
    if (userAgent.indexOf('Mac') !== -1) OSName = 'Mac';
    if (userAgent.indexOf('X11') !== -1) OSName = 'UNIX';
    if (userAgent.indexOf('Linux') !== -1) OSName = 'Linux';
    if (userAgent.indexOf('WOW64') !== -1 || userAgent.indexOf('Win64') !== -1) OSName = 'Windows 64-bit';
    if (OSName === 'Unsupported') OSSelect = 'Undefined';
    return OSSelect;
  }

  setOrgSize() {
    this.setOrgFlag = true;
    const rengaJson = {
      guid: this.imslib.isSignedIn(),
      rengatoken: this.getCookieValueByName('WCDServer'),
      appdomain: 'ACOM_ECOM',
    };
    this.accesstoken = this.imslib.getAccessToken().token;
    this.postCommonService(this.accesstoken, rengaJson, this.rengaUri);
  }

  submitAction() {
    const ptDownloadForm = document.getElementById('ptDownloadForm');
    if (window.digitalData && ptDownloadForm !== null) {
      const primaryEvent = window.digitalData.primaryEvent ? window.digitalData.primaryEvent : {};
      const eventInfo = primaryEvent.eventInfo ? primaryEvent.eventInfo : {};
      const digitalDataObj = window.alloy_all.data._adobe_corpnew.digitalData;
      const pageName = digitalDataObj?.page?.pageInfo?.pageName ? digitalDataObj.page.pageInfo.pageName : '';
      eventInfo.eventName = `${pageName}_submitButtonClick`;
      eventInfo.eventAction = 'event14';
      primaryEvent.eventInfo = eventInfo;
      window.digitalData.primaryEvent = primaryEvent;
    }
    if (window._satellite) window._satellite.track('trackPerpetualTrialDownloadFormSubmit');
    this.setOrgFlag = false;
    this.payLoad = this.isNoLeadProduct ? this.getPayloadForNoLead() : this.getPayloadForLead();
    this.addGdprPropertiesToPayload();
    this.accesstoken = this.imslib.getAccessToken().token;
    this.setDownloadFile();
    this.postCommonService(this.accesstoken, this.payLoad, this.endPoint);
  }

  setDownloadFile() {
    const productSkuValue = this.getValue(SELECTOR.PRODUCT_SKU);
    let date = new Date();
    date = date.setTime(date.getTime() + 60 * 60 * 1000);
    const cookieDetails = { path: '/', domain: '.adobe.com', expiration: date };
    this.setCookie('MM_TRIALS', '12345', cookieDetails);
    if (!productSkuValue) return false;
    const downloadUrl = productSkuValue.split('|')[0].trim();
    return this.downloadFile(downloadUrl);
  }

  // eslint-disable-next-line class-methods-use-this
  downloadFile(downloadUrl) {
    if (!downloadUrl) return;
    window.localStorage.setItem('productSkuDownloadUrl', downloadUrl);
  }

  getTIDCookie() {
    const TIDCookieValue = decodeURIComponent(this.getCookieValueByName('TID')) || '';
    if (TIDCookieValue && TIDCookieValue.length > 0) return TIDCookieValue.trim();
    return TIDCookieValue;
  }

  getPayloadForLead() {
    const jsonPayload = {
      ims: {
        ims_client_id: 'trials1',
        userProfile: this.imsProfile || {},
        access_token: this.imslib.getAccessToken().token,
        renga_token: this.getCookieValueByName('WCDServer'),
      },
      actions: ['apo', 'ims_update', 'ok_to_call', 'renga_uds', 'lead', 'ice'],
      custom: {},
      client_name: this.clientName || 'trials',
      message_uuid: this.getUUID(),
    };
    const countryCode = this.imsProfile ? this.imsProfile.countryCode : undefined;

    if (typeof jsonPayload.ims.userProfile['address.mail_to'] === 'undefined') {
      jsonPayload.ims.userProfile['address.mail_to'] = {
        primary: true,
        carrierRoute: null,
        city: null,
        countryCode: null,
        countryRegion: null,
        homeCity: null,
        line1: null,
        line2: null,
        line3: null,
        line4: null,
        line5: null,
        line6: null,
        postalZip: null,
        stateProv: null,
        suiteApt: null,
      };
    }
    if ((!this.imsProfile) || (!this.imsProfile.mrktPerm) || (!this.imsProfile.mrktPerm.match('(EMAIL:true|EMAIL:false)'))) jsonPayload.ims.userProfile.mrktPerm = 'EMAIL:false';
    if ((!this.imsProfile) || (!this.imsProfile.mrktPerm) || (!this.imsProfile.mrktPerm.match('(PHONE:true|PHONE:false)'))) jsonPayload.ims.userProfile.mrktPerm = `${jsonPayload.ims.userProfile.mrktPerm},PHONE:false`;
    if (jsonPayload.ims.userProfile.mrktPerm.match('(PHONE:true|PHONE:false)')[0].substr(6, 5) === 'true') {
      jsonPayload.actions.splice(jsonPayload.actions.indexOf('ok_to_call'), 1);
    }
    if (!this.getValue(SELECTOR.ORG_SIZE)
      || this.orgSize === this.getValue(SELECTOR.ORG_SIZE)) {
      jsonPayload.actions.splice(jsonPayload.actions.indexOf('renga_uds'), 1);
    } else {
      jsonPayload.ims.renga_uds = {
        key: 'NUMBER_OF_EMPLOYEES',
        value: this.getValue(SELECTOR.ORG_SIZE),
        domain: 'ACOM_ECOM',
      };
    }
    const emailTemplate = this.getValue(SELECTOR.PT_DOWNLOAD_FORM, ATTRIBUTE.DATA_EMAIL);
    if (emailTemplate && emailTemplate.length === 0) {
      jsonPayload.actions.splice(jsonPayload.actions.indexOf('apo'), 1);
    } else {
      jsonPayload.custom.email_template = emailTemplate;
    }
    jsonPayload.ims.userProfile.job_title = this.getValue(SELECTOR.JOB_TITLE) ? this.getValue(SELECTOR.JOB_TITLE) : '';
    jsonPayload.ims.userProfile.job_function = this.getValue(SELECTOR.JOB_FUNCTION);
    jsonPayload.ims.userProfile.company = this.getValue(SELECTOR.COMPANY);
    jsonPayload.ims.userProfile.phoneNumber = this.getValue(SELECTOR.PHONE_NUMBER);
    jsonPayload.ims.userProfile.industry = this.getValue(SELECTOR.INDUSTRY);
    jsonPayload.ims.userProfile['address.mail_to'].postalZip = this.getValue(SELECTOR.POSTAL_CODE);
    jsonPayload.ims.userProfile['address.mail_to'].stateProv = this.getValue(SELECTOR.STATE);
    jsonPayload.ims.userProfile['address.mail_to'].countryRegion = this.getValue(SELECTOR.STATE);
    jsonPayload.ims.userProfile['address.mail_to'].countryCode = countryCode !== null ? countryCode : this.getValue(SELECTOR.COUNTRY);
    const skuElement = this.form.querySelector('[data-dropdown-name="productsku"]');
    if (skuElement) this.skuValue = skuElement.querySelectorAll('option')[skuElement.selectedIndex].getAttribute('sku');
    jsonPayload.custom.locale = this.imslib.adobeid.locale;
    jsonPayload.custom.website = this.getValue(SELECTOR.WEBSITE);
    jsonPayload.custom.campaignId = this.skuValue;
    jsonPayload.custom.purchasetimeframe = this.getValue(SELECTOR.PURCHASE_TIMEFRAME);
    jsonPayload.custom.emp_using_product = this.getValue(SELECTOR.EMP_USING_PRODUCT) ? this.getValue(SELECTOR.EMP_USING_PRODUCT) : '';
    jsonPayload.custom.treatmentid = this.getTIDCookie();
    jsonPayload.custom.assignedid = (!(document.URL.match(/assigned_id=([a-zA-Z0-9]+)/))) ? '' : (document.URL.match(/assigned_id=([a-zA-Z0-9]+)/))[1];
    jsonPayload.custom.industry = this.getValue(SELECTOR.INDUSTRY);
    jsonPayload.custom.jobfunction = this.getValue(SELECTOR.JOB_FUNCTION);
    jsonPayload.custom.state = this.getValue(SELECTOR.STATE);
    jsonPayload.custom.orgsize = this.getValue(SELECTOR.ORG_SIZE);
    jsonPayload.custom.dateandtime = this.getPST();
    jsonPayload.custom.language = (this.form.querySelector(SELECTOR.PRODUCT_SKU) && this.form.querySelector(SELECTOR.PRODUCT_SKU).innerText.split('|').length > 1) ? this.form.querySelector(SELECTOR.PRODUCT_SKU).innerText.split('|')[1].trim() : '';
    jsonPayload.custom.product = this.getValue(SELECTOR.PT_DOWNLOAD_FORM);
    const comments = this.escapeXml(((!this.getValue('#usertype')) ? '' : this.getValue('#usertype')).concat('|', ((!this.getValue('#purchaseintent')) ? '' : this.getValue('#purchaseintent')), '|', ((!this.getValue('#softwaredetail')) ? '' : this.escapeXml(this.getValue('#softwaredetail').trim())), '|', ((!this.getValue('#PREtrialPage-PREowner')) ? '' : this.getValue('#PREtrialPage-PREowner').is(':checked')), '|', ((!this.getValue('#PSEtrialPage-PSEowner')) ? '' : this.getValue('#PSEtrialPage-PSEowner').is(':checked'))));
    jsonPayload.custom.questions_comments = comments.concat('|', (!this.getValue('#existinguser') ? '' : this.getValue('#existinguser')), '|', ((!this.getValue('#knowmorescp')) ? '' : this.getValue('#knowmorescp')));
    this.constructDemandbaseValues(jsonPayload);
    return jsonPayload;
  }

  getPayloadForNoLead() {
    const skuElement = this.form.querySelector('[data-dropdown-name="productsku"]');
    if (skuElement) this.skuValue = skuElement.querySelectorAll('option')[skuElement.selectedIndex].getAttribute('sku');
    const jsonPayload = {
      client_name: this.clientName || 'trials',
      message_uuid: this.getUUID(),
      ims: {
        userProfile: this.imsProfile,
        access_token: this.imslib.getAccessToken().token,
        renga_token: this.getCookieValueByName('WCDServer'),
      },
      custom: {
        locale: this.imslib.adobeid.locale,
        campaignId: this.skuValue,
        email_template: this.getValue(SELECTOR.EMAIL_TEMPLATE),
        treatmentid: this.getTIDCookie(),
        assignedid: (!(document.URL.match(/assigned_id=([a-zA-Z0-9]+)/))) ? '' : (document.URL.match(/assigned_id=([a-zA-Z0-9]+)/))[1],
        dateandtime: this.getPST(),
        language: (this.form.querySelector(SELECTOR.PRODUCT_SKU).innerText && this.form.querySelector(SELECTOR.PRODUCT_SKU).innerText.split('|').length > 1) ? this.form.querySelector(SELECTOR.PRODUCT_SKU).innerText.split('|')[1].trim() : '',
        product: this.getValue(SELECTOR.PT_DOWNLOAD_FORM),
      },
      actions: ['apo', 'ice', 'ims_update', 'ok_to_call'],
    };
    if (typeof this.getValue(SELECTOR.WEBSITE) !== 'undefined' && this.getValue(SELECTOR.WEBSITE) !== null) {
      jsonPayload.custom.website = this.getValue(SELECTOR.WEBSITE);
    }
    jsonPayload.custom.questions_comments = this.escapeXml(((!this.getValue('#usertype')) ? '' : this.getValue('#usertype')).concat('|', ((!this.getValue('#purchaseintent')) ? '' : this.getValue('#purchaseintent')), '|', ((!this.getValue('#softwaredetail')) ? '' : this.escapeXml(this.getValue('#softwaredetail').trim()))));
    if (this.form.querySelector(SELECTOR.ACTIONS) !== null
      && this.form.querySelector(SELECTOR.ACTIONS).length !== 0) {
      jsonPayload.actions = this.form.querySelector(SELECTOR.ACTIONS).split(',');
    }
    if (!this.getValue(SELECTOR.PT_DOWNLOAD_FORM, ATTRIBUTE.DATA_EMAIL)) {
      jsonPayload.actions.splice(jsonPayload.actions.indexOf('apo'), 1);
    } else {
      const emailTemplate = this.getValue(SELECTOR.PT_DOWNLOAD_FORM, ATTRIBUTE.DATA_EMAIL);
      jsonPayload.custom.email_template = emailTemplate;
    }
    return jsonPayload;
  }

  addGdprPropertiesToPayload() {
    const currentUrl = this.getValue('#current_url');
    if (currentUrl) this.payLoad.custom.current_url = currentUrl;
    const noticeBody = this.getValue('#noticeplaceholder', 'data-notice-body');
    this.payLoad.custom.consent_notice = noticeBody;
    const marketingPermissions = this.getValue('#noticeplaceholder', 'data-marketing-permissions');
    this.payLoad.custom.marketing_permissions = JSON.parse(marketingPermissions);
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
      .then(() => {
        if (this.thankyouPage) {
          window.location.href = this.thankyouPage;
        }
      })
      .catch(() => { });
  }
}
export default PerpetualTrials;
