function positionPaddles(){
    try{
        const rightPaddle = document.querySelector(".right-paddle");
        const leftPaddle = document.querySelector(".left-paddle");
        const element = document.querySelector(".placeholder-div-for-you");

        if (element) {
            const elementRect = element.getBoundingClientRect();
            const arrowTop = (elementRect.height / 2) - (rightPaddle.offsetHeight / 2) + 40;

            let rightPaddleArrowLeft = elementRect.left + window.scrollX + elementRect.width - 20;
            if (window.innerWidth > 767 && window.innerWidth < 1280) {
                rightPaddleArrowLeft = elementRect.left + window.scrollX + elementRect.width - 34;
            }
            const leftPaddleArrowLeft = elementRect.left + window.scrollX - 10;

            rightPaddle.style.position = 'absolute';
            rightPaddle.style.top = `${arrowTop}px`;
            rightPaddle.style.left = `${rightPaddleArrowLeft}px`;

            leftPaddle.style.position = 'absolute';
            leftPaddle.style.top = `${arrowTop}px`;
            leftPaddle.style.left = `${leftPaddleArrowLeft}px`;
        }
    }catch(err){
        console.log(err);
    }
}

function forYouScrollListener(){
    try {
        const placeholderDiv = document.querySelector('.placeholder-div-for-you');

        placeholderDiv.addEventListener('scroll', function(e) {
            let scrollLeft = e.target.scrollLeft;
            const featuredParent = document.querySelector('.featured-parent');
            const featuredHeader = document.querySelector('.featured-header');

            if (scrollLeft > 9) {
                featuredParent.style.paddingLeft = "0px";
                featuredHeader.style.paddingLeft = "16px";
            } else {
                featuredParent.style.paddingLeft = "16px";
                featuredHeader.style.paddingLeft = "0px";
            }
        });
    } catch (err) {
        console.log(err);
    }
}

function paddleClickListeners(scroll, rightCounter){
    let scrollDuration = 600;
    const rightPaddle = document.getElementById('right-paddle');
    const leftPaddle = document.getElementById('left-paddle');
    const placeholderDiv = document.querySelector('.placeholder-div-for-you');

    rightPaddle.addEventListener('click', function(e) {
        try {
            leftPaddle.classList.remove('hidden');
            let max;

            if (window.innerWidth >= 1280) {
                scroll += 960;
                max = 1;
            } else {
                scroll += 620;
                max = 2;
            }

            if (rightCounter < max) {
                placeholderDiv.scrollTo({
                    left: scroll,
                    behavior: 'smooth',
                    scrollDuration
                });
            }

            rightCounter += 1;

            if (rightCounter === max) {
                rightPaddle.classList.add('hidden');
            }
        } catch (err) {
            console.error(err);
        }
    });

    leftPaddle.addEventListener('click', function(e) {
        try {
            rightCounter -= 1;
            rightPaddle.classList.remove('hidden');
    
            if (window.innerWidth >= 1280) {
                scroll -= 960;
            } else {
                scroll -= 620;
            }
    
            if (scroll >= 0) {
                placeholderDiv.scrollTo({
                    left: scroll,
                    behavior: 'smooth'
                });
    
                if (scroll === 0) {
                    leftPaddle.classList.add('hidden');
                }
            }
        } catch (err) {
            console.error(err);
        }
    });
}

function abbreviate(val=0){
    if (val >= 1_000_000_000_000) {
        return (val / 1_000_000_000_000).toFixed(1) + 'T';
    } else if (val >= 1_000_000_000) {
        return (val / 1_000_000_000).toFixed(1) + 'B';
    } else if (val >= 1_000_000) {
        return (val / 1_000_000).toFixed(1) + 'M';
    } else if (val >= 1_000) {
        return (val / 1_000).toFixed(1) + 'K';
    } else {
        return val.toString();
    }
  }

function renderFeaturedCards(forYouCommunities){
    try {
        const placeholders = document.querySelectorAll('.featured-card-wrapper');
        placeholders.forEach((element, index) => {

            let productJson = JSON.parse(forYouCommunities[index]);

            const banner = element.querySelector('.channel-card-banner');
            banner.classList.remove('ghost-load-cards');
            banner.style.backgroundImage = `url(https://community-dev.adobe.com${productJson['avatar']['large_href']})`;
            banner.style.backgroundSize = "cover";

            const iconDiv = document.createElement('img');
            iconDiv.src = 'https://main--cc--sejalnaidu.hlx.page/drafts/snaidu/community/images/adobe-logo.svg';
            const icon = element.querySelector('.channel-icon');
            icon.classList.remove('ghost-load-cards');
            icon.appendChild(iconDiv);

            const titleSpan = document.createElement('span');
            titleSpan.innerHTML = productJson['title'];
            const title = element.querySelector('.product-title');
            title.classList.remove('ghost-load-cards');
            title.classList.remove('box-style');
            title.appendChild(titleSpan);

            const statsDiv = document.createElement('img');
            statsDiv.src = 'https://main--cc--sejalnaidu.hlx.page/drafts/snaidu/community/images/s2-icon-conversations-icon.svg';
            const statsIcon = element.querySelector('.product-stat-icon');
            statsIcon.classList.remove('ghost-load-cards');
            statsIcon.classList.remove('box-style');
            statsIcon.appendChild(statsDiv);

            const statsCount = element.querySelector('.product-stat-count');
            statsCount.classList.remove('ghost-load-cards');
            statsCount.classList.remove('box-style');
            let count = abbreviate(productJson['topics']['count']);
            statsCount.innerHTML = `${count} conversations`;

            const visit = element.querySelector('.channel-visit-btn');
            visit.classList.remove('ghost-load-cards');
            visit.innerHTML = "Visit";

            element.addEventListener('click', () => {
                window.location.href = 'https://community-dev.adobe.com'+productJson['view_href'];
            });
        });
    } catch (err) {
        console.log(err)
    }
}

async function fetchForYouContent(scroll, rightCounter, max){
    try{
        const res = await fetch('https://community-dev.adobe.com/plugins/custom/adobe/adobedxdev/get-featured-communities');
        const data = await res.json();
   
        if(Object.keys(data).length > 0){
            renderFeaturedCards(data['list'], data['typeList'], "For you");
            if(window.innerWidth <= 767){
                forYouScrollListener();  
            }else{
                positionPaddles();
                const rightPaddle = document.querySelector(".right-paddle");
                rightPaddle.classList.remove('hidden');
                paddleClickListeners(scroll, rightCounter, max);
            }
        }
    }catch(err){
        console.log(err);
    }
}

export default async function init(el) {
    
    const featuredParent = document.createElement('div');
    featuredParent.className = 'featured-parent';

    const leftPaddle = document.createElement('div');
    leftPaddle.id = 'left-paddle';
    leftPaddle.className = 'left-paddle paddle hidden';

    const leftPaddleImg = document.createElement('img');
    leftPaddleImg.loading = 'lazy';
    leftPaddleImg.src = 'https://main--cc--sejalnaidu.hlx.page/drafts/snaidu/community/images/s2-icon-left-arrow.svg';
    leftPaddleImg.alt = 'scroll-left';
    leftPaddle.appendChild(leftPaddleImg);

    const rightPaddle = document.createElement('div');
    rightPaddle.id = 'right-paddle';
    rightPaddle.className = 'right-paddle paddle hidden';

    const rightPaddleImg = document.createElement('img');
    rightPaddleImg.loading = 'lazy';
    rightPaddleImg.src = 'https://main--cc--sejalnaidu.hlx.page/drafts/snaidu/community/images/s2-icon-right-arrow.svg';
    rightPaddleImg.alt = 'scroll-right';
    rightPaddle.appendChild(rightPaddleImg);

    const featuredCardContainer = document.createElement('div');
    featuredCardContainer.className = 'featured-card-container';

    const featuredHeader = document.createElement('div');
    featuredHeader.className = 'featured-header';

    const featuredTitle = document.createElement('h3');
    featuredTitle.className = 'spectrum-Body1 featured-title';
    featuredTitle.textContent = 'For you';
    featuredHeader.appendChild(featuredTitle);

    const placeholderDivForYou = document.createElement('div');
    placeholderDivForYou.className = 'placeholder-div-for-you';

    const cardsLimit = 5;

    for (let number = 0; number <= cardsLimit; number++) {
        const cardWrapper = document.createElement('div');
        cardWrapper.id = `placeholder-div-for-you-${number}`;
        cardWrapper.className = 'featured-card-wrapper';
        if (number === cardsLimit - 1) {
            cardWrapper.classList.add('last');
        }

        const cardBanner = document.createElement('div');
        cardBanner.className = 'channel-card-banner ghost-load-cards';
        cardWrapper.appendChild(cardBanner);

        const channelIcon = document.createElement('div');
        channelIcon.className = 'channel-icon ghost-load-cards';
        cardWrapper.appendChild(channelIcon);

        const cardContent = document.createElement('div');
        cardContent.className = 'channel-card-content';

        const col1 = document.createElement('div');
        col1.className = 'col1';

        const productTitle = document.createElement('div');
        productTitle.className = 'product-title box-style ghost-load-cards';
        col1.appendChild(productTitle);

        const productStats = document.createElement('div');
        productStats.className = 'product-stats';

        const productStatIcon = document.createElement('div');
        productStatIcon.className = 'product-stat-icon box-style ghost-load-cards';
        productStats.appendChild(productStatIcon);

        const productStatCount = document.createElement('div');
        productStatCount.className = 'product-stat-count box-style ghost-load-cards';
        productStats.appendChild(productStatCount);

        col1.appendChild(productStats);
        cardContent.appendChild(col1);

        const col2 = document.createElement('div');
        col2.className = 'col2';

        const visitBtn = document.createElement('div');
        visitBtn.className = 'channel-visit-btn ghost-load-cards';
        col2.appendChild(visitBtn);

        cardContent.appendChild(col2);
        cardWrapper.appendChild(cardContent);

        placeholderDivForYou.appendChild(cardWrapper);
    }

    featuredCardContainer.appendChild(featuredHeader);
    featuredCardContainer.appendChild(placeholderDivForYou);

    featuredParent.appendChild(leftPaddle);
    featuredParent.appendChild(rightPaddle);
    featuredParent.appendChild(featuredCardContainer);

    el.appendChild(featuredParent);

    var scroll = 0;
    var rightCounter = 0, max;

    window.addEventListener('resize', function() {                           
        if (window.innerWidth <= 767) {
            forYouScrollListener();
        } else {
            positionPaddles();
        }                           
    });
    fetchForYouContent(scroll, rightCounter, max);
}