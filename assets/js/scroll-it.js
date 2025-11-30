/* scroll-it.js v1.0*/

(function () {
  "use strict";

  /**
   * Calculate the target scroll position based on anchor and offset.
   */
  function getTargetPosition(selector, options) {
    const element = document.querySelector(selector);
    if (!element) return null;

    const rect = element.getBoundingClientRect();
    const elementTop = rect.top + window.scrollY;
    let target;

    switch (options.anchor) {
      case "middle":
        target = elementTop - (window.innerHeight - element.offsetHeight) / 2;
        break;
      default:
      case "top":
        target = Math.max(elementTop, 0);
    }

    // Apply offset (can be number or function)
    if (typeof options.offset === "function") {
      target -= options.offset();
    } else {
      target -= options.offset;
    }

    return target;
  }

  /**
   * Smooth scroll animation with custom speed and easing.
   */
  function smoothScrollTo(target, speed, easing) {
    const start = window.scrollY || document.documentElement.scrollTop;
    const distance = target - start;
    const startTime = performance.now();

    function ease(t) {
      // Simple easing function (swing-like)
      return easing === "swing" ? 0.5 - Math.cos(t * Math.PI) / 2 : t;
    }

    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / speed, 1);
      const eased = ease(progress);

      window.scrollTo(0, start + distance * eased);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }

  /**
   * Initialize scrolly on one or more elements.
   * @param {HTMLElement|NodeList|string} elements - The elements to bind.
   * @param {Object} options - Config options.
   */
  function scrolly(elements, options = {}) {
    // Handle selector string or NodeList
    if (typeof elements === "string") {
      elements = document.querySelectorAll(elements);
    }
    if (elements instanceof NodeList || Array.isArray(elements)) {
      elements.forEach((el) => scrolly(el, options));
      return;
    }

    // Validate single element
    if (!elements || !(elements instanceof HTMLElement)) return;

    const href = elements.getAttribute("href");
    if (!href || href.charAt(0) !== "#" || href.length < 2) return;

    // Merge options
    const opts = Object.assign(
      {
        anchor: "top",
        easing: "swing",
        offset: 0,
        pollOnce: false,
        speed: 1000,
      },
      options,
    );

    // Cache target if requested
    let cachedTarget = null;
    if (opts.pollOnce) {
      cachedTarget = getTargetPosition(href, opts);
    }

    // Bind Click
    elements.addEventListener("click", function (event) {
      const target =
        cachedTarget !== null ? cachedTarget : getTargetPosition(href, opts);

      if (target !== null) {
        event.preventDefault();
        smoothScrollTo(target, opts.speed, opts.easing);
      }
    });
  }

  // Expose globally
  window.scrolly = scrolly;
})();
