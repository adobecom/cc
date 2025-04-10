/* eslint-disable consistent-return */
/* eslint-disable class-methods-use-this */
/* eslint-disable max-len */

import { createTag, getLibs, getConfig, isSignedInInitialized } from '../../scripts/utils.js';
import { isEmptyObject, getCookieValue, setCookieValue } from '../../features/trustcenter/cookie-wrapper.js';
import analyticsWrapper from '../../features/trustcenter/analytics-wrapper.js';

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
  constants: {
    adobeDomain: '.adobe.com',
    hasSignedCookie: 'trustcenter_nda_signed',
  },
};
const lanaLog = window.lana.log;
const unhandledError = (e) => lanaLog({
  message: 'Trust Center - unhandled error',
  errorMessage: e ? e.reason || e.error || e.message : 'Error is not valid',
  sampleRate: 10,
});
window.addEventListener('error', unhandledError);
window.addEventListener('unhandledrejection', unhandledError);

class TrustCenterApp {
  constructor(el) {
    this.el = el;
    const { env } = getConfig();
    this.prodEndpoint = 'https://www.adobe.com/trustcenter/api/';
    this.stageEndpoint = 'https://www.stage.adobe.com/trustcenter/api/';
    this.apiUrl = env.name === 'prod' ? this.prodEndpoint : this.stageEndpoint;


    this.processMetaSettings();
    this.decorateContainers();
    this.initializeTrustCenter();
  }

  processMetaSettings() {
    this.el.querySelectorAll(':scope > div').forEach((metaSetting) => {
      const d = createTag(
        'div',
        { class: metaSetting.querySelector('div').innerText.trim() },
        metaSetting.querySelector('div:nth-child(2)').innerText.trim(),
      );
      metaSetting.replaceWith(d);
    });
  }

  decorateContainers() {
    const parentSection = this.el.closest('.section');
    const signContainer = document.querySelector('.trustcenter-nda-sign');
    if (signContainer) {
      signContainer.classList.remove('trustcenter-nda-sign');
      signContainer.id = Config.ids.ndaContainer;
      const btnLink = signContainer.querySelector('strong a, em a, a strong, a em');
      if (btnLink) {
        const signInBtn = btnLink.nodeName === 'A' ? btnLink : btnLink.closest('a');
        signInBtn.id = Config.ids.signNdaCta;
        signInBtn.href = '#';
      }
    }
    const errorContainer = document.querySelector('.trustcenter-error');
    if (errorContainer) {
      errorContainer.classList.remove('trustcenter-error');
      errorContainer.id = Config.ids.errorContainer;
    }
    const docContainer = document.querySelector('.trustcenter-nda-document');
    if (docContainer) {
      docContainer.classList.remove('trustcenter-nda-document');
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
    const ndaIframe = createTag('iframe', {
      class: 'trustcenter-nda-iframe',
      id: `${Config.ids.ndaiFrame}`,
    });
    const ndaIframeContainer = createTag(
      'div',
      {
        class: 'trustcenter-nda-iframe-container',
        id: `${Config.ids.ndaiFrameContainer}`,
      },
      ndaIframe,
    );
    parentSection.prepend(ndaIframeContainer);
    const progressLoader = createTag(
      'div',
      { class: 'trustcenter-loader trustcenter-hidden', id: `${Config.ids.loader}` },
      this.createTcProgressCircle(),
    );
    parentSection.append(progressLoader);
  }

  initializeTrustCenter() {
    isSignedInInitialized()
      .then(() => {
        // eslint-disable-next-line no-underscore-dangle
        this.pageName = window.alloy_all?.data?._adobe_corpnew?.digitalData.page.pageInfo.pageName;
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

        this.hideNDAiFrameListener = this.hideNDAiFrameListener.bind(this);
        const hasSignedNDA = getCookieValue(Config.constants.hasSignedCookie);
        if (hasSignedNDA) this.showDocumentContainer();
        else this.showNdaContainer();
      })
      .catch((err = {}) => {
        this.mapDomElements();
        if (this.domElements && this.domElements.errorContainer) {
          this.showErrorContainer({ message: 'Trust Center - IMS onReady issues', errorMessage: err.message });
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

  track({ data, cta } = {}) {
    // eslint-disable-next-line no-underscore-dangle
    if (!this.pageName || !window._satellite || typeof window._satellite.track !== 'function') return;
    if (!analyticsWrapper || !analyticsWrapper.onReady) {
      lanaLog({
        message: 'Trust Center - track',
        errorMessage: 'analyticsWrapper is not defined',
        sampleRate: 10,
      });
      return;
    }
    analyticsWrapper.onReady()
      .then(() => {
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
        // eslint-disable-next-line no-underscore-dangle
        window._satellite.track('event');
      })
      .catch(() => {});
  }

  showContainer(containerEl) {
    const hiddenClass = Config.selectors.hiddenItem;
    this.domElements.ndaContainer.classList.add(hiddenClass);
    this.domElements.documentContainer.classList.add(hiddenClass);
    this.domElements.errorContainer.classList.add(hiddenClass);
    this.domElements.ndaiFrameContainer.classList.add(hiddenClass);
    containerEl.classList.remove(hiddenClass);
  }

  showErrorContainer({ message, errorMessage } = {}) {
    lanaLog({ message, errorMessage, sampleRate: 10 });
    this.hideLoader();
    this.showContainer(this.domElements.errorContainer);
  }

  showDocumentContainer() {
    try {
      this.setHasSignedNdaCookie();
      this.decryptDocument();
      this.showContainer(this.domElements.documentContainer);
    } catch (err) {
      this.showErrorContainer({ message: 'TrustCenter - showDocumentContainer unexcepted error.', errorMessage: err.message });
    }
  }

  showNdaContainer() {
    this.isSigning = false;
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

  showLoader() {
    this.domElements.loader.classList.remove(Config.selectors.hiddenItem);
  }

  hideLoader() {
    this.domElements.loader.classList.add(Config.selectors.hiddenItem);
  }

  ioServiceRequest({ method, encryptedAssetLink, overrideEndpoint }) {
    const accessToken = window.adobeIMS.getAccessToken().token;
    if (!accessToken) {
      const err = new Error('accessToken or userId could not be retrieved');
      this.showErrorContainer({ message: 'Trust Center - IORequest error.', errorMessage: err.message });
      return Promise.reject(err);
    }
    const requestOptions = {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
      redirect: 'follow',
    };
    const endpointHost = overrideEndpoint || this.apiUrl;
    const url = new URL(`${endpointHost}${method}`);
    if (encryptedAssetLink) url.searchParams.append('code', encryptedAssetLink);
    return window
      .fetch(url, requestOptions)
      .then((response) => {
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

  signNDA() {
    this.track({ data: `${this.pageName}:sign now`, cta: true });
    this.showLoader();
    return this.ioServiceRequest({ method: 'ndahandler' })
      .then(({ esignUrl, webAccessPoint, hasSigned }) => {
        this.hideLoader();
        if (hasSigned) this.showDocumentContainer();
        else this.openNDAiFrame({ esignUrl, webAccessPoint });
      })
      .catch((err = {}) => {
        this.showErrorContainer({ message: 'Trust Center - signNDA failed.', errorMessage: err.message });
      });
  }

  hideNDAiFrameListener(e) {
    if (!e.target.closest(`#${Config.ids.ndaiFrame}`)) {
      this.showNdaContainer();
      document.removeEventListener('click', this.hideNDAiFrameListener);
    }
  }

  removeHasSignedNdaCookie() {
    const expiration = new Date('1970-10-10');
    setCookieValue(Config.constants.hasSignedCookie, 'true', {
      expiration,
      domain: Config.constants.adobeDomain,
      path: '/',
    });
  }

  setHasSignedNdaCookie() {
    let initCookieSetting = false;
    const setCookie = () => {
      if (initCookieSetting) return;
      initCookieSetting = true;
      if (window.adobePrivacy.activeCookieGroups().indexOf('C0003') !== -1) {
        const expiration = new Date();
        expiration.setMonth(expiration.getMonth() + 1);
        setCookieValue(Config.constants.hasSignedCookie, 'true', {
          expiration,
          domain: Config.constants.adobeDomain,
          path: '/',
        });
      }
    };
    if (!isEmptyObject(window.adobePrivacy)) {
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
    const handleSign = (e) => {
      // eslint-disable-next-line prefer-regex-literals
      const isTrustedOrigin = new RegExp('^https://[\\w.-]+\\.(?:adobesign|echosign|documents\\.adobe)\\.com$').test(e.origin) || e.origin === webAccessPoint;
      if (isTrustedOrigin && e.data) {
        let data;
        try {
          data = JSON.parse(e.data);
        } catch (err) { /* Could not parse sign data */ }
        if (data && data.type === 'ESIGN') {
          document.removeEventListener('click', this.hideNDAiFrameListener);
          this.showDocumentContainer();
        }
      }
    };
    if (!this.hasHandleSignEventListener) {
      this.hasHandleSignEventListener = true;
      window.addEventListener('message', handleSign, false);
    }
  }

  decryptDocument() {
    this.showLoader();
    const encryptedAssetLink = this.domElements.assetLink.dataset.encryptedassetlink;
    if (!encryptedAssetLink) {
      this.showErrorContainer({
        message: 'Trust Center - decryptDocument failed.',
        errorMessage: `encryptedAssetLink is empty. base64UrlSafe: ${encryptedAssetLink}`
            + ` | encryptedAssetLink: ${this.domElements.assetLink.dataset.encryptedassetlink}`,
      });
      return;
    }
    this.ioServiceRequest({ encryptedAssetLink, method: 'documenthandler', overrideEndpoint: this.prodEndpoint })
      .then(({ fileUrl, signNDARequired, isPdf, fileName, fileType }) => {
        this.hideLoader();
        if (signNDARequired) {
          this.removeHasSignedNdaCookie();
          this.showNdaContainer();
          return;
        }
        this.track({ data: `${this.pageName}:asset ready:${fileType}:${fileName}` });
        this.displayFileUrl(fileUrl);
        if (isPdf) this.openPdf(fileUrl);
      })
      .catch((err = {}) => {
        const message = 'Trust Center - Could not decrypt trust center link';
        lanaLog({ message, errorMessage: err.message, sampleRate: 10 });
      });
  }

  async openPdf(fileUrl) {
    const anchorTag = createTag('a', { href: fileUrl }, fileUrl);
    const anchorContainer = createTag('div', { class: 'trustcenter-view-sdk-container' }, anchorTag);
    this.domElements.assetLink.insertAdjacentElement('afterend', anchorContainer);
    const miloLibs = getLibs();
    const { default: initPdfViewer } = await import(`${miloLibs}/blocks/pdf-viewer/pdf-viewer.js`);
    await initPdfViewer(anchorTag);
  }

  displayFileUrl(fileUrl) {
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
