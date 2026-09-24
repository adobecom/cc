export default class merchcard {
  constructor(page) {
    this.page = page;
    // cc page march cards locators
    this.merchCard = page.locator('.merch-card.mini-compare-chart.static-links');
    this.merchProductTitle = this.merchCard.locator('#all-appsprice---abm---creative-cloud-all-apps-100gb');
    this.meachBodyAppText = this.merchCard.locator('//div[@slot="body-m"]');
    this.merchBodyPrice = this.merchCard.locator('.price').nth(1);
    this.mercHeadPrice = this.merchCard.locator('.price').nth(0);
    this.merchActionArea = this.merchCard.locator('.action-area');
    this.merchFooterDiscription = this.merchCard.locator('.footer-row-cell-description').nth(0);
    this.merchFooerIcon = this.merchCard.locator('.footer-row-icon').nth(0);
    this.merchFreeTrialCTA = this.merchCard.locator('.con-button.outline.button-l');
    this.merchBuyNowCTA = this.merchCard.locator('.con-button.blue.button-l.placeholder-resolved');
    this.BestValueBadge = page.locator('//merch-card[@badge-text="Best value"]');
    this.ccAllappsPrice = this.merchCard.locator('h3.card-heading .price');
  }
}
