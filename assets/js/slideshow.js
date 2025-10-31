// In /assets/js/slideshow.js (Complete File)

const slideshow = document.querySelector('.slideshow');
const caption = document.getElementById('caption-text');
const description = document.getElementById('description-text'); // Looks for the ID
const prevBtn = document.getElementById('prev-slide');
const nextBtn = document.getElementById('next-slide');

if (!slideshow || !caption || !description || !prevBtn || !nextBtn) {
  console.warn('[Slideshow] Required DOM elements missing. Halting script.', {
    slideshow: !!slideshow,
    caption: !!caption,
    description: !!description,
    prevBtn: !!prevBtn,
    nextBtn: !!nextBtn,
  };
}

const gallerySource = slideshow.dataset.gallerySource;
if (!gallerySource) {
  console.error("Slideshow is missing a 'data-gallery-source' attribute!");
  return;
}

const fetchUrl = `/json-files/${gallerySource}`;
let slides = [],
  current = 0,
  timer,
  isPausedByHoverOrTouch = false;

fetch(fetchUrl)
  .then((res) => {
    if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
    return res.json();
  })
  .then((data) => {
    slides = data;
    if (!Array.isArray(slides) || !slides.length) return;
    createSlides();
    fadeInFirstSlide();
  })
  .catch((error) => console.error(`[Slideshow] Error loading ${fetchUrl}:`, error));

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
