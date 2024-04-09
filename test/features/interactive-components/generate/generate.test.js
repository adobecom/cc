import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';

document.body.innerHTML = await readFile({ path: './mocks/body.html' });
const { setLibs } = await import('../../../../creativecloud/scripts/utils.js');
const { default: init } = await import('../../../../creativecloud/blocks/interactive-metadata/interactive-metadata.js');

describe('interactive metadata', () => {
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
  it('should have start over layer', () => {
    document.querySelector('.generate-button').dispatchEvent(new Event('click'));
    setTimeout(() => expect(ib).to.equal(''), 200);
  });
});
