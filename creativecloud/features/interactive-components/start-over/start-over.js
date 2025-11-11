import { createTag } from '../../../scripts/utils.js';

function btnLoadDelay(layer, button, delay, once = true) {
  const io = new IntersectionObserver((entries, observer) => {
    entries.forEach(async (entry) => {
      if (entry.isIntersecting) {
        if (once) observer.unobserve(entry.target);
        setTimeout(() => { button.style.display = 'flex'; }, delay);
      }
    });
  });
  io.observe(layer);
}

export async function waitForGenerateButton(data, timeout = 5000) {
  return new Promise((resolve) => {
    if (!data || !data.target || typeof data.target.querySelector !== 'function') {
      resolve(null);
      return;
    }

    const { target } = data;

    const existing = target.querySelector('.generate-button');
    if (existing?.offsetParent) {
      existing.focus();
      resolve(existing);
      return;
    }

    let timeoutId;

    const observer = new MutationObserver(() => {
      const generateBtn = target.querySelector('.generate-button');
      if (generateBtn?.offsetParent) {
        observer.disconnect();
        clearTimeout(timeoutId);
        generateBtn.focus();
        resolve(generateBtn);
      }
    });

    observer.observe(target, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class'],
    });

    timeoutId = setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, timeout);
  });
}

function getClosestHeadingText(element) {
  const section = element.closest('.section');
  const container = section.querySelector('.marquee, .aside');
  const textBlock = container.querySelector('.text');
  const heading = textBlock.querySelector('h1, h2, h3, h4, h5, h6');
  return heading.textContent.trim();
}

export default async function stepInit(data) {
  const config = data.stepConfigs[data.stepIndex];
  const lastp = config.querySelector(':scope > div > p:last-child');
  const btnConfig = lastp.textContent.trim();
  const btnLink = lastp.querySelector('a');
  const [btnText, delay] = btnConfig.split('|');
  const ariaLabel = getClosestHeadingText(data.target);
  data.target.classList.add('step-start-over');
  const layer = createTag('div', { class: `layer layer-${data.stepIndex}` });
  const startOverCTA = createTag('a', { class: 'gray-button start-over-button body-m next-step', href: '#', ...(ariaLabel && { 'aria-label': `${btnText}, ${ariaLabel}` }) });
  const svg = config.querySelector('picture img[src*=".svg"]:not(.accessibility-control)');
  if (svg) {
    svg.insertAdjacentElement('afterend', svg.cloneNode(true));
    startOverCTA.append(svg);
  }
  if (btnText) startOverCTA.appendChild(document.createTextNode(btnText.trim()));
  if (btnLink) startOverCTA.href = btnLink.href;
  if (!btnLink) {
    startOverCTA.addEventListener('click', async (e) => {
      e.preventDefault();
      if (layer.classList.contains('disable-click')) return;
      layer.classList.add('disable-click');
      await data.openForExecution;
      data.el.dispatchEvent(new CustomEvent(data.nextStepEvent));
      await waitForGenerateButton(data);
    });
  }
  if (delay) {
    const dInt = parseInt(delay, 10);
    const normDelay = dInt > 99 ? dInt : (dInt * 1000);
    btnLoadDelay(layer, startOverCTA, normDelay);
  } else startOverCTA.style.display = 'flex';
  layer.append(startOverCTA);
  return layer;
}
