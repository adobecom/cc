import { expect, test } from '@playwright/test';
import { features } from './fragmentreference.spec.js';
import Fragments from './fragmentreference.page.js';

let fragment;
test.describe('verify fragment references are working in CC pages', () => {
  test.beforeEach(async ({ page }) => {
    fragment = new Fragments(page);
  });
  // Check fragments are referenced and shows in CC pages
  test(`${features[0].name},${features[0].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[0].path}`);
    await test.step('fragment reference display in cc home page', async () => {
      await page.goto(`${baseURL}${features[0].path}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(`${baseURL}${features[0].path}`);
    });
    await test.step('fragment shows up in page from its reference', async () => {
      // the fragment block stays hidden until its remote content finishes loading and decorating
      await expect(fragment.pageFragment).toBeVisible({ timeout: 15000 });
      await expect(fragment.fragmentHeading).toBeVisible({ timeout: 15000 });
      await expect(fragment.fragmentSection).toBeVisible({ timeout: 15000 });
      // merch-card content loads pricing data asynchronously and can take longer than the default timeout
      await expect(fragment.fragmentProduct1).toBeVisible({ timeout: 15000 });
      await expect(fragment.fragmentProduct2).toBeVisible({ timeout: 15000 });
    });
  });
});
