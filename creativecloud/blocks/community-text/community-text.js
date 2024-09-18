import { decorateBlockBg, decorateBlockText, getBlockSize, decorateTextOverrides } from '../../utils/decorate.js';
import { createTag, loadStyle, getConfig, loadBlock } from '../../utils/utils.js';

// size: [heading, body, ...detail]
const blockTypeSizes = {
  standard: {
    small: ['s', 's', 's'],
    medium: ['m', 'm', 'm'],
    large: ['l', 'l', 'l'],
    xlarge: ['xl', 'xl', 'xl'],
  },
  inset: {
    small: ['s', 'm'],
    medium: ['m', 'l'],
    large: ['l', 'xl'],
    xlarge: ['xl', 'xxl'],
  },
  text: {
    xxsmall: ['xxs', 'xxs'],
    small: ['m', 's', 's'],
    medium: ['l', 'm', 'm'],
    large: ['xl', 'm', 'l'],
    xlarge: ['xxl', 'l', 'xl'],
  },
};

function decorateMultiViewport(el) {
  const viewports = ['mobile-up', 'tablet-up', 'desktop-up'];
  const foreground = el.querySelector('.foreground');
  if (foreground.childElementCount === 2 || foreground.childElementCount === 3) {
    [...foreground.children].forEach((child, index) => {
      child.className = viewports[index];
      if (foreground.childElementCount === 2 && index === 1) child.className = 'tablet-up desktop-up';
    });
  }
  return foreground;
}

function decorateBlockIconArea(el) {
  const headings = el.querySelectorAll('h1, h2, h3, h4, h5, h6');
  if (!headings) return;
  headings.forEach((h) => {
    const hPrevElem = h.previousElementSibling;
    if (hPrevElem?.childElementCount) {
      const picCount = [...hPrevElem.children].reduce((result, item) => {
        let count = result;
        if (item.nodeName === 'PICTURE') count += 1;
        return count;
      }, 0);
      if (picCount === hPrevElem.childElementCount) hPrevElem.classList.add('icon-area');
    }
  });
}

function decorateLinkFarms(el) {
  const { miloLibs, codeRoot } = getConfig();
  loadStyle(`${miloLibs || codeRoot}/blocks/text/link-farms.css`);
  const [title, foregroundDiv] = [...el.querySelectorAll('.foreground')];
  const hCount = foregroundDiv.querySelectorAll('h1, h2, h3, h4, h5, h6').length;
  title.querySelector('h1, h2, h3, h4, h5, h6')?.classList.add('heading-l');
  foregroundDiv.querySelectorAll('p').forEach((p) => p.classList.add('body-s'));
  foregroundDiv.querySelectorAll('div').forEach((divElem, index) => {
    const heading = divElem.querySelector('h1, h2, h3, h4, h5, h6');
    heading?.classList.add('heading-xs');
    if (!hCount) return;
    if (!heading) {
      divElem.prepend(createTag('h3', { class: 'no-heading heading-xs' }));
      return;
    }
    const sibling = index % 2 === 0
      ? divElem.nextElementSibling
      : divElem.previousElementSibling;
    sibling?.classList.add('hspace');
    if (index > 0) divElem.classList.add('has-heading');
    if (index > 1) foregroundDiv.classList.add('gap-xl');
  });
}

function abbreviate(val=0){
  if (val >= 1_000_000_000_000) {
      return (val / 1_000_000_000_000).toFixed(1) + 'T';
  } else if (val >= 1_000_000_000) {
      return (val / 1_000_000_000).toFixed(1) + 'B';
  } else if (val >= 1_000_000) {
      return (val / 1_000_000).toFixed(1) + 'M';
  } else if (val >= 1_000) {
      return (val / 1_000).toFixed(1) + 'K';
  } else {
      return val.toString();
  }
}

export default async function init(el) {

  el.classList.add('text-block', 'con-block');
  let rows = el.querySelectorAll(':scope > div');
  if (rows.length > 1) {
    if (rows[0].textContent !== '') el.classList.add('has-bg');
    const [head, ...tail] = rows;
    decorateBlockBg(el, head);
    rows = tail;
  }
  const helperClasses = [];
  let blockType = 'text';
  const size = el.classList.contains('legal') ? 'xxsmall' : getBlockSize(el);
  ['inset', 'long-form', 'bio'].forEach((variant, index) => {
    if (el.classList.contains(variant)) {
      helperClasses.push('max-width-8-desktop');
      blockType = (index > 0) ? 'standard' : variant;
    }
  });
  const hasLinkFarm = el.classList.contains('link-farm');
  rows.forEach((row) => {
    row.classList.add('foreground');
    if (!hasLinkFarm) decorateBlockText(row, blockTypeSizes[blockType][size]);
    decorateBlockIconArea(row);
  });
  if (el.classList.contains('full-width')) helperClasses.push('max-width-8-desktop', 'center', 'xxl-spacing');
  if (el.classList.contains('intro')) helperClasses.push('max-width-8-desktop', 'xxl-spacing-top', 'xl-spacing-bottom');
  if (el.classList.contains('vertical')) {
    const elAction = el.querySelector('.action-area');
    if (elAction) elAction.classList.add('body-s');
  }
  if (hasLinkFarm) decorateLinkFarms(el);
  el.classList.add(...helperClasses);
  decorateTextOverrides(el);
  if (!hasLinkFarm) decorateMultiViewport(el);

  const lastActionArea = el.querySelector('.action-area:last-of-type');
  if (lastActionArea) {
    const div = createTag('div', { class: 'cta-container' });
    lastActionArea.insertAdjacentElement('afterend', div);
    div.append(lastActionArea);
  }

  const mnemonicList = el.querySelector('.mnemonic-list');
  const foreground = mnemonicList?.closest('.foreground');
  if (foreground) {
    mnemonicList.querySelectorAll('p').forEach((product) => product.removeAttribute('class'));
    await loadBlock(mnemonicList);
  }
  const iconArea = document.querySelector('.icon-area');

  const inputElement = document.createElement('input');

  inputElement.setAttribute('type', 'text');
  inputElement.setAttribute('placeholder', 'Search Adobe Community...');
  inputElement.id = 'banner-search-bar';

  iconArea.parentNode.insertBefore(inputElement, iconArea);
  const searchIcon = document.createElement('img');
  searchIcon.id = 'banner-search-icon';
  searchIcon.src = 'https://community.adobe.com/html/@EAD1AE1EC60800B1D4958C17D35EC1CC/assets/S2_new-search-icon.svg';
  iconArea.parentNode.insertBefore(searchIcon, inputElement);      

  const res = await fetch('https://community-dev.adobe.com/wsyco67866/plugins/custom/adobe/adobedxdev/landing-page-data-fetch');
  const data = await res.json();
  if(Object.keys(data).length > 0){
                
    const memberCount = abbreviate(data['members']) ?? 0;
    const postCount = abbreviate(data['conversations']) ?? 0;
    const onlineCount = abbreviate(data['online_users']) ?? 0;
    const icons = document.querySelectorAll('.icon-area .icon');
    let countArray = [memberCount, postCount, onlineCount];
    icons.forEach((icon, index) => {
      const countElement = document.createElement('span');
      countElement.id = 'count-text';
      countElement.textContent = countArray[index];
      icon.parentNode.insertBefore(countElement, icon.nextSibling);
    });
  }
}
