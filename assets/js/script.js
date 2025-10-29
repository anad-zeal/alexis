document.addEventListener('DOMContentLoaded', () => {
  // --- 1. DOM Element References ---
  const navLinks = document.querySelectorAll('.main-nav-menu .landing-mnu');
  const dynamicContentArea = document.getElementById('dynamic-content-area');
  const dynamicPageWrapper = document.getElementById('dynamic-page-wrapper');
  const pageTitleElement = document.querySelector('.hero .page-title');

  // --- 2. Helper Functions ---

  /**
   * Dynamically loads and executes a script. Ensures script isn't loaded more than once.
   * @param {string} path - The path to the JavaScript file.
   */
  function loadScript(path) {
    // If a script with this source already exists, don't add it again.
    if (document.querySelector(`script[src="${path}"]`)) {
      return;
    }
    const script = document.createElement('script');
    script.src = path;
    script.defer = true;
    // Add an attribute to make it easy to find and remove later if needed
    script.setAttribute('data-dynamic-script', 'true');
    document.body.appendChild(script);
  }

  // --- 3. HTML Rendering Functions ---

  /**
   * Renders a grid of cards (e.g., for the homepage).
   * @param {Array} cardGrid - An array of card objects.
   */
  function renderCardGrid(cardGrid) {
    const sectionWrapper = document.createElement('section');
    sectionWrapper.className = 'card-grid';

    cardGrid.forEach((item) => {
      const card = document.createElement('div');
      card.className = item.type; // "card"

      const content = item.content;
      const cardContent = document.createElement('div');
      cardContent.className = content.type;
      if (content.class) {
        cardContent.classList.add(...content.class.split(' '));
      }

      if (content.link) {
        const linkElement = document.createElement('a');
        linkElement.href = content.link.href;
        linkElement.textContent = content.link.text;
        linkElement.className = content.link.class;
        linkElement.setAttribute('data-gallery', content.link.dataGallery);
        linkElement.setAttribute('aria-label', content.link.ariaLabel);
        cardContent.appendChild(linkElement);
      }

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
      sectionWrapper.appendChild(card);
    });

    dynamicContentArea.innerHTML = '';
    dynamicContentArea.appendChild(sectionWrapper);
  }

  /**
   * Renders a simple content section with paragraphs (e.g., for a biography page).
   * @param {object} sectionData - The contentSection object from JSON.
   */
  function renderContentSection(sectionData) {
    const wrapperElement = document.createElement(sectionData.tag);
    for (const key in sectionData.attributes) {
      wrapperElement.setAttribute(key, sectionData.attributes[key]);
    }
    sectionData.paragraphs.forEach((pText) => {
      const p = document.createElement('p');
      p.textContent = pText;
      wrapperElement.appendChild(p);
    });
    dynamicContentArea.innerHTML = '';
    dynamicContentArea.appendChild(wrapperElement);
  }

  /**
   * Renders a contact form from a JSON object.
   * @param {object} formData - The contactForm object from JSON.
   */
  function renderContactForm(formData) {
    const sectionWrapper = document.createElement(formData.wrapper.tag);
    for (const key in formData.wrapper.attributes) {
      sectionWrapper.setAttribute(key, formData.wrapper.attributes[key]);
    }
    const formWrapper = document.createElement('div');
    formWrapper.className = 'contact-form-wrapper';
    const formElement = document.createElement('form');
    for (const key in formData.form.attributes) {
      formElement.setAttribute(key, formData.form.attributes[key]);
    }
    formData.fields.forEach((field) => {
      const fieldContainer = document.createElement('div');
      fieldContainer.className = 'ccfield-prepend';
      if (field.type === 'submit') {
        const submitInput = document.createElement('input');
        submitInput.className = 'ccbtn';
        submitInput.type = 'submit';
        submitInput.value = field.value;
        fieldContainer.appendChild(submitInput);
      } else {
        const addon = document.createElement('span');
        addon.className = 'ccform-addon';
        const icon = document.createElement('i');
        icon.className = `fa ${field.icon} fa-2x`;
        addon.appendChild(icon);
        let inputElement =
          field.type === 'textarea'
            ? document.createElement('textarea')
            : document.createElement('input');
        if (field.type === 'textarea') {
          inputElement.name = field.name;
          inputElement.rows = field.rows;
        } else {
          inputElement.type = field.type;
        }
        inputElement.className = 'ccformfield';
        inputElement.placeholder = field.placeholder;
        if (field.required) inputElement.required = true;
        fieldContainer.appendChild(addon);
        fieldContainer.appendChild(inputElement);
      }
      formElement.appendChild(fieldContainer);
    });
    formWrapper.appendChild(formElement);
    sectionWrapper.appendChild(formWrapper);
    dynamicContentArea.innerHTML = '';
    dynamicContentArea.appendChild(sectionWrapper);
  }

  /**
   * Renders the structural HTML for a slideshow.
   * After rendering, it dynamically loads the script needed to activate the slideshow.
   * @param {object} template - The slideshowTemplate object from JSON.
   */
  function renderSlideshow(template) {
    const wrapper = document.createElement(template.wrapper.tag);
    wrapper.className = template.wrapper.class;
    const slideContainer = document.createElement('div');
    slideContainer.className = template.slideContainerClass;
    const createNavButton = (btnData) => {
      const div = document.createElement('div');
      div.className = btnData.wrapperClass;
      const button = document.createElement('button');
      button.id = btnData.buttonId;
      button.className = 'prev-next circle';
      const img = document.createElement('img');
      img.src = btnData.imgSrc;
      img.alt = btnData.imgAlt;
      img.className = 'prev-nexts';
      img.width = 50;
      button.appendChild(img);
      div.appendChild(button);
      return div;
    };
    const prevButton = createNavButton(template.previousButton);
    const nextButton = createNavButton(template.nextButton);
    const captionWrapper = document.createElement('div');
    captionWrapper.className = template.caption.wrapperClass;
    const captionText = document.createElement('p');
    captionText.id = template.caption.paragraphId;
    captionWrapper.appendChild(captionText);
    const footerWrapper = document.createElement('div');
    footerWrapper.className = template.footer.wrapperClass;
    const siteFooter = document.createElement('footer');
    siteFooter.className = 'site-footer';
    const footerText = document.createElement('p');
    footerText.textContent = template.footer.copyrightText;
    siteFooter.appendChild(footerText);
    footerWrapper.appendChild(siteFooter);
    wrapper.appendChild(slideContainer);
    wrapper.appendChild(prevButton);
    wrapper.appendChild(nextButton);
    wrapper.appendChild(captionWrapper);
    wrapper.appendChild(footerWrapper);
    dynamicContentArea.innerHTML = '';
    dynamicContentArea.appendChild(wrapper);
    if (template.scriptToLoad) {
      loadScript(template.scriptToLoad);
    }
  }

  // --- 4. Main Page Content Controller ---

  /**
   * The main router that decides which rendering function to call based on JSON content.
   * @param {object} data - The fetched JSON data.
   * @param {string} pageName - The name of the page being loaded.
   */
  function renderPageContent(data, pageName) {
    const title = data.title || pageName.charAt(0).toUpperCase() + pageName.slice(1);
    document.title = `${title} | AEPaints`;
    if (pageTitleElement) {
      pageTitleElement.textContent = title;
    }

    if (data.cardGrid) {
      renderCardGrid(data.cardGrid);
    } else if (data.contentSection) {
      renderContentSection(data.contentSection);
    } else if (data.contactForm) {
      renderContactForm(data.contactForm);
    } else if (data.slideshowTemplate) {
      renderSlideshow(data.slideshowTemplate);
    } else if (data.contentHtml) {
      // Fallback for old method
      dynamicContentArea.innerHTML = data.contentHtml;
    } else {
      dynamicContentArea.innerHTML = `<p>No content available for "${title}".</p>`;
    }

    dynamicContentArea.focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // --- 5. Core Navigation and Data Loading Logic ---

  /**
   * Fetches and loads content for a given page.
   * @param {string} pageName - The name of the page to load (e.g., "home").
   * @param {boolean} addToHistory - Whether to push a new state to the browser history.
   */
  async function loadJsonContent(pageName, addToHistory = true) {
    const url = `/json-files/${pageName}.json`;
    dynamicContentArea.innerHTML = '<p>Loading content...</p>';
    if (pageTitleElement) pageTitleElement.textContent = '';

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status} for ${url}`);
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

      if (dynamicPageWrapper) dynamicPageWrapper.dataset.page = pageName;
      if (addToHistory) {
        history.pushState({ page: pageName }, data.title || pageName, `/${pageName}`);
      }
    } catch (error) {
      console.error(`Error loading JSON file for ${pageName}:`, error);
      dynamicContentArea.innerHTML = `<p>Error loading content for "${pageName}". Please try again.</p>`;
      document.title = `Error | AEPaints`;
      if (pageTitleElement) pageTitleElement.textContent = `Error Loading Page`;
    }
  }

  // --- 6. Event Listeners and Initial Load ---
  navLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const pageName = event.target.dataset.page;
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
