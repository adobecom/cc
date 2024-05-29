import { createTag, loadStyle } from '../../scripts/utils.js';

async function loadProgressCss() {
  const stylePromise = new Promise((resolve) => {
    loadStyle('/creativecloud/features/progress-circle/progress-circle.css', resolve);
  });
  await stylePromise;
}

export default async function createprogressCircle() {
  await loadProgressCss();
  const pdom = `<div class="spectrum-ProgressCircle-track"></div>
  <div class="spectrum-ProgressCircle-fills">
    <div class="spectrum-ProgressCircle-fillMask1">
      <div class="spectrum-ProgressCircle-fillSubMask1">
        <div class="spectrum-ProgressCircle-fill"></div>
      </div>
    </div>
    <div class="spectrum-ProgressCircle-fillMask2">
      <div class="spectrum-ProgressCircle-fillSubMask2">
        <div class="spectrum-ProgressCircle-fill"></div>
      </div>
    </div>
  </div>`;
  const prgc = createTag('div', { class: 'spectrum-ProgressCircle spectrum-ProgressCircle--indeterminate' }, pdom);
  const layer = createTag('div', { class: 'layer layer-progress' }, prgc);
  return layer;
}
