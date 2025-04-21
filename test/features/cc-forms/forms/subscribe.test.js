import sinon from 'sinon';
import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import { setLibs, getLibs } from '../../../../creativecloud/scripts/utils.js';

const miloLibs = '/libs';
setLibs(miloLibs);
const { setConfig } = await import(`${getLibs()}/utils/utils.js`);
const CONFIG = {
  stage: { odinEndpoint: 'https://stage-odin.adobe.com/' },
  live: { odinEndpoint: 'https://stage-odin.adobe.com/' },
  prod: { odinEndpoint: 'https://odin.adobe.com/' },
};
setConfig(CONFIG);

window.adobeIMS = {
  initialized: true,
  getProfile: () => {
    // eslint-disable-next-line no-promise-executor-return
    const pr = new Promise((res) => res({ countryCode: 'US', userId: 'mathuria' }));
    return pr;
  },
  isSignedInUser: () => true,
  getAccessToken: () => 'token',
  adobeid: { locale: 'en' },
};

window.adobeid = {
  api_parameters: {},
  locale: 'en',
};

window.digitalData = {};
window.alloy_all = { data: { _adobe_corpnew: { digitalData: {} } } };

function delay(ms) {
  return new Promise((res) => { setTimeout(() => { res(); }, ms); });
}

const { default: init } = await import('../../../../creativecloud/blocks/cc-forms/cc-forms.js');

document.body.innerHTML = await readFile({ path: './mocks/subscribe-body.html' });

describe('Subscribe Form', () => {
  const fetchStub = sinon.stub(window, 'fetch');
  before(async () => {
    const el = document.querySelector('.cc-forms');
    fetchStub.callsFake(() => {
      const payload = {};
      return Promise.resolve({
        json: async () => payload,
        status: 200,
        ok: true,
      });
    });
    await init(el);
    await delay(1000);
  });

  after(() => {
    fetchStub.restore();
  });

  it('should perform submit action on clicking button', () => {
    document.body.querySelector('#email').value = 'email@gmail.com';
    document.body.querySelector('#fname').value = 'val';
    document.body.querySelector('#lname').value = 'val';
    document.body.querySelector('#country').value = 'val';
    document.body.querySelector('#orgname').value = 'val';
    document.body.querySelector('.cc-form-component.submit').dispatchEvent(new Event('click'));
    const loader = document.body.querySelector('.spectrum-ProgressCircle-fillMask1');
    expect(loader).to.exist;
  });

  it('should function without sname attribute', async () => {
    const el = document.querySelector('.cc-forms');
    const form = document.querySelector('form');
    form.removeAttribute('data-sname');
    await init(el);
  });
});
