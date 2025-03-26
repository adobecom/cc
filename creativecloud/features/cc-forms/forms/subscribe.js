import trials from './trials.js';

const subscribeIpaasParamMap = {
  email: 'email',
  fname: 'first_name',
  lname: 'last_name',
  phonenumber: 'phone',
  address1: 'address1',
  address2: 'address2',
  city: 'city',
  state: 'state',
  postalcode: 'postal_code',
  country: 'country',
  orgname: 'organization',
  preferred_language: 'preferred_language',
};
const CUR_URL = '#current_url';
const NOTICE_ID = '#noticeplaceholder';

class Subscribe extends trials {
  constructor(form, authConfig) {
    super(form, authConfig);
    this.form = form;
    this.authConfig = authConfig;
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
    // window.adobeid.api_parameters = { authorize:
    // { state: { ac: ptrialAC }, ctx_id: contextId } };
  }

  submitAction() {
    this.accesstoken = this.imslib.getAccessToken().token;
    this.createPayLoad();
    this.postCommonService(this.accessToken, this.payLoad, this.endPoint);
  }

  createPayLoad() {
    const JsonPayload = {};
    // config call
    const userProfileParams = this.userprofile;

    for (let i = 0; i < userProfileParams.length; i += 1) {
      // setting not present fields to undefined so they are ignored in payload on Stringify
      JsonPayload[subscribeIpaasParamMap[userProfileParams[i]]] = this.form.querySelector(`[name=${userProfileParams[i]}]`) ? this.getValue(`[name=${userProfileParams[i]}]`) : undefined;
    }

    JsonPayload.sname = this.formContainer.getAttribute('data-sname') || '';
    JsonPayload.imstoken = this.imslib.isSignedInUser()
      ? this.imslib.getAccessToken() : undefined;
    JsonPayload.clientid = this.imslib.isSignedInUser() ? this.imslib.getClientID() : undefined;

    // added for gdpr
    const currentUrl = this.getValue(CUR_URL);
    if (typeof currentUrl !== 'undefined' && currentUrl.length > 0) {
      JsonPayload.current_url = currentUrl;
    }
    const noticeBody = this.getValue('#noticeplaceholder', 'data-notice-body');
    JsonPayload.custom.consent_notice = noticeBody;
    const marketingPermissions = this.getValue('#noticeplaceholder', 'data-marketing-permissions');
    JsonPayload.custom.marketing_permissions = JSON.parse(marketingPermissions);

    this.payLoad = JsonPayload;
  }
}

export default Subscribe;
