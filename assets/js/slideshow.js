/**
 * Self-Contained Slideshow Component.
 * This script is responsible for ALL aspects of the slideshow.
 * It fetches its own data, builds its HTML, and handles all interactions.
 */
(async () => {
  const dynamicContentArea = document.getElementById("dynamic-content-area");
  const pageName = window.location.pathname.substring(1) || "home";

  // --- 1. Fetch the Template Data for this specific page ---
  let template, pageTitle;
  try {
    const templateResponse = await fetch(`/json-files/${pageName}.json`);
    if (!templateResponse.ok)
      throw new Error(`HTTP error! Status: ${templateResponse.status}`);
    const templateData = await templateResponse.json();
    template = templateData.slideshowTemplate;
    pageTitle = templateData.title || pageName;
  } catch (error) {
    console.error(
      `[Slideshow] Could not load template JSON for page "${pageName}".`,
      error,
    );
    dynamicContentArea.innerHTML = `<p>Error loading slideshow template.</p>`;
    return;
  }

  // --- 2. Build the HTML Frame ---
  function buildFrame() {
    const wrapper = document.createElement(template.wrapper.tag);
    wrapper.className = template.wrapper.class;

    const logoDiv = document.createElement("div");
    logoDiv.className = "logo";
    const logoP = document.createElement("p");
    logoP.textContent = "The Life of an Artist";
    logoDiv.appendChild(logoP);

    const categoryDiv = document.createElement("div");
    categoryDiv.className = "category";
    const categoryP = document.createElement("p");
    categoryP.textContent = pageTitle;
    categoryDiv.appendChild(categoryP);

    const slideContainer = document.createElement("div");
    slideContainer.className = template.slideContainerClass;

    const createNavButton = (btnData) => {
      const div = document.createElement("div");
      div.className = btnData.wrapperClass;
      const button = document.createElement("button");
      button.id = btnData.buttonId;
      // No image added here, CSS will style the button
      div.appendChild(button);
      return div;
    };
    const prevButton = createNavButton(template.previousButton);
    const nextButton = createNavButton(template.nextButton);

    const returnArrowDiv = document.createElement("div");
    returnArrowDiv.className = template.rtnArrow.wrapperClass;
    const returnLink = document.createElement("a");
    returnLink.href = "/artworks";
    const returnImg = document.createElement("img");
    returnImg.src = template.rtnArrow.imgSrc;
    returnImg.alt = template.rtnArrow.imgAlt;
    returnLink.appendChild(returnImg);
    returnArrowDiv.appendChild(returnLink);

    const descriptionBox = document.createElement("div");
    descriptionBox.className = "description";
    const captionText = document.createElement("p");
    captionText.id = template.caption.paragraphId;
    const descriptionText = document.createElement("p");
    descriptionText.id = template.description.paragraphId;
    descriptionBox.appendChild(captionText);
    descriptionBox.appendChild(descriptionText);

    wrapper.appendChild(logoDiv);
    wrapper.appendChild(categoryDiv);
    wrapper.appendChild(prevButton);
    wrapper.appendChild(slideContainer);
    wrapper.appendChild(nextButton);
    wrapper.appendChild(returnArrowDiv);
    wrapper.appendChild(descriptionBox);

    dynamicContentArea.appendChild(wrapper);
  }

  buildFrame(); // Execute the frame build

  // --- 3. Find Elements and Initialize Slideshow Logic ---
  const slideshow = document.querySelector(".slideshow");
  const caption = document.getElementById("caption-text");
  const description = document.getElementById("description-text");
  const prevBtn = document.getElementById("prev-slide");
  const nextBtn = document.getElementById("next-slide");

  if (!slideshow || !caption || !description || !prevBtn || !nextBtn) {
    console.error(
      "[Slideshow] Core elements were not found after build. Halting.",
    );
    return;
  }

  let slides = [],
    current = 0,
    timer,
    isPausedByHoverOrTouch = false;

  // --- 4. Fetch the Image Data and Start the Slideshow ---
  try {
    const galleryResponse = await fetch(
      `/json-files/${template.gallerySource}`,
    );
    if (!galleryResponse.ok)
      throw new Error(`HTTP error! Status: ${galleryResponse.status}`);
    slides = await galleryResponse.json();

    if (!Array.isArray(slides) || !slides.length) {
      console.warn("⚠️ No slides found in the gallery JSON data.");
      return;
    }

    createSlides();
    fadeInFirstSlide();
  } catch (error) {
    console.error(
      `[Slideshow] Could not load gallery JSON "${template.gallerySource}".`,
      error,
    );
  }

  // --- 5. Helper Functions for Slideshow Operation ---
  function createSlides() {
    slides.forEach(({ src }) => {
      const img = document.createElement("img");
      img.src = src;
      img.className = "slide";
      img.style.opacity = 0;
      img.style.transition = "opacity 1.5s ease-in-out";
      slideshow.appendChild(img);
    });
  }

  function fadeInFirstSlide() {
    const firstSlide = slideshow.querySelector(".slide");
    if (!firstSlide) return;
    setTimeout(() => {
      firstSlide.style.opacity = 1;
      caption.textContent = slides[0].caption || "";
      description.textContent = slides[0].description || "";
    }, 50);
    setTimeout(startAutoPlay, 2000);
  }

  function showSlide(index) {
    const slidesDOM = slideshow.querySelectorAll(".slide");
    if (!slidesDOM.length || index < 0 || index >= slides.length) return;
    slidesDOM.forEach((img) => (img.style.opacity = 0));
    slidesDOM[index].style.opacity = 1;
    caption.textContent = slides[index].caption || "";
    description.textContent = slides[index].description || "";
    current = index;
  }

  function nextSlide() {
    showSlide((current + 1) % slides.length);
  }
  function prevSlideFunc() {
    showSlide((current - 1 + slides.length) % slides.length);
  }

  function startAutoPlay() {
    clearInterval(timer);
    timer = setInterval(nextSlide, 5000);
  }

  function pauseAutoPlay() {
    clearInterval(timer);
  }
  function resumeAutoPlay() {
    if (!isPausedByHoverOrTouch) startAutoPlay();
  }
  function resetAutoPlay() {
    pauseAutoPlay();
    resumeAutoPlay();
  }

  // --- 6. Event Listeners ---
  nextBtn.addEventListener("click", () => {
    nextSlide();
    resetAutoPlay();
  });
  prevBtn.addEventListener("click", () => {
    prevSlideFunc();
    resetAutoPlay();
  });
  slideshow.addEventListener("mouseenter", () => {
    isPausedByHoverOrTouch = true;
    pauseAutoPlay();
  });
  slideshow.addEventListener("mouseleave", () => {
    isPausedByHoverOrTouch = false;
    resumeAutoPlay();
  });
  slideshow.addEventListener(
    "touchstart",
    () => {
      isPausedByHoverOrTouch = true;
      pauseAutoPlay();
    },
    { passive: true },
  );
  slideshow.addEventListener(
    "touchend",
    () => {
      isPausedByHoverOrTouch = false;
      resumeAutoPlay();
    },
    { passive: true },
  );
})();
