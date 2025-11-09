document.addEventListener("DOMContentLoaded", () => {
  // --- References and a variable to hold our site data ---
  const body = document.body;
  const navLinks = document.querySelectorAll(".main-nav-menu .landing-mnu");
  const dynamicContentArea = document.getElementById("dynamic-content-area");
  let siteData = null;

  // --- Helper Functions ---
  function loadScript(path, callback) {
    const existingScript = document.querySelector(`script[src="${path}"]`);
    if (existingScript) {
      if (callback) callback();
      return;
    }
    const script = document.createElement("script");
    script.src = path;
    script.defer = true;
    script.setAttribute("data-dynamic-script", "true");
    script.onload = () => {
      if (callback) callback();
    };
    document.body.appendChild(script);
  }

  function cleanupDynamicScripts() {
    const dynamicScripts = document.querySelectorAll(
      '[data-dynamic-script="true"]',
    );
    dynamicScripts.forEach((script) => script.remove());
  }

  // --- Rendering Functions ---
  function renderCardGrid(cardGrid) {
    const sectionWrapper = document.createElement("section");
    sectionWrapper.className = "card-grid";
    cardGrid.forEach((item) => {
      const card = document.createElement("div");
      card.className = item.type;
      const content = item.content;
      const cardContent = document.createElement("div");
      cardContent.className = content.type;
      if (content.class) cardContent.classList.add(...content.class.split(" "));
      if (content.link) {
        const linkElement = document.createElement("a");
        linkElement.href = content.link.href;
        linkElement.textContent = content.link.text;
        if (content.link.class) linkElement.className = content.link.class;
        const pageName = content.link.href.replace("/", "").trim();
        if (pageName) linkElement.setAttribute("data-page", pageName);
        if (content.link.ariaLabel)
          linkElement.setAttribute("aria-label", content.link.ariaLabel);
        cardContent.appendChild(linkElement);
      }
      if (content.paragraph) {
        if (
          typeof content.paragraph === "object" &&
          content.paragraph.type === "image"
        ) {
          const img = document.createElement("img");
          img.src = content.paragraph.src;
          if (content.paragraph.class) img.className = content.paragraph.class;
          img.alt = content.paragraph.alt || "";
          cardContent.appendChild(img);
        } else {
          const p = document.createElement("p");
          p.textContent = content.paragraph;
          cardContent.appendChild(p);
        }
      }
      card.appendChild(cardContent);
      sectionWrapper.appendChild(card);
    });
    dynamicContentArea.innerHTML = "";
    dynamicContentArea.appendChild(sectionWrapper);
  }

  function renderContentSection(sectionData) {
    const wrapperElement = document.createElement(sectionData.tag);
    for (const key in sectionData.attributes) {
      wrapperElement.setAttribute(key, sectionData.attributes[key]);
    }
    sectionData.paragraphs.forEach((pText) => {
      const p = document.createElement("p");
      p.textContent = pText;
      wrapperElement.appendChild(p);
    });
    if (sectionData.links && Array.isArray(sectionData.links)) {
      const linksContainer = document.createElement("div");
      linksContainer.className = "links-container";
      sectionData.links.forEach((linkData) => {
        const linkElement = document.createElement("a");
        linkElement.href = linkData.href;
        linkElement.textContent = linkData.text;
        if (linkData.class) linkElement.className = linkData.class;
        const pageName = linkData.href.replace("/", "").trim();
        if (pageName) linkElement.setAttribute("data-page", pageName);
        linksContainer.appendChild(linkElement);
      });
      wrapperElement.appendChild(linksContainer);
    }
    dynamicContentArea.innerHTML = "";
    dynamicContentArea.appendChild(wrapperElement);
  }

  function renderContactForm(formData) {
    const sectionWrapper = document.createElement(formData.wrapper.tag);
    for (const key in formData.wrapper.attributes) {
      sectionWrapper.setAttribute(key, formData.wrapper.attributes[key]);
    }
    const formWrapper = document.createElement("div");
    formWrapper.className = "contact-form-wrapper";
    const formElement = document.createElement("form");
    for (const key in formData.form.attributes) {
      formElement.setAttribute(key, formData.form.attributes[key]);
    }
    formData.fields.forEach((field) => {
      const fieldContainer = document.createElement("div");
      fieldContainer.className = "ccfield-prepend";
      if (field.type === "submit") {
        const submitInput = document.createElement("input");
        submitInput.className = "ccbtn";
        submitInput.type = "submit";
        submitInput.value = field.value;
        fieldContainer.appendChild(submitInput);
      } else {
        const addon = document.createElement("span");
        addon.className = "ccform-addon";
        const icon = document.createElement("i");
        icon.className = `fa ${field.icon} fa-2x`;
        addon.appendChild(icon);
        let inputElement =
          field.type === "textarea"
            ? document.createElement("textarea")
            : document.createElement("input");
        if (field.type === "textarea") {
          inputElement.name = field.name;
          inputElement.rows = field.rows;
        } else {
          inputElement.type = field.type;
        }
        inputElement.className = "ccformfield";
        inputElement.placeholder = field.placeholder;
        if (field.required) inputElement.required = true;
        fieldContainer.appendChild(addon);
        fieldContainer.appendChild(inputElement);
      }
      formElement.appendChild(fieldContainer);
    });
    formWrapper.appendChild(formElement);
    sectionWrapper.appendChild(formWrapper);
    dynamicContentArea.innerHTML = "";
    dynamicContentArea.appendChild(sectionWrapper);
  }

  function renderSlideshow(template, pageName, pageTitle) {
    const wrapper = document.createElement(template.wrapper.tag);
    wrapper.className = template.wrapper.class;
    const logoDiv = document.createElement("div");
    logoDiv.className = "logo";
    logoDiv.innerHTML = "<p>The Life of an Artist</p>";
    const categoryDiv = document.createElement("div");
    categoryDiv.className = "category";
    categoryDiv.innerHTML = `<p>${pageTitle}</p>`;
    const slideContainer = document.createElement("div");
    slideContainer.className = template.slideContainerClass;
    slideContainer.setAttribute("data-gallery-source", template.gallerySource);
    const createNavButton = (btnData) => {
      const div = document.createElement("div");
      div.className = btnData.wrapperClass;
      div.innerHTML = `<button id="${btnData.buttonId}"><img src="${btnData.imgSrc}" alt="${btnData.imgAlt}"></button>`;
      return div;
    };
    const prevButton = createNavButton(template.previousButton);
    const nextButton = createNavButton(template.nextButton);
    const returnArrowDiv = document.createElement("div");
    returnArrowDiv.className = template.rtnArrow.wrapperClass;
    returnArrowDiv.innerHTML = `<a href="/" data-page="home"><img src="${template.rtnArrow.imgSrc}" alt="${template.rtnArrow.imgAlt}"></a>`;
    const descriptionBox = document.createElement("div");
    descriptionBox.className = "description";
    descriptionBox.innerHTML = `<p id="${template.caption.paragraphId}"></p><p id="${template.description.paragraphId}"></p>`;
    wrapper.append(
      logoDiv,
      categoryDiv,
      prevButton,
      slideContainer,
      nextButton,
      returnArrowDiv,
      descriptionBox,
    );
    dynamicContentArea.innerHTML = "";
    dynamicContentArea.appendChild(wrapper);
    if (template.scriptToLoad) {
      loadScript(template.scriptToLoad, () => {
        if (typeof initSlideshow === "function") {
          initSlideshow();
        }
      });
    }
  }

  // --- Main Page Controller (CORRECTED) ---
  function renderPageContent(data) {
    document.title = `${data.title} | AEPaints`;
    const heroSection = document.querySelector(".hero");

    // Always ensure the hero is visible
    if (heroSection) {
      heroSection.style.display = "block";
    }

    // Toggle the 'slideshow-active' class for styling, but don't hide the hero
    if (data.slideshowTemplate) {
      body.classList.add("slideshow-active");
    } else {
      body.classList.remove("slideshow-active");
    }

    // Always update the hero title
    const heroTitleElement = document.querySelector(".hero .page-title");
    if (heroTitleElement) {
      heroTitleElement.textContent = data.title;
    }

    // --- The rest of the rendering logic is unchanged ---
    if (data.cardGrid) {
      renderCardGrid(data.cardGrid);
    } else if (data.contentSection) {
      renderContentSection(data.contentSection);
    } else if (data.contactForm) {
      renderContactForm(data.contactForm);
    } else if (data.slideshowTemplate) {
      renderSlideshow(data.slideshowTemplate, null, data.title);
    } else {
      dynamicContentArea.innerHTML = `<p>No content available for "${data.title}".</p>`;
    }

    dynamicContentArea.focus();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // --- Core Navigation Logic ---
  function loadPage(pageName, addToHistory = true) {
    if (!siteData || !siteData.pages[pageName]) {
      console.error(`No page data found for '${pageName}'`);
      dynamicContentArea.innerHTML = `<p>Error: Page not found.</p>`;
      return;
    }
    cleanupDynamicScripts();
    const pageData = siteData.pages[pageName];
    let finalData = { title: pageData.title };
    if (pageData.type === "slideshow") {
      const templateCopy = JSON.parse(
        JSON.stringify(siteData.slideshowTemplate),
      );
      templateCopy.gallerySource = pageData.gallerySource;
      templateCopy.wrapper.ariaLabel = pageData.ariaLabel;
      finalData.slideshowTemplate = templateCopy;
    } else if (pageData.type === "contentSection") {
      finalData.contentSection = pageData.content;
    } else if (pageData.type === "contactForm") {
      finalData.contactForm = pageData.content;
    } else if (pageData.type === "cardGrid") {
      finalData.cardGrid = pageData.content;
    }
    renderPageContent(finalData);
    navLinks.forEach((link) => link.classList.remove("is-active"));
    const activeLink = document.querySelector(
      `.main-nav-menu a[data-page="${pageName}"]`,
    );
    if (activeLink) activeLink.classList.add("is-active");
    if (addToHistory) {
      history.pushState({ page: pageName }, finalData.title, `/${pageName}`);
    }
  }

  // --- Initializer ---
  async function init() {
    try {
      const response = await fetch("/json-files/site-data.json");
      if (!response.ok) throw new Error("Failed to load site data.");
      siteData = await response.json();
      const initialPage =
        window.location.pathname.replace("/", "").split("/")[0] || "home";
      loadPage(initialPage, false);
      history.replaceState(
        { page: initialPage },
        document.title,
        `/${initialPage}`,
      );
    } catch (error) {
      console.error("Fatal Error:", error);
      dynamicContentArea.innerHTML =
        "<p>Could not load website content. Please try again later.</p>";
    }
  }

  // --- Event Listeners ---
  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[data-page]");
    if (link) {
      event.preventDefault();
      const pageName = link.dataset.page;
      if (pageName) {
        loadPage(pageName);
      }
    }
  });

  window.addEventListener("popstate", (event) => {
    const statePage = event.state
      ? event.state.page
      : window.location.pathname.replace("/", "").split("/")[0] || "home";
    loadPage(statePage, false);
  });

  // Start the application
  init();
});
