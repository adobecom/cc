import { createTag } from './utils.js';

export default function defineDeviceByScreenSize() {
  const DESKTOP_SIZE = 1200;
  const MOBILE_SIZE = 600;
  const screenWidth = window.innerWidth;
  if (screenWidth >= DESKTOP_SIZE) {
    return 'DESKTOP';
  }
  if (screenWidth <= MOBILE_SIZE) {
    return 'MOBILE';
  }
  return 'TABLET';
}

export function appendSVGToButton(picture, button) {
  if (!picture) return;
  const svg = picture.querySelector('img[src*=svg]');
  if (!svg) return;
  const svgClone = svg.cloneNode(true);
  const svgCTACont = createTag('a', { class: 'tray-thumbnail-img' });
  svgCTACont.append(svgClone);
  button.prepend(svgCTACont);
}
