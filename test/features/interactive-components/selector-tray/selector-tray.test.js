import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';

document.body.innerHTML = await readFile({ path: './mocks/body.html' });
const { setLibs } = await import('../../../../creativecloud/scripts/utils.js');
const { default: init } = await import('../../../../creativecloud/blocks/interactive-metadata/interactive-metadata.js');

describe('Selector tray', () => {
  let im = null;
  let ib = null;

  before(async () => {
    setLibs('https://milo.adobe.com/libs');
    im = document.querySelector('.interactive-metadata');
    ib = document.querySelector('.marquee');
    await init(im);
  });
  it('should render selector tray', () => {
    expect(ib.querySelector('.interactive-holder.step-selector-tray')).to.exist;
  });
  it('should remove selection on hover', async () => {
    expect(document.querySelector('.step-selector-tray .thumbnail-selected')).to.exist;
    document.querySelector('.tray-thumbnail-img').dispatchEvent(new Event('mouseover'));
    expect(document.querySelector('.step-selector-tray .thumbnail-selected')).to.not.exist;
  });
  it('should have next layer on selection', async () => {
    document.querySelector('.tray-thumbnail-img').dispatchEvent(new Event('click'));
    await new Promise((res) => { setTimeout(() => { res(); }, 200); });
    expect(document.querySelector('.interactive-holder.step-crop')).to.exist;
  });
  it('should have next layer on with selected thumbnail', async () => {
    document.querySelector('.crop-button').dispatchEvent(new Event('click'));
    await new Promise((res) => { setTimeout(() => { res(); }, 200); });
    expect(document.querySelector('.step-selector-tray .thumbnail-selected')).to.exist;
  });
  it('should have not have thumbnail on selection', async () => {
    const thumbnail = document.querySelector('.show-layer .tray-thumbnail-img.thumbnail-selected');
    thumbnail.dispatchEvent(new Event('touchstart'));
    await new Promise((res) => { setTimeout(() => { res(); }, 200); });
  });
});
