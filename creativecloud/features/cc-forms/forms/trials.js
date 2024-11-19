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
const CLASS_CIRCLE_LOADER_VISIBLE = 'hawksForms-circleLoader--visible';
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
  'error-redirect-jms': 'bamaunknownerrorpage',
  'error-redirect-bama': 'bamaunknownerrorpage',
  'error-redirect-service-unavailable': 'serviceunavailableerrorpage',
};

class Trials {
    constructor(formContainer) {
        this.imslib = window.adobeIMS;
        this.formContainer = formContainer;
        this.valid = true;
        this.formConfig = [];
        this.payLoad = {};
        this.clientName = this.formContainer.getAttribute(DATA_CLIENT_NAME) || '';
        this.accessToken = window.localStorage.getItem('accessToken') || window.adobeIMS.getAccessToken();
        this.elements = this.formContainer.querySelectorAll(SELECTOR_ELEMENTS);
        this.thankyouPage = this.formContainer.getAttribute(DATA_THANK_YOU_PAGE) || '';
        this.apikey = this.formContainer.getAttribute(DATA_APIKEY) || '';
        this.endPoint = this.formContainer.getAttribute(DATA_ENDPOINT) || '';
        this.submitButton = this.formContainer.querySelector(SELECTOR_BUTTON);
        this.address_mail_to = this.formContainer.hasAttribute(ADDRESS_MAIL_TO) ? this.formContainer.getAttribute(ADDRESS_MAIL_TO).split(',') : '';
        this.userprofile = this.formContainer.hasAttribute(USER_PROFILE) ? this.formContainer.getAttribute(USER_PROFILE).split(',') : '';
        this.circleLoader = this.formContainer.querySelector(SELECTOR_CIRCLE_LOADER);
        this.event = new Event('checkValidation');
        this.inputElements = this.formContainer.querySelectorAll(INPUT_FIELDS);
        this.checkValidElements();
        this.setFormConfig();
        this.handleEnterKeyPress();
    }

    handleEnterKeyPress() {
        this.inputElements.forEach((element) => {
            element.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.keyCode === 13) {
                    e.preventDefault();
                }
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
          this.formContainer.dispatchEvent(this.event);
          this.checkValidElements();
          if (this.valid) {
              // this.circleLoaderShow();
              setTimeout(() => {
                  this.submitAction();
              }, 1);
          }
      });
    }

    getUUID() {
        function rs() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }

        return `${rs() + rs()}-${rs()}-${rs()}-${rs()}-${rs()}${rs()}${rs()}`;
    }

    setFormConfig() {
        const formConfig = [];
        Object.keys(STATUS_REDIRECT_MAP).forEach((k) => {
          const redirectUrl = this.formContainer.closest('.cc-forms').querySelector(`.icon-${k}`)?.parentElement?.nextElementSibling?.querySelector('a')?.href;
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
        let destination = this.thankyouPage;
        if ((this.formContainer.getAttribute(DATA_FORM_TYPE) === 'form.connect.action'
        || this.formContainer.getAttribute(DATA_FORM_TYPE) === 'form.connect.enterprise.action')
        && response.reason && response.reason !== 'SUCCESS') {
            destination = this.getFormConfig(STATUS_REDIRECT_MAP[response.reason]);
        }
        window.location.href = destination;
    }

    postSubmitFailure(response) {
        let destination = this.getFormConfig(CONF_KEY_ERROR_GENERIC);
        if (response.status === 502 || response.status === 503) {
            destination = this.getFormConfig(CONF_KEY_ERROR_UNAVAILABLE);
        }
        window.location.href = destination;
    }

    // circleLoaderHide() {
    //     this.circleLoader.classList.remove(CLASS_CIRCLE_LOADER_VISIBLE);
    // }

    // circleLoaderShow() {
    //     const form = this;
    //     this.circleLoader.classList.add(CLASS_CIRCLE_LOADER_VISIBLE);
    //     setTimeout(() => {
    //         form.circleLoaderHide();
    //     }, CIRCLE_LOADER_TIMEOUT);
    // }

    getPST() {
        const d = new Date();
        const offset = 60000 - 28800000;
        const pst = new Date(d.getTime() + d.getTimezoneOffset() * offset).toJSON();
        return pst;
    }

    escapeXml(unsafe) {
        return unsafe.replace(/[<>&'"]/g, (c) => {
            switch (c) {
                case '<':
                    return '&lt;';
                case '>':
                    return '&gt;';
                case '&':
                    return '&amp;';
                case '\'':
                    return '&apos;';
                case '"':
                    return '&quot;';
                default:
                    return '';
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
            if (!(elem instanceof HTMLElement)) {
                return false;
            }
            if (attribute === 'value') {
                return elem.value;
            }
            return elem.getAttribute(attribute);
        } catch (e) {
            return false;
        }
    }

    setValue(selector, value, attr) {
        const attribute = (typeof attr !== 'undefined') ? attr : 'value';
        const elem = this.formContainer.querySelector(selector);
        if (!(elem instanceof HTMLElement)) {
            return false;
        }
        if (!value) {
            return false;
        }
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
        if (disabled) {
            this.submitButton.classList.add(BUTTON_DISABLED_CLASS);
        } else {
            this.submitButton.classList.remove(BUTTON_DISABLED_CLASS);
        }
    }
}

export default Trials;
