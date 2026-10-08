import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import init from '../../../creativecloud/plans/features/crm-modal-lana/crm-modal-lana.js';

describe('CRM modal LANA timing', () => {
  let clock;
  let log;
  let originalLana;
  let cta;

  function createModal({ aup = true, ready = false } = {}) {
    const modal = document.createElement('div');
    modal.className = aup ? 'dialog-modal aup-modal' : 'dialog-modal three-in-one';
    if (aup) modal.id = 'aup-workflow-dialog';
    if (ready) modal.classList.add('hide-close-button');
    const content = document.createElement('div');
    content.className = 'aup-workflow-content';
    const iframe = document.createElement('iframe');
    // Cross-origin iframe documents cannot be inspected, even after load.
    Object.defineProperty(iframe, 'contentDocument', { get: () => null });
    content.append(iframe);
    modal.append(content);
    document.body.append(modal);
    return { modal, iframe };
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
    cta.setAttribute('aria-label', 'Select - Audition - Individuals');
    document.body.append(cta);
  });

  afterEach(() => {
    document.body.innerHTML = '';
    window.lana = originalLana;
    clock.restore();
  });

  it('recognizes a rendered AUP div without an open attribute or a new iframe load', async () => {
    const { iframe } = createModal({ ready: true });
    Object.defineProperty(iframe, 'contentWindow', {
      get: () => { throw new Error('AUP iframe document must not be inspected'); },
    });
    cta.click();
    await clock.tickAsync(0);

    expect(log.calledOnce).to.equal(true);
    expect(log.firstCall.args[0]).to.equal(
      `AUP modal: Took 0ms to load page=${window.location.href} cta=Select - Audition - Individuals time=0`,
    );
    expect(log.firstCall.args[1]).to.deep.equal({
      clientId: 'cc', sampleRate: 1, tags: 'aup',
    });
  });

  it('waits for the SDK rendered marker rather than treating iframe load as ready', async () => {
    const { modal, iframe } = createModal();
    modal.classList.add('loading');
    cta.click();
    iframe.dispatchEvent(new Event('load'));
    await clock.tickAsync(100);
    expect(log.called).to.equal(false);

    modal.classList.remove('loading');
    await clock.tickAsync(100);
    expect(log.called).to.equal(false);

    modal.classList.add('hide-close-button');
    await clock.tickAsync(50);
    expect(log.calledOnce).to.equal(true);
    expect(log.firstCall.args[0]).to.contain('AUP modal: Took 250ms to load');
  });

  it('includes the time spent waiting for the AUP modal to appear', async () => {
    cta.click();
    await clock.tickAsync(200);
    createModal({ ready: true });
    await clock.tickAsync(100);
    expect(log.calledOnce).to.equal(true);
    expect(log.firstCall.args[0]).to.contain('AUP modal: Took 300ms to load');
  });

  it('keeps waiting while the AUP iframe has a loading indicator', async () => {
    const { iframe } = createModal({ ready: true });
    iframe.classList.add('loading');
    cta.click();
    await clock.tickAsync(100);
    expect(log.called).to.equal(false);
    iframe.classList.remove('loading');
    await clock.tickAsync(50);
    expect(log.calledOnce).to.equal(true);
  });

  it('does not mark a successful load at exactly 3000ms as critical', async () => {
    const { modal } = createModal();
    cta.click();
    await clock.tickAsync(2950);
    modal.classList.add('hide-close-button');
    await clock.tickAsync(50);
    expect(log.firstCall.args[0]).to.contain('AUP modal: Took 3000ms to load');
    expect(log.firstCall.args[1]).not.to.have.property('severity');
  });

  it('marks successful AUP loads over 3000ms as critical without an error type', async () => {
    const { modal } = createModal();
    cta.click();
    await clock.tickAsync(3000);
    modal.classList.add('hide-close-button');
    await clock.tickAsync(50);
    expect(log.firstCall.args[0]).to.contain('AUP modal: Took 3050ms to load');
    expect(log.firstCall.args[1]).to.deep.equal({
      clientId: 'cc', sampleRate: 1, tags: 'aup', severity: 'c',
    });
  });

  it('reports an AUP error while waiting for the rendered marker', async () => {
    const { modal } = createModal();
    cta.click();
    await clock.tickAsync(100);
    const error = document.createElement('div');
    error.className = 'error-wrapper';
    modal.append(error);
    await clock.tickAsync(50);
    expect(log.calledOnce).to.equal(true);
    expect(log.firstCall.args[0]).to.contain('AUP modal: Error after 150ms');
    expect(log.firstCall.args[1]).to.deep.equal({
      clientId: 'cc', sampleRate: 1, tags: 'aup', severity: 'c', errorType: 'e',
    });
  });

  it('reports an AUP error even when no iframe has appeared', async () => {
    const { modal, iframe } = createModal();
    iframe.remove();
    modal.innerHTML = '<div class="error-wrapper"></div>';
    cta.click();
    await clock.tickAsync(0);
    expect(log.calledOnce).to.equal(true);
    expect(log.firstCall.args[0]).to.contain('AUP modal: Error after 0ms');
    expect(log.firstCall.args[1].tags).to.equal('aup');
  });

  it('reports an AUP timeout if the rendered marker never arrives', async () => {
    createModal();
    cta.click();
    await clock.tickAsync(60000);
    expect(log.calledOnce).to.equal(true);
    expect(log.firstCall.args[0]).to.contain('AUP modal: took longer than a minute');
    expect(log.firstCall.args[0]).to.contain('time=60000');
    expect(log.firstCall.args[1]).to.deep.equal({
      clientId: 'cc', sampleRate: 1, tags: 'aup', severity: 'c', errorType: 'e',
    });
  });

  it('does not report stale measurements after another CRM click', async () => {
    const { modal } = createModal();
    cta.click();
    await clock.tickAsync(100);
    cta.setAttribute('aria-label', 'Second CTA');
    cta.click();
    modal.classList.add('hide-close-button');
    await clock.tickAsync(50);
    expect(log.calledOnce).to.equal(true);
    expect(log.firstCall.args[0]).to.contain('cta=Second CTA time=50');
  });

  it('preserves three-in-one iframe load, rendered-state checks, and log options', async () => {
    const { iframe } = createModal({ aup: false });
    iframe.classList.add('loading');
    cta.click();
    await clock.tickAsync(100);
    iframe.dispatchEvent(new Event('load'));
    await clock.tickAsync(100);
    expect(log.called).to.equal(false);
    iframe.classList.remove('loading');
    await clock.tickAsync(50);
    expect(log.calledOnce).to.equal(true);
    expect(log.firstCall.args[0]).to.contain('3 in 1 modal: Took 250ms to load');
    expect(log.firstCall.args[1]).to.deep.equal({
      clientId: 'cc', sampleRate: 1, tags: '3in1',
    });
  });

  it('ignores clicks that are not CRM CTAs', async () => {
    createModal({ ready: true });
    delete cta.dataset.modal;
    cta.click();
    await clock.tickAsync(60000);
    expect(log.called).to.equal(false);
  });
});
