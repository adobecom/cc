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

document.body.innerHTML = await readFile({ path: './mocks/trustcenter-metadata.html' });
describe('trustcenter metadata', () => {
  setTimeout(() => {
    window.alloy = () => {};
    window._satellite = { track: (x) => {} };
    window.alloy_all = { set: (x) => {} };
    window.digitalData = { _set: (x) => {} };
  }, 4000);

  const fetchStub = sinon.stub(window, 'fetch');

  before(async () => {
    setLibs('https://milo.adobe.com/libs');
    setConfig({ env: 'test' });
    const trucsimtd = document.querySelector('.trustcenter-metadata');
    await init(trucsimtd);
    fetchStub.callsFake((url) => {
      let payload = {};
      if (url.pathname.includes('ndahandler')) {
        payload = { esignUrl: window.location, webAccessPoint: window.location, hasSigned: 'false' };
      } else if (url.pathname.includes('documenthandler')) {
        payload = { fileUrl: `${window.location.origin}/test/blocks/trustcenter-metadata/mocks/sample.pdf`, signNDARequired: 'false', isPdf: 'true', fileName: 'sample.pdf', fileType: 'pdf' };
      }
      return {
        json: async () => payload,
        status: 200,
        ok: true,
      };
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

  it('Sign NDA click should open iframe', () => {
    document.querySelector(`#${Config.ids.signNdaCta}`).click();
    const messageEvent = new MessageEvent('message', { data: { type: 'ESIGN' } });
    window.dispatchEvent(messageEvent);
  });

  it('Download click should download pdf', () => {
    document.querySelector(`#${Config.ids.nonPdfLink}`).click();
  });
});
