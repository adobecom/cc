/* eslint-disable no-promise-executor-return */
import sinon from 'sinon';
import { expect } from '@esm-bundle/chai';
import { readFile } from '@web/test-runner-commands';
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
const { default: init } = await import('../../../../creativecloud/blocks/cc-forms/cc-forms.js');

document.body.innerHTML = await readFile({ path: './mocks/perpeptual-body.html' });
describe('Perpeptual Form', async () => {
  const fetchStub = sinon.stub(window, 'fetch');
  before(async () => {
    const el = document.querySelector('.cc-forms');
    window.adobeIMS = {
      initialized: true,
      getProfile: () => {
        const pr = new Promise((res) => res({ countryCode: 'US', userId: 'mathuria' }));
        return pr;
      },
      isSignedInUser: () => true,
      getAccessToken: () => 'token',
      adobeid: { locale: 'en' },
    };
    fetchStub.callsFake((url) => {
      if (url.includes('countries')) {
        return Promise.resolve(new Response(`${''} + {'data':{'countryList':{'items':[{'_path':'/content/dam/acom/country/us/en/US','id':'US','title':'United States','value':'US','isTop':false},{'_path':'/content/dam/acom/country/us/en/IN','id':'IN','title':'India','value':'IN','isTop':false}]}}}`, { status: 200 }));
      }
      if (url.includes('jobtitle')) {
        return Promise.resolve(new Response(`${''} + {'data':{'formfieldvaluesList':{'items':[{'id':0,'title':'Vice President','value':'VICE_PRESIDENT'},{'id':0,'title':'Web Manager','value':'WEB_MANAGER'}]}}}`, { status: 200 }));
      }
      if (url.includes('listskuproductversiondetails')) {
        return Promise.resolve(new Response(`${''} + {'data':{'productskuList':{'items':[{'emailtemplate':'tdrc_captivate','imscontextid':'pt_captivate','productname':'captivate','productcode':'captivate','requestcode':null,'version':[{'title':'2023','productlabel':'Captivate 2023','language_os':[{'downloadmethod':'1','filesize':'1555494775','fileurl':'https://localhost','title':'Brazilian Portuguese-Windows','language':'Brazilian Portuguese','platform':'Windows','sku':'skunum','active':'active'}]},{'title':'2019','productlabel':'Captivate 2019','language_os':[{'downloadmethod':'1','filesize':'3185352464','fileurl':'https://localhost','title':'Brazilian Portuguese-Windows-64 bit','language':'Brazilian Portuguese','platform':'Windows 64bit','sku':'skunum','active':'active'}]}]}]}}}`, { status: 200 }));
      }
      if (url.includes('listskuproductandversions')) {
        return Promise.resolve(new Response(`${''} + {'data': {'productskuList': {'items': [{'emailtemplate': 'tdrc_captivate','imscontextid': 'pt_captivate','productname': 'captivate','productcode': 'captivate','requestcode': null,'version': [{'title': '2023'},{'title': '2019'}]}]}}}`, { status: 500 }));
      }
      if (url.includes('existinguser')) {
        return Promise.resolve(new Response(`${''} + {'data':{'formfieldvaluesList':{'items':[{'id':4,'title':'Not Using Adobe Captivate','value':'notusingadobecaptivate'},{'id':3,'title':'Older versions','value':'olderversions'}]}}}`, { status: 500 }));
      }
      return Promise.resolve();
    });
    await init(el);
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
});
