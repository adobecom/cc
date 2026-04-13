import { readFile, sendKeys } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';

document.body.innerHTML = await readFile({ path: './mocks/body.html' });
const { setLibs } = await import('../../../creativecloud/scripts/utils.js');
setLibs('https://milo.adobe.com/libs');
const { default: init } = await import('../../../creativecloud/blocks/firefly-howto/firefly-howto.js');

const ogBody = document.body.innerHTML;

function resetFixtureDom() {
  document.body.innerHTML = ogBody;
  document.head.querySelectorAll('script[type="application/ld+json"]').forEach((s) => s.remove());
}

function findHowToJsonLdScript() {
  const scripts = [...document.head.querySelectorAll('script[type="application/ld+json"]')];
  return scripts.find((s) => s.textContent.includes('"@type":"HowTo"'));
}

function findAllHowToJsonLdScripts() {
  return [...document.head.querySelectorAll('script[type="application/ld+json"]')].filter((s) => s.textContent.includes('"@type":"HowTo"'));
}

function parseHowToSchema() {
  const script = findHowToJsonLdScript();
  expect(script, 'expected HowTo application/ld+json script in document.head').to.exist;
  return JSON.parse(script.textContent);
}

describe('firefly-howto block', () => {
  beforeEach(() => {
    resetFixtureDom();
  });

  it('adds con-block and renders one accordion item per authored step', () => {
    const block = document.querySelector('#basic-howto');
    expect(block).to.exist;
    init(block);

    expect(block.classList.contains('con-block')).to.equal(true);
    const foreground = block.querySelector('.foreground');
    expect(foreground).to.exist;

    const items = foreground.querySelectorAll('.firefly-howto-item');
    expect(items.length).to.equal(2);

    const triggers = foreground.querySelectorAll('.firefly-howto-trigger');
    expect(triggers.length).to.equal(2);
    expect(triggers[0].getAttribute('aria-expanded')).to.equal('false');
    expect(triggers[0].getAttribute('aria-controls')).to.equal('panel-heading-step-a');
    expect(triggers[0].id).to.equal('btn-heading-step-a');

    const titles = foreground.querySelectorAll('.firefly-howto-title');
    expect(titles[0].textContent.trim()).to.equal('Choose a style');
    expect(titles[1].textContent.trim()).to.equal('Add details');

    const panels = foreground.querySelectorAll('.firefly-howto-panel');
    expect(panels[0].id).to.equal('panel-heading-step-a');
    expect(panels[0].querySelector('.firefly-howto-content p').textContent.trim()).to.equal('Pick a look for your project.');
  });

  it('opens when the trigger is clicked and closes on second click', () => {
    const block = document.querySelector('#basic-howto');
    init(block);

    const item = block.querySelector('.firefly-howto-item');
    const trigger = item.querySelector('.firefly-howto-trigger');

    trigger.click();
    expect(trigger.getAttribute('aria-expanded')).to.equal('true');
    expect(item.classList.contains('is-open')).to.equal(true);
    expect(trigger.getAttribute('daa-ll')).to.include('close-heading-step-a');

    trigger.click();
    expect(trigger.getAttribute('aria-expanded')).to.equal('false');
    expect(item.classList.contains('is-open')).to.equal(false);
    expect(trigger.getAttribute('daa-ll')).to.include('open-heading-step-a');
  });

  it('opens and closes via keyboard Enter on the native button trigger', async () => {
    const block = document.querySelector('#basic-howto');
    init(block);
    const item = block.querySelector('.firefly-howto-item');
    const trigger = item.querySelector('.firefly-howto-trigger');

    expect(trigger.tagName).to.equal('BUTTON');

    trigger.focus();
    await sendKeys({ press: 'Enter' });
    expect(trigger.getAttribute('aria-expanded')).to.equal('true');
    expect(item.classList.contains('is-open')).to.equal(true);

    await sendKeys({ press: 'Enter' });
    expect(trigger.getAttribute('aria-expanded')).to.equal('false');
    expect(item.classList.contains('is-open')).to.equal(false);
  });

  it('opens and closes via keyboard Space on the native button trigger', async () => {
    const block = document.querySelector('#basic-howto');
    init(block);
    const item = block.querySelector('.firefly-howto-item');
    const trigger = item.querySelector('.firefly-howto-trigger');

    expect(trigger.tagName).to.equal('BUTTON');

    trigger.focus();
    await sendKeys({ press: 'Space' });
    expect(trigger.getAttribute('aria-expanded')).to.equal('true');
    expect(item.classList.contains('is-open')).to.equal(true);

    await sendKeys({ press: 'Space' });
    expect(trigger.getAttribute('aria-expanded')).to.equal('false');
    expect(item.classList.contains('is-open')).to.equal(false);
  });

  it('closes an open item when clicking the item surface outside the trigger (not a link)', () => {
    const block = document.querySelector('#basic-howto');
    init(block);

    const item = block.querySelector('.firefly-howto-item');
    const trigger = item.querySelector('.firefly-howto-trigger');

    trigger.click();
    expect(trigger.getAttribute('aria-expanded')).to.equal('true');

    const panel = item.querySelector('.firefly-howto-panel');
    panel.click();
    expect(trigger.getAttribute('aria-expanded')).to.equal('false');
    expect(item.classList.contains('is-open')).to.equal(false);
  });

  it('does not open when pointer movement exceeds drag threshold before click', () => {
    const block = document.querySelector('#basic-howto');
    init(block);

    const item = block.querySelector('.firefly-howto-item');
    const trigger = item.querySelector('.firefly-howto-trigger');

    item.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 0, clientY: 0 }));
    trigger.dispatchEvent(
      new MouseEvent('click', { bubbles: true, clientX: 20, clientY: 0 }),
    );

    expect(trigger.getAttribute('aria-expanded')).to.equal('false');
  });

  it('opens when click movement is below drag threshold after pointerdown', () => {
    const block = document.querySelector('#basic-howto');
    init(block);
    const item = block.querySelector('.firefly-howto-item');
    const trigger = item.querySelector('.firefly-howto-trigger');
    item.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 0, clientY: 0 }));
    trigger.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 3, clientY: 2 }));
    expect(trigger.getAttribute('aria-expanded')).to.equal('true');
  });

  it('opens when click is at 0,0 after pointerdown at 0,0', () => {
    const block = document.querySelector('#basic-howto');
    init(block);
    const item = block.querySelector('.firefly-howto-item');
    const trigger = item.querySelector('.firefly-howto-trigger');
    item.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 0, clientY: 0 }));
    trigger.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 0, clientY: 0 }));
    expect(trigger.getAttribute('aria-expanded')).to.equal('true');
  });

  it('injects HowTo JSON-LD when block has class seo and name/description are present', () => {
    const block = document.querySelector('#seo-howto');
    init(block);

    const schema = parseHowToSchema();
    expect(schema['@context']).to.equal('https://schema.org');
    expect(schema['@type']).to.equal('HowTo');
    expect(schema.name).to.equal('Test HowTo Title');
    expect(schema.description).to.equal('A short description for schema.');
    expect(schema.totalTime).to.equal('PT15M');
    expect(schema.tool).to.deep.equal([
      { '@type': 'HowToTool', name: 'Brush' },
      { '@type': 'HowToTool', name: 'Pen' },
    ]);
    expect(schema.supply).to.deep.equal([
      { '@type': 'HowToSupply', name: 'Canvas' },
      { '@type': 'HowToSupply', name: 'Ink' },
    ]);
    expect(schema.step.length).to.equal(1);
    expect(schema.step[0]['@type']).to.equal('HowToStep');
    expect(schema.step[0].name).to.equal('Step 1 Do the thing');
    expect(schema.step[0].text.trim()).to.equal('Step body text.');
  });

  it('does not inject JSON-LD when seo block is missing name or description', () => {
    const block = document.querySelector('#seo-incomplete');
    init(block);
    expect(findHowToJsonLdScript()).to.be.undefined;
  });

  it('does not toggle when clicking a link inside the panel', () => {
    const block = document.querySelector('#with-link');
    init(block);
    const trigger = block.querySelector('.firefly-howto-trigger');
    document.querySelector('#inner-link').click();
    expect(trigger.getAttribute('aria-expanded')).to.equal('false');
  });

  it('does not toggle when clicking an input inside the panel', () => {
    const block = document.querySelector('#with-input');
    init(block);
    const trigger = block.querySelector('.firefly-howto-trigger');
    document.querySelector('#panel-input').dispatchEvent(
      new MouseEvent('click', { bubbles: true, cancelable: true }),
    );
    expect(trigger.getAttribute('aria-expanded')).to.equal('false');
  });

  it('does not open when collapsed and clicking the panel (not the trigger)', () => {
    const block = document.querySelector('#basic-howto');
    init(block);
    const item = block.querySelector('.firefly-howto-item');
    const trigger = item.querySelector('.firefly-howto-trigger');
    item.querySelector('.firefly-howto-panel').click();
    expect(trigger.getAttribute('aria-expanded')).to.equal('false');
  });

  it('logs to lana when init throws', () => {
    const logs = [];
    const prevLana = window.lana;
    try {
      window.lana = { log: (msg) => logs.push(String(msg)) };
      init(null);
      expect(logs.some((m) => m.includes('Firefly accordion init error'))).to.equal(true);
    } finally {
      window.lana = prevLana;
    }
  });

  it('does not throw when init fails and lana is unavailable', () => {
    const prevLana = window.lana;
    try {
      delete window.lana;
      let threw = false;
      try {
        init(null);
      } catch (e) {
        threw = true;
      }
      expect(threw).to.equal(false);
    } finally {
      window.lana = prevLana;
    }
  });

  it('uses prefix h3 id for trigger when title h3 has no id', () => {
    const block = document.querySelector('#prefix-id-only');
    init(block);
    const trigger = block.querySelector('.firefly-howto-trigger');
    expect(trigger.id).to.equal('btn-prefix-id');
    expect(trigger.getAttribute('aria-controls')).to.equal('panel-prefix-id');
  });

  it('skips a malformed step row with only one column', () => {
    const block = document.querySelector('#one-col-row');
    init(block);
    expect(block.querySelectorAll('.firefly-howto-item').length).to.equal(1);
    expect(block.querySelector('.firefly-howto-trigger').id).to.equal('btn-good');
  });

  it('uses acc-heading fallback for trigger and panel ids when step h3s have no id', () => {
    const block = document.querySelector('#no-h3-id');
    init(block);
    const trigger = block.querySelector('.firefly-howto-trigger');
    expect(trigger.id).to.equal('btn-acc-heading-0');
    expect(trigger.getAttribute('aria-controls')).to.equal('panel-acc-heading-0');
    expect(block.querySelector('.firefly-howto-panel').id).to.equal('panel-acc-heading-0');
  });

  it('skips an empty authored row and still renders following steps', () => {
    const block = document.querySelector('#skip-empty');
    init(block);
    expect(block.querySelectorAll('.firefly-howto-item').length).to.equal(1);
    expect(block.querySelector('.firefly-howto-trigger').id).to.equal('btn-hid');
  });

  it('does not merge SEO list or inject JSON-LD when block lacks class seo', () => {
    const block = document.querySelector('#marker-not-seo');
    init(block);
    expect(findHowToJsonLdScript()).to.be.undefined;
    expect(block.querySelectorAll('.firefly-howto-item').length).to.equal(1);
  });

  it('JSON-LD uses icon-seo-tool and icon-seo-supplies aliases and omits optional fields when absent', () => {
    init(document.querySelector('#seo-aliases-min'));
    const schema = parseHowToSchema();
    expect(schema.totalTime).to.equal(undefined);
    expect(schema.tool).to.deep.equal([
      { '@type': 'HowToTool', name: 'Wrench' },
      { '@type': 'HowToTool', name: 'Hammer' },
    ]);
    expect(schema.supply).to.deep.equal([
      { '@type': 'HowToSupply', name: 'Glue' },
      { '@type': 'HowToSupply', name: 'Tape' },
    ]);
  });

  it('JSON-LD includes tools but not supply when only tools are authored', () => {
    init(document.querySelector('#seo-tools-only'));
    const schema = parseHowToSchema();
    expect(schema.tool.length).to.equal(2);
    expect(schema.supply).to.equal(undefined);
  });

  it('JSON-LD includes supply but not tool when only supplies are authored', () => {
    init(document.querySelector('#seo-supply-only'));
    const schema = parseHowToSchema();
    expect(schema.supply.length).to.equal(2);
    expect(schema.tool).to.equal(undefined);
  });

  it('ignores SEO list rows without a span or with an unknown icon class', () => {
    init(document.querySelector('#seo-noisy-list'));
    const schema = parseHowToSchema();
    expect(schema.name).to.equal('GoodName');
    expect(schema.description).to.equal('GoodDesc');
  });

  it('JSON-LD has only name, description, and steps when no time, tools, or supplies are authored', () => {
    init(document.querySelector('#seo-minimal-only'));
    const schema = parseHowToSchema();
    expect(schema.name).to.equal('OnlyName');
    expect(schema.description).to.equal('OnlyDesc');
    expect(schema.totalTime).to.equal(undefined);
    expect(schema.tool).to.equal(undefined);
    expect(schema.supply).to.equal(undefined);
    expect(schema.step.length).to.equal(1);
  });

  it('injects independent HowTo JSON-LD per .firefly-howto.seo block without cross-contamination', () => {
    const first = document.querySelector('#seo-multi-first');
    const second = document.querySelector('#seo-multi-second');
    init(first);
    init(second);

    const scripts = findAllHowToJsonLdScripts();
    expect(scripts.length).to.equal(2);

    const byName = Object.fromEntries(
      scripts.map((s) => {
        const schema = JSON.parse(s.textContent);
        return [schema.name, schema];
      }),
    );

    const schemaA = byName['Multi First Name'];
    const schemaB = byName['Multi Second Name'];
    expect(schemaA, 'first block schema').to.exist;
    expect(schemaB, 'second block schema').to.exist;

    expect(schemaA['@type']).to.equal('HowTo');
    expect(schemaA.description).to.equal('Multi First Description');
    expect(schemaA.step.length).to.equal(1);
    expect(schemaA.step[0].name).to.equal('Part A Step one title');
    expect(schemaA.step[0].text.trim()).to.equal('Body for first block.');
    expect(schemaA.step.some((s) => s.text.includes('second block'))).to.equal(false);

    expect(schemaB['@type']).to.equal('HowTo');
    expect(schemaB.description).to.equal('Multi Second Description');
    expect(schemaB.step.length).to.equal(1);
    expect(schemaB.step[0].name).to.equal('Part B Step two title');
    expect(schemaB.step[0].text.trim()).to.equal('Body for second block.');
    expect(schemaB.step.some((s) => s.text.includes('first block'))).to.equal(false);

    expect(first.querySelectorAll('.firefly-howto-item').length).to.equal(1);
    expect(second.querySelectorAll('.firefly-howto-item').length).to.equal(1);
    expect(first.querySelector('.firefly-howto-title').textContent.trim()).to.equal('Step one title');
    expect(second.querySelector('.firefly-howto-title').textContent.trim()).to.equal('Step two title');
    expect(first.querySelector('.firefly-howto-trigger').id).to.equal('btn-seo-multi-h1');
    expect(second.querySelector('.firefly-howto-trigger').id).to.equal('btn-seo-multi-h2');
  });
});
