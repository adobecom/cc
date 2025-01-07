import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';

function delay(ms) {
  return new Promise((res) => { setTimeout(() => { res(); }, ms); });
}

document.body.innerHTML = await readFile({ path: './mocks/body.html' });
document.head.innerHTML = await readFile({ path: './mocks/head.html' });
describe('Scripts', () => {
  before(async () => {
    const { scriptInit } = await import('../../creativecloud/scripts/utils.js');
    scriptInit();
    delay(200);
  });

  it('First image should eager load', () => {
    expect(document.querySelector('.interactive-marquee img').loading).to.equal('eager');
  });

  it('Replaced dot media', () => {
    expect(document.querySelector('.interactive-marquee img[src*="./media_"]')).to.be.null;
  });

  it('Check domain switch regexp', () => {
    const regex = /www\.adobe\.com(?!\/*\S*\/(mini-plans|plans-fragments\/modals)\/\S*)/;
    // should not switch domain
    expect(regex.test('https://www.adobe.com/mini-plans/photoshop.html?mid=ft&web=1')).to.false;
    expect(regex.test('https://www.adobe.com/de/mini-plans/photoshop.html?mid=ft&web=1')).to.false;
    expect(regex.test('https://www.adobe.com/plans-fragments/modals/business/modals-content-rich/all-apps/master.modal.html')).to.false;
    expect(regex.test('https://www.adobe.com/fr/plans-fragments/modals/business/modals-content-rich/all-apps/master.modal.html')).to.false;
    // should switch domain
    expect(regex.test('https://www.adobe.com/fr/plans-fragments/business/modals-content-rich/all-apps/master.modal.html')).to.true;
    expect(regex.test('https://www.adobe.com/de/mega-plans/photoshop.html?mid=ft&web=1')).to.true;
    expect(regex.test('https://www.adobe.com/creativecloud/plans.html')).to.true;
    expect(regex.test('https://www.adobe.com/products/catalog.html')).to.true;
    expect(regex.test('https://www.adobe.com/creativecloud/whats-included/plans/cct-all-apps-whats-included.html')).to.true;
    expect(regex.test('https://www.adobe.com/de/creativecloud/whats-included/plans/cct-all-apps-whats-included.html')).to.true;
  });
});
