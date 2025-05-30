import { runTests } from '@web/test-runner-mocha';

import { expect } from '@esm-bundle/chai';

import sinon from 'sinon';

const { updateCatalogLh, enableAnalytics } = await import('../../../creativecloud/blocks/catalog/catalog.js');

const dispatchEvent = (container, name, value) => {
  const detail = typeof (value) === 'string' ? { value } : value;
  container.dispatchEvent(new CustomEvent(name, {
    bubbles: true,
    composed: true,
    detail,
  }));
};

runTests(async () => {
  describe('Catalog', () => {
    it('updates catalog block lh attribute depending on selected value, and current attribute value', async () => {
      const catalogEl = document.querySelector('.catalog');
      updateCatalogLh(catalogEl, 'all');
      expect(catalogEl.getAttribute('daa-lh')).to.equal('all');
      catalogEl.setAttribute('daa-lh', 'all');
      updateCatalogLh(catalogEl, 'photo');
      expect(catalogEl.getAttribute('daa-lh')).to.equal('photo');
    });

    it('enable working analytics', () => {
      const catalogEl = document.querySelector('.catalog');
      const sidenav = document.querySelector('.sidenav');
      sidenav.search = document.querySelector('.search');
      sidenav.filters = document.querySelector('.filters');
      const merchCards = document.querySelector('.merch-cards');
      const card = merchCards.querySelector('merch-card[name=photoshop]');
      card.name = 'photoshop';
      const buyLink = card.querySelector('a');
      // eslint-disable-next-line no-underscore-dangle
      window._satellite = { track: (obj) => console.log(`tracking ${obj}`) };
      // eslint-disable-next-line no-underscore-dangle
      const satelliteSpy = sinon.spy(window._satellite, 'track');
      enableAnalytics(catalogEl, merchCards, sidenav);
      expect(buyLink.getAttribute('daa-ll')).to.equal('Buy Now--photoshop');
      dispatchEvent(sidenav.search, 'merch-search:change', 'photoshop');
      dispatchEvent(merchCards, 'merch-card-collection:sort', 'popularity');
      dispatchEvent(merchCards, 'merch-card-collection:showmore', undefined);
      dispatchEvent(card, 'merch-card:action-menu-toggle', { card: card.name });
      card.querySelector('merch-icon').click();
      expect(satelliteSpy.getCall(0).args[1]).to.deep.equal({ xdm: {}, data: { web: { webInteraction: { name: 'photoshop--search|photo|nopzn|catalog' } } } });
      expect(satelliteSpy.getCall(1).args[1]).to.deep.equal({ xdm: {}, data: { web: { webInteraction: { name: 'popularity--sort|photo' } } } });
      expect(satelliteSpy.getCall(2).args[1]).to.deep.equal({ xdm: {}, data: { web: { webInteraction: { name: 'showmore|photo' } } } });
      expect(satelliteSpy.getCall(3).args[1]).to.deep.equal({ xdm: {}, data: { web: { webInteraction: { name: 'menu-toggle--photoshop|photo' } } } });
      expect(satelliteSpy.getCall(4).args[1]).to.deep.equal({ xdm: {}, data: { web: { webInteraction: { name: 'merch-icon-click--photoshop|photo' } } } });
      sidenav.filters.selectedValue = 'photo';
      dispatchEvent(sidenav.filters, 'merch-sidenav:select', undefined);
      expect(satelliteSpy.getCall(5).args[1]).to.deep.equal({ xdm: {}, data: { web: { webInteraction: { name: 'photo--cat|photo|nopzn|catalog' } } } });
      sidenav.filters.selectedValue = 'illustration';
      dispatchEvent(sidenav.filters, 'merch-sidenav:select', undefined);
      expect(satelliteSpy.getCall(6).args[1]).to.deep.equal({ xdm: {}, data: { web: { webInteraction: { name: 'illustration--cat|illustration|nopzn|catalog' } } } });
    });
  });
});
