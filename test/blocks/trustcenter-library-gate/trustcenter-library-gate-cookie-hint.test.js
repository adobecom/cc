/* eslint-disable chai-friendly/no-unused-expressions */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';

window.lana = { log: ({ message, errorMessage, sampleRate }) => {} };
window.adobeIMS = {
  isSignedInUser: () => true,
  signIn: () => {},
  // eslint-disable-next-line arrow-body-style
  getAccessToken: () => { return { token: 'token' }; },
};

const { setConfig } = await import(import.meta.resolve('libs/utils/utils.js'));
const { setLibs } = await import('../../../creativecloud/scripts/utils.js');
const { default: init, TrustCenterLibraryGate } = await import('../../../creativecloud/blocks/trustcenter-library-gate/trustcenter-library-gate.js');
sinon.stub(TrustCenterLibraryGate.prototype, 'waitForIms').resolves();
const { getCookieValue } = await import('../../../creativecloud/features/trustcenter/cookie-wrapper.js');

const siblingHtml = await readFile({ path: './mocks/trustcenter-library-gate-sibling.html' });
const COOKIE_NAME = 'trustcenter_nda_signed';
const wait = (ms) => new Promise((resolve) => { setTimeout(resolve, ms); });

function clearCookie() {
  document.cookie = `${COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

describe('trustcenter library gate - cookie reasonHint', () => {
  setTimeout(() => {
    window.alloy = () => {};
    window._satellite = { track: (x) => {} };
    window.alloy_all = { set: (x) => {} };
    window.digitalData = { _set: (x) => {} };
  }, 4000);

  before(() => {
    setLibs('https://milo.adobe.com/libs');
    setConfig({ env: 'test' });
  });

  let fetchStub;

  beforeEach(() => {
    clearCookie();
    window.adobePrivacy = { activeCookieGroups: () => ['C0003'] };
    document.body.innerHTML = siblingHtml;
    if (window.fetch.restore) window.fetch.restore();
    fetchStub = sinon.stub(window, 'fetch');
  });

  after(() => {
    if (window.fetch.restore) window.fetch.restore();
    clearCookie();
  });

  it('sends the cookie value as reasonHint on the initial libraryaccess call', async () => {
    document.cookie = `${COOKIE_NAME}=nda`;
    let lastLibraryaccessUrl = null;
    fetchStub.callsFake((url) => {
      if (url.pathname.includes('libraryaccess')) lastLibraryaccessUrl = url;
      return { json: async () => ({ status: 'NDA_REQUIRED' }), status: 200, ok: true };
    });
    await init(document.querySelector('.trustcenter-library-gate'));
    await wait(100);
    expect(lastLibraryaccessUrl.searchParams.get('reasonHint')).to.equal('nda');
  });

  it('maps a legacy "true" cookie value to a "signed" reasonHint', async () => {
    document.cookie = `${COOKIE_NAME}=true`;
    let lastLibraryaccessUrl = null;
    fetchStub.callsFake((url) => {
      if (url.pathname.includes('libraryaccess')) lastLibraryaccessUrl = url;
      return { json: async () => ({ status: 'NDA_REQUIRED' }), status: 200, ok: true };
    });
    await init(document.querySelector('.trustcenter-library-gate'));
    await wait(100);
    expect(lastLibraryaccessUrl.searchParams.get('reasonHint')).to.equal('signed');
  });

  it('does not send a reasonHint when no cookie is present', async () => {
    let lastLibraryaccessUrl = null;
    fetchStub.callsFake((url) => {
      if (url.pathname.includes('libraryaccess')) lastLibraryaccessUrl = url;
      return { json: async () => ({ status: 'NDA_REQUIRED' }), status: 200, ok: true };
    });
    await init(document.querySelector('.trustcenter-library-gate'));
    await wait(100);
    expect(lastLibraryaccessUrl.searchParams.has('reasonHint')).to.be.false;
  });

  it('stores the actual granted reason in the cookie, not just "true"', async () => {
    fetchStub.callsFake((url) => {
      if (url.pathname.includes('libraryaccess')) {
        return { json: async () => ({ status: 'GRANTED', reason: 'entitlement' }), status: 200, ok: true };
      }
      // documenthandler's independent re-check also succeeds, so decryptDocument doesn't
      // remove the cookie it just set.
      return {
        json: async () => ({ fileUrl: `${window.location.origin}/test/blocks/trustcenter-library-gate/mocks/sample.pdf`, isPdf: false, fileName: 'sample.txt', fileType: 'txt' }),
        status: 200,
        ok: true,
      };
    });
    await init(document.querySelector('.trustcenter-library-gate'));
    await wait(100);
    expect(getCookieValue(COOKIE_NAME)).to.equal('entitlement');
  });

  it('clears the cookie when libraryaccess no longer grants access', async () => {
    document.cookie = `${COOKIE_NAME}=nda`;
    fetchStub.callsFake((url) => {
      if (url.pathname.includes('libraryaccess')) {
        return { json: async () => ({ status: 'NDA_REQUIRED' }), status: 200, ok: true };
      }
      return { json: async () => ({}), status: 200, ok: true };
    });
    await init(document.querySelector('.trustcenter-library-gate'));
    await wait(100);
    expect(getCookieValue(COOKIE_NAME)).to.be.undefined;
  });

  it("clears the cookie when documenthandler's independent re-check fails despite an optimistic hint", async () => {
    fetchStub.callsFake((url) => {
      if (url.pathname.includes('libraryaccess')) {
        return { json: async () => ({ status: 'GRANTED', reason: 'entitlement' }), status: 200, ok: true };
      }
      // the hint was stale/wrong - documenthandler's own re-check says no
      return { json: async () => ({ signNDARequired: true }), status: 403, ok: true };
    });
    await init(document.querySelector('.trustcenter-library-gate'));
    await wait(100);
    expect(getCookieValue(COOKIE_NAME)).to.be.undefined;
    expect(document.querySelector('#trustcenter-nda-container').classList.contains('hidden')).to.be.false;
    expect(document.querySelector('#trustcenter-document-container').classList.contains('hidden')).to.be.true;
  });
});
