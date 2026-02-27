import { createTag } from '../../scripts/utils.js';

const LANA_OPTIONS = { tags: 'animated-slot-text', errorType: 'i' };

const ICON_SVG = '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line class="vert-line" x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>';

function extractData(el) {
  const children = Array.from(el.children);
  const steps = [];
  const seoData = {};
  const isSeoEnabled = el.classList.contains('seo');

  children.forEach((item, index) => {
    const innerDivs = Array.from(item.children);
    if (innerDivs.length === 0) return;

    const firstDivText = innerDivs[0].textContent.trim();
    if (firstDivText === 'seo-props') {
      if (!isSeoEnabled || innerDivs.length <= 1) {
        return;
      }

      const props = innerDivs[1].querySelectorAll('p');
      props.forEach((p) => {
        const text = p.textContent;
        const splitIndex = text.indexOf(':');
        if (splitIndex > -1) {
          const key = text.substring(0, splitIndex).trim().toLowerCase();
          const value = text.substring(splitIndex + 1).trim();

          if (key === 'name') seoData.name = value;
          if (key === 'description') seoData.description = value;
          if (key === 'total-time' || key === 'totaltime') seoData.totalTime = value;
          if (key === 'tools' || key === 'tool') seoData.tools = value.split(',').map((s) => s.trim()).filter(Boolean);
          if (key === 'supply' || key === 'supplies') seoData.supply = value.split(',').map((s) => s.trim()).filter(Boolean);
        }
      });
      return;
    }

    const innerDiv = item.querySelector('div');
    if (!innerDivs) return;

    const titleEl = innerDiv.querySelector('h3');
    const contentEl = innerDiv.querySelector('p');
    let stepPrefix = 'Step';
    let titleText = titleEl ? titleEl.innerText : '';
    let fullTitle = titleText;

    if (titleText.includes('||')) {
      const parts = titleText.split('||');
      stepPrefix = parts[0]?.trim() ?? 'Step';
      titleText = parts[1]?.trim() ?? '';
      fullTitle = `${stepPrefix} ${titleText}`;
    }

    steps.push({
      id: index,
      title: titleText,
      fullTitle,
      content: contentEl ? contentEl.innerHTML : '',
      plainText: contentEl ? contentEl.textContent : '',
      headingId: titleEl ? titleEl.id : `acc-heading-${index}`,
      stepPrefix,
    });
  });
  return { steps, seoData };
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

  const trigger = item.querySelector('.firefly-howto-trigger');
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
  const { title, content, headingId, stepPrefix } = data;
  const isOpen = false;

  const itemWrapper = createTag('div');
  itemWrapper.className = `firefly-howto-item ${isOpen ? 'is-open' : ''}`;

  itemWrapper.addEventListener('pointerdown', handlePointerDown);
  itemWrapper.addEventListener('click', handleItemClick);
  const header = createTag('h3', { class: 'firefly-howto-header' });

  const btn = createTag('button', { class: 'firefly-howto-trigger', id: `btn-${headingId}`, 'aria-expanded': isOpen, type: 'button', 'aria-controls': `panel-${headingId}` });

  const titleSpan = createTag('span', { class: 'firefly-howto-title' });
  titleSpan.textContent = title;

  const iconSpan = createTag('span', { class: 'firefly-howto-icon' });
  iconSpan.innerHTML = ICON_SVG;

  const stepSpan = createTag('span', { class: 'step-indicator' });
  stepSpan.textContent = `${stepPrefix} `;

  btn.appendChild(stepSpan);
  btn.appendChild(titleSpan);
  btn.appendChild(iconSpan);
  header.appendChild(btn);

  const panel = createTag('div', { class: 'firefly-howto-panel', id: `panel-${headingId}`, role: 'region', 'aria-labelledby': `btn-${headingId}` });
  const panelInner = createTag('div', { class: 'firefly-howto-panel-inner' });
  const contentWrapper = createTag('div', { class: 'firefly-howto-content' });

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
  const { steps: data, seoData } = extractData(el);
  const foreground = createTag('div', { class: 'foreground' });
  data.forEach((itemData) => {
    const itemNode = createAccordionItem(itemData);
    foreground.appendChild(itemNode);
  });

  el.innerHTML = '';
  el.appendChild(foreground);

  if (el.classList.contains('seo') && seoData.name && seoData.description) {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: seoData.name,
      description: seoData.description,
    };
    schema.step = data.map((item) => ({
      '@type': 'HowToStep',
      name: item.fullTitle,
      text: item.plainText,
    }));

    if (seoData.totalTime) {
      schema.totalTime = seoData.totalTime;
    }

    if (seoData.tools && seoData.tools.length > 0) {
      schema.tool = seoData.tools.map((tool) => ({
        '@type': 'HowToTool',
        name: tool,
      }));
    }

    if (seoData.supply && seoData.supply.length > 0) {
      schema.supply = seoData.supply.map((supply) => ({
        '@type': 'HowToSupply',
        name: supply,
      }));
    }
    const script = createTag('script', { type: 'application/ld+json' }, JSON.stringify(schema));
    document.head.appendChild(script);
  }
}

export default function init(el) {
  try {
    el.classList.add('con-block');
    decorateContent(el);
  } catch (err) {
    window.lana?.log(`Firefly accordion Init error: ${err}`, LANA_OPTIONS);
  }
}
