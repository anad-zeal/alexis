/*
  This script is the "brain" of the slideshow component.
  It runs AFTER script.js has built the HTML frame.
  Its job is to find that frame, fetch the image data,
  and handle all the user interaction (next, prev, autoplay).
*/

// --- 1. Find the necessary HTML elements on the page ---
const slideshow = document.querySelector('.slideshow');
const caption = document.getElementById('caption-text');
const description = document.getElementById('description-text');
const prevBtn = document.getElementById('prev-slide');
const nextBtn = document.getElementById('next-slide');

// --- 2. Safety Check (Guard Clause) ---
// If any of these elements were not created correctly, stop the script.
if (!slideshow || !caption || !description || !prevBtn || !nextBtn) {
  console.warn('[Slideshow] Required DOM elements are missing. Halting script.');
}

// --- 3. Get the data source from the HTML attribute ---
const gallerySource = slideshow.dataset.gallerySource;
if (!gallerySource) {
  console.error("Slideshow is missing a 'data-gallery-source' attribute!");
  return;
}

const fetchUrl = `/json-files/${gallerySource}`;

// --- 4. Initialize State Variables ---
let slides = [];
let current = 0;
let timer;
let isPausedByHoverOrTouch = false;

// --- 5. Fetch the slide data and start the show ---
fetch(fetchUrl)
  .then((res) => {
    if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
    return res.json();
  })
  .then((data) => {
    slides = data;
    // Another safety check: if the JSON is empty or not an array, do nothing.
    if (!Array.isArray(slides) || !slides.length) {
      console.warn('⚠️ No slides found in the JSON data file.');
      return;
    }
    createSlides();
    fadeInFirstSlide();
  })
  .catch((error) => console.error(`[Slideshow] Error loading ${fetchUrl}:`, error));

// --- Helper Functions for the Slideshow ---

function createSlides() {
  slides.forEach(({ src }) => {
    const img = document.createElement('img');
    img.src = src;
    img.className = 'slide';
    // The styles for opacity and transition are handled here in JS
    Object.assign(img.style, {
      opacity: 0,
      transition: 'opacity 1.5s ease-in-out',
    });
    slideshow.appendChild(img);
  });
}

function fadeInFirstSlide() {
  const firstSlide = document.querySelector('.slide');
  if (!firstSlide) return;

  // Use a short timeout to ensure the transition fires correctly
  setTimeout(() => {
    firstSlide.style.opacity = 1;
    caption.textContent = slides[0].caption || '';
    description.textContent = slides[0].description || '';
  }, 50);

  setTimeout(startAutoPlay, 2000); // Start autoplay after the initial fade
}

function showSlide(index) {
  const slidesDOM = document.querySelectorAll('.slide');
  if (!slidesDOM.length || index < 0 || index >= slides.length) return;

  // Fade out all slides
  slidesDOM.forEach((img) => {
    img.style.opacity = 0;
  });

  // Fade in the target slide
  slidesDOM[index].style.opacity = 1;

  // Update text
  caption.textContent = slides[index].caption || '';
  description.textContent = slides[index].description || '';

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

// --- Event Listeners ---
nextBtn.addEventListener('click', () => {
  nextSlide();
  resetAutoPlay();
});
prevBtn.addEventListener('click', () => {
  prevSlideFunc();
  resetAutoPlay();
});
slideshow.addEventListener('mouseenter', () => {
  isPausedByHoverOrTouch = true;
  pauseAutoPlay();
});
slideshow.addEventListener('mouseleave', () => {
  isPausedByHoverOrTouch = false;
  resumeAutoPlay();
});
slideshow.addEventListener(
  'touchstart',
  () => {
    isPausedByHoverOrTouch = true;
    pauseAutoPlay();
  },
  { passive: true }
);
slideshow.addEventListener(
  'touchend',
  () => {
    isPausedByHoverOrTouch = false;
    resumeAutoPlay();
  },
  { passive: true }
);
