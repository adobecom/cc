import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';

document.body.innerHTML = await readFile({ path: './mocks/body.html' });
const { default: init } = await import('../../../creativecloud/blocks/universal-promo-terms/universal-promo-terms.js');

describe('universal-promo-terms', () => {
  const block = document.body.querySelector('.universal-promo-terms');
  beforeEach(() => {
    sinon.spy(console, 'log');
  });

  afterEach(() => {
    console.log.restore();
  });

  it('Get API from query parameters', async () => {
    await init(block, '?offer_id=1B365A793986BBEEE26F3E372BDAAB09&locale=de_DE&promotion_code=fixed_dis_20&country=DE&env=stage');
    expect(document.querySelector('.universal-promo-terms').textContent).to.not.equal('false');
  });
});
