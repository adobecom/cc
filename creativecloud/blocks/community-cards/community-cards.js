class CommunityCards {
  constructor(el) {
    this.el = el;
    this.cardData = [
      {
        imageUrl: 'https://picsum.photos/400/300',
        headerText: 'Adobe Creative Cloud',
        descriptionText: 'Access the world\'s best creative apps and services',
        appIcon: 'https://picsum.photos/50/50',
        url: 'https://www.adobe.com/creativecloud.html'
      },
      {
        imageUrl: 'https://picsum.photos/400/301',
        headerText: 'Adobe Stock',
        descriptionText: 'High-quality stock photos, videos, and graphics',
        appIcon: 'https://picsum.photos/50/51',
        url: 'https://stock.adobe.com'
      },
      {
        imageUrl: 'https://picsum.photos/400/302',
        headerText: 'Adobe Fonts',
        descriptionText: 'Thousands of fonts from the world\'s leading foundries',
        appIcon: 'https://picsum.photos/50/52',
        url: 'https://fonts.adobe.com'
      },
      {
        imageUrl: 'https://picsum.photos/400/303',
        headerText: 'Adobe Portfolio',
        descriptionText: 'Create your professional portfolio website',
        appIcon: 'https://picsum.photos/50/53',
        url: 'https://portfolio.adobe.com'
      },
      {
        imageUrl: 'https://picsum.photos/400/304',
        headerText: 'Adobe Color',
        descriptionText: 'Create and explore color combinations',
        appIcon: 'https://picsum.photos/50/54',
        url: 'https://color.adobe.com'
      }
    ];
    this.init();
  }

  init() {
    this.renderCards();
    this.cardData.forEach((card) => {
      card.addEventListener('click', () => {
        this.handleCardClick(card);
      });
    });
  }

  renderCards() {
    this.cardData.forEach((cardData) => {
      const card = document.createElement('div');
      card.className = 'community-cards__card';
      card.innerHTML = `
        <div class="community-cards__card-icon">
          <img src="${cardData.appIcon}" alt="${cardData.headerText} icon">
        </div>
        <div class="community-cards__card-image">
          <img src="${cardData.imageUrl}" alt="${cardData.headerText}">
        </div>
        <div class="community-cards__card-content">
          <h3 class="community-cards__card-header">${cardData.headerText}</h3>
          <p class="community-cards__card-description">${cardData.descriptionText}</p>
        </div>
      `;
      this.el.appendChild(card);
    });
  }

  handleCardClick(card) {
    const cardIndex = Array.from(this.cardData).indexOf(card);
    if (cardIndex !== -1 && this.cardData[cardIndex]) {
      window.location.href = this.cardData[cardIndex].url;
    }
  }
}

export default async function init(el) {
  new CommunityCards(el);
}
