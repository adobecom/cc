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
    await init(block, '?offer_selector_ids=x-TQSF1eZiZ637gnd_GgfN1c7W0Ksj2FG7gJwxCHCjY&locale=en_US&promotion_code=COM_CCSN_STOCKPD&country=CY&service_providers=PROMO_TERMS&landscape=draft&env=stage');
    expect(document.querySelector('.universal-promo-terms').textContent).to.not.equal('false');
  });
});
