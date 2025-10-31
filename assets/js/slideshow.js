document.addEventListener('DOMContentLoaded', () => {
  const log = (msg, ...args) => {
    const time = new Date().toISOString().split('T')[1].replace('Z', '');
    console.log(`[Slideshow @${time}] ${msg}`, ...args);
  };

  // These elements are created by script.js before this script runs.
  const slideshow = document.querySelector('.slideshow');
  const caption = document.getElementById('caption-text');
  const prevBtn = document.getElementById('prev-slide');
  const nextBtn = document.getElementById('next-slide');

  // Exit if the necessary slideshow elements don't exist on the page.
  if (!slideshow || !caption || !prevBtn || !nextBtn) {
    console.warn('[Slideshow] Required DOM elements missing:', {
      slideshow: !!slideshow,
      caption: !!caption,
      prevBtn: !!prevBtn,
      nextBtn: !!nextBtn,
    });
    return;
  }

  // --- DYNAMIC LOGIC ---
  const gallerySource = slideshow.dataset.gallerySource;
  if (!gallerySource) {
    console.error("Slideshow is missing a 'data-gallery-source' attribute!");
    return;
  }

  const fetchUrl = `/json-files/${gallerySource}`;
  log(`Initializing slideshow from ${fetchUrl}`);

  // --- State variables ---
  let slides = [];
  let current = 0;
  let timer;
  let isPausedByHoverOrTouch = false;

  // --- Fetch JSON ---
  fetch(fetchUrl)
    .then((res) => {
      log('Fetching JSON data...');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then((data) => {
      slides = data;
      if (!Array.isArray(slides) || !slides.length) {
        log('⚠️ No slides found in JSON.', slides);
        return;
      }
      log(`Loaded ${slides.length} slides.`);
      createSlides();
      fadeInFirstSlide();
    })
    .catch((error) => console.error(`[Slideshow] Error loading ${fetchUrl}:`, error));

  // --- Create slide DOM elements ---
  function createSlides() {
    log('Creating slide <img> elements...');
    slides.forEach(({ src }, i) => {
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
      img.addEventListener('load', () => log(`Image loaded [${i + 1}/${slides.length}]: ${src}`));
      img.addEventListener('error', () => console.error(`❌ Failed to load image: ${src}`));
    });
    slideshow.style.position = 'relative';
  }

  // --- Initial fade-in ---
  function fadeInFirstSlide() {
    const firstSlide = document.querySelector('.slide');
    if (!firstSlide) {
      log('No first slide found to fade in.');
      return;
    }

    log('Fading in first slide...');
    firstSlide.style.opacity = 0;
    setTimeout(() => {
      firstSlide.style.opacity = 1;
      caption.textContent = slides[0].caption || '';
      caption.style.transition = 'opacity 1.5s ease-in-out';
      caption.style.opacity = 0;
      setTimeout(() => {
        caption.style.opacity = 1;
        log('Caption displayed for first slide.');
      }, 300);
    }, 50);

    setTimeout(() => {
      startAutoPlay();
    }, 2000);
  }

  // --- Show specific slide ---
  function showSlide(index) {
    const slidesDOM = document.querySelectorAll('.slide');
    if (!slidesDOM.length) return;
    if (index < 0 || index >= slides.length) {
      console.warn('Slide index out of range:', index);
      return;
    }

    log(`Displaying slide ${index + 1}/${slides.length}`);
    caption.style.opacity = 0;
    setTimeout(() => {
      caption.textContent = slides[index].caption || '';
      caption.style.opacity = 1;
      log(`Caption updated: "${caption.textContent}"`);
    }, 300);

    slidesDOM.forEach((img, i) => {
      img.style.opacity = i === index ? 1 : 0;
    });

    current = index;
  }

  // --- Navigation ---
  function nextSlide() {
    const nextIndex = (current + 1) % slides.length;
    log(`Next slide triggered. Moving to index ${nextIndex}`);
    showSlide(nextIndex);
  }

  function prevSlideFunc() {
    const prevIndex = (current - 1 + slides.length) % slides.length;
    log(`Previous slide triggered. Moving to index ${prevIndex}`);
    showSlide(prevIndex);
  }

  // --- Autoplay controls ---
  function startAutoPlay() {
    clearInterval(timer);
    timer = setInterval(nextSlide, 5000);
    log('Autoplay started (5s interval).');
  }

  function pauseAutoPlay() {
    clearInterval(timer);
    log('Autoplay paused.');
  }

  function resumeAutoPlay() {
    if (!isPausedByHoverOrTouch) {
      startAutoPlay();
      log('Autoplay resumed.');
    }
  }

  function resetAutoPlay() {
    pauseAutoPlay();
    resumeAutoPlay();
    log('Autoplay reset.');
  }

  // --- Button events ---
  nextBtn.addEventListener('click', () => {
    log('➡️ Next button clicked.');
    nextSlide();
    resetAutoPlay();
  });

  prevBtn.addEventListener('click', () => {
    log('⬅️ Previous button clicked.');
    prevSlideFunc();
    resetAutoPlay();
  });

  // --- Hover & touch controls ---
  slideshow.addEventListener('mouseenter', () => {
    log('🖱️ Mouse entered slideshow (pause).');
    isPausedByHoverOrTouch = true;
    pauseAutoPlay();
  });

  slideshow.addEventListener('mouseleave', () => {
    log('🖱️ Mouse left slideshow (resume).');
    isPausedByHoverOrTouch = false;
    resumeAutoPlay();
  });

  slideshow.addEventListener(
    'touchstart',
    () => {
      log('📱 Touch start (pause).');
      isPausedByHoverOrTouch = true;
      pauseAutoPlay();
    },
    { passive: true }
  );

  slideshow.addEventListener(
    'touchend',
    () => {
      log('📱 Touch end (resume).');
      isPausedByHoverOrTouch = false;
      resumeAutoPlay();
    },
    { passive: true }
  );
});
