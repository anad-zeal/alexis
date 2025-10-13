// /assets/js/navigation.js
// Improved, drop-in replacement for your SPA navigation logic.

function parseDurationValue(value) {
  value = (value || '').trim();
  if (!value) return 0;
  if (value.endsWith('ms')) return parseFloat(value);
  if (value.endsWith('s')) return parseFloat(value) * 1000;
  return parseFloat(value) || 0;
}

function getTransitionDuration(element) {
  if (!element) return 0;
  const style = window.getComputedStyle(element);
  const raw = style.transitionDuration || style.webkitTransitionDuration || '';
  const parts = raw
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length === 0) return 0;
  const msValues = parts.map(parseDurationValue);
  return Math.max(...msValues);
}

function normalizePath(href) {
  try {
    const u = new URL(href, window.location.origin);
    let p = u.pathname || '/';
    // Remove trailing slash unless it's the root path '/'
    if (p.length > 1 && p.endsWith('/')) {
      p = p.slice(0, -1);
    }
    return p;
  } catch (e) {
    // Fallback for invalid URLs, though URL constructor is quite robust
    let p = String(href || '');
    if (!p.startsWith('/')) p = '/' + p;
    if (p.length > 1 && p.endsWith('/')) {
      p = p.slice(0, -1);
    }
    return p;
  }
}

const pageTitles = {
  // Map clean paths to human-readable titles (for subtitle and document title parts)
  '/home': 'Home',
  '/artworks': 'Artwork Categories',
  '/biography': 'Biography',
  '/contact': 'Contact Me',
  '/drips': 'Drip Series Collection',
  '/encaustic': 'Encaustic Works',
  '/projects': 'Project Series Gallery',
  '/restoration': 'Restoration Services',
  '/decorative': 'Decorative Art',
  '/black-and-white': 'Black and White Gallery',
};

document.addEventListener('DOMContentLoaded', () => {
  const navLinks = Array.from(document.querySelectorAll('nav a'));
  const heroTitleElement = document.querySelector('h1.title'); // The main, consistent title
  const subTitleElement = document.querySelector('p.sub-title'); // The dynamic subtitle
  const dynamicPageWrapper = document.getElementById('dynamic-page-wrapper');
  // Target the main content area for a full content fade during navigation
  const mainContentFadeArea = document.getElementById('main-content-area'); // Targets the <main> element
  const loadingSpinner = document.getElementById('loading-spinner');
  let isTransitioning = false;

  // Add a transition to the main content area if it doesn't have one
  if (mainContentFadeArea && !getTransitionDuration(mainContentFadeArea)) {
    mainContentFadeArea.style.transition = `opacity 280ms ease-in-out`; // Default speed if none defined
  }
  // Also ensure the subtitle has a transition
  if (subTitleElement && !getTransitionDuration(subTitleElement)) {
    subTitleElement.style.transition = `opacity 280ms ease-in-out`;
  }

  function findNavLinkByPath(pathname) {
    const norm = normalizePath(pathname);
    return navLinks.find((a) => normalizePath(a.getAttribute('href') || a.href) === norm);
  }

  async function extractFragmentFromHtml(html, selector = '#dynamic-page-wrapper') {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const fragmentRoot = doc.querySelector(selector);
    return fragmentRoot ? fragmentRoot.innerHTML : '';
  }

  function executeScriptsFromNode(container) {
    const scripts = Array.from(container.querySelectorAll('script'));
    scripts.forEach((old) => {
      if (old.type === 'module' || old.dataset.processed === 'true') {
        return;
      }

      const script = document.createElement('script');
      if (old.src) {
        script.src = old.src;
        script.async = false;
        script.dataset.processed = 'true';
      } else {
        script.textContent = old.textContent;
      }
      Array.from(old.attributes).forEach((attr) => {
        if (attr.name !== 'src') script.setAttribute(attr.name, attr.value);
      });
      old.parentNode.replaceChild(script, old);
    });
  }

  async function loadPageContent(path) {
    if (loadingSpinner) loadingSpinner.style.display = 'block';
    if (!dynamicPageWrapper) {
      console.error('Dynamic page wrapper (#dynamic-page-wrapper) not found!');
      return false;
    }

    try {
      const response = await fetch(path, {
        credentials: 'same-origin',
        headers: {
          'X-Fetched-With': 'SPA-Fetch',
        },
      });
      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }
      const html = await response.text();
      const fragmentHtml = await extractFragmentFromHtml(html, '#dynamic-page-wrapper');
      dynamicPageWrapper.innerHTML = fragmentHtml;

      executeScriptsFromNode(dynamicPageWrapper);

      window.dispatchEvent(
        new CustomEvent('app:navigate', {
          detail: { targetElement: dynamicPageWrapper, path: path },
        })
      );

      return true;
    } catch (err) {
      console.error('Error loading page content:', err);
      if (dynamicPageWrapper) {
        dynamicPageWrapper.innerHTML = `<div role="alert" aria-live="assertive"><p style="color:red;">Failed to load content. ${err.message}</p></div>`;
      }
      return false;
    } finally {
      if (loadingSpinner) loadingSpinner.style.display = 'none';
    }
  }

  async function updatePageContent(activeLink, pushState = true, isInitialLoad = false) {
    // Added isInitialLoad
    if (isTransitioning) return;
    isTransitioning = true;

    try {
      const rawHref = activeLink.getAttribute('href') || activeLink.href;
      const cleanHref = normalizePath(rawHref);
      const pageKey = cleanHref;

      // Only fade out if it's NOT the initial load
      if (!isInitialLoad && mainContentFadeArea) {
        const fadeDuration = getTransitionDuration(mainContentFadeArea);
        mainContentFadeArea.style.opacity = 0;
        if (subTitleElement) subTitleElement.style.opacity = 0; // Fade subtitle with main area
        await new Promise((r) => setTimeout(r, fadeDuration + 50));
      } else if (!isInitialLoad && subTitleElement) {
        // Fallback if mainContentFadeArea isn't defined
        const fadeDuration = getTransitionDuration(subTitleElement);
        subTitleElement.style.opacity = 0;
        await new Promise((r) => setTimeout(r, fadeDuration + 50));
      }

      navLinks.forEach((link) => {
        link.classList.remove('is-active');
        link.removeAttribute('aria-current');
      });
      activeLink.classList.add('is-active');
      activeLink.setAttribute('aria-current', 'page');

      if (pushState) {
        history.pushState({ path: cleanHref }, '', cleanHref);
      }

      const newPageTitle = pageTitles[pageKey] || activeLink.textContent.trim();
      if (subTitleElement) subTitleElement.textContent = newPageTitle;
      document.title = `${newPageTitle} | aepaints`;

      // If it's the initial load, the content is already there, so we don't need to load it again via fetch.
      // However, we still need to run scripts and dispatch events.
      if (!isInitialLoad) {
        await loadPageContent(cleanHref);
      } else {
        // On initial load, the content is server-rendered. We still need to run any scripts
        // within #dynamic-page-wrapper that might not have run on initial DOMContentLoaded.
        executeScriptsFromNode(dynamicPageWrapper);
        window.dispatchEvent(
          new CustomEvent('app:navigate', {
            detail: { targetElement: dynamicPageWrapper, path: cleanHref },
          })
        );
      }

      // Always fade in, even if it was the initial load (to ensure opacity is 1 after all JS)
      if (mainContentFadeArea) {
        requestAnimationFrame(() => {
          mainContentFadeArea.style.opacity = 1;
        });
      }
      if (subTitleElement) {
        requestAnimationFrame(() => {
          subTitleElement.style.opacity = 1;
        });
      }

      requestAnimationFrame(() => {
        const heading = dynamicPageWrapper.querySelector(
          'h1, h2, .page-title, .page-content-wrapper h2'
        );
        if (heading) {
          heading.setAttribute('tabindex', '-1');
          heading.focus({ preventScroll: true });
        } else {
          mainContentFadeArea?.focus({ preventScroll: true });
        }
      });
    } finally {
      isTransitioning = false;
    }
  }

  window.addEventListener('popstate', (event) => {
    const path = normalizePath(window.location.pathname);
    const active = findNavLinkByPath(path);
    if (active) {
      // Popstate is never an initial load, but it's not a PUSH_STATE navigation
      updatePageContent(active, false, false).catch((e) => console.error('Popstate error:', e));
    } else {
      loadPageContent(path).catch((e) => console.error('Popstate load content error:', e));
    }
  });

  document.querySelector('nav').addEventListener('click', (ev) => {
    const a = ev.target.closest('a');
    if (!a || !a.closest('nav') || !a.href) return;

    if (new URL(a.href, window.location.origin).origin !== window.location.origin) return;

    const targetPath = normalizePath(a.href);
    const currentPath = normalizePath(window.location.pathname);
    if (a.hash && targetPath === currentPath) return;

    ev.preventDefault();
    // This is always a user-initiated navigation, so isInitialLoad is false
    updatePageContent(a, true, false).catch((e) => console.error('Navigation click error:', e));
  });

  // Initial load logic
  const initialPath = normalizePath(window.location.pathname);
  const initialLink = findNavLinkByPath(initialPath) || findNavLinkByPath('/home');

  if (initialLink) {
    // Crucially, pass isInitialLoad = true here to skip the fade-out
    updatePageContent(initialLink, false, true).catch((e) =>
      console.error('Initial load error:', e)
    );
  } else {
    // If no initial link, still ensure opacities are 1, and load content if necessary
    console.warn(
      `No navigation link found for initial path: ${initialPath}. Ensuring content visibility.`
    );
    // Since content is likely already rendered by PHP, just ensure scripts run and opacities are 1
    executeScriptsFromNode(dynamicPageWrapper);
    window.dispatchEvent(
      new CustomEvent('app:navigate', {
        detail: { targetElement: dynamicPageWrapper, path: initialPath },
      })
    );
    if (mainContentFadeArea) mainContentFadeArea.style.opacity = 1;
    if (subTitleElement) subTitleElement.style.opacity = 1;
    const homeLink = findNavLinkByPath('/home');
    if (homeLink) {
      homeLink.classList.add('is-active');
      homeLink.setAttribute('aria-current', 'page');
    }
  }
});
