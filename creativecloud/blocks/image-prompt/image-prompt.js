import { createTag, getLibs } from '../../scripts/utils.js';

function moveButton(promptLink, desktopButtonWrapper) {
  promptLink.addEventListener('mousemove', function (event) {
    const containerRect = promptLink.getBoundingClientRect();
    const mouseX = event.clientX - containerRect.left;
    const mouseY = event.clientY - containerRect.top;
    const isRtl = document.documentElement.getAttribute('dir') === 'rtl';
    if (isRtl) {
      //desktopButtonWrapper.style.right = `${containerRect.width - mouseX - desktopButtonWrapper.offsetWidth -10}px`;
      desktopButtonWrapper.style.right = `${containerRect.width - mouseX}px`;
    } else {
      desktopButtonWrapper.style.left = `${mouseX + 10}px`;
    }
    desktopButtonWrapper.style.top = `${mouseY + 20}px`;
  });
}

export async function loadSvg(src) {
  try {
    const res = await fetch(src, { mode: 'no-cors' });
    if (!res.status === 200) return null;
    const svg = await res.text();
    return svg;
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
    const csMobile = window.getComputedStyle(mobileHover);
    const opacityMobile = csMobile.getPropertyValue('opacity');

    const csDesktop = window.getComputedStyle(desktopHover);
    const opacityDesktop = csDesktop.getPropertyValue('opacity');
    if (opacityMobile === "1" || opacityDesktop === "1") window.location = aTag.getAttribute("href");
    else {
      e.preventDefault();
      e.stopPropagation();
      mobileHover.style.opacity = 1;
      mobileHover.style.zIndex = 1;
      prompt.style.zIndex = 2;
    }
  });
  document.addEventListener('click', function (e) {
    if (!aTag.contains(e.target)) {
      mobileHover.style.opacity = 0;
      mobileHover.style.zIndex = "";
      prompt.style.zIndex = "";
    }
  });
}

export default async function init(el) {
  const rows = [...el.querySelectorAll(':scope > div')];
  const promptLink = rows[0]?.querySelector(':scope a');
  promptLink.classList.add('prompt-link');
  promptLink.setAttribute('aria-label', rows[2]?.textContent.replace('|','').trim());
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

  // Desktop
  const desktopButtonWrapper = createTag('div', { class: 'button-wrapper' });
  const desktopButton = createTag('button', { class: 'moving-button', tabindex: '-1' }, rows[2]?.textContent.replace('|','').trim());
  const dektopsvg = `<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 11 11" fill="none">
  <circle cx="5.53223" cy="5.5" r="4.5" fill="#5258E4" stroke="white"/>
  </svg>`;
  const dektopButtonSvg = createTag('div', { class: 'moving-svg' });
  dektopButtonSvg.innerHTML += `${dektopsvg}`;
  desktopButtonWrapper.append(dektopButtonSvg);
  desktopButtonWrapper.append(desktopButton);
  hoverDiv.append(desktopButtonWrapper);
  moveButton(promptLink, desktopButtonWrapper)
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' || event.key === 'Esc') {
      hoverDiv.style.opacity = '0';
      prompt.style.display = 'block';
    }
  });
  promptLink.addEventListener('mouseenter', function () {
    hoverDiv.style.opacity = '';
    prompt.style.display = '';
  });
  // Mobile
  const mobileLinkWrapper = createTag('div', { class: 'hover-wrapper' });
  const mobileLink = createTag('div', { class: 'hover-link' }, rows[2]?.textContent.replace('|','').trim());
  const mobileIcon = rows[2]?.querySelector('img[src*=".svg"]');
  const mobilesvg = await loadSvg(new URL(mobileIcon.src))
  const mobileLinkSvg = createTag('div', { class: 'hover-svg' });
  mobileLinkSvg.innerHTML += `${mobilesvg}`;
  mobileLinkWrapper.append(mobileLink);
  mobileLinkWrapper.append(mobileLinkSvg);
  hoverMobileDiv.append(mobileLinkWrapper);
  // Avatar
  const avatar = createTag('div', { class: 'avatar' });
  const avatarName = createTag('p', { class: 'avatar-name' });
  const avatarImg = rows[1]?.querySelector(':scope img');
  avatarName.innerText = rows[1]?.textContent.trim();
  avatar.append(avatarImg)
  avatar.append(avatarName);
  const mobileAvatar = avatar.cloneNode(true)
  hoverDiv.append(avatar);
  hoverMobileDiv.append(mobileAvatar);

  promptLink.append(hoverDiv);
  promptLink.append(hoverMobileDiv);
  promptBlock.append(promptLink);
  rows.forEach(function(row) {
    row.remove();
  });
  el.append(promptBlock);
  handleMobile(el, 2000);
}
