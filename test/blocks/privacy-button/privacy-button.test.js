import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import { stub } from 'sinon';
import waitForElement from '../../helpers/waitForElement.js';

const { setConfig } = await import(import.meta.resolve('libs/utils/utils.js'));

window.lana = { log: stub() };
const locales = { '': { ietf: 'en-US', tk: 'hah7vzn.css' } };
const conf = { locales };
setConfig(conf);
describe('Privacy Button', () => {
  before(async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const { default: init } = await import('../../../creativecloud/blocks/privacy-button/privacy-button.js');
    const privacyButton = document.querySelector('.privacy-button');
    init(privacyButton);
  });

  it('renders the button with correct label', async () => {
    const button = await waitForElement('.con-button.blue');
    expect(button).to.exist;
    expect(button.textContent).to.equal('Accept');
  });

  it('injects tracking images on button click', async () => {
    const button = await waitForElement('.con-button.blue');
    button.click();
    const trackingImages = document.querySelectorAll('.privacy-tracking-image');
    console.log(trackingImages);
    expect(trackingImages.length).to.equal(2);
    expect(trackingImages[0].src).to.equal('https://example.com/tracking1');
    expect(trackingImages[1].src).to.equal('https://example.com/tracking2');
  });

  it('replaces button with confirmation message on click', async () => {
    const message = document.querySelectorAll('.privacy-button-message');
    console.log(message);
    expect(message).to.exist;
    expect(message[0].textContent).to.equal('Thank you for accepting!');
  });
});
