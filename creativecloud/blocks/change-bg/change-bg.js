const base = `${window.location.origin}/creativecloud`;
const assetsRoot = `${base}/assets`;
const customElem = document.createElement('ft-changebackgroundmarquee');

function getAssests() {
  customElem.config = {
    desktop: {
      marqueeTitleImgSrc: `${assetsRoot}/desktop/everyonecanphotoshop.webp`,
      talentSrc: `${assetsRoot}/desktop/yogalady.webp`,
      defaultBgSrc: `${assetsRoot}/desktop/defaultBg.webp`,
      tryitSrc: `${assetsRoot}/tryit.svg`,
      tryitText: 'それを試してみてください',
      cursorSrc: `${assetsRoot}/desktop/dt-Mouse-arrow.svg`,
      groups: [
        {
          name: 'Remove Background',
          iconUrl: `${assetsRoot}/remove-background-icon.svg`
        },
        {
          name: 'Change Photo',
          iconUrl: `${assetsRoot}/change-photo-icon.svg`,
          options: [
            {
              src: `${assetsRoot}/desktop/photo1.webp`,
              swatchSrc: `${assetsRoot}/photo-submenu-1.webp`
            },
            {
              src: `${assetsRoot}/desktop/photo2.webp`,
              swatchSrc: `${assetsRoot}/photo-submenu-2.webp`
            },
            {
              src: `${assetsRoot}/desktop/photo3.webp`,
              swatchSrc: `${assetsRoot}/photo-submenu-3.webp`
            }
          ]
        },
        {
          name: 'Change Color',
          iconUrl: `${assetsRoot}/change-color-icon.svg`,
          options: [
            {
              src: '#31A8FF'
            },
            {
              src: '#7F66E6'
            },
            {
              src: '#31F7FF'
            }
          ]
        },
        {
          name: 'Change Pattern',
          iconUrl: `${assetsRoot}/change-pattern-icon.svg`,
          options: [
            {
              src: `${assetsRoot}/desktop/pattern1.webp`,
              swatchSrc: `${assetsRoot}/pattern-submenu-1.webp`
            },
            {
              src: `${assetsRoot}/desktop/pattern2.webp`,
              swatchSrc: `${assetsRoot}/pattern-submenu-2.webp`
            },
            {
              src: `${assetsRoot}/desktop/pattern3.webp`,
              swatchSrc: `${assetsRoot}/pattern-submenu-3.webp`
            }
          ]
        }
      ]
    },
    tablet: {
      marqueeTitleImgSrc: `${assetsRoot}/tablet/everyonecanphotoshop.webp`,
      talentSrc: `${assetsRoot}/tablet/yogalady.webp`,
      defaultBgSrc: `${assetsRoot}/tablet/defaultBg.webp`,
      tryitSrc: `${assetsRoot}/tryit.svg`,
      tryitText: 'Versuch es',
      groups: [
        {
          name: 'Remove Background',
          iconUrl: `${assetsRoot}/remove-background-icon.svg`
        },
        {
          name: 'Change Photo',
          iconUrl: `${assetsRoot}/change-photo-icon.svg`,
          options: [
            {
              src: `${assetsRoot}/tablet/photo1.webp`,
              swatchSrc: `${assetsRoot}/photo-submenu-1.webp`
            }
          ]
        },
        {
          name: 'Change Color',
          iconUrl: `${assetsRoot}/change-color-icon.svg`,
          options: [
            {
              src: '#31A8FF'
            }
          ]
        },
        {
          name: 'Change Pattern',
          iconUrl: `${assetsRoot}/change-pattern-icon.svg`,
          options: [
            {
              src: `${assetsRoot}/tablet/pattern1.webp`,
              swatchSrc: `${assetsRoot}/pattern-submenu-1.webp`
            }
          ]
        }
      ]
    },
    mobile: {
      marqueeTitleImgSrc: `${assetsRoot}/mobile/everyonecanphotoshop.webp`,
      talentSrc: `${assetsRoot}/mobile/yogalady.webp`,
      defaultBgSrc: `${assetsRoot}/mobile/defaultBg.webp`,
      tryitSrc: `${assetsRoot}/tryit.svg`,
      tryitText: 'Try it',
      groups: [
        {
          name: 'Remove Background',
          iconUrl: `${assetsRoot}/remove-background-icon.svg`
        },
        {
          name: 'Change Photo',
          iconUrl: `${assetsRoot}/change-photo-icon.svg`,
          options: [
            {
              src: `${assetsRoot}/mobile/photo1.webp`,
              swatchSrc: `${assetsRoot}/photo-submenu-1.webp`
            }
          ]
        },
        {
          name: 'Change Color',
          iconUrl: `${assetsRoot}/change-color-icon.svg`,
          options: [
            {
              src: '#31A8FF'
            }
          ]
        },
        {
          name: 'Change Pattern',
          iconUrl: `${assetsRoot}/change-pattern-icon.svg`,
          options: [
            {
              src: `${assetsRoot}/mobile/pattern1.webp`,
              swatchSrc: `${assetsRoot}/pattern-submenu-1.webp`
            }
          ]
        }
      ]
    }
  };
}

export default async function init(el) {
  // prefetch the mobile background image
  if (matchMedia(`screen and (max-width: 599px)`).matches) {
    const img = new Image();
    img.fetchPriority = "high";
    img.src = `${assetsRoot}/mobile/defaultBg.webp`;
    console.log('img');
  }
  await import(`${base}/deps/interactive-marquee-changebg/ft-everyonechangebgmarquee-37df0239.js`);
  getAssests();
  el.replaceChildren(customElem);
}
