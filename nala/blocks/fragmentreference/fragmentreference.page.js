export default class fragmentreference {
  constructor(page) {
    this.page = page;
    // cc pages have fragment references
    this.pageFragment = page.locator('.fragment').first();
    this.fragmentHeading = this.pageFragment.locator('h2#pick-a-plan-to-start-creating');
    this.fragmentSection = this.pageFragment.locator('.tabpanel:not([hidden])').first();
    this.fragmentProduct1 = this.fragmentSection.locator('//merch-card[@name="CC Mini Compare: Single App: Individuals: intro-pricing"]');
    this.fragmentProduct2 = this.fragmentSection.locator('//merch-card[@name="CC Mini Compare: Creative Cloud Pro: Individuals: default"]');
  }
}
