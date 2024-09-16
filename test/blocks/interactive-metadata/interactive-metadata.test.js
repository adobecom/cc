import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';

const { setLibs } = await import('../../../creativecloud/scripts/utils.js');
const { default: init } = await import('../../../creativecloud/blocks/interactive-metadata/interactive-metadata.js');
const { handleImageTransition } = await import('../../../creativecloud/blocks/interactive-metadata/interactive-metadata.js');
function delay(ms) {
  return new Promise((res) => { setTimeout(() => { res(); }, ms); });
}

document.body.innerHTML = await readFile({ path: './mocks/interactive-metadata.html' });
describe('interactive metadata', () => {
  let im = null;
  let ib = null;

  before(async () => {
    setLibs('https://milo.adobe.com/libs');
    im = document.querySelector('.interactive-metadata');
    ib = document.querySelector('.marquee');
    await init(im);
  });

  it('should make the previous block interactive-enabled', () => {
    expect(ib).to.exist;
    expect(ib.classList.contains('interactive-enabled')).to.be.true;
  });

  // it('should start animation', async () => {
  //   const { x, y } = ib.querySelector('.gray-button').getBoundingClientRect();
  //   window.scrollTo(x, y);
  //   await delay(200);
  //   expect(ib.querySelector('.interactive-holder .show-layer .gray-button.animated')).to.exist;
  // });

  it('should create a workflow', () => {
    let hasWorkflowClass = false;
    im.classList.forEach((className) => {
      if (className.startsWith('workflow-')) {
        hasWorkflowClass = true;
      }
    });
    expect(hasWorkflowClass).to.be.true;
  });

  it('should render next layer', async () => {
    im.dispatchEvent(new CustomEvent('cc:interactive-switch'));
    await delay(200);
    expect(ib.querySelector('.interactive-holder .layer-1.show-layer')).to.exist;
  });

  it('should render start over layer', async () => {
    im.dispatchEvent(new CustomEvent('cc:interactive-switch'));
    await delay(200);
    expect(ib.querySelector('.interactive-holder.step-start-over')).to.exist;
  });

  it('Transition video', async () => {
    const trgt = ib.querySelector('.image .interactive-holder');
    const mockStepInfo = {
      im,
      stepIndex: 0,
      stepName: 'generate',
      stepList: ['generate', 'generate', 'start-over'],
      stepConfigs: im.querySelectorAll(':scope > div'),
      target: trgt,
      displayPath: 0,
      openForExecution: Promise.resolve(true),
    };
    const transitionCfg = { useCfg: true, vsrc: `${window.origin}/videoo.mp4#_autoplay` };
    await handleImageTransition(mockStepInfo, transitionCfg);
  });
});
