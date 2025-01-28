import sinon from 'sinon';
import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import { setLibs, getLibs } from '../../../../creativecloud/scripts/utils.js';

const miloLibs = '/libs';
setLibs(miloLibs);
const { setConfig } = await import(`${getLibs()}/utils/utils.js`);
const CONFIG = {
  stage: { odinEndpoint: 'https://stage-odin.adobe.com/' },
  // live: { odinEndpoint: '/test/features/cc-forms/components/mocks' },
  live: { odinEndpoint: 'https://stage-odin.adobe.com/' },
  prod: { odinEndpoint: 'https://odin.adobe.com/' },
};
setConfig(CONFIG);
const { default: init } = await import('../../../../creativecloud/blocks/cc-forms/cc-forms.js');

document.body.innerHTML = await readFile({ path: './mocks/dropdown-body.html' });
describe('Dropdown Component', async () => {
  let configuredDropdowns = -1;
  let fetchSpy = null;

  before(async () => {
    const el = document.querySelector('.cc-forms');
    configuredDropdowns = [...el.querySelectorAll(':scope > div > div:nth-child(1) > .icon')].filter((i) => [...i.classList].join(' ').includes('cc-form-dropdown'));
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

  afterEach(() => {
    fetchSpy.restore();
  });

  it('Dropdown should be decorated', () => {
    expect(configuredDropdowns.length).to.equal(document.querySelectorAll('.cc-forms select').length);
  });

  it('Dropdown should have a label', () => {
    expect(document.querySelectorAll('.cc-forms .form-item label')).to.exist;
  });

  it('Dropdown should have a placeholder', () => {
    expect(document.querySelectorAll('.cc-forms .form-item select option')).to.exist;
  });

  it('Dependent dropdown should be disabled', () => {
    expect(document.querySelector('.cc-forms #state').disabled).to.be.true;
  });

  it('Change should be monitored', () => {
    // const changeEvent = new Event('change', { bubbles: true, detail: { child: ['value'] } });
    // document.querySelector('.cc-forms #country').dispatchEvent(changeEvent);
    // const changeBlur = new Event('blur', { bubbles: true });
    // document.querySelector('.cc-forms #country').dispatchEvent(changeBlur);
    // document.querySelector('.cc-forms #state').dispatchEvent(changeEvent);
    // document.querySelector('.cc-forms #productsku').dispatchEvent(changeEvent);
    // document.querySelector('.cc-forms #purchaseintent').dispatchEvent(changeEvent);
    // document.querySelector('.cc-forms #purchaseintent').dispatchEvent(changeBlur);
  });
});
