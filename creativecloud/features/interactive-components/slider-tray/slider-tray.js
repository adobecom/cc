/* eslint-disable no-case-declarations */
/* eslint-disable no-use-before-define */
import { getLibs } from '../../../scripts/utils.js';
import defineDeviceByScreenSize from '../../../scripts/decorate.js';

const miloLibs = getLibs('/libs');
const { createTag } = await import(`${miloLibs}/utils/utils.js`);

export default async function stepInit(data) {
  const layer = createTag('div', { class: `layer layer-${data.stepIndex}` });
  createSelectorTray(data, layer);
  sliderEvent(data.target, layer);
  uploadImage(data.target, layer);
  return layer;
}

function createSelectorTray(data, layer) {
  const sliderTray = createTag('div', { class: 'sliderTray' });
  const menu = createTag('div', { class: 'menu' });
  const config = data.stepConfigs[data.stepIndex];
  const options = config.querySelectorAll(':scope > div .icon');

  options.forEach((option) => {
    handleInput(option, data.target, sliderTray, menu, layer);
  });
  layer.append(sliderTray);
}

async function handleInput(option, targets, sliderTray, menu, layer) {
  let inputType = option.classList[1].split('icon-')[1];
  const sliderType = inputType.split('-')[0];
  if (inputType.includes('slider')) inputType = 'slider';
  const sibling = option.nextSibling;
  const text = sibling.nodeValue.trim();
  let picture = '';
  if (sibling.nextSibling && sibling.nextSibling.tagName === 'PICTURE') {
    picture = sibling.nextSibling;
  }
  switch (inputType) {
    case 'slider':
      createSlider(sliderType, text, menu, sliderTray);
      break;
    case 'upload':
      createUploadButton(text, picture, sliderTray, menu);
      break;
    case 'upload-ps':
      createUploadPSButton(text, picture, layer);
      break;
    default:
      window.lana.log(`Unknown input type: ${inputType}`);
      break;
  }
  observeSliderTray(sliderTray, targets, menu);
}

function observeSliderTray(sliderTray, targets, menu) {
  const options = {
    root: null,
    rootMargin: '0px',
    threshold: 1.0,
  };
  const io = new IntersectionObserver(handleIntersection(targets, menu), options);
  io.observe(sliderTray);
}

function handleIntersection(targets, menu) {
  return (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && entry.intersectionRatio === 1) {
        setTimeout(() => {
          animateSlider(menu, targets);
        }, 500);
        observer.unobserve(entry.target);
      }
    });
  };
}

function createSlider(sliderType, details, menu, sliderTray) {
  const [label, min, max] = details.split('|').map((item) => item.trim());
  const sliderLabel = createTag('label', { for: `${sliderType}` }, label);
  const sliderContainer = createTag('div', { class: `sliderContainer ${sliderType.toLowerCase()}` });
  const outerCircle = createTag('a', { class: 'outerCircle', href: '#' });
  const analyticsHolder = createTag('div', { class: 'interactive-link-analytics-text' }, `Adjust ${sliderType} slider`);
  const input = createTag('input', { type: 'range', min, max, class: `options ${sliderType.toLowerCase()}-input` });
  outerCircle.append(analyticsHolder);
  sliderContainer.append(input, outerCircle);
  menu.append(sliderLabel, sliderContainer);
  sliderTray.append(menu);
  outerCircle.addEventListener('click', (e) => {
    e.preventDefault();
  });
}

function createUploadButton(details, picture, sliderTray, menu) {
  const currentVP = defineDeviceByScreenSize().toLocaleLowerCase();
  const btn = createTag('input', { class: 'inputFile', type: 'file', accept: 'image/*', style: 'display: none;' });
  const labelBtn = createTag('label', { class: `uploadButton body-${currentVP === 'mobile' ? 'm' : 'xl'}` }, details);
  labelBtn.append(btn);
  appendSVGToButton(picture, labelBtn);
  const clone = labelBtn.cloneNode(true);
  clone.classList.add('uploadButtonMobile');
  menu.append(clone);
  sliderTray.append(labelBtn);
}

async function createUploadPSButton(details, picture, layer) {
  const btn = createTag('a', { class: 'continueButton body-xl hide' }, details);
  appendSVGToButton(picture, btn);
  layer.append(btn);
}

function appendSVGToButton(picture, button) {
  if (picture) {
    const svg = picture.querySelector('img[src*=svg]');
    if (svg) {
      const svgClone = svg.cloneNode(true);
      const svgCTACont = createTag('div', { class: 'svg-icon-container' });
      svgCTACont.append(svgClone);
      button.prepend(svgCTACont);
    }
  }
}

function sliderEvent(media, layer) {
  ['hue', 'saturation'].forEach((sel) => {
    const sliderEl = layer.querySelector(`.${sel.toLowerCase()}-input`);
    sliderEl.addEventListener('input', () => {
      const image = media.querySelector('.interactive-holder picture > img');
      const { value } = sliderEl;
      const outerCircle = sliderEl.nextSibling;
      const rect = sliderEl.getBoundingClientRect();
      const value1 = (value - sliderEl.min) / (sliderEl.max - sliderEl.min);
      const thumbOffset = value1 * (rect.width - outerCircle.offsetWidth);
      const interactiveBlock = media.closest('.marquee') || media.closest('.aside');
      const isRowReversed = interactiveBlock.classList.contains('.row-reversed');
      if ((document.dir === 'rtl' || isRowReversed)) {
        outerCircle.style.right = `${thumbOffset + 8}px`;
      } else {
        outerCircle.style.left = `${thumbOffset + 8}px`;
      }
      switch (sel.toLowerCase()) {
        case ('hue'):
          image.style.filter = `hue-rotate(${value}deg)`;
          outerCircle.click();
          break;
        case ('saturation'):
          image.style.filter = `saturate(${value}%)`;
          outerCircle.click();
          break;
        default:
          break;
      }
    });
  });
}

function uploadImage(media, layer) {
  layer.querySelectorAll('.uploadButton').forEach((btn) => {
    btn.addEventListener('change', (event) => {
      const image = media.querySelector('picture > img');
      const file = event.target.files[0];
      if (file) {
        const sources = image.querySelectorAll('source');
        sources.forEach((source) => source.remove());
        const imageUrl = URL.createObjectURL(file);
        image.src = imageUrl;
        const continueBtn = layer.querySelector('.continueButton');
        if (continueBtn) {
          continueBtn.classList.remove('hide');
        }
      }
    });
  });
}

function animateSlider(menu, targets) {
  const option = menu.querySelector('.options');
  const outerCircle = option.nextSibling;
  outerCircle.classList.add('animate');
  outerCircle.addEventListener('transitionend', () => {
    setTimeout(() => {
      const min = parseInt(option.min, 10);
      const max = parseInt(option.max, 10);
      const middle = (min + max) / 2;
      sliderScroll(option, middle, max, 1200, outerCircle, targets);
    }, 500);
  }, { once: true });
}

function sliderScroll(slider, start, end, duration, outerCircle, target) {
  let current = start;
  let step = ((end - start) / duration) * 10;
  let direction = 1;
  function stepAnimation() {
    slider.value = current;
    current += step;
    const rect = slider.getBoundingClientRect();
    const value = (slider.value - slider.min) / (slider.max - slider.min);
    const thumbOffset = value * (rect.width - outerCircle.offsetWidth);
    const interactiveBlock = target.closest('.marquee') || target.closest('.aside');
    const isRowReversed = interactiveBlock.classList.contains('row-reversed');
    if ((document.dir === 'rtl' || isRowReversed)) {
      outerCircle.style.right = `${thumbOffset + 8}px`;
      outerCircle.style.left = 'auto';
    } else {
      outerCircle.style.left = `${thumbOffset + 8}px`;
    }
    slider.dispatchEvent(new Event('input', { bubbles: true }));
    if ((step > 0 && current >= (start + 70)) || (step < 0 && current >= (start + 70))) {
      step = -step;
      setTimeout(stepAnimation, 10);
    } else if ((step > 0 && current <= (start - 70)) || (step < 0 && current <= (start - 70))) {
      step = -step;
      setTimeout(stepAnimation, 10);
      direction = -1;
    } else if (current === start && direction === -1) {
      slider.value = current;
      const image = target.querySelector('picture > img');
      image.style.filter = `hue-rotate(${0}deg)`;
      setTimeout(() => {
        outerCircle.classList.remove('animate');
        outerCircle.classList.add('animateout');
      }, 500);
      slider.dispatchEvent(new Event('input', { bubbles: true }));
      // eslint-disable-next-line no-useless-return
      return;
    } else {
      setTimeout(stepAnimation, 10);
    }
  }
  setTimeout(stepAnimation, 10);
}
