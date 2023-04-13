import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';

document.head.innerHTML = await readFile({ path: './mocks/head.html' });
document.body.innerHTML = await readFile({ path: './mocks/body.html' });

describe('promotion', () => {
  before(async () => {
    const metaEl = document.querySelector('head meta[name="promotion"]');
    const { default: init } = await import('../../../creativecloud/blocks/promotion/promotion.js');
    await init(metaEl.content, '/test/blocks/promotion/mocks');
  });

  it('adds promotion block', async () => {
    expect(document.querySelector('.promotion')).to.be.exist;
  });

  it('adds promotion article content', async () => {
    expect(document.querySelector('.promotion').querySelector('.promotion')).to.be.exist;
  });
});
