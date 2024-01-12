import { runTests } from '@web/test-runner-mocha';
import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import { setLibs } from '../../../creativecloud/scripts/utils.js';

setLibs('/node_modules/@adobecom/milo/libs', true);

const { default: init } = await import('../../../creativecloud/blocks/sidenav/sidenav.js');

const taxoString = await readFile({ path: './mocks/taxonomy.json' });
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
  describe('Sidenav', () => {
    beforeEach(() => {
      window.fetch = sinon.stub().callsFake(() => mockedTaxonomy());
    });

    const testCategorySidenav = async (selector, expectedItemCount, expectedChildItemCount) => {
      const sidenavEl = document.querySelector(selector);
      const newRoot = await init(sidenavEl);
      expect(newRoot.tagName).to.equal('MERCH-SIDENAV');
      expect(newRoot.title).to.equal('REFINE YOUR RESULTS');
      const items = newRoot.querySelectorAll('sp-sidenav-item');
      expect(items.length).to.equal(expectedItemCount);
      const search = newRoot.querySelector('sp-search');
      expect(search.getAttribute('placeholder')).to.equal('Search all your products');
      expect(newRoot.querySelectorAll('sp-checkbox').length).to.equal(3);
      const nestedItems = newRoot.querySelectorAll('sp-sidenav-item > sp-sidenav-item');
      expect(nestedItems.length).to.equal(expectedChildItemCount);
      expect(newRoot.querySelector('sp-checkbox').textContent.trim()).to.equal('Desktop');
    };

    it('does create nice categories default sidenav', async () => {
      await testCategorySidenav('.categories', 24, 18);
    });

    it('does create nice reordered categories sidenav', async () => {
      await testCategorySidenav('.reordered-categories', 17, 11);
    });

    it('does create nice plans sidenav', async () => {
      const sidenavEl = document.querySelector('.plans');
      const newRoot = await init(sidenavEl);
      expect(newRoot.tagName).to.equal('MERCH-SIDENAV');
      expect(newRoot.title).to.equal('REFINE YOUR RESULTS');
      const search = newRoot.querySelector('sp-search');
      expect(search).to.be.null;
      const nestedItems = newRoot.querySelectorAll('sp-sidenav-item > sp-sidenav-item');
      expect(nestedItems.length).to.equal(0);
    });
  });
});
