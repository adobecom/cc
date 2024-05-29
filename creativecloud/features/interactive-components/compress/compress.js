import { createTag } from '../../../scripts/utils.js';
import defineDeviceByScreenSize from '../../../scripts/decorate.js';

function applyAccessibility(inputEle, target) {
  let tabbing = false;
  document.addEventListener('keydown', () => {
    tabbing = true;
    inputEle.addEventListener('focus', () => {
      if (tabbing) {
        target.classList.add('focusUploadButton');
      }
    });
    inputEle.addEventListener('blur', () => {
      target.classList.remove('focusUploadButton');
    });
  });
  document.addEventListener('keyup', () => {
    tabbing = false;
  });
}

function appendSVGToButton(picture, button) {
  if (!picture) return;
  const svg = picture.querySelector('img[src*=svg]');
  if (!svg) return;
  const svgClone = svg.cloneNode(true);
  const svgCTACont = createTag('div', { class: 'svg-icon-container' });
  svgCTACont.append(svgClone);
  button.prepend(svgCTACont);
}

function createUploadButton(text, picture, menu, buttonsPanel) {
  const currentVP = defineDeviceByScreenSize().toLocaleLowerCase();
  const btn = createTag('input', { class: 'inputFile', type: 'file', accept: 'application/pdf' });
  const labelBtn = createTag('a', { class: `uploadButton body-${currentVP === 'mobile' ? 'm' : 'xl'}` }, text);
  const analyticsHolder = createTag('div', { class: 'interactive-link-analytics-text' }, `${text}`);
  labelBtn.append(btn, analyticsHolder);
  appendSVGToButton(picture, labelBtn);
  const clone = labelBtn.cloneNode(true);
  clone.classList.add('uploadButtonMobile');
  const mobileInput = clone.querySelector('.inputFile');
  menu.append(clone);
  buttonsPanel.append(menu);
  buttonsPanel.append(labelBtn);
  applyAccessibility(btn, labelBtn);
  applyAccessibility(mobileInput, clone);
}

function createCompressButton(text, picture, layer) {
  const btn = createTag('a', { class: 'continueButton body-xl hide', href: '#' }, text);
  const analyticsHolder = createTag('div', { class: 'interactive-link-analytics-text' }, `${text}`);
  btn.append(analyticsHolder);
  appendSVGToButton(picture, btn);
  layer.append(btn);
}

function createDownloadButton(text, picture, layer) {
  const btn = createTag('a', { class: 'downloadButton body-xl hide', href: '#' }, text);
  const analyticsHolder = createTag('div', { class: 'interactive-link-analytics-text' }, `${text}`);
  btn.append(analyticsHolder);
  appendSVGToButton(picture, btn);
  layer.append(btn);
}

function handleInput(option, buttonsPanel, menu, layer) {
  const inputType = option.classList[1].split('icon-')[1];
  const sibling = option.nextSibling;
  const text = sibling.nodeValue.trim();
  let picture = '';
  if (sibling.nextSibling && sibling.nextSibling.tagName === 'PICTURE') {
    picture = sibling.nextSibling;
  }
  switch (inputType) {
    case 'upload':
      createUploadButton(text, picture, menu, buttonsPanel);
      break;
    case 'compress':
      createCompressButton(text, picture, layer);
      break;
    case 'download':
      createDownloadButton(text, picture, layer);
      break;
    default:
      window.lana.log(`Unknown input type: ${inputType}`);
      break;
  }
}

async function createPdfButtons(data, layer) {
  const buttonsPanel = createTag('div', { class: 'panel' });
  const menu = createTag('div', { class: 'menu' });
  const config = data.stepConfigs[data.stepIndex];
  const options = config.querySelectorAll(':scope > div ul .icon, :scope > div ol .icon');
  [...options].forEach((o) => { handleInput(o, buttonsPanel, menu, layer); });
  layer.prepend(buttonsPanel);
}

function cancelAnalytics(btn) {
  const x = (e) => {
    e.preventDefault();
  };
  btn.addEventListener('click', x);
  const cancelEvent = new Event('click', { detail: { message: 'Cancel button clicked in file dialog' } });
  btn.setAttribute('daa-ll', 'Cancel Upload');
  btn.dispatchEvent(cancelEvent);
  btn.removeEventListener('click', x);
  btn.setAttribute('daa-ll', 'Upload Image');
}

async function createAsset(pdfObj) {
  const url = 'https://assistant-int.adobe.io/api/v1/asset';
  const { bearerToken } = window;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${bearerToken}`,
      'Content-Type': 'application/json',
      'x-api-key': 'leo',
      'x-gw-ims-client-id': 'leo',
      'x-gw-ims-org-id': 'CFB456506041E6960A49412C@AdobeOrg',
      'x-gw-ims-scope': 'indesign_services,openid,AdobeID,read_organizations,photoshop_services,system',
      'x-gw-ims-user-id': '121C1ABC6426CEC10A494118@techacct.adobe.com',
    },
  });
  if (!response.ok) {
    window.lana.log('Error creating asset');
    return false;
  }
  const json = await response.json();
  pdfObj.assetId = json.id;
  pdfObj.presignedUrl = json.href;
  return true;
}

async function uploadAsset(pdfObj) {
  const response = await fetch(pdfObj.presignedUrl, {
    method: 'PUT',
    body: pdfObj.pdfFile,
  });
  if (!response.ok) {
    window.lana.log('Error uploading asset');
    return false;
  }
  return true;
}

function uploadPdf(media, layer, pdfObj) {
  layer.querySelectorAll('.uploadButton').forEach((btn) => {
    const analyticsBtn = btn.querySelector('.interactive-link-analytics-text');
    btn.addEventListener('cancel', () => {
      cancelAnalytics(btn);
    });
    btn.addEventListener('change', async (e) => {
      const image = media.querySelector('picture > img');
      const parent = image.parentElement;
      const file = e.target.files[0];
      if (!file.type.startsWith('application/pdf')) return;
      if (file) {
        pdfObj.fileName = file.name;
        pdfObj.pdfFile = file;
        const pdfUrl = URL.createObjectURL(file);
        const embed = createTag('embed', { src: `${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`, width: '100%', height: '100%', type: 'application/pdf' });
        image.remove();
        parent.appendChild(embed);
        pdfObj.pdfUrl = pdfUrl;
        analyticsBtn.innerHTML = 'Upload Button';
        await createAsset(pdfObj);
        await uploadAsset(pdfObj);
        const continueBtn = layer.querySelector('.continueButton');
        if (continueBtn) {
          continueBtn.classList.remove('hide');
        }
      } else {
        cancelAnalytics(btn);
      }
    });
  });
}

function compressPdf(layer, pdfObj) {
  layer.querySelectorAll('.continueButton').forEach((btn) => {
    const analyticsBtn = btn.querySelector('.interactive-link-analytics-text');
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const url = 'https://assistant-int.adobe.io/api/v1/providers/AcrobatCompressPDF';
      const { bearerToken } = window;
      btn.classList.add('loading');
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${bearerToken}`,
          'Content-Type': 'application/json',
          'x-api-key': 'leo',
          'x-gw-ims-client-id': 'leo',
          'x-gw-ims-org-id': 'CFB456506041E6960A49412C@AdobeOrg',
          'x-gw-ims-scope': 'indesign_services,openid,AdobeID,read_organizations,photoshop_services,system',
          'x-gw-ims-user-id': '121C1ABC6426CEC10A494118@techacct.adobe.com',
        },
        body: JSON.stringify({
          query: '',
          apiKey: 'leo',
          assets: [
            { id: pdfObj.assetId },
          ],
        }),
      });
      if (!response.ok) {
        window.lana.log('Error compressing asset');
        btn.classList.remove('loading');
        return false;
      }
      const json = await response.json();
      if (!json) {
        window.lana.log('Error compressing asset');
        btn.classList.remove('loading');
        return false;
      }
      pdfObj.compressedPdfUrl = json.outputUrl;
      analyticsBtn.innerHTML = 'Compress Button';
      btn.classList.remove('loading');
      const downloadBtn = layer.querySelector('.downloadButton');
      if (downloadBtn) {
        downloadBtn.classList.remove('hide');
        btn.classList.add('hide');
      }
      return true;
    });
  });
}

function downloadPdf(layer, pdfObj) {
  layer.querySelectorAll('.downloadButton').forEach((btn) => {
    const analyticsBtn = btn.querySelector('.interactive-link-analytics-text');
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      analyticsBtn.innerHTML = 'Download Button';
      const link = createTag('a', { class: 'downloadLink', href: `${pdfObj.compressedPdfUrl}`, download: 'downloaded-file.pdf', target: '_blank' });
      layer.appendChild(link);
      link.click();
      layer.removeChild(link);
    });
  });
}

export default async function stepInit(data) {
  const pdfObj = {};
  data.target.classList.add('step-compress');
  const layer = createTag('div', { class: `layer layer-${data.stepIndex}` });
  await createPdfButtons(data, layer);
  uploadPdf(data.target, layer, pdfObj);
  compressPdf(layer, pdfObj);
  downloadPdf(layer, pdfObj);
  return layer;
}
