import { createTag } from '../../../scripts/utils.js';
import defineDeviceByScreenSize from '../../../scripts/decorate.js';
import { getLibs } from '../../../scripts/utils.js';

function appendSVGToButton(picture, button) {
  if (!picture) return;
  const svg = picture.querySelector('img[src*=svg]');
  if (!svg) return;
  const svgClone = svg.cloneNode(true);
  const svgCTACont = createTag('div', { class: 'svg-icon-container' });
  svgCTACont.append(svgClone);
  button.prepend(svgCTACont);
}

export async function createInteractiveButton(config) {
  const miloLibs = getLibs('/libs');
  const { loadStyle } = await import(`${miloLibs}/utils/utils.js`);
  await loadStyle('/creativecloud/features/interactive-components/upload/upload.css');
  const currentVP = defineDeviceByScreenSize().toLocaleLowerCase();
  let btn = null;
  const labelBtn = createTag('a', { class: `upload-btn body-${currentVP === 'mobile' ? 'm' : 'xl'}` }, config.text);
  if (config.type === 'upload') {
    btn = createTag('input', { class: 'inputFile', type: 'file', accept: 'image/*' });
    labelBtn.append(btn);
  }
  appendSVGToButton(config.svg, labelBtn);
  return labelBtn;
}
