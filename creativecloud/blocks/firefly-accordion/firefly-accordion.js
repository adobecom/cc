import { createTag } from '../../scripts/utils.js';

const LANA_OPTIONS = { tags: 'animated-slot-text', errorType: 'i' };

const ICON_SVG = '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line class="vert-line" x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>';

function extractData(el) {
  const children = Array.from(el.children);
  let stepPrefix = 'Step';
  let itemsStart = 0;

  const firstChild = children[0];
  if (firstChild) {
    const divs = Array.from(firstChild.children).filter((ele) => ele.tagName === 'DIV');
    if (divs.length > 0 && divs[0].textContent.trim().toLowerCase() === 'step label') {
      itemsStart = 1;
      if (divs.length >= 2) {
        stepPrefix = divs[1].textContent.trim();
      }
    }
  }

  const rawItems = children.slice(itemsStart);

  return rawItems.map((item, index) => {
    const innerDiv = item.querySelector('div');
    if (!innerDiv) return null;

    const titleEl = innerDiv.querySelector('h3');
    const contentEl = innerDiv.querySelector('p');

    return {
      id: index,
      title: titleEl ? titleEl.innerText : 'Step',
      content: contentEl ? contentEl.innerHTML : '',
      headingId: titleEl ? titleEl.id : `acc-heading-${index}`,
      stepPrefix,
    };
  }).filter(Boolean);
}

function handlePointerDown(e) {
  const item = e.currentTarget;
  item.dataset.startX = e.clientX;
  item.dataset.startY = e.clientY;
}

function handleItemClick(e) {
  const item = e.currentTarget;
  const startX = parseFloat(item.dataset.startX || 0);
  const startY = parseFloat(item.dataset.startY || 0);
  if (e.clientX !== 0 || e.clientY !== 0) {
    const diffX = Math.abs(e.clientX - startX);
    const diffY = Math.abs(e.clientY - startY);

    if (diffX > 5 || diffY > 5) {
      return;
    }
  }

  if (e.target.tagName === 'A' || e.target.tagName === 'INPUT') return;

  const trigger = item.querySelector('.firefly-accordion-trigger');
  if (!trigger) return;

  const isExpanded = trigger.getAttribute('aria-expanded') === 'true';

  if (isExpanded) {
    trigger.setAttribute('aria-expanded', 'false');
    item.classList.remove('is-open');
  } else {
    trigger.setAttribute('aria-expanded', 'true');
    item.classList.add('is-open');
  }
}

function createAccordionItem(data) {
  const { id, title, content, headingId, stepPrefix } = data;
  const isOpen = false;

  const itemWrapper = createTag('div');
  itemWrapper.className = `firefly-accordion-item ${isOpen ? 'is-open' : ''}`;

  itemWrapper.addEventListener('pointerdown', handlePointerDown);
  itemWrapper.addEventListener('click', handleItemClick);
  const header = createTag('h3', { class: 'firefly-accordion-header' });

  const btn = createTag('button', { class: 'firefly-accordion-trigger', id: `btn-${headingId}`, 'aria-expanded': isOpen, type: 'button', 'aria-controls': `panel-${headingId}` });

  const titleSpan = createTag('span', { class: 'firefly-accordion-title' });
  titleSpan.textContent = title;

  const iconSpan = createTag('span', { class: 'firefly-accordion-icon' });
  iconSpan.innerHTML = ICON_SVG;

  const stepSpan = createTag('span', { class: 'step-indicator' });
  stepSpan.textContent = `${stepPrefix} ${id + 1}`;

  btn.appendChild(stepSpan);
  btn.appendChild(titleSpan);
  btn.appendChild(iconSpan);
  header.appendChild(btn);

  const panel = createTag('div', { class: 'firefly-accordion-panel', id: `panel-${headingId}`, role: 'region', 'aria-labelledby': `btn-${headingId}` });
  const panelInner = createTag('div', { class: 'firefly-accordion-panel-inner' });
  const contentWrapper = createTag('div', { class: 'firefly-accordion-content' });

  const p = createTag('p');
  p.innerHTML = content;
  contentWrapper.appendChild(p);
  panelInner.appendChild(contentWrapper);
  panel.appendChild(panelInner);

  itemWrapper.appendChild(header);
  itemWrapper.appendChild(panel);

  return itemWrapper;
}

function decorateContent(el) {
  const data = extractData(el);
  const foreground = createTag('div', { class: 'foreground' });
  data.forEach((itemData) => {
    const itemNode = createAccordionItem(itemData);
    foreground.appendChild(itemNode);
  });

  el.innerHTML = '';
  el.appendChild(foreground);
}

export default function init(el) {
  try {
    el.classList.add('con-block');
    decorateContent(el);
  } catch (err) {
    window.lana?.log(`Firefly accordion Init error: ${err}`, LANA_OPTIONS);
  }
}
