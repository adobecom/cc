import { getLibs } from '../../../scripts/utils.js';

function btnLoadDelay(layer, button, delay, once = true) {
  const io = new IntersectionObserver((entries, observer) => {
    entries.forEach(async (entry) => {
      if (entry.isIntersecting) {
        if (once) observer.unobserve(entry.target);
        setTimeout(() => button.style.opacity = 1, parseInt(delay));
      }
    });
  });
  io.observe(layer);
}

export default async function stepInit(data) {
  const miloLibs = getLibs('/libs');
  const { createTag, createIntersectionObserver } = await import(`${miloLibs}/utils/utils.js`);
  data.target.classList.add('step-start-over');
  const config = data.stepConfigs[data.stepIndex];
  const layer = createTag('div', { class: `layer layer-${data.stepIndex}` });
  const startOverCTA = createTag('a', { class: 'gray-button start-over-button body-m next-step', href: "#" });
  const svg = config.querySelector('img[src*=".svg"');
  if (svg) startOverCTA.append(svg.closest('picture'));
  const lastp = config.querySelector(':scope > div > p:last-child');
  const btnConfig = lastp.textContent.trim();
  const btnLink = lastp.querySelector('a');
  const [btnText, delay] = btnConfig.split('|');
  if (btnText) startOverCTA.appendChild(document.createTextNode(btnText.trim()));
  if (btnLink) startOverCTA.href = btnLink.href;
  if (!btnLink) {
    startOverCTA.addEventListener('click', async (e) => {
      e.preventDefault();
      await data.openForExecution;
      data.el.dispatchEvent(new CustomEvent(data.nextStepEvent));
    });
  }
  if (delay) btnLoadDelay(layer, startOverCTA, delay);
  else startOverCTA.style.opacity = 1;
  layer.append(startOverCTA);
  return layer;
}

