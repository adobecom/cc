// creativecloud/blocks/animated-photo-banner/animated-photo-banner.js
import { createTag } from '../../scripts/utils.js';

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

function getCurrentViewport() {
  const width = window.innerWidth;
  if (width < 600) return 'mobile';
  if (width < 1000) return 'tablet';
  return 'desktop';
}

// Use transform for positioning instead of left/top
function applyTransform(element, x, y, scale = 1) {
  // Position element using translate

  // Apply transform for both positioning and scaling
  element.style.transform = `translate(calc(${x}vw - 50%), calc(${y}vh - 50%)) scale(${scale})`;
}

function setupAnimation(container, paramsMap) {
  try {
    const images = container.querySelectorAll('.animated-photo-banner-image');
    const viewport = getCurrentViewport();

    // Group images by their wave number
    const waveGroups = {};
    let maxWave = 1;

    images.forEach((image, index) => {
      const params = paramsMap[index];
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

    // Calculate the total time needed for all waves to appear
    const totalWavesAppearTime = maxWave * WAVE_DELAY;

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
        const params = paramsMap[index];
        const viewportParams = params[viewport] || params.mobile || {};
        const wave = viewportParams.wave || 1;

        // Skip images with wave === -1 as they're already in their final position with scale
        if (wave === -1) return;

        const endPos = viewportParams['end-pos']
          || viewportParams['start-pos'] || [50, 50];
        // const scale = viewportParams.scale || 1;

        // Add transform transition for the movement
        image.style.transition = 'opacity 0.8s ease-out, transform 1.5s ease-in-out';

        // Animate to end position using transform
        applyTransform(image, endPos[0], endPos[1], 1);
      });
    }, totalWavesAppearTime + 500); // Add a small buffer after all waves have appeared

    // Handle viewport changes
    let currentViewport = viewport;
    window.addEventListener('resize', () => {
      const newViewport = getCurrentViewport();
      if (newViewport !== currentViewport) {
        currentViewport = newViewport;

        // Update positions for new viewport
        images.forEach((image, index) => {
          const params = paramsMap[index];
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
      }
    });
  } catch (err) {
    window.lana?.log(`Error setting up animation: ${err}`, LANA_OPTIONS);
  }
}

export default async function init(el) {
  try {
    const headerContent = el.querySelector('div:first-child > div');

    // Create the main container
    const container = createTag('div', { class: 'animated-photo-banner-container' });

    // Add header section
    const headerSection = createTag('div', { class: 'animated-photo-banner-header' });
    headerSection.appendChild(headerContent.cloneNode(true));
    container.appendChild(headerSection);

    // Create images container
    const imagesContainer = createTag('div', { class: 'animated-photo-banner-images' });
    container.appendChild(imagesContainer);

    // Process image sections and extract parameters
    const imageSections = Array.from(el.children).slice(1);
    const paramsMap = [];

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
      paramsMap.push(params);
    });

    // Replace original content
    el.textContent = '';
    el.appendChild(container);

    // Set up animation
    setupAnimation(container, paramsMap);
  } catch (err) {
    window.lana?.log(
      `Error initializing animated photo banner: ${err}`,
      LANA_OPTIONS,
    );
  }
}
