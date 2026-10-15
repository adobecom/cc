import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';

function delay(ms) {
  return new Promise((res) => { setTimeout(() => { res(); }, ms); });
}

document.body.innerHTML = await readFile({ path: './mocks/body.html' });
document.head.innerHTML = await readFile({ path: './mocks/head.html' });
const utils = await import(new URL('../../creativecloud/scripts/utils.js', import.meta.url).pathname);

describe('Scripts', () => {
  before(async () => {
    utils.scriptInit();
    delay(200);
  });

  it('First image should eager load', () => {
    expect(document.querySelector('.interactive-marquee img').loading).to.equal('eager');
  });

  it('Replaced dot media', () => {
    expect(document.querySelector('.interactive-marquee img[src*="./media_"]')).to.be.null;
  });

  it('Check domain switch regexp', () => {
    const regex = /www\.adobe\.com(?!\/*\S*\/(mini-plans|plans-fragments\/modals)\/\S*)/;
    // should not switch domain
    expect(regex.test('https://www.adobe.com/mini-plans/photoshop.html?mid=ft&web=1')).to.false;
    expect(regex.test('https://www.adobe.com/de/mini-plans/photoshop.html?mid=ft&web=1')).to.false;
    expect(regex.test('https://www.adobe.com/plans-fragments/modals/business/modals-content-rich/all-apps/master.modal.html')).to.false;
    expect(regex.test('https://www.adobe.com/fr/plans-fragments/modals/business/modals-content-rich/all-apps/master.modal.html')).to.false;
    // should switch domain
    expect(regex.test('https://www.adobe.com/fr/plans-fragments/business/modals-content-rich/all-apps/master.modal.html')).to.true;
    expect(regex.test('https://www.adobe.com/de/mega-plans/photoshop.html?mid=ft&web=1')).to.true;
    expect(regex.test('https://www.adobe.com/creativecloud/plans.html')).to.true;
    expect(regex.test('https://www.adobe.com/products/catalog.html')).to.true;
    expect(regex.test('https://www.adobe.com/creativecloud/whats-included/plans/cct-all-apps-whats-included.html')).to.true;
    expect(regex.test('https://www.adobe.com/de/creativecloud/whats-included/plans/cct-all-apps-whats-included.html')).to.true;
  });
});

describe('Utility helpers', () => {
  let sandbox;
  let originalUrl;
  let originalLibs;
  let originalIMS;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    originalUrl = window.location.href;
    originalLibs = utils.getLibs();
    originalIMS = window.adobeIMS;
  });

  afterEach(() => {
    sandbox.restore();
    window.history.replaceState(null, '', originalUrl);
    utils.setLibs(originalLibs, true);
    window.adobeIMS = originalIMS;
  });

  it('uses forced library paths without interpreting the branch parameter', () => {
    window.history.replaceState(null, '', '?milolibs=invalid!');
    expect(utils.setLibs('/custom/libs', true)).to.equal('/custom/libs');
    expect(utils.getLibs()).to.equal('/custom/libs');
  });

  [
    ['main', 'https://main--milo--adobecom.aem.live/libs'],
    ['feature-branch', 'https://feature-branch--milo--adobecom.aem.live/libs'],
    ['feature--milo--another-owner', 'https://feature--milo--another-owner.aem.live/libs'],
    ['local', 'http://localhost:6456/libs'],
  ].forEach(([branch, expected]) => {
    it(`selects the library URL for the ${branch} branch`, () => {
      window.history.replaceState(null, '', `?milolibs=${branch}`);
      expect(utils.setLibs('/libs')).to.equal(expected);
      expect(utils.getLibs()).to.equal(expected);
    });
  });

  it('defaults to the main library branch when no branch is specified', () => {
    window.history.replaceState(null, '', window.location.pathname);
    expect(utils.setLibs('/libs')).to.equal('https://main--milo--adobecom.aem.live/libs');
  });

  it('rejects invalid library branch names without changing the selected library', () => {
    window.history.replaceState(null, '', '?milolibs=invalid!');
    expect(() => utils.setLibs('/libs')).to.throw('Invalid branch name.');
    expect(utils.getLibs()).to.equal(originalLibs);
  });

  [
    [599, 'mobile'],
    [600, 'tablet'],
    [899, 'tablet'],
    [900, 'desktop'],
  ].forEach(([width, expected]) => {
    it(`classifies the default screen boundary at ${width}px as ${expected}`, () => {
      sandbox.stub(window, 'matchMedia').callsFake((query) => {
        const minimum = query.match(/min-width: (\d+)px/);
        const maximum = query.match(/max-width: (\d+)px/);
        return {
          matches: (!minimum || width >= Number(minimum[1]))
            && (!maximum || width <= Number(maximum[1])),
        };
      });
      expect(utils.getScreenSizeCategory()).to.equal(expected);
    });
  });

  it('uses overridden screen breakpoints', () => {
    const matchMedia = sandbox.stub(window, 'matchMedia').returns({ matches: false });
    matchMedia.withArgs('(min-width: 701px) and (max-width: 1000px)').returns({ matches: true });
    expect(utils.getScreenSizeCategory({ mobile: 700, tablet: 1000 })).to.equal('tablet');
    expect(matchMedia.calledWith('(max-width: 700px)')).to.be.true;
    expect(matchMedia.calledWith('(min-width: 1001px)')).to.be.true;
  });

  [true, false].forEach((matches) => {
    it(`reports reduced motion preference as ${matches}`, () => {
      const matchMedia = sandbox.stub(window, 'matchMedia').returns({ matches });
      expect(utils.prefersReducedMotion()).to.equal(matches);
      expect(matchMedia.calledOnceWithExactly('(prefers-reduced-motion: reduce)')).to.be.true;
    });
  });

  it('resolves immediately when the IMS sign-in API is initialized', async () => {
    const clock = sandbox.useFakeTimers();
    window.adobeIMS = { isSignedInUser: () => false };
    await utils.isSignedInInitialized();
    expect(clock.countTimers()).to.equal(0);
  });

  it('polls at the default interval until the IMS sign-in API is initialized', async () => {
    const clock = sandbox.useFakeTimers();
    window.adobeIMS = undefined;
    const resolved = sandbox.spy();
    const initialized = utils.isSignedInInitialized().then(resolved);
    await clock.tickAsync(199);
    expect(resolved.called).to.be.false;
    window.adobeIMS = { isSignedInUser: () => true };
    await clock.tickAsync(1);
    await initialized;
    expect(resolved.calledOnce).to.be.true;
    expect(clock.countTimers()).to.equal(0);
  });

  it('keeps polling at a custom interval while the IMS sign-in API is missing', async () => {
    const clock = sandbox.useFakeTimers();
    window.adobeIMS = {};
    const resolved = sandbox.spy();
    const initialized = utils.isSignedInInitialized(50).then(resolved);
    await clock.tickAsync(100);
    expect(resolved.called).to.be.false;
    expect(clock.countTimers()).to.equal(1);
    window.adobeIMS.isSignedInUser = () => false;
    await clock.tickAsync(50);
    await initialized;
    expect(resolved.calledOnce).to.be.true;
    expect(clock.countTimers()).to.equal(0);
  });
});

describe('Catalog refresh guards', () => {
  const storageKey = 'cc-catalog-post-adobeid-reload';
  let sandbox;
  let originalUrl;
  let originalFlag;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    originalUrl = window.location.href;
    originalFlag = sessionStorage.getItem(storageKey);
    sessionStorage.removeItem(storageKey);
    window.history.replaceState(null, '', '/products/catalog');
  });

  afterEach(() => {
    sandbox.restore();
    window.history.replaceState(null, '', originalUrl);
    if (originalFlag === null) sessionStorage.removeItem(storageKey);
    else sessionStorage.setItem(storageKey, originalFlag);
  });

  it('does not consume the reload flag on non-catalog pages', () => {
    window.history.replaceState(null, '', '/creativecloud');
    sessionStorage.setItem(storageKey, 'true');
    utils.maybeRefreshCatalogFromAdobeId();
    expect(sessionStorage.getItem(storageKey)).to.equal('true');
  });

  it('consumes the reload flag to prevent a second catalog reload', () => {
    sessionStorage.setItem(storageKey, 'true');
    sandbox.stub(document, 'referrer').get(() => 'https://adobeid-na1.services.adobe.com/');
    utils.maybeRefreshCatalogFromAdobeId();
    expect(sessionStorage.getItem(storageKey)).to.be.null;
  });

  ['', 'not a URL', 'https://example.com/', 'https://services.adobe.com.example.com/']
    .forEach((referrer) => {
      it(`does not refresh for an unauthenticated referrer: ${referrer || 'empty'}`, () => {
        sandbox.stub(document, 'referrer').get(() => referrer);
        utils.maybeRefreshCatalogFromAdobeId();
        expect(sessionStorage.getItem(storageKey)).to.be.null;
      });
    });
});

describe('Utility image decoration', () => {
  let sandbox;
  let originalBody;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    originalBody = document.body.innerHTML;
  });

  afterEach(() => {
    sandbox.restore();
    document.body.innerHTML = originalBody;
  });

  function setMarquee(className = 'marquee') {
    document.body.innerHTML = `<main><div><div class="${className}">
      <a class="fragment" href="/fragment">Fragment</a>
      <div>
        <div><img id="mobile" loading="lazy"></div>
        <div><img id="tablet" loading="lazy"></div>
        <div><img id="desktop" loading="lazy"></div>
      </div>
      <div><div><img id="foreground" loading="lazy"></div></div>
    </div></div></main>`;
  }

  function expectEager(id) {
    const image = document.getElementById(id);
    expect(image.getAttribute('loading')).to.equal('eager');
    expect(image.getAttribute('fetchpriority')).to.equal('high');
  }

  [
    [600, 'mobile'],
    [601, 'tablet'],
    [1199, 'tablet'],
    [1200, 'desktop'],
  ].forEach(([width, selected]) => {
    it(`prioritizes the ${selected} marquee background at ${width}px`, () => {
      sandbox.stub(window, 'innerWidth').value(width);
      setMarquee();
      utils.decorateArea();
      expectEager(selected);
      expectEager('foreground');
      ['mobile', 'tablet', 'desktop'].filter((id) => id !== selected).forEach((id) => {
        expect(document.getElementById(id).getAttribute('loading')).to.equal('lazy');
        expect(document.getElementById(id).hasAttribute('fetchpriority')).to.be.false;
      });
    });
  });

  it('prioritizes a single shared marquee background', () => {
    setMarquee();
    document.getElementById('tablet').parentElement.remove();
    document.getElementById('desktop').parentElement.remove();
    utils.decorateArea();
    expectEager('mobile');
    expectEager('foreground');
  });

  [
    [600, 'media-hidden-mobile'],
    [900, 'media-hidden-tablet'],
  ].forEach(([width, hiddenClass]) => {
    it(`does not prioritize a hero foreground with ${hiddenClass}`, () => {
      sandbox.stub(window, 'innerWidth').value(width);
      setMarquee(`hero-marquee ${hiddenClass}`);
      utils.decorateArea();
      expect(document.getElementById('foreground').getAttribute('loading')).to.equal('lazy');
    });
  });

  it('prioritizes a visible hero foreground after configuration rows', () => {
    sandbox.stub(window, 'innerWidth').value(1200);
    setMarquee('hero-marquee');
    const block = document.querySelector('.hero-marquee');
    block.insertAdjacentHTML('afterbegin', '<div><div>configuration</div></div>');
    block.querySelector(':scope > div:nth-of-type(2) > div').append('con-block-row-background');
    utils.decorateArea();
    expectEager('foreground');
  });

  [
    [600, 1],
    [900, 2],
    [1200, 3],
  ].forEach(([width, selected]) => {
    it(`prioritizes upload grid ${selected} at ${width}px`, () => {
      sandbox.stub(window, 'innerWidth').value(width);
      setMarquee('hero-marquee');
      document.querySelector('main > div').insertAdjacentHTML('beforeend', `<div class="upload"><div>
        <div><picture><img id="upload-1" loading="lazy"></picture></div>
        <div><picture><img id="upload-2" loading="lazy"></picture></div>
        <div><picture><img id="upload-3" loading="lazy"></picture></div>
      </div></div>`);
      utils.decorateArea();
      expectEager(`upload-${selected}`);
      [1, 2, 3].filter((index) => index !== selected).forEach((index) => {
        expect(document.getElementById(`upload-${index}`).getAttribute('loading')).to.equal('lazy');
      });
    });
  });

  it('prioritizes the first image in an ordinary block only once', () => {
    document.body.innerHTML = `<main><div><div><img id="first" loading="lazy">
      <a class="fragment" href="/fragment">Fragment</a></div></div></main>`;
    utils.decorateArea();
    expectEager('first');
    document.querySelector('a.fragment').remove();
    document.querySelector('main').insertAdjacentHTML('afterbegin', '<img id="later" loading="lazy">');
    utils.decorateArea();
    expect(document.getElementById('later').getAttribute('loading')).to.equal('lazy');
  });

  it('does not fail when there is no image to prioritize', () => {
    document.body.innerHTML = `<main><div><div>Text only
      <a class="fragment" href="/fragment">Fragment</a></div></div></main>`;
    expect(() => utils.decorateArea()).not.to.throw();
    expect(document.querySelector('img[loading="eager"]')).to.be.null;
  });

  it('prioritizes the first fragment image when the page has no eager image', () => {
    document.body.innerHTML = '<main><div><div><a class="fragment" href="/fragment">Fragment</a></div></div></main>';
    const fragment = document.implementation.createHTMLDocument();
    fragment.body.innerHTML = '<div><div><img id="fragment-image" loading="lazy"></div></div>';
    utils.decorateArea(fragment, { fragmentLink: document.querySelector('a.fragment') });
    const image = fragment.getElementById('fragment-image');
    expect(image.getAttribute('loading')).to.equal('eager');
    expect(image.getAttribute('fetchpriority')).to.equal('high');
  });

  it('does not prioritize fragment images when the page already has an eager image', () => {
    document.body.innerHTML = `<main><div><div><a class="fragment" href="/fragment">Fragment</a>
      <img loading="eager"></div></div></main>`;
    const fragment = document.implementation.createHTMLDocument();
    fragment.body.innerHTML = '<div><div><img loading="lazy"></div></div>';
    utils.decorateArea(fragment, { fragmentLink: document.querySelector('a.fragment') });
    expect(fragment.querySelector('img').getAttribute('loading')).to.equal('lazy');
  });
});
