import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import { setLibs } from '../../../creativecloud/scripts/utils.js';
import waitForElement from '../../helpers/waitForElement.js';

setLibs('/libs');
function delay(ms) {
  return new Promise((res) => { setTimeout(() => { res(); }, ms); });
}

const { default: init } = await import('../../../creativecloud/blocks/interactive-marquee/interactive-marquee.js');
const { handleTouchDevice } = await import('../../../creativecloud/features/firefly/firefly-masonry.js');

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

  it('should autocycle', async () => {
    await delay(500);
  });

  it('grid media should exist', async () => {
    const gridLayout = await waitForElement('.asset.grid-layout');
    expect(gridLayout).to.exist;
  });

  it('mobile media should exist', async () => {
    const mobileLayout = await waitForElement('.asset.mobile-only');
    expect(mobileLayout).to.exist;
  });

  it('should handle touch device', async () => {
    const imageContainer = document.querySelector('.image-container');
    handleTouchDevice(imageContainer, 500);
  });

  it('Enticement should exist', async () => {
    const enticementText = await waitForElement('.enticement-text');
    const enticementArrow = await waitForElement('.enticement-arrow');
    expect(enticementText).to.exist;
    expect(enticementArrow).to.exist;
  });
});
