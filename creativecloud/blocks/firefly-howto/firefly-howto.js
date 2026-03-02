import { createTag } from '../../scripts/utils.js';

// ===== CONFIG =====

const CONFIG = {
  DEFAULT_STEP_PREFIX: 'Step',
  SEO_MARKER: 'seo-props',
  STEP_TITLE_DELIMITER: '||',
  CLICK_DRAG_THRESHOLD: 5,
};

const LANA_OPTIONS = { tags: 'firefly-howto', errorType: 'i' };

const ICON_SVG = '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line class="vert-line" x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>';

// ===== LOGGING =====

function logError(message, error) {
  window.lana?.log(`${message}: ${error}`, LANA_OPTIONS);
}

// ===== UTILITY FUNCTIONS =====

function parseStepTitle(rawTitle) {
  let stepPrefix = CONFIG.DEFAULT_STEP_PREFIX;
  let title = rawTitle;
  let fullTitle = title;

  if (rawTitle.includes(CONFIG.STEP_TITLE_DELIMITER)) {
    const parts = rawTitle.split(CONFIG.STEP_TITLE_DELIMITER);
    stepPrefix = parts[0]?.trim() || CONFIG.DEFAULT_STEP_PREFIX;
    title = parts[1]?.trim() || '';
    fullTitle = `${stepPrefix} ${title}`;
  }

  return { stepPrefix, title, fullTitle };
}

// ===== PARSING (SEO PROPS) =====

function parseCsv(value) {
  return value.split(',').map((item) => item.trim()).filter(Boolean);
}

function extractSeoData(item) {
  const seoData = {};
  const props = item.children[1]?.querySelectorAll('p') || [];

  props.forEach((p) => {
    const text = p.textContent;
    const splitIndex = text.indexOf(':');

    if (splitIndex < 0) return;

    const key = text.substring(0, splitIndex).trim().toLowerCase();
    const value = text.substring(splitIndex + 1).trim();

    if (key === 'name') seoData.name = value;
    if (key === 'description') seoData.description = value;
    if (key === 'total-time' || key === 'totaltime') seoData.totalTime = value;
    if (key === 'tools' || key === 'tool') seoData.tools = parseCsv(value);
    if (key === 'supply' || key === 'supplies') seoData.supply = parseCsv(value);
  });

  return seoData;
}

// ===== PARSING (STEPS) =====

function parseStep(item, index) {
  const innerDiv = item.querySelector('div');
  if (!innerDiv) return null;

  const titleEl = innerDiv.querySelector('h3');
  const contentEl = innerDiv.querySelector('p');
  const titleText = titleEl ? titleEl.innerText : '';
  const { stepPrefix, title, fullTitle } = parseStepTitle(titleText);

  return {
    id: index,
    title,
    fullTitle,
    content: contentEl ? contentEl.innerHTML : '',
    plainText: contentEl ? contentEl.textContent : '',
    headingId: titleEl ? titleEl.id : `acc-heading-${index}`,
    stepPrefix,
  };
}

function extractData(el) {
  const steps = [];
  let seoData = {};
  const isSeoEnabled = el.classList.contains('seo');

  Array.from(el.children).forEach((item, index) => {
    const innerDivs = Array.from(item.children);
    if (innerDivs.length === 0) return;

    const isSeoMarker = innerDivs[0].textContent.trim() === CONFIG.SEO_MARKER;
    if (isSeoMarker) {
      if (isSeoEnabled && innerDivs.length > 1) {
        seoData = { ...seoData, ...extractSeoData(item) };
      }
      return;
    }

    const step = parseStep(item, index);
    if (step) steps.push(step);
  });

  return { steps, seoData };
}

// ===== INTERACTION =====

function handlePointerDown(e) {
  const item = e.currentTarget;
  item.dataset.startX = e.clientX;
  item.dataset.startY = e.clientY;
}

function isDragClick(e, item) {
  const startX = parseFloat(item.dataset.startX || 0);
  const startY = parseFloat(item.dataset.startY || 0);

  if (e.clientX !== 0 || e.clientY !== 0) {
    const diffX = Math.abs(e.clientX - startX);
    const diffY = Math.abs(e.clientY - startY);
    return diffX > CONFIG.CLICK_DRAG_THRESHOLD || diffY > CONFIG.CLICK_DRAG_THRESHOLD;
  }

  return false;
}

function setExpandedState(item, trigger, expanded) {
  trigger.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  item.classList.toggle('is-open', expanded);
}

function handleItemClick(e) {
  const item = e.currentTarget;
  if (isDragClick(e, item)) return;

  const interactiveTarget = e.target?.closest?.('a, input');
  if (interactiveTarget) return;

  const trigger = item.querySelector('.firefly-howto-trigger');
  if (!trigger) return;

  const clickedTrigger = e.target?.closest?.('.firefly-howto-trigger');
  const isExpanded = trigger.getAttribute('aria-expanded') === 'true';

  if (isExpanded) {
    setExpandedState(item, trigger, false);
  } else {
    if (!clickedTrigger) return;
    setExpandedState(item, trigger, true);
  }
}

// ===== DOM BUILDING =====

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

// ===== SEO SCHEMA =====

function buildSchema(steps, seoData) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: seoData.name,
    description: seoData.description,
    step: steps.map((item) => ({
      '@type': 'HowToStep',
      name: item.fullTitle,
      text: item.plainText,
    })),
  };

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

  return schema;
}

// ===== ORCHESTRATION =====

function decorateContent(el) {
  const { steps, seoData } = extractData(el);
  const foreground = createTag('div', { class: 'foreground' });

  steps.forEach((itemData) => {
    const itemNode = createAccordionItem(itemData);
    foreground.appendChild(itemNode);
  });

  el.innerHTML = '';
  el.appendChild(foreground);

  if (el.classList.contains('seo') && seoData.name && seoData.description) {
    const schema = buildSchema(steps, seoData);
    const script = createTag('script', { type: 'application/ld+json' }, JSON.stringify(schema));
    document.head.appendChild(script);
  }
}

// ===== PUBLIC INIT =====

export default function init(el) {
  try {
    el.classList.add('con-block');
    decorateContent(el);
  } catch (err) {
    logError('Firefly accordion init error', err);
  }
}
