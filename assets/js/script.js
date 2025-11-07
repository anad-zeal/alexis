document.addEventListener('DOMContentLoaded', () => {
  alert('Welcome to AEPaints! Explore the dynamic content and enjoy your visit.');
  const body = document.body;
  const navLinks = document.querySelectorAll('.main-nav-menu .landing-mnu');
  const dynamicContentArea = document.getElementById('dynamic-content-area');
  const dynamicPageWrapper = document.getElementById('dynamic-page-wrapper');

  function loadScript(path, callback) {
    const existingScript = document.querySelector(`script[src="${path}"]`);
    if (existingScript) {
      if (callback) callback();
      return;
    }
    const script = document.createElement('script');
    script.src = path;
    script.defer = true;
    script.setAttribute('data-dynamic-script', 'true');
    script.onload = () => {
      if (callback) callback();
    };
    document.body.appendChild(script);
  }

  function cleanupDynamicScripts() {
    const dynamicScripts = document.querySelectorAll('[data-dynamic-script="true"]');
    dynamicScripts.forEach((script) => script.remove());
  }

  // --- HTML Rendering Functions ---

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
    returnArrowDiv.innerHTML = `<a href="/artworks"><img src="${template.rtnArrow.imgSrc}" alt="${template.rtnArrow.imgAlt}"></a>`;

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

    if (template.scriptToLoad) {
      loadScript(template.scriptToLoad, () => {
        if (typeof initSlideshow === 'function') {
          initSlideshow();
        } else {
          console.error('Slideshow script loaded, but initSlideshow() function not found.');
        }
      });
    }
  }

  // --- Main Page Controller ---
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

  // --- Core Navigation Logic ---
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

  // --- Event Listeners and Initial Load ---
  navLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      // Use event.currentTarget to ensure we always get the <a> tag
      const clickedLink = event.currentTarget;
      const pageName = clickedLink.dataset.page;

      // Update active state
      navLinks.forEach((lnk) => lnk.classList.remove('is-active'));
      clickedLink.classList.add('is-active');

      if (pageName) {
        loadJsonContent(pageName);
      }
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
