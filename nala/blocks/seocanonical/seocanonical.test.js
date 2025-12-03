import { expect, test } from '@playwright/test';
import { features } from './seocanonical.spec.js';
import Seo from './seocanonical.page.js';

let seo;
test.describe('SEO Canonical Tests', () => {
  test.beforeEach(async ({ page }) => {
    seo = new Seo(page);
  });
  test(`${features[0].name},${features[0].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[0].path}`);
    await test.step('SEO Canonical Tag is present in CC home page', async () => {
      await page.goto(`${baseURL}${features[0].path}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(`${baseURL}${features[0].path}`);
    });
    await test.step('SEO Canonical Tag is present CC home page US locale', async () => {
      await page.waitForLoadState();
      expect(await seo.seoCanonicalLink).toBeTruthy();
    });
  });

  test(`${features[1].name},${features[1].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[1].path}`);
    await test.step('SEO Canonical Tag is present in photoshop home page', async () => {
      await page.goto(`${baseURL}${features[1].path}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(`${baseURL}${features[1].path}`);
    });
    await test.step('SEO Canonical Tag is present photoshop US locale page', async () => {
      await page.waitForLoadState();
      expect(await seo.seoCanonicalLink).toBeTruthy();
    });
  });
});
