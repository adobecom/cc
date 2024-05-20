import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import { decorateArea } from '../../creativecloud/scripts/utils.js';

describe('Scripts for existing meta', () => {
  before(async () => {
    document.head.innerHTML = await readFile({ path: './mocks/meta.html' });
    decorateArea();
  });

  it('Read last product from session storage', () => {
    expect(window.sessionStorage.getItem('last_primary_product')).to.equal('photoshop');
  });
});

describe('Scripts for non-existing meta', () => {
  before(async () => {
    window.sessionStorage.setItem('last_primary_product', 'photoshop');
    document.head.innerHTML = await readFile({ path: './mocks/nometa.html' });
    decorateArea();
  });

  it('Remove last product from session storage', async () => {
    expect(window.sessionStorage.getItem('last_primary_product')).to.be.null;
  });
});
