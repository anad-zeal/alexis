document.addEventListener('DOMContentLoaded', () => {
  // These elements are created by script.js before this script runs.
  const slideshow = document.querySelector('.slideshow');
  const caption = document.getElementById('caption-text');
  const prevBtn = document.getElementById('prev-slide');
  const nextBtn = document.getElementById('next-slide');

  // Exit if the necessary slideshow elements don't exist on the page.
  if (!slideshow) return;

  // --- THIS IS THE UPDATED DYNAMIC LOGIC ---
  const gallerySource = slideshow.dataset.gallerySource; // Reads "data-gallery-source" attribute
  if (!gallerySource) {
    console.error("Slideshow is missing a 'data-gallery-source' attribute!");
    return;
  }

  const fetchUrl = `/json-files/${gallerySource}`;
  // --- END OF UPDATE --

  let slides = [];
  let current = 0;
  let timer;
  let isPausedByHoverOrTouch = false;

  // This script fetches its OWN data for the images and captions.
  fetch('js/slides.json')
    .then((res) => res.json())
    .then((data) => {
      slides = data;
      createSlides();
      fadeInFirstSlide();
    })
    .catch((error) => console.error('Error loading slides.json:', error));

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
    slideshow.style.position = 'relative'; // Important for absolute positioning of slides
  }

  function fadeInFirstSlide() {
    const firstSlide = document.querySelector('.slide');
    if (!firstSlide) return;

    firstSlide.style.opacity = 0;
    setTimeout(() => {
      firstSlide.style.opacity = 1;
      caption.textContent = slides[0].caption;
      caption.style.transition = 'opacity 1.5s ease-in-out';
      caption.style.opacity = 0;
      setTimeout(() => {
        caption.style.opacity = 1;
      }, 300);
    }, 50);

    setTimeout(() => {
      startAutoPlay();
    }, 2000);
  }

  function showSlide(index) {
    const slidesDOM = document.querySelectorAll('.slide');
    caption.style.opacity = 0;
    setTimeout(() => {
      caption.textContent = slides[index].caption;
      caption.style.opacity = 1;
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
    clearInterval(timer); // Clear any existing timer
    timer = setInterval(nextSlide, 5000);
  }

  function pauseAutoPlay() {
    clearInterval(timer);
  }

  function resumeAutoPlay() {
    if (!isPausedByHoverOrTouch) {
      startAutoPlay();
    }
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
});
