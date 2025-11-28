// creativecloud/blocks/animated-photo-banner/animated-photo-banner.js
import { createTag, getScreenSizeCategory } from '../../scripts/utils.js';

const LANA_OPTIONS = { tags: 'animated-photo-banner', errorType: 'i' };
const WAVE_DELAY = 700;

function parseParamValue(key, value) {
  if (key === 'start-pos' || key === 'end-pos') {
    return value.split(',').map((coord) => parseFloat(coord));
  }
  return ['scale', 'wave'].includes(key) ? parseFloat(value) : value;
}

function extractParams(paramDiv) {
  return Array.from(paramDiv.querySelectorAll('p')).reduce((params, p) => {
    const text = p.textContent.trim();
    const [key, value] = text.split('=');

    if (value !== undefined) {
      params[key] = parseParamValue(key, value);
    }
    return params;
  }, {});
}

function applyTransform(element, xPosition, yPosition, scale = 1) {
  // Width is in vw; Height is in rem
  // Focussing on centrod of image
  element.style.transform = `translate(calc(${xPosition}vw - 50%), calc(${yPosition}rem - 50%)) scale(calc(${scale}))`;
}

function setupAnimation(container, paramsList, headerParams) {
  try {
    const images = container.querySelectorAll('.animated-photo-banner-image');
    const header = container.querySelector('.animated-photo-banner-header');
    const viewport = getScreenSizeCategory();

    // Group images by their wave number
    const waveGroups = {};
    let maxWave = 1;

    images.forEach((image, index) => {
      const params = paramsList[index];
      const viewportParams = params[viewport] || params.mobile || {};
      const wave = viewportParams.wave || 1;

      // Handle wave === -1 images immediately - no animation
      if (wave === -1) {
        const endPos = viewportParams['end-pos']
          || viewportParams['start-pos'] || [50, 50];
        // Set final position and scale immediately
        applyTransform(image, endPos[0], endPos[1], viewportParams.scale);
        image.style.opacity = '1'; // Make visible immediately
        return; // Skip adding to wave groups
      }

      if (wave > maxWave) maxWave = wave;

      if (!waveGroups[wave]) {
        waveGroups[wave] = [];
      }

      // Initially hide the image
      image.style.opacity = '0';

      waveGroups[wave].push({
        element: image,
        params: viewportParams,
      });
    });

    // Set up header - position it but keep it hidden
    if (header && Object.keys(headerParams).length > 0) {
      const viewportParams = headerParams[viewport] || headerParams.mobile || {};
      const endPos = viewportParams['end-pos']
        || viewportParams['start-pos'] || [50, 50];
      if (endPos) {
        // Initially hide the header
        header.style.opacity = '0';
        // Position at start position
        applyTransform(header, endPos[0], endPos[1]);
      }
    }
    // Wait for all images to load before starting animation
    // eslint-disable-next-line no-inner-declarations
    function startAnimationSequence() {
      // Calculate the total time needed for all waves to appear
      const totalWavesAppearTime = maxWave * WAVE_DELAY;
      const totalAnimationTime = totalWavesAppearTime + 2000;

      // PHASE 1: Make images appear in waves
      const waves = Object.keys(waveGroups).sort((a, b) => a - b);
      waves.forEach((wave, index) => {
        setTimeout(() => {
          const waveImages = waveGroups[wave];

          waveImages.forEach(({ element, params }) => {
            // Get position parameters
            const startPos = params['start-pos'] || [50, 50];
            const scale = params.scale || 1;

            // Set initial position (start position)
            applyTransform(element, startPos[0], startPos[1], 1 / scale);

            // Make image visible with fade-in
            element.style.transition = 'opacity 0.8s ease-out';
            element.style.opacity = '1';
          });
        }, index * WAVE_DELAY + 500);
      });
      // PHASE 2: Animate all images from start to end position after all waves have appeared
      setTimeout(() => {
        images.forEach((image, index) => {
          const params = paramsList[index];
          const viewportParams = params[viewport] || params.mobile || {};
          const wave = viewportParams.wave || 1;

          // Skip images with wave === -1 as they're already in their final position with scale
          if (wave === -1) return;

          const endPos = viewportParams['end-pos']
            || viewportParams['start-pos'] || [50, 50];

          // Add transform transition for the movement
          image.style.transition = 'opacity 0.8s ease-out, transform 1.5s ease-in-out';

          // Animate to end position using transform
          applyTransform(image, endPos[0], endPos[1], 1);
        });
      }, totalWavesAppearTime + 500); // Add a small buffer after all waves have appeared

      // Final phase: Reveal header after all images are done animating
      if (header && Object.keys(headerParams).length > 0) {
        setTimeout(() => {
          // Add transition for smooth appearance
          header.style.transition = 'opacity 1.2s ease-out';
          // Make header visible
          header.style.opacity = '1';
        }, totalAnimationTime);
      }
    }

    const imgElements = Array.from(container.querySelectorAll('img'));
    if (imgElements.length === 0) {
      // If no images, start animation immediately
      startAnimationSequence();
    } else {
      // Wait for all images to load
      Promise.all(
        imgElements.map(
          (img) => new Promise((resolve) => {
            if (img.complete) {
              resolve();
            } else {
              img.onload = () => resolve();
              img.onerror = () => resolve(); // Resolve even on error
            }
          }),
        ),
      ).then(() => {
        startAnimationSequence();
      });
    }

    // Handle viewport changes
    let currentViewport = viewport;
    window.addEventListener('resize', () => {
      const newViewport = getScreenSizeCategory();
      if (newViewport !== currentViewport) {
        currentViewport = newViewport;

        // Update positions for new viewport
        images.forEach((image, index) => {
          const params = paramsList[index];
          const viewportParams = params[newViewport] || params.mobile || {};
          const endPos = viewportParams['end-pos']
            || viewportParams['start-pos'] || [50, 50];

          // Disable transition temporarily
          image.style.transition = 'none';

          // Update position
          applyTransform(image, endPos[0], endPos[1], 1);

          // Re-enable transition
          setTimeout(() => {
            image.style.transition = 'opacity 0.8s ease-out, transform 1.5s ease-in-out';
          }, 50);
        });
        if (header && Object.keys(headerParams).length > 0) {
          const viewportParams = headerParams[newViewport] || headerParams.mobile || {};
          const endPos = viewportParams['end-pos']
        || viewportParams['start-pos'] || [50, 50];

          if (endPos) {
            header.style.transition = 'none';
            applyTransform(header, endPos[0], endPos[1]);

            setTimeout(() => {
              header.style.transition = 'opacity 1.2s ease-out';
            }, 50);
          }
        }
      }
    });
  } catch (err) {
    window.lana?.log(`Error setting up animation: ${err}`, LANA_OPTIONS);
  }
}

export default async function init(el) {
  try {
    // Create the main container
    const container = createTag('div', { class: 'animated-photo-banner-container' });

    // Create images container
    const imagesContainer = createTag('div', { class: 'animated-photo-banner-images' });
    container.appendChild(imagesContainer);

    // Process image sections and extract parameters
    const imageSections = Array.from(el.children).slice(2);
    const imageParams = [];

    imageSections.forEach((section) => {
      // Get the picture element
      const pictureEl = section.querySelector('picture');
      if (!pictureEl) return;

      const viewportDivs = Array.from(section.children).slice(1);
      const params = {};

      // Extract animation parameters for each viewport
      viewportDivs.forEach((div) => {
        const viewportParams = extractParams(div);
        if (viewportParams.viewport) {
          params[viewportParams.viewport] = viewportParams;
        }
      });

      // Create image wrapper with the picture
      const imageWrapper = createTag('div', { class: 'animated-photo-banner-image' });
      imageWrapper.appendChild(pictureEl.cloneNode(true));
      imagesContainer.appendChild(imageWrapper);

      // Store parameters for animation later
      imageParams.push(params);
    });

    // Add header section
    const iconContent = el.querySelector('div:first-child > div');
    const contentDiv = el.querySelector('div:nth-child(2) > div:first-child');
    const title = contentDiv.querySelector('h1');
    const subtitle = contentDiv.querySelector('p');
    const headerSection = createTag('div', { class: 'animated-photo-banner-header' });
    if (iconContent) {
      const iconWrapper = createTag('div', { class: 'animated-photo-banner-icon' });
      iconWrapper.appendChild(iconContent.cloneNode(true));
      headerSection.appendChild(iconWrapper);
    }
    const textContent = createTag('div', { class: 'animated-photo-banner-text' });
    if (title) {
      const titleEl = createTag('div', { class: 'animated-photo-banner-title' });
      titleEl.appendChild(title.cloneNode(true));
      textContent.appendChild(titleEl);
    }
    if (subtitle) {
      const subtitleEl = createTag('div', { class: 'animated-photo-banner-subtitle' });
      subtitleEl.appendChild(subtitle.cloneNode(true));
      textContent.appendChild(subtitleEl);
    }
    headerSection.appendChild(textContent);
    container.appendChild(headerSection);

    const headerDiv = el.querySelector('div:nth-child(2)');
    const headerParams = {};
    if (headerDiv) {
      const viewportDivs = Array.from(headerDiv.children).slice(1);
      viewportDivs.forEach((div) => {
        const viewportParams = extractParams(div);
        if (viewportParams.viewport) {
          headerParams[viewportParams.viewport] = viewportParams;
        }
      });
    }

    el.textContent = '';
    el.appendChild(container);

    setupAnimation(container, imageParams, headerParams);
  } catch (err) {
    window.lana?.log(
      `Error initializing animated photo banner: ${err}`,
      LANA_OPTIONS,
    );
  }
}
