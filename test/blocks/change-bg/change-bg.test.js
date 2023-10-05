import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import sinon, { stub } from 'sinon';
import init from '../../../creativecloud/blocks/change-bg/change-bg.js';

document.body.innerHTML = await readFile({ path: './mocks/body.html' });

describe('interactive-marquee', async () => {
  const marquee = document.querySelector('.change-bg');
  init(marquee);
  it('should exist', () => {
    const changebackgroundmarquee = document.querySelector('ft-changebackgroundmarquee');
    expect(changebackgroundmarquee).to.exist;
  });
});

describe('Create Image for LCP', () => {
  let matchMediaStub;
  let ImageStub;
  const assetsRoot = `${window.location.origin}/creativecloud/assets`;
  const marquee = document.querySelector('.change-bg');
  beforeEach(() => {
    matchMediaStub = sinon.stub(window, 'matchMedia');
    ImageStub = sinon.stub(window, 'Image');
  });
  afterEach(() => {
    matchMediaStub.restore();
    ImageStub.restore();
  });
  it('should create a new Image with the correct src if matchMedia matches', () => {
    matchMediaStub.returns({ matches: true });
    init(marquee);
    expect(ImageStub.calledOnce).to.be.true;
    expect(ImageStub.firstCall.returnValue.src).to.equal(`${assetsRoot}/mobile/defaultBg.webp`);
  });
});
