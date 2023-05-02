import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';

document.body.innerHTML = await readFile({ path: './mock.html' });

describe('checkmark-cta', () => {
  before(async () => {
    const el = document.querySelector('.checkmark-cta');
    const { default: init } = await import('../../../creativecloud/blocks/checkmark-cta/checkmark-cta.js');
    init(el);
  });

  it('creates a checkbox and a label', async () => {
    expect(document.querySelector('label input[type="checkbox"]')).to.exist;
  });

  it('disables the CTA', async () => {
    expect(document.querySelector('a[aria-disabled="true"]')).to.exist;
  });
});
