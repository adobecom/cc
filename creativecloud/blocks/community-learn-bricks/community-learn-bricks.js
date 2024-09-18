export default async function init(el) {
    const res = await fetch('https://main--cc--sejalnaidu.hlx.page/drafts/snaidu/community/Authorings/learnwithadobe.json');
    const {data} = await res.json();

    const bricks = document.querySelector('.community-learn-bricks');
    if(data.length > 0){
        const title = document.createElement('div');
        title.classList.add('learn-brick-title');
        title.classList.add('container');
        title.innerHTML = data[0]['Title'];
        bricks.appendChild(title);

        const containerDiv = document.createElement('div');
        containerDiv.classList.add('learn-bricks-container');
        bricks.appendChild(containerDiv);

        data.forEach(element => {
            const brickDiv = document.createElement('div');
            brickDiv.classList.add('community-learn-brick');
            brickDiv.style.backgroundImage = `url(${element['Background']})`;
            
            brickDiv.onclick = function() {
                const url = `${element['Link']}`; // Replace with your desired URL
                window.open(url, '_blank');
            };

            const headerDiv = document.createElement('div');
            headerDiv.classList.add('learn-brick-header-section');

            const headerLeftDiv = document.createElement('div');
            headerLeftDiv.classList.add('learn-brick-header-left');

            const heading = document.createElement('div');
            heading.innerHTML = element['Heading'];
            heading.classList.add('learn-brick-heading');
            
            headerLeftDiv.appendChild(heading);

            const external = document.createElement('div');
            const extIcon = document.createElement('img');
            extIcon.src = 'https://community.adobe.com/html/@B7D83662D16A1E258B446DD3B5B7EB3E/assets/S2_White-outlink-icon.svg';
            external.appendChild(extIcon);
    
            headerDiv.appendChild(headerLeftDiv);
            headerDiv.appendChild(external);

            const bodyDiv = document.createElement('div');
            bodyDiv.classList.add('learn-brick-body-section');

            const body1 = document.createElement('div');
            body1.innerHTML = element['SubText'];
            body1.classList.add('learn-brick-body');
            bodyDiv.appendChild(body1);

            brickDiv.appendChild(headerDiv);
            brickDiv.appendChild(bodyDiv);
            containerDiv.appendChild(brickDiv);
        });
    }
}