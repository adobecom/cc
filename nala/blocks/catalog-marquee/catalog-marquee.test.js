import { expect, test } from '@playwright/test';
import { features } from './catalog-marquee.spec.js';
import CatalogMarquee from './catalog-marquee.page.js';

let catalogMarquee;
test.describe('catalog-marquee mnemonic-list', () => {
  test.beforeEach(async ({ page }) => {
    catalogMarquee = new CatalogMarquee(page);
  });

  test(`${features[0].name},${features[0].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[0].path}`);
    await test.step('open the catalog page', async () => {
      await page.goto(`${baseURL}${features[0].path}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(`${baseURL}${features[0].path}`);
    });
    await test.step('mnemonic-list product titles render at XS font size (18px)', async () => {
      await page.waitForLoadState();
      await expect(catalogMarquee.mnemonicList).toBeVisible();
      await expect(catalogMarquee.productItemTitle).toBeVisible();
      await expect(catalogMarquee.productItemTitle).toHaveCSS('font-size', '18px');
    });
  });
});
