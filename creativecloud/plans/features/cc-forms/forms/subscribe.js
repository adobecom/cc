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

class Subscribe extends trials {
  constructor(form, authConfig) {
    super(form, authConfig);
    this.form = form;
    this.authConfig = authConfig;
    this.buttonListener();
  }

  submitAction() {
    this.accesstoken = this.imslib.getAccessToken()?.token;
    this.createPayLoad();
    this.postCommonService(this.accessToken, this.payLoad, this.endPoint);
  }

  createPayLoad() {
    const JsonPayload = {};
    const userProfileParams = this.userprofile;
    for (let i = 0; i < userProfileParams.length; i += 1) {
      const val = this.getValue(`[name=${userProfileParams[i]}]`);
      if (val) JsonPayload[subscribeIpaasParamMap[userProfileParams[i]]] = val;
    }
    JsonPayload.sname = this.formContainer.getAttribute('data-sname') || '';
    // gdpr
    const currentUrl = this.getValue(CUR_URL);
    if (currentUrl) {
      JsonPayload.current_url = currentUrl;
    }
    const consentNotice = document.querySelector('.consentnotice');
    if (typeof consentNotice !== 'undefined' && consentNotice !== null) {
      JsonPayload.consent_notice = consentNotice.innerHTML;
    }
    this.payLoad = JsonPayload;
  }
}

export default Subscribe;
