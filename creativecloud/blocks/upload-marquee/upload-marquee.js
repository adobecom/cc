import { createTag, getConfig, getLibs, getScreenSizeCategory } from '../../scripts/utils.js';

const miloLibs = getLibs('/libs');
const VIEWPORTS = ['mobile-up', 'tablet-up', 'desktop-up'];
const BRANDING_ARIA_KEYS = {
  brandingAltFirst: 'adobe-firefly-gen-ai',
  brandingAltSecond: 'adobe-firefly',
};
const BRANDING_ARIA_DEFAULTS = {
  brandingAltFirst: 'Adobe Firefly generative AI',
  brandingAltSecond: 'Adobe Firefly',
};
const BRANDING_ALT_KEYS = ['brandingAltFirst', 'brandingAltSecond'];
const CTA_ANALYTICS_KEY = 'Edit Photos CTA|UnityWidget';

// ===== LCP / MEDIA PRIORITY =====
const LCP_IMAGE_PARAMS = {
  webpLarge: 'width=1000&format=webply&optimize=medium',
  webpSmall: 'width=500&format=webply&optimize=medium',
  jpgLarge: 'width=1000&format=jpg&optimize=medium',
  jpgSmall: 'width=500&format=jpg&optimize=medium',
};

function getBaseImageUrlFromPicture(picture) {
  if (!picture) return null;

  const img = picture.querySelector('img');
  const imgSrc = img?.src;
  if (imgSrc) {
    return { baseUrl: imgSrc.split('?')[0], img };
  }

  const srcset = picture.querySelector('source[srcset]')?.srcset;
  if (!srcset) return null;

  const url = srcset.split(',')[0].trim().split(/\s+/)[0];
  const baseUrl = url ? url.split('?')[0] : null;
  return baseUrl && img ? { baseUrl, img } : null;
}

function rewritePictureToOurSizes(picture) {
  const result = getBaseImageUrlFromPicture(picture);
  if (!result?.baseUrl || !result.img) return null;

  const { baseUrl, img } = result;

  picture.textContent = '';
  picture.append(
    createTag('source', {
      type: 'image/webp',
      srcset: `${baseUrl}?${LCP_IMAGE_PARAMS.webpLarge}`,
      media: '(min-width: 600px)',
    }),
    createTag('source', {
      type: 'image/webp',
      srcset: `${baseUrl}?${LCP_IMAGE_PARAMS.webpSmall}`,
    }),
    createTag('source', {
      type: 'image/jpeg',
      srcset: `${baseUrl}?${LCP_IMAGE_PARAMS.jpgLarge}`,
      media: '(min-width: 600px)',
    }),
  );

  img.setAttribute('src', `${baseUrl}?${LCP_IMAGE_PARAMS.jpgSmall}`);
  img.removeAttribute('loading');
  img.removeAttribute('fetchpriority');
  picture.append(img);
  return img;
}

function setMediaRowPriority(mediaRow) {
  const screenCategory = getScreenSizeCategory({ mobile: 599, tablet: 1199 });
  const activeColumnIndex = { mobile: 0, tablet: 1, desktop: 2 }[screenCategory];

  [...mediaRow.children].forEach((column, index) => {
    const isActive = index === activeColumnIndex;
    const picture = column.querySelector('picture');

    if (picture) {
      const img = rewritePictureToOurSizes(picture);
      if (img) {
        img.setAttribute('loading', isActive ? 'eager' : 'lazy');
        if (isActive) img.setAttribute('fetchpriority', 'high');
      }
    }

    const video = column.querySelector('video');
    if (video) {
      video.setAttribute('preload', isActive ? 'auto' : 'metadata');
    }
  });
}

// ===== DOM BUILDERS =====
function applyViewportClasses(row) {
  row.firstElementChild?.classList.add('upload-grid');

  if (
    row.childElementCount === 2
    || row.childElementCount === 3
  ) {
    [...row.children].forEach((child, index) => {
      child.classList.add('upload-grid', VIEWPORTS[index]);
      if (row.childElementCount === 2 && index === 1) {
        child.className = 'upload-grid tablet-up desktop-up';
      }
    });
  } else if (row.childElementCount === 1) {
    row.firstElementChild?.classList.add(...VIEWPORTS);
  }

  return row;
}

function createBrandingLabelsLoader() {
  let labelsPromise;
  return async function getBrandingLabels() {
    if (!labelsPromise) {
      labelsPromise = (async () => {
        try {
          const config = getConfig();
          const { replaceKeyArray } = await import(
            `${miloLibs}/features/placeholders.js`
          );
          const labelKeys = Object.keys(BRANDING_ARIA_KEYS);
          const localizedValues = await replaceKeyArray(
            labelKeys.map((key) => BRANDING_ARIA_KEYS[key]),
            config,
          );
          return labelKeys.reduce((acc, key, index) => {
            acc[key] = localizedValues[index] || BRANDING_ARIA_DEFAULTS[key];
            return acc;
          }, {});
        } catch {
          return { ...BRANDING_ARIA_DEFAULTS };
        }
      })();
    }
    return labelsPromise;
  };
}

async function buildMarqueeContent(marqueeCell, getBrandingLabels) {
  const brandingLabels = await getBrandingLabels();
  const marqueeContent = createTag('div', { class: 'upload-marquee-content' });
  [...marqueeCell.children].forEach((child) => marqueeContent.append(child.cloneNode(true)));

  const brandingPara = marqueeContent.querySelector(':scope > p:first-child');
  const [firstPicture, secondPicture] = brandingPara
    ? [...brandingPara.querySelectorAll('picture')]
    : [];
  if (firstPicture && secondPicture) {
    const brandingRow = createTag('span', { class: 'upload-marquee-branding-row' });
    const firstWrap = createTag('span', { class: 'upload-marquee-branding-first' });
    const secondWrap = createTag('span', { class: 'upload-marquee-branding-second' });
    firstWrap.append(firstPicture.cloneNode(true));
    secondWrap.append(secondPicture.cloneNode(true));
    brandingRow.append(firstWrap, secondWrap);

    brandingPara.textContent = '';
    brandingPara.classList.add('upload-marquee-branding');
    brandingPara.append(brandingRow);
    brandingRow.querySelectorAll('picture img, img').forEach((img, index) => {
      img.setAttribute('loading', 'eager');
      const altKey = BRANDING_ALT_KEYS[index];
      const placeholderAlt = brandingLabels[altKey];
      if (placeholderAlt && (!img.getAttribute('alt') || img.getAttribute('alt').trim() === '')) {
        img.setAttribute('alt', placeholderAlt);
      }
    });
  }

  const ctaLink = marqueeContent.querySelector('p strong a[href]');
  if (ctaLink) {
    ctaLink.classList.add('con-button', 'upload-marquee-cta', 'no-track');
    ctaLink.setAttribute('aria-label', ctaLink.textContent.trim());
    ctaLink.setAttribute('daa-ll', CTA_ANALYTICS_KEY);
  }

  return marqueeContent;
}

function buildLayout() {
  const layout = createTag('div', { class: 'upload-marquee-layout' });
  const leftCol = createTag('div', { class: 'upload-marquee-left' });
  const rightCol = createTag('div', { class: 'upload-marquee-right' });
  const interactiveContainer = createTag('div', { class: 'interactive-container' });
  const mediaWrapper = createTag('div', { class: 'upload-marquee-media' });

  return {
    layout,
    leftCol,
    rightCol,
    interactiveContainer,
    mediaWrapper,
  };
}

function collectViewportMedia(mediaRow) {
  return [...mediaRow.children].map((content) => {
    const media = content.querySelector('picture, .video-container.video-holder');
    const viewportClasses = [...content.classList].filter((cls) => VIEWPORTS.includes(cls));
    const mediaContainer = media ? createTag('div', { class: 'media-container' }) : null;
    if (mediaContainer && media) mediaContainer.append(media);
    return { media: mediaContainer, viewportClasses };
  });
}

function appendViewportMedia(viewportContent, mediaWrapper) {
  viewportContent.forEach(({ media, viewportClasses }) => {
    if (media) {
      media.classList.add(...viewportClasses);
      mediaWrapper.append(media);
    }
  });
}

export default async function init(el) {
  const { decorateBlockBg } = await import(`${miloLibs}/utils/decorate.js`);

  el.classList.add('upload-marquee-block', 'con-block');
  const rows = el.querySelectorAll(':scope > div');
  if (rows.length < 2) return;

  const [backgroundRow, marqueeRow, ...contentRows] = rows;

  if (backgroundRow.textContent.trim() !== '') {
    backgroundRow.classList.add('background');
    decorateBlockBg(el, backgroundRow, { useHandleFocalpoint: true });
  }

  const { layout, leftCol, rightCol, interactiveContainer, mediaWrapper } = buildLayout();

  leftCol.classList.add('copy');
  const marqueeCell = marqueeRow.querySelector(':scope > div');
  if (!marqueeCell) return;

  const getBrandingLabels = createBrandingLabelsLoader();
  leftCol.append(await buildMarqueeContent(marqueeCell, getBrandingLabels));
  leftCol.append(interactiveContainer);

  const mediaRow = contentRows[0];
  if (mediaRow) {
    applyViewportClasses(mediaRow);
    setMediaRowPriority(mediaRow);
    appendViewportMedia(collectViewportMedia(mediaRow), mediaWrapper);
  }

  if (mediaWrapper.children.length) rightCol.append(mediaWrapper);
  layout.append(leftCol, rightCol);

  const foreground = createTag('div', { class: 'foreground' });
  foreground.append(layout);
  el.textContent = '';
  el.append(foreground);
}
