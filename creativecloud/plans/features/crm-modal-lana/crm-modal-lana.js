/**
 * CRM modal RUM: click `[data-modal=crm]` → three-in-one iframe load and loading
 * indicators cleared, or AUP's `app_loaded` marker (`hide-close-button`).
 * Report click-to-ready time (≤60s), with separate `3in1` and `aup` LANA tags.
 * `.error-wrapper` anywhere in the modal = failure.
 * @see https://github.com/adobecom/milo/blob/main/libs/utils/lana.md
 */

const CRM = '[data-modal="crm"]';
const AUP = '#aup-workflow-dialog.aup-modal, dialog#aup-workflow-dialog[open]';
const MODAL = [
  '.dialog-modal.three-in-one',
  '[role="dialog"].three-in-one',
  '[aria-modal="true"].three-in-one',
  AUP,
].join(',');
const MAX_MS = 60000;
const RENDER_POLL_MS = 50;
/** Elapsed modal load over this logs with `severity: 'c'` even when not an error. */
const SLOW_MODAL_MS = 3000;

/** @see https://github.com/adobecom/milo/blob/main/libs/utils/lana.md */
const LANA = {
  clientId: 'cc',
  sampleRate: 1,
  tags: '3in1',
};

let run = 0;
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
 */
function lanaLog(message, isError, elapsedMs, modalType) {
  const slow = typeof elapsedMs === 'number' && elapsedMs > SLOW_MODAL_MS;
  const severityC = Boolean(isError) || slow;
  const options = modalType === 'AUP' ? { ...LANA, tags: 'aup' } : LANA;
  const base = severityC ? { ...options, severity: 'c' } : options;
  window.lana?.log(
    message,
    isError ? { ...base, errorType: 'e' } : base,
  );
}

function getModal() {
  return (
    document.querySelector(MODAL)
    || document
      .querySelector('.three-in-one')
      ?.querySelector('.dialog-modal, [role="dialog"], [aria-modal="true"]') || null
  );
}

function hasModalError() {
  return Boolean(getModal()?.querySelector?.('.error-wrapper'));
}

/** Iframe that carries modal content; may live under `milo-iframe` shadow. */
function getModalIframe() {
  const m = getModal();
  if (!m) return null;
  const host = m.querySelector('milo-iframe');
  if (host?.shadowRoot) {
    return host.shadowRoot.querySelector('iframe') || null;
  }
  return m.querySelector('iframe') || null;
}

function whenIframeLoad(iframe, timeLeftMs) {
  return new Promise((resolve, reject) => {
    if (iframe.contentDocument && iframe.contentDocument.readyState === 'complete') {
      resolve();
      return;
    }
    let t;
    function onL() {
      clearTimeout(t);
      resolve();
    }
    t = setTimeout(() => {
      iframe.removeEventListener('load', onL);
      reject(new Error('timeout'));
    }, timeLeftMs);
    iframe.addEventListener('load', onL, { once: true });
  });
}

/**
 * True while either the iframe or its modal (e.g. `#aup-workflow-dialog`)
 * carries `class="loading"`.
 */
function isStillLoading(iframe) {
  const modal = getModal();
  return Boolean(iframe.classList.contains('loading') || modal?.classList.contains('loading'));
}

/**
 * Wait until loading indicators clear and, for AUP, the host signals `app_loaded`
 * by adding `hide-close-button`. No iframe document access is needed for AUP.
 * @param {HTMLIFrameElement} iframe
 * @param {number} rid
 * @param {number} deadline performance.now() deadline
 */
function waitForIframeRendered(iframe, rid, deadline) {
  return new Promise((resolve, reject) => {
    function check() {
      if (rid !== run) { reject(new Error('stale')); return; }
      if (performance.now() >= deadline) { reject(new Error('timeout')); return; }
      if (hasModalError()) { reject(new Error('error-wrapper')); return; }
      const modal = getModal();
      const aupReady = !modal?.matches(AUP) || modal.classList.contains('hide-close-button');
      if (aupReady && !isStillLoading(iframe)) { resolve(); return; }
      setTimeout(check, RENDER_POLL_MS);
    }
    check();
  });
}

/**
 * @param {number} rid
 * @param {{ page: string, cta: string, type: string }} ctx
 */
function measureFromClick(rid, ctx) {
  const t0 = performance.now();
  const deadline = t0 + MAX_MS;

  const schedule = () => {
    if (rid !== run) return;
    const modal = getModal();
    if (modal) ctx.type = modal.matches(AUP) ? 'AUP' : '3 in 1';
    if (performance.now() >= deadline) {
      const elapsedMs = Math.round(performance.now() - t0);
      lanaLog(
        `${ctx.type} modal: took longer than a minute${formatCrmModalMeta(ctx, elapsedMs)}`,
        true,
        elapsedMs,
        ctx.type,
      );
      return;
    }
    if (hasModalError()) {
      const elapsedMs = Math.round(performance.now() - t0);
      lanaLog(
        `${ctx.type} modal: Error after ${elapsedMs}ms${formatCrmModalMeta(ctx, elapsedMs)}`,
        true,
        elapsedMs,
        ctx.type,
      );
      return;
    }
    const iframe = getModalIframe();
    if (!iframe) {
      setTimeout(schedule, 100);
      return;
    }
    const timeLeft = deadline - performance.now();
    const loaded = modal.matches(AUP) ? Promise.resolve() : whenIframeLoad(iframe, timeLeft);
    loaded
      .then(() => waitForIframeRendered(iframe, rid, deadline))
      .then(() => {
        if (rid !== run) return;
        const loadTimeMs = Math.round(performance.now() - t0);
        if (hasModalError()) {
          lanaLog(
            `${ctx.type} modal: Error after ${loadTimeMs}ms${formatCrmModalMeta(ctx, loadTimeMs)}`,
            true,
            loadTimeMs,
            ctx.type,
          );
        } else {
          lanaLog(
            `${ctx.type} modal: Took ${loadTimeMs}ms to load${formatCrmModalMeta(ctx, loadTimeMs)}`,
            false,
            loadTimeMs,
            ctx.type,
          );
        }
      })
      .catch((err) => {
        if (err?.message === 'stale' || rid !== run) return;
        const loadTimeMs = Math.round(performance.now() - t0);
        if (err?.message === 'error-wrapper' || hasModalError()) {
          lanaLog(
            `${ctx.type} modal: Error after ${loadTimeMs}ms${formatCrmModalMeta(ctx, loadTimeMs)}`,
            true,
            loadTimeMs,
            ctx.type,
          );
          return;
        }
        lanaLog(
          `${ctx.type} modal: took longer than a minute${formatCrmModalMeta(ctx, loadTimeMs)}`,
          true,
          loadTimeMs,
          ctx.type,
        );
      });
  };

  schedule();
}

function onCrmClick(e) {
  const el = e.target?.nodeType === Node.ELEMENT_NODE && e.target?.closest(CRM);
  if (!el) return;
  run += 1;
  measureFromClick(run, {
    page: window.location.href,
    cta: getCrmCtaAriaLabel(e.target, el),
    type: '3 in 1',
  });
}

export default function initCrmModalLana() {
  if (inited) return;
  inited = true;
  document.addEventListener('click', onCrmClick, { capture: true, passive: true });
}
