import { createTag } from '../../scripts/utils.js';

function moveButton(promptLink, desktopButtonWrapper) {
  promptLink.addEventListener('mousemove', (event) => {
    const containerRect = promptLink.getBoundingClientRect();
    let mouseX = event.clientX - containerRect.left;
    let mouseY = event.clientY - containerRect.top;
    const buttonWidth = desktopButtonWrapper.style.width;
    const buttonHeight = desktopButtonWrapper.offsetHeight;
    if (mouseX < 0) mouseX = 0;
    if (mouseX + buttonWidth > containerRect.width) mouseX = containerRect.width - buttonWidth;
    if (mouseY < 0) mouseY = 0;
    if (mouseY + buttonHeight > containerRect.height) {
      mouseY = containerRect.height - buttonHeight - 10;
    }
    const isRtl = document.dir === 'rtl';
    if (isRtl) {
      desktopButtonWrapper.style.right = `${containerRect.width - mouseX}px`;
    } else {
      desktopButtonWrapper.style.left = `${mouseX + 10}px`;
    }
    desktopButtonWrapper.style.top = `${mouseY + 20}px`;
  });
}

async function loadSvg(src) {
  try {
    const res = await fetch(src, { mode: 'no-cors' });
    if (!res.ok) return null;
    return await res.text();
  } catch (e) {
    return '';
  }
}

function handleMobile(el) {
  const aTag = el.querySelector('.prompt-link');
  const mobileHover = el.querySelector('.hover-mobile');
  const desktopHover = el.querySelector('.hover-container');
  const prompt = el.querySelector('.prompt');

  aTag.addEventListener('click', (e) => {
    const isMobileVisible = window.getComputedStyle(mobileHover).opacity === '1';
    const isDesktopVisible = window.getComputedStyle(desktopHover).opacity === '1';

    if (isMobileVisible || isDesktopVisible) {
      window.location = aTag.getAttribute('href');
    } else {
      e.preventDefault();
      e.stopPropagation();
      mobileHover.style.opacity = 1;
      mobileHover.style.zIndex = 1;
      prompt.style.zIndex = 2;
    }
  });
  document.addEventListener('click', (e) => {
    if (!aTag.contains(e.target)) {
      mobileHover.style.opacity = 0;
      mobileHover.style.zIndex = '';
      prompt.style.zIndex = '';
    }
  });
}

export default async function init(el) {
  const rows = [...el.querySelectorAll(':scope > div')];
  const promptLink = rows[0]?.querySelector(':scope a');
  promptLink.classList.add('prompt-link');
  const buttonText = rows[2]?.textContent.replace(/\|/g, '').trim();
  promptLink.setAttribute('aria-label', buttonText);
  promptLink.setAttribute('aria-describedby', promptLink.querySelector('picture img').getAttribute('alt'));
  const promptBlock = createTag('div');
  const prompt = createTag('div', { class: 'prompt' });
  const promptText = createTag('p', { class: 'prompt-text' });
  promptText.innerText = rows[0].textContent.trim();

  prompt.append(promptText);
  promptLink.append(prompt);

  const hoverDiv = createTag('div', { class: 'hover-container' });
  const hoverMobileDiv = createTag('div', { class: 'hover-mobile' });

  const promptHover = el.querySelector('.prompt').cloneNode(true);
  promptHover.classList.remove('prompt');
  promptHover.classList.add('prompt-hover');
  hoverDiv.append(promptHover);

  const desktopButtonWrapper = createTag('div', { class: 'button-wrapper' });
  const desktopButton = createTag('button', { class: 'moving-button', tabindex: '-1' }, buttonText);
  const desktopsvg = `<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 11 11" fill="none">
  <circle cx="5.53223" cy="5.5" r="4.5" fill="#5258E4" stroke="white"/>
  </svg>`;
  const desktopButtonSvg = createTag('div', { class: 'moving-svg' });
  desktopButtonSvg.innerHTML = `${desktopsvg}`;
  desktopButtonWrapper.append(desktopButtonSvg, desktopButton);
  hoverDiv.append(desktopButtonWrapper);
  moveButton(promptLink, desktopButtonWrapper);
  document.addEventListener('keydown', (event) => {
    if ((event.key === 'Escape' || event.key === 'Esc') && window.getComputedStyle(hoverDiv).opacity === '1') {
      hoverDiv.style.opacity = '0';
      prompt.style.display = 'block';
      prompt.style.opacity = '1';
      promptHover.style.opacity = '0';
    }
  });
  promptLink.addEventListener('mouseenter', () => {
    hoverDiv.style.opacity = '';
    prompt.style.display = '';
    prompt.style.opacity = '';
    promptHover.style.opacity = '';
  });

  const mobileLinkWrapper = createTag('div', { class: 'hover-wrapper' });
  const mobileLink = createTag('div', { class: 'hover-link' }, buttonText);
  const mobileIcon = rows[2]?.querySelector('img[src*=".svg"]');
  const mobilesvg = await loadSvg(new URL(mobileIcon.src));
  const parser = new DOMParser();
  const svgDoc = parser.parseFromString(mobilesvg, 'image/svg+xml');
  const svgElement = svgDoc.documentElement;
  const mobileLinkSvg = createTag('div', { class: 'hover-svg' });
  mobileLinkSvg.appendChild(svgElement);
  mobileLinkWrapper.append(mobileLink, mobileLinkSvg);
  hoverMobileDiv.append(mobileLinkWrapper);

  const avatar = createTag('div', { class: 'avatar' });
  const avatarName = createTag('p', { class: 'avatar-name' });
  const avatarImg = rows[1]?.querySelector(':scope img');
  avatarName.innerText = rows[1]?.textContent.trim();
  avatar.append(avatarImg, avatarName);
  const mobileAvatar = avatar.cloneNode(true);
  hoverDiv.append(avatar);
  hoverMobileDiv.append(mobileAvatar);

  promptLink.append(hoverDiv, hoverMobileDiv);
  promptBlock.append(promptLink);
  rows.forEach((row) => row.remove());
  el.append(promptBlock);
  handleMobile(el);
}
