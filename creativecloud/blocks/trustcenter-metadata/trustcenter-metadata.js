/* eslint-disable class-methods-use-this */
/* eslint-disable max-len */
/* eslint-disable no-underscore-dangle */

// import HawksBase from '../../../publish/src/js/base';
// import { isAuthor } from '@dexter/dexterui-tools/lib/environment';
// import { lanaLog } from '../../../../../../globalnav/clientlibs/base/feds/src/js/utilities/helpers/lana';

import { createTag, getConfig, isSignedInInitialized } from '../../scripts/utils.js';

// const {
//     closest, getCookieValue, setCookieValue, getPropertySafely, Debug,
//     isEmptyObject, analyticsWrapper,
// } = window.feds.utilities;
// let { imslib } = window.feds.utilities;

const Config = {
  ids: {
    ndaContainer: 'trustcenter-nda-container',
    documentContainer: 'trustcenter-document-container',
    errorContainer: 'trustcenter-error-container',
    signNdaCta: 'trustcenter-sign-nda-cta',
    encryptedAssetLink: 'data-encryptedassetlink',
    ndaiFrameContainer: 'trustcenter-nda-iframe-container',
    ndaiFrame: 'trustcenter-nda-iframe',
    loader: 'trustcenter-loader',
    nonPdfLink: 'trustcenter-non-pdf-link',
  },
  selectors: { hiddenItem: 'trustcenter-hidden' },
  events: { openPdf: 'dexter:openPdf' },
  constants: {
    adobeDomain: '.adobe.com',
    hasSignedCookie: 'trustcenter_nda_signed',
  },
};

const unhandledError = e => lanaLog({
  message: 'Trust Center - unhandled error',
  errorMessage: e ? e.reason || e.error || e.message : 'Error is not valid',
  sampleRate: 10,
});
window.addEventListener('error', unhandledError);
window.addEventListener('unhandledrejection', unhandledError);

class TrustCenterApp {
  constructor(el) {
    this.el = el;
    this.processMetaSettings();
    this.decorateContainers();
    this.initializeTrustCenter();
  }

  processMetaSettings() {
    this.el.querySelectorAll(':scope > div').forEach((metaSetting) => {
      const d = createTag('div', { class: metaSetting.querySelector('div').innerText.trim() }, metaSetting.querySelector('div:nth-child(2)').innerText.trim());
      metaSetting.replaceWith(d);
    });
  }

  decorateContainers() {
    const parentSection = this.el.closest('.section');
    const signContainer = document.querySelector('.trustcenter-nda-sign');
    if (signContainer) {
      signContainer.id = Config.ids.ndaContainer;
      const btnLink = signContainer.querySelector('strong a, em a, a strong, a em');
      if (btnLink) {
        const signInBtn = btnLink.nodeName === 'A' ? btnLink : btnLink.closest('a');
        signInBtn.id = Config.ids.signNdaCta;
        signInBtn.href = '#';
      }
    }
    const errorContainer = document.querySelector('.trustcenter-error');
    if (errorContainer) errorContainer.id = Config.ids.errorContainer;
    const docContainer = document.querySelector('.trustcenter-nda-document');
    if (docContainer) {
      docContainer.id = Config.ids.documentContainer;
      const btnLink = docContainer.querySelector('strong a, em a, a strong, a em');
      if (btnLink) {
        const downloadBtn = btnLink.nodeName === 'A' ? btnLink : btnLink.closest('a');
        downloadBtn.id = Config.ids.nonPdfLink;
        downloadBtn.href = '#';
      }
      if (this.el.querySelector('.nda-encrypted-link')) {
        const encryptedLink = createTag('div', { class: 'trustcenter-encrypted-link', id: 'trustcenter-encrypted-link' });
        encryptedLink.dataset.encryptedassetlink = this.el.querySelector('.nda-encrypted-link').innerText.trim();
        parentSection.append(encryptedLink);
      }
    }
    const ndaIframe = createTag('iframe', { class: 'trustcenter-nda-iframe', id: `${Config.ids.ndaiFrame}` });
    const ndaIframeContainer = createTag('div', { class: 'trustcenter-nda-iframe-container', id: `${Config.ids.ndaiFrameContainer}` }, ndaIframe);
    parentSection.prepend(ndaIframeContainer);
    const progressLoader = createTag('div', { class: 'trustcenter-loader', id: `${Config.ids.loader}` }, this.createTcProgressCircle());
    parentSection.append(progressLoader);
  }

  initializeTrustCenter() {
    isSignedInInitialized().then(() => {
      // this.pageName = window.dexter?.aep?.get('digitalData.page.pageInfo.pageName');
      this.mapDomElements();
      if (!this.areDomElementsValid()
          || !this.domElements.assetLink.dataset
          || !this.domElements.assetLink.dataset.encryptedassetlink) {
        return;
      }

      if (!window.adobeIMS.isSignedInUser()) {
        window.adobeIMS.signIn();
        return;
      }

      const viewSDK = document.querySelector('.viewPdf');
      if (viewSDK instanceof HTMLElement) {
        const behavior = viewSDK.getAttribute('data-view-sdk-behavior');
        if (behavior !== 'openOnPageLoad') {
          lanaLog({
            message: `Trust Center - Wrong ViewSDK behavior detected: ${behavior}, url: ${window.location.href}`,
            sampleRate: 10,
          });
        }
      }

      const isProduction = getPropertySafely(window, 'feds.data.environment.isProduction');
      this.apiUrl = isProduction
        ? 'https://www.adobe.com/trustcenter/api/'
        : 'https://www.stage.adobe.com/trustcenter/api/';

      // bind this to be able to smoothly remove the event listener
      this.hideNDAiFrameListener = this.hideNDAiFrameListener.bind(this);

      // 1) Previously signed NDA -> show gated document, hide NDA
      // 2) No previously signed NDA -> initiate signing NDA, hide gated document
      const hasSignedNDA = getCookieValue(Config.constants.hasSignedCookie);
      if (hasSignedNDA) {
        this.showDocumentContainer();
      } else {
        this.showNdaContainer();
      }
    })
      .catch((err = {}) => {
        this.mapDomElements();
        if (this.domElements && this.domElements.errorContainer) {
          this.showErrorContainer({ message: 'Trust Center - Ims onReady issues', errorMessage: err.message });
        }
      });
  }

  areDomElementsValid() {
    if (!Object.keys(this.domElements).every((de) => this.domElements[de] instanceof HTMLElement)) return false;
    return true;
  }

  mapDomElements() {
    this.domElements = {
      assetLink: document.querySelector(`div[${Config.ids.encryptedAssetLink}]`),
      ndaContainer: document.querySelector(`#${Config.ids.ndaContainer}`),
      documentContainer: document.querySelector(`#${Config.ids.documentContainer}`),
      signNdaButton: document.querySelector(`#${Config.ids.signNdaCta}`),
      errorContainer: document.querySelector(`#${Config.ids.errorContainer}`),
      ndaiFrameContainer: document.querySelector(`#${Config.ids.ndaiFrameContainer}`),
      ndaiFrame: document.querySelector(`#${Config.ids.ndaiFrame}`),
      loader: document.querySelector(`#${Config.ids.loader}`),
      nonPdfLinkEl: document.querySelector(`#${Config.ids.nonPdfLink}`),
    };
  }

  base64UrlSafe(encoded = '') {
    return encoded.replace(/\+/g, '-').replace(/\//g, '_');
  }

  track({ data, cta } = {}) {
    if (!this.pageName || !window._satellite || typeof window._satellite.track !== 'function') {
      return;
    }

    if (!analyticsWrapper || !analyticsWrapper.onReady) {
      // I don't think this can ever happen, but we saw some onReady errors
      // in the lana logs, so let's be safe
      lanaLog({
        message: 'Trust Center - track',
        errorMessage: 'analyticsWrapper is not defined',
        sampleRate: 10,
      });
      return;
    }

    analyticsWrapper.onReady()
      .then(() => {
        // For the CTA (sign now) need to add a primaryEvent, example on how it looks:
        // cc-author.qa03.corp.adobe.com:content:cc:us:en:trust:resources:adobe-bcdr-program-summary:sign now
        if (cta) {
          analyticsWrapper.set({
            path: 'primaryEvent.eventInfo.eventName',
            data,
          });
        }
        analyticsWrapper.set({
          path: 'page.pageInfo.customPageName',
          data,
        });
        window._satellite.track('event');
      })
      .catch(() => {});
  }

  /**
   * @description shows the wanted container and ensures all other containers are hidden
   * @param {HTMLElement} containerEl container element that should be displayed
   */
  showContainer(containerEl) {
    const hiddenClass = Config.selectors.hiddenItem;
    this.domElements.ndaContainer.classList.add(hiddenClass);
    this.domElements.documentContainer.classList.add(hiddenClass);
    this.domElements.errorContainer.classList.add(hiddenClass);
    this.domElements.ndaiFrameContainer.classList.add(hiddenClass);
    containerEl.classList.remove(hiddenClass);
  }

  /**
   * @description shows a generic authorable error
   */
  showErrorContainer({ message, errorMessage } = {}) {
    lanaLog({ message, errorMessage, sampleRate: 10 });
    this.hideLoader();
    this.showContainer(this.domElements.errorContainer);
  }

  /**
   * @description shows the document container
   */
  showDocumentContainer() {
    // We don't need this try/catch but try to track down an error which leads to consumers not seeing their document
    try {
      this.setHasSignedNdaCookie();
      this.decryptDocument();
      this.showContainer(this.domElements.documentContainer);
    } catch (err) {
      this.showErrorContainer({ message: 'TrustCenter - showDocumentContainer unexcepted error.', errorMessage: err.message });
    }
  }

  /**
   * @description shows the NDA container
   */
  showNdaContainer() {
    this.isSigning = false;
    // ensure the event is only added once
    if (!this.ndaBtnHasEventListener) {
      this.ndaBtnHasEventListener = true;
      this.domElements.signNdaButton.addEventListener('click', () => {
        if (!this.isSigning) {
          this.isSigning = true;
          this.signNDA();
        }
      });
    }
    this.showContainer(this.domElements.ndaContainer);
  }

  /**
   * @description shows the loader
   */
  showLoader() {
    this.domElements.loader.classList.remove(Config.selectors.hiddenItem);
  }

  /**
   * @description hides the loader
   */
  hideLoader() {
    this.domElements.loader.classList.add(Config.selectors.hiddenItem);
  }

  /**
   * @description method that queries the trust center IO Service
   * @param {object} param object containing the parameters
   * @param {string} param.method api method for the adobe IO Service
   * @param {string} param.encryptedAssetLink encrypted asset link for the IO Service to decrypt
   * @returns {Promise} that resolves the API request
   */
  IORequest({ method, encryptedAssetLink }) {
    const accessToken = imslib.getAccessToken();
    if (!accessToken) {
      const err = new Error('accessToken or userId could not be retrieved');
      this.showErrorContainer({ message: 'Trust Center - IORequest error.', errorMessage: err.message });
      return Promise.reject(err);
    }

    const requestOptions = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      redirect: 'follow',
    };

    const url = new URL(
      `${this.apiUrl}${method}`,
    );

    if (encryptedAssetLink) {
      url.searchParams.append('code', encryptedAssetLink);
    }

    // todo we can display a spinner while loading the pdf
    return window
      .fetch(url, requestOptions)
      .then((response) => {
        // there can be some valueable payload in 403
        // so we pass on the payload
        if (response.status === 200 || response.status === 403) {
          return response.json();
        }
        throw new Error(`IORequest unsuccessful, API error. Response status ${response.status}. URL: ${url.href}`);
      })
      .catch((err = {}) => {
        this.showErrorContainer({ message: 'Trust Center - IORequest failed.', errorMessage: err.message });
        throw err;
      });
  }

  /**
   * @description IO Request to retrieve a signable NDA (esignUrl) link that we can embed
   */
  signNDA() {
    this.track({ data: `${this.pageName}:sign now`, cta: true });
    this.showLoader();
    return this.IORequest({ method: 'ndahandler' })
      .then(({ esignUrl, webAccessPoint, hasSigned }) => {
        this.hideLoader();
        // the user has already signed the NDA, skip the process
        // and show the document instantly
        if (hasSigned) {
          this.showDocumentContainer();
        } else {
          this.openNDAiFrame({ esignUrl, webAccessPoint });
        }
      })
      .catch((err = {}) => {
        this.debug.log('Could not retrieve NDA esignUrl');
        this.showErrorContainer({ message: 'Trust Center - signNDA failed.', errorMessage: err.message });
      });
  }

  /**
   * @description Hide the iFrame when a mouse click occurs outside or 'ESC' is pressed
   */
  hideNDAiFrameListener(e) {
    if (!closest(e.target, `#${Config.ids.ndaiFrame}`)) {
      this.showNdaContainer();
      document.removeEventListener('click', this.hideNDAiFrameListener);
    }
  }

  /**
   * Removes the cookie that determines if a user has signed a NDA
   */
  removeHasSignedNdaCookie() {
    const expiration = new Date('1970-10-10');
    setCookieValue(Config.constants.hasSignedCookie, 'true', {
      expiration,
      domain: Config.constants.adobeDomain,
      path: '/',
    });
  }

  /**
   * Sets the cookie that determines if a user has signed a NDA
   */
  setHasSignedNdaCookie() {
    let init = false;
    const setCookie = () => {
      if (init) {
        return;
      }

      init = true;
      if (window.adobePrivacy.activeCookieGroups().indexOf('C0003') !== -1) {
        const expiration = new Date();
        expiration.setMonth(expiration.getMonth() + 1);
        setCookieValue(Config.constants.hasSignedCookie, 'true', {
          expiration,
          domain: Config.constants.adobeDomain,
          path: '/',
        });
      } else {
        this.debug.log(`Could not set ${Config.constants.hasSignedCookie} cookie`);
      }
    };

    if (!isEmptyObject(window.adobePrivacy)) {
      // Privacy is defined
      setCookie();
    } else {
      ['adobePrivacy:PrivacyConsent', 'adobePrivacy:PrivacyCustom'].forEach((event) => {
        window.addEventListener(event, setCookie);
      });
    }
  }

  openNDAiFrame({ esignUrl, webAccessPoint }) {
    if (!esignUrl || !webAccessPoint) {
      const message = 'Trust Center - openNDAiFrame could not open the NDA iFrame';
      this.showErrorContainer({ message });
      this.debug.log(message);
      return;
    }
    this.domElements.ndaiFrame.src = esignUrl;
    this.showContainer(this.domElements.ndaiFrameContainer);
    document.addEventListener('click', this.hideNDAiFrameListener);

    // Wait for the "ESIGN" event that happens
    // once a user has signed the NDA within the iFrame
    const handleSign = (e) => {
      // we were facing some issues with a broken NDA signing flow
      // likely due to a mismatch of e.origin/webAccessPoint
      // to proactively prevent that, we trust a few more origins
      const isTrustedOrigin = new RegExp('^https://[\\w.-]+\\.(?:adobesign|echosign|documents\\.adobe)\\.com$').test(e.origin)
          || e.origin === webAccessPoint;

      if (isTrustedOrigin && e.data) {
        let data;

        // There can be multiple messages from the esign iFrame
        // we can just ignore events that don't have data
        try {
          data = JSON.parse(e.data);
        } catch (err) {
          this.debug.log('Could not parse sign data');
        }

        if (data && data.type === 'ESIGN') {
          document.removeEventListener('click', this.hideNDAiFrameListener);
          this.showDocumentContainer();
        }
      }
    };

    // ensure the event is only added once
    if (!this.hasHandleSignEventListener) {
      this.hasHandleSignEventListener = true;
      window.addEventListener('message', handleSign, false);
    }
  }

  /**
   * @description IO Request to decrypt the encrypted asset link
   * once the asset link is decrypted for authenticated users with NDA
   * we can show it to the user
   */
  decryptDocument() {
    this.showLoader();
    const encryptedAssetLink = this.base64UrlSafe(
      this.domElements.assetLink.dataset.encryptedassetlink,
    );

    if (!encryptedAssetLink) {
      this.showErrorContainer({
        message: 'Trust Center - decryptDocument failed.',
        errorMessage: `encryptedAssetLink is empty. base64UrlSafe: ${encryptedAssetLink}`
            + ` | encryptedAssetLink: ${this.domElements.assetLink.dataset.encryptedassetlink}`,
      });
      return;
    }

    this.IORequest({ encryptedAssetLink, method: 'documenthandler' })
      .then(({ fileUrl, signNDARequired, isPdf, fileName, fileType }) => {
        this.hideLoader();
        // The user has a faulty "hasSignedCookie"
        // so we restart the process, so that the user doesn't up in a deadlock
        if (signNDARequired) {
          this.removeHasSignedNdaCookie();
          this.showNdaContainer();
          return;
        }

        // track analytics as we show either the pdf or a download button
        this.track({ data: `${this.pageName}:asset ready:${fileType}:${fileName}` });

        // always display a download button, we had issues in the past with the PDFPreviewing
        this.displayFileUrl(fileUrl);

        // if it's a PDF automatically open it
        if (isPdf) {
          this.openPdf(fileUrl);
        }
      })
      .catch((err = {}) => {
        const message = 'Trust Center - Could not decrypt trust center link';
        lanaLog({ message, errorMessage: err.message, sampleRate: 10 });
        this.debug.log(message);
      });
  }

  openPdf(fileUrl) {
    // create an anchor tag on the page for the dexter ViewSDK to pick up
    const anchorTag = document.createElement('a');
    anchorTag.href = fileUrl;
    anchorTag.setAttribute('dexter-viewsdk-target', true);


    const timeout = setTimeout(async () => {
      if (window.trustCenterLoadFailed) {
        const message = 'Trust Center - could not load view SDK';
        lanaLog({ message, errorMessage: '', sampleRate: 10 });
      }
      if (window.trustCenterAlternativeLoadFailed) {
        const message = 'Trust Center - could not load view SDK alternative';
        lanaLog({ message, errorMessage: '', sampleRate: 10 });
      }
    }, 2000);

    // wait until dexter ViewSDK does it's magic and appends attributes to the element
    new MutationObserver((mutationList, obs) => {
      const openPdfEvent = new CustomEvent(Config.events.openPdf, { detail: { createCloseButton: false } });
      anchorTag.dispatchEvent(openPdfEvent);
      clearTimeout(timeout);
      obs.disconnect();
    }).observe(anchorTag, { attributes: true });
    this.domElements.assetLink.insertAdjacentElement('afterend', anchorTag);
  }

  displayFileUrl(fileUrl) {
    // create <a> with link to the file
    const anchorTag = document.createElement('a');
    anchorTag.href = fileUrl;
    anchorTag.innerText = fileUrl;
    this.domElements.nonPdfLinkEl.href = fileUrl;
    this.domElements.nonPdfLinkEl.classList.remove(Config.selectors.hiddenItem);
  }

  createTcProgressCircle() {
    return `
      <div class="trustcenter-progressCircle">
        <div class="trustcenter-progressCircle-track"></div>
        <div class="trustcenter-progressCircle-fills">
            <div class="trustcenter-progressCircle-fillMask1">
                <div class="trustcenter-progressCircle-fillSubMask1">
                    <div class="trustcenter-progressCircle-fill"></div>
                </div>
            </div>
            <div class="trustcenter-progressCircle-fillMask2">
                <div class="trustcenter-progressCircle-fillSubMask2">
                    <div class="trustcenter-progressCircle-fill"></div>
                </div>
            </div>
        </div>
      </div>
    `;
  }
}

export default function init(el) {
  // eslint-disable-next-line no-unused-vars
  const tc = new TrustCenterApp(el);
}
