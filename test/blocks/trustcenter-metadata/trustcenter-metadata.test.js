/* eslint-disable chai-friendly/no-unused-expressions */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';

window.lana = { log: ({ message, errorMessage, sampleRate }) => {} };
window.adobeIMS = {
  isSignedInUser: () => true,
  // eslint-disable-next-line arrow-body-style
  getAccessToken: () => { return { token: 'token' }; },
};

const { setConfig } = await import(import.meta.resolve('libs/utils/utils.js'));
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
};

const { setLibs } = await import('../../../creativecloud/scripts/utils.js');
const { default: init } = await import('../../../creativecloud/blocks/trustcenter-metadata/trustcenter-metadata.js');

describe('trustcenter metadata', () => {
  setTimeout(() => {
    window.alloy = () => {};
    window._satellite = { track: (x) => {} };
    window.alloy_all = { set: (x) => {} };
    window.digitalData = { _set: (x) => {} };
  }, 4000);

  const fetchStub = sinon.stub(window, 'fetch');
  let responseStatus = 200;
  let documentRequiresNda = false;

  before(async () => {
    setLibs('https://milo.adobe.com/libs');
    setConfig({ env: 'test' });
    fetchStub.callsFake((url) => {
      let payload = {};
      if (url.pathname.includes('ndahandler')) {
        payload = {
          esignUrl: 'https://sign.example.com/nda',
          webAccessPoint: 'https://sign.example.com',
          hasSigned: false,
        };
      } else if (url.pathname.includes('documenthandler')) {
        payload = {
          fileUrl: `${window.location.origin}/test/blocks/trustcenter-metadata/mocks/sample.pdf`,
          signNDARequired: documentRequiresNda,
          isPdf: false,
          fileName: 'sample.pdf',
          fileType: 'pdf',
        };
      }
      return {
        json: async () => payload,
        status: responseStatus,
        ok: true,
      };
    });
  });

  beforeEach(async () => {
    responseStatus = 200;
    documentRequiresNda = false;
    window.adobeIMS.getAccessToken = () => ({ token: 'token' });
    window.adobePrivacy = {};
    document.cookie = 'trustcenter_nda_signed=; Max-Age=0; path=/';
    document.body.innerHTML = await readFile({ path: './mocks/trustcenter-metadata.html' });
    const trucsimtd = document.querySelector('.trustcenter-metadata');
    await init(trucsimtd);
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });
  });

  it('should decorate the dom elements', () => {
    const domElements = {
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
    let isValidDom = true;
    if (!Object.keys(domElements).every((de) => domElements[de] instanceof HTMLElement)) {
      isValidDom = false;
    }
    expect(isValidDom).to.be.true;
  });

  it('shows an error when the NDA request has no access token', () => {
    window.adobeIMS.getAccessToken = () => ({ token: '' });
    document.querySelector(`#${Config.ids.signNdaCta}`).click();

    expect(document.querySelector(`#${Config.ids.errorContainer}`).classList.contains('hidden')).to.be.false;
    expect(document.querySelector(`#${Config.ids.loader}`).classList.contains('hidden')).to.be.true;
  });

  it('opens the NDA iframe and displays the non-PDF document after signing', async () => {
    responseStatus = 403;
    document.querySelector(`#${Config.ids.signNdaCta}`).click();
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });

    const ndaFrameContainer = document.querySelector(`#${Config.ids.ndaiFrameContainer}`);
    expect(ndaFrameContainer.classList.contains('hidden')).to.be.false;

    window.dispatchEvent(new MessageEvent('message', {
      origin: 'https://attacker.example',
      data: JSON.stringify({ type: 'ESIGN' }),
    }));
    expect(document.querySelector(`#${Config.ids.documentContainer}`).classList.contains('hidden')).to.be.true;

    window.dispatchEvent(new MessageEvent('message', {
      origin: 'https://sign.example.com',
      data: JSON.stringify({ type: 'ESIGN' }),
    }));
    window.adobePrivacy = { activeCookieGroups: () => ['C0003'] };
    window.dispatchEvent(new Event('adobePrivacy:PrivacyConsent'));
    window.dispatchEvent(new Event('adobePrivacy:PrivacyConsent'));
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });

    const documentContainer = document.querySelector(`#${Config.ids.documentContainer}`);
    const nonPdfLink = document.querySelector(`#${Config.ids.nonPdfLink}`);
    expect(documentContainer.classList.contains('hidden')).to.be.false;
    expect(nonPdfLink.href).to.contain('/mocks/sample.pdf');
    expect(nonPdfLink.classList.contains('hidden')).to.be.false;
  });

  it('returns to the NDA prompt when clicking outside the iframe', async () => {
    document.querySelector(`#${Config.ids.signNdaCta}`).click();
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });
    document.body.click();

    expect(document.querySelector(`#${Config.ids.ndaiFrameContainer}`).classList.contains('hidden')).to.be.true;
    expect(document.querySelector(`#${Config.ids.ndaContainer}`).classList.contains('hidden')).to.be.false;
  });

  it('returns to the NDA prompt when the document still requires a signature', async () => {
    documentRequiresNda = true;
    window.adobePrivacy = { activeCookieGroups: () => ['C0003'] };
    document.querySelector(`#${Config.ids.signNdaCta}`).click();
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });

    window.dispatchEvent(new MessageEvent('message', {
      origin: 'https://sign.example.com',
      data: JSON.stringify({ type: 'ESIGN' }),
    }));
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });

    expect(document.querySelector(`#${Config.ids.ndaContainer}`).classList.contains('hidden')).to.be.false;
    expect(document.querySelector(`#${Config.ids.documentContainer}`).classList.contains('hidden')).to.be.true;
  });

  it('shows an error when the service rejects the NDA request', async () => {
    responseStatus = 500;
    document.querySelector(`#${Config.ids.signNdaCta}`).click();
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });

    expect(document.querySelector(`#${Config.ids.errorContainer}`).classList.contains('hidden')).to.be.false;
  });
});
