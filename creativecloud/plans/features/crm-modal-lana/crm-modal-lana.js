/**
 * CRM modal RUM: click → host application-ready marker, not iframe load or paint.
 * Observe three-in-one's `data-pageloaded` and AUP's `hide-close-button`, which
 * their hosts set on AppLoaded/app_loaded. Bind to the CTA's modal ID/hash.
 * Report loaded, error, timeout, and cancelled outcomes separately; attempts
 * without an identified modal use `crm-modal` rather than guessing a workflow.
 * @see https://github.com/adobecom/milo/blob/main/libs/utils/lana.md
 */

const CRM = '[data-modal="crm"]';
const AUP = '#aup-workflow-dialog.aup-modal, dialog#aup-workflow-dialog[open]';
const MODAL = [
  '.dialog-modal.three-in-one',
  '[role="dialog"].three-in-one',
  '[aria-modal="true"].three-in-one',
  '.three-in-one .dialog-modal',
  AUP,
].join(',');
const MAX_MS = 60000;
/** Elapsed modal load over this logs with `severity: 'c'` even when not an error. */
const SLOW_MODAL_MS = 3000;

/** @see https://github.com/adobecom/milo/blob/main/libs/utils/lana.md */
const LANA = {
  clientId: 'cc',
  sampleRate: 1,
  tags: '3in1',
};

let active = null;
let inited = false;

/**
 * Innermost ancestor from the click target through the CRM CTA root with a non-empty aria-label.
 * @param {EventTarget|null} clickTarget
 * @param {Element} crmRoot `[data-modal="crm"]`
 */
function getCrmCtaAriaLabel(clickTarget, crmRoot) {
  if (!(clickTarget instanceof Element) || !crmRoot) return '';
  let n = clickTarget;
  while (n) {
    const a = n.getAttribute?.('aria-label')?.trim();
    if (a) return a;
    if (n === crmRoot) break;
    n = n.parentElement;
  }
  return '';
}

/**
 * Shared suffix for LANA reporting: page, CTA label, elapsed ms (`time`).
 * @param {{ page: string, cta: string }} ctx
 * @param {number} elapsedMs
 */
function formatCrmModalMeta(ctx, elapsedMs) {
  const cta = ctx.cta || '(none)';
  const ms = Math.round(elapsedMs);
  return ` page=${ctx.page} cta=${cta} time=${ms}`;
}

/**
 * @param {string} message
 * @param {boolean} isError
 * @param {number} [elapsedMs] when over `SLOW_MODAL_MS`, adds `severity: 'c'` on success too
 * @param {string} modalType
 */
function lanaLog(message, isError, elapsedMs, modalType) {
  const slow = typeof elapsedMs === 'number' && elapsedMs > SLOW_MODAL_MS;
  const severityC = Boolean(isError) || slow;
  const tags = { AUP: 'aup', '3 in 1': '3in1', CRM: 'crm-modal' };
  const options = { ...LANA, tags: tags[modalType] };
  const base = severityC ? { ...options, severity: 'c' } : options;
  window.lana?.log(
    message,
    isError ? { ...base, errorType: 'e' } : base,
  );
}

/** Iframe that carries modal content; may live under `milo-iframe` shadow. */
function getModalIframe(modal) {
  const host = modal.querySelector('milo-iframe');
  if (host?.shadowRoot) {
    return host.shadowRoot.querySelector('iframe') || null;
  }
  return modal.querySelector('iframe') || null;
}

function matchesCta(modal, modalId) {
  return modal.id === modalId || modal.dataset.modalHash === `#${modalId}`;
}

function getModal(modalId) {
  return [...document.querySelectorAll(MODAL)]
    .find((candidate) => matchesCta(candidate, modalId));
}

function setModalType(ctx, modal) {
  ctx.type = modal.matches(AUP) ? 'AUP' : '3 in 1';
}

function report(ctx, start, outcome, reason) {
  const elapsed = Math.round(performance.now() - start);
  const messages = {
    loaded: `Took ${elapsed}ms to load`,
    error: `Error after ${elapsed}ms`,
    timeout: 'took longer than a minute',
    cancelled: `Cancelled reason=${reason}`,
  };
  lanaLog(
    `${ctx.type} modal: ${messages[outcome]}${formatCrmModalMeta(ctx, elapsed)} outcome=${outcome}`,
    outcome === 'error' || outcome === 'timeout',
    outcome === 'cancelled' ? undefined : elapsed,
    ctx.type,
  );
}

function measureFromClick(ctx, start) {
  let modal;
  let finished = false;
  let timeout;
  let pendingHost;
  let observer;
  let onClosed;
  const roots = new Set();
  const observerOptions = {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['class', 'id', 'data-modal-hash', 'data-pageloaded', 'open'],
  };

  function finish(outcome, reason) {
    if (finished) return;
    finished = true;
    observer.disconnect();
    clearTimeout(timeout);
    window.removeEventListener('milo:modal:closed', onClosed);
    document.removeEventListener('closeModal', onClosed, true);
    active = null;
    report(ctx, start, outcome, reason);
  }

  onClosed = (event) => {
    const closingModal = modal || getModal(ctx.modalId);
    const closed = closingModal
      ? event.target === closingModal || event.detail?.id === closingModal.id
      : event.detail?.id === ctx.modalId || event.detail?.hash === `#${ctx.modalId}`;
    if (closed) {
      if (closingModal) setModalType(ctx, closingModal);
      finish('cancelled', 'closed');
    }
  };

  function check() {
    if (finished) return;
    if (performance.now() - start >= MAX_MS) {
      finish('timeout');
      return;
    }
    if (modal && !modal.isConnected) {
      finish('cancelled', 'closed');
      return;
    }
    if (!modal) {
      modal = getModal(ctx.modalId);
      if (!modal) return;
      setModalType(ctx, modal);
    }
    const host = modal.querySelector('milo-iframe');
    const shadow = host?.shadowRoot;
    if (shadow && !roots.has(shadow)) {
      roots.add(shadow);
      observer.observe(shadow, observerOptions);
    } else if (host && !shadow && host !== pendingHost && !customElements.get('milo-iframe')) {
      pendingHost = host;
      customElements.whenDefined('milo-iframe').then(check);
    }
    if (modal.querySelector('.error-wrapper') || shadow?.querySelector('.error-wrapper')) {
      finish('error');
      return;
    }
    const iframe = getModalIframe(modal);
    if (!iframe || iframe.classList.contains('loading') || modal.classList.contains('loading')) return;
    const ready = modal.matches(AUP)
      ? modal.classList.contains('hide-close-button')
      : iframe.dataset.pageloaded === 'true';
    if (ready) finish('loaded');
  }

  observer = new MutationObserver(check);
  observer.observe(document.documentElement, observerOptions);
  window.addEventListener('milo:modal:closed', onClosed);
  document.addEventListener('closeModal', onClosed, true);
  timeout = setTimeout(check, MAX_MS - (performance.now() - start));
  active = { ctx, cancel: (reason) => finish('cancelled', reason), get modal() { return modal; } };
  check();
}

function onCrmClick(e) {
  const start = performance.now();
  const el = e.composedPath().find((node) => node instanceof Element && node.matches(CRM));
  if (!el) return;
  const ctx = {
    page: window.location.href,
    cta: getCrmCtaAriaLabel(e.composedPath()[0], el),
    modalId: el.dataset.modalId || el.dataset.modalHash?.replace(/^#/, '') || '',
    type: 'CRM',
  };
  if (!ctx.modalId) {
    report(ctx, start, 'cancelled', 'missing-modal-id');
    return;
  }
  const openModal = getModal(ctx.modalId);
  if (openModal || active?.modal?.isConnected) {
    if (openModal) setModalType(ctx, openModal);
    report(ctx, start, 'cancelled', 'already-open');
    return;
  }
  if (active && active.ctx.modalId === ctx.modalId) {
    report(ctx, start, 'cancelled', 'already-pending');
    return;
  }
  active?.cancel('superseded');
  measureFromClick(ctx, start);
}

export default function initCrmModalLana() {
  if (inited) return;
  inited = true;
  document.addEventListener('click', onCrmClick, { capture: true, passive: true });
}
