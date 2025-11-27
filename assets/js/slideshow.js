/**
 * assets/js/slideshow.js
 * Handles logic for the specific slideshow view
 */

// Global function called by script.js when the view is loaded
function initSlideshow() {
  const slideContainer = document.querySelector('.slideshow');
  const captionEl = document.getElementById('caption-text');
  const descEl = document.getElementById('description-text');
  const prevBtn = document.getElementById('prev-slide');
  const nextBtn = document.getElementById('next-slide');

  if (!slideContainer) return; // Guard clause

  const jsonSource = slideContainer.getAttribute('data-gallery-source');
  let slides = [];
  let currentIndex = 0;
  let autoPlayInterval;

  // 1. Fetch the Gallery JSON
  fetch(`/json-files/${jsonSource}`)
    .then((res) => {
      if (!res.ok) throw new Error('Gallery not found');
      return res.json();
    })
    .then((data) => {
      slides = data;
      if (slides.length > 0) {
        renderSlide(0);
        setupControls();
      } else {
        slideContainer.innerHTML = '<p>No images in this gallery.</p>';
      }
    })
    .catch((err) => {
      console.error(err);
      slideContainer.innerHTML = '<p>Error loading gallery.</p>';
    });

  // 2. Render a specific slide
  function renderSlide(index) {
    // Validate index
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;
    currentIndex = index;

    const slideData = slides[currentIndex];

    // Create Image Element with Fade Effect
    const img = document.createElement('img');
    img.src = slideData.src;
    img.alt = slideData.title;
    img.className = 'slide-image fade-in';

    // Clear container and add new image
    slideContainer.innerHTML = '';
    slideContainer.appendChild(img);

    // Update Text
    if (captionEl) captionEl.textContent = slideData.caption || slideData.title;
    if (descEl) {
      // Combine details if available
      let details = slideData.description || '';
      if (slideData.medium) details += ` | ${slideData.medium}`;
      if (slideData.dimensions) details += ` | ${slideData.dimensions}`;
      descEl.textContent = details;
    }
  }

  // 3. Setup Event Listeners
  function setupControls() {
    // Remove old listeners to prevent duplication (cloning method)
    const newPrev = prevBtn.cloneNode(true);
    const newNext = nextBtn.cloneNode(true);
    prevBtn.parentNode.replaceChild(newPrev, prevBtn);
    nextBtn.parentNode.replaceChild(newNext, nextBtn);

    newPrev.addEventListener('click', () => renderSlide(currentIndex - 1));
    newNext.addEventListener('click', () => renderSlide(currentIndex + 1));

    // Keyboard Navigation
    document.onkeydown = (e) => {
      if (document.body.classList.contains('slideshow-active')) {
        if (e.key === 'ArrowLeft') renderSlide(currentIndex - 1);
        if (e.key === 'ArrowRight') renderSlide(currentIndex + 1);
      }
    };
  }
}
