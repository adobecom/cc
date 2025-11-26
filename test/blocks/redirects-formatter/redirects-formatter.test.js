import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';

const {
  default: init,
  parseUrlString,
  generateRedirectList,
  stringifyListForExcel,
  SELECT_ALL_REGIONS,
  DESELECT_ALL_REGIONS,
  NO_LOCALE_ERROR,
} = await import('../../../creativecloud/blocks/redirects-formatter/redirects-formatter.js');
const { htmlIncluded, htmlExcluded, externalUrls, mixedSpaceTabUrls } = await import('./mocks/textAreaValues.js');

describe('Redirects Formatter', () => {
  const ogFetch = window.fetch;

  beforeEach(async () => {
    document.body.innerHTML = await readFile({ path: './mocks/redirects-formatter.html' });

    const block = document.querySelector('.redirects-formatter');

    sinon.stub(window, 'fetch');
    const fetchText = await readFile({ path: './mocks/locale-config.json' });
    const res = new window.Response(fetchText, { status: 200 });
    window.fetch.returns(Promise.resolve(res));

    await init(block);
  });

  afterEach(async () => {
    window.fetch = ogFetch;
  });

  it('correctly parses values from the input', () => {
    const parsedInput = parseUrlString(htmlIncluded);
    const firstPair = parsedInput[0];
    const lastPair = parsedInput[2];
    expect(firstPair[0]).to.equal('https://www.adobe.com/products/photoshop.html');
    expect(firstPair[1]).to.equal('https://www.adobe.com/creativecloud/photography.html');
    expect(lastPair[0]).to.equal('https://www.adobe.com/products/firefly.html');
    expect(lastPair[1]).to.equal('https://www.adobe.com/products/illustrator.html');
  });

  it('correctly parses values from the input with a mix of tabs and spaces', () => {
    const parsedInput = parseUrlString(mixedSpaceTabUrls);
    const firstPair = parsedInput[0];
    const lastPair = parsedInput[2];
    expect(firstPair[0]).to.equal('https://www.adobe.com/products/photoshop.html');
    expect(firstPair[1]).to.equal('https://www.adobe.com/creativecloud/photography.html');
    expect(lastPair[0]).to.equal('https://www.adobe.com/products/firefly.html');
    expect(lastPair[1]).to.equal('https://www.adobe.com/products/illustrator.html');
  });

  it('outputs localized urls', () => {
    const parsedInput = parseUrlString(htmlIncluded);
    const locales = ['ar', 'au', 'uk'];

    const { results, errors } = generateRedirectList(parsedInput, locales);

    expect(errors.length).to.equal(0);
    expect(results[0][0]).to.equal('/ar/products/photoshop');
    expect(results.length).to.equal(9);
  });

  it('provides a string formatted for pasting into excel', () => {
    const parsedInput = parseUrlString(htmlIncluded);
    const locales = ['ar', 'au', 'uk'];

    const { results, errors } = generateRedirectList(parsedInput, locales);
    const stringList = stringifyListForExcel(results);

    expect(errors.length).to.equal(0);
    expect(typeof stringList).to.equal('string');
    expect(stringList.substring(0, 4)).to.equal('/ar/');
    expect(stringList.substring(stringList.length - 6)).to.equal('.html\n');
  });

  it('adds .html to the end of the string in output', () => {
    expect(htmlExcluded.substring(htmlExcluded.lastIndexOf('/') + 1)).to.equal('illustrator');
    const parsedInput = parseUrlString(htmlExcluded);
    const locales = ['ar', 'au', 'uk'];

    const { results, errors } = generateRedirectList(parsedInput, locales);
    const stringList = stringifyListForExcel(results);

    expect(errors.length).to.equal(0);
    expect(typeof stringList).to.equal('string');
    expect(stringList.substring(0, 4)).to.equal('/ar/');
    expect(stringList.substring(stringList.length - 6)).to.equal('.html\n');
  });

  it('does not add .html to the end of the string in output for external urls', () => {
    expect(externalUrls.trim().substring(externalUrls.trim().lastIndexOf('/') + 1)).to.equal('premiere');

    const parsedInput = parseUrlString(externalUrls);
    const locales = ['ar', 'au', 'uk'];

    const { results, errors } = generateRedirectList(parsedInput, locales);
    const stringList = stringifyListForExcel(results);

    expect(errors.length).to.equal(1);

    expect(typeof stringList).to.equal('string');
    expect(stringList.substring(0, 4)).to.equal('/ar/');
    expect(externalUrls.substring(externalUrls.length - 1)).to.equal('\n');
    expect(externalUrls.includes('.html')).to.be.false;
  });

  it('selects/deselects all the checkboxes on click', async () => {
    const checkBoxes = document.querySelectorAll('.locale-checkbox');
    expect([...checkBoxes].every((cb) => !cb.checked)).to.be.true;

    const selectAllButton = document.querySelector('button');
    selectAllButton.click();

    expect([...checkBoxes].every((cb) => cb.checked)).to.be.true;
    expect(selectAllButton.innerText).to.equal(DESELECT_ALL_REGIONS);

    selectAllButton.click();
    expect([...checkBoxes].every((cb) => !cb.checked)).to.be.true;
    expect(selectAllButton.innerText).to.equal(SELECT_ALL_REGIONS);
  });

  it('informs the user of an error if no locales are selected', async () => {
    const checkBoxes = document.querySelectorAll('.locale-checkbox');
    expect([...checkBoxes].every((cb) => !cb.checked)).to.be.true;

    const processButton = document.querySelector('.process-redirects');
    const errorMessage = document.querySelector('.error');
    const checkBoxContainer = document.querySelector('.checkbox-container');
    processButton.click();
    expect(errorMessage.innerHTML).to.equal(NO_LOCALE_ERROR);
    expect(checkBoxContainer.classList.contains('error-border')).to.be.true;
  });

  it('informs the user of an error if an incorrect url is passed in to the input', async () => {
    const input = document.querySelector('.redirects-text-area');
    const processButton = document.querySelector('.process-redirects');
    const errorMessage = document.querySelector('.error');
    const selectAllCB = document.querySelector('.select-all-cb');
    const correct = 'https://www.adobe.com/resource\thttps://www.adobe.com';
    const incorrect = '/resource\thttps://www.adobe.com';

    selectAllCB.click();
    input.value = correct;
    processButton.click();
    expect(input.classList.contains('error-border')).to.be.false;
    input.value = incorrect;
    processButton.click();
    expect(errorMessage.innerHTML.length > 0).to.be.true;
    expect(input.classList.contains('error-border')).to.be.true;
  });

  it('copies redirects to clipboard when button is clicked (success case)', async () => {
    const textArea = document.querySelector('#redirects-output');
    const copyButton = document.querySelector('.copy');

    // Mock clipboard
    const writeStub = sinon.stub().resolves();
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: writeStub },
    });

    textArea.value = 'sample redirect text';

    copyButton.click();

    expect(writeStub.calledOnceWith('sample redirect text')).to.be.true;
    await new Promise((resolve) => { setTimeout(resolve, 1600); });

    expect(copyButton.innerText).to.equal('Copy to clipboard');
  });

  it('shows error message if clipboard write fails', async () => {
    const textArea = document.querySelector('#redirects-output');
    const copyButton = document.querySelector('.copy');

    // Mock clipboard failure
    const writeStub = sinon.stub().rejects(new Error('fail'));

    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: writeStub },
    });

    textArea.value = 'some text';

    copyButton.click();

    expect(writeStub.calledOnce).to.be.true;
    await new Promise((resolve) => { setTimeout(resolve, 1600); });
    expect(copyButton.innerText).to.equal('Copy to clipboard');
  });

  it('does nothing if clipboard API is missing', () => {
    const textArea = document.querySelector('#redirects-output');
    const copyButton = document.querySelector('.copy');

    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: undefined,
    });

    const spy = sinon.spy();
    textArea.value = 'irrelevant';
    copyButton.addEventListener('click', spy);

    copyButton.click();

    expect(spy.called).to.be.true;
    expect(copyButton.innerText).to.equal('Copy to clipboard');
  });

  it('does nothing if textarea is empty', () => {
    const textArea = document.querySelector('#redirects-output');
    const copyButton = document.querySelector('.copy');

    const writeStub = sinon.stub().resolves();
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: writeStub },
    });

    textArea.value = '';

    copyButton.click();

    expect(writeStub.called).to.be.false;
    expect(copyButton.innerText).to.equal('Copy to clipboard');
  });
});
