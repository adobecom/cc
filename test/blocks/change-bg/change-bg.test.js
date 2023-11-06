import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import sinon, { stub } from 'sinon';
import init, { configExcelData, createConfigExcel } from '../../../creativecloud/features/changeBg/changeBg.js';

document.body.innerHTML = await readFile({ path: './mocks/body.html' });
describe('configExcelData', async () => {
  it('should correctly configure the excel data', async () => {
    const data = JSON.parse(await readFile({ path: './mocks/body.json' }));
    const resultdata = JSON.parse(await readFile({ path: './mocks/result.json' }));
    const marquee = document.querySelector('.interactive-marquee');
    const customElem = document.createElement('ft-changebackgroundmarquee');
    init(marquee);
    customElem.config = configExcelData(data);
    createConfigExcel(data, customElem.config);
    expect(customElem.config).to.deep.equal(resultdata);
  });
});

describe('getExcelData', () => {
  it('should fetch data from provided link', async () => {
    const fakeFetch = stub().resolves({ json: () => ({ data: [] }) });
    window.fetch = fakeFetch;
    const fakeLink = 'fakeLink';
    await init({
      querySelectorAll: () => [{ innerText: fakeLink }],
      replaceWith: () => {},
    });
    expect(fakeFetch.calledWith(fakeLink)).to.be.true;
  });
});
