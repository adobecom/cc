import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import { setLibs } from '../../../creativecloud/scripts/utils.js';

setLibs('/libs');

const { default: setInteractiveFirefly } = await import('../../../creativecloud/features/firefly/firefly-interactive.js');

document.body.innerHTML = await readFile({ path: './mocks/body.html' });
describe('firefly-marquee', async () => {
  const interactiveContainer = document.querySelector('.firefly');
  await setInteractiveFirefly(interactiveContainer);
  it('Prompt should exist', () => {
    const promptbar = document.querySelector('.promptbar');
    expect(promptbar).to.exist;
  });

  it('Prompt should should be placed at proper place in interactive container', () => {
    const fireflypromptbar = document.querySelector('.firefly-prompt');
    expect(fireflypromptbar).to.exist;
  });

  it('Interactive selector should exist', () => {
    const selector = document.querySelector('.options');
    expect(selector).to.exist;
  });

  it('Interactive selector should be placed at proper place in interactive container', () => {
    const fireflyselector = document.querySelector('.firefly-selectortray');
    expect(fireflyselector).to.exist;
  });

  it('Enticement should exist', () => {
    const enticementText = document.querySelector('.enticement-text');
    const enticementArrow = document.querySelector('.enticement-arrow');
    expect(enticementText).to.exist;
    expect(enticementArrow).to.exist;
  });
});
