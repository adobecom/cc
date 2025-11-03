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
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('should resolve with button when it exists initially', async () => {
    const btn = document.createElement('button');
    btn.className = 'generate-button';
    container.appendChild(btn);

    const data = { target: container };
    const result = await waitForGenerateButton(data);
    expect(result).to.equal(btn);
  });

  it('should resolve when button appears later', async () => {
    const data = { target: container };
    setTimeout(() => {
      const btn = document.createElement('button');
      btn.className = 'generate-button';
      container.appendChild(btn);
    }, 100);

    const result = await waitForGenerateButton(data, 1000);
    expect(result).to.be.instanceOf(HTMLButtonElement);
  });

  it('should return null if button never appears', async () => {
    const data = { target: container };
    const result = await waitForGenerateButton(data, 200);
    expect(result).to.equal(null);
  });

  it('should handle invalid data safely', async () => {
    const result = await waitForGenerateButton(null);
    expect(result).to.equal(null);
  });
});
