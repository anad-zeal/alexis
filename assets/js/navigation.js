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
    if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
    return p;
  } catch (e) {
    let p = String(href || '');
    if (!p.startsWith('/')) p = '/' + p;
    if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
    return p;
  }
}

const pageTitles = {
  '/home': 'The life of an artist',
  '/artworks': 'Artwork Categories',
  '/biography': 'How I became an artist',
  '/contact': 'Send me a message',
  '/drips': 'Drip Series Collection',
  '/encaustic': 'Encaustic Works',
  '/projects': 'Project Series Gallery',
  '/restoration': 'Restoration Services',
  '/decorative': 'Decorative Art',
  '/black-and-white': 'Black and White Gallery', // Added for completeness if this is a direct page
};

document.addEventListener('DOMContentLoaded', () => {
  const navLinks = Array.from(document.querySelectorAll('nav a'));
  const subTitleElement =
    document.querySelector('h2.sub-title') || document.querySelector('p.sub-title');
  // Changed target to dynamicPageWrapper as per our HTML structure plan
  const dynamicPageWrapper = document.getElementById('dynamic-page-wrapper');
  // mainContentFadeArea is likely just the subTitleElement for fading the title
  const mainContentFadeArea = document.getElementById('main-content-fade-area') || subTitleElement;
  const loadingSpinner = document.getElementById('loading-spinner') || null;
  let isTransitioning = false;

  function findNavLinkByPath(pathname) {
    const norm = normalizePath(pathname);
    return navLinks.find((a) => normalizePath(a.getAttribute('href') || a.href) === norm);
  }

  // extractFragmentFromHtml will now look for content within #dynamic-page-wrapper by default
  async function extractFragmentFromHtml(html, selector = '#dynamic-page-wrapper') {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const fragmentRoot =
      doc.querySelector(selector) || doc.querySelector('.entry-content') || doc.body;
    return fragmentRoot ? fragmentRoot.innerHTML : '';
  }

  function executeScriptsFromNode(container) {
    const scripts = Array.from(container.querySelectorAll('script'));
    scripts.forEach((old) => {
      const script = document.createElement('script');
      if (old.src) {
        script.src = old.src;
        script.async = false;
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
    dynamicPageWrapper.innerHTML = ''; // Clear previous content

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
      const fragmentHtml = await extractFragmentFromHtml(html, '#dynamic-page-wrapper');
      dynamicPageWrapper.innerHTML = fragmentHtml;

      executeScriptsFromNode(dynamicPageWrapper);
      // Ensure initSlideshows is a function before calling it
      if (typeof initSlideshows === 'function') {
        initSlideshows(dynamicPageWrapper); // Initialize slideshows within the new content
      }
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
      const pageName = cleanHref.substring(1) || 'home';

      const newSubTitleText = pageTitles[cleanHref] || activeLink.textContent.trim();

      if (mainContentFadeArea) {
        const fadeDuration = getTransitionDuration(mainContentFadeArea) || 280;
        mainContentFadeArea.style.opacity = 0;
        await new Promise((r) => setTimeout(r, fadeDuration));
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

      if (subTitleElement) subTitleElement.textContent = newSubTitleText;
      // Update the main document title for the browser tab
      document.title = `${newSubTitleText} — elzalive`; // Adjust "elzalive" as needed

      await loadPageContent(cleanHref);

      if (mainContentFadeArea) {
        requestAnimationFrame(() => {
          mainContentFadeArea.style.opacity = 1;
        });
      }

      // Accessibility: focus the main heading within the dynamically loaded content
      const heading = dynamicPageWrapper.querySelector('h1, h2, .page-title');
      if (heading) {
        heading.setAttribute('tabindex', '-1');
        heading.focus({ preventScroll: true });
      }
    } finally {
      isTransitioning = false;
    }
  }

  window.addEventListener('popstate', (event) => {
    const path = normalizePath(window.location.pathname);
    const active = findNavLinkByPath(path);
    if (active) {
      updatePageContent(active, false).catch((e) => console.error('Popstate error:', e));
    } else {
      // Fallback: If no nav link matches, just load the content for the path
      loadPageContent(path).catch((e) => console.error('Popstate load content error:', e));
    }
  });

  document.querySelector('nav').addEventListener('click', (ev) => {
    const a = ev.target.closest('a');
    if (!a || !a.closest('nav')) return; // Ensure it's a link within this nav
    const href = a.getAttribute('href') || a.href;

    // Check if it's an external link (different origin)
    if (new URL(href, window.location.origin).origin !== window.location.origin) return;

    // Allow anchor links on the same page to work normally if needed
    if (a.hash && normalizePath(href) === normalizePath(window.location.pathname)) return;

    ev.preventDefault(); // Prevent default browser navigation for SPA links
    updatePageContent(a, true).catch((e) => console.error('Navigation click error:', e));
  });

  // Initial load: pick matching nav link or default to /home
  const initialPath = normalizePath(window.location.pathname);
  const initialLink = findNavLinkByPath(initialPath) || findNavLinkByPath('/home') || navLinks[0];

  if (initialLink) {
    updatePageContent(initialLink, false) // No pushState on initial load
      .then(() => {
        // Ensure fade area is visible after initial content load
        if (mainContentFadeArea) mainContentFadeArea.style.opacity = 1;
      })
      .catch((e) => console.error('Initial load error:', e));
  } else {
    // Last resort: fetch /home fragment if no initial link is found
    loadPageContent('/home')
      .then(() => {
        if (mainContentFadeArea) mainContentFadeArea.style.opacity = 1;
        const homeLink = findNavLinkByPath('/home');
        if (homeLink) {
          homeLink.classList.add('is-active');
          homeLink.setAttribute('aria-current', 'page');
        }
      })
      .catch((e) => console.error('Initial home content load error:', e));
  }
});
// /assets/js/misc.js
