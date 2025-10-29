document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelectorAll('.main-nav-menu .landing-mnu');
  // Target the specific area where dynamic content should be loaded
  const dynamicContentArea = document.getElementById('dynamic-content-area');
  const dynamicPageWrapper = document.getElementById('dynamic-page-wrapper'); // <--- ADDED THIS LINE
  const pageTitleElement = document.querySelector('.hero .page-title');

  /**
   * Renders the fetched JSON data into the dynamic content area.
   * @param {object} data - The parsed JSON object.
   * @param {string} pageName - The slug of the current page (e.g., 'home', 'artworks').
   */
  function renderPageContent(data, pageName) {
    if (data.title) {
      document.title = `${data.title} | AEPaints`;
      if (pageTitleElement) {
        pageTitleElement.textContent = data.title;
      }
    } else {
      document.title = `${pageName.charAt(0).toUpperCase() + pageName.slice(1)} | AEPaints`;
      if (pageTitleElement) {
        pageTitleElement.textContent = pageName.charAt(0).toUpperCase() + pageName.slice(1);
      }
    }

    if (data.contentHtml) {
      dynamicContentArea.innerHTML = data.contentHtml;
    } else {
      dynamicContentArea.innerHTML = `<p>No content available for "${data.title || pageName}".</p>`;
    }

    dynamicContentArea.focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Loads and displays JSON content for a given page.
   * @param {string} pageName - The slug of the page to load.
   * @param {boolean} [addToHistory=true] - Whether to add the new state to the browser history.
   */
  async function loadJsonContent(pageName, addToHistory = true) {
    const jsonFileName = `${pageName}.json`;
    const url = `/json-files/${jsonFileName}`;

    dynamicContentArea.innerHTML = '<p>Loading content...</p>';
    if (pageTitleElement) {
      pageTitleElement.textContent = '';
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} for ${url}`);
      }
      const data = await response.json();

      renderPageContent(data, pageName);

      // Update active state of navigation links
      navLinks.forEach((link) => link.classList.remove('is-active'));
      const activeLink = document.querySelector(`.main-nav-menu a[data-page="${pageName}"]`);
      if (activeLink) {
        activeLink.classList.add('is-active');
        activeLink.setAttribute('aria-current', 'page');
      }
      navLinks.forEach((link) => {
        if (link !== activeLink) {
          link.removeAttribute('aria-current');
        }
      });

      // --- IMPORTANT FIX: Update data-page attribute on dynamic-page-wrapper ---
      if (dynamicPageWrapper) {
        dynamicPageWrapper.dataset.page = pageName; // <--- ADDED THIS LINE
      }
      // --- END IMPORTANT FIX ---

      if (addToHistory) {
        history.pushState(
          { page: pageName, title: data.title || pageName },
          data.title || pageName,
          `/${pageName}`
        );
      }
    } catch (error) {
      console.error(`Error loading JSON file for ${pageName}:`, error);
      dynamicContentArea.innerHTML = `<p>Error loading content for "${pageName}". Please try again.</p>`;
      document.title = `Error | AEPaints`;
      if (pageTitleElement) {
        pageTitleElement.textContent = `Error Loading Page`;
      }
    }
  }

  // Add event listeners to navigation links
  navLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const pageName = event.target.dataset.page;
      if (pageName) {
        loadJsonContent(pageName);
      }
    });
  });

  // History API: Handle browser back/forward button clicks
  window.addEventListener('popstate', (event) => {
    const statePage = event.state
      ? event.state.page
      : window.location.pathname.substring(1) || 'home';
    if (statePage) {
      loadJsonContent(statePage, false);
    }
  });

  // Handle initial page load based on current URL path or a default
  const initialPath = window.location.pathname.substring(1);
  const initialPage = initialPath || 'home';

  loadJsonContent(initialPage, false).then(() => {
    const currentTitle = document.title;
    history.replaceState(
      { page: initialPage, title: currentTitle },
      currentTitle,
      `/${initialPage}`
    );

    // Update active class for initial load
    navLinks.forEach((link) => link.classList.remove('is-active'));
    const activeLink = document.querySelector(`.main-nav-menu a[data-page="${initialPage}"]`);
    if (activeLink) {
      activeLink.classList.add('is-active');
      activeLink.setAttribute('aria-current', 'page');
    }
    navLinks.forEach((link) => {
      if (link !== activeLink) {
        link.removeAttribute('aria-current');
      }
    });

    // --- IMPORTANT FIX: Update data-page attribute on dynamic-page-wrapper for initial load ---
    if (dynamicPageWrapper) {
      dynamicPageWrapper.dataset.page = initialPage; // <--- ADDED THIS LINE
    }
    // --- END IMPORTANT FIX ---
  });
});
