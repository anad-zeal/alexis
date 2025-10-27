document.addEventListener('DOMContentLoaded', () => {
  // ==============================
  // Configuration
  // ==============================
  const JSON_BASE_PATH = 'json-files'; // Relative to index.php
  const DEFAULT_PAGE = 'home';
  // Base path for artwork images (assuming subfolders like /black-and-white-paintings/)
  const ARTWORK_IMAGES_BASE_URL = 'assets/images/artwork-files/';
  // Base path for decorative painting images
  const DECORATIVE_IMAGES_BASE_URL = 'assets/images/decorative-painting/';
  // Base path for restoration project images
  const RESTORATION_IMAGES_BASE_URL = 'assets/images/restoration-projects/';

  // ==============================
  // Cached Elements
  // ==============================
  const menuLinks = document.querySelectorAll('.landing-mnu');
  const contentArea = document.getElementById('page-content');

  if (!menuLinks.length || !contentArea) {
    console.error('Menu links or content area not found.');
    contentArea.innerHTML =
      '<p class="error">Critical elements (menu or content area) not found. Dynamic content will not load.</p>';
    return;
  }

  // ==============================
  // State
  // ==============================
  let currentFetch = null; // To handle aborting previous fetches

  // ==============================
  // Core Functions
  // ==============================

  /**
   * Loads JSON data from a specified file path.
   * @param {string} filePath - The path to the JSON file.
   * @returns {Promise<Object|null>} - The parsed JSON data or null on error.
   */
  async function loadJson(filePath) {
    if (currentFetch) currentFetch.abort?.(); // Abort previous fetch if ongoing
    currentFetch = new AbortController();

    try {
      const response = await fetch(filePath, { signal: currentFetch.signal });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status} for ${filePath}`);
      }
      return await response.json();
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Fetch aborted for:', filePath);
      } else {
        console.error('Error loading JSON:', error);
        contentArea.innerHTML = `<p class="error">Failed to load content: ${error.message}. Please check console for details.</p>`;
      }
      return null;
    } finally {
      currentFetch = null;
    }
  }

  /**
   * Loads and renders the content for a given page identifier.
   * @param {string} pageId - The identifier for the page (e.g., 'home', 'artworks').
   */
  async function loadPage(pageId) {
    if (!pageId) pageId = DEFAULT_PAGE;

    contentArea.innerHTML = '<p class="loading">Loading…</p>';

    // Load data common to all pages (if needed) or handle specific page types
    const pageJsonPath = `${JSON_BASE_PATH}/${pageId.replace(
      /^(drip-series|encaustic|black-and-white|project-series)$/,
      '$1-paintings'
    )}.json`; // Handle specific artwork category filenames

    const pageData = await loadJson(pageJsonPath);

    if (!pageData) {
      contentArea.innerHTML = `<p class="error">Content for "${pageId}" not found or failed to load.</p>`;
      return;
    }

    // --- Special handling based on JSON structure/pageId ---
    if (pageId === DEFAULT_PAGE && pageData.pageContent?.[0]?.type === 'landingMenu') {
      renderLandingMenu(pageData.pageContent[0].items);
    } else if (pageId === 'artworks' && pageData.artworkCategories) {
      renderArtworkCategories(pageData.artworkCategories);
    } else if (
      (pageId === 'decorative' || pageJsonPath.includes('decorative-painting.json')) &&
      pageData.pageContent?.[0]?.type === 'slideshow'
    ) {
      renderDecorativeSlideshow(pageData.pageContent[0]);
    } else if (
      (pageId === 'restoration' || pageJsonPath.includes('restoration-projects.json')) &&
      pageData.pageContent?.[0]?.type === 'restorationProjects'
    ) {
      renderRestorationProjects(pageData.pageContent[0]);
    } else if (pageData.artworks && !pageData.artworkCategories) {
      // This means we've loaded a specific artwork category JSON directly
      renderArtworksInGallery(pageId, pageData);
    } else if (pageData.pageContent) {
      // Standard pages like biography, contact, etc.
      renderStandardContent(pageData.pageContent);
    } else if (Array.isArray(pageData)) {
      console.warn(
        `JSON for ${pageId} is a direct array, consider wrapping in { "pageContent": [...] }`
      );
      renderStandardContent(pageData);
    } else {
      contentArea.innerHTML = '<p class="error">Invalid page data or content not found.</p>';
      return;
    }

    updateActiveLink(pageId);
  }

  /**
   * Renders standard content blocks (heading, paragraph, generic contentBlock).
   * @param {Array<Object>} contentArray - An array of content objects.
   */
  function renderStandardContent(contentArray) {
    if (!Array.isArray(contentArray)) {
      contentArea.innerHTML = '<p class="error">Invalid content structure for standard page.</p>';
      return;
    }

    contentArea.innerHTML = ''; // Clear previous content

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

        case 'contentBlock': // For generic blocks with title + description
          el = document.createElement('div');
          el.className = 'content-block'; // Add a class for styling

          if (item.title) {
            const strong = document.createElement('strong');
            strong.textContent = item.title;
            el.appendChild(strong);
          }
          if (item.description) {
            const desc = document.createElement('p');
            desc.textContent = item.description;
            el.appendChild(desc);
          }
          break;

        default:
          console.warn('Unknown content item type:', item.type, item);
          return;
      }

      if (el) contentArea.appendChild(el);
    });
  }

  /**
   * Renders the specific landing page menu grid from home.json.
   * @param {Array<Object>} menuItems - Array of menu item objects for the landing grid.
   */
  function renderLandingMenu(menuItems) {
    contentArea.innerHTML = '';

    const landingMenuDiv = document.createElement('div');
    landingMenuDiv.className = 'landing-menu';

    menuItems.forEach((item) => {
      const itemDiv = document.createElement('div');
      itemDiv.className = `landing-menu-item ${item.id}`;

      const link = document.createElement('a');
      link.href = item.href || '#';
      link.className = 'category';

      // Crucial: Attach data-page to allow handling by handleInternalLandingLinkClick
      if (item.data_page) {
        link.dataset.page = item.data_page;
        link.addEventListener('click', handleInternalLandingLinkClick);
      } else {
        // Fallback for items that aren't meant to trigger a loadPage but might have href
        // For the landing image, if it's not a link, remove the href or handle differently
        if (item.id === 'landing-image' && !item.data_page) {
          link.removeAttribute('href'); // Make it not a clickable link if no page is defined
        }
      }

      if (item.data_gallery) link.setAttribute('data-gallery', item.data_gallery);
      if (item.aria_label) link.setAttribute('aria-label', item.aria_label);

      if (item.type === 'imageLink') {
        const img = document.createElement('img');
        img.src = item.image_src || '';
        img.alt = item.image_alt || '';
        if (item.image_height) img.height = item.image_height;
        link.appendChild(img);
      } else {
        link.textContent = item.title || '';
      }
      itemDiv.appendChild(link);

      const descriptionP = document.createElement('p');
      descriptionP.textContent = item.description || '';
      itemDiv.appendChild(descriptionP);

      landingMenuDiv.appendChild(itemDiv);
    });

    contentArea.appendChild(landingMenuDiv);
  }

  /**
   * Renders the menu of artwork categories from artworks.json.
   * @param {Array<Object>} categories - Array of artwork category objects.
   */
  function renderArtworkCategories(categories) {
    contentArea.innerHTML = '';

    const artworksSection = document.createElement('div');
    artworksSection.className = 'gallery-menu';

    const heading = document.createElement('h2');
    heading.textContent = 'Browse Our Artworks';
    artworksSection.appendChild(heading);

    categories.forEach((category) => {
      const categoryDiv = document.createElement('div');
      categoryDiv.className = `${category.id} artwork-category-item`;

      const link = document.createElement('a');
      link.href = '#';
      link.className = 'category-link';
      link.setAttribute('data-category-id', category.id);
      link.setAttribute('data-content-file', category.contentFile);
      link.setAttribute('aria-label', category.ariaLabel || `Go to ${category.title} gallery`);
      link.textContent = category.title;

      const descriptionP = document.createElement('p');
      descriptionP.textContent = category.description;

      categoryDiv.appendChild(link);
      categoryDiv.appendChild(descriptionP);
      artworksSection.appendChild(categoryDiv);
    });

    contentArea.appendChild(artworksSection);

    artworksSection.querySelectorAll('.category-link').forEach((link) => {
      link.addEventListener('click', handleArtworkCategoryClick);
    });
  }

  /**
   * Handles click event for individual artwork category links.
   * Loads specific artwork content for that category.
   * @param {Event} event - The click event.
   */
  async function handleArtworkCategoryClick(event) {
    event.preventDefault();

    const link = event.currentTarget;
    const categoryId = link.getAttribute('data-category-id');
    const contentFile = link.getAttribute('data-content-file');
    const filePath = `${JSON_BASE_PATH}/${contentFile}`;

    contentArea.innerHTML = '<p class="loading">Loading artworks in this category…</p>';

    const categoryData = await loadJson(filePath);

    if (categoryData && categoryData.artworks) {
      renderArtworksInGallery(categoryId, categoryData);
      // Update URL for specific category without changing main menu active state
      history.pushState({ page: categoryId }, '', `/${categoryId}`);
      updateActiveLink(categoryId); // Mark the main 'artworks' menu item as active
    } else {
      contentArea.innerHTML = `<p class="error">Failed to load artworks for ${categoryId}.</p>`;
    }
  }

  /**
   * Renders the detailed list of artworks within a specific category.
   * @param {string} categoryId - The ID of the current category.
   * @param {Object} categoryData - The parsed JSON data for the category (e.g., black-and-white-paintings.json).
   */
  function renderArtworksInGallery(categoryId, categoryData) {
    const imageBasePath =
      categoryData.metadata && categoryData.metadata.basePath
        ? categoryData.metadata.basePath
        : `${ARTWORK_IMAGES_BASE_URL}${categoryId}/`;

    let html = `
      <div class="category-detail">
        <h2 id="current-category-title">${categoryData.categoryTitle || 'Artworks'}</h2>
        <p>${categoryData.categoryDescription || ''}</p>
        <button class="back-to-categories">Back to Categories</button>
        <div class="artwork-grid">
    `;

    if (categoryData.artworks && categoryData.artworks.length > 0) {
      categoryData.artworks.forEach((artwork) => {
        const fullImagePath = imageBasePath + artwork.filename;
        const thumbnailPath = artwork.thumbFilename
          ? imageBasePath + artwork.thumbFilename
          : fullImagePath;

        html += `
          <div class="artwork-item" id="artwork-${artwork.id}">
            <img src="${thumbnailPath}" alt="${artwork.title}" loading="lazy">
            <h3>${artwork.title}</h3>
            <p>${artwork.description || ''}</p>
            ${artwork.year ? `<p><strong>Year:</strong> ${artwork.year}</p>` : ''}
            ${artwork.medium ? `<p><strong>Medium:</strong> ${artwork.medium}</p>` : ''}
            ${artwork.dimensions ? `<p><strong>Dimensions:</strong> ${artwork.dimensions}</p>` : ''}
            <button class="view-artwork-detail" data-artwork-id="${
              artwork.id
            }" data-full-image="${fullImagePath}">View Details</button>
          </div>
        `;
      });
    } else {
      html += `<p>No artworks found for this category yet.</p>`;
    }

    html += `</div></div>`;
    contentArea.innerHTML = html;

    contentArea.querySelector('.back-to-categories').addEventListener('click', () => {
      history.pushState({ page: 'artworks' }, '', '/artworks'); // Update URL
      loadPage('artworks');
    });

    contentArea.querySelectorAll('.view-artwork-detail').forEach((button) => {
      button.addEventListener('click', (e) => {
        const fullImage = e.target.getAttribute('data-full-image');
        alert(`Showing full image: ${fullImage}`);
        // Implement a modal/lightbox here
      });
    });
  }

  /**
   * Renders the decorative painting slideshow from decorative-painting.json.
   * @param {Object} decorativeContentBlock - The content block object for decorative painting (from pageContent).
   */
  function renderDecorativeSlideshow(decorativeContentBlock) {
    const imageBasePath = DECORATIVE_IMAGES_BASE_URL;

    let slideshowHtml = `
        <div class="slideshow-section">
            <h2>${decorativeContentBlock.title || 'Decorative Painting'}</h2>
            <p>${decorativeContentBlock.description || ''}</p>
            <div class="slideshow" data-category="decorative">
                <div data-role="stage">
    `;

    if (decorativeContentBlock.images && decorativeContentBlock.images.length > 0) {
      decorativeContentBlock.images.forEach((image, index) => {
        const imageSrc = imageBasePath + image.filename;
        slideshowHtml += `
                <img src="${imageSrc}"
                     alt="${image.title}"
                     style="display: ${index === 0 ? 'block' : 'none'};"
                     data-index="${index}">
            `;
      });
    } else {
      slideshowHtml += `<p>No decorative images found.</p>`;
    }

    slideshowHtml += `
                </div>
                <div class="slideshow-nav">
                  <button class="slideshow-prev">Previous</button>
                  <button class="slideshow-next">Next</button>
                </div>
            </div>
        </div>
    `;
    contentArea.innerHTML = slideshowHtml;

    // --- Slideshow Logic ---
    const slideshowContainer = contentArea.querySelector('.slideshow');
    if (slideshowContainer) {
      const images = slideshowContainer.querySelectorAll('img');
      const prevButton = slideshowContainer.querySelector('.slideshow-prev');
      const nextButton = slideshowContainer.querySelector('.slideshow-next');
      let currentIndex = 0;

      function showImage(index) {
        images.forEach((img, i) => {
          img.style.display = i === index ? 'block' : 'none';
        });
      }

      if (images.length > 0) {
        prevButton.addEventListener('click', () => {
          currentIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
          showImage(currentIndex);
        });

        nextButton.addEventListener('click', () => {
          currentIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
          showImage(currentIndex);
        });

        showImage(currentIndex);
      } else {
        prevButton.style.display = 'none';
        nextButton.style.display = 'none';
      }
    }
  }

  /**
   * Renders restoration projects from restoration-projects.json.
   * Assumes a similar structure to artwork galleries for now, but can be customized.
   * @param {Object} restorationContentBlock - The content block object for restoration projects.
   */
  function renderRestorationProjects(restorationContentBlock) {
    const imageBasePath = RESTORATION_IMAGES_BASE_URL; // Use a dedicated base URL

    let html = `
      <div class="restoration-section">
        <h2>${restorationContentBlock.title || 'Restoration Projects'}</h2>
        <p>${restorationContentBlock.description || ''}</p>
        <div class="restoration-grid">
    `;

    if (restorationContentBlock.projects && restorationContentBlock.projects.length > 0) {
      restorationContentBlock.projects.forEach((project) => {
        const fullImagePath = imageBasePath + project.filename;
        const thumbnailPath = project.thumbFilename
          ? imageBasePath + project.thumbFilename
          : fullImagePath;

        html += `
          <div class="restoration-item" id="project-${project.id}">
            <img src="${thumbnailPath}" alt="${project.title}" loading="lazy">
            <h3>${project.title}</h3>
            <p>${project.description || ''}</p>
            ${project.year ? `<p><strong>Year:</strong> ${project.year}</p>` : ''}
            ${project.medium ? `<p><strong>Medium:</strong> ${project.medium}</p>` : ''}
            <button class="view-project-detail" data-project-id="${
              project.id
            }" data-full-image="${fullImagePath}">View Details</button>
          </div>
        `;
      });
    } else {
      html += `<p>No restoration projects found yet.</p>`;
    }

    html += `</div></div>`;
    contentArea.innerHTML = html;

    // Attach event listeners for "View Details" buttons
    contentArea.querySelectorAll('.view-project-detail').forEach((button) => {
      button.addEventListener('click', (e) => {
        const fullImage = e.target.getAttribute('data-full-image');
        alert(`Showing full image: ${fullImage}`);
        // In a real application, you'd open a modal/lightbox here
      });
    });
  }

  /**
   * Updates the 'is-active' class on main menu links.
   * @param {string} activePage - The data-page attribute value of the currently active link.
   */
  function updateActiveLink(activePage) {
    menuLinks.forEach((link) => {
      const linkPage = link.dataset.page;

      // Check if the current active page is a main navigation item or a sub-page
      const isArtworkSubpage = [
        'drip-series-paintings',
        'encaustic-paintings',
        'black-and-white-paintings',
        'project-series-paintings',
      ].includes(activePage);

      if (
        activePage === linkPage || // Direct match (home, biography, contact, decorative, restoration)
        (linkPage === 'artworks' && isArtworkSubpage) // 'artworks' menu item should be active for any artwork subpage
      ) {
        link.classList.add('is-active');
      } else {
        link.classList.remove('is-active');
      }
    });
  }

  // ==============================
  // Event Handlers
  // ==============================

  // Handle clicks on main menu links
  menuLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();

      const page = link.dataset.page;
      if (!page) return;

      history.pushState({ page }, '', link.getAttribute('href'));
      loadPage(page);
    });
  });

  // Handle clicks on internal links within the landing menu (home page)
  function handleInternalLandingLinkClick(event) {
    event.preventDefault();
    const link = event.currentTarget;
    const page = link.dataset.page;
    if (page) {
      history.pushState({ page }, '', link.getAttribute('href'));
      loadPage(page);
    }
  }

  // Handle browser back/forward buttons
  window.addEventListener('popstate', (event) => {
    const page = event.state?.page || getPageFromURL();
    loadPage(page);
  });

  // ==============================
  // Utilities
  // ==============================

  /**
   * Extracts the page identifier from the current URL path.
   * @returns {string} The page identifier or DEFAULT_PAGE.
   */
  function getPageFromURL() {
    const path = window.location.pathname;
    const segments = path.split('/').filter((s) => s !== '' && !s.endsWith('.php'));
    // Map specific category URLs back to their JSON filenames if needed
    const pageName = segments.length > 0 ? segments[segments.length - 1] : DEFAULT_PAGE;

    // Special handling for artwork category URLs (e.g., /drip-series should load drip-series-paintings.json)
    if (
      ['drip-series', 'encaustic', 'black-and-white', 'project-series'].includes(pageName) &&
      !pageName.endsWith('-paintings')
    ) {
      return `${pageName}-paintings`;
    }
    return pageName || DEFAULT_PAGE;
  }

  // ==============================
  // Initialize
  // ==============================
  const initialPage = getPageFromURL();
  loadPage(initialPage);
});

// Function to recursively build HTML elements from JSON
function buildElementFromJson(jsonElement) {
  if (!jsonElement || !jsonElement.type) {
    console.error('Invalid JSON element:', jsonElement);
    return null;
  }

  const el = document.createElement(jsonElement.type);

  // Set attributes (class, href, data attributes, aria-label, src, height)
  if (jsonElement.class) el.className = jsonElement.class;
  if (jsonElement.id) el.id = jsonElement.id;
  if (jsonElement.href) el.href = jsonElement.href;
  if (jsonElement.src) el.src = jsonElement.src;
  if (jsonElement.height) el.height = jsonElement.height;

  for (const key in jsonElement) {
    if (key.startsWith('data-')) {
      el.setAttribute(key, jsonElement[key]);
    }
    if (key.startsWith('aria-')) {
      el.setAttribute(key, jsonElement[key]);
    }
  }

  // Set text content
  if (jsonElement.content) {
    el.textContent = jsonElement.content;
  }

  // Handle children
  if (jsonElement.children && Array.isArray(jsonElement.children)) {
    jsonElement.children.forEach((childJson) => {
      const childEl = buildElementFromJson(childJson);
      if (childEl) {
        el.appendChild(childEl);
      }
    });
  }

  return el;
}

// New function to render the complex home page structure
function renderHomePageLayout(pageContentJson) {
  contentArea.innerHTML = ''; // Clear existing content

  // Expecting pageContentJson to be an array containing the single page-menu-wrapper object
  if (!Array.isArray(pageContentJson) || pageContentJson.length === 0) {
    contentArea.innerHTML = '<p class="error">Home page content structure is invalid.</p>';
    return;
  }

  pageContentJson.forEach((rootElementJson) => {
    const renderedElement = buildElementFromJson(rootElementJson);
    if (renderedElement) {
      contentArea.appendChild(renderedElement);
    }
  });

  // Re-attach event listeners if necessary for dynamically added elements
  // For example, if categories within the home page need dynamic loading like artworks
  contentArea.querySelectorAll('.category[data-gallery]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const gallery = link.getAttribute('data-gallery');
      // This is a placeholder; you'd need to define how these links should behave
      // e.g., load a specific artwork category page
      console.log(`Clicked on category link: ${gallery}`);
      // Example: loadPage(gallery); // If 'decorative_painting' is a valid pageId
    });
  });
}
