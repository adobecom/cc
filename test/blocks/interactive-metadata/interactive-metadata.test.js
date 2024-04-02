import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';

document.body.innerHTML = await readFile({ path: './mocks/interactive-metadata.html' });
const { setLibs } = await import('../../../creativecloud/scripts/utils.js');
const { default: init } = await import('../../../creativecloud/blocks/interactive-metadata/interactive-metadata.js');

describe('interactive metadata', () => {
  let im = null;
  let ib = null;
  let genfillIm = null;
  let genfillMarquee = null;

  before(async () => {
    setLibs('https://milo.adobe.com/libs');
    im = document.querySelector('.interactive-metadata');
    ib = document.querySelector('.marquee');
    genfillIm = document.querySelector('.interactive-metadata.workflow-genfill');
    genfillMarquee = genfillIm.closest('.section').querySelector('.marquee');
    await init(im);
    await init(genfillIm);
  });
  it('interactive metadata should exist', () => {
    expect(im).to.exist;
  });
  it('should make the previous block interactive-enabled', () => {
    expect(ib).to.exist;
    expect(ib.classList.contains('interactive-enabled')).to.be.true;
  });
  it('should create a workflow', () => {
    let hasWorkflowClass = false;
    im.classList.forEach((className) => {
      if (className.startsWith('workflow-')) {
        hasWorkflowClass = true;
      }
    });
    expect(hasWorkflowClass).to.be.true;
  });
  it('should render next selector tray', async () => {
    im.dispatchEvent(new CustomEvent('cc:interactive-switch'));
    await new Promise((res) => { setTimeout(() => { res(); }, 200); });
    expect(ib.querySelector('.interactive-holder.step-selector-tray')).to.exist;
  });
  it('should render next crop layer', async () => {
    im.dispatchEvent(new CustomEvent('cc:interactive-switch'));
    await new Promise((res) => { setTimeout(() => { res(); }, 200); });
    expect(ib.querySelector('.interactive-holder.step-crop')).to.exist;
  });
  it('should render next start-over layer', async () => {
    im.dispatchEvent(new CustomEvent('cc:interactive-switch'));
    await new Promise((res) => { setTimeout(() => { res(); }, 200); });
    expect(ib.querySelector('.interactive-holder.step-start-over')).to.exist;
  });
  it('should render next generate layer', async () => {
    im.dispatchEvent(new CustomEvent('cc:interactive-switch'));
    await new Promise((res) => { setTimeout(() => { res(); }, 200); });
    expect(ib.querySelector('.interactive-holder.step-generate')).to.exist;
  });
  it('Genfill: should render generate layer', () => {
    expect(genfillMarquee.querySelector('.interactive-holder.step-generate')).to.exist;
  });
  it('Genfill: should render generate layer', async () => {
    genfillIm.dispatchEvent(new CustomEvent('cc:interactive-switch'));
    await new Promise((res) => { setTimeout(() => { res(); }, 200); });
    expect(genfillMarquee.querySelector('.interactive-holder.step-generate')).to.exist;
  });
  it('Genfill: should render start over layer', async () => {
    genfillIm.dispatchEvent(new CustomEvent('cc:interactive-switch'));
    await new Promise((res) => { setTimeout(() => { res(); }, 200); });
    expect(genfillMarquee.querySelector('.interactive-holder.step-start-over')).to.exist;
  });
});
