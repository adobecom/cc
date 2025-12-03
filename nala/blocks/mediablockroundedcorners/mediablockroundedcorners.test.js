import { expect, test } from '@playwright/test';
import { features } from './mediablockroundedcorners.spec.js';
import Mediaroundcorners from './mediablockroundedcorners.page.js';

let roundcorners;
test.describe('verify media rounder corners features for media block and its images', () => {
  test.beforeEach(async ({ page }) => {
    roundcorners = new Mediaroundcorners(page);
  });
  test(`${features[0].name},${features[0].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[0].path}`);
    await test.step('media block image with small 4x rounded corners', async () => {
      await page.goto(`${baseURL}${features[0].path}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(`${baseURL}${features[0].path}`);
    });
    await test.step('media block image with small 4x rounded corners style', async () => {
      await page.waitForLoadState();
      await expect(await roundcorners.mediaRoundedCornerImageGroup).toBeTruthy();
      await expect(await roundcorners.image_SmallRoundedCorners).toBeTruthy();
    });
  });
  test(`${features[1].name},${features[1].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[1].path}`);
    await test.step('media block image with medium 8x rounded corners', async () => {
      await page.goto(`${baseURL}${features[1].path}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(`${baseURL}${features[1].path}`);
    });
    await test.step('media block image with Medium 8x rounded corners style', async () => {
      await page.waitForLoadState();
      await expect(await roundcorners.mediaRoundedCornerImageGroup).toBeTruthy();
      await expect(await roundcorners.image_MediumRoundedCorners).toBeTruthy();
    });
  });

  test(`${features[2].name},${features[2].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[2].path}`);
    await test.step('media block image with large 16x rounded corners', async () => {
      await page.goto(`${baseURL}${features[2].path}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(`${baseURL}${features[2].path}`);
    });
    await test.step('media block image with large 16x rounded corners style', async () => {
      await page.waitForLoadState();
      await expect(await roundcorners.mediaRoundedCornerImageGroup).toBeTruthy();
      await expect(await roundcorners.image_LargeRoundedCorners).toBeTruthy();
    });
  });
});
