import { createTag } from '../../../scripts/utils.js';

export default function decorate() {
  return {
    element: createTag('div', { class: 'upload-marquee-prompt-container' }),
    leftColClass: 'copy',
    setupInteraction: () => {},
  };
}
