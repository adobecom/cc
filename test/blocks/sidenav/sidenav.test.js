import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import { setLibs } from '../../../creativecloud/scripts/utils.js';

setLibs('/libs');

document.body.innerHTML = await readFile({ path: './mocks/sidenav.html' });
const { default: init } = await import('../../../creativecloud/blocks/sidenav/sidenav.js');

describe('Sidenav', () => {
  it('creates 1 level of items for shallow nav', async () => {
    const sidenavEl = document.querySelector('.sidenav.shallow');
    await init(sidenavEl);
    const items = sidenavEl.querySelectorAll('sp-sidenav-item');
    expect(items.length).to.equal(3);
  });

  it('creates 2 levels of items for deep nav', async () => {
    const sidenavEl = document.querySelector('.sidenav.multilevel');
    await init(sidenavEl);
    const items = sidenavEl.querySelectorAll('sp-sidenav-item');
    expect(items.length).to.equal(12);
  });

  it('has a title for each item', async () => {
    const sidenavEl = document.querySelector('.sidenav.shallow');
    const rootElement = sidenavEl.querySelector('filter-sidenav');
    expect(rootElement.getAttribute('title')).to.equal('Categories');
  });
});
