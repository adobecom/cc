import { runTests } from '@web/test-runner-mocha';
import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import { setLibs } from '../../../creativecloud/scripts/utils.js';

setLibs('/node_modules/@adobecom/milo/libs', true);

const { default: init } = await import('../../../creativecloud/blocks/catalog/catalog.js');

const taxoString = await readFile({ path: '../sidenav/mocks/taxonomy.json' });
const taxonomy = JSON.parse(taxoString);

const mockedTaxonomy = ({
  payload = taxonomy,
  status = 200, ok = true,
} = {}) => new Promise((resolve) => {
  resolve({
    status,
    ok,
    json: () => payload,
    text: () => payload,
  });
});

runTests(async () => {
  describe('Catalog', () => {
    beforeEach(() => {
      window.fetch = sinon.stub().callsFake(() => mockedTaxonomy());
    });

    it.skip('does sub blocks with good analytics attributes', async () => {
      const element = document.querySelector('.catalog');
      const catalog = await init(element);
      const sidenav = catalog.querySelector('merch-sidenav');
      const collection = catalog.querySelector('merch-card-collection');
      expect(sidenav.getAttribute('daa-lh')).to.equal('b1|catalog-filter');
      expect(collection.getAttribute('daa-lh')).to.equal('b2|catalog-collection');
    });
  });
});
