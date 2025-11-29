import { createTag } from '../../scripts/utils.js';
import { Masonry } from '../shared/masonry.js';

function parseImageUrl(src) {
  if (!src) return { imageUrl: '', ext: 'jpg' };

  let imageUrl;
  let ext = 'jpg';
  try {
    const url = new URL(src, window.location.href);
    imageUrl = url.pathname;
    ext = imageUrl.substring(imageUrl.lastIndexOf('.') + 1) || 'jpg';
  } catch (e) {
    imageUrl = src.startsWith('/') ? src : `/${src}`;
    ext = imageUrl.substring(imageUrl.lastIndexOf('.') + 1) || 'jpg';
  }

  return { imageUrl, ext };
}

function getOptimizedImageUrl(src, width = '400') {
  const { imageUrl, ext } = parseImageUrl(src);
  if (!imageUrl) return '';
  return `${imageUrl}?width=${width}&format=${ext}&optimize=medium`;
}

function createOptimizedPicture(src, alt = '', eager = false, breakpoints = [
  { media: '(min-width: 600px)', width: '2000' },
  { width: '750' },
]) {
  const { imageUrl, ext } = parseImageUrl(src);
  if (!imageUrl) {
    return document.createElement('picture');
  }

  const picture = document.createElement('picture');

  breakpoints.forEach((br) => {
    const source = document.createElement('source');
    if (br.media) source.setAttribute('media', br.media);
    source.setAttribute('type', 'image/webp');
    source.setAttribute('srcset', `${imageUrl}?width=${br.width}&format=webply&optimize=medium`);
    picture.appendChild(source);
  });

  breakpoints.forEach((br, i) => {
    if (i < breakpoints.length - 1) {
      const source = document.createElement('source');
      if (br.media) source.setAttribute('media', br.media);
      source.setAttribute('srcset', `${imageUrl}?width=${br.width}&format=${ext}&optimize=medium`);
      picture.appendChild(source);
    } else {
      const img = document.createElement('img');
      img.setAttribute('loading', eager ? 'eager' : 'lazy');
      img.setAttribute('alt', alt);
      img.setAttribute('src', `${imageUrl}?width=${br.width}&format=${ext}&optimize=medium`);
      picture.appendChild(img);
    }
  });

  return picture;
}

function addTempWrapper($block, blockName) {
  const wrapper = document.createElement('div');
  const parent = $block.parentElement;
  wrapper.classList.add(`${blockName}-wrapper`);
  parent.insertBefore(wrapper, $block);
  wrapper.append($block);
}

async function fetchPreProData(url) {
  try {
    const response = await fetch(url);
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

function parseBlockProps(block) {
  const props = {
    jsonUrl: null,
    blankTemplate: null,
    limit: 24,
    buttonText: 'Edit this template',
  };

  const rows = Array.from(block.children);

  // First row: JSON URL
  if (rows.length > 0) {
    const firstRow = rows[0];
    const firstDiv = firstRow.querySelector('div');
    if (firstDiv) {
      props.jsonUrl = firstDiv.textContent.trim();
    }
  }

  // Second row: Blank Template (4 columns)
  if (rows.length > 1) {
    const secondRow = rows[1];
    const cols = secondRow.querySelectorAll('div');
    if (cols.length === 4) {
      const picture = cols[1].querySelector('picture');
      const link = cols[2].querySelector('a');
      const aspectRatio = cols[3].textContent.trim();

      props.blankTemplate = {
        picture: picture ? picture.cloneNode(true) : null,
        link: link ? {
          href: link.href,
          text: link.textContent.trim(),
        } : null,
        aspectRatio,
      };
    }
  }

  // Third row: Limit
  if (rows.length > 2) {
    const thirdRow = rows[2];
    const cols = thirdRow.querySelectorAll('div');
    if (cols.length === 2) {
      const limitValue = cols[1].textContent.trim();
      const parsedLimit = parseInt(limitValue, 10);
      if (!Number.isNaN(parsedLimit) && parsedLimit > 0) {
        props.limit = parsedLimit;
      }
    }
  }

  // Fourth row: Button text
  if (rows.length > 3) {
    const fourthRow = rows[3];
    const cols = fourthRow.querySelectorAll('div');
    if (cols.length === 2) {
      const buttonTextValue = cols[1].textContent.trim();
      if (buttonTextValue) {
        props.buttonText = buttonTextValue;
      }
    }
  }

  return props;
}

function createBlankTemplateCard(blankTemplate) {
  if (!blankTemplate || !blankTemplate.link) {
    return null;
  }

  // Create the template card similar to template-x.js placeholder structure
  const card = createTag('a', {
    class: 'template placeholder',
    href: blankTemplate.link.href || '#',
  });

  // First div: Picture
  const firstDiv = createTag('div');
  if (blankTemplate.picture) {
    firstDiv.append(blankTemplate.picture.cloneNode(true));
  }
  card.append(firstDiv);

  // Second div: Link container
  const linkContainer = createTag('div');
  const templateLink = createTag('span', { class: 'template-link' });
  templateLink.textContent = blankTemplate.link.text;
  linkContainer.append(templateLink);
  card.append(linkContainer);

  // Apply aspect ratio
  const width = 165; // Default width for sixcols
  let height = 293; // Default height for 9:16 aspect ratio

  if (blankTemplate.aspectRatio) {
    const sep = blankTemplate.aspectRatio.includes(':') ? ':' : 'x';
    const ratios = blankTemplate.aspectRatio.split(sep).map((e) => +e);
    if (ratios.length === 2 && ratios[0] && ratios[1]) {
      height = (ratios[1] / ratios[0]) * width;
    }
  }

  card.style.height = `${height}px`;

  if (height < 80) {
    card.classList.add('short');
  }
  if (width / height > 1.3) {
    card.classList.add('wide');
  }

  return card;
}

async function share(tooltip, timeoutId) {
  const urlWithTracking = 'test';
  await navigator.clipboard.writeText(urlWithTracking);
  tooltip.classList.add('display-tooltip');

  const rect = tooltip.getBoundingClientRect();
  const tooltipRightEdgePos = rect.left + rect.width;
  if (tooltipRightEdgePos > window.innerWidth) {
    tooltip.classList.add('flipped');
  }

  clearTimeout(timeoutId);
  return setTimeout(() => {
    tooltip.classList.remove('display-tooltip');
    tooltip.classList.remove('flipped');
  }, 2500);
}

function createShimmerPlaceholder() {
  // Create a simple shimmer placeholder card (no image, just the shimmer effect)
  const card = createTag('a', {
    class: 'template shimmer shimmer-placeholder',
    href: '#',
  });

  const stillWrapper = createTag('div', { class: 'still-wrapper' });
  const imageWrapper = createTag('div', { class: 'image-wrapper' });
  stillWrapper.append(imageWrapper);
  card.append(stillWrapper);

  return card;
}

function createTemplateCard(item, buttonText, eager = false) {
  const card = createTag('a', {
    class: 'template shimmer',
    href: item.deep_link_url || '#',
  });

  const stillWrapper = createTag('div', { class: 'still-wrapper' });
  const imageWrapper = createTag('div', { class: 'image-wrapper' });

  // Create picture element with optimized image
  const picture = createOptimizedPicture(
    item.image || '',
    item.alt_text || '',
    eager,
    [{ width: '400' }],
  );
  const img = picture.querySelector('img');
  if (img) {
    if (img.complete) {
      card.classList.remove('shimmer');
    } else {
      img.addEventListener('load', () => {
        card.classList.remove('shimmer');
      });
      img.addEventListener('error', () => {
        card.classList.remove('shimmer');
      });
    }
  }
  imageWrapper.append(picture);

  // Add video if available
  if (item.video) {
    const optimizedPosterUrl = getOptimizedImageUrl(item.image, '400');
    const video = createTag('video', {
      src: item.video,
      poster: optimizedPosterUrl,
      class: 'hidden',
    });
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = 'metadata'; // Preload video metadata for faster playback
    imageWrapper.append(video);
  }


  stillWrapper.append(imageWrapper);

  // Button container for hover overlay
  const buttonContainer = createTag('div', { class: 'button-container' });

  // Template link should be appended first (will appear at bottom with column-reverse)
  const templateLink = createTag('a', {
    href: item.deep_link_url || '#',
    title: buttonText,
    class: 'button accent small singleton-hover',
    'aria-label': `${buttonText} ${item.alt_text || ''}`,
    rel: 'nofollow',
    target: '_self',
  });
  templateLink.textContent = buttonText;
  buttonContainer.append(templateLink);

  // CTA link wrapping media wrapper should be appended second
  // (will appear at top with column-reverse)
  const ctaLink = createTag('a', {
    href: item.deep_link_url || '#',
    class: 'cta-link',
    tabindex: '-1',
    'aria-label': `${buttonText} ${item.alt_text || ''}`,
    rel: 'nofollow',
    target: '_self',
  });

  const mediaWrapper = createTag('div', { class: 'media-wrapper' });
  const clonedImageWrapper = imageWrapper.cloneNode(true);

  // tooltip
  const tooltip = createTag('div', {
    class: 'shared-tooltip',
    role: 'tooltip',
    tabindex: '-1',
    'aria-label': 'Copied to clipboard',
  });

  const tooltipIcon = createTag('img', {
    class: 'icon-checkmark-green',
    src: './checkmark-green.svg',
    alt: 'checkmark-green',
  });

  // share icon
  const shareIconWrapper = createTag('div', { class: 'share-icon-wrapper' });
  const shareIcon = createTag('img', { class: 'icon icon-share', src: './share-arrow.svg', tabindex: '0', alt: 'Share icon' });
  let timeoutId = null;
  shareIcon.addEventListener('click', (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    timeoutId = share(tooltip, timeoutId);
  });
  shareIcon.addEventListener('keypress', (e) => {
    if (e.key !== 'Enter') {
      return;
    }
    timeoutId = share(tooltip, timeoutId);
  });
  shareIconWrapper.append(shareIcon);

  // Append tooltip to wrapper
  shareIconWrapper.append(tooltip);
  tooltip.append(tooltipIcon, 'Copied to clipboard');
  clonedImageWrapper.append(shareIconWrapper);

  // In media-wrapper, hide the image since video has poster for loading state
  const clonedImg = clonedImageWrapper.querySelector('img');
  const clonedVideo = clonedImageWrapper.querySelector('video');
  if (clonedImg) clonedImg.classList.add('hidden');
  if (clonedVideo) {
    clonedVideo.classList.remove('hidden');
    // Restore video properties that are lost during cloneNode
    clonedVideo.muted = true;
    clonedVideo.loop = true;
    clonedVideo.playsInline = true;
    clonedVideo.preload = 'auto'; // Preload video for faster playback on hover
  }
  mediaWrapper.append(clonedImageWrapper);
  ctaLink.append(mediaWrapper);
  buttonContainer.append(ctaLink);

  // Add Free badge
  const freeBadge = createTag('span', { class: 'icon icon-free-badge' });
  freeBadge.textContent = 'Free';
  // imageWrapper.append(freeBadge);

  const ytShortsIcon = createTag('img', { class: 'icon icon-yt-shorts', src: './video-badge.svg' });
  // imageWrapper.append(ytShortsIcon);

  stillWrapper.querySelector('.image-wrapper').append(freeBadge, ytShortsIcon);

  card.append(stillWrapper);
  card.append(buttonContainer);

  return card;
}

async function renderPreProTemplates(el, data, props) {
  if (!data || !data.data || !Array.isArray(data.data)) {
    window.lana?.log('Invalid pre-pro data structure', { tags: 'pre-pro-api' });
    return [];
  }

  // Apply limit to JSON data (limit applies to cards in addition to blank template)
  const limitedData = data.data.slice(0, props.limit);

  // Create template cards from JSON data
  const templates = limitedData.map((item, index) => {
    const isEager = index < 6; // Eager load first 6 images
    return createTemplateCard(item, props.buttonText, isEager);
  });

  return templates;
}

function setupVideoHoverBehavior(el) {
  // Setup video hover behavior (exclude placeholders)
  el.querySelectorAll('.template:not(.placeholder)').forEach((template) => {
    const stillVideo = template.querySelector('.still-wrapper video');
    const stillImg = template.querySelector('.still-wrapper img');
    const mediaVideo = template.querySelector('.button-container .media-wrapper video');

    if (stillVideo && stillImg) {
      template.addEventListener('mouseenter', () => {
        // Hide images and show videos in still-wrapper
        if (stillImg) stillImg.classList.add('hidden');
        if (stillVideo) {
          stillVideo.classList.remove('hidden');
          stillVideo.currentTime = 0;
          stillVideo.play().catch(() => {
            // On error, show image back
            if (stillImg) stillImg.classList.remove('hidden');
          });
        }

        // Show video in media-wrapper (poster image shows while video loads)
        if (mediaVideo) {
          mediaVideo.classList.remove('hidden');
          mediaVideo.currentTime = 0;
          mediaVideo.play().catch(() => {
            // Ignore autoplay errors - poster will remain visible
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
      });
    }
  });

  // Dispatch links populated event
  const templateLinks = el.querySelectorAll('.template .button-container > a');
  templateLinks.isSearchOverride = true;
  const linksPopulated = new CustomEvent('linkspopulated', { detail: templateLinks });
  document.dispatchEvent(linksPopulated);
}

export default function init(el) {
  addTempWrapper(el, 'pre-pro');

  // Parse block props from DOM structure
  const props = parseBlockProps(el);

  // Clear the block content after parsing
  el.innerHTML = '';

  // Add sixcols class to block for masonry column calculation
  el.classList.add('sixcols');
  el.parentElement.classList.add('sixcols');

  // Fetch data from JSON URL if available
  if (!props.jsonUrl) {
    el.textContent = 'Error: JSON URL not found.';
    return;
  }

  // Create inner wrapper - start WITHOUT flex-masonry class for initial shimmer display
  const innerWrapper = createTag('div', { class: 'pre-pro-inner-wrapper pre-pro-loading' });
  el.append(innerWrapper);

  // Create initial shimmer placeholders to reserve space while data loads
  let blankTemplateCard = null;

  // Add blank template placeholder if available (this is the "Start from scratch" card)
  if (props.blankTemplate) {
    blankTemplateCard = createBlankTemplateCard(props.blankTemplate);
    if (blankTemplateCard) {
      innerWrapper.append(blankTemplateCard);
    }
  }

  // Add shimmer placeholders for the template cards that will come from JSON
  // These represent the `limit` number of cards from the API
  for (let i = 0; i < props.limit; i += 1) {
    innerWrapper.append(createShimmerPlaceholder());
  }

  // Fetch data in background - use .then() so function returns immediately
  // This allows the browser to render shimmer placeholders before moving to next section
  fetchPreProData(props.jsonUrl).then(async (data) => {
    if (data) {
      const templates = await renderPreProTemplates(el, data, props);

      if (templates.length > 0) {
        // Clear shimmer placeholders
        innerWrapper.innerHTML = '';
        innerWrapper.classList.remove('pre-pro-loading');
        innerWrapper.classList.add('flex-masonry');

        // Collect all real cells: blank template (if exists) + real templates from JSON
        const realCells = [];

        // Re-add the blank template first if it exists
        if (blankTemplateCard) {
          realCells.push(blankTemplateCard);
        }

        realCells.push(...templates);

        // Initialize and draw masonry with real cells
        const masonry = new Masonry(innerWrapper, realCells);
        masonry.draw();

        window.addEventListener('resize', () => {
          masonry.draw();
        });

        // Setup video hover after masonry has placed cards in the DOM
        const waitForTemplatesAndSetupHover = () => {
          const templatesInDom = el.querySelectorAll('.template:not(.placeholder)');
          if (templatesInDom.length > 0) {
            setupVideoHoverBehavior(el);
          } else {
            requestAnimationFrame(waitForTemplatesAndSetupHover);
          }
        };
        requestAnimationFrame(waitForTemplatesAndSetupHover);
      }
    } else {
      // Clear shimmer placeholders on error
      innerWrapper.innerHTML = '';
      el.textContent = 'Error loading templates, please refresh the page or try again later.';
    }
  });
}
