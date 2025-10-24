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
  '/restoration': 'Historical Restoration Projects',
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
    this.subTitleElement = null; // Move inside class

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
    this.subTitleElement = document.querySelector('p.page-title'); // Use this.subTitleElement
    this.navLinks = Array.from(document.querySelectorAll('nav a'));
    this.mainContentArea = document.getElementById('main-content-area');
    this.dynamicPageWrapper = document.getElementById('dynamic-page-wrapper');

    // Debug logging
    console.log('Elements cached:', {
      subTitleElement: this.subTitleElement,
      navLinksCount: this.navLinks.length,
      mainContentArea: this.mainContentArea,
      dynamicPageWrapper: this.dynamicPageWrapper,
    });
  }

  setupEventListeners() {
    // Navigation click handler
    const navElement = document.querySelector('nav');
    if (navElement) {
      navElement.addEventListener('click', this.handleNavClick.bind(this));
    }

    // JSON link click handler
    document.addEventListener('click', this.handleJsonLinkClick.bind(this));

    // Browser back/forward handler
    window.addEventListener('popstate', this.handlePopState.bind(this));

    // Font size change handlers
    this.setupFontSizeHandlers();
  }

  // Handle JSON link clicks
  handleJsonLinkClick(event) {
    const link = event.target.closest('.json-link');

    if (!link) return;

    event.preventDefault();

    const category = link.getAttribute('data-category');
    const href = `/${category}`;

    // Create a temporary link element for navigation
    const tempLink = document.createElement('a');
    tempLink.href = href;
    tempLink.setAttribute('href', href);
    tempLink.textContent = link.textContent;

    this.updatePageContent(tempLink, true);
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

    if (this.subTitleElement) {
      this.subTitleElement.style.fontSize = '5vw';
    } else {
      console.warn('Category link clicked, but p.page-title element not found.');
    }

    console.log('Category clicked:', gallery);
  }

  handleLandingMenuClick(event) {
    event.preventDefault();

    if (this.subTitleElement) {
      const currentFontSize = this.subTitleElement.style.fontSize;

      if (currentFontSize === '5vw') {
        this.subTitleElement.style.fontSize = '10vw';
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

    if (this.subTitleElement && !getTransitionDuration(this.subTitleElement)) {
      this.subTitleElement.style.transition = defaultTransition;
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
      targetElement.innerHTML = html;
      this.executeScriptsFromNode(targetElement);

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

      await this.fadeOutContent();
      this.updateNavigationState(activeLink);

      if (pushState) {
        history.pushState({ path: cleanHref }, '', cleanHref);
      }

      this.updatePageMetadata(cleanHref, activeLink);
      await this.loadPageContent(cleanHref, this.mainContentArea);
      await this.fadeInContent();
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
    if (this.subTitleElement) {
      this.subTitleElement.style.opacity = '0';
    }

    await new Promise((resolve) => setTimeout(resolve, fadeDuration + 50));
  }

  async fadeInContent() {
    if (!this.mainContentArea) return;

    requestAnimationFrame(() => {
      this.mainContentArea.style.opacity = '1';
      if (this.subTitleElement) {
        this.subTitleElement.style.opacity = '1';
      }
    });
  }

  updateNavigationState(activeLink) {
    this.navLinks.forEach((link) => {
      link.classList.remove('is-active');
      link.removeAttribute('aria-current');
    });

    activeLink.classList.add('is-active');
    activeLink.setAttribute('aria-current', 'page');
  }

  updatePageMetadata(path, activeLink) {
    const pageTitle = PAGE_TITLES[path] || activeLink.textContent.trim();

    if (this.subTitleElement) {
      this.subTitleElement.textContent = pageTitle;
    }

    document.title = `${pageTitle} | AEPaints`;

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

    if (!link || !link.closest('nav') || !link.href) return;

    try {
      const linkUrl = new URL(link.href, window.location.origin);
      if (linkUrl.origin !== window.location.origin) return;
    } catch (error) {
      return;
    }

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

    if (this.mainContentArea) {
      this.mainContentArea.style.opacity = '1';
      this.executeScriptsFromNode(this.mainContentArea);

      window.dispatchEvent(
        new CustomEvent('app:navigate', {
          detail: { targetElement: this.mainContentArea, path: initialPath },
        })
      );
    }

    if (this.subTitleElement) {
      this.subTitleElement.style.opacity = '1';
    }
  }
}

// Initialize navigation when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new NavigationManager();
});
