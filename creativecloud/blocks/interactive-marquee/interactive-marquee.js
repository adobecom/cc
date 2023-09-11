/* eslint-disable max-len */
import miloLibs from '../../scripts/scripts.js';

const { getConfig } = await import(`${miloLibs}/utils/utils.js`);
const customElem = document.createElement('ft-changebackgroundmarquee');
let excelLink = '';
const configObj = {};
const config = getConfig();
const base = config.codeRoot;

const decorateBlockBg = (node) => {
  const viewports = ['mobile-only', 'tablet-only', 'desktop-only'];
  const { children } = node;
  const childCount = node.childElementCount;
  if (childCount === 2) {
    children[0].classList.add(viewports[0], viewports[1]);
    children[1].classList.add(viewports[2]);
  }

  [...children].forEach(async (child, index) => {
    if (childCount === 3) {
      child.classList.add(viewports[index]);
    }
  });
};

export default async function init(el) {
  import(`${base}/deps/blades/interactivemarquee.js`);
  const dataSet = el.querySelectorAll(':scope > div');
  if (dataSet.length > 1) {
    dataSet[0].classList.add('background');
    decorateBlockBg(dataSet[0]);
  }
}
