import { getLibs } from '../../scripts/utils.js';

const miloLibs = getLibs('/libs');
const { createTag, loadStyle } = await import(`${miloLibs}/utils/utils.js`);

export function decorateText(el) {
  if (!el) return;
  const headings = el.querySelectorAll('h1, h2, h3, h4, h5, h6');
  const heading = headings[headings.length - 1];
  heading.classList.add('heading-xxl');
  heading.nextElementSibling?.classList.add('body-l');
}

export function createSearchBox(text) {
  if (!text) return;

  const actionArea = text.querySelector('.action-area');
  if (!actionArea) return;

  // Create search container
  const searchContainer = createTag('div', { class: 'showcase-search-container' });

  const inputWrapper = createTag('div', { class: 'showcase-input-wrapper' });

  // Create icon
  const iconSpan = createTag('span', { class: 'showcase-search-icon' });
  iconSpan.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 20h9"></path>
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
  </svg>`;

  // Create input field
  const input = createTag('input', {
    type: 'text',
    class: 'showcase-input',
    placeholder: 'Describe what you want to generate',
    'aria-label': 'Describe what you want to generate',
  });

  inputWrapper.appendChild(iconSpan);
  inputWrapper.appendChild(input);

  // Get the first button from action area or create a new one
  const existingButton = actionArea.querySelector('.con-button');
  let generateButton;

  if (existingButton) {
    generateButton = existingButton.cloneNode(true);
    generateButton.classList.add('showcase-generate-btn');
  } else {
    generateButton = createTag('a', {
      href: '#generate',
      class: 'con-button blue showcase-generate-btn',
    });
    generateButton.textContent = 'Generate';
  }

  searchContainer.appendChild(inputWrapper);
  searchContainer.appendChild(generateButton);

  // Replace action area with search container
  actionArea.replaceWith(searchContainer);
}

export async function initLogoRow(el) {
  const children = Array.from(el.children);
  const logoRowContent = children.find((child) => child.querySelector('span.icon'));

  if (!logoRowContent) return;

  logoRowContent.classList.add('logo-row');

  loadStyle('../logo-row/logo-row.css');
  const { default: initLogoRowFunc } = await import('../logo-row/logo-row.js');
  initLogoRowFunc(logoRowContent);
}

export default async function init(el) {
  const { decorateBlockBg, decorateButtons } = await import(`${miloLibs}/utils/decorate.js`);

  const children = el.querySelectorAll(':scope > div');
  const foreground = children[children.length - 2];

  // Setup background if exists
  if (children.length > 1) {
    children[0].classList.add('background');
    decorateBlockBg(el, children[0], { useHandleFocalpoint: true });
  }

  foreground?.classList.add('foreground', 'container');

  // Find and setup text content
  const headline = foreground?.querySelector('h1, h2, h3, h4, h5, h6');
  const text = headline?.closest('div');
  text?.classList.add('text');

  // Decorate text and buttons
  decorateText(text);
  decorateButtons(text, 'button-l');

  // Create search box
  createSearchBox(text);

  // Initialize logo row if present
  await initLogoRow(el);
}
