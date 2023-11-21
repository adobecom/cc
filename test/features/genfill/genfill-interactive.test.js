import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import setInteractiveFirefly from '../../../creativecloud/features/genfill/genfill-interactive.js';

document.body.innerHTML = await readFile({ path: './mocks/genfill.html' });
describe('genfill-marquee', async () => {
  const interactiveContainer = document.querySelector('.genfill');
  setInteractiveFirefly(interactiveContainer);
  it('media for different viewports should exist', () => {
    const mobileMedia = document.querySelector('.mobile-media');
    const tabletMedia = document.querySelector('.tablet-media');
    const desktopMedia = document.querySelector('.desktop-media');
    expect(mobileMedia).to.exist;
    expect(tabletMedia).to.exist;
    expect(desktopMedia).to.exist;
  });

  // it('Prompt should should be placed at proper place in interactive container', () => {
  //   const fireflypromptbar = document.querySelector('.fireflyPrompt');
  //   expect(fireflypromptbar).to.exist;
  // });

  // it('Interactive selector should exist', () => {
  //   const selector = document.querySelector('.options');
  //   expect(selector).to.exist;
  // });

  // it('Interactive selector should be placed at proper place in interactive container', () => {
  //   const fireflyselector = document.querySelector('.fireflySelectorTray');
  //   expect(fireflyselector).to.exist;
  // });
  it('Enticement should exist', () => {
    const enticementText = document.querySelector('.enticementText');
    const enticementArrow = document.querySelector('.enticementArrow');
    expect(enticementText).to.exist;
    expect(enticementArrow).to.exist;
  });
});
