import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';

document.body.innerHTML = await readFile({ path: './mocks/genfill.html' });
const { setLibs } = await import('../../../creativecloud/scripts/utils.js');
const { default: init } = await import('../../../creativecloud/blocks/interactive-marquee/interactive-marquee.js');

describe('genfill variant of interactive marquee', () => {
  const im = document.querySelector('.interactive-marquee');
  before(async () => {
    setLibs('https://milo.adobe.com/libs');
    await init(im);
  });
  it('desktop media should exist', () => {
    const desktop = im.querySelector('.desktop-only');
    expect(desktop).to.exist;
  });
  it('tablet media should exist', () => {
    const tablet = im.querySelector('.tablet-only');
    expect(tablet).to.exist;
  });
  it('mobile media should exist', () => {
    const mobile = im.querySelector('.mobile-only');
    expect(mobile).to.exist;
  });
  it('should have proper enticement', () => {
    const ent = im.querySelector('.enticement');
    expect(ent).to.exist;
    expect(ent.querySelector('.enticement-text')).to.exist;
    expect(ent.querySelector('.enticement-arrow')).to.exist;
  });
  it('should implement click functionality', () => {
    const a = im.querySelector('.desktop-only a');
    a.click();
    expect(a.style.display).to.equal('none');
    expect(a.nextElementSibling.style.display).to.equal('block');
    console.log(im);
  });

  it('should call the callback after a delay', async () => {
    const a = im.querySelector('.desktop-only a');
    const clock = await sinon.useFakeTimers();
    clock.tick(1000);
    expect(a.style.display).to.equal('none');
    expect(a.nextElementSibling.style.display).to.equal('block');
    clock.restore();
  });
});