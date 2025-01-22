import { readFile, setViewport } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';

document.body.innerHTML = await readFile({ path: './mocks/body.html' });
const { setLibs } = await import('../../../creativecloud/scripts/utils.js');
const { default: init } = await import('../../../creativecloud/blocks/image-prompt/image-prompt.js');

describe('image prompt', () => {
  const ip = document.querySelector('.image-prompt');
  before(async () => {
    setLibs('https://milo.adobe.com/libs');
    await init(ip);
  });

  it('image prompt hould containt the prompt', () => {
    const prompt = ip.querySelector('.prompt');
    expect(prompt).to.exist;
  });

  it('verify the elements on hover', () => {
    ip.querySelector('a').dispatchEvent(new Event('mousemove'));
    expect(window.getComputedStyle(ip.querySelector('.hover-container')).opacity).to.equal('1');
    expect(ip.querySelector('.prompt-hover')).to.exist;
    expect(ip.querySelector('.button-wrapper')).to.exist;
    expect(ip.querySelector('.avatar')).to.exist;
  });

  it('verify click on mobile view', async () => {
    await setViewport({ width: 599, height: 100 });
    ip.querySelector('a').dispatchEvent(new Event('click'));
    expect(window.getComputedStyle(ip.querySelector('.hover-mobile')).opacity).to.equal('1');
  });
});
