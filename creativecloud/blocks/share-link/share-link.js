import { loadStyle } from '../../scripts/utils.js';

export default async function init(el) {
  console.log(el);
  const fg = el.querySelector('div:first-child');
  fg.classList.add('foreground');
  Array.from(fg.children).forEach((child) => {
    if(child.querySelector('picture')) {
      child.classList.add('button-area');
    } else {
      child.classList.add('text-area');
    }
  });
  const host = document.querySelector(".button-area");
  const shadow = host.attachShadow({ mode: "open" });
  const div = document.createElement("div");
  
  const wcWebSharing = document.createElement('wc-web-sharing');
  wcWebSharing.setAttribute('link', 'https://creativecloud.adobe.com/cc/discover/article/see-what-s-new-in-photoshop');
  wcWebSharing.setAttribute('data-title', "See what's new in Photoshop.");
  wcWebSharing.classList.add('custom-web-sharing');
  wcWebSharing.setAttribute('part', 'custom-web-sharing');
  div.appendChild(wcWebSharing);

  const style = document.createElement('style');
  style.textContent = `
    .custom-web-sharing {
      display: block;
  width: 50px;
  height: 50px;
  background-color: #f0f0f0;
  border: 2px solid #ccc;
  padding: 10px;
  margin: 20px;
  font-family: Arial, sans-serif;
  font-size: 16px;
  text-align: center;
  line-height: 80px;
  color: #333;
    }
  `;

  shadow.appendChild(div);

  shadow.querySelector('.custom-web-sharing').addEventListener('click', function() {
    if (navigator.share) {
        navigator.share({
            title: 'send',
            url: 'https://creativecloud.adobe.com/cc/discover/article/see-what-s-new-in-photoshop'
        }).then(() => {
            console.log('Thanks for sharing!');
        }).catch(console.error);
    } else {
        alert('Web Share API is not supported in your browser.');
    }
  });
}
