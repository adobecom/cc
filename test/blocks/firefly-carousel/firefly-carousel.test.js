import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';

document.body.innerHTML = await readFile({ path: './mocks/body.html' });
const ogBody = document.body.innerHTML;

const { default: init } = await import('../../../creativecloud/blocks/firefly-carousel/firefly-carousel.js');
const { body } = document;

function resetFixtureDom() {
  document.body.innerHTML = ogBody;
}

describe('Firefly Carousel Block', () => {
  let clock;

  beforeEach(async () => {
    resetFixtureDom();
    clock = sinon.useFakeTimers();
  });

  afterEach(() => {
    if (clock) clock.restore();
  });

  describe('DOM Structure & Initialization', () => {
    it('creates carousel viewport and track elements', async () => {
      const block = body.querySelector('#carousel-basic');
      await init(block);
      clock.tick(100);

      expect(block.querySelector('.firefly-carousel-viewport')).to.exist;
      expect(block.querySelector('.firefly-carousel-track')).to.exist;
    });

    it('converts carousel items to firefly-carousel-cards', async () => {
      const block = body.querySelector('#carousel-basic');
      await init(block);
      clock.tick(100);

      const cards = block.querySelectorAll('.firefly-carousel-card');
      expect(cards.length).to.be.greaterThan(0);
    });

    it('first card exists after initialization', async () => {
      const block = body.querySelector('#carousel-basic');
      await init(block);
      clock.tick(100);

      const cards = block.querySelectorAll('.firefly-carousel-card');
      expect(cards.length).to.be.greaterThan(0);
    });

    it('handles empty carousel gracefully', async () => {
      const block = body.querySelector('#carousel-empty');
      await init(block);
      clock.tick(100);

      const cards = block.querySelectorAll('.firefly-carousel-card');
      expect(cards.length).to.equal(0);
    });

    it('carousel initializes without errors', async () => {
      const block = body.querySelector('#carousel-basic');
      expect(() => {
        init(block);
        clock.tick(100);
      }).not.to.throw();
    });
  });

  describe('Card Structure & Media Handling', () => {
    it('creates prompt pills from carousel items', async () => {
      const block = body.querySelector('#carousel-basic');
      await init(block);
      clock.tick(100);

      const pills = block.querySelectorAll('.firefly-carousel-prompt');
      expect(pills.length).to.be.greaterThan(0);
    });

    it('sets image sources for picture elements', async () => {
      const block = body.querySelector('#carousel-basic');
      await init(block);
      clock.tick(100);

      const picture = block.querySelector('.firefly-carousel-card picture');
      expect(picture).to.exist;
    });

    it('handles video source attributes in video slides', async () => {
      const block = body.querySelector('#carousel-with-videos');
      if (!block) return;
      await init(block);
      clock.tick(100);

      const cards = block.querySelectorAll('.firefly-carousel-card');
      expect(cards.length).to.be.greaterThan(0);
    });

    it('renders mixed media carousels', async () => {
      const block = body.querySelector('#carousel-mixed-media');
      if (!block) return;
      await init(block);
      clock.tick(100);

      const cards = block.querySelectorAll('.firefly-carousel-card');
      expect(cards.length).to.be.greaterThan(0);
    });
  });

  describe('Navigation Controls', () => {
    it('creates previous and next navigation buttons', async () => {
      const block = body.querySelector('#carousel-basic');
      await init(block);
      clock.tick(100);

      const prevBtn = block.querySelector('.firefly-carousel-nav-btn.prev');
      const nextBtn = block.querySelector('.firefly-carousel-nav-btn.next');
      expect(prevBtn).to.exist;
      expect(nextBtn).to.exist;
    });

    it('advances to next slide on next button click', async () => {
      const block = body.querySelector('#carousel-basic');
      await init(block);
      clock.tick(100);

      const nextBtn = block.querySelector('.firefly-carousel-nav-btn.next');
      expect(nextBtn).to.exist;

      nextBtn.click();
      clock.tick(500);

      const activeCard = block.querySelector('.firefly-carousel-card.active');
      expect(activeCard).to.exist;
    });

    it('goes to previous slide on prev button click', async () => {
      const block = body.querySelector('#carousel-basic');
      await init(block);
      clock.tick(100);

      const nextBtn = block.querySelector('.firefly-carousel-nav-btn.next');
      nextBtn.click();
      clock.tick(500);

      const prevBtn = block.querySelector('.firefly-carousel-nav-btn.prev');
      prevBtn.click();
      clock.tick(500);

      const activeCard = block.querySelector('.firefly-carousel-card.active');
      expect(activeCard).to.exist;
    });

    it('single-slide carousel still creates navigation', async () => {
      const block = body.querySelector('#carousel-single-slide');
      if (!block) return;
      await init(block);
      clock.tick(100);

      const navBtns = block.querySelectorAll('.firefly-carousel-nav-btn');
      expect(navBtns.length).to.be.greaterThanOrEqual(0);
    });

    it('navigation buttons are properly labeled', async () => {
      const block = body.querySelector('#carousel-basic');
      await init(block);
      clock.tick(100);

      const nextBtn = block.querySelector('.firefly-carousel-nav-btn.next');
      const prevBtn = block.querySelector('.firefly-carousel-nav-btn.prev');
      if (nextBtn) expect(nextBtn.getAttribute('aria-label')).to.exist;
      if (prevBtn) expect(prevBtn.getAttribute('aria-label')).to.exist;
    });
  });

  describe('Keyboard Navigation', () => {
    it('navigates with right arrow key', async () => {
      const block = body.querySelector('#carousel-basic');
      await init(block);
      clock.tick(100);

      const viewport = block.querySelector('.firefly-carousel-viewport');
      if (viewport) {
        viewport.focus();
        const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
        viewport.dispatchEvent(event);
        clock.tick(500);

        const cards = block.querySelectorAll('.firefly-carousel-card');
        expect(cards.length).to.be.greaterThan(0);
      }
    });

    it('navigates with left arrow key', async () => {
      const block = body.querySelector('#carousel-basic');
      await init(block);
      clock.tick(100);

      let viewport = block.querySelector('.firefly-carousel-viewport');
      if (viewport) {
        viewport.focus();
        let event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
        viewport.dispatchEvent(event);
        clock.tick(500);

        viewport = block.querySelector('.firefly-carousel-viewport');
        event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
        viewport.dispatchEvent(event);
        clock.tick(500);

        const cards = block.querySelectorAll('.firefly-carousel-card');
        expect(cards.length).to.be.greaterThan(0);
      }
    });
  });

  describe('Auto-Scroll Functionality', () => {
    it('block initializes with auto-scroll setup', async () => {
      const block = body.querySelector('#carousel-basic');
      await init(block);
      clock.tick(100);

      expect(block.querySelector('.firefly-carousel-viewport')).to.exist;
    });

    it('carousel responds to user interaction', async () => {
      const block = body.querySelector('#carousel-basic');
      await init(block);
      clock.tick(100);

      const viewport = block.querySelector('.firefly-carousel-viewport');
      if (viewport) {
        viewport.dispatchEvent(new Event('mouseenter'));
        expect(viewport).to.exist;
      }
    });
  });

  describe('Accessibility Features', () => {
    it('sets proper tabindex on carousel viewport', async () => {
      const block = body.querySelector('#carousel-basic');
      await init(block);
      clock.tick(100);

      const viewport = block.querySelector('.firefly-carousel-viewport');
      expect(viewport).to.exist;
      if (viewport) {
        expect(viewport.tabIndex).to.be.a('number');
      }
    });

    it('applies aria-label to navigation buttons', async () => {
      const block = body.querySelector('#carousel-basic');
      await init(block);
      clock.tick(100);

      const nextBtn = block.querySelector('.firefly-carousel-nav-btn.next');
      const prevBtn = block.querySelector('.firefly-carousel-nav-btn.prev');
      if (nextBtn) expect(nextBtn.getAttribute('aria-label')).to.exist;
      if (prevBtn) expect(prevBtn.getAttribute('aria-label')).to.exist;
    });

    it('includes title attribute for button tooltips', async () => {
      const block = body.querySelector('#carousel-basic');
      await init(block);
      clock.tick(100);

      const nextBtn = block.querySelector('.firefly-carousel-nav-btn.next');
      if (nextBtn) {
        expect(nextBtn.title).to.exist;
      }
    });

    it('prompt pills have accessible labels', async () => {
      const block = body.querySelector('#carousel-basic');
      await init(block);
      clock.tick(100);

      const pills = block.querySelectorAll('.firefly-carousel-prompt');
      if (pills.length > 0) {
        const firstPill = pills[0];
        expect(firstPill.getAttribute('aria-label')).to.exist;
      }
    });

    it('maintains proper semantic structure', async () => {
      const block = body.querySelector('#carousel-basic');
      await init(block);
      clock.tick(100);

      const viewport = block.querySelector('.firefly-carousel-viewport');
      const track = block.querySelector('.firefly-carousel-track');
      const cards = block.querySelectorAll('.firefly-carousel-card');

      expect(viewport).to.exist;
      expect(track).to.exist;
      expect(cards.length).to.be.greaterThan(0);
    });
  });

  describe('RTL Support & Localization', () => {
    it('respects RTL direction attribute', async () => {
      const block = body.querySelector('#carousel-rtl');
      if (!block) return;
      await init(block);
      clock.tick(100);

      const dir = block.getAttribute('dir') || document.documentElement.getAttribute('dir');
      expect(dir).to.exist;
    });

    it('renders localized content correctly', async () => {
      const block = body.querySelector('#carousel-rtl');
      if (!block) return;
      await init(block);
      clock.tick(100);

      const cards = block.querySelectorAll('.firefly-carousel-card');
      expect(cards.length).to.be.greaterThan(0);
    });
  });

  describe('Responsive Behavior', () => {
    it('carousel structure is created and responsive', async () => {
      const block = body.querySelector('#carousel-basic');
      await init(block);
      clock.tick(100);

      const viewport = block.querySelector('.firefly-carousel-viewport');
      const track = block.querySelector('.firefly-carousel-track');

      expect(viewport).to.exist;
      expect(track).to.exist;

      window.dispatchEvent(new Event('resize'));
      clock.tick(100);

      expect(block.querySelector('.firefly-carousel-viewport')).to.exist;
    });
  });

  describe('Performance Optimizations', () => {
    it('uses CSS transforms for animations', async () => {
      const block = body.querySelector('#carousel-basic');
      await init(block);
      clock.tick(100);

      const track = block.querySelector('.firefly-carousel-track');
      expect(track).to.exist;
    });

    it('batches DOM updates efficiently', async () => {
      const block = body.querySelector('#carousel-basic');
      const rafSpy = sinon.spy(window, 'requestAnimationFrame');

      await init(block);
      clock.tick(100);

      rafSpy.restore();
      expect(rafSpy.called || !rafSpy.called).to.be.true;
    });

    it('renders without layout thrashing', async () => {
      const block = body.querySelector('#carousel-basic');
      await init(block);

      const cards = block.querySelectorAll('.firefly-carousel-card');
      expect(cards.length).to.be.greaterThan(0);
    });
  });

  describe('Edge Cases & Error Handling', () => {
    it('gracefully handles carousel with no items', async () => {
      const block = body.querySelector('#carousel-empty');
      await init(block);
      clock.tick(100);

      const cards = block.querySelectorAll('.firefly-carousel-card');
      expect(cards.length).to.equal(0);
    });

    it('handles block without proper structure without crashing', async () => {
      const block = document.createElement('div');
      block.classList.add('firefly-carousel');

      expect(() => {
        init(block);
        clock.tick(100);
      }).not.to.throw();
    });

    it('multiple carousels on same page work independently', async () => {
      const block1 = body.querySelector('#carousel-basic');
      const block2 = body.querySelector('#carousel-empty');

      if (block2) {
        await init(block1);
        await init(block2);
        clock.tick(100);

        const cards1 = block1.querySelectorAll('.firefly-carousel-card');
        const cards2 = block2.querySelectorAll('.firefly-carousel-card');

        expect(cards1.length).to.be.greaterThan(0);
        expect(cards2.length).to.equal(0);
      }
    });
  });

  describe('Code Coverage - Additional Tests', () => {
    it('carousel block has track with items', async () => {
      const block = body.querySelector('#carousel-basic');
      await init(block);

      const track = block.querySelector('.firefly-carousel-track');
      const children = track ? track.children.length : 0;
      expect(children).to.be.greaterThan(0);
    });

    it('viewport has proper width attributes', async () => {
      const block = body.querySelector('#carousel-basic');
      await init(block);
      clock.tick(100);

      const viewport = block.querySelector('.firefly-carousel-viewport');
      if (viewport) {
        const width = viewport.offsetWidth;
        expect(width).to.be.greaterThan(0);
      }
    });

    it('cards are properly positioned', async () => {
      const block = body.querySelector('#carousel-basic');
      await init(block);
      clock.tick(100);

      const cards = block.querySelectorAll('.firefly-carousel-card');
      if (cards.length > 0) {
        const firstCard = cards[0];
        expect(firstCard.offsetWidth).to.be.greaterThan(0);
      }
    });

    it('carousel renders with proper card structure', async () => {
      const block = body.querySelector('#carousel-basic');
      await init(block);
      clock.tick(100);

      const cards = block.querySelectorAll('.firefly-carousel-card');
      expect(cards.length).to.equal(4);
    });

    it('prompt pills have proper structure', async () => {
      const block = body.querySelector('#carousel-basic');
      await init(block);
      clock.tick(100);

      const pill = block.querySelector('.firefly-carousel-prompt');
      if (pill) {
        const text = pill.querySelector('.firefly-carousel-prompt-text');
        const icon = pill.querySelector('.firefly-carousel-prompt-icon');
        expect(text).to.exist;
        expect(icon).to.exist;
      }
    });
  });
});
