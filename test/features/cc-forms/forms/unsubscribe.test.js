/* eslint-disable comma-dangle */
/* eslint-disable quotes */
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
  getProfile: () => Promise.resolve({ countryCode: 'US', userId: 'testuser' }),
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

describe('Unsubscribe Form', () => {
  const fetchStub = sinon.stub(window, 'fetch');
  const originalGetParam = window.URLSearchParams.prototype.get;
  const mockParams = {
    email: 'test@example.com',
    p: 'testParam',
    n: 'testName',
    type: 'marketing',
    sname: 'Adobe Marketing',
    slabel: 'Marketing Communications'
  };

  before(async () => {
    window.URLSearchParams.prototype.get = function (param) {
      return mockParams[param] || null;
    };

    document.body.innerHTML = await readFile({ path: './mocks/unsubscribe-body.html' });
    const el = document.querySelector('.cc-forms');
    await init(el);
    await delay(1000);
  });

  after(() => {
    fetchStub.restore();
    window.URLSearchParams.prototype.get = originalGetParam;
  });

  it('Should initialize with correct email placeholder', () => {
    const formItems = document.querySelectorAll('.form-item');
    let found = false;
    formItems.forEach((item) => {
      if (item.textContent.includes('test@example.com')) {
        found = true;
      }
    });
    expect(found).to.be.true;
  });

  it('Should initialize with correct subscription name placeholder', () => {
    const formItems = document.querySelectorAll('.form-item');
    let found = false;
    formItems.forEach((item) => {
      if (item.textContent.includes('Marketing Communications')) {
        found = true;
      }
    });
    expect(found).to.be.true;
  });

  it('Should have first checkbox checked by default', () => {
    const checkboxes = document.querySelectorAll('.checkbox-input');
    expect(checkboxes[0].checked).to.be.true;
    expect(checkboxes[1].checked).to.be.false;
  });

  it('Should uncheck other checkbox when one is checked', () => {
    const checkboxes = document.querySelectorAll('.checkbox-input');
    checkboxes[1].checked = true;
    checkboxes[1].dispatchEvent(new Event('change'));
    expect(checkboxes[0].checked).to.be.false;
    expect(checkboxes[1].checked).to.be.true;
  });

  it('Should initialize click here link correctly', () => {
    const clickHereLink = document.querySelector('a[href*="#click_here"]');
    expect(clickHereLink).to.exist;
    clickHereLink.click();
    const toggleCheckbox = document.querySelector('input[toggle-hideshow]');
    if (toggleCheckbox) {
      const parentDivInput = toggleCheckbox.closest('.form-item');
      expect(parentDivInput.style.display).to.equal('block');
    }
  });

  it('Should handle submit button click', () => {
    const submitButton = document.querySelector('.cc-form-component.submit');
    expect(submitButton).to.exist;
    submitButton.dispatchEvent(new Event('click'));
  });
});
