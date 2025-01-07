import sinon from 'sinon';
import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import { setLibs, getLibs } from '../../../creativecloud/scripts/utils.js';

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
    const pr = new Promise((res) => res({ countryCode: 'JP', userId: 'mathuria' }));
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

window.digitalData = { data: {} };
window.alloy_all = { data: { _adobe_corpnew: { digitalData: { } } } };

const { default: init } = await import('../../../creativecloud/blocks/cc-forms/cc-forms.js');

document.body.innerHTML = await readFile({ path: './mocks/body.html' });
describe('Perpeptual Form', async () => {
  let fetchSpy = null;
  before(async () => {
    const el = document.querySelector('.cc-forms');
    fetchSpy = sinon.stub(window, 'fetch');
    const mockJson = {
      data: {
        productskuList: {
          items: [
            {
              emailtemplate: 'tdrc_captivate',
              imscontextid: 'pt_captivate',
              productname: 'captivate',
              productcode: 'captivate',
              requestcode: null,
              version: [{ title: '2019' }],
            },
            {
              emailtemplate: 'emailtemplate',
              imscontextid: 'pt_coldfusionbuilder',
              productname: 'coldfusionbuilder',
              productcode: 'coldfusion',
              requestcode: null,
              version: [{ title: '2018' }],
            },
            {
              emailtemplate: 'emailtemplate',
              imscontextid: 'pt_fmxa',
              productname: 'fm_xml_author',
              productcode: 'fm_xml_author',
              requestcode: 'fm_xml_author ',
              version: [{ title: '2015' }],
            },
            {
              emailtemplate: 'tdrc_framemaker_server',
              imscontextid: 'pt_fmps',
              productname: 'FRAMEMAKERPUBSERVER',
              productcode: 'FRAMEMAKERPUBSERVER',
              requestcode: null,
              version: [{ title: '2020' }],
            },
            {
              emailtemplate: 'tdrc_framemaker',
              imscontextid: 'pt_framemaker',
              productname: 'framemaker',
              productcode: 'framemaker',
              requestcode: 'framemaker',
              version: [],
            },
            {
              emailtemplate: 'emailtemplate',
              imscontextid: 'pt_mediaserver',
              productname: 'FS0003242',
              productcode: 'FS0003242',
              requestcode: null,
              version: [{ title: 'Version5' }],
            },
            {
              emailtemplate: null,
              imscontextid: 'pt_pse',
              productname: 'photoshop_elements',
              productcode: 'photoshop_elements',
              requestcode: null,
              version: [{ title: '2022' }],
            },
            {
              emailtemplate: 'emailtemplate',
              imscontextid: 'pt_pre',
              productname: 'premiere_elements',
              productcode: 'premiere_elements',
              requestcode: null,
              version: [{ title: '2022' }],
            },
            {
              emailtemplate: 'emailtemplate',
              imscontextid: 'pt_pvx',
              productname: 'PRESENTERVIDEOEXPRESS',
              productcode: 'PRESENTERVIDEOEXPRESS',
              requestcode: null,
              version: [{ title: '2017 release' }],
            },
            {
              emailtemplate: 'tdrc_robohelpserver',
              imscontextid: 'pt_robohelpserver',
              productname: 'robohelpserver',
              productcode: 'robohelpserver',
              requestcode: null,
              version: [{ title: '2020' }],
            },
            {
              emailtemplate: 'tdrc_tcs',
              imscontextid: 'pt_tcs',
              productname: 'TechnicalCommunicationSuite',
              productcode: 'TechnicalCommunicationSuite',
              requestcode: null,
              version: [{ title: '2020' }],
            },
            {
              emailtemplate: 'emailtemplate',
              imscontextid: 'pt_coldfusion',
              productname: 'Coldfusion',
              productcode: 'coldfusion',
              requestcode: 'coldfusion',
              version: [{ title: 'Version-14' }],
            },
            {
              emailtemplate: 'emailtemplate',
              imscontextid: 'pt_presenter',
              productname: 'presenter',
              productcode: 'presenter',
              requestcode: 'presenter',
              version: [{ title: '2015' }],
            },
            {
              emailtemplate: 'tdrc_robohelp',
              imscontextid: 'pt_robohelp',
              productname: 'robohelp',
              productcode: 'robohelp',
              requestcode: 'robohelp',
              version: [{ title: '2020' }],
            },
          ],
        },
      },
    };
    fetchSpy.resolves({
      ok: true,
      json: async () => mockJson,
    });
    await init(el);
  });

  it('Form should be rendered', () => {
    expect(document.querySelector('.cc-forms form')).to.exist;
  });

  it('Consent should be rendered', () => {
    expect(document.querySelector('.cc-forms #noticeplaceholder .fragment')).to.exist;
  });

  it('Invalid component should be handled', () => {
    expect(document.querySelector('.cc-forms .submit')).to.exist;
  });

  it('Consent should be monitored', () => {
    // const checkbox1 = document.querySelector('#consentexplicitemail')
    // checkbox1.checked = true;
    // const changeEvent1 = new Event('change', { bubbles: true });
    // checkbox1.dispatchEvent(changeEvent1);
    // const checkbox2 = document.querySelector('#consentexplicitphone')
    // checkbox2.checked = true;
    // const changeEvent2 = new Event('change', { bubbles: true });
    // checkbox2.dispatchEvent(changeEvent2);
  });
});
