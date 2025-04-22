import { getLibs } from '../../../creativecloud/scripts/utils.js';

const PROTECT_URL_SUBMIT = document.querySelector('#generate-protected-link');
const PROTECTED_URL_ELEMENT = document.querySelector('#protected-url');
const PROGRESS_CIRCLE_EL = '.cc-forms .form-item.progress-item';
// const ENCRYPT_ENDPOINT = 'https://www.stage.adobe.com/trustcenter/api/encrypturl';
const ENCRYPT_ENDPOINT = 'https://14257-trucsi-dev.adobeioruntime.net/api/v1/web/trucsi-0.0.1/encrypturl'; // to be removed before stage merge

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
  const response = await fetch(ENCRYPT_ENDPOINT, options);
  const responseJson = await response.json();
  return responseJson.encryptedCode;
}

function onSubmitButtonAdded(node) {
  node.addEventListener('click', async (e) => {
    try {
      e.preventDefault();
      await createProgressCircle();
      showProgressCircle();
      const linkUrl = document.querySelector('#plaintexturl').value;
      if (!linkUrl) throw new Error('Cannot have empty url');
      const search = new URLSearchParams(window.location.search);
      const nonprod = search.get('nonprod');
      const allowedHosts = ['www.adobe.com'];
      const urlHost = new URL(linkUrl).host;
      if (!nonprod && !allowedHosts.includes(urlHost)) {
        PROTECTED_URL_ELEMENT.value = 'Please enter a www.adobe.com asset url';
        throw new Error('Please enter a www.adobe.com asset url');
      }
      PROTECTED_URL_ELEMENT.value = await getEncryptedText(linkUrl);
      hideProgressCircle();
    } catch (err) {
      hideProgressCircle();
      throw err;
    }
  });
}

(async function startObserving() {
  if (PROTECT_URL_SUBMIT) onSubmitButtonAdded(PROTECT_URL_SUBMIT);
}());
