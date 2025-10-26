document.addEventListener('DOMContentLoaded', () => {
  // ==============================
  // Configuration
  // ==============================
  const BASE_PATH = '../json-files';
  const DEFAULT_PAGE = 'home';

  // ==============================
  // Cached Elements
  // ==============================
  const menuLinks = document.querySelectorAll('.landing-mnu');
  const contentArea = document.getElementById('page-content');

  if (!menuLinks.length || !contentArea) {
    console.error('Menu links or content area not found.');
    return;
  }

  // ==============================
  // State
  // ==============================
  let currentFetch = null;

  // ==============================
  // Core Functions
  // ==============================
  async function loadPage(page) {
    if (!page) page = DEFAULT_PAGE;

    // Cancel any ongoing request (if browser supports AbortController)
    if (currentFetch) currentFetch.abort?.();
    currentFetch = new AbortController();

    // Show loading indicator
    contentArea.innerHTML = '<p class="loading">Loading…</p>';

    try {
      const response = await fetch(`${BASE_PATH}/${page}.json`, { signal: currentFetch.signal });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      const data = await response.json();

      renderContent(data.pageContent);
      updateActiveLink(page);
    } catch (error) {
      if (error.name !== 'AbortError') {
        contentArea.innerHTML = `<p class="error">Error loading page: ${error.message}</p>`;
      }
    }
  }

  function renderContent(contentArray) {
    if (!Array.isArray(contentArray)) {
      contentArea.innerHTML = '<p>Invalid page data.</p>';
      return;
    }

    contentArea.innerHTML = '';

    contentArray.forEach((item) => {
      let el;

      switch (item.type) {
        case 'heading':
          el = document.createElement('h2');
          el.textContent = item.text || '';
          break;

        case 'paragraph':
          el = document.createElement('p');
          el.textContent = item.text || '';
          break;

        default:
          // Fallback for custom blocks with title + description
          if (item.title || item.description) {
            el = document.createElement('div');

            const strong = document.createElement('strong');
            strong.textContent = item.title || '';

            const desc = document.createElement('p');
            desc.textContent = item.description || '';

            el.appendChild(strong);
            el.appendChild(desc);
          } else {
            console.warn('Unknown content item:', item);
          }
      }

      if (el) contentArea.appendChild(el);
    });
  }

  function updateActiveLink(activePage) {
    menuLinks.forEach((link) => {
      link.classList.toggle('is-active', link.dataset.page === activePage);
    });
  }

  // ==============================
  // Event Handlers
  // ==============================
  menuLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();

      const page = link.dataset.page;
      if (!page) return;

      // Update URL and load content
      history.pushState({ page }, '', link.getAttribute('href'));
      loadPage(page);
    });
  });

  window.addEventListener('popstate', (event) => {
    const page = event.state?.page || getPageFromURL() || DEFAULT_PAGE;
    loadPage(page);
  });

  // ==============================
  // Utilities
  // ==============================
  function getPageFromURL() {
    const path = location.pathname.split('/').pop();
    const name = path.replace('.html', '').replace(/\/$/, '');
    return name || DEFAULT_PAGE;
  }

  // ==============================
  // Initialize
  // ==============================
  const initialPage = getPageFromURL();
  loadPage(initialPage);
});
