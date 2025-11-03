import { readFile, setViewport } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import { waitForGenerateButton } from '../../../../creativecloud/features/interactive-components/start-over/start-over.js';

document.body.innerHTML = await readFile({ path: './mocks/body.html' });
const { setLibs } = await import('../../../../creativecloud/scripts/utils.js');
const { default: init } = await import('../../../../creativecloud/blocks/interactive-metadata/interactive-metadata.js');

describe('Start Over', () => {
  let im = null;
  let ib = null;

  before(async () => {
    setLibs('https://milo.adobe.com/libs');
    im = document.querySelector('.interactive-metadata');
    ib = document.querySelector('.marquee');
    setViewport({ width: 1500, height: 1500 });
    window.dispatchEvent(new Event('resize'));
    await init(im);
  });
  it('should render generate layer', () => {
    expect(ib.querySelector('.interactive-holder.step-generate')).to.exist;
  });
  it('should have start over layer', async () => {
    document.querySelector('.generate-button').dispatchEvent(new Event('click'));
    await new Promise((res) => { setTimeout(() => { res(); }, 200); });
    expect(document.querySelector('.interactive-holder.step-start-over')).to.exist;
  });
  it('should have start over button', () => {
    expect(document.querySelector('.start-over-button')).to.exist;
  });
  it('should have generate layer', async () => {
    document.querySelector('.start-over-button').dispatchEvent(new Event('click'));
    await new Promise((res) => { setTimeout(() => { res(); }, 200); });
    expect(document.querySelector('.interactive-holder.step-generate')).to.exist;
  });
});

describe('waitForGenerateButton', () => {
  let data;

  beforeEach(async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });

    const wrapper = document.createElement('div');
    wrapper.classList.add('wrapper');
    const button = document.createElement('button');
    button.classList.add('generate-button');
    button.style.display = 'none';
    wrapper.appendChild(button);
    document.body.appendChild(wrapper);

    data = { target: wrapper };
  });

  it('should focus button when it becomes visible', async () => {
    const button = document.querySelector('.generate-button');

    setTimeout(() => {
      button.style.display = 'block';
      Object.defineProperty(button, 'offsetParent', { value: document.body });
    }, 100);

    const result = await waitForGenerateButton(data, 1000, 50);
    expect(result).to.equal(button);
    expect(document.activeElement).to.equal(button);
  });

  it('should timeout after 5 seconds if button never appears', async () => {
    const start = Date.now();
    const result = await waitForGenerateButton(data, 500, 100);
    const elapsed = Date.now() - start;

    expect(result).to.be.null;
    expect(elapsed).to.be.greaterThan(400);
  });

  it('should return null on timeout', async () => {
    const result = await waitForGenerateButton(data, 200, 50);
    expect(result).to.be.null;
  });

  it('should handle missing target element gracefully', async () => {
    const result = await waitForGenerateButton({ target: null }, 200, 50);
    expect(result).to.be.null;
  });
});
