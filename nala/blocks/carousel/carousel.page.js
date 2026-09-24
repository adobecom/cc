export default class carousel {
  constructor(page) {
    this.page = page;
    this.carouselContainer = page.locator('.carousel');
    this.carouselCenterSlideActive = this.carouselContainer.locator('.section.carousel-slide.active');
    this.carouselActiveImage = this.carouselCenterSlideActive.locator('//img[@loading="eager"]');
    this.carouselTileText = this.carouselCenterSlideActive.locator('.quote-copy');
    this.carouselButtonContainer = page.locator('.carousel-button-container');
    this.carouselButtonLeft = this.carouselButtonContainer.locator('.carousel-button.carousel-previous');
    this.carouselButtonRight = this.carouselButtonContainer.locator('.carousel-button.carousel-next');
    // carousel-controls/indicators are hidden by design for show-N variants,
    // so slide position is verified via the active slide's data-index instead
    this.carouselFirstCard_default = this.carouselContainer.locator('.carousel-slide.active[data-index="0"]');
    this.carouselCard_load2 = this.carouselContainer.locator('.carousel-slide.active[data-index="1"]');
    this.carouselCard_load3 = this.carouselContainer.locator('.carousel-slide.active[data-index="2"]');
  }
}
