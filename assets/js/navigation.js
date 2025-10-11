// Improved, drop-in replacement for your SPA navigation logic.

function parseDurationValue(value) {
  // Accepts strings like "0.3s" or "150ms" and returns ms as number
  value = (value || '').trim();
  if (!value) return 0;
  if (value.endsWith('ms')) return parseFloat(value);
  if (value.endsWith('s')) return parseFloat(value) * 1000;
  // fallback
  return parseFloat(value) || 0;
}

function getTransitionDuration(element) {
  if (!element) return 0;
  const style = window.getComputedStyle(element);
  const raw = style.transitionDuration || style.webkitTransitionDuration || '';
  // transition-duration can be comma-separated; use the longest duration
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
    // convert absolute -> pathname, remove trailing slash (except root)
    const u = new URL(href, window.location.origin);
    let p = u.pathname || '/';
    if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
    return p;
  } catch (e) {
    // fallback: assume it's already a pathname
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
};

document.addEventListener('DOMContentLoaded', () => {
  const navLinks = Array.from(document.querySelectorAll('nav a'));
  const subTitleElement =
    document.querySelector('h2.sub-title') || document.querySelector('p.sub-title');
  const mainContentArea = document.getElementById('main-content-area');
  const mainContentFadeArea = document.getElementById('main-content-fade-area') || subTitleElement;
  const loadingSpinner = document.getElementById('loading-spinner') || null; // make sure you have this in markup if you want a spinner
  let isTransitioning = false;

  function findNavLinkByPath(pathname) {
    // tolerant matching: compare normalized paths
    const norm = normalizePath(pathname);
    return navLinks.find((a) => normalizePath(a.getAttribute('href') || a.href) === norm);
  }

  async function extractFragmentFromHtml(html, selector = '#main-content-area') {
    // Parse response HTML and extract a fragment node, fallback to entire body innerHTML
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const fragmentRoot =
      doc.querySelector(selector) || doc.querySelector('.entry-content') || doc.body;
    // Return HTML string of fragment
    return fragmentRoot ? fragmentRoot.innerHTML : '';
  }

  function executeScriptsFromNode(container) {
    // re-run any inline scripts found in the fetched fragment or load external scripts
    const scripts = Array.from(container.querySelectorAll('script'));
    scripts.forEach((old) => {
      const script = document.createElement('script');
      if (old.src) {
        script.src = old.src;
        script.async = false; // preserve order
      } else {
        script.textContent = old.textContent;
      }
      // copy attributes if needed
      Array.from(old.attributes).forEach((attr) => {
        if (attr.name !== 'src') script.setAttribute(attr.name, attr.value);
      });
      old.parentNode.replaceChild(script, old);
    });
  }

  async function loadPageContent(path) {
    if (loadingSpinner) loadingSpinner.style.display = 'block';
    // Clear previous content only after fade-out to avoid flicker (your code cleared immediately)
    // Keep small guard: if no mainContentArea, bail
    if (!mainContentArea) return;

    try {
      const response = await fetch(path, { credentials: 'same-origin' });
      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }
      const html = await response.text();
      const fragmentHtml = await extractFragmentFromHtml(html, '#main-content-area');
      // Inject fragment
      mainContentArea.innerHTML = fragmentHtml;
      // run scripts inside that fragment (if any)
      executeScriptsFromNode(mainContentArea);
      // initialize components inside new content
      if (typeof initSlideshows === 'function') {
        // pass a root node so initSlideshows can scope queries
        initSlideshows(mainContentArea);
      }
      return true;
    } catch (err) {
      console.error('Error loading page content:', err);
      // Provide accessible error message
      if (mainContentArea) {
        mainContentArea.innerHTML = `<div role="alert" aria-live="assertive"><p style="color:red;">Failed to load content. ${err.message}</p></div>`;
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

      // determine new subtitle and title
      const newSubTitleText = pageTitles[cleanHref] || activeLink.textContent.trim();

      // fade out area (if present)
      if (mainContentFadeArea) {
        // read computed transition and wait for that duration
        const fadeDuration = getTransitionDuration(mainContentFadeArea) || 280;
        mainContentFadeArea.style.opacity = 0;
        await new Promise((r) => setTimeout(r, fadeDuration));
      }

      // update nav active classes and aria
      navLinks.forEach((link) => {
        link.classList.remove('is-active');
        link.removeAttribute('aria-current');
      });
      activeLink.classList.add('is-active');
      activeLink.setAttribute('aria-current', 'page');

      // update URL
      if (pushState) {
        history.pushState({ path: cleanHref }, '', cleanHref);
      }

      // Update visible subtitle and title (title change for browser/tab)
      if (subTitleElement) subTitleElement.textContent = newSubTitleText;
      document.title = `${newSubTitleText} — elzalive`;

      // load main content (await)
      await loadPageContent(cleanHref);

      // after content injected, fade it back in
      if (mainContentFadeArea) {
        // allow a small timeout to ensure reflow
        requestAnimationFrame(() => {
          mainContentFadeArea.style.opacity = 1;
        });
      }

      // Accessibility: focus the main heading
      const heading = mainContentArea.querySelector('h1, h2, .page-title');
      if (heading) {
        heading.setAttribute('tabindex', '-1');
        heading.focus({ preventScroll: true });
      }
    } finally {
      isTransitioning = false;
    }
  }

  // popstate (back/forward) handling
  window.addEventListener('popstate', (event) => {
    const path = normalizePath(window.location.pathname);
    const active = findNavLinkByPath(path);
    if (active) {
      updatePageContent(active, false).catch((e) => console.error(e));
    } else {
      // fallback to loading the path directly
      loadPageContent(path);
    }
  });

  // click interception for nav links (single delegated handler)
  document.querySelector('nav').addEventListener('click', (ev) => {
    const a = ev.target.closest('a');
    if (!a || a.closest('nav') === null) return;
    const href = a.getAttribute('href') || a.href;
    // external links (different origin) should act normally
    if (new URL(href, window.location.origin).origin !== window.location.origin) return;
    // if link explicitly points to anchor on same page, allow default
    const pathname = normalizePath(href);
    ev.preventDefault();
    updatePageContent(a, true).catch((e) => console.error(e));
  });

  // initial load: pick matching nav link or default to /home
  const initialPath = normalizePath(window.location.pathname);
  const initialLink = findNavLinkByPath(initialPath) || findNavLinkByPath('/home') || navLinks[0];

  if (initialLink) {
    // no pushState on initial load
    updatePageContent(initialLink, false)
      .then(() => {
        if (mainContentFadeArea) mainContentFadeArea.style.opacity = 1;
      })
      .catch((e) => console.error(e)); // Improved, drop-in replacement for your SPA navigation logic.

    function parseDurationValue(value) {
      // Accepts strings like "0.3s" or "150ms" and returns ms as number
      value = (value || '').trim();
      if (!value) return 0;
      if (value.endsWith('ms')) return parseFloat(value);
      if (value.endsWith('s')) return parseFloat(value) * 1000;
      // fallback
      return parseFloat(value) || 0;
    }

    function getTransitionDuration(element) {
      if (!element) return 0;
      const style = window.getComputedStyle(element);
      const raw = style.transitionDuration || style.webkitTransitionDuration || '';
      // transition-duration can be comma-separated; use the longest duration
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
        // convert absolute -> pathname, remove trailing slash (except root)
        const u = new URL(href, window.location.origin);
        let p = u.pathname || '/';
        if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
        return p;
      } catch (e) {
        // fallback: assume it's already a pathname
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
    };

    document.addEventListener('DOMContentLoaded', () => {
      const navLinks = Array.from(document.querySelectorAll('nav a'));
      const subTitleElement =
        document.querySelector('h2.sub-title') || document.querySelector('p.sub-title');
      const mainContentArea = document.getElementById('main-content-area');
      const mainContentFadeArea =
        document.getElementById('main-content-fade-area') || subTitleElement;
      const loadingSpinner = document.getElementById('loading-spinner') || null; // make sure you have this in markup if you want a spinner
      let isTransitioning = false;

      function findNavLinkByPath(pathname) {
        // tolerant matching: compare normalized paths
        const norm = normalizePath(pathname);
        return navLinks.find((a) => normalizePath(a.getAttribute('href') || a.href) === norm);
      }

      async function extractFragmentFromHtml(html, selector = '#main-content-area') {
        // Parse response HTML and extract a fragment node, fallback to entire body innerHTML
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const fragmentRoot =
          doc.querySelector(selector) || doc.querySelector('.entry-content') || doc.body;
        // Return HTML string of fragment
        return fragmentRoot ? fragmentRoot.innerHTML : '';
      }

      function executeScriptsFromNode(container) {
        // re-run any inline scripts found in the fetched fragment or load external scripts
        const scripts = Array.from(container.querySelectorAll('script'));
        scripts.forEach((old) => {
          const script = document.createElement('script');
          if (old.src) {
            script.src = old.src;
            script.async = false; // preserve order
          } else {
            script.textContent = old.textContent;
          }
          // copy attributes if needed
          Array.from(old.attributes).forEach((attr) => {
            if (attr.name !== 'src') script.setAttribute(attr.name, attr.value);
          });
          old.parentNode.replaceChild(script, old);
        });
      }

      async function loadPageContent(path) {
        if (loadingSpinner) loadingSpinner.style.display = 'block';
        // Clear previous content only after fade-out to avoid flicker (your code cleared immediately)
        // Keep small guard: if no mainContentArea, bail
        if (!mainContentArea) return;

        try {
          const response = await fetch(path, { credentials: 'same-origin' });
          if (!response.ok) {
            throw new Error(`${response.status} ${response.statusText}`);
          }
          const html = await response.text();
          const fragmentHtml = await extractFragmentFromHtml(html, '#main-content-area');
          // Inject fragment
          mainContentArea.innerHTML = fragmentHtml;
          // run scripts inside that fragment (if any)
          executeScriptsFromNode(mainContentArea);
          // initialize components inside new content
          if (typeof initSlideshows === 'function') {
            // pass a root node so initSlideshows can scope queries
            initSlideshows(mainContentArea);
          }
          return true;
        } catch (err) {
          console.error('Error loading page content:', err);
          // Provide accessible error message
          if (mainContentArea) {
            mainContentArea.innerHTML = `<div role="alert" aria-live="assertive"><p style="color:red;">Failed to load content. ${err.message}</p></div>`;
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

          // determine new subtitle and title
          const newSubTitleText = pageTitles[cleanHref] || activeLink.textContent.trim();

          // fade out area (if present)
          if (mainContentFadeArea) {
            // read computed transition and wait for that duration
            const fadeDuration = getTransitionDuration(mainContentFadeArea) || 280;
            mainContentFadeArea.style.opacity = 0;
            await new Promise((r) => setTimeout(r, fadeDuration));
          }

          // update nav active classes and aria
          navLinks.forEach((link) => {
            link.classList.remove('is-active');
            link.removeAttribute('aria-current');
          });
          activeLink.classList.add('is-active');
          activeLink.setAttribute('aria-current', 'page');

          // update URL
          if (pushState) {
            history.pushState({ path: cleanHref }, '', cleanHref);
          }

          // Update visible subtitle and title (title change for browser/tab)
          if (subTitleElement) subTitleElement.textContent = newSubTitleText;
          document.title = `${newSubTitleText} — elzalive`;

          // load main content (await)
          await loadPageContent(cleanHref);

          // after content injected, fade it back in
          if (mainContentFadeArea) {
            // allow a small timeout to ensure reflow
            requestAnimationFrame(() => {
              mainContentFadeArea.style.opacity = 1;
            });
          }

          // Accessibility: focus the main heading
          const heading = mainContentArea.querySelector('h1, h2, .page-title');
          if (heading) {
            heading.setAttribute('tabindex', '-1');
            heading.focus({ preventScroll: true });
          }
        } finally {
          isTransitioning = false;
        }
      }

      // popstate (back/forward) handling
      window.addEventListener('popstate', (event) => {
        const path = normalizePath(window.location.pathname);
        const active = findNavLinkByPath(path);
        if (active) {
          updatePageContent(active, false).catch((e) => console.error(e));
        } else {
          // fallback to loading the path directly
          loadPageContent(path);
        }
      });

      // click interception for nav links (single delegated handler)
      document.querySelector('nav').addEventListener('click', (ev) => {
        const a = ev.target.closest('a');
        if (!a || a.closest('nav') === null) return;
        const href = a.getAttribute('href') || a.href;
        // external links (different origin) should act normally
        if (new URL(href, window.location.origin).origin !== window.location.origin) return;
        // if link explicitly points to anchor on same page, allow default
        const pathname = normalizePath(href);
        ev.preventDefault();
        updatePageContent(a, true).catch((e) => console.error(e));
      });

      // initial load: pick matching nav link or default to /home
      const initialPath = normalizePath(window.location.pathname);
      const initialLink =
        findNavLinkByPath(initialPath) || findNavLinkByPath('/home') || navLinks[0];

      if (initialLink) {
        // no pushState on initial load
        updatePageContent(initialLink, false)
          .then(() => {
            if (mainContentFadeArea) mainContentFadeArea.style.opacity = 1;
          })
          .catch((e) => console.error(e));
      } else {
        // last resort: fetch /home fragment
        loadPageContent('/home').then(() => {
          if (mainContentFadeArea) mainContentFadeArea.style.opacity = 1;
          const homeLink = findNavLinkByPath('/home');
          if (homeLink) {
            homeLink.classList.add('is-active');
            homeLink.setAttribute('aria-current', 'page');
          }
        });
      }
    });
  } else {
    // last resort: fetch /home fragment
    loadPageContent('/home').then(() => {
      if (mainContentFadeArea) mainContentFadeArea.style.opacity = 1;
      const homeLink = findNavLinkByPath('/home');
      if (homeLink) {
        homeLink.classList.add('is-active');
        homeLink.setAttribute('aria-current', 'page');
      }
    });
  }
});
