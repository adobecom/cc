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
const { default: init } = await import('../../../../creativecloud/blocks/cc-forms/cc-forms.js');

document.body.innerHTML = await readFile({ path: './mocks/textfield-body.html' });
describe('TextField Component', async () => {
  let configuredTextFields = -1;
  before(async () => {
    const el = document.querySelector('.cc-forms');
    configuredTextFields = [...el.querySelectorAll(':scope > div > div:nth-child(1) > .icon')].filter((i) => [...i.classList].join(' ').includes('cc-form-text'));
    await init(el);
  });

  it('Text Fields should be decorated', () => {
    const textfields = document.querySelectorAll('input[type="text"].cc-form-component');
    expect(configuredTextFields.length - 1).to.be.equal(textfields.length);
  });

  it('Textbox should have placeholders', () => {
    const textfield = document.querySelector('input[type="text"].cc-form-component');
    expect(textfield.hasAttribute('placeholder')).to.be.true;
  });

  it('Textbox should have Label', () => {
    const label = document.querySelector('.form-item label');
    expect(label).to.exist;
  });

  it('Textbox should have disclaimer', () => {
    const disclaimer = document.querySelector('.form-item .field-detail.disclaimer');
    expect(disclaimer).to.exist;
  });

  it('Last checkbox configured should be no label and optional', () => {
    const textfields = document.querySelectorAll('input[type="text"].cc-form-component');
    expect(textfields[textfields.length - 1].required).to.be.false;
    expect(textfields[textfields.length - 1].closest('.form-item').querySelector('label')).to.not.exist;
    expect(textfields[textfields.length - 1].closest('.form-item').querySelector('.field-detail.disclaimer')).to.not.exist;
  });

  // it('Textbox should be evaluated for correct pattern', () => {
  //   const textfield = document.querySelector('input[type="text"].cc-form-component');
  //   textfield.value = 'Sample';
  //   const event = new Event('blur', { bubbles: true });
  //   textfield.dispatchEvent(event);
  //   expect(textfield.getAttribute('data-valid')).to.equal('true');
  // });

  // it('Textbox should be evaluated for incorrect value', () => {
  //   const textfield = document.querySelector('#fname');
  //   textfield.value = 'feqwf#$@';
  //   const event = new Event('blur', { bubbles: true });
  //   textfield.dispatchEvent(event);
  //   expect(textfield.getAttribute('data-valid')).to.equal('false');
  // });

  // it('Textbox should be evaluated for empty value', () => {
  //   const textfield = document.querySelector('#email');
  //   textfield.value = '';
  //   const event = new Event('blur', { bubbles: true });
  //   textfield.dispatchEvent(event);
  //   expect(textfield.getAttribute('data-valid')).to.equal('false');
  // });

  it('Text should have a text area', () => {
    const textarea = document.querySelector('textarea');
    expect(textarea).to.exist;
  });
});
