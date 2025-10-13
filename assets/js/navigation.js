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
    if (p.length > 1 && p.endsWith('/')) {
      p = p.slice(0, -1);
    }
    return p;
  } catch (e) {
    let p = String(href || '');
    if (!p.startsWith('/')) p = '/' + p;
    if (p.length > 1 && p.endsWith('/')) {
      p = p.slice(0, -1);
    }
    return p;
  }
}

const pageTitles = {
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
  const heroTitleElement = document.querySelector('h1.title');
  const subTitleElement = document.querySelector('p.sub-title');
  const dynamicPageWrapper = document.getElementById('dynamic-page-wrapper');
  const mainContentFadeArea = document.getElementById('main-content-area');
  const loadingSpinner = document.getElementById('loading-spinner');
  let isTransitioning = false;

  // Add default transitions if not defined in CSS.
  // This is a safety for quick development but ideally should be in style.css
  if (mainContentFadeArea && !getTransitionDuration(mainContentFadeArea)) {
    mainContentFadeArea.style.transition = `opacity 280ms ease-in-out`;
  }
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

  async function loadPageContentAndDispatch(path, targetElement) {
    if (loadingSpinner) loadingSpinner.style.display = 'block';
    if (!targetElement) {
      console.error('Target element for content loading not found!');
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
      targetElement.innerHTML = fragmentHtml;

      executeScriptsFromNode(targetElement);

      window.dispatchEvent(
        new CustomEvent('app:navigate', {
          detail: { targetElement: targetElement, path: path },
        })
      );

      return true;
    } catch (err) {
      console.error('Error loading page content:', err);
      if (targetElement) {
        targetElement.innerHTML = `<div role="alert" aria-live="assertive"><p style="color:red;">Failed to load content. ${err.message}</p></div>`;
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
      const pageKey = cleanHref;

      // Fade out the main content area (including hero)
      if (mainContentFadeArea) {
        const fadeDuration = getTransitionDuration(mainContentFadeArea);
        mainContentFadeArea.style.opacity = 1;
        if (subTitleElement) subTitleElement.style.opacity = 1;
        await new Promise((r) => setTimeout(r, fadeDuration + 50));
      } else if (subTitleElement) {
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

      // Load new content and dispatch the 'app:navigate' event
      await loadPageContentAndDispatch(cleanHref, dynamicPageWrapper);

      // Fade in the main content area
      if (mainContentFadeArea) {
        requestAnimationFrame(() => {
          mainContentFadeArea.style.opacity = 1;
        });
      }
      if (subTitleElement) {
        // Always ensure subtitle fades in too
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
      updatePageContent(active, false).catch((e) => console.error('Popstate error:', e));
    } else {
      // If no nav link for the popstate path, just load content without updating nav UI
      loadPageContentAndDispatch(path, dynamicPageWrapper).catch((e) =>
        console.error('Popstate load content error:', e)
      );
      // Ensure current main content fade area is visible (e.g. if coming from external site)
      if (mainContentFadeArea) mainContentFadeArea.style.opacity = 1;
      if (subTitleElement) subTitleElement.style.opacity = 1;
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
    updatePageContent(a, true).catch((e) => console.error('Navigation click error:', e));
  });

  // --- Initial page load handler ---
  const initialPath = normalizePath(window.location.pathname);
  const initialLink = findNavLinkByPath(initialPath) || findNavLinkByPath('/home');

  // Set initial active link
  if (initialLink) {
    navLinks.forEach((link) => {
      link.classList.remove('is-active');
      link.removeAttribute('aria-current');
    });
    initialLink.classList.add('is-active');
    initialLink.setAttribute('aria-current', 'page');

    const newPageTitle = pageTitles[initialPath] || initialLink.textContent.trim();
    if (subTitleElement) subTitleElement.textContent = newPageTitle;
    document.title = `${newPageTitle} | aepaints`;
  } else {
    // If no specific nav link found, ensure the home link is active as a fallback
    const homeLink = findNavLinkByPath('/home');
    if (homeLink) {
      homeLink.classList.add('is-active');
      homeLink.setAttribute('aria-current', 'page');
      const newPageTitle = pageTitles['/home'] || homeLink.textContent.trim();
      if (subTitleElement) subTitleElement.textContent = newPageTitle;
      document.title = `${newPageTitle} | aepaints`;
    }
  }

  // For the initial server-rendered content:
  // 1. Ensure opacities are 1 (they should be by default CSS, but this reinforces it)
  // 2. Execute any scripts that were already in the server-rendered #dynamic-page-wrapper
  // 3. Dispatch 'app:navigate' so components like slideshows can initialize on initial content.
  if (mainContentFadeArea) mainContentFadeArea.style.opacity = 1;
  if (subTitleElement) subTitleElement.style.opacity = 1;
  executeScriptsFromNode(dynamicPageWrapper);
  window.dispatchEvent(
    new CustomEvent('app:navigate', {
      detail: { targetElement: dynamicPageWrapper, path: initialPath },
    })
  );
});
