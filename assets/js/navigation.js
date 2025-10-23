let subTitleElement;

// --- Utility Functions ---
function parseDurationValue(value) {
  const trimmedValue = (value || '').trim();
  if (!trimmedValue) return 0;

  if (trimmedValue.endsWith('ms')) {
    return parseFloat(trimmedValue);
  }
  if (trimmedValue.endsWith('s')) {
    return parseFloat(trimmedValue) * 1000;
  }
  return parseFloat(trimmedValue) || 0;
}

function getTransitionDuration(element) {
  if (!element) return 0;

  const style = window.getComputedStyle(element);
  const duration = style.transitionDuration || style.webkitTransitionDuration || '';

  const parts = duration
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) return 0;

  const msValues = parts.map(parseDurationValue);
  return Math.max(...msValues);
}

function normalizePath(href) {
  try {
    const url = new URL(href, window.location.origin);
    let pathname = url.pathname || '/';

    // Remove trailing slash except for root
    if (pathname.length > 1 && pathname.endsWith('/')) {
      pathname = pathname.slice(0, -1);
    }

    return pathname;
  } catch (error) {
    console.warn('Invalid URL provided to normalizePath:', href);
    let path = String(href || '');

    if (!path.startsWith('/')) {
      path = '/' + path;
    }
    if (path.length > 1 && path.endsWith('/')) {
      path = path.slice(0, -1);
    }

    return path;
  }
}

// const mainNav = document.querySelector('.main-nav');
// const heroDiv = document.querySelector('.hero');
// mainNav.style.visibility = 'hidden';
// heroDiv.style.visibility = 'hidden';

// document.querySelectorAll('div').forEach((div) => {
//   if (div.id !== 'main-content-area') {
//     div.style.visibility = 'hidden';
//   }
// });

document.querySelectorAll(’section’).forEach(section => {
  if (!section.classList.contains('slideshow-section')) {
   section.style.display = 'none';
  }
});

// Page title mappings
const PAGE_TITLES = {
  '/': 'Home',
  '/home': 'Home',
  '/artworks': 'Artworks',
  '/biography': 'Biography',
  '/contact': 'Contact Me',
  '/drips': 'Drip Series Paintings',
  '/encaustic': 'Encaustic Paintings',
  '/project-series': 'Project Series Paintings',
  '/restoration': 'Restoration Projects',
  '/decorative': 'Decorative Painting',
  '/black-and-white': 'Black and White Paintings',
};

// --- Navigation Class ---
class NavigationManager {
  constructor() {
    this.isTransitioning = false;
    this.navLinks = [];
    this.mainContentArea = null;
    this.dynamicPageWrapper = null;

    this.init();
  }

  init() {
    // Cache DOM elements
    this.cacheElements();

    // Set up event listeners
    this.setupEventListeners();

    // Handle initial page load
    this.handleInitialLoad();

    // Set up default transitions
    this.setupDefaultTransitions();
  }

  cacheElements() {
    subTitleElement = document.querySelector('p.page-title');
    this.navLinks = Array.from(document.querySelectorAll('nav a'));
    this.mainContentArea = document.getElementById('main-content-area');
    this.dynamicPageWrapper = document.getElementById('dynamic-page-wrapper');

    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log('Elements cached:', {
        subTitleElement,
        navLinksCount: this.navLinks.length,
        mainContentArea: this.mainContentArea,
        dynamicPageWrapper: this.dynamicPageWrapper,
      });
    }
  }

  setupEventListeners() {
    // Navigation click handler
    const navElement = document.querySelector('nav');
    if (navElement) {
      navElement.addEventListener('click', this.handleNavClick.bind(this));
    }

    // Browser back/forward handler
    window.addEventListener('popstate', this.handlePopState.bind(this));

    // Font size change handlers
    this.setupFontSizeHandlers();
  }

  setupFontSizeHandlers() {
    // Category links
    document.querySelectorAll('a.category').forEach((categoryLink) => {
      categoryLink.addEventListener('click', this.handleCategoryClick.bind(this));
    });

    // Landing menu links
    document.querySelectorAll('a.landing-mnu').forEach((landingMenuLink) => {
      landingMenuLink.addEventListener('click', this.handleLandingMenuClick.bind(this));
    });
  }

  handleCategoryClick(event) {
    event.preventDefault();

    const categoryLink = event.currentTarget;
    const gallery = categoryLink.getAttribute('data-gallery');

    if (subTitleElement) {
      subTitleElement.style.fontSize = '5vw';
    } else {
      console.warn('Category link clicked, but p.page-title element not found.');
    }

    console.log('Category clicked:', gallery);
  }

  handleLandingMenuClick(event) {
    event.preventDefault();

    if (subTitleElement) {
      const currentFontSize = subTitleElement.style.fontSize;

      if (currentFontSize === '5vw') {
        subTitleElement.style.fontSize = '10vw';
      }
    } else {
      console.warn('Landing menu link clicked, but p.page-title element not found.');
    }
  }

  setupDefaultTransitions() {
    const defaultTransition = 'opacity 280ms ease-in-out';

    if (this.mainContentArea && !getTransitionDuration(this.mainContentArea)) {
      this.mainContentArea.style.transition = defaultTransition;
    }

    if (subTitleElement && !getTransitionDuration(subTitleElement)) {
      subTitleElement.style.transition = defaultTransition;
    }
  }

  findNavLinkByPath(pathname) {
    const normalizedPath = normalizePath(pathname);
    return this.navLinks.find((link) => {
      const linkHref = link.getAttribute('href') || link.href;
      return normalizePath(linkHref) === normalizedPath;
    });
  }

  executeScriptsFromNode(container) {
    if (!container) return;

    const scripts = Array.from(container.querySelectorAll('script'));

    scripts.forEach((oldScript) => {
      // Skip module scripts and already processed scripts
      if (oldScript.type === 'module' || oldScript.dataset.processed === 'true') {
        return;
      }

      const newScript = document.createElement('script');

      if (oldScript.src) {
        newScript.src = oldScript.src;
        newScript.async = false;
        newScript.dataset.processed = 'true';
      } else {
        newScript.textContent = oldScript.textContent;
      }

      // Copy attributes
      Array.from(oldScript.attributes).forEach((attr) => {
        if (attr.name !== 'src') {
          newScript.setAttribute(attr.name, attr.value);
        }
      });

      oldScript.parentNode.replaceChild(newScript, oldScript);
    });
  }

  async loadPageContent(path, targetElement) {
    if (!targetElement) {
      console.error('Target element for content loading not found!');
      return false;
    }

    try {
      const response = await fetch(path, {
        credentials: 'same-origin',
        headers: {
          'X-Fetched-With': 'SPA-Fetch',
          Accept: 'text/html',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();

      // Insert content
      targetElement.innerHTML = html;

      // Execute any scripts in the new content
      this.executeScriptsFromNode(targetElement);

      // Dispatch navigation event
      window.dispatchEvent(
        new CustomEvent('app:navigate', {
          detail: { targetElement, path },
        })
      );

      return true;
    } catch (error) {
      console.error('Error loading page content:', error);

      if (targetElement) {
        targetElement.innerHTML = `
          <div role="alert" aria-live="assertive">
            <p style="color: red; text-align: center; padding: 2rem;">
              Failed to load content. ${error.message}
            </p>
          </div>
        `;
      }

      return false;
    }
  }

  async updatePageContent(activeLink, pushState = true) {
    if (this.isTransitioning || !activeLink) return;

    this.isTransitioning = true;

    try {
      const rawHref = activeLink.getAttribute('href') || activeLink.href;
      const cleanHref = normalizePath(rawHref);

      // Fade out content
      await this.fadeOutContent();

      // Update navigation state
      this.updateNavigationState(activeLink);

      // Update browser history
      if (pushState) {
        history.pushState({ path: cleanHref }, '', cleanHref);
      }

      // Update page title and metadata
      this.updatePageMetadata(cleanHref, activeLink);

      // Load new content
      await this.loadPageContent(cleanHref, this.mainContentArea);

      // Fade in content
      await this.fadeInContent();

      // Handle focus management
      this.manageFocus();
    } catch (error) {
      console.error('Error updating page content:', error);
    } finally {
      this.isTransitioning = false;
    }
  }

  async fadeOutContent() {
    if (!this.mainContentArea) return;

    const fadeDuration = getTransitionDuration(this.mainContentArea);

    this.mainContentArea.style.opacity = '0';
    if (subTitleElement) {
      subTitleElement.style.opacity = '0';
    }

    // Wait for transition to complete
    await new Promise((resolve) => setTimeout(resolve, fadeDuration + 50));
  }

  async fadeInContent() {
    if (!this.mainContentArea) return;

    requestAnimationFrame(() => {
      this.mainContentArea.style.opacity = '1';
      if (subTitleElement) {
        subTitleElement.style.opacity = '1';
      }
    });
  }

  updateNavigationState(activeLink) {
    // Remove active state from all links
    this.navLinks.forEach((link) => {
      link.classList.remove('is-active');
      link.removeAttribute('aria-current');
    });

    // Set active state on current link
    activeLink.classList.add('is-active');
    activeLink.setAttribute('aria-current', 'page');
  }

  updatePageMetadata(path, activeLink) {
    const pageTitle = PAGE_TITLES[path] || activeLink.textContent.trim();

    // Update subtitle element
    if (subTitleElement) {
      subTitleElement.textContent = pageTitle;
    }

    // Update document title
    document.title = `${pageTitle} | aepaints`;

    // Update data-page attribute
    if (this.dynamicPageWrapper) {
      const dataPageValue = path.replace('/', '') || 'home';
      this.dynamicPageWrapper.setAttribute('data-page', dataPageValue);
    }
  }

  manageFocus() {
    if (!this.mainContentArea) return;

    requestAnimationFrame(() => {
      const heading = this.mainContentArea.querySelector(
        'h1, h2, .page-title, .page-content-wrapper h2'
      );

      if (heading) {
        heading.setAttribute('tabindex', '-1');
        heading.focus({ preventScroll: true });
      } else {
        this.mainContentArea.focus({ preventScroll: true });
      }
    });
  }

  handleNavClick(event) {
    const link = event.target.closest('a');

    // Validate link
    if (!link || !link.closest('nav') || !link.href) return;

    // Check if it's an external link
    try {
      const linkUrl = new URL(link.href, window.location.origin);
      if (linkUrl.origin !== window.location.origin) return;
    } catch (error) {
      return;
    }

    // Check if it's just a hash link on the same page
    const targetPath = normalizePath(link.href);
    const currentPath = normalizePath(window.location.pathname);

    if (link.hash && targetPath === currentPath) return;

    event.preventDefault();
    this.updatePageContent(link, true);
  }

  handlePopState(event) {
    const path = normalizePath(window.location.pathname);
    const activeLink = this.findNavLinkByPath(path);

    if (activeLink) {
      this.updatePageContent(activeLink, false);
    } else {
      // Fallback: load content directly
      this.loadPageContent(path, this.mainContentArea);
      this.fadeInContent();
    }
  }

  handleInitialLoad() {
    const initialPath = normalizePath(window.location.pathname);
    const initialLink = this.findNavLinkByPath(initialPath) || this.findNavLinkByPath('/home');

    if (initialLink) {
      this.updateNavigationState(initialLink);
      this.updatePageMetadata(initialPath, initialLink);
    }

    // Ensure initial content is visible
    if (this.mainContentArea) {
      this.mainContentArea.style.opacity = '1';
      this.executeScriptsFromNode(this.mainContentArea);

      // Dispatch initial navigation event
      window.dispatchEvent(
        new CustomEvent('app:navigate', {
          detail: { targetElement: this.mainContentArea, path: initialPath },
        })
      );
    }

    if (subTitleElement) {
      subTitleElement.style.opacity = '1';
    }
  }
}

// Initialize navigation when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new NavigationManager();
});
