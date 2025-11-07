document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const navLinks = document.querySelectorAll('.main-nav-menu .landing-mnu');
  const dynamicContentArea = document.getElementById('dynamic-content-area');
  const dynamicPageWrapper = document.getElementById('dynamic-page-wrapper');

  alert('JS SCRIPT LOADED');

  // --- MODIFICATION #1: Added a 'callback' parameter and 'script.onload' ---
  function loadScript(path, callback) {
    const existingScript = document.querySelector(`script[src="${path}"]`);
    // If script exists, just run the callback immediately.
    if (existingScript) {
      if (callback) callback();
      return;
    }
    const script = document.createElement('script');
    script.src = path;
    script.defer = true;
    script.setAttribute('data-dynamic-script', 'true');

    // This is the crucial addition: only run the callback when the script is loaded.
    script.onload = () => {
      if (callback) callback();
    };

    document.body.appendChild(script);
  }

  function cleanupDynamicScripts() {
    const dynamicScripts = document.querySelectorAll('[data-dynamic-script="true"]');
    dynamicScripts.forEach((script) => script.remove());
  }

  // --- HTML Rendering Functions (No changes here) ---
  function renderCardGrid(cardGrid) {
    /* ...unchanged... */
  }
  function renderContentSection(sectionData) {
    /* ...unchanged... */
  }
  function renderContactForm(formData) {
    /* ...unchanged... */
  }

  function renderSlideshow(template, pageName, pageTitle) {
    const wrapper = document.createElement(template.wrapper.tag);
    wrapper.className = template.wrapper.class;

    const logoDiv = document.createElement('div');
    logoDiv.className = 'logo';
    logoDiv.innerHTML = '<p>The Life of an Artist</p>';

    const categoryDiv = document.createElement('div');
    categoryDiv.className = 'category';
    categoryDiv.innerHTML = `<p>${pageTitle}</p>`;

    const slideContainer = document.createElement('div');
    slideContainer.className = template.slideContainerClass;
    slideContainer.setAttribute('data-gallery-source', template.gallerySource);

    const createNavButton = (btnData) => {
      const div = document.createElement('div');
      div.className = btnData.wrapperClass;
      div.innerHTML = `<button id="${btnData.buttonId}"><img src="${btnData.imgSrc}" alt="${btnData.imgAlt}"></button>`;
      return div;
    };
    const prevButton = createNavButton(template.previousButton);
    const nextButton = createNavButton(template.nextButton);

    const returnArrowDiv = document.createElement('div');
    returnArrowDiv.className = template.rtnArrow.wrapperClass;
    returnArrowDiv.innerHTML = `<a href="/"><img src="${template.rtnArrow.imgSrc}" alt="${template.rtnArrow.imgAlt}"></a>`;

    const descriptionBox = document.createElement('div');
    descriptionBox.className = 'description';
    descriptionBox.innerHTML = `<p id="${template.caption.paragraphId}"></p><p id="${template.description.paragraphId}"></p>`;

    wrapper.append(
      logoDiv,
      categoryDiv,
      prevButton,
      slideContainer,
      nextButton,
      returnArrowDiv,
      descriptionBox
    );

    dynamicContentArea.innerHTML = '';
    dynamicContentArea.appendChild(wrapper);

    // --- MODIFICATION #2: Pass the initializer function as the callback ---
    if (template.scriptToLoad) {
      loadScript(template.scriptToLoad, () => {
        // This code will only run AFTER slideshow.js has fully loaded.
        if (typeof initSlideshow === 'function') {
          initSlideshow();
        } else {
          console.error('Slideshow script loaded, but initSlideshow() function not found.');
        }
      });
    }
  }

  // --- Main Page Controller (No changes here) ---
  function renderPageContent(data, pageName) {
    const title = data.title || pageName.charAt(0).toUpperCase() + pageName.slice(1);
    document.title = `${title} | AEPaints`;
    if (data.slideshowTemplate) {
      body.classList.add('slideshow-active');
    } else {
      body.classList.remove('slideshow-active');
    }
    const heroTitleElement = document.querySelector('.hero .page-title');
    if (heroTitleElement && !data.slideshowTemplate) {
      heroTitleElement.textContent = title;
    }
    if (data.cardGrid) {
      renderCardGrid(data.cardGrid);
    } else if (data.contentSection) {
      renderContentSection(data.contentSection);
    } else if (data.contactForm) {
      renderContactForm(data.contactForm);
    } else if (data.slideshowTemplate) {
      renderSlideshow(data.slideshowTemplate, pageName, title);
    } else {
      dynamicContentArea.innerHTML = `<p>No content available for "${title}".</p>`;
    }
    dynamicContentArea.focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // --- Core Navigation Logic & Event Listeners (No changes here) ---
  async function loadJsonContent(pageName, addToHistory = true) {
    cleanupDynamicScripts();
    // alert('PAGE NAMR: ' + pageName);
    const url = `json-files/${pageName}.json`;
    dynamicContentArea.innerHTML = '<p>Loading content...</p>';
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      renderPageContent(data, pageName);
      navLinks.forEach((link) => link.classList.remove('is-active'));
      const activeLink = document.querySelector(`.main-nav-menu a[data-page="${pageName}"]`);
      if (activeLink) activeLink.classList.add('is-active');
      if (dynamicPageWrapper) dynamicPageWrapper.dataset.page = pageName;
      if (addToHistory) {
        history.pushState({ page: pageName }, data.title || pageName, `/${pageName}`);
      }
    } catch (error) {
      console.error(`Error loading JSON file for ${pageName}:`, error);
      dynamicContentArea.innerHTML = `<p>Error loading content for "${pageName}".</p>`;
    }
  }

  navLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const clickedLink = event.currentTarget;
      const pageName = clickedLink.dataset.page;
      navLinks.forEach((lnk) => lnk.classList.remove('is-active'));
      clickedLink.classList.add('is-active');
      if (pageName) loadJsonContent(pageName);
    });
  });

  window.addEventListener('popstate', (event) => {
    const statePage = event.state
      ? event.state.page
      : window.location.pathname.substring(1) || 'home';
    loadJsonContent(statePage, false);
  });

  const initialPage = window.location.pathname.substring(1) || 'home';
  loadJsonContent(initialPage, false).then(() => {
    history.replaceState({ page: initialPage }, document.title, `/${initialPage}`);
  });
});
