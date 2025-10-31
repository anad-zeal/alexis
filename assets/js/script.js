const slideshow = document.querySelector('.slideshow');
const caption = document.getElementById('caption-text');
const description = document.getElementById('description-text');
const prevBtn = document.getElementById('prev-slide');
const nextBtn = document.getElementById('next-slide');

// --- State variables ---
let slides = [];
let current = 0;
let timer;
let isPausedByHoverOrTouch = false;

// --- Fetch JSON ---
fetch(fetchUrl)
  .then((res) => {
    if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
    return res.json();
  })
  .then((data) => {
    slides = data;
    if (!Array.isArray(slides) || !slides.length) {
      console.warn('⚠️ No slides found in JSON.', slides);
      return;
    }
    createSlides();
    fadeInFirstSlide();
  })
  .catch((error) => console.error(`[Slideshow] Error loading ${fetchUrl}:`, error));

// --- Create slide DOM elements ---
function createSlides() {
  slides.forEach(({ src }) => {
    const img = document.createElement('img');
    img.src = src;
    img.className = 'slide';
    Object.assign(img.style, {
      opacity: 0,
      transition: 'opacity 1.5s ease-in-out',
      position: 'absolute',
      maxWidth: '100%',
      maxHeight: '100%',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      margin: 'auto',
    });
    slideshow.appendChild(img);
  });
}

// --- Initial fade-in ---
function fadeInFirstSlide() {
  const firstSlide = document.querySelector('.slide');
  if (!firstSlide) return;

  setTimeout(() => {
    firstSlide.style.opacity = 1;
    caption.textContent = slides[0].caption || '';
    description.textContent = slides[0].description || '';
    caption.style.transition = 'opacity 1.5s ease-in-out';
    description.style.transition = 'opacity 1.5s ease-in-out';
    caption.style.opacity = 0;
    description.style.opacity = 0;

    setTimeout(() => {
      caption.style.opacity = 1;
      description.style.opacity = 1;
    }, 300);
  }, 50);

  setTimeout(startAutoPlay, 2000);
}

// --- Show specific slide ---
function showSlide(index) {
  const slidesDOM = document.querySelectorAll('.slide');
  if (!slidesDOM.length || index < 0 || index >= slides.length) return;

  caption.style.opacity = 0;
  description.style.opacity = 0;
  setTimeout(() => {
    caption.textContent = slides[index].caption || '';
    description.textContent = slides[index].description || '';
    caption.style.opacity = 1;
    description.style.opacity = 1;
  }, 300);

  slidesDOM.forEach((img, i) => {
    img.style.opacity = i === index ? 1 : 0;
  });

  current = index;
}

// --- Navigation ---
function nextSlide() {
  showSlide((current + 1) % slides.length);
}

function prevSlideFunc() {
  showSlide((current - 1 + slides.length) % slides.length);
}

// --- Autoplay controls ---
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
