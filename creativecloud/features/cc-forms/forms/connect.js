/* eslint-disable class-methods-use-this */
import Trials from './trials.js';
import { getConfig } from '../../../scripts/utils.js';

const ipaasParamMap = {
  postalcode: 'postalZip',
  state: 'stateProv',
  country: 'countryCode',
  fname: 'first_name',
  lname: 'last_name',
  phonenumber: 'phoneNumber',
  email: 'email',
  orgname: 'company',
  jobfunction: 'job_function',
  jobtitle: 'job_title',
  industry: 'industry',
  orgsize: 'org_size',
  region: 'region',
  timezone: 'timeZone',
  connectProduct: 'connectProduct',
};

const localeTOBamaLocaleMap = {
  en: 'en',
  pt: 'pt_br',
  ko: 'ko',
  it: 'it',
  de: 'de',
  fr: 'fr',
  nl: 'nl',
  zhHans: 'zh_cn',
  es: 'es',
  ja: 'ja',
};

const TRACKING_ID = 'trackingid';
const P_ID = 'prid';
const C_ID = 'campaignid';
const TID = 'TID';
const PROMO_ID = 'promoid';
const S_ID = 'sdid';
const PSS_ID = 'pss';
const ANYP_ID = 'ANYPROMO';
const UNKNOWN = 'unknown';
const ORG_SIZE = 'orgsize';
const REGION = '#region';
const PURCHASE = 'connectpurchaseintent';
const ASSIGNEE_ID = 'assigned_id';
const TEMPLATE_ID = 'template_id';
const NOTICE_ID = '#noticeplaceholder';
const FNAME = 'fname';
const LNAME = 'lname';

class ConnectTrials extends Trials {
  constructor(form) {
    super(form);
    this.form = form;
    const notice = document.querySelector(NOTICE_ID);
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
    window.adobeid.api_parameters = { authorize: { state: { ac: 'Adobe.com_ctrials_connect' }, ctx_id: 'ct_connect' } };
    const userProfilePromise = this.imslib.getProfile();
    userProfilePromise.then((profile) => {
      if (!profile.userId) return;
      this.imsUserId = profile.userId;
    });
  }

  submitAction() {
    this.accesstoken = this.imslib.getAccessToken().token;
    this.createPayload();
    this.postCommonService(this.accesstoken, this.payLoad, this.endPoint);
  }

  urlParam(name) {
    const sPageURL = window.location.search.substring(1);
    const sURLVariables = sPageURL.split('&');
    for (let i = 0; i < sURLVariables.length; i += 1) {
      const sParameterName = sURLVariables[i].split('=');
      if (sParameterName[0] === name) {
        return sParameterName[1];
      }
    }
    return null;
  }

  getTreatmentID() {
    let tid;
    if (this.urlParam(TRACKING_ID)) {
      tid = this.urlParam(TRACKING_ID);
    } else if (this.urlParam(P_ID)) {
      tid = this.urlParam(P_ID);
    } else if (this.getCookieValueByName(TID)) {
      tid = this.getCookieValueByName(TID);
    } else if (this.urlParam(PROMO_ID)) {
      tid = this.urlParam(PROMO_ID);
    } else if (this.urlParam(S_ID)) {
      tid = this.urlParam(S_ID);
    } else if (this.urlParam(PSS_ID)) {
      tid = this.urlParam(PSS_ID);
    } else if (this.urlParam(C_ID)) {
      tid = this.urlParam(C_ID);
    } else if (this.getCookieValueByName(ANYP_ID)) {
      tid = this.getCookieValueByName(ANYP_ID);
    } else {
      tid = UNKNOWN;
    }
    return tid;
  }

  getTemplateId(region, product) {
    const cfg = getConfig();
    const production = (cfg.env.name === 'prod');
    const regionProductMap = {
      0: {
        meetings: 2072160908,
        webinars: 2072658282,
        learning: 2072160830,
        enterprise: 21576,
      },
      10: {
        meetings: 1893205894,
        webinars: 1893205689,
        learning: 1893512660,
        enterprise: 21576,
      },
      20: {
        meetings: 1098936735,
        webinars: 1098936619,
        learning: 1098943952,
        enterprise: 21576,
      },
      30: {
        meetings: 2072658282,
        webinars: 2072658282,
        learning: 2072160830,
        enterprise: 21576,
      },
    };
    const regionNonProdProductMap = {
      0: {
        meetings: 69864144,
        webinars: 69864814,
        learning: 69864741,
        enterprise: 21576,
      },
      10: {
        meetings: 63685994,
        webinars: 63686422,
        learning: 63686128,
        enterprise: 21308,
      },
      20: {
        meetings: 62775284,
        webinars: 62775417,
        learning: 62775345,
        enterprise: 21404,
      },
      30: {
        meetings: 62701595,
        webinars: 62701728,
        learning: 62701656,
        enterprise: 31566,
      },
    };

    // Return the template id by region and product type
    if (production && regionProductMap[region] != null
        && regionProductMap[region][product] != null) {
      return regionProductMap[region][product];
    }
    if (!production && regionNonProdProductMap[region] != null
        && regionNonProdProductMap[region][product] != null) {
      return regionNonProdProductMap[region][product];
    }
    return 0;
  }

  createPayload() {
    const JsonPayload = {
      ims: {
        ims_client_id: 'trials1',
        userProfile: this.imsProfile || {},
        browser_info: '',
        access_token: this.imslib.getAccessToken().token,
        adobeid: this.imsUserId,
        renga_token: null,
        renga_uds: {},
      },
      actions: ['bama', 'apo', 'lead'],
      custom: {},
      client_name: (!this.clientName) ? 'trials' : this.clientName,
      message_uuid: this.getUUID(),
    };
    const firstName = this.getValue(`[name=${FNAME}]`);
    const lastName = this.getValue(`[name=${LNAME}]`);
    JsonPayload.ims.userProfile.name = `${firstName} ${lastName}`;
    JsonPayload.ims.userProfile.displayName = `${firstName} ${lastName}`;

    if (document.getElementsByName(ORG_SIZE) && document.getElementsByName(ORG_SIZE)[0]) {
      const orgEl = document.getElementsByName(ORG_SIZE)[0];
      JsonPayload.ims.renga_uds.org_size = orgEl.value;
    }

    for (let i = 0; i < this.userprofile.length; i += 1) {
      JsonPayload.ims.userProfile[ipaasParamMap[this.userprofile[i]]] = this.getValue(`[name=${this.userprofile[i]}]`);
    }

    if (typeof JsonPayload.ims.userProfile.address === 'undefined') {
      JsonPayload.ims.userProfile['address.mail_to'] = {};
      JsonPayload.ims.userProfile['address.mail_to'].primary = true;

      for (let i = 0; i < this.address_mail_to.length; i += 1) {
        JsonPayload.ims.userProfile['address.mail_to'][ipaasParamMap[this.address_mail_to[i]]] = (this.getValue(`[name=${this.address_mail_to[i]}]`) === null) ? '' : this.getValue(`[name=${this.address_mail_to[i]}]`);
      }
    }

    const actionName = this.form.getAttribute('data-form-type');
    JsonPayload.custom.type = (actionName === 'form.connect.enterprise.action') ? 'enterprise' : 'standard';
    JsonPayload.custom.language = localeTOBamaLocaleMap[document.getElementsByTagName('html')[0].getAttribute('lang')] || 'en';

    const customGroup = this.formContainer.getAttribute('data-customValue').split(',') || '';
    for (let i = 0; i < customGroup.length; i += 1) {
      JsonPayload.custom[ipaasParamMap[customGroup[i]]] = parseInt(this.getValue(`[name=${customGroup[i]}]`), 10);
    }
    JsonPayload.custom.assignedId = this.urlParam(ASSIGNEE_ID)
      ? this.urlParam(ASSIGNEE_ID) : null;

    if (this.urlParam(TEMPLATE_ID)) {
      JsonPayload.custom.accountTemplateId = this.urlParam(TEMPLATE_ID);
    } else {
      JsonPayload.custom.accountTemplateId = (actionName === 'form.connect.enterprise.action') ? this.getTemplateId(this.getValue(REGION), 'enterprise') : this.getTemplateId(this.getValue(REGION), this.getValue(PURCHASE));
    }

    JsonPayload.custom.connectProduct = (actionName === 'form.connect.enterprise.action') ? 'enterprise' : '';
    if (document.getElementsByName(PURCHASE) && document.getElementsByName(PURCHASE)[0]) {
      const purchaseEl = document.getElementsByName(PURCHASE)[0];
      JsonPayload.custom.connectProduct = purchaseEl.value;
    }
    JsonPayload.custom.treatmentid = this.getTreatmentID();

    // added for gdpr
    const currentUrl = this.getValue('#current_url');
    if (currentUrl) {
      JsonPayload.custom.current_url = currentUrl;
    }

    // add consent notice and marketing permission into payload
    const noticeBody = this.getValue('#noticeplaceholder', 'data-notice-body');
    JsonPayload.custom.consent_notice = noticeBody;
    const marketingPermissions = this.getValue('#noticeplaceholder', 'data-marketing-permissions');
    JsonPayload.custom.marketing_permissions = JSON.parse(marketingPermissions);

    if (typeof this.getValue('#website') !== 'undefined' && this.getValue('#website').length > 0) {
      JsonPayload.custom.website = this.getValue('#website');
    }

    JsonPayload.custom.dateandtime = new Date().toUTCString();
    // calling this from trials
    this.constructDemandbaseValues(JsonPayload);
    this.payLoad = JsonPayload;
  }
}

export default ConnectTrials;
