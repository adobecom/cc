/* eslint-disable no-case-declarations */
/* eslint-disable no-use-before-define */
import { getLibs } from '../../../scripts/utils.js';
import defineDeviceByScreenSize from '../../../scripts/decorate.js';

const miloLibs = getLibs('/libs');
const { createTag } = await import(`${miloLibs}/utils/utils.js`);

export default async function stepInit(data) {
  console.log('data', data);
  const layer = createTag('div', { class: `layer layer-${data.stepIndex}` });
  createSelectorTray(data, layer);
  data.target.append(layer);
  sliderEvent(data.target);
  uploadImage(data.target);
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
    const inputType = option.classList[1].split('icon-')[1];
    const sibling = option.nextSibling;
    const text = sibling.nodeValue.trim();
    let picture = '';
    if (sibling.nextSibling && sibling.nextSibling.tagName === 'PICTURE') {
      picture = sibling.nextSibling;
    }
  switch (inputType) {
    case 'slider':
      createSlider(text, menu, sliderTray, targets);
      break;
    case 'upload':
      createUploadButton(text, picture, sliderTray, menu);
      break;
    case 'upload-ps':
      createUploadPSButton(text, picture, layer);
      break;
    default:
      console.log(`Unknown input type: ${inputType}`);
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
  const observer = new IntersectionObserver(handleIntersection(targets, menu), options);
  observer.observe(sliderTray);
}

function handleIntersection(targets, menu) {
  return function (entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.intersectionRatio === 1) {
        setTimeout(() => {
          animateSlider(menu, targets);
        }, 1000);
      }
    });
  };
}

function createSlider(details, menu, sliderTray, targets) {
  const [label, min, max] = details.split('|').map(item => item.trim());
  const l = createTag('label', { for: `${label}` }, label);
  const sliderContainer = createTag('div', { class: `sliderContainer ${label.toLowerCase()}` });
  const outerCircle = createTag('a', { class: 'outerCircle' });
  const input = createTag('input', { type: 'range', min, max, value: `${label.toLowerCase === 'hue' ? '50' : '50'}`, class: `options ${label.toLowerCase()}-input` });
  sliderContainer.append(input, outerCircle);
  menu.append(l, sliderContainer);
  sliderTray.append(menu);
  // setTimeout(() => animateSlider(menu, targets), 500)
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

function createUploadPSButton(details, picture, layer) {
  const btn = createTag('a', { class: 'continueButton body-xl hide' }, details);
  appendSVGToButton(picture, btn);
  layer.append(btn);
}

function appendSVGToButton(picture, button) {
  if (picture) {
    const svg = picture.querySelector('img[src*=svg]');
    if (svg) {
      const svgClone = svg.cloneNode(true);
      const cropCTACont = createTag('div', { class: 'crop-icon-container' });
      cropCTACont.append(svgClone);
      button.prepend(cropCTACont);
    }
  }
}

function sliderEvent(media) {
  ['hue', 'saturation'].forEach((sel) => {
    const sliderEl = media.querySelector(`.${sel.toLowerCase()}-input`);
    sliderEl.addEventListener('input', () => {
      const image = media.querySelector('picture > img');
      const { value } = sliderEl;
      const outerCircle = sliderEl.nextSibling;
      const rect = sliderEl.getBoundingClientRect();
      const value1 = (value - sliderEl.min) / (sliderEl.max - sliderEl.min);
      const thumbOffset = value1 * (rect.width - outerCircle.offsetWidth);
      outerCircle.style.left = `${thumbOffset + 8}px`;
      switch (sel.toLowerCase()) {
        case ('hue'):
          image.style.filter = `hue-rotate(${value}deg)`;
          break;
        case ('saturation'):
          image.style.filter = `saturate(${value}%)`;
          break;
        default:
          break;
      }
    });
  });
}

function uploadImage(media) {
  media.querySelectorAll('.uploadButton').forEach((btn) => {
    btn.addEventListener('change', function(event) {
      const image = media.querySelector('picture > img');
      const file = event.target.files[0];
      if (file) {
        const sources = media.querySelectorAll('source');
        sources.forEach(source => source.remove());
        const imageUrl = URL.createObjectURL(file);
        image.src = imageUrl;
        const continueBtn = media.querySelector('.continueButton');
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
      const min = parseInt(option.min);
      const max = parseInt(option.max);
      const middle = (min + max) / 2;
      sliderScroll(option, middle, max, 1200, outerCircle, targets);
    }, 500);
  }, { once: true });
}

function sliderScroll(slider, start, end, duration, outerCircle, target) {
  let current = start;
  let step = (end - start) / duration * 10;
  let direction = 1;
  function stepAnimation() {
    const rect = slider.getBoundingClientRect();
    current += step;
    slider.value = current;
    const value = (slider.value - slider.min) / (slider.max - slider.min);
    const thumbOffset = value * (rect.width - outerCircle.offsetWidth);
    outerCircle.style.left = `${thumbOffset + 8}px`;
    slider.dispatchEvent(new Event('input', { bubbles: true }));
    if ((step > 0 && current >= (start + 70)) || (step < 0 && current >= (start + 70))) {
      step = -step;
      setTimeout(stepAnimation, 10);
    } else if ((step > 0 && current <= (start - 70)) || (step < 0 && current <= (start - 70))) {
      step = -step;
      setTimeout(stepAnimation, 10);
      direction = -1;
    } else if (current >= start && direction === -1) {
      slider.value = current;
      const image = target.querySelector('picture > img');
      image.style.filter = `hue-rotate(${0}deg)`;
      setTimeout(() => {
        outerCircle.classList.remove('animate');
        outerCircle.classList.add('animateout');
      }, 500);
      return;
    } else {
      setTimeout(stepAnimation, 10);
    }
  }
  setTimeout(stepAnimation, 10);
}
