import { readFile, setViewport } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import { setLibs } from '../../../creativecloud/scripts/utils.js';
import waitForElement from '../../helpers/waitForElement.js';

setLibs('/libs');

const { default: init } = await import('../../../creativecloud/blocks/interactive-marquee/interactive-marquee.js');

function delay(ms) {
  return new Promise((res) => { setTimeout(() => { res(); }, ms); });
}

describe('firefly-masonry', () => {
  before(async () => {
    document.body.innerHTML = await readFile({ path: './mocks/masonry-body.html' });
    await init(document.querySelector('.ff-masonry'));
  });

  it('Prompt should exist', async () => {
    const promptbar = await waitForElement('.masonry-promptbar');
    expect(promptbar).to.exist;
  });

  it('Prompt should be placed at proper place in interactive container', async () => {
    const fireflypromptbar = await waitForElement('.ff-masonry-prompt');
    expect(fireflypromptbar).to.exist;
  });

  it('grid media should exist', async () => {
    const gridLayout = await waitForElement('.asset.grid-layout');
    expect(gridLayout).to.exist;
  });

  it('mobile media should exist', async () => {
    const mobileLayout = await waitForElement('.asset.mobile-only');
    expect(mobileLayout).to.exist;
  });

  it('Enticement should exist', async () => {
    const enticementText = await waitForElement('.enticement-text');
    const enticementArrow = await waitForElement('.enticement-arrow');
    expect(enticementText).to.exist;
    expect(enticementArrow).to.exist;
  });

  it('media should autocycle in mobile view', async () => {
    await setViewport({ width: 500, height: 800 });
    while (!document.querySelector('.mobile-only a.preload')) {
      // eslint-disable-next-line no-await-in-loop
      await delay(500);
    }
  }).timeout(5500);

  it('should change image content opacity on one tap for touch device', async () => {
    await setViewport({ width: 599, height: 100 });
    const imageContainer = await waitForElement('.image-container');
    imageContainer.querySelector('a').dispatchEvent(new Event('touchstart'));
    expect(imageContainer.querySelector('.image-content').style.opacity).to.equal('1');
  });

  it('should navigate to link after two tap for touch device', async () => {
    await setViewport({ width: 599, height: 100 });
    const imageContainer = await waitForElement('.image-container');
    imageContainer.querySelector('a').dispatchEvent(new Event('touchstart'));
    imageContainer.querySelector('a').dispatchEvent(new Event('touchstart'));
  });

  it('verify click on generate button', async () => {
    const promptButton = await waitForElement('#promptbutton');
    promptButton.dispatchEvent(new Event('click'));
  });
});
