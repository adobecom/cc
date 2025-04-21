import { getLibs } from '../../../creativecloud/scripts/utils.js';

const PROTECTED_URL_ELEMENT = '#protected-url';
const PROGRESS_CIRCLE_EL = '.cc-forms .form-item.progress-item';

async function createProgressCircle() {
  if (document.querySelector('.progress-holder')) return;
  const { createTag } = await import(`${getLibs()}/utils/utils.js`);
  const pdom = `<div class="spectrum-ProgressCircle-track"></div><div class="spectrum-ProgressCircle-fills">
    <div class="spectrum-ProgressCircle-fillMask1">
      <div class="spectrum-ProgressCircle-fillSubMask1">
        <div class="spectrum-ProgressCircle-fill"></div>
      </div>
    </div>
    <div class="spectrum-ProgressCircle-fillMask2">
      <div class="spectrum-ProgressCircle-fillSubMask2">
        <div class="spectrum-ProgressCircle-fill"></div>
      </div>
    </div>
  </div>`;
  const prgc = createTag('div', { class: 'spectrum-ProgressCircle spectrum-ProgressCircle--indeterminate' }, pdom);
  const layer = createTag('div', { class: 'progress-holder' }, prgc);
  const formItem = createTag('div', { class: 'form-item progress-item' }, layer);
  document.querySelector('.cc-forms .form-components').append(formItem);
}

function showProgressCircle() {
  document.querySelector(PROGRESS_CIRCLE_EL).classList.add('loading');
}

function hideProgressCircle() {
  document.querySelector(PROGRESS_CIRCLE_EL).classList.remove('loading');
}

async function getEncryptedText(linkUrl) {
  const options = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: `{"plainText":"${linkUrl}"}`,
  };
  const response = await fetch('https://www.stage.adobe.com/trustcenter/api/encrypturl', options);
  const responseJson = await response.json();
  return responseJson.encryptedCode;
}

function onSubmitButtonAdded(node) {
  node.addEventListener('click', async () => {
    try {
      await createProgressCircle();
      showProgressCircle();
      const linkUrl = document.querySelector('input').value;
      if (!linkUrl) throw new Error('Cannot have empty url');
      const search = new URLSearchParams(window.location.search);
      const nonprod = search.get('nonprod');
      if (!nonprod && !linkUrl.startsWith('https://www.adobe.com')) {
        document.querySelector(PROTECTED_URL_ELEMENT).value = 'Please enter a www.adobe.com asset url';
        throw new Error('Please enter a www.adobe.com asset url');
      }
      document.querySelector(PROTECTED_URL_ELEMENT).value = await getEncryptedText(linkUrl);
      hideProgressCircle();
    } catch (err) {
      hideProgressCircle();
    }
  });
}

(async function startObserving() {
  const observer = new MutationObserver((mutationsList) => {
    // eslint-disable-next-line no-restricted-syntax
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if ((node.nodeType === Node.ELEMENT_NODE) && (node.querySelector('a.con-button:not(.submit-decorated)'))) {
            node.querySelector('a.con-button').classList.add('submit-decorated');
            onSubmitButtonAdded(node.querySelector('a.con-button'));
          }
        });
      }
    }
  });
  observer.observe(document.body.querySelector('main > div:nth-child(2)'), {
    childList: true,
    subtree: true,
  });
}());
