import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';

document.body.innerHTML = await readFile({ path: './mocks/body.html' });
const { setLibs } = await import('../../../../creativecloud/scripts/utils.js');
const { default: init } = await import('../../../../creativecloud/blocks/interactive-metadata/interactive-metadata.js');

describe('Start Over', () => {
  let im = null;
  let ib = null;

  before(async () => {
    setLibs('https://milo.adobe.com/libs');
    im = document.querySelector('.interactive-metadata');
    ib = document.querySelector('.marquee');
    await init(im);
  });
  it('should render generate layer', () => {
    expect(ib.querySelector('.interactive-holder.step-generate')).to.exist;
  });
  it('should have start over layer', async () => {
    document.querySelector('.generate-button').dispatchEvent(new Event('click'));
    await new Promise((res) => { setTimeout(() => { res(); }, 200); });
    expect(document.querySelector('.interactive-holder.step-start-over')).to.exist;
  });
  it('should have start over button', () => {
    expect(document.querySelector('.start-over-button')).to.exist;
  });
  it('should have generate layer', async () => {
    document.querySelector('.start-over-button').dispatchEvent(new Event('click'));
    await new Promise((res) => { setTimeout(() => { res(); }, 200); });
    expect(document.querySelector('.interactive-holder.step-generate')).to.exist;
  });
});
