import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';

document.body.innerHTML = await readFile({ path: './mocks/body.html' });

describe('promotion', () => {
  before(async () => {
    const el = document.querySelector('.promotion');
    const { default: init } = await import('../../../cc/blocks/promotion/promotion.js');
    await init(el, '/test/blocks/promotion/mocks');
  });

  it('adds promotion article content', async () => {
    expect(document.querySelector('.promotion').querySelector('.promotion')).to.be.exist;
  });
});
