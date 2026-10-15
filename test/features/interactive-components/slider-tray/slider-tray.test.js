import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import 'sinon/pkg/sinon.js';
import { getConfig, setLibs } from '../../../../creativecloud/scripts/utils.js';

setLibs('/libs');

const { default: init } = await import('../../../../creativecloud/blocks/interactive-metadata/interactive-metadata.js');
const { default: stepInit } = await import(`${window.location.origin}/creativecloud/features/interactive-components/slider-tray/slider-tray.js`);
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

describe('Slider Tray stepInit', () => {
  let sandbox;
  let clock;
  let block;
  let config;
  let data;
  let observer;
  let onIntersection;
  let documentListeners;
  let windowListeners;
  let originalDir;
  let settings;
  let environmentDescriptors;

  beforeEach(() => {
    sandbox = window.sinon.createSandbox();
    clock = sandbox.useFakeTimers();
    documentListeners = sandbox.spy(document, 'addEventListener');
    windowListeners = sandbox.spy(window, 'addEventListener');
    settings = getConfig();
    environmentDescriptors = ['prodDomains', 'stage', 'prod'].map((name) => ({
      name,
      descriptor: Object.getOwnPropertyDescriptor(settings, name),
    }));
    Object.assign(settings, {
      prodDomains: [],
      stage: { ...settings.stage, psUrl: 'https://stage.photoshop.adobe.com' },
      prod: { ...settings.prod, psUrl: 'https://photoshop.adobe.com' },
    });
    originalDir = document.dir;
    document.dir = 'ltr';
    observer = { observe: sandbox.spy(), unobserve: sandbox.spy() };
    sandbox.stub(window, 'IntersectionObserver').callsFake((callback) => {
      onIntersection = callback;
      return observer;
    });
    block = document.createElement('div');
    block.className = 'marquee';
    block.innerHTML = '<div class="interactive-holder"><picture><img src="/test/blocks/interactive-metadata/mocks/assets/media_.png"></picture></div>';
    document.body.appendChild(block);
    config = document.createElement('div');
    config.innerHTML = `<div><ul>
      <li><span class="icon icon-hue-slider"></span> Hue</li>
      <li><span class="icon icon-saturation-slider"></span> Saturation</li>
      <li><span class="icon icon-upload"></span> Upload Image</li>
      <li><span class="icon icon-upload-ps"></span> Continue to Photoshop</li>
    </ul></div>`;
    data = { target: block, stepConfigs: [config], stepIndex: 0 };
  });

  afterEach(() => {
    documentListeners.getCalls().forEach(({ args }) => {
      document.removeEventListener(...args);
    });
    windowListeners.getCalls().forEach(({ args }) => {
      window.removeEventListener(...args);
    });
    document.dir = originalDir;
    sandbox.restore();
    environmentDescriptors.forEach(({ name, descriptor }) => {
      if (descriptor) Object.defineProperty(settings, name, descriptor);
      else delete settings[name];
    });
    block.remove();
  });

  async function render() {
    const layer = await stepInit(data);
    block.querySelector('.interactive-holder').appendChild(layer);
    return layer;
  }

  function setSlider(layer, type, value) {
    const input = layer.querySelector(`.${type}-input`);
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    return input;
  }

  it('should render slider ranges, labels, upload inputs, and a hidden continue button', async () => {
    const layer = await render();
    const hue = layer.querySelector('.hue-input');
    const saturation = layer.querySelector('.saturation-input');

    expect(layer.className).to.equal('layer layer-0');
    expect(hue.min).to.equal('-180');
    expect(hue.max).to.equal('180');
    expect(hue.value).to.equal('0');
    expect(saturation.min).to.equal('0');
    expect(saturation.max).to.equal('300');
    expect(saturation.value).to.equal('150');
    expect(hue.getAttribute('aria-label')).to.equal('hue slider');
    expect(layer.querySelector('label').textContent).to.equal('Hue');
    expect(hue.nextSibling.getAttribute('role')).to.equal('slider');
    expect(hue.nextSibling.getAttribute('aria-valuenow')).to.equal('0');
    expect(layer.querySelectorAll('.inputFile')).to.have.lengthOf(2);
    expect(layer.querySelector('.inputFile').accept).to.equal('image/*');
    expect(layer.querySelector('.continueButton').classList.contains('hide')).to.be.true;
    expect(observer.observe.calledOnceWithExactly(layer.querySelector('.sliderTray'))).to.be.true;
  });

  it('should use smaller upload text on mobile', async () => {
    sandbox.stub(window, 'innerWidth').value(400);
    const layer = await render();

    expect(layer.querySelector('.uploadButton').classList.contains('body-m')).to.be.true;
    expect(layer.querySelector('.uploadButtonMobile').classList.contains('body-m')).to.be.true;
  });

  it('should clone SVG icons without moving them out of the configuration', async () => {
    const uploadOption = config.querySelector('.icon-upload').parentElement;
    uploadOption.insertAdjacentHTML('beforeend', '<picture><img src="/test/blocks/interactive-metadata/mocks/assets/icon_.svg"></picture>');
    const icon = config.querySelector('img');
    const layer = await render();

    expect(config.querySelector('img')).to.equal(icon);
    expect(layer.querySelectorAll('.svg-icon-container img')).to.have.lengthOf(2);
    expect(layer.querySelector('.svg-icon-container img')).to.not.equal(icon);
    expect(layer.querySelector('.svg-icon-container img').src).to.equal(icon.src);
  });

  it('should ignore pictures without SVG icons and log unknown input types', async () => {
    config.querySelector('.icon-upload').parentElement.insertAdjacentHTML('beforeend', '<picture><img src="/test/blocks/interactive-metadata/mocks/assets/media_.png"></picture>');
    config.querySelector('ul').insertAdjacentHTML('beforeend', '<li><span class="icon icon-unknown"></span> Unknown</li>');
    const log = sandbox.stub(window.lana, 'log');
    const layer = await render();

    expect(layer.querySelector('.svg-icon-container')).to.not.exist;
    expect(log.calledOnce).to.be.true;
    expect(log.firstCall.args).to.deep.equal([
      'Unknown input type: unknown',
      { tags: 'slider-tray', errorType: 'i', severity: 'error' },
    ]);
  });

  [
    { hue: -180, saturation: 0, position: '3%' },
    { hue: 0, saturation: 100, position: '50%' },
    { hue: 180, saturation: 300, position: '97%' },
  ].forEach(({ hue, saturation, position }) => {
    it(`should apply hue ${hue} and saturation ${saturation} with accessible values`, async () => {
      const layer = await render();
      const hueInput = setSlider(layer, 'hue', hue);
      const saturationInput = setSlider(layer, 'saturation', saturation);

      expect(block.querySelector('img').style.filter).to.equal(`hue-rotate(${hue}deg) saturate(${saturation}%)`);
      expect(hueInput.getAttribute('value')).to.equal(`${hue}`);
      expect(hueInput.nextSibling.getAttribute('aria-valuenow')).to.equal(`${hue}`);
      expect(hueInput.nextSibling.getAttribute('aria-valuetext')).to.equal(`${hue}`);
      expect(hueInput.nextSibling.style.left).to.equal(position);
      expect(saturationInput.nextSibling.getAttribute('aria-valuenow')).to.equal(`${saturation}`);
    });
  });

  it('should position the thumb from the right in an RTL aside', async () => {
    document.dir = 'rtl';
    block.className = 'aside';
    const layer = await render();
    const input = setSlider(layer, 'hue', 180);

    expect(input.nextSibling.style.right).to.equal('97%');
    expect(input.nextSibling.style.left).to.equal('');
  });

  it('should log out-of-range CSS and Photoshop adjustment values', async () => {
    const layer = await render();
    const log = sandbox.stub(window.lana, 'log');
    layer.querySelector('.saturation-input').max = '400';
    setSlider(layer, 'saturation', 400);

    expect(log.callCount).to.equal(2);
    expect(log.firstCall.args[0]).to.equal('value out of range saturation:400');
    expect(log.secondCall.args[0]).to.equal('value out of range saturation:1.5');
  });

  it('should trigger a prevented analytics click when a slider change is committed', async () => {
    const layer = await render();
    const input = layer.querySelector('.hue-input');
    const click = sandbox.spy();
    input.nextSibling.addEventListener('click', click);
    input.dispatchEvent(new Event('change'));

    expect(click.calledOnce).to.be.true;
    expect(click.firstCall.args[0].defaultPrevented).to.be.true;
  });

  it('should show keyboard focus, clear it on blur, and not show it after keyup', async () => {
    const layer = await render();
    const input = layer.querySelector('.inputFile');
    const button = input.closest('.uploadButton');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));
    input.dispatchEvent(new Event('focus'));
    expect(button.classList.contains('focusUploadButton')).to.be.true;

    input.dispatchEvent(new Event('blur'));
    expect(button.classList.contains('focusUploadButton')).to.be.false;
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'Tab' }));
    input.dispatchEvent(new Event('focus'));
    expect(button.classList.contains('focusUploadButton')).to.be.false;
  });

  ['.uploadButton:not(.uploadButtonMobile)', '.uploadButtonMobile'].forEach((selector) => {
    it(`should upload an image using ${selector} and reveal continue`, async () => {
      const layer = await render();
      const button = layer.querySelector(selector);
      const input = button.querySelector('.inputFile');
      const file = new File(['image'], 'uploaded.png', { type: 'image/png' });
      const createObjectURL = sandbox.spy(URL, 'createObjectURL');
      Object.defineProperty(input, 'files', { value: [file] });
      input.dispatchEvent(new Event('change', { bubbles: true }));
      const imageUrl = createObjectURL.firstCall.returnValue;

      expect(createObjectURL.calledOnceWithExactly(file)).to.be.true;
      expect(block.querySelector('img').src).to.equal(imageUrl);
      expect(button.querySelector('.interactive-link-analytics-text').textContent).to.equal('Upload Button');
      expect(layer.querySelector('.continueButton').classList.contains('hide')).to.be.false;
      URL.revokeObjectURL(imageUrl);
    });
  });

  it('should ignore non-image files without changing the image or continue state', async () => {
    const layer = await render();
    const imageSrc = block.querySelector('img').src;
    const input = layer.querySelector('.inputFile');
    Object.defineProperty(input, 'files', { value: [new File(['text'], 'file.txt', { type: 'text/plain' })] });
    const createObjectURL = sandbox.spy(URL, 'createObjectURL');
    input.dispatchEvent(new Event('change', { bubbles: true }));

    expect(createObjectURL.called).to.be.false;
    expect(block.querySelector('img').src).to.equal(imageSrc);
    expect(layer.querySelector('.continueButton').classList.contains('hide')).to.be.true;
  });

  it('should upload successfully without a continue button', async () => {
    config.querySelector('.icon-upload-ps').parentElement.remove();
    const layer = await render();
    const input = layer.querySelector('.inputFile');
    Object.defineProperty(input, 'files', { value: [new File(['image'], 'image.png', { type: 'image/png' })] });
    input.dispatchEvent(new Event('change', { bubbles: true }));

    expect(layer.querySelector('.continueButton')).to.not.exist;
    expect(block.querySelector('img').src).to.match(/^blob:/);
    URL.revokeObjectURL(block.querySelector('img').src);
  });

  it('should dispatch cancel analytics and restore the upload label', async () => {
    const layer = await render();
    const button = layer.querySelector('.uploadButton');
    const labels = [];
    button.addEventListener('click', () => { labels.push(button.getAttribute('daa-ll')); });
    button.dispatchEvent(new Event('cancel'));

    expect(labels).to.deep.equal(['Cancel Upload']);
    expect(button.getAttribute('daa-ll')).to.equal('Upload Image');
    const click = new MouseEvent('click', { cancelable: true });
    button.dispatchEvent(click);
    expect(click.defaultPrevented).to.be.false;
  });

  [
    { production: false, hue: null, saturation: null },
    { production: true, hue: 90, saturation: 200 },
    { production: false, hue: -90, saturation: 50 },
  ].forEach(({ production, hue, saturation }) => {
    it(`should prepare a ${production ? 'production' : 'staging'} Photoshop handoff for hue ${hue}`, async () => {
      const layer = await render();
      sandbox.stub(settings, 'prodDomains').value(production ? [window.location.host] : []);
      const file = new File(['image'], 'handoff.png', { type: 'image/png' });
      const input = layer.querySelector('.inputFile');
      Object.defineProperty(input, 'files', { value: [file] });
      input.dispatchEvent(new Event('change', { bubbles: true }));
      const imageUrl = block.querySelector('img').src;
      if (hue !== null) setSlider(layer, 'hue', hue);
      if (saturation !== null) setSlider(layer, 'saturation', saturation);
      const blob = new Blob(['image'], { type: 'image/png' });
      const readBlob = sandbox.stub().resolves(blob);
      const fetchImage = sandbox.stub(window, 'fetch').resolves({ blob: readBlob });
      const proxyFrame = new Promise((resolve) => {
        sandbox.stub(document.body, 'appendChild').callsFake((element) => {
          resolve(element);
          return element;
        });
      });

      layer.querySelector('.continueButton').click();
      const iframe = await proxyFrame;
      const expectedURL = new URL(production ? settings.prod.psUrl : settings.stage.psUrl);

      expect(fetchImage.calledOnceWithExactly(imageUrl)).to.be.true;
      expect(readBlob.calledOnce).to.be.true;
      expect(iframe.tagName).to.equal('IFRAME');
      expect(iframe.isConnected).to.be.false;
      expect(iframe.style.display).to.equal('none');
      expect(new URL(iframe.src).origin).to.equal(expectedURL.origin);
      expect(new URL(iframe.src).pathname).to.equal('/embed-content-proxy.html');
      expect(new URL(iframe.src).searchParams.get('origin')).to.equal(window.location.origin);
      URL.revokeObjectURL(imageUrl);
    });
  });

  it('should wait for intersection and complete a slider animation', async () => {
    const layer = await render();
    const tray = layer.querySelector('.sliderTray');
    const input = layer.querySelector('.hue-input');
    const circle = input.nextSibling;
    input.min = '-120';
    input.max = '120';
    onIntersection([{ target: tray, isIntersecting: false }], observer);
    clock.tick(800);
    expect(circle.classList.contains('animate')).to.be.false;
    expect(observer.unobserve.called).to.be.false;

    onIntersection([{ target: tray, isIntersecting: true }], observer);
    expect(circle.classList.contains('showOuterBorder')).to.be.true;
    expect(observer.unobserve.calledOnceWithExactly(tray)).to.be.true;
    clock.tick(799);
    expect(circle.classList.contains('animate')).to.be.false;
    clock.tick(1);
    expect(circle.classList.contains('animate')).to.be.true;
    circle.dispatchEvent(new Event('transitionend'));
    clock.tick(5000);

    expect(input.value).to.equal('0');
    expect(block.querySelector('img').style.filter).to.equal('hue-rotate(0deg) saturate(100%)');
    expect(circle.classList.contains('animate')).to.be.false;
    expect(circle.classList.contains('animateout')).to.be.true;
  });

  ['mousedown', 'touchstart', 'keyup'].forEach((eventType) => {
    it(`should interrupt animation on ${eventType}`, async () => {
      const layer = await render();
      const tray = layer.querySelector('.sliderTray');
      const input = layer.querySelector('.hue-input');
      const circle = input.nextSibling;
      onIntersection([{ target: tray, isIntersecting: true }], observer);
      clock.tick(800);
      circle.dispatchEvent(new Event('transitionend'));
      clock.tick(520);
      tray.dispatchEvent(new Event(eventType));
      const { filter } = block.querySelector('img').style;
      clock.tick(1000);

      expect(circle.classList.contains('showOuterBorder')).to.be.false;
      expect(circle.classList.contains('animate')).to.be.false;
      expect(circle.classList.contains('animateout')).to.be.false;
      expect(block.querySelector('img').style.filter).to.equal(filter);
    });
  });
});
