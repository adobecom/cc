import { setLibs } from '../../scripts/utils.js';
import { createEnticement } from '../interactive-elements/interactive-elements.js';

const miloLibs = setLibs('/libs');

const { loadStyle } = await import(`${miloLibs}/utils/utils.js`);

let autocycleInterval;
let isImageClicked = false;
let autocycleIndex = 0;

function handleTransition(index, pics) {
  pics[index].style.display = 'none';
  const nextIndex = (index + 1) % pics.length;
  pics[nextIndex].style.display = 'block';
  return nextIndex;
}

function startAutocycle(interval, pics) {
  if (isImageClicked) return;
  autocycleInterval = setInterval(() => {
    autocycleIndex = handleTransition(autocycleIndex, pics);
    if (autocycleIndex === pics.length - 1) {
      clearInterval(autocycleInterval);
    }
  }, interval);
}

function handleClick(pics) {
  pics[0].style.display = 'block';
  pics.forEach((picture, index) => {
    picture.querySelector('img')?.removeAttribute('loading');
    picture.addEventListener('click', () => {
      isImageClicked = true;
      if (autocycleInterval) clearInterval(autocycleInterval);
      handleTransition(index, pics);
    });
  });
}

function addEnticement(container, enticement, mode) {
const enticementElement = createEnticement(enticement.innerText, mode);
enticementElement.classList.add('enticement');
const n = container.children.length;
const desktopMedia = container.querySelector('.desktop-media');
const tabletMedia = (n > 2) ? container.querySelector('.tablet-media') : null;
desktopMedia.insertBefore(enticementElement, desktopMedia.firstElementChild);
tabletMedia?.insertBefore(enticementElement.cloneNode(true), tabletMedia.firstElementChild);
}

function getDeviceByScreenSize() {
  const screenWidth = window.innerWidth;
  if (screenWidth >= 1200) {
    return 'desktop';
  }
  if (screenWidth <= 600) {
    return 'mobile';
  }
  return 'tablet';
}

function removePTags(media) {
  const pics = media.querySelectorAll('picture');
  pics.forEach((pic) => {
    if (pic.closest('p')) {
      pic.closest('p').remove();
    }
    media.appendChild(pic);
  });
}

export default async function decorateGenfill(el) {
  loadStyle('/creativecloud/features/genfill/genfill-interactive.css');
  const interactiveContainer = el.querySelector('.interactive-container');
  const [enticementMode, enticement, timer] = interactiveContainer.firstElementChild.querySelectorAll('p:not(:has(picture))');

  enticementMode.classList.add('enticement-mode');
  enticement.classList.add('enticement-detail');
  timer?.classList.add('timer');
  const mode = enticementMode.innerText.includes('light') ? 'light' : 'dark';

  const timerValues = timer ? timer.innerText.split('|') : null;
  const [intervalTime = 2000, delayTime = 1000] = (timerValues && timerValues.length > 1)
    ? timerValues : [2000];

  enticementMode.remove();
  enticement.remove();
  timer?.remove();

  const viewports = ['mobile', 'tablet', 'desktop'];
  const mediaElements = interactiveContainer.querySelectorAll('.media');
  viewports.forEach((viewport, viewportIndex) => {
    const media = mediaElements[viewportIndex]
      ? mediaElements[viewportIndex] : interactiveContainer.lastElementChild;
    media.classList.add(`${viewport}-media`);
    removePTags(media);
    const pictures = media.querySelectorAll('picture');
    handleClick(pictures);
    if (getDeviceByScreenSize() === viewport) {
      setTimeout(() => {
        startAutocycle(intervalTime, pictures);
      }, delayTime);
    }
  });
  addEnticement(interactiveContainer, enticement, mode);
}
