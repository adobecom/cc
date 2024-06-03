import { createTag } from '../../../scripts/utils.js';
import createprogressCircle from '../../progress-circle/progress-circle.js';
import { getBearerToken } from '../../../blocks/unity/unity.js';

function toDataURL(url) {
  let pass = null;
  let fail = null;
  var xhr = new XMLHttpRequest();
  xhr.onload = function() {
    var reader = new FileReader();
    reader.onloadend = () => { 
      let r = reader.result;
      if (r.startsWith('data:*/*')) {
        r = r.replace('data:*/*', 'data:image/jpeg');
      }
      pass(r); 
    }
    reader.readAsDataURL(xhr.response);
  };
  xhr.open('GET', url);
  xhr.responseType = 'blob';
  xhr.send();
  return new Promise((res, rej) => {
    pass = res;
    fail = rej;
  })
}

async function getImageBlobData(e, elem = null) {
  const image = elem.querySelector(':scope > picture > img').src;
  let base64img = null;
  if (!image.includes('data:image/jpeg')) {
    const url = new URL(image);
    base64img = await toDataURL(`${url.origin}${url.pathname}`);
  }
  else base64img = image;
  let binary = atob(base64img.split(',')[1]);
  let array = [];
  for (let i = 0; i < binary.length; i++) {
    array.push(binary.charCodeAt(i));
  }
  return array;
}

async function uploadToS3(s3Url, blobData) {
  const options = {
    method: 'PUT',
    headers: {'Content-Type': 'image/jpeg'},
    body: blobData,
  };
  const res = await fetch(s3Url, options);
  if (res.status !== 200) throw('Failed to upload to s3!!');
}

function selectorTrayWithImgs(layer, data) {
  const selectorTray = createTag('div', { class: 'body-s selector-tray' });
  const trayItems = createTag('div', { class: 'tray-items' });
  const productIcon = createTag('div', { class: 'product-icon' });
  const productSvg = `<svg id="Photoshop_40" data-name="Photoshop 40" xmlns="http://www.w3.org/2000/svg" width="40" height="39" viewBox="0 0 40 39">
  <path id="Path_99550" data-name="Path 99550" d="M7.125,0H33a7.005,7.005,0,0,1,7,7.1V31.9A7.11,7.11,0,0,1,32.875,39H7.125A7.11,7.11,0,0,1,0,31.9V7.1A7.032,7.032,0,0,1,7.125,0Z" fill="#001e36"/>
  <path id="Path_99551" data-name="Path 99551" d="M7.2,25.375V8.25c0-.125,0-.25.125-.25h5.25a8.738,8.738,0,0,1,3.375.5A6.555,6.555,0,0,1,18.2,9.75a4.945,4.945,0,0,1,1.25,1.875,6.349,6.349,0,0,1,.375,2.125,6.1,6.1,0,0,1-1,3.5,5.926,5.926,0,0,1-2.625,2,11.784,11.784,0,0,1-3.75.625H10.825V25.25a.436.436,0,0,1-.125.25H7.45C7.325,25.625,7.2,25.5,7.2,25.375ZM10.825,11.25v5.625h1.5a9.649,9.649,0,0,0,1.875-.25,3.236,3.236,0,0,0,1.375-.875,2.444,2.444,0,0,0,.5-1.75,3.328,3.328,0,0,0-.375-1.5,4.313,4.313,0,0,0-1.125-1,5.182,5.182,0,0,0-2-.375H11.45A2.543,2.543,0,0,0,10.825,11.25Z" transform="translate(1.8 1.942)" fill="#31a8ff"/>
  <path id="Path_99552" data-name="Path 99552" d="M27.35,14.95a6.279,6.279,0,0,0-1.625-.625,9.649,9.649,0,0,0-1.875-.25,2.752,2.752,0,0,0-1,.125c-.25,0-.375.125-.5.375-.125.125-.125.25-.125.5a.459.459,0,0,0,.125.375,2.727,2.727,0,0,0,.625.5,4.44,4.44,0,0,0,1.125.5,9.369,9.369,0,0,1,2.5,1.25,7.163,7.163,0,0,1,1.375,1.375,3.993,3.993,0,0,1,.375,1.75,5.093,5.093,0,0,1-.625,2.25,5.535,5.535,0,0,1-1.875,1.5,7.564,7.564,0,0,1-3,.5,13.774,13.774,0,0,1-2.25-.25,9.207,9.207,0,0,1-1.75-.5c-.125,0-.25-.25-.25-.375V21.075l.125-.125h.125a10.814,10.814,0,0,0,2.125.875,9.715,9.715,0,0,0,2,.25,3.345,3.345,0,0,0,1.375-.25.844.844,0,0,0,.5-.75.687.687,0,0,0-.375-.625,4.954,4.954,0,0,0-1.625-.75,8.644,8.644,0,0,1-2.375-1.25,4.324,4.324,0,0,1-1.25-1.375,3.992,3.992,0,0,1-.375-1.75,3.777,3.777,0,0,1,.625-2,3.448,3.448,0,0,1,1.75-1.5,6.694,6.694,0,0,1,3-.625,12.127,12.127,0,0,1,2.125.125,6.593,6.593,0,0,1,1.5.375l.125.125v3l-.125.125Z" transform="translate(4.65 2.731)" fill="#31a8ff"/>
</svg>`;
  productIcon.innerHTML = `${productSvg}`;
  const removeBg = removeBgButton(data);
  const uploadCTA = uploadButton(data);
  trayItems.append(productIcon, removeBg, uploadCTA);
  selectorTray.append(trayItems);
  return selectorTray;
}

function loadImg(img) {
  return new Promise((res) => {
    img.loading = 'eager';
    img.fetchpriority = 'high';
    if (img.complete) res();
    else {
      img.onload = () => res();
      img.onerror = () => res();
    }
  });
}

/*-------------- Remove Background --------------*/

function removeBgButton(data) {
  const btnText = data.stepConfigs[data.stepIndex].querySelectorAll('ul li')[1].innerText;
  let image = null;
  const removeBgCTA = createTag('div', { class: 'gray-button start-over-button body-m', href: '#' });
  const svgBlack = `<svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 34 34" fill="none">
  <path fill-rule="evenodd" clip-rule="evenodd" d="M28.2429 16.4186L26.4445 18.3827V26.4443C26.4445 27.4875 25.5988 28.3332 24.5556 28.3332H9.4445C8.4013 28.3332 7.55561 27.4875 7.55561 26.4443V11.3332C7.55561 10.29 8.4013 9.44428 9.4445 9.44428H17.9205L14.3155 5.6665H9.4445C6.31489 5.6665 3.77783 8.20357 3.77783 11.3332V26.4443C3.77783 29.5738 6.31489 32.111 9.4445 32.111H24.5556C27.6851 32.111 30.2223 29.5738 30.2223 26.4443V16.1926L29.0002 16.1138C28.7146 16.0954 28.4361 16.2075 28.2429 16.4186Z" fill="white"/>
  <path fill-rule="evenodd" clip-rule="evenodd" d="M30.2828 0.223145L29.44 6.60702C29.3677 7.15425 29.5475 7.70473 29.9289 8.10374L33.9883 12.3505L28.125 11.9718C27.5742 11.9362 27.0372 12.1523 26.6645 12.5593L22.3159 17.3087L23.1513 10.9187C23.2227 10.3726 23.0431 9.8235 22.6629 9.42511L18.6099 5.17946L24.4666 5.55625C25.0164 5.59161 25.5525 5.37624 25.9252 4.97042L30.2828 0.223145Z" fill="white"/>
  <path fill-rule="evenodd" clip-rule="evenodd" d="M18.7656 14.3374L18.283 17.9922C18.2164 18.4963 18.3821 19.0034 18.7334 19.3709L21.0412 21.7853L17.7078 21.57C17.2004 21.5371 16.7056 21.7362 16.3623 22.1111L13.8727 24.8302L14.3511 21.171C14.4169 20.668 14.2514 20.1622 13.9011 19.7952L11.5967 17.3813L14.9266 17.5955C15.433 17.6281 15.927 17.4297 16.2702 17.0558L18.7656 14.3374Z" fill="white"/>
  </svg>`;
  const svgWhite = `<svg width="30" height="24" viewBox="0 0 30 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path opacity="0.35" d="M8.58301 2.38867H2.19434V8.77734H8.58301V2.38867Z" fill="#292929"/>
  <path opacity="0.35" d="M14.9717 15.166H13.8655L8.58301 10.3745V8.77734H14.9717V15.166Z" fill="#292929"/>
  <path opacity="0.35" d="M21.3603 2.38867H14.9717V8.77734H21.3603V2.38867Z" fill="#292929"/>
  <path opacity="0.35" d="M27.749 8.77734H21.3604V15.166H27.749V8.77734Z" fill="#292929"/>
  <path opacity="0.35" d="M21.3603 15.6205L14.9717 17.4978V15.166H21.3603V15.6205Z" fill="#292929"/>
  <path d="M22.1589 8.00995C22.1589 9.33309 21.0863 10.4057 19.7632 10.4057C18.44 10.4057 17.3674 9.33309 17.3674 8.00995C17.3674 6.68681 18.44 5.6142 19.7632 5.6142C21.0863 5.6142 22.1589 6.68681 22.1589 8.00995Z" fill="#292929"/>
  <path d="M25.7526 0.791504H4.19079C2.20916 0.791504 0.597168 2.40428 0.597168 4.38513V19.5582C0.597168 21.5391 2.20916 23.1518 4.19079 23.1518H25.7526C27.7342 23.1518 29.3462 21.5391 29.3462 19.5582V4.38513C29.3462 2.40428 27.7342 0.791504 25.7526 0.791504ZM4.19079 3.18725H25.7526C26.4131 3.18725 26.9504 3.72536 26.9504 4.38513V17.499L23.9019 14.4501C22.545 13.0931 20.1749 13.0931 18.8195 14.4501L16.8519 16.4169C16.6967 16.5729 16.4417 16.5713 16.2865 16.4185L11.1246 11.2558C9.76764 9.89879 7.39762 9.89879 6.04222 11.2558L2.99294 14.305V4.38513C2.99294 3.72536 3.53025 3.18725 4.19079 3.18725ZM4.19079 20.7561C3.53025 20.7561 2.99292 20.218 2.99292 19.5582V17.6928L7.73684 12.9496C8.18761 12.4973 8.97762 12.4973 9.42994 12.9496L14.5934 18.1139C15.6821 19.1995 17.4548 19.2042 18.545 18.1123L20.5142 16.144C20.965 15.6916 21.755 15.6916 22.2073 16.144L26.5208 20.4574C26.3114 20.6364 26.0488 20.7561 25.7525 20.7561L4.19079 20.7561Z" fill="#292929"/>
  </svg>`;
  const svg = data.target.classList.contains('light') ? svgWhite : svgBlack;
  removeBgCTA.innerHTML = `${svg} ${btnText}`;
  removeBgCTA.addEventListener('click', async (e) => {
    if (e.target.closest('.disable-click')) {
      console.log('click disabled');
      return;
    }
    const circle = await createprogressCircle();
    data.target.appendChild(circle);
    data.target.querySelector('.tray-items').classList.add('disable-click');

    data.target.classList.add('loading');
    const options1 = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': getBearerToken(),
        'x-api-key': 'leo',
      }
    };
    const res1 = await fetch('https://assistant-int.adobe.io/api/v1/asset', options1);
    const { id, href} = await res1.json();
    const array = await getImageBlobData(null, data.target);
    let blobData = new Blob([new Uint8Array(array)], { type: 'image/jpeg', });
    await uploadToS3(href, blobData);
    const options2 = {
      method: 'POST',
      headers: {
        Authorization: getBearerToken(),
        'Content-Type': 'application/json',
        'x-api-key': 'leo'
      },
      body: `{"surfaceId":"Unity","assets":[{"id": "${id}"}]}`
    };
    
    const res2 = await fetch('https://assistant-int.adobe.io/api/v1/providers/PhotoshopRemoveBackground', options2);
    const { outputUrl } = await res2.json();
    const img = document.querySelector('.interactive-holder > picture > img');
    img.src = outputUrl;
    await loadImg(img);
    data.target.classList.remove('loading');
    circle.remove();
    data.target.querySelector('.tray-items').classList.remove('disable-click');
  });
  return removeBgCTA;
}
/*-------------- Remove Background --------------*/

/*-------------- Upload Button --------------*/
function uploadButton(data) {
  const btnText = data.stepConfigs[data.stepIndex].querySelectorAll('ul li')[2]?.innerText;
  const uploadCTA = createTag('div', { class: 'gray-button start-over-button upload-button body-m', href: '#' });
  const svgBlack = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10" stroke="#fff"/>
                      <polyline points="16 12 12 8 8 12" stroke="#fff"/>
                      <line stroke="#fff" x1="12" y1="16" x2="12" y2="8"/>
                    </svg>`;
  const svgWhite = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_811_34435)">
<path d="M31.5261 18.6357C31.5261 20.4848 30.8063 22.2223 29.4993 23.5286C28.1922 24.8349 26.4547 25.5547 24.6064 25.5547H23.5567C22.8953 25.5547 22.3588 25.0181 22.3588 24.3568C22.3588 23.6955 22.8953 23.1589 23.5567 23.1589H24.6064C25.8144 23.1589 26.9506 22.6887 27.8054 21.8339C28.6601 20.98 29.1304 19.8445 29.1304 18.6357C29.1304 17.4737 28.6882 16.3718 27.8857 15.5342C27.0848 14.6974 26.0062 14.2029 24.8474 14.1413C24.441 14.1195 24.073 13.8926 23.871 13.5393C23.669 13.1852 23.6604 12.7532 23.8491 12.3921C24.0496 12.0069 24.204 11.6099 24.3077 11.2122C24.4169 10.7973 24.4722 10.3723 24.4722 9.94801C24.4722 8.52087 23.917 7.17948 22.9086 6.17035C20.9792 4.24252 17.6437 4.13567 15.613 5.94575C14.6537 6.80282 14.0322 7.97808 13.8653 9.25628C13.8161 9.63296 13.5908 9.9644 13.2585 10.1484C12.9271 10.3333 12.5278 10.3489 12.1808 10.1913C11.9117 10.0689 11.6349 9.97454 11.3557 9.91138C9.98156 9.59865 8.57389 10.0221 7.60452 10.9689C6.84649 11.7082 6.42926 12.6885 6.42926 13.7288C6.42926 13.9963 6.45813 14.2638 6.51427 14.5251C6.56964 14.7778 6.65231 15.0289 6.75836 15.2691C6.91746 15.627 6.89094 16.0404 6.68817 16.3757C6.48462 16.711 6.13056 16.9255 5.73985 16.9505C4.94751 17.0012 4.21209 17.3451 3.66696 17.9183C3.12183 18.4938 2.8208 19.248 2.8208 20.0419C2.8208 20.8747 3.14522 21.6577 3.73403 22.2465C4.32282 22.8346 5.10504 23.159 5.93793 23.159H9.29136C9.95268 23.159 10.4892 23.6955 10.4892 24.3569C10.4892 25.0182 9.95268 25.5547 9.29136 25.5547H5.93793C4.46553 25.5547 3.08128 24.9815 2.04015 23.9404C0.998256 22.8993 0.425049 21.5143 0.425049 20.0419C0.425049 18.6319 0.959254 17.2928 1.92864 16.2696C2.54708 15.6185 3.30354 15.1349 4.13643 14.8487C4.0678 14.4791 4.0335 14.1039 4.0335 13.7288C4.0335 12.0373 4.70731 10.4479 5.9317 9.25395C7.45867 7.76207 9.65869 7.09761 11.8033 7.55696C12.2252 6.25536 12.9864 5.07932 14.0181 4.1583C15.4266 2.90272 17.2421 2.21097 19.1317 2.21097C21.1976 2.21097 23.141 3.0158 24.6025 4.47649C26.0632 5.93796 26.868 7.88139 26.868 9.94803C26.868 10.5782 26.7861 11.2083 26.6247 11.8205C26.6075 11.8876 26.5888 11.9546 26.5693 12.0209C27.7212 12.3594 28.7701 12.9934 29.6163 13.877C30.8477 15.163 31.5261 16.8529 31.5261 18.6357Z" fill="#292929"/>
<path d="M22.1263 17.2873L17.3301 12.4997C16.8622 12.0334 16.105 12.0326 15.637 12.5005L10.8502 17.2881C10.3823 17.756 10.3823 18.5141 10.8502 18.982C11.0842 19.2159 11.3907 19.3329 11.6971 19.3329C12.0036 19.3329 12.3101 19.2159 12.5441 18.982L15.2947 16.2308V29.3012C15.2947 29.9625 15.8312 30.4991 16.4925 30.4991C17.1539 30.4991 17.6904 29.9625 17.6904 29.3012V16.2441L20.434 18.9828C20.9011 19.4491 21.6592 19.4491 22.1279 18.9812C22.595 18.5133 22.595 17.7545 22.1263 17.2873Z" fill="#292929"/>
</g>
<defs>
<clipPath id="clip0_811_34435">
<rect width="31.9433" height="31.9433" fill="white"/>
</clipPath>
</defs>
</svg>`;
  const svg = data.target.classList.contains('light') ? svgWhite : svgBlack;
  uploadCTA.innerHTML = `<label id="file-input-label" for="file-input">${svg} <span> ${btnText} </span><span></span></label>
                        <input type='file' class='upload-file' id="file-input" name="file-input" />`;
  uploadCTA.querySelector('.upload-file').addEventListener('change', async (e) => {
    if (e.target.closest('.disable-click')) {
      console.log('click disabled');
      return;
    }
    const layer = e.target.closest('.layer');
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async function(e) {
      if (!e.target.result.includes('data:image/jpeg')) return alert('Wrong file type - JPEG only.');
      const img = layer.closest('.foreground').querySelector('.interactive-holder > picture > img');
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
  return uploadCTA;
}
/*-------------- Upload Button --------------*/

export default async function stepInit(data) {
  data.target.classList.add('step-selector-tray-edits');
  const config = data.stepConfigs[data.stepIndex];
  const layer = createTag('div', { class: `layer layer-${data.stepIndex}` });
  const trayTitle = createTag('div', { class: 'tray-title' });
  trayTitle.src = data.stepConfigs[data.stepIndex].querySelector('ul li').innerText;
  const selectorTray = selectorTrayWithImgs(layer, data);
  layer.append(selectorTray);
  /*layer.append(selectorTray);*/
  return layer;
}
