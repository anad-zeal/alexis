// assets/js/script.js
// Vanilla JS slideshow (ES module). ARIA-friendly and SPA-safe.

document.querySelectorAll('a').forEach((a) => {
  a.addEventListener('click', (e) => {
    console.log('Clicked:', a.href);
  });
});

/**
 * Creates a DOM element with an optional data-role attribute.
 * @param {string} tag - The HTML tag name.
 * @param {string} [dataRole] - The value for the data-role attribute.
 * @returns {HTMLElement} The created element.
 */
function createEl(tag, dataRole) {
  const el = document.createElement(tag);
  if (dataRole) el.setAttribute('data-role', dataRole);
  return el;
}

/**
 * Injects core slideshow CSS styles into the document head once.
 * @param {number} [fadeMs=1500] - The duration for fade transitions in milliseconds.
 */
function injectCoreStylesOnce(fadeMs = 1500) {
  if (document.querySelector('style[data-slideshow-core]')) return;
  const s = document.createElement('style');
  s.setAttribute('data-slideshow-core', '1');
  s.textContent = `
    .slideshow { width: min(1200px, 90vw); margin-inline: auto; position: relative; }
    .slideshow [data-role="stage"]{
      position: relative; aspect-ratio: 16 / 9; min-height: 320px;
      background:#c0ad97; overflow:hidden; border-radius:8px;
      box-shadow:0 4px 8px rgb(0 0 0 / 0.1); display:grid; place-items:center;
      isolation:isolate;
    }
    .slideshow [data-role="stage"] img{
      position:absolute; inset:0; margin:auto; display:block;
      width:100%; height:100%; min-width:1px; min-height:1px; object-fit:contain;
      opacity:0; transition:opacity ${fadeMs}ms ease-in-out;
    }
    .slideshow [data-role="caption-wrap"]{
      position:static; text-align:center; padding:.75rem 0; color:#555; font-style:italic;
    }
    .slideshow [data-role="previous"], .slideshow [data-role="next"]{
      position:absolute; top:50%; transform:translateY(-50%); z-index:10;
    }
    .slideshow [data-role="previous"]{ left:.5rem; }
    .slideshow [data-role="next"]{ right:.5rem; }
    .slideshow button[data-action]{
      background:#8b0000; color:#fff; border:0; border-radius:50%;
      width:56px; height:56px; display:grid; place-items:center; cursor:pointer;
      transition: background-color 0.2s ease;
    }
    .slideshow button[data-action]:hover{ background:#c53030; }
    .slideshow button[data-action]:focus{ outline:2px solid #c53030; outline-offset:2px; }
  `;
  document.head.appendChild(s);
}

export class Slideshow {
  constructor(rootEl, opts = {}) {
    if (!rootEl) throw new Error('Slideshow root element is required.');
    this.root = rootEl;
    this.opts = {
      jsonUrl: opts.jsonUrl,
      interval: Number(opts.interval ?? 5000),
      fadeMs: Number(opts.fadeMs ?? 1500),
      autoplay: opts.autoplay ?? true,
      pauseOnHover: opts.pauseOnHover ?? true,
    };
    if (!this.opts.jsonUrl) throw new Error('opts.jsonUrl is required.');

    this.slides = [];
    this.images = [];
    this.current = 0;
    this.timer = null;
    this.isPausedByHoverOrTouch = false;

    injectCoreStylesOnce(this.opts.fadeMs);
    this._prepareDOM();
    this._loadSlides()
      .then(() => {
        if (!this.slides.length) return;
        this._createSlides();
        this._fadeInFirst(); // starts autoplay after first fade if enabled
      })
      .catch((e) => {
        console.error('Slideshow: failed to load slides JSON:', e);
        this.root.innerHTML = `<p style="text-align:center; padding:20px; color:#b00;">Failed to load slideshow. ${e.message}</p>`;
      });
  }

  next() {
    if (this.slides.length) {
      this._show((this.current + 1) % this.slides.length);
      this._resetAutoplay();
    }
  }
  prev() {
    if (this.slides.length) {
      this._show((this.current - 1 + this.slides.length) % this.slides.length);
      this._resetAutoplay();
    }
  }
  pause() {
    clearInterval(this.timer);
    this.timer = null;
  }
  resume() {
    if (this.opts.autoplay && !this.isPausedByHoverOrTouch && !this.timer) this._start();
  }
  destroy() {
    this.pause();
  }

  async _loadSlides() {
    const res = await fetch(this.opts.jsonUrl, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${this.opts.jsonUrl}`);
    const data = await res.json();
    this.slides = Array.isArray(data) ? data : [];
  }

  _prepareDOM() {
    this.root.classList.add('slideshow');
    if (!this.root.style.position) this.root.style.position = 'relative';
    this.root.setAttribute('aria-live', 'polite');
    if (!this.root.hasAttribute('tabindex')) this.root.tabIndex = 0;

    this.stage = this.root.querySelector('[data-role="stage"]') || createEl('div', 'stage');
    if (!this.stage.parentNode) this.root.appendChild(this.stage);
    const ar = getComputedStyle(this.stage).aspectRatio;
    if (!ar || ar === 'auto') {
      this.stage.style.aspectRatio = '16 / 9';
      if (!this.stage.style.minHeight) this.stage.style.minHeight = '320px';
    }

    let capWrap = this.root.querySelector('[data-role="caption-wrap"]');
    if (!capWrap) capWrap = createEl('div', 'caption-wrap');
    this.captionEl = this.root.querySelector('[data-role="caption"]') || createEl('p', 'caption');
    if (!this.captionEl.parentNode) capWrap.appendChild(this.captionEl);
    if (!capWrap.parentNode) this.root.appendChild(capWrap);

    this.prevBtn =
      this.root.querySelector('[data-action="prev"]') || this._makeButton('prev', 'Previous slide');
    this.nextBtn =
      this.root.querySelector('[data-action="next"]') || this._makeButton('next', 'Next slide');
    if (!this.prevBtn.parentNode) {
      const w = createEl('div', 'previous');
      w.appendChild(this.prevBtn);
      this.root.appendChild(w);
    }
    if (!this.nextBtn.parentNode) {
      const w = createEl('div', 'next');
      w.appendChild(this.nextBtn);
      this.root.appendChild(w);
    }

    this.prevBtn.addEventListener('click', () => this.prev());
    this.nextBtn.addEventListener('click', () => this.next());
    this.root.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.prev();
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        this.next();
      }
    });

    if (this.opts.pauseOnHover) {
      this.root.addEventListener('mouseenter', () => {
        this.isPausedByHoverOrTouch = true;
        this.pause();
      });
      this.root.addEventListener('mouseleave', () => {
        this.isPausedByHoverOrTouch = false;
        this.resume();
      });
      this.root.addEventListener(
        'touchstart',
        () => {
          this.isPausedByHoverOrTouch = true;
          this.pause();
        },
        { passive: true }
      );
      this.root.addEventListener(
        'touchend',
        () => {
          this.isPausedByHoverOrTouch = false;
          this.resume();
        },
        { passive: true }
      );
    }
  }

  _makeButton(action, label) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('data-action', action);
    btn.setAttribute('aria-label', label);
    btn.innerHTML = action === 'prev' ? '&#9664;' : '&#9654;';
    return btn;
  }

  _createSlides() {
    this.images = this.slides.map((item, idx) => {
      const img = document.createElement('img');
      img.src = item.src;
      img.alt = item.alt ?? item.caption ?? '';
      img.decoding = 'async';
      img.loading = idx === 0 ? 'eager' : 'lazy';
      img.setAttribute('aria-hidden', idx === 0 ? 'false' : 'true');
      this.stage.appendChild(img);
      return img;
    });
  }

  _fadeInFirst() {
    if (!this.images.length) return;
    const first = this.images[0];
    const reveal = () => {
      first.style.opacity = '1';
      this._setCaption(0);
      if (this.opts.autoplay) setTimeout(() => this._start(), this.opts.fadeMs + 200);
    };
    if (first.complete && first.naturalWidth > 0) requestAnimationFrame(reveal);
    else {
      first.addEventListener('load', () => requestAnimationFrame(reveal), {
        once: true,
      });
      first.addEventListener(
        'error',
        () => {
          console.error('Slideshow: failed image', first.src);
          this._setCaption(0);
        },
        { once: true }
      );
    }
  }

  _show(index) {
    if (!this.images.length) return;
    const target = this.images[index];
    const paint = () => {
      this.images.forEach((img, i) => {
        img.style.opacity = i === index ? '1' : '0';
        img.setAttribute('aria-hidden', i === index ? 'false' : 'true');
      });
      this._setCaption(index);
      this.current = index;
    };
    if (target.complete && target.naturalWidth > 0) paint();
    else target.addEventListener('load', paint, { once: true });
  }

  _setCaption(index) {
    const cap = this.slides[index]?.caption ?? '';
    this.captionEl.style.opacity = '0';
    setTimeout(() => {
      this.captionEl.textContent = cap;
      this.captionEl.style.transition = `opacity ${Math.min(this.opts.fadeMs, 1000)}ms ease-in-out`;
      this.captionEl.style.opacity = '1';
    }, 180);
  }

  _start() {
    this.pause();
    this.timer = setInterval(() => {
      const nextIdx = (this.current + 1) % this.slides.length;
      this._show(nextIdx);
    }, this.opts.interval);
  }

  _resetAutoplay() {
    if (this.opts.autoplay) {
      this.pause();
      this.resume();
    }
  }
}

export function initSlideshows(root = document) {
  const nodes = [...root.querySelectorAll('[data-slides]')];
  return nodes
    .map((el) => {
      const jsonUrl = el.getAttribute('data-slides');
      const interval = Number(el.getAttribute('data-interval') || 5000);
      const fadeMs = Number(el.getAttribute('data-fade') || 1500);
      const autoplay = el.getAttribute('data-autoplay') !== 'false';
      const pauseOnHover = el.getAttribute('data-pause-on-hover') !== 'false';
      try {
        return new Slideshow(el, {
          jsonUrl,
          interval,
          fadeMs,
          autoplay,
          pauseOnHover,
        });
      } catch (e) {
        console.error('Error initializing slideshow:', e);
        el.innerHTML = `<p style="text-align:center; padding: 20px; color:#b00;">Failed to load slideshow: ${e.message}</p>`;
        return null;
      }
    })
    .filter(Boolean);
}

// Function to swap headers based on query parameter
function swapHeadersViaQueryParam() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('showSlideshow') !== 'true') return;
  const siteHeader = document.querySelector('.site-header');
  // Assuming .slideshow-site-header is distinct and not a typo.
  const slideshowHeader = document.querySelector('.slideshow-site-header');
  if (siteHeader) siteHeader.style.visibility = 'hidden';
  if (slideshowHeader) slideshowHeader.style.visibility = 'visible';
  document.body.classList.add('is-slideshow');
}

// Helper to get transition duration from CSS
function getTransitionDuration(element) {
  if (!element) return 0;
  const style = window.getComputedStyle(element);
  const duration = style.transitionDuration;
  return parseFloat(duration) * 1000 || 0; // Convert to milliseconds, fallback to 0
}

// Define the titles for each path (can be extended for gallery nav etc.)
const pageTitles = {
  '/home': 'The life of an artist',
  '/artworks': 'Artwork Categories',
  '/biography': 'How I became an artist',
  '/contact': 'Send me a message',
  // Add other gallery titles here if they follow a similar pattern
  '/black-and-white': 'Black & White Artworks',
  '/drips': 'Drip Series Collection',
  '/encaustic': 'Encaustic Works',
  '/projects': 'Project Series Gallery',
  '/restoration': 'Restoration Services',
  '/decorative': 'Decorative Art',
};

// --- Navigation and Content Update Logic ---
document.addEventListener('DOMContentLoaded', () => {
  initSlideshows();
  swapHeadersViaQueryParam();

  const navLinks = document.querySelectorAll('nav a'); // Target all nav links
  const subTitleElement =
    document.querySelector('h2.sub-title') || document.querySelector('p.sub-title'); // Support both h2 and p
  const mainContentFadeArea = document.getElementById('main-content-fade-area'); // The container you want to fade

  let isTransitioning = false; // Flag to prevent multiple rapid clicks during transition

  /**
   * Updates the sub-title and active class with a cross-fade effect.
   * NOTE: This function only updates the sub-title text and active navigation link.
   * For a full SPA experience, you'd need to fetch and inject actual page content here.
   * @param {HTMLAnchorElement} activeLink - The clicked navigation link element.
   */
  async function updatePageContent(activeLink) {
    if (isTransitioning) return; // Prevent new transitions while one is active
    isTransitioning = true;

    // Clean href to match pageTitles keys
    const cleanHref = activeLink.getAttribute('href').replace(/~\[|\]~/g, '');
    const pageName = cleanHref.substring(1) || 'home'; // Default to 'home' if empty path
    const newSubTitleText = pageTitles[cleanHref] || 'Welcome!';

    const fadeElement = mainContentFadeArea || subTitleElement; // Decide what to fade

    // 1. Fade out current content
    if (fadeElement) {
      fadeElement.style.opacity = 0;
      await new Promise((resolve) =>
        setTimeout(resolve, getTransitionDuration(fadeElement) || 280)
      );
    }

    // 2. Update the 'is-active' class and 'aria-current' for all navigation links
    navLinks.forEach((link) => {
      link.classList.remove('is-active');
      link.removeAttribute('aria-current');
    });
    activeLink.classList.add('is-active');
    activeLink.setAttribute('aria-current', `${pageName} page`);

    // 3. Update the sub-title text (and other dynamic content if implemented)
    if (subTitleElement) {
      subTitleElement.textContent = newSubTitleText;
      // If you had a mechanism to fetch and inject main content, it would go here.
      // E.g., await fetchAndInjectContent(cleanHref);
    }

    // 4. Fade in new content
    if (fadeElement) {
      fadeElement.style.opacity = 1;
    }

    isTransitioning = false;
  }

  // Add click event listener to each navigation link
  navLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      // Prevent the default link behavior (page reload)
      updatePageContent(link);
      // Optional: Update URL hash or use history.pushState if desired for deep linking
      // For example: history.pushState(null, '', link.href);
    });
  });

  // Initial setup: Determine the active link on page load and update content
  // Prioritize based on current URL, then 'is-active' class, then default to home.
  const currentPath = window.location.pathname;
  let initialActiveLink = document.querySelector(`nav a[href="${currentPath}"]`);

  if (!initialActiveLink) {
    // Fallback if no direct path match
    initialActiveLink = document.querySelector('nav a.is-active');
  }
  if (!initialActiveLink) {
    // Default to the home link if still no match
    initialActiveLink = document.querySelector('nav a[href="/home"]');
  }

  if (initialActiveLink) {
    updatePageContent(initialActiveLink).then(() => {
      // Ensure initial content is visible after setup
      const fadeElement = mainContentFadeArea || subTitleElement;
      if (fadeElement) fadeElement.style.opacity = 1;
    });
  } else {
    // If no link is initially active and no default, just ensure fade area is visible
    const fadeElement = mainContentFadeArea || subTitleElement;
    if (fadeElement) fadeElement.style.opacity = 1;
    if (subTitleElement) {
      subTitleElement.textContent = 'Welcome to the Site!'; // Default title
    }
  }
}); // End of DOMContentLoaded

// Listen for hash changes and custom navigation events for slideshows
window.addEventListener('hashchange', () => initSlideshows());
window.addEventListener('app:navigate', () => initSlideshows());

// Note: The previous mainMenu function and galleryNav variable are no longer present.
// The navigation is now handled by the updatePageContent function within DOMContentLoaded.
