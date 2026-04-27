/* eslint-disable consistent-return */
/* eslint-disable class-methods-use-this */
/* eslint-disable max-len */

import { createTag, getLibs, getConfig, isSignedInInitialized } from '../../scripts/utils.js';
import { isEmptyObject, getCookieValue, setCookieValue } from '../../features/trustcenter/cookie-wrapper.js';
import analyticsWrapper from '../../features/trustcenter/analytics-wrapper.js';

const targetMsgContent = {
  rawSignMsg: 'trustcenter-nda-sign',
  rawErrorMsg: 'trustcenter-error',
  rawDownloadMsg: 'trustcenter-nda-document',
};

const Config = {
  ids: {
    ndaContainer: 'trustcenter-nda-container',
    documentContainer: 'trustcenter-document-container',
    errorContainer: 'trustcenter-error-container',
    signNdaCta: 'sign-nda-cta',
    encryptedAssetLink: 'data-encryptedassetlink',
    ndaiFrameContainer: 'nda-iframe-container',
    ndaiFrame: 'nda-iframe',
    loader: 'loader',
    nonPdfLink: 'non-pdf-link',
  },
  selectors: { hiddenItem: 'hidden' },
  constants: {
    adobeDomain: window.location.host.endsWith('.adobe.com') ? '.adobe.com' : '',
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
    if (!this.apiUrl) this.apiUrl = env.name === 'prod' ? this.prodEndpoint : this.stageEndpoint;
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
    const metaEl = createTag('meta', { name: 'pdf-embed-mode', content: 'full-window' });
    document.head.append(metaEl);
  }

  handleSpacingTokens(containerEl) {
    const spctkn = [...containerEl.classList].filter((cls) => cls.match(/-spacing/));
    spctkn.forEach((s) => { containerEl.classList.remove(s); });
    return spctkn[0]?.match(/-/g).length > 1 ? `${spctkn[0].split('-')[0]}-spacing` : spctkn[0];
  }

  decorateSignContainer(signContainer) {
    signContainer.classList.add(Config.selectors.hiddenItem);
    signContainer.classList.remove(targetMsgContent.rawSignMsg);
    signContainer.id = Config.ids.ndaContainer;
    const btnLink = signContainer.querySelector('.con-button, strong a, em a, a strong, a em');
    if (btnLink) {
      const signInBtn = btnLink.nodeName === 'A' ? btnLink : btnLink.closest('a');
      signInBtn.id = Config.ids.signNdaCta;
      signInBtn.href = '#';
    }
  }

  decorateErrorContainer(errorContainer) {
    errorContainer.classList.add(Config.selectors.hiddenItem);
    errorContainer.classList.remove(targetMsgContent.rawErrorMsg);
    errorContainer.id = Config.ids.errorContainer;
    const spctkn = [...errorContainer.classList].filter((cls) => cls.match(/-spacing/));
    spctkn.forEach((s) => { errorContainer.classList.remove(s); });
  }

  decorateDocContainer(docContainer, parentSection) {
    docContainer.classList.add(Config.selectors.hiddenItem);
    docContainer.classList.remove(targetMsgContent.rawDownloadMsg);
    docContainer.id = Config.ids.documentContainer;
    const btnLink = docContainer.querySelector('.con-button, strong a, em a, a strong, a em');
    if (btnLink) {
      const downloadBtn = btnLink.nodeName === 'A' ? btnLink : btnLink.closest('a');
      downloadBtn.id = Config.ids.nonPdfLink;
      downloadBtn.href = '#';
    }
    if (this.el.querySelector('.nda-encrypted-link')) {
      const encryptedLink = createTag('div', { class: 'encrypted-link', id: 'encrypted-link' });
      encryptedLink.dataset.encryptedassetlink = this.el.querySelector('.nda-encrypted-link').innerText.trim();
      parentSection.append(encryptedLink);
    }
  }

  addNdaIframe(parentSection) {
    const ndaIframe = createTag('iframe', {
      class: 'nda-iframe',
      id: `${Config.ids.ndaiFrame}`,
    });
    const ndaIframeContainer = createTag(
      'div',
      {
        class: 'nda-iframe-container hidden',
        id: `${Config.ids.ndaiFrameContainer}`,
      },
      ndaIframe,
    );
    parentSection.prepend(ndaIframeContainer);
  }

  decorateContainers() {
    const parentSection = this.el.closest('.section');
    parentSection.classList.add('trustcenter-container');
    const signContainer = document.querySelector(`.${targetMsgContent.rawSignMsg}`);
    if (signContainer) this.decorateSignContainer(signContainer);
    const errorContainer = document.querySelector(`.${targetMsgContent.rawErrorMsg}`);
    if (errorContainer) this.decorateErrorContainer(errorContainer);
    const docContainer = document.querySelector(`.${targetMsgContent.rawDownloadMsg}`);
    if (docContainer) this.decorateDocContainer(docContainer, parentSection);
    this.addNdaIframe(parentSection);
    this.createTcProgressCircle(parentSection);
    [signContainer, errorContainer, docContainer].forEach((txt) => {
      const spacingToken = this.handleSpacingTokens(txt);
      if (spacingToken && !parentSection.classList.contains(spacingToken)) {
        parentSection.classList.add(spacingToken);
      }
    });
  }

  initializeTrustCenter() {
    isSignedInInitialized()
      .then(() => {
        this.mapDomElements();
        if (!this.areDomElementsValid() || !this.domElements.assetLink.dataset || !this.domElements.assetLink.dataset.encryptedassetlink) return;
        if (!window.adobeIMS.isSignedInUser()) return window.adobeIMS.signIn();
        this.hideNDAiFrameListener = this.hideNDAiFrameListener.bind(this);
        const hasSignedNDA = getCookieValue(Config.constants.hasSignedCookie);
        if (hasSignedNDA) this.showDocumentContainer();
        else this.showNdaContainer();
      })
      .catch((err = {}) => {
        if (this.domElements && this.domElements.errorContainer) {
          this.showErrorContainer({
            message: 'Trust Center - IMS onReady issues',
            errorMessage: err.message,
          });
        }
      });
  }

  areDomElementsValid() {
    if (!Object.keys(this.domElements).every((de) => this.domElements[de] instanceof HTMLElement)) return false;
    return true;
  }

  mapDomElements() {
    this.domElements = {
      errorContainer: document.querySelector(`#${Config.ids.errorContainer}`),
      assetLink: document.querySelector(`div[${Config.ids.encryptedAssetLink}]`),
      ndaContainer: document.querySelector(`#${Config.ids.ndaContainer}`),
      documentContainer: document.querySelector(`#${Config.ids.documentContainer}`),
      signNdaButton: document.querySelector(`#${Config.ids.signNdaCta}`),
      ndaiFrameContainer: document.querySelector(`#${Config.ids.ndaiFrameContainer}`),
      ndaiFrame: document.querySelector(`#${Config.ids.ndaiFrame}`),
      loader: document.querySelector(`#${Config.ids.loader}`),
      nonPdfLinkEl: document.querySelector(`#${Config.ids.nonPdfLink}`),
    };
  }

  track({ data, cta } = {}) {
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
        // eslint-disable-next-line no-underscore-dangle
        this.pageName = window.alloy_all?.data?._adobe_corpnew?.digitalData.page.pageInfo.pageName;
        // eslint-disable-next-line no-underscore-dangle
        if (!this.pageName || !window._satellite || typeof window._satellite.track !== 'function') return;
        const trackData = `${this.pageName}:${data}`;
        if (cta) { analyticsWrapper.set({ path: 'primaryEvent.eventInfo.eventName', data: trackData }); }
        analyticsWrapper.set({ path: 'page.pageInfo.customPageName', data: trackData });
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
    this.domElements.nonPdfLinkEl.classList.add(Config.selectors.hiddenItem);
    this.domElements.loader.classList.remove(Config.selectors.hiddenItem);
  }

  hideLoader() {
    this.domElements.nonPdfLinkEl.classList.remove(Config.selectors.hiddenItem);
    this.domElements.loader.classList.add(Config.selectors.hiddenItem);
  }

  async ioServiceRequest({ method, encryptedAssetLink }) {
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
    const url = new URL(`${this.apiUrl}${method}`);
    if (encryptedAssetLink) url.searchParams.append('code', encryptedAssetLink);
    try {
      const response = await fetch(url, requestOptions);
      if (response.status === 200 || response.status === 403) {
        return await response.json();
      }
      throw new Error(`IORequest unsuccessful, API error. Response status ${response.status}. URL: ${url.href}`);
    } catch (err) {
      this.showErrorContainer({ message: 'Trust Center - IORequest failed.', errorMessage: err.message });
      throw err;
    }
  }

  async signNDA() {
    this.track({ data: 'sign now', cta: true });
    this.showLoader();
    try {
      const { esignUrl, webAccessPoint, hasSigned } = await this.ioServiceRequest({ method: 'ndahandler' });
      this.hideLoader();
      if (hasSigned) this.showDocumentContainer();
      else this.openNDAiFrame({ esignUrl, webAccessPoint });
    } catch (err) {
      this.showErrorContainer({ message: 'Trust Center - signNDA failed.', errorMessage: err.message });
    }
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

  async decryptDocument() {
    this.showLoader();
    const encryptedAssetLink = this.base64UrlSafe(this.domElements.assetLink.dataset.encryptedassetlink);
    if (!encryptedAssetLink) {
      this.showErrorContainer({
        message: 'Trust Center - decryptDocument failed.',
        errorMessage: `encryptedAssetLink is empty. base64UrlSafe: ${encryptedAssetLink}`
            + ` | encryptedAssetLink: ${this.domElements.assetLink.dataset.encryptedassetlink}`,
      });
      return;
    }
    try {
      const { fileUrl, signNDARequired, isPdf, fileName, fileType } = await this.ioServiceRequest({ encryptedAssetLink, method: 'documenthandler' });
      this.hideLoader();
      if (signNDARequired) {
        this.removeHasSignedNdaCookie();
        this.showNdaContainer();
        return;
      }
      this.track({ data: `asset ready:${fileType}:${fileName}` });
      this.displayFileUrl(fileUrl);
      if (isPdf) await this.openPdf(fileUrl);
    } catch (err) {
      const message = 'Trust Center - Could not decrypt trust center link';
      lanaLog({ message, errorMessage: err.message, sampleRate: 10 });
    }
  }

  async openPdf(fileUrl) {
    const anchorTag = createTag('a', { class: 'hidden', href: fileUrl }, fileUrl);
    const anchorContainer = createTag('div', { class: 'view-sdk-container' }, anchorTag);
    this.domElements.assetLink.insertAdjacentElement('afterend', anchorContainer);
    const miloLibs = getLibs();
    const { default: initPdfViewer } = await import(`${miloLibs}/blocks/pdf-viewer/pdf-viewer.js`);
    await initPdfViewer(anchorTag);
  }

  displayFileUrl(fileUrl) {
    this.domElements.nonPdfLinkEl.href = fileUrl;
    this.domElements.nonPdfLinkEl.classList.remove(Config.selectors.hiddenItem);
  }

  createTcProgressCircle(parentSection) {
    const pcircleDom = `
      <div class="progress-circle">
        <div class="progress-circle-track"></div>
        <div class="progress-circle-fills">
            <div class="progress-circle-fill-mask1">
                <div class="progress-circle-fill-submask1">
                    <div class="progress-circle-fill"></div>
                </div>
            </div>
            <div class="progress-circle-fill-mask2">
                <div class="progress-circle-fill-submask2">
                    <div class="progress-circle-fill"></div>
                </div>
            </div>
        </div>
      </div>
    `;
    const progressLoader = createTag(
      'div',
      { class: 'loader hidden', id: `${Config.ids.loader}` },
      pcircleDom,
    );
    parentSection.append(progressLoader);
  }

  base64UrlSafe(encoded = '') {
    return encoded.replace(/\+/g, '-').replace(/\//g, '_');
  }
}

function isContentAvailable(targetSection) {
  return (targetSection.querySelector(`.${targetMsgContent.rawSignMsg}`)
  && targetSection.querySelector(`.${targetMsgContent.rawErrorMsg}`)
  && targetSection.querySelector(`.${targetMsgContent.rawDownloadMsg}`));
}

function checkRenderStatus(targetSection, res, rej, etime, rtime) {
  if (etime > 20000) {
    rej();
  } else if (isContentAvailable(targetSection)) {
    res();
  } else {
    setTimeout(() => checkRenderStatus(targetSection, res, rej, etime + rtime), rtime);
  }
}

function trucsiContainersRendered(targetSection) {
  return new Promise((res, rej) => {
    try {
      checkRenderStatus(targetSection, res, rej, 0, 100);
    } catch (err) { rej(); }
  });
}

export default function init(el) {
  const targetSection = el.closest('.section');
  if (isContentAvailable(targetSection)) {
    // eslint-disable-next-line no-unused-vars
    const tc = new TrustCenterApp(el);
  } else {
    trucsiContainersRendered(targetSection)
      .then(() => {
        // eslint-disable-next-line no-unused-vars
        const tc = new TrustCenterApp(el);
      });
  }
}
