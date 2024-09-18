
export default async function init(el) {
    const res = await fetch('https://main--milo--adobecom.hlx.page/drafts/snaidu/community/book1.json');
    const {data} = await res.json();
    const x = el.querySelectorAll('div');
    data.forEach(element => {
        console.log(element);
        x[x.length-1].innerHTML += `<h1>${element.String}</h1>`
    });
}
