import { readFile, setViewport } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import 'sinon/pkg/sinon.js';

document.body.innerHTML = await readFile({ path: './mocks/body.html' });
const { setLibs } = await import('../../../../creativecloud/scripts/utils.js');
const { default: init } = await import('../../../../creativecloud/blocks/interactive-metadata/interactive-metadata.js');
const { default: stepInit, waitForGenerateButton } = await import(`${window.location.origin}/creativecloud/features/interactive-components/start-over/start-over.js`);

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

describe('Start Over stepInit', () => {
  let section;
  let config;
  let data;
  let sandbox;

  beforeEach(() => {
    sandbox = window.sinon.createSandbox();
    section = document.createElement('div');
    section.className = 'section';
    section.innerHTML = '<div class="aside"><div class="text"><h2> Image editor </h2></div><div class="target"></div></div>';
    document.body.appendChild(section);
    config = document.createElement('div');
    config.innerHTML = '<div><p>Start Over</p></div>';
    data = {
      stepConfigs: [config],
      stepIndex: 0,
      target: section.querySelector('.target'),
      el: section,
      nextStepEvent: 'start-over-test',
      openForExecution: Promise.resolve(),
    };
  });

  afterEach(() => {
    sandbox.restore();
    section.remove();
  });

  it('should render an immediately visible button without an icon', async () => {
    const layer = await stepInit(data);
    const button = layer.querySelector('.start-over-button');

    expect(data.target.classList.contains('step-start-over')).to.be.true;
    expect(layer.className).to.equal('layer layer-0');
    expect(button.textContent).to.equal('Start Over');
    expect(button.getAttribute('role')).to.equal('button');
    expect(button.getAttribute('href')).to.equal('#');
    expect(button.getAttribute('aria-label')).to.equal('Start Overgenerate image');
    expect(button.style.display).to.equal('flex');
    expect(button.querySelector('img')).to.not.exist;
  });

  it('should move the SVG icon into the button and leave a clone in the config', async () => {
    config.innerHTML = '<div><p><picture><img src="/test/blocks/interactive-metadata/mocks/assets/icon_.svg" alt="Reset"></picture></p><p>Start Over</p></div>';
    const icon = config.querySelector('img');
    const layer = await stepInit(data);

    expect(layer.querySelector('img')).to.equal(icon);
    expect(config.querySelector('img')).to.not.equal(icon);
    expect(config.querySelector('img').outerHTML).to.equal(icon.outerHTML);
  });

  it('should exclude accessibility-control icons', async () => {
    config.innerHTML = '<div><p><picture><img class="accessibility-control" src="/test/blocks/interactive-metadata/mocks/assets/icon_.svg"></picture></p><p>Start Over</p></div>';
    const layer = await stepInit(data);

    expect(layer.querySelector('img')).to.not.exist;
    expect(config.querySelector('img')).to.exist;
  });

  it('should omit the label and button text when they are empty', async () => {
    section.querySelector('h2').textContent = ' ';
    config.querySelector('p').textContent = '';
    const layer = await stepInit(data);
    const button = layer.querySelector('.start-over-button');

    expect(button.hasAttribute('aria-label')).to.be.false;
    expect(button.textContent).to.equal('');
  });

  it('should preserve a configured link without triggering the next step', async () => {
    config.querySelector('p').innerHTML = '<a href="#destination">Restart elsewhere</a>';
    const layer = await stepInit(data);
    const button = layer.querySelector('.start-over-button');
    const nextStep = sandbox.spy();
    section.addEventListener(data.nextStepEvent, nextStep);
    const click = new MouseEvent('click', { cancelable: true });
    button.dispatchEvent(click);

    expect(button.href).to.equal(config.querySelector('a').href);
    expect(button.textContent).to.equal('Restart elsewhere');
    expect(click.defaultPrevented).to.be.false;
    expect(layer.classList.contains('disable-click')).to.be.false;
    expect(nextStep.called).to.be.false;
  });

  it('should wait for execution and ignore repeat clicks before focusing generate', async () => {
    let allowExecution;
    data.openForExecution = new Promise((resolve) => { allowExecution = resolve; });
    const generate = document.createElement('button');
    generate.className = 'generate-button';
    data.target.appendChild(generate);
    const nextStep = sandbox.spy();
    section.addEventListener(data.nextStepEvent, nextStep);
    const layer = await stepInit(data);
    data.target.appendChild(layer);
    const button = layer.querySelector('.start-over-button');
    const click = new MouseEvent('click', { cancelable: true });
    button.dispatchEvent(click);
    button.click();

    expect(click.defaultPrevented).to.be.true;
    expect(layer.classList.contains('disable-click')).to.be.true;
    expect(nextStep.called).to.be.false;

    allowExecution();
    await data.openForExecution;

    expect(nextStep.calledOnce).to.be.true;
    expect(nextStep.firstCall.args[0]).to.be.instanceOf(CustomEvent);
    expect(document.activeElement).to.equal(generate);
  });

  [
    { delay: '2', milliseconds: 2000 },
    { delay: '150', milliseconds: 150 },
  ].forEach(({ delay, milliseconds }) => {
    it(`should reveal the button after ${delay} only when intersecting`, async () => {
      const clock = sandbox.useFakeTimers();
      let onIntersection;
      const observer = { observe: sandbox.spy(), unobserve: sandbox.spy() };
      sandbox.stub(window, 'IntersectionObserver').callsFake((callback) => {
        onIntersection = callback;
        return observer;
      });
      config.querySelector('p').textContent = `Start Over | ${delay}`;
      const layer = await stepInit(data);
      const button = layer.querySelector('.start-over-button');

      expect(observer.observe.calledOnceWithExactly(layer)).to.be.true;
      onIntersection([{ target: layer, isIntersecting: false }], observer);
      clock.tick(milliseconds);
      expect(button.style.display).to.equal('');
      expect(observer.unobserve.called).to.be.false;

      onIntersection([{ target: layer, isIntersecting: true }], observer);
      expect(observer.unobserve.calledOnceWithExactly(layer)).to.be.true;
      clock.tick(milliseconds - 1);
      expect(button.style.display).to.equal('');
      clock.tick(1);
      expect(button.style.display).to.equal('flex');
    });
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
    expect(document.activeElement).to.equal(btn);
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
    expect(document.activeElement).to.equal(result);
  });

  it('should wait through unrelated mutations and a hidden button until it becomes visible', async () => {
    const resultPromise = waitForGenerateButton({ target: container }, 1000);
    container.appendChild(document.createElement('span'));
    await Promise.resolve();
    const button = document.createElement('button');
    button.className = 'generate-button';
    button.style.display = 'none';
    container.appendChild(button);
    await Promise.resolve();
    expect(document.activeElement).to.not.equal(button);

    button.style.display = 'block';
    expect(await resultPromise).to.equal(button);
    expect(document.activeElement).to.equal(button);
  });

  it('should resolve when an initially hidden button becomes visible after a class change', async () => {
    const button = document.createElement('button');
    button.className = 'generate-button';
    const hiddenContainer = document.createElement('div');
    hiddenContainer.className = 'hidden';
    const style = document.createElement('style');
    style.textContent = '.hidden { display: none; }';
    container.append(style, hiddenContainer);
    hiddenContainer.appendChild(button);
    const resultPromise = waitForGenerateButton({ target: container }, 1000);

    hiddenContainer.classList.remove('hidden');
    expect(await resultPromise).to.equal(button);
    expect(document.activeElement).to.equal(button);
  });

  it('should time out when the generate button remains hidden', async () => {
    const button = document.createElement('button');
    button.className = 'generate-button';
    button.style.display = 'none';
    container.appendChild(button);

    expect(await waitForGenerateButton({ target: container }, 20)).to.equal(null);
    button.style.display = 'block';
    await Promise.resolve();
    expect(document.activeElement).to.not.equal(button);
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

  [undefined, {}, { target: null }, { target: {} }, { target: { querySelector: true } }]
    .forEach((data) => {
      it(`should return null for invalid input ${JSON.stringify(data)}`, async () => {
        expect(await waitForGenerateButton(data)).to.equal(null);
      });
    });
});
