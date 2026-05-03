export default class CatalogMarquee {
  constructor(page) {
    this.page = page;
    this.catalogMarquee = page.locator('.catalog-marquee').first();
    this.mnemonicList = this.catalogMarquee.locator('.mnemonic-list');
    this.productItemTitle = this.mnemonicList.locator('.product-list .product-item strong').first();
  }
}
