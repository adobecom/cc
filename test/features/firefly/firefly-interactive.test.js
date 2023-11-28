import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import { setLibs } from '../../../creativecloud/scripts/utils.js';

setLibs('/libs');

const { default: init } = await import('../../../creativecloud/features/firefly/firefly-interactive.js');

document.body.innerHTML = await readFile({ path: './mocks/body.html' });
describe('firefly-marquee', async () => {
  const interactiveContainer = document.querySelector('.firefly');
  await init(interactiveContainer);
  it('Prompt should exist', async () => {
    const promptbar = document.querySelector('.promptbar');
    expect(promptbar).to.exist;
  });

  it('Prompt should should be placed at proper place in interactive container', async () => {
    const fireflypromptbar = document.querySelector('.firefly-prompt');
    expect(fireflypromptbar).to.exist;
  });

  it('Interactive selector should exist', async () => {
    const selector = document.querySelector('.options');
    expect(selector).to.exist;
  });

  it('Interactive selector should be placed at proper place in interactive container', async () => {
    const fireflyselector = document.querySelector('.firefly-selectortray');
    expect(fireflyselector).to.exist;
  });

  it('Enticement should exist', async () => {
    const enticementText = document.querySelector('.enticement-text');
    const enticementArrow = document.querySelector('.enticement-arrow');
    expect(enticementText).to.exist;
    expect(enticementArrow).to.exist;
  });
});
