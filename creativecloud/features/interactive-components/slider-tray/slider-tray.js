/* eslint-disable no-case-declarations */
/* eslint-disable no-use-before-define */
import { createTag, getConfig } from '../../../scripts/utils.js';
import defineDeviceByScreenSize from '../../../scripts/decorate.js';

const CSSRanges = {
  hue: { min: -180, zero: 0, max: 180 },
  saturation: { min: 0, zero: 100, max: 300 },
};

const PsRanges = {
  hue: { min: -180, zero: 0, max: 180 },
  saturation: { min: -100, zero: 0, max: 100 },
};

export default async function stepInit(data) {
  const imgObj = {};
  const layer = createTag('div', { class: `layer layer-${data.stepIndex}` });
  await createSelectorTray(data, layer);
  sliderEvent(data.target, layer, imgObj);
  uploadImage(data.target, layer, imgObj);
  continueToPs(layer, imgObj);
  return layer;
}

async function createSelectorTray(data, layer) {
  const sliderTray = createTag('div', { class: 'sliderTray' });
  const menu = createTag('div', { class: 'menu' });
  const config = data.stepConfigs[data.stepIndex];
  const options = config.querySelectorAll(':scope > div ul .icon, :scope > div ol .icon');
  [...options].forEach((o) => { handleInput(o, sliderTray, menu, layer); });
  layer.prepend(sliderTray);
  observeSliderTray(sliderTray, data.target, menu);
}

function handleInput(option, sliderTray, menu, layer) {
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
}

function observeSliderTray(sliderTray, targets) {
  const options = { threshold: 0.7 };
  const io = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const menu = sliderTray.querySelector('.menu');
      const outerCircle = menu.querySelector('.outerCircle');
      outerCircle.classList.add('showOuterBorder');
      setTimeout(() => { animateSlider(menu, targets); }, 800);
      observer.unobserve(entry.target);
    });
  }, options);
  io.observe(sliderTray);
}

function createSlider(sliderType, details, menu, sliderTray) {
  const sliderLabel = createTag('label', { for: `${sliderType}` }, details.trim());
  const sliderContainer = createTag('div', { class: `sliderContainer ${sliderType.toLowerCase()}` });
  const outerCircle = createTag('a', { class: 'outerCircle', href: '#', tabindex: '-1' });
  const analyticsHolder = createTag('div', { class: 'interactive-link-analytics-text' }, `Adjust ${sliderType} slider`);
  const input = createTag('input', {
    type: 'range',
    min: CSSRanges[sliderType].min,
    max: CSSRanges[sliderType].max,
    class: `options ${sliderType.toLowerCase()}-input`,
    value: `${sliderType === 'hue' ? '0' : '150'}`,
  });
  outerCircle.append(analyticsHolder);
  sliderContainer.append(input, outerCircle);
  menu.append(sliderLabel, sliderContainer);
  sliderTray.append(menu);
  outerCircle.addEventListener('click', (e) => {
    e.preventDefault();
  });
  applyAccessibility(input, outerCircle);
}

function createUploadButton(details, picture, sliderTray, menu) {
  const currentVP = defineDeviceByScreenSize().toLocaleLowerCase();
  const btn = createTag('input', { class: 'inputFile', type: 'file', accept: 'image/*' });
  const labelBtn = createTag('a', { class: `uploadButton body-${currentVP === 'mobile' ? 'm' : 'xl'}` }, details);
  const analyticsHolder = createTag('div', { class: 'interactive-link-analytics-text' }, `${details}`);
  labelBtn.append(btn, analyticsHolder);
  const svg = `<div class='svg-icon-container'>
  <svg xmlns="http://www.w3.org/2000/svg" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="evenodd" clip-rule="evenodd" viewBox="0 0 512 379.661"><path fill-rule="nonzero" d="M153.764 151.353c-7.838-.333-13.409-2.935-16.619-7.822-8.724-13.076 3.18-25.997 11.443-35.099 23.441-25.725 80.888-87.554 92.454-101.162 8.768-9.693 21.25-9.693 30.017 0 11.948 13.959 72.287 78.604 94.569 103.628 7.731 8.705 17.292 20.579 9.239 32.633-3.287 4.887-8.798 7.489-16.636 7.822H310.65v96.177c0 12.558-10.304 22.868-22.871 22.868h-63.544c-12.572 0-22.871-10.294-22.871-22.868v-96.177h-47.6zm-153 97.863c-2.622-10.841 1.793-19.33 8.852-24.342a24.767 24.767 0 018.47-3.838c3.039-.738 6.211-.912 9.258-.476 8.585 1.232 16.409 6.775 19.028 17.616a668.81 668.81 0 014.56 20.165 1259.68 1259.68 0 013.611 17.72c4.696 23.707 8.168 38.569 16.924 45.976 9.269 7.844 26.798 10.55 60.388 10.55h254.297c31.012 0 47.192-2.965 55.706-10.662 8.206-7.418 11.414-21.903 15.564-44.131a1212.782 1212.782 0 013.628-18.807c1.371-6.789 2.877-13.766 4.586-20.811 2.619-10.838 10.438-16.376 19.023-17.616 3.02-.434 6.173-.256 9.212.474 3.071.738 5.998 2.041 8.519 3.837 7.05 5.007 11.457 13.474 8.855 24.294l-.011.046a517.834 517.834 0 00-4.181 18.988c-1.063 5.281-2.289 11.852-3.464 18.144l-.008.047c-6.124 32.802-11.141 55.308-27.956 71.112-16.565 15.572-42.513 22.159-89.473 22.159H131.857c-49.096 0-76.074-5.911-93.429-21.279-17.783-15.75-23.173-38.615-30.047-73.314-1.39-7.029-2.728-13.738-3.638-18.091-1.281-6.11-2.6-12.081-3.979-17.761z"/></svg></div>`;
  labelBtn.innerHTML = svg + labelBtn.innerHTML;
  // appendSVGToButton(picture, labelBtn);
  const clone = labelBtn.cloneNode(true);
  clone.classList.add('uploadButtonMobile');
  const mobileInput = clone.querySelector('.inputFile');
  menu.append(clone);
  sliderTray.append(labelBtn);
  applyAccessibility(btn, labelBtn);
  applyAccessibility(mobileInput, clone);
}

function applyAccessibility(inputEle, target) {
  let tabbing = false;
  document.addEventListener('keydown', () => {
    tabbing = true;
    inputEle.addEventListener('focus', () => {
      if (tabbing) {
        target.classList.add('focusUploadButton');
      }
    });
    inputEle.addEventListener('blur', () => {
      target.classList.remove('focusUploadButton');
    });
  });
  document.addEventListener('keyup', () => {
    tabbing = false;
  });
}

function createUploadPSButton(details, picture, layer) {
  const btn = createTag('a', { class: 'continueButton body-xl hide', tabindex: '0' }, details);
  const analyticsHolder = createTag('div', { class: 'interactive-link-analytics-text' }, `${details}`);
  btn.append(analyticsHolder);
  const svg = `<div class='svg-icon-container'><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_1" x="0px" y="0px" viewBox="0 0 122.88 121.93" style="enable-background:new 0 0 122.88 121.93" xml:space="preserve"><g><path d="M8.33,0.02h29.41v20.6H20.36v80.7h82.1V84.79h20.36v37.14H0V0.02H8.33L8.33,0.02z M122.88,0H53.3l23.74,23.18l-33.51,33.5 l21.22,21.22L98.26,44.4l24.62,24.11V0L122.88,0z"/></g></svg></div>`;
  btn.innerHTML = svg + btn.innerHTML;
  // appendSVGToButton(picture, btn);
  layer.append(btn);
}

function appendSVGToButton(picture, button) {
  if (!picture) return;
  const svg = picture.querySelector('img[src*=svg]');
  if (!svg) return;
  const svgClone = svg.cloneNode(true);
  const svgCTACont = createTag('div', { class: 'svg-icon-container' });
  svgCTACont.append(svgClone);
  button.prepend(svgCTACont);
}

function sliderEvent(media, layer, imgObj) {
  let hue = 0;
  let saturation = 100;
  ['hue', 'saturation'].forEach((sel) => {
    const sliderEl = layer.querySelector(`.${sel.toLowerCase()}-input`);
    sliderEl.addEventListener('input', () => {
      const image = media.querySelector('.interactive-holder picture > img');
      const { value } = sliderEl;
      sliderEl.setAttribute('value', value);
      const outerCircle = sliderEl.nextSibling;
      const value1 = (value - sliderEl.min) / (sliderEl.max - sliderEl.min);
      const thumbPercent = 3 + (value1 * 94);
      const interactiveBlock = media.closest('.marquee') || media.closest('.aside');
      const isRowReversed = interactiveBlock.classList.contains('.row-reversed');
      if ((document.dir === 'rtl' || isRowReversed)) {
        outerCircle.style.right = `${thumbPercent}%`;
      } else {
        outerCircle.style.left = `${thumbPercent}%`;
      }
      switch (sel.toLowerCase()) {
        case ('hue'):
          hue = value;
          break;
        case ('saturation'):
          saturation = parseInt(value, 10);
          break;
        default:
          break;
      }
      image.style.filter = `hue-rotate(${hue}deg) saturate(${saturation}%)`;
      cssToPhotoshop(imgObj, sel.toLowerCase(), value);
    });
    sliderEl.addEventListener('change', () => {
      const outerCircle = sliderEl.nextSibling;
      outerCircle.click();
    });
  });
}

function cssToPhotoshop(imgObj, adjustment, value) {
  const unitValue = convertToUnit(adjustment, value, CSSRanges);
  imgObj[adjustment] = convertFromUnit(adjustment, unitValue, PsRanges);
}

function convertToUnit(adjustment, value, ranges) {
  if (value < ranges[adjustment].min || value > ranges[adjustment].max) {
    window.lana.log(`value out of range ${adjustment}:${value}`);
  }

  if (value < ranges[adjustment].zero) {
    const spread = ranges[adjustment].zero - ranges[adjustment].min;
    return (value - ranges[adjustment].min) / spread - 1;
  }
  const spread = ranges[adjustment].max - ranges[adjustment].zero;
  return (value - ranges[adjustment].zero) / spread;
}

function convertFromUnit(adjustment, value, ranges) {
  if (value < -1 || value > 1) {
    window.lana.log(`value out of range ${adjustment}:${value}`);
  }

  if (value < 0) {
    const spread = ranges[adjustment].zero - ranges[adjustment].min;
    const t = value + 1;
    return t * spread + ranges[adjustment].min;
  }
  const spread = ranges[adjustment].max - ranges[adjustment].zero;
  return value * spread + ranges[adjustment].zero;
}

function uploadImage(media, layer, imgObj) {
  layer.querySelectorAll('.uploadButton').forEach((btn) => {
    const analyticsBtn = btn.querySelector('.interactive-link-analytics-text');
    btn.addEventListener('cancel', () => {
      cancelAnalytics(btn);
    });
    btn.addEventListener('change', (event) => {
      const image = media.querySelector('picture > img');
      const file = event.target.files[0];
      if (!file.type.startsWith('image/')) return;
      if (file) {
        imgObj.fileName = file.name;
        const imageUrl = URL.createObjectURL(file);
        image.src = imageUrl;
        imgObj.imgSrc = imageUrl;
        analyticsBtn.innerHTML = 'Upload Button';
        const continueBtn = layer.querySelector('.continueButton');
        if (continueBtn) {
          continueBtn.classList.remove('hide');
        }
      } else {
        cancelAnalytics(btn);
      }
    });
  });
}

function continueToPs(layer, imgObj) {
  layer.querySelectorAll('.continueButton').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const actionJSONData = [
        {
          _obj: 'make',
          _target: [{ _ref: 'adjustmentLayer' }],
          using: {
            _obj: 'adjustmentLayer',
            type: {
              _obj: 'hueSaturation',
              adjustment: [
                {
                  _obj: 'hueSatAdjustmentV2',
                  hue: Math.round(imgObj.hue || 0),
                  lightness: 0,
                  saturation: Math.round(imgObj.saturation || 0),
                },
              ],
              colorize: false,
              presetKind: {
                _enum: 'presetKindType',
                _value: 'presetKindCustom',
              },
            },
          },
        },
      ];
      const { openInPsWeb } = await import('../../../deps/openInPsWeb/openInPsWeb.js');
      const imageData = await (await fetch(imgObj.imgSrc)).blob();
      const cs = getConfig();
      const enConf = cs.prodDomains.includes(window.location.host) ? cs.prod.psUrl : cs.stage.psUrl;
      openInPsWeb(
        enConf,
        imgObj.fileName,
        [{ filename: imgObj.fileName, imageData }],
        actionJSONData,
      );
    });
  });
}

function cancelAnalytics(btn) {
  const x = (e) => {
    e.preventDefault();
  };
  btn.addEventListener('click', x);
  const cancelEvent = new Event('click', { detail: { message: 'Cancel button clicked in file dialog' } });
  btn.setAttribute('daa-ll', 'Cancel Upload');
  btn.dispatchEvent(cancelEvent);
  btn.removeEventListener('click', x);
  btn.setAttribute('daa-ll', 'Upload Image');
}

function animateSlider(menu, target) {
  const option = menu.querySelector('.options');
  const aobj = { interrupted: false };
  const outerCircle = option.nextSibling;
  outerCircle.classList.add('animate');
  ['mousedown', 'touchstart', 'keyup'].forEach((e) => {
    option.closest('.sliderTray').addEventListener(e, () => {
      aobj.interrupted = true;
      outerCircle.classList.remove('showOuterBorder', 'animate', 'animateout');
    }, { once: true });
  });
  outerCircle.addEventListener('transitionend', () => {
    setTimeout(() => {
      const min = parseInt(option.min, 10);
      const max = parseInt(option.max, 10);
      const middle = (min + max) / 2;
      sliderScroll(option, middle, max, 1200, outerCircle, target, aobj);
    }, 500);
  }, { once: true });
}

function sliderScroll(slider, start, end, duration, outerCircle, target, aobj) {
  let current = start;
  let step = ((end - start) / duration) * 10;
  let direction = 1;
  function stepAnimation() {
    slider.value = current;
    current += step;
    if (aobj.interrupted) return;
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
    } else {
      setTimeout(stepAnimation, 10);
    }
  }
  setTimeout(stepAnimation, 10);
}
