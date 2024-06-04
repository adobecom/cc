import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import { setLibs } from '../../../creativecloud/scripts/utils.js';

setLibs('/libs');
const { default: init } = await import('../../../creativecloud/blocks/interactive-marquee/interactive-marquee.js');

document.body.innerHTML = await readFile({ path: './mocks/body.html' });
describe('Change Background Marquee', async () => {
  const cmq = document.querySelector('.changebg');
  before(async () => {
    await init(cmq);
  });

  it('Change background should be decorated', () => {
    const changebackgroundmarquee = document.querySelector('ft-changebackgroundmarquee');
    expect(changebackgroundmarquee).to.exist;
  });
});
