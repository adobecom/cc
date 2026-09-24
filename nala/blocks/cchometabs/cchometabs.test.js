import { expect, test } from '@playwright/test';
import { features } from './cchometabs.spec.js';
import Tabsfeature from './cchometabs.page.js';

let tabs;
test.describe('verify the tabs UI and funcationality in CC home page', () => {
  test.beforeEach(async ({ page }) => {
    tabs = new Tabsfeature(page);
  });
  // check the tabs shows up with authored tab names in its container
  test(`${features[0].name},${features[0].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[0].path}`);
    await test.step('tabs display in cc home page', async () => {
      await page.goto(`${baseURL}${features[0].path}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(`${baseURL}${features[0].path}`);
    });
    await test.step('tabs shows up with authored tabs in cc home page', async () => {
      await expect(tabs.tabsBlock).toBeVisible();
      await expect(tabs.tabsList).toBeVisible();
      await expect(tabs.firstTab).toBeVisible();
      await expect(tabs.secondTab).toBeVisible();
      await expect(tabs.thirdTab).toBeVisible();
      await expect(tabs.fourthTab).toBeVisible();
    });
  });

  // check tabs showup with default first tab enabled
  test(`${features[1].name},${features[1].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[1].path}`);
    await test.step('tabs container defalut select first tab', async () => {
      await page.goto(`${baseURL}${features[1].path}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(`${baseURL}${features[1].path}`);
    });
    await test.step('under tabs container defalut select first tab', async () => {
      await expect(tabs.tabsBlock).toBeVisible();
      await expect(tabs.tabsList).toBeVisible();
      await expect(tabs.defaultSelectedTab).toBeVisible();
    });
  });

  // switching feature between tabs working
  test(`${features[2].name},${features[2].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[2].path}`);
    await test.step('switching feature between tabs working', async () => {
      await page.goto(`${baseURL}${features[2].path}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(`${baseURL}${features[2].path}`);
    });
    await test.step('switching feature between tabs working as expected', async () => {
      await expect(tabs.tabsBlock).toBeVisible();
      await expect(tabs.tabsList).toBeVisible();
      await expect(tabs.firstBodyHeading).toBeVisible();
      await tabs.secondTab.click();
      await expect(tabs.secondBodyHeading).toBeVisible();
      await tabs.thirdTab.click();
      await expect(tabs.thirdBodyHeading).toBeVisible();
      await tabs.fourthTab.click();
      await expect(tabs.fourthBodyHeading).toBeVisible();
    });
  });

  // switching feature between tabs working
  test(`${features[3].name},${features[3].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[3].path}`);
    await test.step('switching feature between tabs working', async () => {
      await page.goto(`${baseURL}${features[3].path}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(`${baseURL}${features[3].path}`);
    });
    await test.step('switching feature between tabs working as expected', async () => {
      await expect(tabs.tabsList).toBeVisible();
      await tabs.thirdTab.click();
      await expect(tabs.thirdTabContent).toBeVisible();
      await tabs.firstTab.click();
      await expect(tabs.firstTabContent).toBeVisible();
    });
  });
});
