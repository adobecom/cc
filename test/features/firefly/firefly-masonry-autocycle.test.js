import { readFile, setViewport } from '@web/test-runner-commands';
import sinon from 'sinon';
import { setLibs } from '../../../creativecloud/scripts/utils.js';

setLibs('/libs');

const { default: init } = await import('../../../creativecloud/blocks/interactive-marquee/interactive-marquee.js');

function delay(ms) {
  return new Promise((res) => { setTimeout(() => { res(); }, ms); });
}

describe('firefly-masonry-autocycle', () => {
  let clock;
  beforeEach(async () => {
    document.body.innerHTML = await readFile({ path: './mocks/masonry-body.html' });
    await init(document.querySelector('.ff-masonry'));
  });

  afterEach(() => {
    clock.restore();
  });

  it('media should autocycle in mobile view', async () => {
    clock = sinon.useFakeTimers({
      toFake: ['setInterval'],
      shouldAdvanceTime: true,
    });
    await setViewport({ width: 500, height: 800 });
    await delay(1000);
    clock.tick(4000);
  });
});
