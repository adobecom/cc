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

document.body.innerHTML = await readFile({ path: './mocks/checkbox-body.html' });
describe('Checkbox Component', async () => {
  let configuredBoxes = -1;
  before(async () => {
    const el = document.querySelector('.cc-forms');
    configuredBoxes = [...el.querySelectorAll(':scope > div > div:nth-child(1) > .icon')].filter((i) => [...i.classList].join(' ').includes('cc-form-checkbox'));
    await init(el);
  });

  it('First checkbox configured checked should be checked', () => {
    const checkboxes = document.querySelector('.cc-form-component.check-item-input.checkbox-input');
    expect(checkboxes.checked).to.be.true;
  });

  it('Last checkbox configured optional should be optional', () => {
    const checkboxes = document.querySelectorAll('.cc-form-component.check-item-input.checkbox-input');
    expect(checkboxes[checkboxes.length - 1].required).to.be.false;
  });

  it('Checkboxes should be decorated', () => {
    const checkboxes = document.querySelectorAll('.cc-form-component.check-item-input.checkbox-input');
    expect(checkboxes.length).to.be.equal(configuredBoxes.length);
  });

  it('Checkboxes should be evaluated', () => {
    const checkbox = document.querySelector('.cc-form-component.check-item-input.checkbox-input');
    checkbox.click();
    checkbox.click();
    expect(checkbox.hasAttribute('data-valid')).to.be.true;
  });
});
