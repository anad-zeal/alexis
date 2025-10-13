document.addEventListener("DOMContentLoaded", () => {
  const slideshow = document.querySelector(".slideshow");
  const caption = document.getElementById("caption-text");
  const prevBtn = document.getElementById("prev-slide");
  const nextBtn = document.getElementById("next-slide");

  let slides = [], current = 0, timer;
  let isPausedByHoverOrTouch = false;

  // Load slides from JSON
  fetch("js/slides.json")
    .then(res => res.json())
    .then(data => {
      slides = data;w
      createSlides();
      fadeInFirstSlide();
    });

  function createSlides() {
    slides.forEach(({ src }, index) => {
      const img = document.createElement("img");
      img.src = src;
      img.className = "slide";
      Object.assign(img.style, {
        opacity: 0,
        transition: "opacity 1.5s ease-in-out",
        position: "absolute",
        maxWidth: "100%",
        maxHeight: "100%",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        margin: "auto"
      });
      slideshow.appendChild(img);
    });
    slideshow.style.position = "relative";
  }

  function fadeInFirstSlide() {
  const firstSlide = document.querySelectorAll(".slide")[0];

  // Ensure it starts at opacity 0 and transition is set
  firstSlide.style.opacity = 0;
  firstSlide.style.transition = "opacity 2s ease-in-out";

  // Apply visibility after a tiny delay to allow transition to kick in
  setTimeout(() => {
    firstSlide.style.opacity = 1;
    caption.textContent = slides[0].caption;
    caption.style.transition = "opacity 1.5s ease-in-out";
    caption.style.opacity = 0;

    setTimeout(() => {
      caption.style.opacity = 1;
    }, 300);
  }, 50); // slight delay for reliable transition

  // Start autoplay after the fade
  setTimeout(() => {
    showSlide(0); // sync caption logic
    startAutoPlay();
  }, 2000);
}

  function showSlide(index) {
    const slidesDOM = document.querySelectorAll(".slide");

    // Fade out caption
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

  slideshow.addEventListener("touchstart", () => {
    isPausedByHoverOrTouch = true;
    pauseAutoPlay();
  }, { passive: true });

  slideshow.addEventListener("touchend", () => {
    isPausedByHoverOrTouch = false;
    resumeAutoPlay();
  }, { passive: true });
});