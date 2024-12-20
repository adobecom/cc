import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';

document.body.innerHTML = await readFile({ path: './mocks/body.html' });
const { setLibs } = await import('../../../creativecloud/scripts/utils.js');
const { default: init } = await import('../../../creativecloud/blocks/callout/callout.js');

describe('callout block', () => {
  let oneBlockOneParagraph;
  let oneBlockTwoParagraphs;
  let twoBlocks;
  let threeBlocks;
  before(async () => {
    setLibs('https://milo.adobe.com/libs');
    oneBlockOneParagraph = document.querySelector('#one-block-one-paragraph');
    oneBlockTwoParagraphs = document.querySelector('#one-block-two-paragraphs');
    twoBlocks = document.querySelector('#two-blocks');
    threeBlocks = document.querySelector('#three-blocks');
    await Promise.all(
      [oneBlockOneParagraph, oneBlockTwoParagraphs, twoBlocks, threeBlocks].map((el) => init(el)),
    );
  });

  it('dummy test', () => {
    expect(oneBlockOneParagraph).to.exist;
    expect(oneBlockTwoParagraphs).to.exist;
    expect(twoBlocks).to.exist;
    expect(threeBlocks).to.exist;
  });

  // it('generates one block and one paragraph', () => {
  //   expect(oneBlockOneParagraph.querySelector('.callout-item')).to.exist;
  //   const blocks = oneBlockOneParagraph.querySelectorAll('.callout-item');
  //   expect(blocks.length).to.equal(1);
  //   const paragraphs = blocks[0].querySelectorAll('p');
  //   expect(paragraphs.length === 1).to.be.true;
  //   expect(paragraphs[0].innerHTML).to.equal('<strong class="tracking-header">Buying for a team?</strong> Easy-to-use license management. Dedicated 24/7 technical support. <a href="https://www.adobe.com/creativecloud/plans.html?plan=team" daa-ll="See all business pla-1--Buying for a team">See all business plans</a>');
  // });

  // it('generates one block and two paragraphs', async () => {
  //   const blocks = oneBlockTwoParagraphs.querySelectorAll('.callout-item');
  //   expect(blocks.length === 1).to.be.true;
  //   const paragraphs = blocks[0].querySelectorAll('p');
  //   expect(paragraphs.length === 2).to.be.true;
  //   expect(paragraphs[0].innerHTML).to.equal('<strong class="tracking-header">
  // Buying for a team?</strong> Easy-to-use license management.');
  //   expect(paragraphs[1].innerHTML).to.equal('Dedicated 24/7 technical support. <a href="https://www.adobe.com/creativecloud/plans.html?plan=team" daa-ll="See all business pla-1--Buying for a team">See all business plans</a>');
  // });

  // it('generates two blocks', async () => {
  //   const blocks = twoBlocks.querySelectorAll('.callout-item');
  //   expect(blocks.length === 2).to.be.true;
  //   expect(blocks[0].innerHTML).to.equal('<p><strong class="tracking-header">Buying for a team?</strong> Easy-to-use license management. Dedicated 24/7 technical support. <a href="https://www.adobe.com/creativecloud/plans.html?plan=team" daa-ll="See all business pla-1--Buying for a team">See all business plans</a></p>');
  //   expect(blocks[1].innerHTML).to.equal('<div class="callout-item"><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p><p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.<br><a href="https://www.adobe.com/creativecloud/plans.html?plan=team" daa-ll="CTA-2--Buying for a team">CTA</a></p>');
  // });
});
