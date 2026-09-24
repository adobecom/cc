import { expect, test } from '@playwright/test';
import { features } from './accordion.spec.js';
import Accordion from './accordion.page.js';

let accordion;
test.describe('verify accordion showing up with authored question and answers with expand/collapse features', () => {
  test.beforeEach(async ({ page }) => {
    accordion = new Accordion(page);
  });

  // Verify accordion showing up with authored question and answers and UI
  test(`${features[0].name},${features[0].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[0].path}`);
    await test.step('accordion UI', async () => {
      await page.goto(`${baseURL}${features[0].path}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(`${baseURL}${features[0].path}`);
    });
    await test.step('accordion ui with expected elements', async () => {
      await expect(accordion.accordionSection).toBeVisible();
      await expect(accordion.accordionName).toBeVisible();
      await expect(accordion.accordionQuestion1).toBeVisible();
      await expect(accordion.accordionDefinition1).toBeVisible();
      await expect(accordion.accordionQuestion2).toBeVisible();
      await expect(accordion.accordionDefinition2).toBeVisible();
      await expect(accordion.DefaultState).toBeVisible();
    });
  });

  // check the expand feature when click on first question
  test(`${features[1].name},${features[1].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[1].path}`);
    await test.step('accordion expand on first question click', async () => {
      await page.goto(`${baseURL}${features[1].path}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(`${baseURL}${features[1].path}`);
    });
    await test.step('accordion expand when first question clicked', async () => {
      await expect(accordion.accordionName).toBeVisible();
      await expect(accordion.accordionQuestion1).toBeVisible();
      await expect(accordion.accordionDefinition1).toBeVisible();
      await accordion.accordionQuestion1.click();
      await expect(accordion.accordexpanded).toBeVisible();
    });
  });

  // check the collapse feature when click on first question
  test(`${features[2].name},${features[2].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[2].path}`);
    await test.step('accordion collapse on first question click', async () => {
      await page.goto(`${baseURL}${features[2].path}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(`${baseURL}${features[2].path}`);
    });
    await test.step('accordion collapse when first question in expanded form', async () => {
      await expect(accordion.accordionName).toBeVisible();
      await expect(accordion.accordionQuestion1).toBeVisible();
      await expect(accordion.accordionDefinition1).toBeVisible();
      await accordion.accordionQuestion1.click();
      await expect(accordion.accordexpanded).toBeVisible();
      await accordion.accordionQuestion1.click();
      await expect(accordion.DefaultState).toBeVisible();
    });
  });

  // check the links are functional in the question summary
  test(`${features[3].name},${features[3].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[3].path}`);
    // const { url } = features[3];
    await test.step('links are functional in the question summary', async () => {
      await page.goto(`${baseURL}${features[3].path}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(`${baseURL}${features[3].path}`);
    });
    await test.step('links are functional in the given answers', async () => {
      await expect(accordion.accordionQuestion1).toBeVisible();
      await expect(accordion.accordionDefinition1).toBeVisible();
      await accordion.accordionQuestion1.click();
      await expect(accordion.accordexpanded).toBeVisible();
      await accordion.firstQuestionLink.click();
      // await expect(page).toHaveURL(url);
    });
  });
});
