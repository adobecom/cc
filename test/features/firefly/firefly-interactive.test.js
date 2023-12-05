import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import { setLibs } from '../../../creativecloud/scripts/utils.js';
import waitForElement from '../../helpers/waitForElement.js';

setLibs('/libs');

const { default: init } = await import('../../../creativecloud/blocks/interactive-marquee/interactive-marquee.js');

describe('firefly-marquee', () => {
  before(async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    await init(document.querySelector('.firefly'));
  });

  it('Prompt should exist', async () => {
    const promptbar = await waitForElement('.promptbar');
    expect(promptbar).to.exist;
  });

  it('Prompt should be placed at proper place in interactive container', async () => {
    const fireflypromptbar = await waitForElement('.firefly-prompt');
    expect(fireflypromptbar).to.exist;
  });

  it('Interactive selector should exist', async () => {
    const selector = await waitForElement('.selector-tray');
    expect(selector).to.exist;
  });

  it('Interactive selector should be placed at proper place in interactive container', async () => {
    const fireflyselector = await waitForElement('.firefly-selectortray');
    expect(fireflyselector).to.exist;
  });

  it('Enticement should exist', async () => {
    const enticementText = await waitForElement('.enticement-text');
    const enticementArrow = await waitForElement('.enticement-arrow');
    expect(enticementText).to.exist;
    expect(enticementArrow).to.exist;
  });

  it('Interactive selector should have three options', async () => {
    const selector = await waitForElement('.selector-tray');
    expect(selector.querySelectorAll('.options').length).to.equal(3);
  });

  it('Clicking on genfill option in interactive selector should diplay genfill detail', async () => {
    const selector = await waitForElement('.selector-tray');
    const button = selector.querySelectorAll('.options')[1];
    button.click();
    const genfillPrompt = await waitForElement('.genfill-prompt');
    const genfillButton = await waitForElement('.genfill-promptbar');
    expect(document.querySelector('video').parentNode.getAttribute('class')).to.not.equal('hide');
    expect(genfillPrompt).to.exist;
    expect(genfillButton).to.exist;
  });

  it('Clicking on text effect option in interactive selector should diplay text effect detail', async () => {
    const selector = await waitForElement('.selector-tray');
    const button = selector.querySelectorAll('.options')[2];
    button.click();
    const texteffectPrompt = await waitForElement('.promptbar');
    expect(texteffectPrompt).to.exist;
  });
});
