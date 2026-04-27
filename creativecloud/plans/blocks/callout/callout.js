import { getLibs } from '../../scripts/utils.js';

const groupElementsIntoBlocks = (container, createTag) => {
  const elements = container.querySelectorAll('p, hr');
  const blocks = [];

  if (!elements.length) {
    // one block with one paragraph
    const content = container.querySelector('div > div > div')?.innerHTML;
    if (content) blocks.push(createTag('div', { class: 'callout-item' }, createTag('p', false, content)));
    return blocks;
  }

  const hrIndexes = [...elements].reduce((indexes, el, i) => {
    if (el.tagName === 'HR') indexes.push(i);
    return indexes;
  }, []);

  if (!hrIndexes.length) {
    // one block with multiple paragraphs
    blocks.push(createTag('div', { class: 'callout-item' }, [...elements]));
  } else {
    // more than one block
    let start = 0;
    hrIndexes.forEach((end) => {
      blocks.push(createTag('div', { class: 'callout-item' }, [...elements].slice(start, end)));
      start = end + 1;
    });
    blocks.push(createTag('div', { class: 'callout-item' }, [...elements].slice(start)));
  }

  return blocks;
};

export default async function init(el) {
  const miloLibs = getLibs('/libs');
  const { createTag } = await import(`${miloLibs}/utils/utils.js`);
  const blocks = groupElementsIntoBlocks(el, createTag);
  if (el.className.match(/(-spacing|max-width-)/)) {
    el.classList.add('con-block');
    blocks.forEach((block) => {
      block.classList.add('foreground');
    });
  }
  el.replaceChildren(...blocks);
}
