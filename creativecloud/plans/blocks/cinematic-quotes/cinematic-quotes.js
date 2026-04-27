export default function init(el) {
  const [imgRow, textRow] = el.children;
  const imgContainer = imgRow.querySelector(':scope div');
  imgContainer.classList.add('img-container');
  imgRow.replaceWith(imgContainer);

  const textContainer = textRow.querySelector(':scope div');
  textContainer.classList.add('text-container');
  textRow.replaceWith(textContainer);
}
