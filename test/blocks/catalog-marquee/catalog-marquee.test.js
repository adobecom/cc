import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';

document.body.innerHTML = await readFile({ path: './mocks/body.html' });
const { setLibs } = await import('../../../creativecloud/plans/scripts/utils.js');
const { default: init, appendFeatures } = await import('../../../creativecloud/plans/blocks/catalog-marquee/catalog-marquee.js');

describe('catalog marquee', () => {
  const marquee = document.querySelector('.catalog-marquee');
  before(async () => {
    setLibs('https://milo.adobe.com/libs');
    await init(marquee);
  });

  it('has backround with three image elements', () => {
    const background = marquee.querySelector('.background');
    expect(background).to.exist;
    const mobile = background.querySelector('.mobile-only');
    const tablet = background.querySelector('.tablet-only');
    const desktop = background.querySelector('.desktop-only');
    [mobile, tablet, desktop].forEach((el) => {
      expect(el).to.exist;
      const pic = el.querySelector('picture');
      expect(pic).to.exist;
      const img = pic.querySelector('img');
      expect(img).to.exist;
    });
  });

  it('has foreground with heading, text, mnemonics and action area', () => {
    const foreground = marquee.querySelector('.foreground.container');
    const text = foreground.querySelector('.text');
    const heading = text.querySelector('.heading-xl');
    expect(heading.innerText).to.contain('Get 20+ Creative Cloud for less than the price of 3 apps.');
    const description = text.querySelector('.body-m');
    expect(description.innerText).to.contain('The All Apps plan includes 20+ apps and services plus 20,000 fonts, storage, templates, and tutorials for less than the price of Acrobat, Photoshop, and Premiere Pro sold separately.');
    const [mnemonics, businessFeatures] = text.querySelectorAll('.mnemonic-list');
    [mnemonics, businessFeatures].forEach((el) => {
      const productList = el.querySelector('.product-list');
      const [title, ...items] = productList.querySelectorAll('.product-item');
      expect(title.querySelector('strong')).to.exist;
      expect(title.querySelector('picture')).to.not.exist;
      items.forEach((item) => {
        expect(item.querySelector('picture')).to.exist;
        expect(item.querySelector('strong')).to.exist;
      });
    });
    expect(mnemonics.querySelector('.product-item').innerText).to.contain('Includes:');
    expect(businessFeatures.querySelector('.product-item').innerText).to.contain('Business features:');
    const actionArea = text.querySelector('.action-area');
    const [freeTrialCta, buyNowCta] = actionArea.querySelectorAll('a.con-button.button-l.button-justified-mobile');
    expect(freeTrialCta.innerText).to.contain('Free trial');
    expect(buyNowCta.innerText).to.contain('Buy now');
  });
});

describe('catalog marquee mnemonics without an action area', () => {
  const createTag = (tag, attrs) => {
    const el = document.createElement(tag);
    Object.entries(attrs ?? {}).forEach(([k, v]) => el.setAttribute(k, v));
    return el;
  };
  const iconParagraph = (name) => `<p><picture><img src="/x.svg" alt="${name}"></picture> <strong>${name}</strong></p>`;

  it('builds the mnemonic list and ignores trailing non-product paragraphs', () => {
    const el = createTag('div', { class: 'catalog-marquee' });
    const foreground = createTag('div', { class: 'foreground container' });
    const text = createTag('div', { class: 'text' });
    text.innerHTML = `
      <p><strong>Includes:</strong></p>
      ${iconParagraph('Acrobat')}
      ${iconParagraph('Firefly')}
      <p><strong>Cancel anytime within 14 days.</strong></p>`;
    foreground.append(text);
    el.append(foreground);

    appendFeatures(el, foreground, text, [], () => ({ base: '' }), () => {}, createTag);

    const lists = text.querySelectorAll('.mnemonic-list');
    expect(lists.length).to.equal(1);
    const items = lists[0].querySelectorAll('.product-item');
    expect(items.length).to.equal(3);
    expect(items[0].innerText).to.contain('Includes:');
    expect(text.querySelector('.mnemonic-list picture')).to.exist;
    const disclaimer = [...text.querySelectorAll(':scope > p')].find((p) => p.textContent.includes('Cancel anytime'));
    expect(disclaimer).to.exist;
  });
});
