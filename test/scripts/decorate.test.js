import { readFile, setViewport } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import defineDeviceByScreenSize from '../../creativecloud/scripts/decorate.js';

function delay(ms) {
  return new Promise((res) => { setTimeout(() => { res(); }, ms); });
}

document.body.innerHTML = await readFile({ path: './mocks/body.html' });
describe('Scripts', () => {
  it('Get devide screen type - Tablet', () => {
    const sw = defineDeviceByScreenSize();
    expect(sw).to.equal('TABLET');
  });

  it('Get devide screen type - Desktop', async () => {
    setViewport({ width: 1500, height: 1500 });
    window.dispatchEvent(new Event('resize'));
    await delay(200);
    const sw = defineDeviceByScreenSize();
    expect(sw).to.equal('DESKTOP');
  });

  it('Get devide screen type - Mobile', async () => {
    setViewport({ width: 500, height: 500 });
    window.dispatchEvent(new Event('resize'));
    await delay(200);
    const sw = defineDeviceByScreenSize();
    expect(sw).to.equal('MOBILE');
  });
});
