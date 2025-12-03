import { expect, test } from '@playwright/test';
import { features } from './photoshop-unity.spec.js';
import CCPhotoshopUnity from './photoshop-unity.page.js';

let ccPhotoshopUnity;

test.describe('Verify Photoshop Unity Widget functionality on Stage', () => {
  test.beforeEach(async ({ page }) => {
    ccPhotoshopUnity = new CCPhotoshopUnity(page);
  });
  // close the page after each test
  test.afterEach(async ({ page }) => {
    await page.close();
  });

  // check the page load and UI elements
  test(`${features[0].name}, ${features[0].tags}`, async ({ page, baseURL }) => {
    console.log(`Running test: ${features[0].name}`);
    await test.step('Check page load and UI elements', async () => {
      await page.goto(`${baseURL}${features[0].path}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(`${baseURL}${features[0].path}`);
      await expect(ccPhotoshopUnity.uploadButton).toBeTruthy();
      await expect(ccPhotoshopUnity.dropZone).toBeVisible();
      await expect(ccPhotoshopUnity.dragAndDropText).toBeVisible();
      await expect(ccPhotoshopUnity.videoElement).toBeVisible();
      await expect(ccPhotoshopUnity.dropZoneParagraph).toBeVisible();
      await expect(ccPhotoshopUnity.uploadDisclaimer).toBeVisible();
    });
  });
});
