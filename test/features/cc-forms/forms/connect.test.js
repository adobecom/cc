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

document.body.innerHTML = await readFile({ path: './mocks/connect-body.html' });
describe('ConnectTrials Form', () => {
  const fetchStub = sinon.stub(window, 'fetch');
  before(async () => {
    const el = document.querySelector('.cc-forms');
    fetchStub.callsFake((url) => {
      let payload = {};
      if (url.includes('countries')) {
        payload = { data: { countryList: { items: [{ _path: '/content/dam/acom/country/us/en/US', id: 'US', title: 'United States', value: 'US', isTop: false }, { _path: '/content/dam/acom/country/us/en/IN', id: 'IN', title: 'India', value: 'IN', isTop: false }] } } };
      }
      if (url.includes('connectregions')) {
        payload = {
          data: {
            formfieldvaluesList: {
              items: [
                {
                  id: 2,
                  title: "United States/Canada",
                  value: "0"
                },
                {
                  id: 0,
                  title: "Asia Pacific",
                  value: "20"
                },
                {
                  id: 1,
                  title: "EMEA",
                  value: "10"
                },
                {
                  id: 3,
                  title: "Rest of the World",
                  value: "30"
                }
              ]
            }
          }
        };
      }
      if (url.includes('timezone')) {
        payload = {
          data: {
            formfieldvaluesList: {
              items: [
                {
                  id: 0,
                  title: "(GMT-12:00) International Date Line West",
                  value: "0"
                },
                {
                  id: 1,
                  title: "(GMT-11:00) Midway Island, Samoa",
                  value: "1"
                },
                {
                  id: 95,
                  title: "(GMT+01:00) Belgrade, Bratislava, Budapest, Ljubljana, Prague",
                  value: "95"
                }
              ]
            }
          }
        };
      }
      if (url.includes('orgsize')) {
        payload = {
          data: {
            formfieldvaluesList: {
              items: [
                {
                  id: 1,
                  title: "10-99",
                  value: "10-99"
                },
                {
                  id: 2,
                  title: "100-499",
                  value: "100-499"
                },
                {
                  id: 4,
                  title: "1000-4999",
                  value: "1000-4999"
                },
                {
                  id: 0,
                  title: "1-9",
                  value: "1-9"
                },
                {
                  id: 3,
                  title: "500-999",
                  value: "500-999"
                },
                {
                  id: 5,
                  title: "5000+",
                  value: "5000+"
                }
              ]
            }
          }
        };
      }
      if (url.includes('industry')) {
        payload = {
          data: {
            formfieldvaluesList: {
              items: [
                {
                  id: 1,
                  title: "Advertising",
                  value: "ADVERTISING"
                },
                {
                  id: 40,
                  title: "Agriculture & Forestry",
                  value: "AGRICULTURE_AND_FORESTRY"
                },
                {
                  id: 41,
                  title: "Construction",
                  value: "CONSTRUCTION"
                },
                {
                  id: 56,
                  title: "Education - Higher Ed",
                  value: "EDUCATION_HIGHER_ED"
                },
                {
                  id: 53,
                  title: "Utilities",
                  value: "UTILITIES"
                }
              ]
            }
          }
        };
      }
      if (url.includes('jobfunction')) {
        payload = {
          data: {
            formfieldvaluesList: {
              items: [
                {
                  id: 1,
                  title: "Accounting/Finance",
                  value: "ACCOUNTING_FINANCE"
                },
                {
                  id: 2,
                  title: "Administrative Support",
                  value: "ADMINISTRATIVE_SUPPORT"
                },
                {
                  id: 66,
                  title: "Training and Development",
                  value: "TRAINING_AND_DEVELOPMENT"
                }
              ]
            }
          }
        };
      }
      if (url.includes('connecttrialpurchaseintent')) {
        payload = {
          data: {
            formfieldvaluesList: {
              items: [
                {
                  id: 0,
                  title: "Adobe Connect Learning",
                  value: "learning"
                },
                {
                  id: 0,
                  title: "Adobe Connect Webinar",
                  value: "webinars"
                }
              ]
            }
          }
        };
      }
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

  it('Consent should be monitored', () => {
    const checkbox1 = document.body.querySelector('#consentexplicitemail');
    expect(checkbox1).to.exist;
  });

  it('Text patterns should be validated', () => {
    const postalcode = document.body.querySelector('#postalcode');
    postalcode.value = 'postal code';
    postalcode.dispatchEvent(new Event('input'));
  });

  it('Submit check', () => {
    document.body.querySelector('#email').value = 'email@gmail.com';
    document.body.querySelector('#fname').value = 'val';
    document.body.querySelector('#lname').value = 'val';
    document.body.querySelector('#phonenumber').value = 'val';
    document.body.querySelector('#orgname').value = 'val';
    document.body.querySelector('#country').selectedIndex = 1;
    document.body.querySelector('#state').selectedIndex = 1;
    document.body.querySelector('#postalcode').value = 'val';
    document.body.querySelector('#region').selectedIndex = 1;
    document.body.querySelector('#timezone').selectedIndex = 1;
    document.body.querySelector('#orgsize').selectedIndex = 1;
    document.body.querySelector('#industry').selectedIndex = 1;
    document.body.querySelector('#jobfunction').selectedIndex = 1;
    document.body.querySelector('#connectpurchaseintent').selectedIndex = 1;
    document.body.querySelector('#accept-agreement').checked = true;
    document.body.querySelector('.cc-form-component.submit').dispatchEvent(new Event('click'));
  });
});
