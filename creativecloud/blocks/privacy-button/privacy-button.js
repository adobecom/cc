import { getLibs, createTag } from '../../scripts/utils.js';

function injectTrackingImage(url) {
  const img = createTag('img', {
    src: url,
    class: 'privacy-tracking-image',
    'aria-hidden': 'true',
  });
  document.body.appendChild(img);
}

function handleUrlVariant(button, urls, message) {
  button.addEventListener('click', () => {
    urls.split(',').forEach((url) => {
      const trimmedUrl = url.trim();
      if (trimmedUrl.match('^http') !== null) {
        injectTrackingImage(trimmedUrl);
      }
    });
    button.parentNode.replaceChild(createTag('span', { class: 'privacy-button-message' }, message), button);
  });
}

export default async function init(el) {
  const miloLibs = getLibs('/libs');
  const { decorateButtons } = await import(`${miloLibs}/utils/decorate.js`);
  const config = {};
  el.querySelectorAll(':scope > div').forEach((row) => {
    const [key, value] = [...row.children];
    if (!key || !value) return;
    config[key.textContent.trim().toLowerCase()] = value.textContent.trim();
  });

  const button = createTag('button', {
    class: 'con-button blue',
    type: 'button',
  }, config['privacy-button-label']);

  if (config['privacy-button-label'] && config['privacy-confirmation-message'] && config['privacy-url']) {
    handleUrlVariant(button, config['privacy-url'], config['privacy-confirmation-message']);
  }

  el.innerHTML = '';
  el.append(button);
  decorateButtons(el);
}
