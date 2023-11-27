import { setLibs } from '../../scripts/utils.js';
import { createEnticement } from '../interactive-elements/interactive-elements.js';
import defineDeviceByScreenSize from '../../scripts/decorate.js';

function handleTransition(index, pics) {
  pics[index].style.display = 'none';
  const nextIndex = (index + 1) % pics.length;
  pics[nextIndex].style.display = 'block';
  return nextIndex;
}

function startAutocycle(interval, pics, clickConfig) {
  if (clickConfig.isImageClicked) return;
  clickConfig.autocycleInterval = setInterval(() => {
    clickConfig.autocycleIndex = handleTransition(clickConfig.autocycleIndex, pics);
    if (clickConfig.autocycleIndex === pics.length - 1) {
      clearInterval(clickConfig.autocycleInterval);
    }
  }, interval);
}

function handleClick(pics, clickConfig) {
  pics[0].style.display = 'block';
  pics.forEach((pic, index) => {
    pic.querySelector('img')?.removeAttribute('loading');
    pic.addEventListener('click', () => {
      clickConfig.isImageClicked = true;
      if (clickConfig.autocycleInterval) clearInterval(clickConfig.autocycleInterval);
      handleTransition(index, pics);
    });
  });
}

function addEnticement(container, enticement, mode) {
  const svgUrl = enticement.querySelector('a').href;
  const enticementText = enticement.innerText;
  const entcmtEl = createEnticement(`${enticementText}|${svgUrl}`, mode);
  entcmtEl.classList.add('enticement');
  const n = container.children.length;
  const desktopMedia = container.querySelector('.desktop-media');
  const tabletMedia = (n > 2) ? container.querySelector('.tablet-media') : null;
  desktopMedia.insertBefore(entcmtEl, desktopMedia.firstElementChild);
  tabletMedia?.insertBefore(entcmtEl.cloneNode(true), tabletMedia.firstElementChild);
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
  const clickConfig = {
    autocycleIndex: 0,
    autocycleInterval: null,
    isImageClicked: false,
  };
  const miloLibs = setLibs('/libs');
  const { loadStyle } = await import(`${miloLibs}/utils/utils.js`);
  loadStyle('/creativecloud/features/genfill/genfill-interactive.css');
  const interactiveContainer = el.querySelector('.interactive-container');
  const allP = interactiveContainer.querySelectorAll('.media:first-child p:not(:empty)');
  const pMetadata = [...allP].filter((p) => !p.querySelector('picture'));
  const [enticementMode, enticement, timer = null] = [...pMetadata];

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
    handleClick(pictures, clickConfig);
    if (defineDeviceByScreenSize() === viewport.toUpperCase()) {
      setTimeout(() => {
        startAutocycle(intervalTime, pictures, clickConfig);
      }, delayTime);
    }
  });
  addEnticement(interactiveContainer, enticement, mode);
}
