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
    // Cancel any ongoing request before starting a new one
    if (currentFetch) currentFetch.abort?.();
    currentFetch = new AbortController();

    try {
      const response = await fetch(filePath, { signal: currentFetch.signal });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status} for ${filePath}`);
      }
      return await response.json();
    } catch (error) {
      if (error.name === 'AbortError') {
        // Request was intentionally aborted, no need to show an error
        console.log('Fetch aborted for:', filePath);
      } else {
        console.error('Error loading JSON:', error);
        contentArea.innerHTML = `<p class="error">Failed to load content: ${error.message}. Please check console for details.</p>`;
      }
      return null;
    } finally {
      currentFetch = null; // Clear controller after fetch completes or aborts
    }
  }

  /**
   * Loads and renders the content for a given page identifier.
   * @param {string} pageId - The identifier for the page (e.g., 'home', 'artworks').
   */
  async function loadPage(pageId) {
    if (!pageId) pageId = DEFAULT_PAGE;

    // Show loading indicator
    contentArea.innerHTML = '<p class="loading">Loading…</p>';

    // Special handling for the 'artworks' page as it loads an index of categories
    if (pageId === 'artworks') {
      const artworkIndexData = await loadJson(`${JSON_BASE_PATH}/artworks.json`);
      if (artworkIndexData && artworkIndexData.artworkCategories) {
        renderArtworkCategories(artworkIndexData.artworkCategories);
        updateActiveLink(pageId);
      } else {
        contentArea.innerHTML = `<p class="error">Failed to load artwork categories.</p>`;
      }
      return; // Stop here, artwork categories are rendered
    }

    // Special handling for the 'decorative-painting' page
    if (pageId === 'decorative-painting') {
      const decorativeData = await loadJson(`${JSON_BASE_PATH}/decorative-painting.json`);
      if (decorativeData) {
        renderDecorativeSlideshow(decorativeData.pageContent[0]); // Assuming content is within pageContent
        updateActiveLink(pageId);
      } else {
        contentArea.innerHTML = `<p class="error">Failed to load decorative painting content.</p>`;
      }
      return;
    }

    // Standard page loading for home, biography, contact, etc.
    const pageData = await loadJson(`${JSON_BASE_PATH}/${pageId}.json`);

    if (pageData && pageData.pageContent) {
      renderStandardContent(pageData.pageContent);
      updateActiveLink(pageId);
    } else if (pageData && Array.isArray(pageData)) {
      // Fallback if some JSONs are still direct arrays
      console.warn(
        `JSON for ${pageId} is a direct array, consider wrapping in { "pageContent": [...] }`
      );
      renderStandardContent(pageData);
      updateActiveLink(pageId);
    } else {
      contentArea.innerHTML = '<p class="error">Invalid page data or content not found.</p>';
    }
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
          return; // Skip appending unknown types
      }

      if (el) contentArea.appendChild(el);
    });
  }

  /**
   * Renders the menu of artwork categories from artworks.json.
   * @param {Array<Object>} categories - Array of artwork category objects.
   */
  function renderArtworkCategories(categories) {
    contentArea.innerHTML = ''; // Clear previous content

    const artworksSection = document.createElement('div');
    artworksSection.className = 'gallery-menu';
    // Add an H2 for accessibility if appropriate, e.g., "Our Artworks"
    // const heading = document.createElement('h2');
    // heading.textContent = "Browse Our Artworks";
    // artworksSection.appendChild(heading);

    categories.forEach((category) => {
      const categoryDiv = document.createElement('div');
      categoryDiv.className = `${category.id} gallery`; // e.g., "black-and-white gallery"

      const link = document.createElement('a');
      link.href = '#'; // Handled by JS, no default navigation
      link.className = 'gallery-link';
      link.setAttribute('data-category-id', category.id); // For JS to know what to load
      link.setAttribute('data-content-file', category.contentFile); // File name for category details
      link.setAttribute('aria-label', category.ariaLabel || `Go to ${category.title} gallery`);
      link.textContent = category.title;

      const descriptionP = document.createElement('p');
      descriptionP.textContent = category.description;

      categoryDiv.appendChild(link);
      categoryDiv.appendChild(descriptionP);
      artworksSection.appendChild(categoryDiv);
    });

    contentArea.appendChild(artworksSection);

    // Attach event listeners to the new category links
    artworksSection.querySelectorAll('.gallery-link').forEach((link) => {
      link.addEventListener('click', handleArtworkCategoryClick);
    });
  }

  /**
   * Handles click event for individual artwork category links.
   * Loads specific artwork content for that category.
   * @param {Event} event - The click event.
   */
  async function handleArtworkCategoryClick(event) {
    event.preventDefault(); // Prevent page reload

    const link = event.currentTarget;
    const categoryId = link.getAttribute('data-category-id');
    const contentFile = link.getAttribute('data-content-file');
    const filePath = `${JSON_BASE_PATH}/${contentFile}`; // Path to the category-specific JSON

    contentArea.innerHTML = '<p class="loading">Loading artworks in this category…</p>';

    const categoryData = await loadJson(filePath);

    if (categoryData && categoryData.artworks) {
      renderArtworksInGallery(categoryId, categoryData);
      // We don't update main menu active link, as we're still conceptually on 'artworks'
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
    // Determine the base path for images from the category JSON's metadata
    const imageBasePath =
      categoryData.metadata && categoryData.metadata.basePath
        ? categoryData.metadata.basePath
        : `${ARTWORK_IMAGES_BASE_URL}${categoryId}/`; // Fallback for safety

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

    html += `</div></div>`; // Close artwork-grid and category-detail
    contentArea.innerHTML = html;

    // Attach event listeners for the new "Back to Categories" button
    contentArea.querySelector('.back-to-categories').addEventListener('click', () => {
      loadPage('artworks'); // Reload the main artwork categories list
    });

    // Attach event listeners for "View Details" buttons
    contentArea.querySelectorAll('.view-artwork-detail').forEach((button) => {
      button.addEventListener('click', (e) => {
        const fullImage = e.target.getAttribute('data-full-image');
        alert(`Showing full image: ${fullImage}`);
        // In a real application, you'd open a modal/lightbox here
      });
    });
  }

  /**
   * Renders the decorative painting slideshow from decorative-painting.json.
   * @param {Object} decorativePageContent - The content object for decorative painting.
   */
  function renderDecorativeSlideshow(decorativePageContent) {
    const imageBasePath = DECORATIVE_IMAGES_BASE_URL; // Fixed base URL for decorative images

    let slideshowHtml = `
          <div class="slideshow-section">
              <h2>${decorativePageContent.title || 'Decorative Painting'}</h2>
              <p>${decorativePageContent.description || ''}</p>
              <div class="slideshow" data-category="decorative">
                  <div data-role="stage">
      `;

    if (decorativePageContent.images && decorativePageContent.images.length > 0) {
      decorativePageContent.images.forEach((image, index) => {
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
                  <!-- Add navigation buttons here for the slideshow -->
                  <div class="slideshow-nav">
                    <button class="slideshow-prev">Previous</button>
                    <button class="slideshow-next">Next</button>
                  </div>
              </div>
          </div>
      `;
    contentArea.innerHTML = slideshowHtml;

    // --- Slideshow Logic (client-side manipulation of 'display' style) ---
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
        // Only enable controls if there are images
        prevButton.addEventListener('click', () => {
          currentIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
          showImage(currentIndex);
        });

        nextButton.addEventListener('click', () => {
          currentIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
          showImage(currentIndex);
        });

        showImage(currentIndex); // Initialize first image
      } else {
        prevButton.style.display = 'none';
        nextButton.style.display = 'none';
      }
    }
  }

  /**
   * Updates the 'is-active' class on menu links.
   * @param {string} activePage - The data-page attribute value of the currently active link.
   */
  function updateActiveLink(activePage) {
    menuLinks.forEach((link) => {
      // For main navigation, ensure 'artworks' link stays active when viewing artwork sub-categories
      const isArtworksSubpage = [
        'black-and-white',
        'drip-series',
        'encaustic',
        'project-series',
        'decorative-painting',
      ].includes(activePage);

      if (activePage === link.dataset.page) {
        link.classList.add('is-active');
      } else if (link.dataset.page === 'artworks' && isArtworksSubpage) {
        link.classList.add('is-active'); // Keep 'artworks' active for sub-pages
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
      event.preventDefault(); // Stop default browser navigation

      const page = link.dataset.page;
      if (!page) return;

      // Update URL without reloading page
      history.pushState({ page }, '', link.getAttribute('href'));
      loadPage(page);
    });
  });

  // Handle browser back/forward buttons
  window.addEventListener('popstate', (event) => {
    // Use event.state.page if available, otherwise try to get from URL
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
    // Remove leading/trailing slashes and potential .html, then get the last segment
    const segments = path.split('/').filter((s) => s !== '' && s !== '.html');
    const pageName = segments.length > 0 ? segments[segments.length - 1] : DEFAULT_PAGE;
    return pageName || DEFAULT_PAGE;
  }

  // ==============================
  // Initialize
  // ==============================
  const initialPage = getPageFromURL();
  loadPage(initialPage);
});
