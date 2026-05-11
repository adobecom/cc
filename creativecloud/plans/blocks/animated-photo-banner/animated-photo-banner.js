// Animated Photo Banner Component
// Provides animated image galleries with wave-based animations and responsive behavior
// TODO: Write a more detailed authoring document in repo

import { createTag, getScreenSizeCategory, prefersReducedMotion } from '../../scripts/utils.js';

// Configuration constants
const CONFIG = {
  WAVE_DELAY: 300,
  ANIMATION_BUFFER: 500,
  TRANSITION_DELAY: 50,
  FADE_DURATION: 800,
  TRANSFORM_DURATION: 1500,
  HEADER_DELAY: 1200,
  DEFAULT_SCALE: 1,
  DEFAULT_POSITION: [50, 50],
  DEFAULT_HEADER_POSITION: [50, 10],
  DEFAULT_WIDTH_CLASS: 'md',
  WAVE_INITIAL_DELAY: 300,
  DESKTOP_TABLET_WIDTH: {
    ORIGINAL: 2000,
    OPTIMIZED: 1000,
  },
  MOBILE_WIDTH: {
    ORIGINAL: 750,
    OPTIMIZED: 500,
  },
};

const LANA_OPTIONS = { tags: 'animated-photo-banner', errorType: 'i' };
const DETECTED_VIEWPORT = getScreenSizeCategory({ mobile: 599, tablet: 1199 });

// ===== UTILITY FUNCTIONS =====

function logError(message, error) {
  window.lana?.log(`${message}: ${error}`, LANA_OPTIONS);
}

function setElementTransform(element, xPosition, yPosition, scale = CONFIG.DEFAULT_SCALE) {
  element.style.transform = `translate(calc(${xPosition}vw - 50%), calc(${yPosition}rem - 50%)) scale(calc(${scale}))`;
}

function setElementVisibility(element, visible, duration = CONFIG.FADE_DURATION) {
  element.style.opacity = visible ? '1' : '0';
  if (duration > 0) {
    element.style.transition = `opacity ${duration / 1000}s ease-out`;
  }
}

function getViewportParams(params, viewport = DETECTED_VIEWPORT) {
  return params[viewport] || params.mobile || {};
}

function getPositionWithFallback(params, positionKey = 'end-pos', fallback = CONFIG.DEFAULT_POSITION) {
  return params[positionKey] || params['start-pos'] || fallback;
}

function calculateAnimationTiming(maxWave) {
  const totalWavesAppearTime = maxWave * CONFIG.WAVE_DELAY;
  return {
    totalWavesAppearTime,
    totalAnimationTime: totalWavesAppearTime + CONFIG.HEADER_DELAY,
    finalPhaseDelay: totalWavesAppearTime + CONFIG.ANIMATION_BUFFER,
  };
}

function addTransitionStyles(element, includeTransform = true) {
  const transitions = [`opacity ${CONFIG.FADE_DURATION / 1000}s ease-out`];
  if (includeTransform) {
    transitions.push(`transform ${CONFIG.TRANSFORM_DURATION / 1000}s ease-in-out`);
  }
  element.style.transition = transitions.join(', ');
}

function removeTransformTransition(element) {
  // Keep only the opacity transition
  element.style.transition = `opacity ${CONFIG.FADE_DURATION / 1000}s ease-out`;
}

// ===== PARAMETER PROCESSING =====

function parseParamValue(key, value) {
  if (key === 'start-pos' || key === 'end-pos') {
    return value.split(',').map((coord) => parseFloat(coord));
  }
  return ['scale', 'wave', 'height'].includes(key) ? parseFloat(value) : value;
}

function extractParams(paramDiv) {
  return Array.from(paramDiv.querySelectorAll('p')).reduce((params, p) => {
    const text = p.textContent.trim().toLowerCase();
    const [key, value] = text.split('=');

    if (value !== undefined) {
      params[key] = parseParamValue(key, value);
    }
    return params;
  }, {});
}

function extractViewportParamsFromDivs(viewportDivs) {
  const params = {};

  viewportDivs.forEach((div, index) => {
    try {
      const viewportParams = extractParams(div);
      if (viewportParams.viewport) {
        params[viewportParams.viewport] = viewportParams;
      }
    } catch (err) {
      logError('Viewport parameter extraction', `Failed to extract params from div ${index}: ${err}`);
    }
  });

  return params;
}

// ===== ANIMATION HELPER FUNCTIONS =====

function groupImagesByWave(images, paramsList) {
  const waveGroups = {};
  let maxWave = 1;

  images.forEach((image, index) => {
    const params = paramsList[index];
    const viewportParams = getViewportParams(params);
    const wave = viewportParams.wave ?? 1;

    if (wave > maxWave) maxWave = wave;

    if (!waveGroups[wave]) {
      waveGroups[wave] = [];
    }

    waveGroups[wave].push({
      element: image,
      params: viewportParams,
      index,
    });
  });

  return { waveGroups, maxWave };
}

function initializeImageStates(waveGroups) {
  Object.entries(waveGroups).forEach(([wave, waveImages]) => {
    const waveNumber = parseInt(wave, 10);

    waveImages.forEach(({ element, params }) => {
      if (waveNumber === 0) {
        // Wave 0: Show immediately in final position
        const endPos = getPositionWithFallback(params);
        setElementTransform(element, endPos[0], endPos[1], params.scale);
        setElementVisibility(element, true, 0);
        return;
      }

      // Other waves: Hide initially
      setElementVisibility(element, false, 0);
    });
  });
}

function setupHeaderInitialState(header, headerParams) {
  if (!header || Object.keys(headerParams).length === 0) return;

  const viewportParams = getViewportParams(headerParams);
  const endPos = getPositionWithFallback(viewportParams, 'end-pos', CONFIG.DEFAULT_HEADER_POSITION);

  setElementVisibility(header, false, 0);
  if (endPos[0] !== undefined) header.style.left = `${endPos[0]}rem`;
  if (endPos[1] !== undefined) header.style.top = `${endPos[1]}rem`;
}

function animateWaveSequence(waveGroups) {
  const waves = Object.keys(waveGroups)
    .filter((wave) => parseInt(wave, 10) > 0) // Exclude wave -1 and 0
    .sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

  waves.forEach((wave, index) => {
    setTimeout(() => {
      const waveImages = waveGroups[wave];

      waveImages.forEach(({ element, params }) => {
        const startPos = getPositionWithFallback(params, 'start-pos');
        const scale = params.scale || CONFIG.DEFAULT_SCALE;

        // Set initial position with inverted scale
        setElementTransform(element, startPos[0], startPos[1], 1 / scale);

        // Fade in the image
        setElementVisibility(element, true, CONFIG.FADE_DURATION);
      });
    }, index * CONFIG.WAVE_DELAY + CONFIG.WAVE_INITIAL_DELAY);
  });
}

function animateToFinalPositions(images, paramsList, timing) {
  setTimeout(() => {
    images.forEach((image, index) => {
      const params = paramsList[index];
      const viewportParams = getViewportParams(params);
      const wave = viewportParams.wave || 1;

      // Skip immediate images
      if (wave === 0) return;

      const endPos = getPositionWithFallback(viewportParams);

      // Add transition and animate to final position
      addTransitionStyles(image, true);
      setElementTransform(image, endPos[0], endPos[1], CONFIG.DEFAULT_SCALE);

      // Remove transform transition after animation completes
      setTimeout(() => {
        removeTransformTransition(image);
      }, CONFIG.TRANSFORM_DURATION);
    });
  }, timing.finalPhaseDelay);
}

function showHeader(header, headerParams, timing) {
  if (!header || Object.keys(headerParams).length === 0) return;

  const viewportParams = getViewportParams(headerParams);
  const wave = viewportParams.wave ?? 1;

  if (wave === 0) {
    // Show header immediately for wave 0
    setElementVisibility(header, true, 0);
  } else {
    // Show header after animation delay
    setTimeout(() => {
      header.style.transition = `opacity ${(CONFIG.FADE_DURATION * 1.5) / 1000}s ease-out`;
      setElementVisibility(header, true, 0);
    }, timing.totalAnimationTime);
  }
}

// ===== ANIMATION ORCHESTRATION =====

function overrideForReducedMotion(paramsList, headerParams) {
  if (!prefersReducedMotion()) {
    return;
  }

  // Override image params
  paramsList.forEach((params) => {
    Object.keys(params).forEach((viewport) => {
      // All images appear immediately with no scaling
      if (params[viewport]) {
        params[viewport].wave = 0;
        params[viewport].scale = 1;
      }
    });
  });

  if (headerParams) {
    Object.keys(headerParams).forEach((viewport) => {
      if (headerParams[viewport]) {
        // Make header appear immediately
        headerParams[viewport].wave = 0;
      }
    });
  }
}

function createAnimationSequence(container, images, paramsList, headerParams) {
  const header = container.querySelector('.animated-photo-banner-header');

  // Group images and get timing
  const { waveGroups, maxWave } = groupImagesByWave(images, paramsList);
  const timing = calculateAnimationTiming(maxWave);

  // Initialize all states
  initializeImageStates(waveGroups);
  setupHeaderInitialState(header, headerParams);

  // Run animation sequence
  animateWaveSequence(waveGroups);
  animateToFinalPositions(images, paramsList, timing);
  showHeader(header, headerParams, timing);
}

function waitForImagesAndStartAnimation(container, images, paramsList, headerParams) {
  const imgElements = Array.from(container.querySelectorAll('img'));
  const startAnimation = () => createAnimationSequence(container, images, paramsList, headerParams);

  if (imgElements.length === 0) {
    startAnimation();
    return;
  }

  Promise.all(
    imgElements.map((img) => new Promise((resolve) => {
      if (img.complete) {
        resolve();
      } else {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      }
    })),
  ).then(startAnimation);
}

function setupAnimation(container, paramsList, headerParams) {
  try {
    const images = container.querySelectorAll('.animated-photo-banner-image');
    overrideForReducedMotion(paramsList, headerParams);
    waitForImagesAndStartAnimation(container, images, paramsList, headerParams);
  } catch (err) {
    logError('Error setting up animation', err);
  }
}

// ===== DOM BUILDING FUNCTIONS =====

function optimizeImageWidth(url) {
  return url
    .replace(new RegExp(`width=${CONFIG.DESKTOP_TABLET_WIDTH.ORIGINAL}`, 'g'), `width=${CONFIG.DESKTOP_TABLET_WIDTH.OPTIMIZED}`)
    .replace(new RegExp(`width=${CONFIG.MOBILE_WIDTH.ORIGINAL}`, 'g'), `width=${CONFIG.MOBILE_WIDTH.OPTIMIZED}`);
}

function createMainContainer() {
  const container = createTag('div', { class: 'animated-photo-banner-container' });
  const imagesContainer = createTag('div', { class: 'animated-photo-banner-images' });
  container.appendChild(imagesContainer);

  return { container, imagesContainer };
}

function processImageSections(el, imagesContainer) {
  const imageSections = Array.from(el.children).slice(2);
  const imageParams = [];

  imageSections.forEach((section, index) => {
    try {
      const pictureEl = section.querySelector('picture');
      if (!pictureEl) {
        logError('Image section processing', `No picture element found in section ${index}`);
        return;
      }

      const viewportDivs = Array.from(section.children).slice(1);

      // Extract animation parameters for each viewport
      const params = extractViewportParamsFromDivs(viewportDivs);

      // Skip hidden images (wave=-1) to avoid unnecessary DOM creation and image loading
      const viewportParams = getViewportParams(params);
      if (viewportParams.wave === -1) return;

      // Create image wrapper with the picture
      const imageWrapper = createTag('div', { class: 'animated-photo-banner-image' });
      const widthClass = params[DETECTED_VIEWPORT]?.width || CONFIG.DEFAULT_WIDTH_CLASS;
      imageWrapper.classList.add(`w-${widthClass}`);

      // Initially hide all images to prevent flash
      imageWrapper.style.opacity = '0';

      try {
        // Optimize image URLs before cloning
        const optimizedPicture = pictureEl.cloneNode(true);
        const sources = optimizedPicture.querySelectorAll('source');
        const img = optimizedPicture.querySelector('img');

        sources.forEach((source) => {
          source.srcset = optimizeImageWidth(source.srcset);
        });
        if (img?.src) {
          img.src = optimizeImageWidth(img.src);
        }

        imageWrapper.appendChild(optimizedPicture);
        imagesContainer.appendChild(imageWrapper);
      } catch (err) {
        logError('Image DOM manipulation', `Failed to append image ${index}: ${err}`);
        return;
      }

      // Store parameters for animation later
      imageParams.push(params);
    } catch (err) {
      logError('Image section processing', `Failed to process section ${index}: ${err}`);
    }
  });

  return imageParams;
}

function buildHeaderSection(el, container) {
  try {
    const iconContent = el.querySelector('div:first-child > div');
    const contentDiv = el.querySelector('div:nth-child(2) > div:first-child');
    const title = contentDiv?.querySelector('h1');
    const subtitle = contentDiv?.querySelector('p');

    const headerSection = createTag('div', { class: 'animated-photo-banner-header' });

    if (iconContent) {
      try {
        const iconWrapper = createTag('div', { class: 'animated-photo-banner-icon' });
        iconWrapper.appendChild(iconContent.cloneNode(true));
        headerSection.appendChild(iconWrapper);
      } catch (err) {
        logError('Header icon processing', `Failed to process icon: ${err}`);
      }
    }

    const textContent = createTag('div', { class: 'animated-photo-banner-text' });

    if (title) {
      try {
        const titleEl = createTag('div', { class: 'animated-photo-banner-title' });
        titleEl.appendChild(title.cloneNode(true));
        textContent.appendChild(titleEl);
      } catch (err) {
        logError('Header title processing', `Failed to process title: ${err}`);
      }
    }

    if (subtitle) {
      try {
        const subtitleEl = createTag('div', { class: 'animated-photo-banner-subtitle' });
        subtitleEl.appendChild(subtitle.cloneNode(true));
        textContent.appendChild(subtitleEl);
      } catch (err) {
        logError('Header subtitle processing', `Failed to process subtitle: ${err}`);
      }
    }

    headerSection.appendChild(textContent);
    container.appendChild(headerSection);
  } catch (err) {
    logError('Header section building', `Failed to build header section: ${err}`);
  }
}

function extractHeaderParams(el) {
  const headerDiv = el.querySelector('div:nth-child(2)');
  const headerParams = {};

  if (headerDiv) {
    const viewportDivs = Array.from(headerDiv.children).slice(1);
    Object.assign(headerParams, extractViewportParamsFromDivs(viewportDivs));
  }

  return headerParams;
}

function applyCustomPropsForViewport(container, customProps, viewport) {
  const currentProps = customProps[viewport] || customProps.mobile || {};

  Object.entries(currentProps).forEach(([prop, value]) => {
    container.style[prop] = prop === 'height' ? `${value}rem` : value;
  });
}

function processCustomProperties(el, container) {
  const customPropsSection = Array.from(el.children).slice(-1)[0];
  const customProps = {};

  if (
    customPropsSection
    && customPropsSection.children[0]?.textContent.trim() === 'custom-properties'
  ) {
    const viewportDivs = Array.from(customPropsSection.children).slice(1);

    // Extract custom properties for each viewport
    const allViewportParams = extractViewportParamsFromDivs(viewportDivs);

    Object.entries(allViewportParams).forEach(([viewport, viewportParams]) => {
      const propsForViewport = {};
      Object.entries(viewportParams).forEach(([key, value]) => {
        if (key !== 'viewport') {
          propsForViewport[key] = value;
        }
      });

      if (Object.keys(propsForViewport).length > 0) {
        customProps[viewport] = propsForViewport;
      }
    });

    // Apply initial custom properties
    applyCustomPropsForViewport(container, customProps, DETECTED_VIEWPORT);
  }
}

function finalizeInitialization(el, container, imageParams, headerParams) {
  el.textContent = '';
  el.appendChild(container);
  setupAnimation(container, imageParams, headerParams);
}

export default async function init(el) {
  try {
    const { container, imagesContainer } = createMainContainer();
    const imageParams = processImageSections(el, imagesContainer);
    buildHeaderSection(el, container);
    const headerParams = extractHeaderParams(el);
    processCustomProperties(el, container);
    finalizeInitialization(el, container, imageParams, headerParams);
  } catch (err) {
    logError('Error initializing animated photo banner', err);
  }
}
