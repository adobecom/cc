import { expect } from '@playwright/test';

export default class seocanonical {
  constructor(page) {
    this.page = page;
    this.seoCanonicalLink = page.locator('//link[@rel="canonical"]');
  }

  async checkPage() {
    expect(await this.seoCanonicalLink).toBeTruthy();
  }
}
