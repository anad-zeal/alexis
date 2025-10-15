// /assets/js/navigation.js
// Fixed to work with the actual page structure

// Shrink to 5vw when a.category is clicked
document.querySelectorAll('a.category').forEach((link) => {
  link.addEventListener('click', () => {
    alert('Category link clicked');
    pageTitle.style.fontSize = '1rem';
  });
});

// Reset to 10vw when a.landing-mnu is clicked
document.querySelectorAll('a.landing-mnu').forEach((link) => {
  link.addEventListener('click', () => {
    pageTitle.style.fontSize = '10vw';
  });
});

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
  '/artworks': 'Artworks',
  '/biography': 'Biography',
  '/contact': 'Contact Me',
  '/drips': 'Drip Series Paintings',
  '/encaustic': 'Encaustic Paintings',
  '/projects': 'Project Series Paintings',
  '/restoration': 'Restoration Projects',
  '/decorative': 'Decorative Painting',
  '/black-and-white': 'Black and White Paintings',
};

document.addEventListener('DOMContentLoaded', () => {
  const navLinks = Array.from(document.querySelectorAll('nav a'));
  const subTitleElement = document.querySelector('p.page-title');
  const dynamicPageWrapper = document.getElementById('dynamic-page-wrapper');
  const mainContentArea = document.getElementById('main-content-area');
  const loadingSpinner = document.getElementById('loading-spinner');
  let isTransitioning = false;

  // Function to handle clicking on a.category
  document.querySelectorAll('a.category').forEach(function (categoryLink) {
    categoryLink.addEventListener('click', function (event) {
      event.preventDefault(); // Prevent default link behavior if desired

      if (subTitleElement) {
        alert;
        subTitleElement.style.fontSize = '5vw';
      }
    });
  });

  // Function to handle clicking on a.landing-mnu
  document.querySelectorAll('a.landing-mnu').forEach(function (landingMenuLink) {
    landingMenuLink.addEventListener('click', function (event) {
      event.preventDefault(); // Prevent default link behavior if desired

      if (subTitleElement) {
        // Ensure the element exists
        // Check if the current font-size is 5vw (or close to it due to browser rendering)
        // We'll check the computed style to be safe, though direct style setting is usually reliable.
        // For simplicity, let's assume we're checking the inline style we set.
        if (subTitleElement.style.fontSize === '5vw') {
          subTitleElement.style.fontSize = '10vw'; // Revert to 10vw
        }
        // If it's not 5vw, we don't do anything as per your requirement
      }
    });
  });

  //
  // DEBUG: Verify elements exist
  console.log('Elements found:');
  console.log('- mainContentArea:', mainContentArea);
  console.log('- subTitleElement:', subTitleElement);
  console.log('- dynamicPageWrapper:', dynamicPageWrapper);
  console.log('- loadingSpinner:', loadingSpinner);

  // Add default transitions if not defined in CSS.
  if (mainContentArea && !getTransitionDuration(mainContentArea)) {
    mainContentArea.style.transition = `opacity 280ms ease-in-out`;
  }
  if (subTitleElement && !getTransitionDuration(subTitleElement)) {
    subTitleElement.style.transition = `opacity 280ms ease-in-out`;
  }

  function findNavLinkByPath(pathname) {
    const norm = normalizePath(pathname);
    return navLinks.find((a) => normalizePath(a.getAttribute('href') || a.href) === norm);
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

  async function loadPageContent(path, targetElement) {
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

      // DEBUG: Log what we received
      console.log('Fetched HTML length:', html.length);
      console.log('First 500 chars:', html.substring(0, 500));
      console.log('Target element:', targetElement);
      console.log('Target element opacity BEFORE:', window.getComputedStyle(targetElement).opacity);
      console.log('Target element display BEFORE:', window.getComputedStyle(targetElement).display);

      // The response should be just the page content fragment
      // Insert it directly into the target element
      targetElement.innerHTML = html;

      // DEBUG: Check if content was inserted
      console.log('Content after insert:', targetElement.innerHTML.substring(0, 200));
      console.log('Target element opacity AFTER:', window.getComputedStyle(targetElement).opacity);
      console.log('Target element display AFTER:', window.getComputedStyle(targetElement).display);

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

      // Fade out the content area
      if (mainContentArea) {
        const fadeDuration = getTransitionDuration(mainContentArea);
        mainContentArea.style.opacity = 0;
        if (subTitleElement) subTitleElement.style.opacity = 0;
        await new Promise((r) => setTimeout(r, fadeDuration + 50));
      }

      // Update navigation active state
      navLinks.forEach((link) => {
        link.classList.remove('is-active');
        link.removeAttribute('aria-current');
      });
      activeLink.classList.add('is-active');
      activeLink.setAttribute('aria-current', 'page');

      if (pushState) {
        history.pushState({ path: cleanHref }, '', cleanHref);
      }

      // Update page title
      const newPageTitle = pageTitles[pageKey] || activeLink.textContent.trim();
      if (subTitleElement) subTitleElement.textContent = newPageTitle;
      document.title = `${newPageTitle} | aepaints`;

      // Update data-page attribute
      if (dynamicPageWrapper) {
        dynamicPageWrapper.setAttribute('data-page', pageKey.replace('/', ''));
      }

      // Load new content into main-content-area
      await loadPageContent(cleanHref, mainContentArea);

      console.log(
        'After loadPageContent, mainContentArea opacity:',
        window.getComputedStyle(mainContentArea).opacity
      );

      // Fade in the content area
      if (mainContentArea) {
        console.log('About to fade in mainContentArea');
        requestAnimationFrame(() => {
          mainContentArea.style.opacity = 1;
          console.log(
            'Set opacity to 1, computed:',
            window.getComputedStyle(mainContentArea).opacity
          );
        });
      }
      if (subTitleElement) {
        requestAnimationFrame(() => {
          subTitleElement.style.opacity = 1;
        });
      }

      // Focus management
      requestAnimationFrame(() => {
        const heading = mainContentArea.querySelector(
          'h1, h2, .page-title, .page-content-wrapper h2'
        );
        if (heading) {
          heading.setAttribute('tabindex', '-1');
          heading.focus({ preventScroll: true });
        } else {
          mainContentArea?.focus({ preventScroll: true });
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
      loadPageContent(path, mainContentArea).catch((e) =>
        console.error('Popstate load content error:', e)
      );
      if (mainContentArea) mainContentArea.style.opacity = 1;
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
  }

  // For initial content, ensure visibility and execute scripts
  if (mainContentArea) mainContentArea.style.opacity = 1;
  if (subTitleElement) subTitleElement.style.opacity = 1;
  if (mainContentArea) {
    executeScriptsFromNode(mainContentArea);
    window.dispatchEvent(
      new CustomEvent('app:navigate', {
        detail: { targetElement: mainContentArea, path: initialPath },
      })
    );
  }
});
