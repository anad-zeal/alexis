// /assets/js/navigation.js
// Fixed to work with the actual page structure

// Declare subTitleElement at a higher scope so all functions can access it
let subTitleElement; // Use 'let' because it will be assigned later in DOMContentLoaded

// --- Start of existing helper functions (loadingSpinner references removed) ---
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
// --- End of existing helper functions ---

document.addEventListener('DOMContentLoaded', () => {
  // Assign subTitleElement here, within DOMContentLoaded.
  // CRITICAL DEBUG: Log its value immediately after attempting to find it.
  subTitleElement = document.querySelector('p.page-title');
  console.log('DOMContentLoaded: subTitleElement found:', subTitleElement);

  const navLinks = Array.from(document.querySelectorAll('nav a'));
  const dynamicPageWrapper = document.getElementById('dynamic-page-wrapper');
  const mainContentArea = document.getElementById('main-content-area');
  // Removed: const loadingSpinner = document.getElementById('loading-spinner');
  let isTransitioning = false;

  // --- Event listeners for font size changes ---
  // Function to handle clicking on a.category
  document.querySelectorAll('.category').forEach(function (categoryLink) {
    categoryLink.addEventListener('click', function (event) {
      //event.preventDefault(); // Prevent default link behavior if desired

      // CRITICAL DEBUG: Log subTitleElement here as well
      console.log('Category link clicked. subTitleElement:', subTitleElement);
      if (subTitleElement) {
        subTitleElement.style.fontSize = '5vw';
      } else {
        console.warn('Category link clicked, but p.page-title (subTitleElement) not found.');
      }
    });
  });

  // Function to handle clicking on a.landing-mnu
  document.querySelectorAll('.landing-mnu').forEach(function (landingMenuLink) {
    landingMenuLink.addEventListener('click', function (event) {
      //event.preventDefault(); // Prevent default link behavior if desired

      // CRITICAL DEBUG: Log subTitleElement here as well
      console.log('Landing menu link clicked. subTitleElement:', subTitleElement);
      if (subTitleElement) {
        const currentFontSize = subTitleElement.style.fontSize;
        console.log('Landing menu link clicked. Current font-size:', currentFontSize);

        if (currentFontSize === '5vw') {
          subTitleElement.style.fontSize = '10vw'; // Revert to 10vw
        } else {
          console.log('Font-size is not 5vw, no change.');
        }
      } else {
        console.warn('Landing menu link clicked, but p.page-title (subTitleElement) not found.');
      }
    });
  });
  // --- End of event listeners for font size changes ---

  // DEBUG: Verify elements exist
  console.log('1 Elements found (post init):');
  console.log(' 2 - mainContentArea:', mainContentArea);
  console.log(' 3- subTitleElement (global, post init):', subTitleElement);
  console.log('4- dynamicPageWrapper:', dynamicPageWrapper);
  // Removed: console.log('- loadingSpinner:', loadingSpinner);

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
    // Removed: if (loadingSpinner) loadingSpinner.style.display = 'block';
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
      // Removed: if (loadingSpinner) loadingSpinner.style.display = 'none';
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
