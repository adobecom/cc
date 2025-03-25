class CommunityCards {
  constructor(el) {
    this.el = el;
    this.cardData = [];
    this.init();
  }

  async init() {
    try {
      await this.fetchCardData();
      this.renderCards();
      this.cards = this.el.querySelectorAll('.community-cards__card');
      this.cards.forEach((cardElement) => {
        cardElement.addEventListener('click', () => {
          this.handleCardClick(cardElement);
        });
      });
    } catch (error) {
      console.error('Error loading community cards:', error);
      // You might want to show an error message to the user here
    }
  }

  async fetchCardData() {
    try {
      const response = await fetch('/creativecloud/blocks/community-cards/community-cards.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      this.cardData = data.cards;
    } catch (error) {
      console.error('Error fetching card data:', error);
      throw error;
    }
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

  handleCardClick(cardElement) {
    const cardIndex = Array.from(this.cards).indexOf(cardElement);
    if (cardIndex !== -1 && this.cardData[cardIndex]) {
      window.location.href = this.cardData[cardIndex].url;
    }
  }
}

export default async function init(el) {
  new CommunityCards(el);
}
