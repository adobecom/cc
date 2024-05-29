import { createTag } from '../../../scripts/utils.js';
import createprogressCircle from '../../progress-circle/progress-circle.js';

export default async function stepInit(data) {
  data.target.classList.add('step-generate-t2im');
  const config = data.stepConfigs[data.stepIndex];
  const layer = createTag('div', { class: `layer layer-${data.stepIndex}` });
  const lastp = config.querySelector(':scope > div > p:last-child');
  const [searchText, btnText] = lastp.textContent.trim().split('|');
  const genfillDiv = createTag('div', { class: 'generate-prompt-button body-m' });
  const searchBar = createTag('input', { class: 'generate-text', type: 'text'});
  searchBar.value = searchText;
  const searchBarContainer = createTag('div', { class: 'generate-text-container' }, searchBar);
  const generateBtn = createTag('a', { class: 'gray-button generate-button next-step', href: '#' });
  const analyticsHolder = createTag('div', { class: 'interactive-link-analytics-text' }, `${searchText} - `);
  const svg = config.querySelector('img[src*=".svg"]')?.closest('picture');
  if (svg) {
    generateBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 34 34" fill="none">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M28.2429 16.4186L26.4445 18.3827V26.4443C26.4445 27.4875 25.5988 28.3332 24.5556 28.3332H9.4445C8.4013 28.3332 7.55561 27.4875 7.55561 26.4443V11.3332C7.55561 10.29 8.4013 9.44428 9.4445 9.44428H17.9205L14.3155 5.6665H9.4445C6.31489 5.6665 3.77783 8.20357 3.77783 11.3332V26.4443C3.77783 29.5738 6.31489 32.111 9.4445 32.111H24.5556C27.6851 32.111 30.2223 29.5738 30.2223 26.4443V16.1926L29.0002 16.1138C28.7146 16.0954 28.4361 16.2075 28.2429 16.4186Z" fill="white"></path>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M30.2828 0.223145L29.44 6.60702C29.3677 7.15425 29.5475 7.70473 29.9289 8.10374L33.9883 12.3505L28.125 11.9718C27.5742 11.9362 27.0372 12.1523 26.6645 12.5593L22.3159 17.3087L23.1513 10.9187C23.2227 10.3726 23.0431 9.8235 22.6629 9.42511L18.6099 5.17946L24.4666 5.55625C25.0164 5.59161 25.5525 5.37624 25.9252 4.97042L30.2828 0.223145Z" fill="white"></path>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M18.7656 14.3374L18.283 17.9922C18.2164 18.4963 18.3821 19.0034 18.7334 19.3709L21.0412 21.7853L17.7078 21.57C17.2004 21.5371 16.7056 21.7362 16.3623 22.1111L13.8727 24.8302L14.3511 21.171C14.4169 20.668 14.2514 20.1622 13.9011 19.7952L11.5967 17.3813L14.9266 17.5955C15.433 17.6281 15.927 17.4297 16.2702 17.0558L18.7656 14.3374Z" fill="white"></path>
    </svg>`;
  }
  generateBtn.appendChild(analyticsHolder);
  const btnTextNode = createTag('span', {}, btnText);
  generateBtn.appendChild(btnTextNode);
  genfillDiv.appendChild(searchBarContainer);
  genfillDiv.appendChild(generateBtn);
  layer.appendChild(genfillDiv);

  ['focus', 'click'].forEach(e => {
    searchBar.addEventListener(e, () => searchBar.value = '');
  });

  generateBtn.addEventListener('click', async (e) => {
    const circle = await createprogressCircle();
    data.target.appendChild(circle);
    data.target.classList.add('loading');
    const payload = `{
      "surfaceId":"Unity",
      "query": "${data.target.querySelector('.generate-text').value}",
      "image" : {
        "base64": "base64encodedpayloadofimage",
        "extension": "jpeg"
      }
    }`;
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': window.unityAccessToken,
        'x-api-key': 'leo',
      },
      body: payload,
    };
    const res = await fetch('https://assistant-int.adobe.io/api/v1/providers/Text2Template', options);
    const d = await res.json();
    data.target.querySelector(':scope > picture img').src = `data:image/jpeg;base64,${d['images'][0]['base64']}`;
    data.target.classList.remove('loading');
    circle.remove();
  });
  return layer;
}
