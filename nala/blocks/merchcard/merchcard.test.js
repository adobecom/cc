import { expect, test } from '@playwright/test';
import { features } from './merchcard.spec.js';
import Merchcard from './merchcard.page.js';

let merchcard;
test.describe('verify merch card UI and its features', () => {
  test.beforeEach(async ({ page }) => {
    merchcard = new Merchcard(page);
  });
  // Test merch card UI
  test(`${features[0].name},${features[0].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[0].path}`);
    await test.step('merch card UI elements check', async () => {
      await page.goto(`${baseURL}${features[0].path}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(`${baseURL}${features[0].path}`);
    });
    await test.step('verify merch card UI and its section elements', async () => {
      await expect(merchcard.merchCard).toBeVisible();
      await expect(merchcard.merchProductTitle).toBeVisible();
      await expect(merchcard.meachBodyAppText).toBeVisible();
      await expect(merchcard.merchActionArea).toBeVisible();
      await expect(merchcard.merchFooterDiscription).toBeVisible();
      await expect(merchcard.merchFooerIcon).toBeVisible();
      await expect(merchcard.BestValueBadge).toBeVisible();
    });
  });
  // price, CTA buttons and its navigation to correct commerce pages
  test(`${features[1].name},${features[1].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[1].path}`);
    await test.step('free, buy CTAs with valid navigation', async () => {
      await page.goto(`${baseURL}${features[1].path}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(`${baseURL}${features[1].path}`);
    });
    await test.step('free, buynow price cta should work as expected navigation', async () => {
      await expect(merchcard.merchBodyPrice).toBeVisible();
      await expect(merchcard.mercHeadPrice).toBeVisible();
      await expect(merchcard.mercHeadPrice).toHaveText(/\d+([.,]\d+)+\/mo/);
      await expect(merchcard.merchBodyPrice).toHaveText(/\d+([.,]\d+)+/);
      await merchcard.merchBuyNowCTA.click();
      await expect(page).toHaveURL(/^https:\/\/commerce\.adobe\.com\//);
    });
  });
  // merch card reference from fragment and all product listed prices are shown
  test(`${features[2].name},${features[2].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[2].path}`);
    await test.step('merch card should display when refenced from fragment', async () => {
      await page.goto(`${baseURL}${features[2].path}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(`${baseURL}${features[2].path}`);
    });
    await test.step('all prices are showing in merch cards', async () => {
      await expect(merchcard.ccAllappsPrice).toBeVisible();
      await expect(merchcard.ccAllappsPrice).toHaveText(/\d+([.,]\d+)+\/mo/);
    });
  });
});
