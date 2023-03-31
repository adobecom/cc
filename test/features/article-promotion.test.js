import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';

document.head.innerHTML = await readFile({ path: './mocks/head.html' });
document.body.innerHTML = await readFile({ path: './mocks/body.html' });

describe('short form article promotion when metadata is set', () => {
  before(async () => {
    const metaEl = document.querySelector('head meta[name="promotion"]');
    const { default: init } = await import('../../cc/features/article-promotion.js');
    await init(metaEl.content);
  });

  it('adds promotion article content', async () => {
    expect(document.querySelector('.promotion')).to.be.exist;
  });
});
