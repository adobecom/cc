import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';

function delay(ms) {
  return new Promise((res) => { setTimeout(() => { res(); }, ms); });
}

document.body.innerHTML = await readFile({ path: './mocks/body.html' });
document.head.innerHTML = await readFile({ path: './mocks/head.html' });
describe('Scripts', () => {
  before(async () => {
    await import('../../creativecloud/scripts/scripts.js');
    delay(200);
  });

  it('First image should eager load', () => {
    expect(document.querySelector('.interactive-marquee img').loading).to.equal('eager');
  });

  it('Replaced dot media', () => {
    expect(document.querySelector('.interactive-marquee img[src*="./media_"]')).to.be.null;
  });
});
