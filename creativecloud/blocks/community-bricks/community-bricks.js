export default async function init(el) {
    const res = await fetch('https://main--cc--sejalnaidu.hlx.page/drafts/snaidu/community/Authorings/moreplacestoconnect.json');
    const {data} = await res.json();

    const bricks = document.querySelector('.community-bricks');
    if(data.length > 0){
        const title = document.createElement('div');
        title.classList.add('brick-title');
        title.classList.add('container');
        title.innerHTML = data[0]['Title'];
        bricks.appendChild(title);

        const containerDiv = document.createElement('div');
        containerDiv.classList.add('bricks-container');
        bricks.appendChild(containerDiv);

        data.forEach(element => {
            const brickDiv = document.createElement('div');
            brickDiv.classList.add('community-brick');
            brickDiv.style.backgroundImage = `url(${element['Background']})`;
            
            brickDiv.onclick = function() {
                const url = `${element['Link']}`; // Replace with your desired URL
                window.open(url, '_blank');
            };

            const headerDiv = document.createElement('div');
            headerDiv.classList.add('brick-header-section');

            const headerLeftDiv = document.createElement('div');
            headerLeftDiv.classList.add('brick-header-left');
            const icon = document.createElement('img');
            icon.src = `${element['Icon']}`;

            const heading = document.createElement('div');
            heading.innerHTML = element['Heading'];
            heading.classList.add('brick-heading');
            
            headerLeftDiv.appendChild(icon);
            headerLeftDiv.appendChild(heading);

            const external = document.createElement('div');
            const extIcon = document.createElement('img');
            extIcon.src = 'https://community.adobe.com/html/@B7D83662D16A1E258B446DD3B5B7EB3E/assets/S2_White-outlink-icon.svg';
            external.appendChild(extIcon);
    
            headerDiv.appendChild(headerLeftDiv);
            headerDiv.appendChild(external);

            const bodyDiv = document.createElement('div');
            bodyDiv.classList.add('brick-body-section');

            const body1 = document.createElement('div');
            body1.innerHTML = element['SubText'];
            body1.classList.add('brick-body');
            const body2 = document.createElement('div');
            body2.classList.add('brick-body');
            body2.classList.add('brick-body-footer');
            body2.innerHTML = element['FooterText'];
            bodyDiv.appendChild(body1);
            bodyDiv.appendChild(body2);

            brickDiv.appendChild(headerDiv);
            brickDiv.appendChild(bodyDiv);
            containerDiv.appendChild(brickDiv);

            if(element['Heading'] === 'Lightroom Discover'){
                heading.classList.add('brick-non-white-heading');
                extIcon.src = 'https://community.adobe.com/html/@2A1347605EAD4B72E5A73601ADFC6E0B/assets/S2_Black-outlink-icon.svg';
                body1.classList.add('brick-non-white-body');
                body2.classList.add('brick-non-white-body');
            }
        });
    }
}