import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import { setLibs } from '../../../../creativecloud/scripts/utils.js';

setLibs('/libs');

const { default: init } = await import('../../../../creativecloud/blocks/interactive-metadata/interactive-metadata.js');
document.body.innerHTML = await readFile({ path: './mocks/body.html' });
window.lana = { log: (msg) => { console.log(msg); } };
function delay(ms) {
  return new Promise((res) => { setTimeout(() => { res(); }, ms); });
}

describe('hue-sat-marquee', () => {
  let ib = null;
  let im = null;
  let ibAnimate = null;
  let imAnimate = null;

  before(async () => {
    ib = document.querySelector('.marquee');
    im = document.querySelector('.interactive-metadata');
    ibAnimate = document.querySelector('.test-animation.marquee');
    imAnimate = document.querySelector('.test-animation.interactive-metadata');
    await init(im);
    await init(imAnimate);
    await delay(900);
  });

  it('interactive marquee should exist', () => {
    const promptbar = document.querySelector('.interactive-enabled');
    expect(promptbar).to.exist;
  });

  it('Stopping animation', () => {
    ib.querySelector('.outerCircle').dispatchEvent(new Event('mousedown', { bubbles: true }));
    ib.querySelector('.outerCircle').dispatchEvent(new Event('click'));
    expect(ib.querySelector('.sliderTray .animate')).to.not.exist;
  });

  it('Set Saturation', () => {
    const saturationSlider = ib.querySelector('.saturation-input');
    saturationSlider.value = 180;
    saturationSlider.dispatchEvent(new Event('input'));
    saturationSlider.value = 180;
    saturationSlider.dispatchEvent(new Event('change'));
  });

  it('Tabbing on slider', () => {
    document.dispatchEvent(new Event('keydown'));
    document.querySelector('.hue-input').dispatchEvent(new Event('focus'));
    const focusableEle = document.querySelector('.focusUploadButton');
    expect(focusableEle).to.exist;
  });

  it('Testing upload', async () => {
    const uploadBtn = ib.querySelector('.uploadButton');
    uploadBtn.dispatchEvent(new Event('cancel'));
    const file = new File([''], 'media_.png', { lastModified: new Date(0), type: 'image/png' });
    uploadBtn.files = [file];
    uploadBtn.dispatchEvent(new Event('change'));
  });

  it('Running animation', async () => {
    const { x, y } = ibAnimate.querySelector('.sliderTray').getBoundingClientRect();
    window.scrollTo(x, y);
    await delay(900);
    ibAnimate.querySelector('.outerCircle').dispatchEvent(new Event('transitionend'));
    await delay(600);
  });
});
