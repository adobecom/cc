import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';

document.body.innerHTML = await readFile({ path: './mocks/body.html' });

describe('upload', () => {
  before(async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const { default: init } = await import('../../../creativecloud/blocks/upload/upload.js');
    const uploadBlock = document.querySelector('.upload');
    init(uploadBlock);
  });

  it('upload block should contain upload block classes', () => {
    const upload = document.querySelector('.upload');
    expect(upload.classList.contains('upload-block')).to.be.true;
    expect(upload).to.exist;
  });

  it('upload block should contain media container and drop zone container', () => {
    const mediaColumn = document.querySelector('.media-container');
    const dropZoneContainer = document.querySelector('.drop-zone-container');
    const dropZone = dropZoneContainer.querySelector('.drop-zone');
    expect(mediaColumn).to.exist;
    expect(dropZoneContainer).to.exist;
    expect(dropZone).to.exist;
  });

  it('has upload button', () => {
    const button = document.querySelector('.action-button');
    expect(button).to.exist;
    button.dispatchEvent(new Event('click'));
  });

  it('upload has multiple viewports', () => {
    const mobile = document.querySelector('.mobile-up');
    const tablet = document.querySelector('.tablet-up');
    const desktop = document.querySelector('.desktop-up');
    expect(mobile).to.exist;
    expect(tablet).to.exist;
    expect(desktop).to.exist;
  });
});
