import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import { setLibs } from '../../../creativecloud/scripts/utils.js';

const { default: init } = await import('../../../creativecloud/blocks/sidenav/sidenav.js');

setLibs('/libs');
const taxoString = await readFile({ path: './mocks/taxonomy.json' });
const taxonomy = JSON.parse(taxoString);
document.body.innerHTML = await readFile({ path: './mocks/sidenav.html' });

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

describe('Sidenav', () => {
  beforeEach(() => {
    window.fetch = sinon.stub().callsFake(() => mockedTaxonomy());
  });

  it('does create nice categories sidenav', async () => {
    const sidenavEl = document.querySelector('.sidenav.categories');
    await init(sidenavEl);
    const newRoot = document.querySelector('merch-sidenav');
    expect(newRoot.title).to.equal("REFINE YOUR RESULTS");
    const items = newRoot.querySelectorAll('sp-sidenav-item');
    expect(items.length).to.equal(24);
    const search = newRoot.querySelector('sp-search');
    expect(search.getAttribute('placeholder')).to.equal('Search all your products');
    expect(newRoot.querySelectorAll('sp-checkbox').length).to.equal(3);
    expect(newRoot.querySelector('sp-checkbox').textContent.trim()).to.equal('Desktop');
  });
});
