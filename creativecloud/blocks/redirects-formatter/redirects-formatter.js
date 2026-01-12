import { createTag } from '../../scripts/utils.js';

export const SELECT_ALL_REGIONS = 'Select All Regions';
export const DESELECT_ALL_REGIONS = 'De-select All Regions';
export const NO_LOCALE_ERROR = 'No locales selected from list';
const INPUT_LABEL_TEXT = 'Paste source and destination URLs here:';
const OUTPUT_LABEL_TEXT = 'Localized results appear here:';
const PROCESS_TEXT = 'Process redirects';
const COPY_TO_CLIPBOARD = 'Copy to clipboard';
const INSTRUCTIONS_TEXT = 'Select the locales you require by checking the checkboxes. Paste URLs copied from an excel sheet'
  + ' into the first input. Press "Process Redirects" to generate localized URLs to paste into redirects.xlsx. To copy your URLS,'
  + ' press "Copy to clipboard" or select them with the cursor manually.';

async function createLocaleCheckboxes(prefixGroup) {
  return Object.keys(prefixGroup).map((key) => {
    const { prefix } = prefixGroup[key];
    const currLocale = prefix === '' ? 'en' : prefix;
    if (currLocale === 'langstore') return undefined;
    const checkbox = createTag('input', { class: 'locale-checkbox', type: 'checkbox', id: `${currLocale}`, name: `${currLocale}` });
    const label = createTag('label', { class: 'locale-label', for: `${currLocale}` }, currLocale);

    return createTag('div', { class: 'checkbox-wrapper' }, [checkbox, label]);
  });
}

export function parseUrlString(input) {
  const pairs = input.split('\n');

  return pairs.reduce((rdx, pairString) => {
    const pair = pairString.split(/\t| /);
    rdx.push(pair);
    return rdx;
  }, []);
}

function clearError(eSection) {
  const errorElem = document.querySelector('.error');
  errorElem.innerText = '';
  eSection.classList.remove('error-border');
}

function handleError(e, eSection) {
  const errorElem = document.querySelector('.error');
  errorElem.innerText = e;
  eSection.classList.add('error-border');
}

export function generateRedirectList(urls = [], locales = []) {
  const results = [];
  const errors = [];

  if (!Array.isArray(locales) || locales.length === 0) {
    errors.push({ type: 'NO_LOCALE_ERROR' });
    return { results, errors };
  }

  urls.forEach((urlPair, index) => {
    if (!Array.isArray(urlPair) || urlPair.length < 2) {
      errors.push({ type: 'INVALID_PAIR', index });
      return;
    }

    const [fromStr, toStr] = urlPair;

    let from;
    let to;

    try {
      from = new URL(fromStr);
      to = new URL(toStr);
    } catch {
      errors.push({ type: 'INVALID_URL', index });
      return;
    }

    const fromPath = from.pathname.replace(/\.html$/, '');

    const computeToPath = () => {
      const excludeHTMLPaths = ['/blog', '.html'];
      const path = to.pathname;

      if (!to.origin.endsWith('.adobe.com') || excludeHTMLPaths.some((p) => path.includes(p)) || path === '/') {
        return path;
      }
      return `${path}.html`;
    };

    const toPath = computeToPath();

    locales.forEach((locale) => results.push([`/${locale}${fromPath}`, `${to.origin}/${locale}${toPath}`]));
  });

  return { results, errors };
}

function handleRedirectGeneration(urls, locales) {
  const inputSection = document.querySelector('.redirects-text-area');
  const checkboxSection = document.querySelector('.checkbox-container');
  const errorMessage = 'Invalid URL. URLs must start with "https://" e.g: "https://www.adobe.com"';

  const { results, errors } = generateRedirectList(urls, locales);

  errors.forEach((err) => {
    switch (err.type) {
      case 'NO_LOCALE_ERROR':
        handleError(NO_LOCALE_ERROR, checkboxSection);
        break;
      case 'INVALID_PAIR':
      case 'INVALID_URL':
        handleError(errorMessage, inputSection);
        break;
      default:
        break;
    }
  });

  return results;
}

export function stringifyListForExcel(urls) {
  return urls.reduce((rdx, url) => `${rdx}${url[0]}\t${url[1]}\n`, '');
}

export default async function init(el) {
  const xlPath = './locale-config.json';
  const resp = await fetch(xlPath);
  if (!resp.ok) return;
  const { data } = await resp.json();

  const redirectsContainer = createTag('section', { class: 'redirects-container' });
  const header = createTag('h1', null, 'Redirect Formatting Tool');
  const instructions = createTag('p', { class: 'instructions' }, INSTRUCTIONS_TEXT);
  const errorSection = createTag('p', { class: 'error' });

  // Checkboxes
  const checkBoxesHeader = createTag('p', { class: 'cb-label' });
  checkBoxesHeader.innerText = 'Select Locales';
  const checkBoxes = await createLocaleCheckboxes(data);
  const checkBoxesContainer = createTag('div', { class: 'checkbox-container' }, checkBoxes);
  const selectAllCB = createTag('button', { class: 'select-all-cb' }, SELECT_ALL_REGIONS);
  const checkBoxesArea = createTag('section', { class: 'cb-area' }, [checkBoxesHeader, selectAllCB, checkBoxesContainer]);
  checkBoxesContainer.addEventListener('change', () => clearError(checkBoxesContainer));

  // Text input area
  const inputAreaContainer = createTag('section', { class: 'input-container' });
  const textAreaInput = createTag('textarea', { class: 'redirects-text-area', id: 'redirects-input', name: 'redirects-input' });
  const taiLabel = createTag('label', { class: 'io-label', for: 'redirects-input' }, INPUT_LABEL_TEXT);
  const submitButton = createTag('button', { class: 'process-redirects' }, PROCESS_TEXT);
  inputAreaContainer.append(taiLabel, submitButton, textAreaInput);
  inputAreaContainer.addEventListener('change', () => clearError(textAreaInput));

  // Text output Area
  const outputAreaContainer = createTag('section', { class: 'output-container' });
  const textAreaOutput = createTag('textarea', { class: 'redirects-text-area', id: 'redirects-output', name: 'redirects-output', readonly: true });
  const taoLabel = createTag('label', { class: 'io-label', for: 'redirects-output' }, OUTPUT_LABEL_TEXT);
  const copyButton = createTag('button', { class: 'copy' }, COPY_TO_CLIPBOARD);
  outputAreaContainer.append(taoLabel, copyButton, textAreaOutput);

  // Event listeners
  selectAllCB.addEventListener('click', () => {
    clearError(selectAllCB);
    const allNotSelected = selectAllCB.innerText === SELECT_ALL_REGIONS;

    document.querySelectorAll('.locale-checkbox').forEach((cb) => {
      cb.checked = allNotSelected;
      clearError(checkBoxesContainer);
    });

    selectAllCB.innerText = allNotSelected ? DESELECT_ALL_REGIONS : SELECT_ALL_REGIONS;
  });

  submitButton.addEventListener('click', () => {
    const locales = [...document.querySelectorAll("[type='checkbox']")].reduce((rdx, cb) => {
      if (cb.checked) {
        rdx.push(cb.id);
      }
      return rdx;
    }, []);

    const parsedInput = parseUrlString(textAreaInput.value);
    const redirList = handleRedirectGeneration(parsedInput, locales);
    const outputString = stringifyListForExcel(redirList);

    textAreaOutput.value = outputString;
  });

  copyButton.addEventListener('click', async () => {
    if (!navigator?.clipboard) return;
    const redirects = textAreaOutput.value;
    if (!redirects) return;
    try {
      await navigator.clipboard.writeText(redirects);
      copyButton.innerText = 'Copied';
    } catch (error) {
      copyButton.innerText = 'Error!';
    } finally {
      setTimeout(() => {
        copyButton.innerText = COPY_TO_CLIPBOARD;
      }, 1500);
    }
  });

  redirectsContainer.append(checkBoxesArea, inputAreaContainer, outputAreaContainer);
  el.append(header, instructions, errorSection, redirectsContainer);
}
