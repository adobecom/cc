import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import init from '../../../creativecloud/plans/features/crm-modal-lana/crm-modal-lana.js';

describe('CRM modal LANA timing', () => {
  let clock;
  let log;
  let originalLana;
  let cta;

  function markReady({ modal, iframe }, aup) {
    if (aup) modal.classList.add('hide-close-button');
    else iframe.dataset.pageloaded = 'true';
  }

  function createModal({ aup = true, ready = false, modalId = cta.dataset.modalId } = {}) {
    const modal = document.createElement('div');
    modal.className = aup ? 'dialog-modal aup-modal' : 'dialog-modal three-in-one';
    modal.id = aup ? 'aup-workflow-dialog' : modalId;
    modal.dataset.modalHash = `#${modalId}`;
    const content = document.createElement('div');
    content.className = 'aup-workflow-content';
    const iframe = document.createElement('iframe');
    Object.defineProperty(iframe, 'contentDocument', { get: () => { throw new Error('Iframe documents must not be inspected'); } });
    content.append(iframe);
    modal.append(content);
    const elements = { modal, iframe };
    if (ready) markReady(elements, aup);
    document.body.append(modal);
    return elements;
  }

  before(() => {
    init();
    init();
  });

  beforeEach(() => {
    clock = sinon.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'performance'] });
    originalLana = window.lana;
    log = sinon.spy();
    window.lana = { log };
    cta = document.createElement('a');
    cta.dataset.modal = 'crm';
    cta.dataset.modalId = 'miniplans-buy-audition';
    cta.setAttribute('aria-label', 'Select - Audition - Individuals');
    document.body.append(cta);
  });

  afterEach(async () => {
    document.body.innerHTML = '';
    await clock.tickAsync(0);
    clock.tick(60000);
    await clock.tickAsync(0);
    window.lana = originalLana;
    clock.restore();
  });

  [true, false].forEach((aup) => {
    const type = aup ? 'AUP' : '3 in 1';
    const tags = aup ? 'aup' : '3in1';

    it(`measures ${type} click-to-app-ready without polling or iframe load`, async () => {
      cta.click();
      const elements = createModal({ aup });
      await clock.tickAsync(123);
      expect(log.called).to.equal(false);
      markReady(elements, aup);
      await clock.tickAsync(0);

      expect(log.calledOnce).to.equal(true);
      expect(log.firstCall.args[0]).to.equal(
        `${type} modal: Took 123ms to load page=${window.location.href} cta=Select - Audition - Individuals time=123 outcome=loaded`,
      );
      expect(log.firstCall.args[1]).to.deep.equal({ clientId: 'cc', sampleRate: 1, tags });
      expect(clock.countTimers()).to.equal(0);
    });

    it(`recognizes ${type} app readiness that occurred before modal discovery`, async () => {
      cta.click();
      clock.tick(237);
      createModal({ aup, ready: true });
      await clock.tickAsync(0);
      expect(log.calledOnce).to.equal(true);
      expect(log.firstCall.args[0]).to.contain(`${type} modal: Took 237ms to load`);
    });

    it(`does not treat ${type} iframe load alone as application readiness`, async () => {
      cta.click();
      const elements = createModal({ aup });
      elements.iframe.dispatchEvent(new Event('load'));
      await clock.tickAsync(100);
      expect(log.called).to.equal(false);
      markReady(elements, aup);
      await clock.tickAsync(0);
      expect(log.calledOnce).to.equal(true);
      expect(log.firstCall.args[0]).to.contain('time=100 outcome=loaded');
    });

    it(`waits for ${type} loading indicators to clear after the ready marker`, async () => {
      cta.click();
      const elements = createModal({ aup, ready: true });
      elements.modal.classList.add('loading');
      elements.iframe.classList.add('loading');
      await clock.tickAsync(100);
      expect(log.called).to.equal(false);
      elements.modal.classList.remove('loading');
      await clock.tickAsync(100);
      expect(log.called).to.equal(false);
      elements.iframe.classList.remove('loading');
      await clock.tickAsync(0);
      expect(log.calledOnce).to.equal(true);
      expect(log.firstCall.args[0]).to.contain('time=200 outcome=loaded');
    });

    [3000, 3001].forEach((elapsed) => {
      it(`applies the same slow threshold to ${type} at ${elapsed}ms`, async () => {
        cta.click();
        const elements = createModal({ aup });
        await clock.tickAsync(elapsed);
        markReady(elements, aup);
        await clock.tickAsync(0);
        expect(log.firstCall.args[0]).to.contain(`time=${elapsed} outcome=loaded`);
        const options = { clientId: 'cc', sampleRate: 1, tags };
        if (elapsed > 3000) options.severity = 'c';
        expect(log.firstCall.args[1]).to.deep.equal(options);
      });
    });

    it(`reports ${type} errors without waiting for iframe load`, async () => {
      cta.click();
      const { modal, iframe } = createModal({ aup });
      iframe.remove();
      await clock.tickAsync(137);
      modal.innerHTML = '<div class="error-wrapper"></div>';
      await clock.tickAsync(0);
      expect(log.calledOnce).to.equal(true);
      expect(log.firstCall.args[0]).to.contain(`${type} modal: Error after 137ms`);
      expect(log.firstCall.args[0]).to.contain('outcome=error');
      expect(log.firstCall.args[1]).to.deep.equal({ clientId: 'cc', sampleRate: 1, tags, severity: 'c', errorType: 'e' });
    });

    it(`reports ${type} timeout at the same 60-second deadline`, async () => {
      cta.click();
      createModal({ aup });
      await clock.tickAsync(0);
      clock.tick(60000);
      await clock.tickAsync(0);
      expect(log.calledOnce).to.equal(true);
      expect(log.firstCall.args[0]).to.contain(`${type} modal: took longer than a minute`);
      expect(log.firstCall.args[0]).to.contain('time=60000 outcome=timeout');
      expect(log.firstCall.args[1]).to.deep.equal({ clientId: 'cc', sampleRate: 1, tags, severity: 'c', errorType: 'e' });
    });

    it(`reports ${type} closure as cancellation, not a slow load or failure`, async () => {
      cta.click();
      const { modal } = createModal({ aup });
      await clock.tickAsync(4000);
      modal.remove();
      await clock.tickAsync(0);
      clock.tick(60000);
      await clock.tickAsync(0);
      expect(log.calledOnce).to.equal(true);
      expect(log.firstCall.args[0]).to.contain(`${type} modal: Cancelled reason=closed`);
      expect(log.firstCall.args[0]).to.contain('time=4000 outcome=cancelled');
      expect(log.firstCall.args[1]).to.deep.equal({ clientId: 'cc', sampleRate: 1, tags });
      expect(clock.countTimers()).to.equal(0);
    });

    it(`excludes clicks on an already-open ${type} modal from load timings`, async () => {
      createModal({ aup, ready: true });
      cta.click();
      await clock.tickAsync(0);
      expect(log.calledOnce).to.equal(true);
      expect(log.firstCall.args[0]).to.contain('Cancelled reason=already-open');
      expect(log.firstCall.args[0]).to.contain('outcome=cancelled');
      expect(log.firstCall.args[1].tags).to.equal(tags);
      expect(clock.countTimers()).to.equal(0);
    });

    it(`ignores unrelated modals and binds ${type} to the clicked CTA`, async () => {
      const unrelated = createModal({ aup: false, ready: true, modalId: 'other-product' });
      cta.click();
      await clock.tickAsync(77);
      expect(log.called).to.equal(false);
      const matching = createModal({ aup });
      await clock.tickAsync(100);
      unrelated.modal.innerHTML = '<div class="error-wrapper"></div>';
      await clock.tickAsync(0);
      expect(log.called).to.equal(false);
      markReady(matching, aup);
      await clock.tickAsync(0);
      expect(log.calledOnce).to.equal(true);
      expect(log.firstCall.args[0]).to.contain(`${type} modal: Took 177ms to load`);
    });
  });

  it('observes three-in-one readiness inside a milo-iframe shadow root', async () => {
    cta.click();
    const { modal, iframe } = createModal({ aup: false });
    const host = document.createElement('milo-iframe');
    const shadow = host.attachShadow({ mode: 'open' });
    shadow.append(iframe);
    modal.append(host);
    await clock.tickAsync(151);
    iframe.dataset.pageloaded = 'true';
    await clock.tickAsync(0);
    expect(log.calledOnce).to.equal(true);
    expect(log.firstCall.args[0]).to.contain('3 in 1 modal: Took 151ms to load');
  });

  it('observes iframe readiness when milo-iframe upgrades after modal discovery', async () => {
    cta.click();
    const { modal, iframe } = createModal({ aup: false });
    iframe.remove();
    const host = document.createElement('milo-iframe');
    modal.append(host);
    await clock.tickAsync(100);
    customElements.define('milo-iframe', class extends HTMLElement {
      constructor() {
        super();
        this.attachShadow({ mode: 'open' }).append(iframe);
      }
    });
    await clock.tickAsync(100);
    iframe.dataset.pageloaded = 'true';
    await clock.tickAsync(0);
    expect(log.calledOnce).to.equal(true);
    expect(log.firstCall.args[0]).to.contain('3 in 1 modal: Took 200ms to load');
  });

  it('keeps the original start time when another click occurs while loading', async () => {
    cta.click();
    const elements = createModal();
    await clock.tickAsync(100);
    cta.click();
    expect(log.firstCall.args[0]).to.contain('Cancelled reason=already-open');
    await clock.tickAsync(100);
    markReady(elements, true);
    await clock.tickAsync(0);
    expect(log.callCount).to.equal(2);
    expect(log.secondCall.args[0]).to.contain('AUP modal: Took 200ms to load');
  });

  it('keeps the original start time for a duplicate click before modal creation', async () => {
    cta.click();
    await clock.tickAsync(100);
    cta.click();
    expect(log.firstCall.args[0]).to.contain('Cancelled reason=already-pending');
    await clock.tickAsync(100);
    createModal({ ready: true });
    await clock.tickAsync(0);
    expect(log.callCount).to.equal(2);
    expect(log.secondCall.args[0]).to.contain('AUP modal: Took 200ms to load');
  });

  it('reports superseded attempts and does not bind the next CTA to the old workflow', async () => {
    cta.click();
    await clock.tickAsync(75);
    cta.dataset.modalId = 'second-product';
    cta.setAttribute('aria-label', 'Second CTA');
    cta.click();
    expect(log.firstCall.args[0]).to.contain('CRM modal: Cancelled reason=superseded');
    expect(log.firstCall.args[0]).to.contain('time=75 outcome=cancelled');
    expect(log.firstCall.args[1].tags).to.equal('crm-modal');
    createModal({ ready: true, modalId: 'miniplans-buy-audition' });
    await clock.tickAsync(200);
    expect(log.callCount).to.equal(1);
    createModal({ aup: false, ready: true });
    await clock.tickAsync(0);
    expect(log.callCount).to.equal(2);
    expect(log.secondCall.args[0]).to.contain('3 in 1 modal: Took 200ms to load');
    expect(log.secondCall.args[0]).to.contain('cta=Second CTA');
  });

  it('does not misclassify attempts where no workflow ever appeared', async () => {
    cta.click();
    clock.tick(60000);
    await clock.tickAsync(0);
    expect(log.calledOnce).to.equal(true);
    expect(log.firstCall.args[0]).to.contain('CRM modal: took longer than a minute');
    expect(log.firstCall.args[1].tags).to.equal('crm-modal');
  });

  it('records missing modal identifiers instead of timing an unrelated modal', async () => {
    delete cta.dataset.modalId;
    cta.click();
    createModal({ ready: true, modalId: 'unrelated' });
    await clock.tickAsync(0);
    expect(log.calledOnce).to.equal(true);
    expect(log.firstCall.args[0]).to.contain('Cancelled reason=missing-modal-id');
    expect(clock.countTimers()).to.equal(0);
  });

  it('supports CTA modal hashes and clicks originating inside shadow DOM', async () => {
    delete cta.dataset.modalId;
    cta.dataset.modalHash = '#shadow-product';
    const host = document.createElement('div');
    const shadow = host.attachShadow({ mode: 'open' });
    const nested = document.createElement('span');
    nested.setAttribute('aria-label', 'Nested CTA');
    cta.append(nested);
    shadow.append(cta);
    document.body.append(host);
    nested.click();
    createModal({ ready: true, modalId: 'shadow-product' });
    await clock.tickAsync(0);
    expect(log.calledOnce).to.equal(true);
    expect(log.firstCall.args[0]).to.contain('cta=Nested CTA time=0 outcome=loaded');
  });

  it('handles shared modal close events without recording a timeout later', async () => {
    cta.click();
    const { modal } = createModal();
    await clock.tickAsync(137);
    window.dispatchEvent(new CustomEvent('milo:modal:closed', { detail: { id: modal.id } }));
    clock.tick(60000);
    await clock.tickAsync(0);
    expect(log.calledOnce).to.equal(true);
    expect(log.firstCall.args[0]).to.contain('time=137 outcome=cancelled');
  });

  it('recognizes closeModal before the discovery observer runs', async () => {
    cta.click();
    clock.tick(137);
    const { modal } = createModal();
    modal.dispatchEvent(new Event('closeModal'));
    modal.remove();
    await clock.tickAsync(0);
    clock.tick(60000);
    expect(log.calledOnce).to.equal(true);
    expect(log.firstCall.args[0]).to.contain('AUP modal: Cancelled reason=closed');
    expect(log.firstCall.args[0]).to.contain('time=137 outcome=cancelled');
  });

  it('ignores close events from another modal', async () => {
    cta.click();
    const elements = createModal();
    await clock.tickAsync(100);
    window.dispatchEvent(new CustomEvent('milo:modal:closed', { detail: { id: 'other-modal' } }));
    expect(log.called).to.equal(false);
    markReady(elements, true);
    await clock.tickAsync(0);
    expect(log.calledOnce).to.equal(true);
    expect(log.firstCall.args[0]).to.contain('time=100 outcome=loaded');
  });

  it('prioritizes a modal error over a ready marker in the same update', async () => {
    cta.click();
    const elements = createModal({ aup: false });
    await clock.tickAsync(100);
    markReady(elements, false);
    const error = document.createElement('div');
    error.className = 'error-wrapper';
    elements.modal.append(error);
    await clock.tickAsync(0);
    expect(log.calledOnce).to.equal(true);
    expect(log.firstCall.args[0]).to.contain('time=100 outcome=error');
    expect(log.firstCall.args[1].errorType).to.equal('e');
  });

  it('ignores clicks that are not CRM CTAs', async () => {
    delete cta.dataset.modal;
    cta.click();
    createModal({ ready: true });
    await clock.tickAsync(0);
    clock.tick(60000);
    expect(log.called).to.equal(false);
  });
});
