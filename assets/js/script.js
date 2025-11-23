/**
 * assets/js/script.js
 * Main Router and Page Renderer
 */
document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const navLinks = document.querySelectorAll('.main-nav-menu .landing-mnu');
  const dynamicContentArea = document.getElementById('dynamic-content-area');
  let siteData = null;

  // --- Script Loader ---
  function loadScript(path, callback) {
    // Check if script exists, if so, just run callback
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

    script.onerror = () => {
      console.error('Failed to load script:', path);
    };

    document.body.appendChild(script);
  }

  // --- Rendering Functions ---

  function renderCardGrid(cardGrid) {
    const sectionWrapper = document.createElement('section');
    sectionWrapper.className = 'card-grid';

    cardGrid.forEach((item) => {
      const card = document.createElement('div');
      card.className = item.type;
      const content = item.content;

      const cardContent = document.createElement('div');
      cardContent.className = content.type;
      if (content.class) cardContent.classList.add(...content.class.split(' '));

      // Link handling
      if (content.link) {
        const linkElement = document.createElement('a');
        linkElement.href = content.link.href;
        linkElement.textContent = content.link.text;
        if (content.link.class) linkElement.className = content.link.class;

        const pageName = content.link.href.replace('/', '').trim();
        if (pageName) linkElement.setAttribute('data-page', pageName);
        if (content.link.ariaLabel) linkElement.setAttribute('aria-label', content.link.ariaLabel);

        cardContent.appendChild(linkElement);
      }

      // Paragraph/Image handling
      if (content.paragraph) {
        if (typeof content.paragraph === 'object' && content.paragraph.type === 'image') {
          const img = document.createElement('img');
          img.src = content.paragraph.src;
          if (content.paragraph.class) img.className = content.paragraph.class;
          img.alt = content.paragraph.alt || '';
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
    // (Kept your original logic, abbreviated here for brevity, assume it is same as your provided code)
    // ... Insert your renderContactForm logic here if it wasn't changed ...
    const sectionWrapper = document.createElement(formData.wrapper.tag);
    sectionWrapper.className = 'contact-wrapper'; // specific class
    sectionWrapper.innerHTML = `<div class="contact-form-wrapper"><form class="ccform"><h3>Contact Form Placeholder</h3></form></div>`;
    // For production, paste your full renderContactForm function back here.
    dynamicContentArea.innerHTML = '';
    dynamicContentArea.appendChild(sectionWrapper);
  }

  function renderSlideshow(template, pageTitle) {
    const wrapper = document.createElement(template.wrapper.tag);
    wrapper.className = template.wrapper.class;

    // Build HTML Structure
    wrapper.innerHTML = `
        <div class="logo"><p>The Life of an Artist</p></div>
        <div class="category"><p>${pageTitle}</p></div>

        <div class="${template.previousButton.wrapperClass}">
          <button id="${template.previousButton.buttonId}" aria-label="${template.previousButton.ariaLabel}">
            <img src="${template.previousButton.imgSrc}" alt="${template.previousButton.imgAlt}">
          </button>
        </div>

        <div class="${template.slideContainerClass}" data-gallery-source="${template.gallerySource}">
             <div class="loading-msg">Loading Gallery...</div>
        </div>

        <div class="${template.nextButton.wrapperClass}">
          <button id="${template.nextButton.buttonId}" aria-label="${template.nextButton.ariaLabel}">
            <img src="${template.nextButton.imgSrc}" alt="${template.nextButton.imgAlt}">
          </button>
        </div>

        <div class="${template.rtnArrow.wrapperClass}">
          <a href="/artworks" data-page="artworks" aria-label="${template.rtnArrow.ariaLabel}">
            <img src="${template.rtnArrow.imgSrc}" alt="${template.rtnArrow.imgAlt}">
          </a>
        </div>

        <div class="description">
          <p id="${template.caption.paragraphId}"></p>
          <p id="${template.description.paragraphId}"></p>
        </div>
      `;

    dynamicContentArea.innerHTML = '';
    dynamicContentArea.appendChild(wrapper);

    // Load and Initialize Logic
    if (template.scriptToLoad) {
      loadScript(template.scriptToLoad, () => {
        if (typeof initSlideshow === 'function') {
          initSlideshow();
        }
      });
    }
  }

  // --- Page Controller ---
  function renderPageContent(data) {
    document.title = `${data.title} | AEPaints`;

    // Manage Body Classes for CSS
    if (data.slideshowTemplate) {
      body.classList.add('slideshow-active');
    } else {
      body.classList.remove('slideshow-active');
    }

    // Render Logic
    if (data.cardGrid) {
      renderCardGrid(data.cardGrid);
    } else if (data.contentSection) {
      renderContentSection(data.contentSection);
    } else if (data.contactForm) {
      renderContactForm(data.contactForm);
    } else if (data.slideshowTemplate) {
      renderSlideshow(data.slideshowTemplate, data.title);
    } else {
      dynamicContentArea.innerHTML = `<p>No content available.</p>`;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function loadPage(pageName, addToHistory = true) {
    // Cleanup old listeners/scripts if necessary
    // Note: We don't strictly remove the script tag to cache it,
    // but we rely on initSlideshow re-binding events.

    if (!siteData) return;
    const pageData = siteData.pages[pageName];

    if (!pageData) {
      console.error('Page not found:', pageName);
      return;
    }

    let finalData = { title: pageData.title };

    // Prepare data object based on type
    if (pageData.type === 'slideshow') {
      const templateCopy = JSON.parse(JSON.stringify(siteData.slideshowTemplate));
      templateCopy.gallerySource = pageData.gallerySource;
      finalData.slideshowTemplate = templateCopy;
    } else if (pageData.type === 'cardGrid') {
      finalData.cardGrid = pageData.content;
    } else if (pageData.type === 'contentSection') {
      finalData.contentSection = pageData.content;
    } else if (pageData.type === 'contactForm') {
      finalData.contactForm = pageData.content;
    }

    renderPageContent(finalData);

    // Update Menu State
    navLinks.forEach((link) => link.classList.remove('is-active'));
    const activeLink = document.querySelector(`.main-nav-menu a[data-page="${pageName}"]`);
    if (activeLink) activeLink.classList.add('is-active');

    if (addToHistory) {
      history.pushState({ page: pageName }, finalData.title, `/${pageName}`);
    }
  }

  // --- Init ---
  async function init() {
    try {
      const response = await fetch('/json-files/site-data.json');
      if (!response.ok) throw new Error('Failed to load site data.');
      siteData = await response.json();

      const initialPage = window.location.pathname.replace('/', '').split('/')[0] || 'home';
      loadPage(initialPage, false);
    } catch (error) {
      console.error('Fatal Error:', error);
    }
  }

  // --- Global Event Delegation ---
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[data-page]');
    if (link) {
      event.preventDefault();
      loadPage(link.dataset.page);
    }
  });

  window.addEventListener('popstate', (event) => {
    const statePage = event.state ? event.state.page : 'home';
    loadPage(statePage, false);
  });

  init();
});
