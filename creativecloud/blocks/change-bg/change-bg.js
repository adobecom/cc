const base = `${window.location.origin}/creativecloud`;
let assetsRoot = '';
const assetsRoot1 = `${base}/assets`;
const customElem = document.createElement('ft-changebackgroundmarquee');

function getAssests() {
  customElem.config = {
    desktop: {
      marqueeTitleImgSrc: `${assetsRoot1}/desktop/everyonecanphotoshop.webp`,
      talentSrc: `${assetsRoot1}/desktop/yogalady.webp`,
      defaultBgSrc: `${assetsRoot1}/desktop/defaultBg.webp`,
      tryitSrc: `${assetsRoot1}/tryit.svg`,
      tryitText: 'Try it',
      cursorSrc: `${assetsRoot1}/desktop/dt-Mouse-arrow.svg`,
      groups: [
        {
          name: 'Remove Background',
          iconUrl: `${assetsRoot}/desktop/dt-mouse-arrow.svg`,
        },
        {
          name: 'Change Photo',
          iconUrl: `${assetsRoot1}/change-photo-icon.svg`,
          options: [
            {
              src: `${assetsRoot}/desktop/photo1.jpg`,
              swatchSrc: `${assetsRoot}/photo-submenu-1.jpg`,
            },
            {
              src: `${assetsRoot}/desktop/photo2.jpg`,
              swatchSrc: `${assetsRoot}/photo-submenu-2.jpg`,
            },
            {
              src: `${assetsRoot}/desktop/photo3.jpg`,
              swatchSrc: `${assetsRoot}/photo-submenu-3.jpg`,
            },
          ],
        },
        {
          name: 'Change Color',
          iconUrl: `${assetsRoot1}/change-color-icon.svg`,
          options: [
            { src: '#31A8FF' },
            { src: '#7F66E6' },
            { src: '#31F7FF' },
          ],
        },
        {
          name: 'Change Pattern',
          iconUrl: `${assetsRoot1}/change-pattern-icon.svg`,
          options: [
            {
              src: `${assetsRoot}/desktop/pattern1.jpg`,
              swatchSrc: `${assetsRoot}/pattern-submenu-1.jpg`,
            },
            {
              src: `${assetsRoot}/desktop/pattern2.jpg`,
              swatchSrc: `${assetsRoot}/pattern-submenu-2.jpg`,
            },
            {
              src: `${assetsRoot}/desktop/pattern3.jpg`,
              swatchSrc: `${assetsRoot}/pattern-submenu-3.jpg`,
            },
          ],
        },
      ],
    },
    tablet: {
      marqueeTitleImgSrc: `${assetsRoot1}/tablet/everyonecanphotoshop.webp`,
      talentSrc: `${assetsRoot1}/tablet/yogalady.webp`,
      defaultBgSrc: `${assetsRoot1}/tablet/defaultBg.webp`,
      tryitSrc: `${assetsRoot1}/tryit.svg`,
      tryitText: 'Try it',
      groups: [
        {
          name: 'Remove Background',
          iconUrl: `${assetsRoot1}/remove-background-icon.svg`,
        },
        {
          name: 'Change Photo',
          iconUrl: `${assetsRoot1}/change-photo-icon.svg`,
          options: [
            {
              src: `${assetsRoot}/tablet/photo1.jpeg`,
              swatchSrc: `${assetsRoot}/photo-submenu-1.jpeg`,
            },
          ],
        },
        {
          name: 'Change Color',
          iconUrl: `${assetsRoot1}/change-color-icon.svg`,
          options: [
            { src: '#31A8FF' },
          ],
        },
        {
          name: 'Change Pattern',
          iconUrl: `${assetsRoot1}/change-pattern-icon.svg`,
          options: [
            {
              src: `${assetsRoot}/tablet/pattern1.jpeg`,
              swatchSrc: `${assetsRoot}/pattern-submenu-1.jpeg`,
            },
          ],
        },
      ],
    },
    mobile: {
      marqueeTitleImgSrc: `${assetsRoot}/mobile/everyonecanphotoshop.jpg`,
      talentSrc: `${assetsRoot}/mobile/yogalady.png`,
      defaultBgSrc: `${assetsRoot}/mobile/defaultBg.png`,
      tryitSrc: `${assetsRoot}/tryit.svg`,
      tryitText: 'Try it',
      groups: [
        {
          name: 'Remove Background',
          iconUrl: `${assetsRoot1}/remove-background-icon.svg`,
        },
        {
          name: 'Change Photo',
          iconUrl: `${assetsRoot1}/change-photo-icon.svg`,
          options: [
            {
              src: `${assetsRoot}/mobile/photo1.jpg`,
              swatchSrc: `${assetsRoot}/photo-submenu-1.jpg`,
            },
          ],
        },
        {
          name: 'Change Color',
          iconUrl: `${assetsRoot1}/change-color-icon.svg`,
          options: [
            { src: '#31A8FF' },
          ],
        },
        {
          name: 'Change Pattern',
          iconUrl: `${assetsRoot1}/change-pattern-icon.svg`,
          options: [
            {
              src: `${assetsRoot}/mobile/pattern1.jpg`,
              swatchSrc: `${assetsRoot}/pattern-submenu-1.jpg`,
            },
          ],
        },
      ],
    },
  };
}

export default async function init(el) {
  assetsRoot = el.querySelector(':scope > div > div').innerHTML;
  console.log('el', assetsRoot);
  // prefetch the mobile background image
  if (matchMedia('screen and (max-width: 599px)').matches) {
    const img1 = new Image();
    img1.fetchPriority = 'high';
    img1.src = `${assetsRoot1}/mobile/everyonecanphotoshop.webp`;
    const img2 = new Image();
    img2.fetchPriority = 'high';
    img2.src = `${assetsRoot1}/mobile/yogalady.webp`;
    const img = new Image();
    img.fetchPriority = 'high';
    img.src = `${assetsRoot1}/mobile/defaultBg.webp`;
  }
  await import(`${base}/deps/interactive-marquee-changebg/ft-everyonechangebgmarquee-8e121e97.js`);
  getAssests();
  el.replaceChildren(customElem);
}
