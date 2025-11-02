document.addEventListener('DOMContentLoaded', () => {
  // --- 1. DOM Element References ---
  const body = document.body; // Make sure we have a reference to the body tag
  const navLinks = document.querySelectorAll('.main-nav-menu .landing-mnu');
  const dynamicContentArea = document.getElementById('dynamic-content-area');
  const dynamicPageWrapper = document.getElementById('dynamic-page-wrapper');

  // --- 2. Helper Functions ---
  function loadScript(path) {
    if (document.querySelector(`script[src="${path}"]`)) return;
    const script = document.createElement('script');
    script.src = path;
    script.defer = true;
    script.setAttribute('data-dynamic-script', 'true');
    document.body.appendChild(script);
  }

  function cleanupDynamicScripts() {
    const dynamicScripts = document.querySelectorAll('[data-dynamic-script="true"]');
    dynamicScripts.forEach((script) => script.remove());
  }

  // --- 3. HTML Rendering Functions ---
  function renderCardGrid(cardGrid) {
    /* ... This function is correct ... */
  }
  function renderContentSection(sectionData) {
    /* ... This function is correct ... */
  }
  function renderContactForm(formData) {
    /* ... This function is correct ... */
  }
  function renderSlideshow(template, pageName, pageTitle) {
    /* ... This function is correct ... */
  }

  // (The full code for the render functions is below for completeness)

  // --- 4. Main Page Content Controller ---
  function renderPageContent(data, pageName) {
    const title = data.title || pageName.charAt(0).toUpperCase() + pageName.slice(1);
    document.title = `${title} | AEPaints`;

    // --- THIS IS THE CRITICAL LOGIC THAT IS LIKELY MISSING ---
    if (data.slideshowTemplate) {
      body.classList.add('slideshow-active');
    } else {
      body.classList.remove('slideshow-active');
    }
    // --- END CRITICAL LOGIC ---

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

  // --- 5. Core Navigation and Data Loading Logic ---
  async function loadJsonContent(pageName, addToHistory = true) {
    /* ... This function is correct ... */
  }

  // --- 6. Event Listeners and Initial Load ---
  navLinks.forEach((link) => {
    /* ... This is correct ... */
  });
  window.addEventListener('popstate', (event) => {
    /* ... This is correct ... */
  });
  const initialPage = window.location.pathname.substring(1) || 'home';
  loadJsonContent(initialPage, false).then(() => {
    /* ... This is correct ... */
  });

  // --- Full Function Definitions for Pasting ---

  function renderCardGrid(cardGrid) {
    const sectionWrapper = document.createElement('section');
    sectionWrapper.className = 'card-grid';
    cardGrid.forEach((item) => {
      const card = document.createElement('div');
      card.className = item.type;
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

  function renderSlideshow(template, pageName, pageTitle) {
    const wrapper = document.createElement(template.wrapper.tag);
    wrapper.className = template.wrapper.class;

    const artistTitle = document.createElement('h2');
    artistTitle.className = 'slideshow-artist-title';
    artistTitle.textContent = 'The Life of an Artist';

    const slideshowPageTitle = document.createElement('p');
    slideshowPageTitle.className = 'slideshow-page-title';
    slideshowPageTitle.textContent = pageTitle;

    const returnLink = document.createElement('a');
    returnLink.href = '/artworks';
    returnLink.className = 'slideshow-return-link';
    const returnImg = document.createElement('img');
    returnImg.src = '/assets/images/misc-images/arrow-return.png';
    returnImg.alt = 'Return to previous page';
    returnLink.appendChild(returnImg);

    const infoBox = document.createElement('div');
    infoBox.className = 'slideshow-infobox';

    const captionWrapper = document.createElement('div');
    captionWrapper.className = 'caption';
    const captionText = document.createElement('p');
    captionText.id = template.caption.paragraphId;
    captionWrapper.appendChild(captionText);

    const descriptionWrapper = document.createElement('div');
    descriptionWrapper.className = 'description';
    const descriptionText = document.createElement('p');
    descriptionText.id = template.description.paragraphId;
    descriptionWrapper.appendChild(descriptionText);

    infoBox.appendChild(captionWrapper);
    infoBox.appendChild(descriptionWrapper);

    const slideContainer = document.createElement('div');
    slideContainer.className = template.slideContainerClass;
    slideContainer.setAttribute('data-gallery-source', template.gallerySource);

    const createNavButton = (btnData) => {
      const div = document.createElement('div');
      div.className = btnData.wrapperClass;
      const button = document.createElement('button');
      button.id = btnData.buttonId;
      button.className = 'prev-next circle';
      const img = document.createElement('img');
      img.src = btnData.imgSrc;
      img.alt = btnData.imgAlt;
      button.appendChild(img);
      div.appendChild(button);
      return div;
    };
    const prevButton = createNavButton(template.previousButton);
    const nextButton = createNavButton(template.nextButton);

    wrapper.appendChild(artistTitle);
    wrapper.appendChild(slideshowPageTitle);
    wrapper.appendChild(slideContainer);
    wrapper.appendChild(prevButton);
    wrapper.appendChild(nextButton);
    wrapper.appendChild(returnLink);
    wrapper.appendChild(infoBox);

    dynamicContentArea.innerHTML = '';
    dynamicContentArea.appendChild(wrapper);

    if (template.scriptToLoad) {
      loadScript(template.scriptToLoad);
    }
  }

  async function loadJsonContent(pageName, addToHistory = true) {
    cleanupDynamicScripts();
    const url = `/json-files/${pageName}.json`;
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
