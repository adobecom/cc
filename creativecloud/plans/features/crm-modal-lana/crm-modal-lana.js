/**
 * CRM modal RUM: click `[data-modal=crm]` → the three-in-one modal’s iframe
 * `load` fires, then the iframe is “rendered” (no `loading` class) before
 * we report `loadTimeMs` (≤60s). `.error-wrapper` anywhere in the modal = failure.
 * @see https://github.com/adobecom/milo/blob/main/libs/utils/lana.md
 */

const CRM = '[data-modal="crm"]';
const MODAL = [
  '.dialog-modal.three-in-one',
  '[role="dialog"].three-in-one',
  '[aria-modal="true"].three-in-one',
].join(',');
const MAX_MS = 60000;
const RENDER_POLL_MS = 50;

/** @see https://github.com/adobecom/milo/blob/main/libs/utils/lana.md */
const LANA = {
  clientId: 'cc',
  sampleRate: 1,
  tags: 'cc-merch,crm-modal-load',
};

let run = 0;
let inited = false;

function lanaLog(message, isError) {
  window.lana?.log(
    message,
    isError ? { ...LANA, errorType: 'e' } : LANA,
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
 * After `load`, wait until the iframe is not showing `class="loading"` and no modal error.
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
      if (!iframe.classList.contains('loading')) { resolve(); return; }
      setTimeout(check, RENDER_POLL_MS);
    }
    check();
  });
}

/**
 * @param {number} rid
 */
function measureFromClick(rid) {
  const t0 = performance.now();
  const deadline = t0 + MAX_MS;

  const schedule = () => {
    if (rid !== run) return;
    if (performance.now() >= deadline) {
      lanaLog('cc-crm-modal: took longer than a minute', true);
      return;
    }
    if (hasModalError()) {
      lanaLog(
        `cc-crm-modal: error error-wrapper loadTimeMs=${Math.round(performance.now() - t0)}`,
        true,
      );
      return;
    }
    const iframe = getModalIframe();
    if (!iframe) {
      setTimeout(schedule, 100);
      return;
    }
    const timeLeft = deadline - performance.now();
    whenIframeLoad(iframe, timeLeft)
      .then(() => waitForIframeRendered(iframe, rid, deadline))
      .then(() => {
        if (rid !== run) return;
        const loadTimeMs = Math.round(performance.now() - t0);
        if (hasModalError()) {
          lanaLog(
            `cc-crm-modal: error error-wrapper loadTimeMs=${loadTimeMs}`,
            true,
          );
        } else {
          lanaLog(`cc-crm-modal: loadTimeMs=${loadTimeMs}`);
        }
      })
      .catch((err) => {
        if (err?.message === 'stale' || rid !== run) return;
        const loadTimeMs = Math.round(performance.now() - t0);
        if (err?.message === 'error-wrapper' || hasModalError()) {
          lanaLog(
            `cc-crm-modal: error error-wrapper loadTimeMs=${loadTimeMs}`,
            true,
          );
          return;
        }
        lanaLog('cc-crm-modal: took longer than a minute', true);
      });
  };

  schedule();
}

function onCrmClick(e) {
  const el = e.target?.nodeType === Node.ELEMENT_NODE && e.target?.closest(CRM);
  if (!el) return;
  run += 1;
  measureFromClick(run);
}

export default function initCrmModalLana() {
  if (inited) return;
  inited = true;
  document.addEventListener('click', onCrmClick, { capture: true, passive: true });
}
