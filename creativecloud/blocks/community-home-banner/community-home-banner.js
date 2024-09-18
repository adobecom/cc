
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

export default async function init(el) {
    const communityTextDiv = document.querySelector('.community-home-banner > div > div');
    
    if (communityTextDiv) {
        communityTextDiv.setAttribute('id','banner-heading');
        communityTextDiv.parentNode.setAttribute('id','banner-container');
       
        const searchBar = document.createElement('input');
        searchBar.id = 'banner-search-bar';
        searchBar.placeholder = 'Search Adobe Community...';

        const searchIcon = document.createElement('img');
        searchIcon.id = 'banner-search-icon';
        searchIcon.src = 'https://community.adobe.com/html/@EAD1AE1EC60800B1D4958C17D35EC1CC/assets/S2_new-search-icon.svg';
        
        const statsDiv = document.createElement('div');
        statsDiv.id = 'banner-stats-strip';
        
        try{
            const res = await fetch('https://community-dev.adobe.com/wsyco67866/plugins/custom/adobe/adobedxdev/landing-page-data-fetch');
            const data = await res.json();

            if(Object.keys(data).length > 0){
                
                const memberCount = abbreviate(data['members']) ?? 0;
                const postCount = abbreviate(data['conversations']) ?? 0;
                const onlineCount = abbreviate(data['online_users']) ?? 0;

                const membersDiv = document.createElement('div');
                membersDiv.id = 'members-count';

                const spanGroup = '<span id="icon"></span><span id="count-text"></span><span id="stats-text"></span>';

                const conversationsDiv = document.createElement('div');
                conversationsDiv.id = 'conversations-count';

                const onlineDiv = document.createElement('div');
                onlineDiv.id = 'online-count';

                membersDiv.innerHTML = spanGroup;
                conversationsDiv.innerHTML = spanGroup;
                onlineDiv.innerHTML = spanGroup;

                membersDiv.querySelector('#icon').innerHTML = '<img class="stats-icon" loading="lazy" src="https://community.adobe.com/html/@508CABB651BBF2D39942871DE15671D9/assets/S2_UserGroup.svg" alt="S2_UserGroup.svg">';
                membersDiv.querySelector('#count-text').innerHTML = memberCount;
                membersDiv.querySelector('#stats-text').innerHTML = 'members';

                conversationsDiv.querySelector('#icon').innerHTML = '<img class="stats-icon" loading="lazy" src="https://community.adobe.com/html/@C01ADF4A450C6199D6DCA39870459E90/assets/S2_Chat.svg" alt="S2_Chat.svg">';
                conversationsDiv.querySelector('#count-text').innerHTML = postCount;
                conversationsDiv.querySelector('#stats-text').innerHTML = 'conversations';

                onlineDiv.querySelector('#icon').innerHTML = '<img class="stats-icon" loading="lazy" src="https://community.adobe.com/html/@2FA6E2C84CDEAB68DCC292CE28867267/assets/S2_RSS.svg" alt="S2_RSS.svg">';
                onlineDiv.querySelector('#count-text').innerHTML = onlineCount;
                onlineDiv.querySelector('#stats-text').innerHTML = 'users online';
                
                statsDiv.appendChild(membersDiv);
                statsDiv.appendChild(conversationsDiv);
                statsDiv.appendChild(onlineDiv);
            }
        }catch(err){
            console.log(err);
        }

        communityTextDiv.parentNode.appendChild(searchBar);
        communityTextDiv.parentNode.appendChild(searchIcon);
        communityTextDiv.parentNode.appendChild(statsDiv);
    }
}
