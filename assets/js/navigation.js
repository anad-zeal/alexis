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
  '/home': 'Home', // Adjusted for consistency
  '/artworks': 'Artwork Categories',
  '/biography': 'Biography', // Adjusted for consistency
  '/contact': 'Contact Me', // Adjusted for consistency
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
  const dynamicPageWrapper = document.getElementById('main-content-area');
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

  // extractFragmentFromHtml will now look for content within #main-content-area by default
  async function extractFragmentFromHtml(html, selector = '#main-content-area') {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const fragmentRoot = doc.querySelector(selector);
    // Fallback to body or return empty if fragmentRoot is not found, to avoid errors
    return fragmentRoot ? fragmentRoot.innerHTML : '';
  }

  function executeScriptsFromNode(container) {
    const scripts = Array.from(container.querySelectorAll('script'));
    scripts.forEach((old) => {
      // Only execute scripts that are not modules or already loaded
      if (old.type === 'module' || old.dataset.processed === 'true') {
        return;
      }

      const script = document.createElement('script');
      if (old.src) {
        script.src = old.src;
        script.async = false;
        script.dataset.processed = 'true'; // Mark as processed
      } else {
        script.textContent = old.textContent;
      }
      Array.from(old.attributes).forEach((attr) => {
        if (attr.name !== 'src') script.setAttribute(attr.name, attr.value);
      });
      // Replace the old script with the new one to ensure it executes
      old.parentNode.replaceChild(script, old);
    });
  }

  async function loadPageContent(path) {
    if (loadingSpinner) loadingSpinner.style.display = 'block';
    if (!dynamicPageWrapper) {
      console.error('Dynamic page wrapper (#main-content-area) not found!');
      return false;
    }

    try {
      const response = await fetch(path, {
        credentials: 'same-origin',
        headers: {
          'X-Fetched-With': 'SPA-Fetch', // Custom header to signal AJAX request to PHP
        },
      });
      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }
      const html = await response.text();
      const fragmentHtml = await extractFragmentFromHtml(html, '#main-content-area');
      dynamicPageWrapper.innerHTML = fragmentHtml;

      executeScriptsFromNode(dynamicPageWrapper);

      // Dispatch custom event to notify components (like slideshows) that new content has loaded
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

  async function updatePageContent(activeLink, pushState = true) {
    if (isTransitioning) return;
    isTransitioning = true;

    try {
      const rawHref = activeLink.getAttribute('href') || activeLink.href;
      const cleanHref = normalizePath(rawHref);
      const pageKey = cleanHref; // Use the clean path as the key for pageTitles map

      // Fade out the main content area (including hero)
      if (mainContentFadeArea) {
        const fadeDuration = getTransitionDuration(mainContentFadeArea);
        mainContentFadeArea.style.opacity = 0;
        await new Promise((r) => setTimeout(r, fadeDuration + 50)); // Add a small buffer
      } else if (subTitleElement) {
        // Fallback if mainContentFadeArea isn't defined for some reason
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

      // Update subtitle and document title
      const newPageTitle = pageTitles[pageKey] || activeLink.textContent.trim();
      if (subTitleElement) subTitleElement.textContent = newPageTitle;
      document.title = `${newPageTitle} | aepaints`; // Consistent with header.php for "$full_page_title"

      await loadPageContent(cleanHref);

      // Fade in the main content area
      if (mainContentFadeArea) {
        requestAnimationFrame(() => {
          mainContentFadeArea.style.opacity = 1;
        });
      } else if (subTitleElement) {
        // Fallback fade in
        requestAnimationFrame(() => {
          subTitleElement.style.opacity = 1;
        });
      }

      // Accessibility: focus the main heading within the dynamically loaded content
      // Use requestAnimationFrame to ensure element is fully rendered before attempting focus
      requestAnimationFrame(() => {
        const heading = dynamicPageWrapper.querySelector(
          'h1, h2, .page-title, .page-content-wrapper h2'
        );
        if (heading) {
          heading.setAttribute('tabindex', '-1');
          heading.focus({ preventScroll: true });
        } else {
          // If no specific heading, focus the main content area itself
          mainContentFadeArea?.focus({ preventScroll: true });
        }
      });
    } finally {
      isTransitioning = false;
    }
  }

  window.addEventListener('popstate', (event) => {
    // Only proceed if it's a history state change initiated by our SPA logic
    // or if the path is explicitly different from current (browser back/forward)
    const path = normalizePath(window.location.pathname);
    const active = findNavLinkByPath(path);
    if (active) {
      updatePageContent(active, false).catch((e) => console.error('Popstate error:', e));
    } else {
      // Fallback: If no nav link matches (e.g., direct URL entry or external page in history),
      // just load the content for the path.
      loadPageContent(path).catch((e) => console.error('Popstate load content error:', e));
    }
  });

  document.querySelector('nav').addEventListener('click', (ev) => {
    const a = ev.target.closest('a');
    // Ensure it's a link, within the nav, and not an external link
    if (!a || !a.closest('nav') || !a.href) return;

    // Check if it's an external link (different origin)
    if (new URL(a.href, window.location.origin).origin !== window.location.origin) return;

    // Allow anchor links on the same page to work normally
    const targetPath = normalizePath(a.href);
    const currentPath = normalizePath(window.location.pathname);
    if (a.hash && targetPath === currentPath) return;

    ev.preventDefault(); // Prevent default browser navigation for SPA links
    updatePageContent(a, true).catch((e) => console.error('Navigation click error:', e));
  });

  // Initial load: pick matching nav link or default to /home
  const initialPath = normalizePath(window.location.pathname);
  const initialLink = findNavLinkByPath(initialPath) || findNavLinkByPath('/home');

  if (initialLink) {
    updatePageContent(initialLink, false) // No pushState on initial load
      .then(() => {
        // Ensure fade area is visible after initial content load
        if (mainContentFadeArea) mainContentFadeArea.style.opacity = 1;
        // Also ensure subtitle is visible after initial load
        if (subTitleElement) subTitleElement.style.opacity = 1;
      })
      .catch((e) => console.error('Initial load error:', e));
  } else {
    // Last resort: fetch /home fragment if no initial link is found
    console.warn(`No navigation link found for initial path: ${initialPath}. Loading /home.`);
    loadPageContent('/home')
      .then(() => {
        if (mainContentFadeArea) mainContentFadeArea.style.opacity = 1;
        if (subTitleElement) subTitleElement.style.opacity = 1;
        const homeLink = findNavLinkByPath('/home');
        if (homeLink) {
          homeLink.classList.add('is-active');
          homeLink.setAttribute('aria-current', 'page');
        }
      })
      .catch((e) => console.error('Initial home content load error:', e));
  }

  // Initial state for mainContentFadeArea and subTitleElement should be set to 1
  // to prevent them from staying invisible if there's no initial fade-in or if JS fails.
  // This is a safety measure.
  if (mainContentFadeArea) mainContentFadeArea.style.opacity = 1;
  if (subTitleElement) subTitleElement.style.opacity = 1;
});
