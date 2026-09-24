import { expect, test } from '@playwright/test';
import { features } from './merchtable.spec.js';
import Merchtable from './merchtable.page.js';

let merchtable;
test.describe('verify merch table colum layout, headings, CSS styles, images rendering, price CTAs', () => {
  test.beforeEach(async ({ page }) => {
    merchtable = new Merchtable(page);
  });
  // Test merch table block to be shown 3 column layout when placed on page
  test(`${features[0].name},${features[0].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[0].path}`);
    await test.step('merch table should have 3 column layout when authored', async () => {
      await page.goto(`${baseURL}${features[0].path}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(`${baseURL}${features[0].path}`);
    });
    await test.step('step-2: 3 columns should showup with memonics', async () => {
      await expect(merchtable.merchTableSection).toBeVisible();
      await expect(merchtable.firstColumn).toBeVisible();
      await expect(merchtable.secondColumn).toBeVisible();
      await expect(merchtable.thirdColumn).toBeVisible();
      await expect(merchtable.productMnemonics).toBeVisible();
    });
  });

  // Test merch table first row in the 3 column has heading
  test(`${features[1].name},${features[1].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[1].path}`);
    await test.step('merch table first row in the 3 column has product headings', async () => {
      await page.goto(`${baseURL}${features[1].path}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(`${baseURL}${features[1].path}`);
    });
    await test.step('step-2: 3 columns first row is head column', async () => {
      await expect(merchtable.fixedColumnheading).toBeVisible();
      await expect(merchtable.firstColumnHeading).toBeVisible();
      await expect(merchtable.secondColumnHeading).toBeVisible();
      await expect(merchtable.thirdColumnHeading).toBeVisible();
    });
  });

  // Test merch table app details rows in each product column
  test(`${features[2].name},${features[2].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[2].path}`);
    await test.step('merch table had product details in each column', async () => {
      await page.goto(`${baseURL}${features[2].path}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(`${baseURL}${features[2].path}`);
    });
    await test.step('step-2: apps display in the colums as list', async () => {
      await expect(merchtable.appPhotoshop).toBeVisible();
      await expect(merchtable.appFresco).toBeVisible();
      await expect(merchtable.appPhotoshopExpress).toBeVisible();
    });
  });

  // Test buynow navigates to commerce page
  test(`${features[3].name},${features[3].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[3].path}`);
    await test.step('merch table had product details in each column', async () => {
      await page.goto(`${baseURL}${features[3].path}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(`${baseURL}${features[3].path}`);
    });
    await test.step('step-2: CTA go to commerce page', async () => {
      await expect(merchtable.buyNowBtn).toBeVisible();
      await merchtable.buyNowBtn.click();
      await expect(page).toHaveURL(/^https:\/\/commerce\.adobe\.com\//);
    });
  });
});
