import { getLibs } from '../../scripts/utils.js';
import { createEnticement } from '../interactive-elements/interactive-elements.js';
import defineDeviceByScreenSize from '../../scripts/decorate.js';

function handleTransition(pics, index) {
  pics[index].style.display = 'none';
  const nextIndex = (index + 1) % pics.length;
  pics[nextIndex].style.display = 'block';
  return nextIndex;
}

function startAutocycle(interval, pics, clickConfig) {
  if (clickConfig.isImageClicked) return;
  clickConfig.autocycleInterval = setInterval(() => {
    clickConfig.autocycleIndex = handleTransition(pics, clickConfig.autocycleIndex);
    if (clickConfig.autocycleIndex === pics.length - 1) {
      clearInterval(clickConfig.autocycleInterval);
    }
  }, interval);
}

function handleClick(aTags, clickConfig) {
  aTags.forEach((a, i) => {
    a.querySelector('img').removeAttribute('loading');
    a.addEventListener('click', () => {
      clickConfig.isImageClicked = true;
      if (clickConfig.autocycleInterval) clearInterval(clickConfig.autocycleInterval);
      handleTransition(aTags, i);
    });
  });
}

async function addEnticement(container, enticement, mode) {
  const svgUrl = enticement.querySelector('a').href;
  const enticementText = enticement.innerText;
  const entcmtEl = await createEnticement(`${enticementText}|${svgUrl}`, mode);
  entcmtEl.classList.add('enticement');
  const n = container.children.length;
  const desktopMedia = container.querySelector('.desktop-only');
  const tabletMedia = (n > 2) ? container.querySelector('.tablet-only') : null;
  desktopMedia.insertBefore(entcmtEl, desktopMedia.firstElementChild);
  tabletMedia?.insertBefore(entcmtEl.cloneNode(true), tabletMedia.firstElementChild);
}

async function removePTags(media, vi) {
  const heading = media.closest('.foreground').querySelector('h1, h2, h3, h4, h5, h6');
  const hText = heading.id
    .split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('');
  const miloLibs = getLibs();
  const { createTag } = await import(`${miloLibs}/utils/utils.js`);
  const pics = media.querySelectorAll('picture');
  pics.forEach((pic, index) => {
    if (pic.closest('p')) pic.closest('p').remove();
    const a = createTag('a', { class: 'genfill-link' });
    const img = pic.querySelector('img');
    const altTxt = img.alt
      ? `${img.alt}|Marquee|${hText}`
      : `Image-${vi}-${index}|Marquee|${hText}`;
    a.setAttribute('daa-ll', altTxt);
    a.appendChild(pic);
    media.appendChild(a);
  });
}

export default async function decorateGenfill(el) {
  const clickConfig = {
    autocycleIndex: 0,
    autocycleInterval: null,
    isImageClicked: false,
  };
  const interactiveContainer = el.querySelector('.interactive-container');
  const allP = interactiveContainer.querySelectorAll('.media:first-child p');
  const pMetadata = [...allP].filter((p) => !p.querySelector('picture'));
  const [enticement, timer = null] = [...pMetadata];
  enticement.classList.add('enticement-detail');
  timer?.classList.add('timer');
  const mode = el.classList.contains('light') ? 'light' : 'dark';
  const timerValues = timer ? timer.innerText.split('|') : null;
  const [intervalTime = 2000, delayTime = 1000] = (timerValues && timerValues.length > 1)
    ? timerValues : [2000];
  [enticement, timer].forEach((i) => i?.remove());
  const viewports = ['mobile', 'tablet', 'desktop'];
  const mediaElements = interactiveContainer.querySelectorAll('.media');
  mediaElements.forEach(async (mediaEl, index) => {
    await removePTags(mediaEl, index);
    const aTags = mediaEl.querySelectorAll('a');
    handleClick(aTags, clickConfig);
  });
  viewports.forEach((v, vi) => {
    const media = mediaElements[vi]
      ? mediaElements[vi]
      : interactiveContainer.lastElementChild;
    media.classList.add(`${v}-only`);
    if (defineDeviceByScreenSize() === v.toUpperCase()) {
      setTimeout(() => {
        const aTags = media.querySelectorAll('a');
        startAutocycle(intervalTime, aTags, clickConfig);
      }, delayTime);
    }
  });
  addEnticement(interactiveContainer, enticement, mode);
}
