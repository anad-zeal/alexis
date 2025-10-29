document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelectorAll('.main-nav-menu .landing-mnu');
  const dynamicContentArea = document.getElementById('dynamic-content-area');
  const dynamicPageWrapper = document.getElementById('dynamic-page-wrapper');
  const pageTitleElement = document.querySelector('.hero .page-title');

  /**
   * Renders a grid of cards from a JSON object into the dynamic content area.
   * This version now correctly creates the <section class="card-grid"> wrapper.
   * @param {Array} cardGrid - An array of card objects from the JSON file.
   */
  function renderCardGrid(cardGrid) {
    // *** NEW: Create the main section wrapper element ***
    const sectionWrapper = document.createElement('section');
    sectionWrapper.className = 'card-grid';

    cardGrid.forEach((item) => {
      // Create the main container for the card
      const card = document.createElement('div');
      card.className = item.type; // e.g., "card"

      const content = item.content;
      const cardContent = document.createElement('div');
      cardContent.className = content.type; // e.g., "landingMenuItem"
      if (content.class) {
        cardContent.classList.add(...content.class.split(' '));
      }

      // If there's a link object, create the link element
      if (content.link) {
        const link = content.link;
        const linkElement = document.createElement('a');
        linkElement.href = link.href;
        linkElement.textContent = link.text;
        linkElement.className = link.class;
        linkElement.setAttribute('data-gallery', link.dataGallery);
        linkElement.setAttribute('aria-label', link.ariaLabel);
        cardContent.appendChild(linkElement);
      }

      // If there's a paragraph, handle it
      if (content.paragraph) {
        if (typeof content.paragraph === 'object' && content.paragraph.type === 'image') {
          const img = document.createElement('img');
          img.src = content.paragraph.src;
          img.className = content.paragraph.class;
          img.alt = '';
          cardContent.appendChild(img);
        } else {
          const p = document.createElement('p');
          p.textContent = content.paragraph;
          cardContent.appendChild(p);
        }
      }

      card.appendChild(cardContent);
      // *** MODIFIED: Append the card to the section wrapper, not a fragment ***
      sectionWrapper.appendChild(card);
    });

    // Clear any previous content
    dynamicContentArea.innerHTML = '';
    // *** MODIFIED: Append the single, complete section wrapper to the DOM ***
    dynamicContentArea.appendChild(sectionWrapper);
  }

  function renderPageContent(data, pageName) {
    const title = data.title || pageName.charAt(0).toUpperCase() + pageName.slice(1);
    document.title = `${title} | AEPaints`;
    if (pageTitleElement) {
      pageTitleElement.textContent = title;
    }

    // *** ADD THIS 'ELSE IF' BLOCK ***
    if (data.cardGrid) {
      renderCardGrid(data.cardGrid);
    } else if (data.contentSection) {
      // CHECK FOR THE NEW STRUCTURE
      renderContentSection(data.contentSection); // CALL THE NEW FUNCTION
    } else if (data.contentHtml) {
      dynamicContentArea.innerHTML = data.contentHtml;
    } else {
      dynamicContentArea.innerHTML = `<p>No content available for "${title}".</p>`;
    }

    dynamicContentArea.focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Renders a content section with paragraphs from a JSON object.
   * @param {object} sectionData - The contentSection object from the JSON file.
   */
  function renderContentSection(sectionData) {
    // 1. Create the main wrapper element (e.g., <section>)
    const wrapperElement = document.createElement(sectionData.tag);

    // 2. Set all attributes from the JSON onto the wrapper element
    for (const key in sectionData.attributes) {
      wrapperElement.setAttribute(key, sectionData.attributes[key]);
    }

    // 3. Create and append each paragraph
    sectionData.paragraphs.forEach((pText) => {
      const p = document.createElement('p');
      p.textContent = pText; // Use textContent for security
      wrapperElement.appendChild(p);
    });

    // 4. Clear the old content and append the new, fully-built element
    dynamicContentArea.innerHTML = '';
    dynamicContentArea.appendChild(wrapperElement);
  }

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

      navLinks.forEach((link) => {
        link.classList.remove('is-active');
        link.removeAttribute('aria-current');
      });
      const activeLink = document.querySelector(`.main-nav-menu a[data-page="${pageName}"]`);
      if (activeLink) {
        activeLink.classList.add('is-active');
        activeLink.setAttribute('aria-current', 'page');
      }

      if (dynamicPageWrapper) {
        dynamicPageWrapper.dataset.page = pageName;
      }

      if (addToHistory) {
        const title = data.title || pageName;
        history.pushState({ page: pageName, title: title }, title, `/${pageName}`);
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

  navLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const pageName = event.target.dataset.page;
      if (pageName) {
        loadJsonContent(pageName);
      }
    });
  });

  window.addEventListener('popstate', (event) => {
    const statePage = event.state
      ? event.state.page
      : window.location.pathname.substring(1) || 'home';
    if (statePage) {
      loadJsonContent(statePage, false);
    }
  });

  const initialPath = window.location.pathname.substring(1);
  const initialPage = initialPath || 'home';

  loadJsonContent(initialPage, false).then(() => {
    const currentTitle = document.title;
    history.replaceState(
      { page: initialPage, title: currentTitle },
      currentTitle,
      `/${initialPage}`
    );

    const activeLink = document.querySelector(`.main-nav-menu a[data-page="${initialPage}"]`);
    if (activeLink) {
      activeLink.classList.add('is-active');
      activeLink.setAttribute('aria-current', 'page');
    }

    if (dynamicPageWrapper) {
      dynamicPageWrapper.dataset.page = initialPage;
    }
  });
});
