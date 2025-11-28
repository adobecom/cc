import {
  createTag,
//   getIconElement,
} from '../../scripts/utils.js';
import { Masonry } from '../shared/masonry.js';

function createOptimizedPicture(src, alt = '', eager = false, breakpoints = [
  { media: '(min-width: 600px)', width: '2000' },
  { width: '750' },
]) {
  if (!src) {
    // Return empty picture if no src
    return document.createElement('picture');
  }

  let imageUrl;
  let ext = 'jpg';
  try {
    // Parse URL to get pathname for optimization
    const url = new URL(src, window.location.href);
    imageUrl = url.pathname;
    ext = imageUrl.substring(imageUrl.lastIndexOf('.') + 1) || 'jpg';
  } catch (e) {
    // If URL parsing fails, use src as-is
    imageUrl = src.startsWith('/') ? src : `/${src}`;
    ext = imageUrl.substring(imageUrl.lastIndexOf('.') + 1) || 'jpg';
  }

  const picture = document.createElement('picture');

  // webp sources
  breakpoints.forEach((br) => {
    const source = document.createElement('source');
    if (br.media) source.setAttribute('media', br.media);
    source.setAttribute('type', 'image/webp');
    source.setAttribute('srcset', `${imageUrl}?width=${br.width}&format=webply&optimize=medium`);
    picture.appendChild(source);
  });

  // fallback sources and img
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

  // Second div: Link container (will be converted to span)
  const linkContainer = createTag('div');
  const templateLink = createTag('span', { class: 'template-link' });
  templateLink.textContent = blankTemplate.link.text;
  linkContainer.append(templateLink);
  card.append(linkContainer);

  // Third div: Aspect ratio (will be removed after processing)
  const aspectRatioDiv = createTag('div');
  aspectRatioDiv.textContent = blankTemplate.aspectRatio;
  card.append(aspectRatioDiv);

  // Apply aspect ratio similar to template-x.js
  if (blankTemplate.aspectRatio) {
    const sep = blankTemplate.aspectRatio.includes(':') ? ':' : 'x';
    const ratios = blankTemplate.aspectRatio.split(sep).map((e) => +e);
    if (ratios.length === 2 && ratios[1]) {
      const width = 165; // Default width for sixcols
      const height = (ratios[1] / ratios[0]) * width;
      card.style.height = `${height}px`;

      if (height < 80) {
        card.classList.add('short');
      }
      if (width / height > 1.3) {
        card.classList.add('wide');
      }
    }
    // Remove the aspect ratio div after processing
    aspectRatioDiv.remove();
  }

  return card;
}

function createTemplateCard(item, buttonText) {
  const card = createTag('a', {
    class: 'template',
    href: item.deep_link_url || '#',
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

async function renderPreProTemplates(el, data, props) {
  if (!data || !data.data || !Array.isArray(data.data)) {
    window.lana?.log('Invalid pre-pro data structure', { tags: 'pre-pro-api' });
    return;
  }

  const innerWrapper = el.querySelector('.pre-pro-inner-wrapper');
  if (!innerWrapper) {
    return;
  }

  // Apply limit to JSON data (limit applies to cards in addition to blank template)
  const limitedData = data.data.slice(0, props.limit);

  // Create template cards from JSON data
  const templates = limitedData.map((item) => createTemplateCard(item, props.buttonText));

  // Add regular templates (blank template is already in place)
  templates.forEach((template) => {
    innerWrapper.append(template);
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

export default async function init(el) {
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

  // Create inner wrapper
  const innerWrapper = createTag('div', { class: 'pre-pro-inner-wrapper' });
  el.append(innerWrapper);

  // Add blank template immediately if available
  if (props.blankTemplate) {
    const blankTemplateCard = createBlankTemplateCard(props.blankTemplate);
    if (blankTemplateCard) {
      innerWrapper.append(blankTemplateCard);
    }
  }

  // Fetch data and render templates
  const data = await fetchPreProData(props.jsonUrl);
  if (data) {
    await renderPreProTemplates(el, data, props);

    // Setup masonry with templates
    const templateCount = el.querySelectorAll('.template').length;
    if (templateCount > 6 || el.classList.contains('sixcols') || el.classList.contains('fullwidth')) {
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
  } else {
    el.textContent = 'Error loading templates, please refresh the page or try again later.';
  }
}
