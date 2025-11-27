import {
  createTag,
//   getIconElement,
} from '../../scripts/utils.js';
// import { addTempWrapper } from '../../scripts/decorate.js';
import { Masonry } from '../shared/masonry.js';

// const API_URL = 'https://main--cc--adobecom.aem.page/drafts/suhjain/pre-pro/book.json';
const API_URL = 'https://main--cc--adobecom.aem.page/drafts/himani/pmr-yt.json';

async function fetchPreProData() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    window.lana?.log(`Failed to fetch pre-pro data: ${error.message}`, { tags: 'pre-pro-api' });
    return null;
  }
}

function createOptimizedPicture(src, alt = '', eager = false, breakpoints = [
  { media: '(min-width: 600px)', width: '2000' },
  { width: '750' },
]) {
  const url = new URL(src, window.location.href);
  const picture = document.createElement('picture');
  const { pathname } = url;
  const ext = pathname.substring(pathname.lastIndexOf('.') + 1);

  // webp
  breakpoints.forEach((br) => {
    const source = document.createElement('source');
    if (br.media) source.setAttribute('media', br.media);
    source.setAttribute('type', 'image/webp');
    source.setAttribute('srcset', `${pathname}?width=${br.width}&format=webply&optimize=medium`);
    picture.appendChild(source);
  });

  // fallback
  breakpoints.forEach((br, i) => {
    if (i < breakpoints.length - 1) {
      const source = document.createElement('source');
      if (br.media) source.setAttribute('media', br.media);
      source.setAttribute('srcset', `${pathname}?width=${br.width}&format=${ext}&optimize=medium`);
      picture.appendChild(source);
    } else {
      const img = document.createElement('img');
      img.setAttribute('loading', eager ? 'eager' : 'lazy');
      img.setAttribute('alt', alt);
      picture.appendChild(img);
      img.setAttribute('src', `${pathname}?width=${br.width}&format=${ext}&optimize=medium`);
    }
  });

  return picture;
}

function createTemplateCard(item) {
  const card = createTag('a', {
    class: 'template',
    href: item.deep_link_url ? `#${item.deep_link_url}` : '#',
  });

  const stillWrapper = createTag('div', { class: 'still-wrapper' });
  const imageWrapper = createTag('div', { class: 'image-wrapper' });

  // Create picture element with optimized image
  const picture = createOptimizedPicture(
    item.image || '',
    item.alt_text || '',
    true,
    [{ width: '400' }],
  );
  imageWrapper.append(picture);

  // Add video if available
  if (item.video) {
    const video = createTag('video', {
      src: item.video,
      muted: true,
      loop: true,
      playsinline: true,
      class: 'hidden',
    });
    imageWrapper.append(video);
  }

  // Add Free badge
  // const freeBadge = createTag('span', { class: 'icon icon-free-badge' });
  // freeBadge.textContent = 'Free';
  // imageWrapper.append(freeBadge);

  // Add Instagram-like icon at bottom center
  // const iconContainer = createTag('div', { class: 'icon-container' });
  // const instagramIcon = getIconElement('instagram')
  //   || createTag('span', { class: 'icon icon-instagram' });
  // iconContainer.append(instagramIcon);
  // imageWrapper.append(iconContainer);

  stillWrapper.append(imageWrapper);

  // Button container for hover overlay
  const buttonContainer = createTag('div', { class: 'button-container' });

  // Template link should be appended first (will appear at bottom with column-reverse)
  const templateLink = createTag('a', {
    href: item.deep_link_url ? `#${item.deep_link_url}` : '#',
    title: 'Edit this template',
    class: 'button accent small singleton-hover',
    'aria-label': `Edit this template ${item.alt_text || ''}`,
    rel: 'nofollow',
    target: '_self',
  });
  templateLink.textContent = 'Edit this template';
  buttonContainer.append(templateLink);

  // CTA link wrapping media wrapper should be appended second
  // (will appear at top with column-reverse)
  const ctaLink = createTag('a', {
    href: item.deep_link_url ? `#${item.deep_link_url}` : '#',
    class: 'cta-link',
    tabindex: '-1',
    'aria-label': `Edit this template ${item.alt_text || ''}`,
    rel: 'nofollow',
    target: '_self',
  });

  const mediaWrapper = createTag('div', { class: 'media-wrapper' });
  const clonedImageWrapper = imageWrapper.cloneNode(true);
  // In media-wrapper, hide the image and show the video (if exists)
  const clonedImg = clonedImageWrapper.querySelector('img');
  const clonedVideo = clonedImageWrapper.querySelector('video');
  if (clonedImg) clonedImg.classList.add('hidden');
  if (clonedVideo) clonedVideo.classList.remove('hidden');
  mediaWrapper.append(clonedImageWrapper);
  ctaLink.append(mediaWrapper);
  buttonContainer.append(ctaLink);

  card.append(stillWrapper);
  card.append(buttonContainer);

  return card;
}

function getLimitFromBlock(el) {
  // Check for limit attribute/data attribute for future configurability
  const limitAttr = el.dataset.limit || el.getAttribute('data-limit');
  if (limitAttr) {
    const parsed = parseInt(limitAttr, 10);
    if (!Number.isNaN(parsed) && parsed > 0) {
      return parsed;
    }
  }
  // Default limit is 24
  return 24;
}

async function renderPreProTemplates(el, data) {
  if (!data || !data.data || !Array.isArray(data.data)) {
    window.lana?.log('Invalid pre-pro data structure', { tags: 'pre-pro-api' });
    return;
  }

  const innerWrapper = createTag('div', { class: 'pre-pro-inner-wrapper' });
  el.append(innerWrapper);

  // Apply limit (default 24, configurable via data-limit attribute)
  const limit = getLimitFromBlock(el);
  const limitedData = data.data.slice(0, limit);

  const templates = limitedData.map((item) => createTemplateCard(item));
  templates.forEach((template) => {
    innerWrapper.append(template);
  });

  // Setup masonry layout if we have more than 6 items or if sixcols/fullwidth class is present
  const rows = templates.length;
  if (rows > 6 || el.classList.contains('sixcols') || el.classList.contains('fullwidth')) {
    innerWrapper.classList.add('flex-masonry');
    const cells = Array.from(innerWrapper.children);
    const masonry = new Masonry(innerWrapper, cells);
    masonry.draw();
    window.addEventListener('resize', () => {
      masonry.draw();
    });
  } else {
    el.classList.add('pre-pro-complete');
  }

  // Optimize images
  el.querySelectorAll(':scope picture > img').forEach((img) => {
    const { src, alt } = img;
    img.parentNode.replaceWith(createOptimizedPicture(src, alt, true, [{ width: '400' }]));
  });

  // Setup video hover behavior
  el.querySelectorAll('.template').forEach((template) => {
    const stillVideo = template.querySelector('.still-wrapper video');
    const stillImg = template.querySelector('.still-wrapper img');
    const mediaVideo = template.querySelector('.button-container .media-wrapper video');
    const mediaImg = template.querySelector('.button-container .media-wrapper img');

    if (stillVideo && stillImg) {
      template.addEventListener('mouseenter', () => {
        // Hide images and show videos in both still-wrapper and media-wrapper
        if (stillImg) stillImg.classList.add('hidden');
        if (stillVideo) {
          stillVideo.classList.remove('hidden');
          stillVideo.play().catch(() => {
            // Ignore autoplay errors
          });
        }
        if (mediaImg) mediaImg.classList.add('hidden');
        if (mediaVideo) {
          mediaVideo.classList.remove('hidden');
          mediaVideo.play().catch(() => {
            // Ignore autoplay errors
          });
        }
      });

      template.addEventListener('mouseleave', () => {
        // Show images and hide videos in both still-wrapper and media-wrapper
        if (stillVideo) {
          stillVideo.pause();
          stillVideo.classList.add('hidden');
        }
        if (stillImg) stillImg.classList.remove('hidden');
        if (mediaVideo) {
          mediaVideo.pause();
          mediaVideo.classList.add('hidden');
        }
        if (mediaImg) mediaImg.classList.remove('hidden');
      });
    }
  });

  // Dispatch links populated event
  const templateLinks = el.querySelectorAll('.template .button-container > a');
  templateLinks.isSearchOverride = true;
  const linksPopulated = new CustomEvent('linkspopulated', { detail: templateLinks });
  document.dispatchEvent(linksPopulated);
}

// eslint-disable-next-line import/prefer-default-export
function addTempWrapper($block, blockName) {
  const wrapper = document.createElement('div');
  const parent = $block.parentElement;
  wrapper.classList.add(`${blockName}-wrapper`);
  parent.insertBefore(wrapper, $block);
  wrapper.append($block);
}

export default async function init(el) {
  addTempWrapper(el, 'pre-pro');

  // Add sixcols class to block for masonry column calculation
  el.classList.add('sixcols');
  el.parentElement.classList.add('sixcols');

  const data = await fetchPreProData();
  if (data) {
    await renderPreProTemplates(el, data);
  } else {
    el.textContent = 'Error loading templates, please refresh the page or try again later.';
  }
}
