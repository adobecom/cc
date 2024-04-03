import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import { setLibs } from '../../../../creativecloud/scripts/utils.js';

setLibs('/libs');

const { default: init } = await import('../../../../creativecloud/blocks/interactive-metadata/interactive-metadata.js');
document.body.innerHTML = await readFile({ path: './mocks/body.html' });

describe('hue-sat-marquee', () => {
  let ib = null;

  before(async () => {
    console.log('marquee', document.querySelector('.interactive-metadata'));
    await init(document.querySelector('.interactive-metadata'));
    ib = document.querySelector('.marquee');
  });

  it('interactive marquee should exist', () => {
    const promptbar = document.querySelector('.interactive-enabled');
    expect(promptbar).to.exist;
  });

  it('listen to hue-slider event', () => {
    document.querySelector('.hue-input').dispatchEvent(new Event('input'));
    setTimeout(() => expect(ib).to.equal(''), 200);
  });

  it('Tabbing on slider', () => {
    document.dispatchEvent(new Event('keydown'));
    document.querySelector('.hue-input').dispatchEvent(new Event('focus'));
    const focusableEle = document.querySelector('.focusUploadButton');
    expect(focusableEle).to.exist;
  });

  it('Tabbing on slider', () => {
    document.dispatchEvent(new Event('keydown'));
    document.querySelector('.hue-input').dispatchEvent(new Event('blur'));
    const focusableEle = document.querySelector('.focusUploadButton');
    expect(focusableEle).to.not.exist;
  });
});
//     let ib = null;
//     let mockObserver;
//     before(async () => {
//       console.log('marquee', document.querySelector('.interactive-metadata'));
//       await init(document.querySelector('.interactive-metadata'));
//       ib = document.querySelector('.marquee');
//       IntersectionObserver = await sinon.stub().callsFake(callback => {
//         mockObserver = new MockIntersectionObserver(callback);
//         return mockObserver;
//       });
//     });

//     // after(() => {
//     //     delete IntersectionObserver;
//     //   });

//     it('interactive marquee should exist', async () => {
//         const promptbar = await waitForElement('.interactive-enabled');
//         expect(promptbar).to.exist;
//     });

//     it('listen to hue-slider event', () => {
//         document.querySelector('.hue-input').dispatchEvent(new Event('input'));
//         setTimeout(() => expect(ib).to.equal(''), 200);
//     });

//     it('listen to saturation-slider event', async() => {
//         document.querySelector('.saturation-input').dispatchEvent(new Event('input'));
//         setTimeout(() => expect(ib).to.equal(''), 200);
//     });

//     it('Intersection Observer', async() => {
//         console.log('mockObserver', mockObserver);
//         const element = await waitForElement('.sliderTray');
//         console.log('sliderTray', element);
//         mockObserver.observe(element);
//         mockObserver.triggerIntersect([{ isIntersecting: true, intersectionRatio: 1, target: element }]);
//         const showOuterBorder = await waitForElement('.showOuterBorder');
//         expect(showOuterBorder).to.exist;
//       });
// });