import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import changeBg from '../../../creativecloud/features/changeBg/changeBg.js';

document.body.innerHTML = await readFile({ path: './mocks/index.html' });
describe('interactive-marquee', async () => {
  const marquee = document.querySelector('.changebg');
  await changeBg(marquee);
  it('should exist', () => {
    const changebackgroundmarquee = document.querySelector('ft-changebackgroundmarquee');
    expect(changebackgroundmarquee).to.exist;
  });
});
