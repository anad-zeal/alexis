(function () {
  "use strict";

  const windowObj = window;
  const body = document.body;
  const header = document.getElementById("header");

  // Breakpoints.
  if (typeof breakpoints !== "undefined") {
    breakpoints({
      xxlarge: ["1681px", "1920px"],
      xlarge: ["1281px", "1680px"],
      large: ["1001px", "1280px"],
      medium: ["737px", "1000px"],
      small: ["481px", "736px"],
      xsmall: [null, "480px"],
    });
  }

  // Play initial animations on page load.
  windowObj.addEventListener("load", function () {
    setTimeout(function () {
      body.classList.remove("is-preload");
    }, 100);
  });

  // Touch mode.
  if (typeof browser !== "undefined" && browser.mobile) {
    body.classList.add("is-touch");
  } else if (typeof breakpoints !== "undefined") {
    breakpoints.on("<=small", function () {
      body.classList.add("is-touch");
    });

    breakpoints.on(">small", function () {
      body.classList.remove("is-touch");
    });
  }

  // Fix: IE flexbox fix.
  if (typeof browser !== "undefined" && browser.name === "ie") {
    const mainFullscreen = document.querySelectorAll(".main.fullscreen");
    let IEResizeTimeout;

    const ieFlexFix = function () {
      clearTimeout(IEResizeTimeout);
      IEResizeTimeout = setTimeout(function () {
        const wh = windowObj.innerHeight;

        mainFullscreen.forEach((el) => {
          el.style.height = ""; // Reset
          if (el.offsetHeight <= wh) {
            el.style.height = wh - 50 + "px";
          }
        });
      }, 100); // Added small delay to debounce
    };

    windowObj.addEventListener("resize", ieFlexFix);
    ieFlexFix(); // Trigger immediately
  }

  // Gallery.
  windowObj.addEventListener("load", function () {
    const gallerySelector = ".gallery";
    const galleries = document.querySelectorAll(gallerySelector);

    // Initialize Poptrox (Vanilla version)
    if (typeof Poptrox !== "undefined" && galleries.length > 0) {
      new Poptrox(gallerySelector, {
        baseZIndex: 10001,
        useBodyOverflow: false,
        usePopupEasyClose: false,
        overlayColor: "#1f2328",
        overlayOpacity: 0.65,
        usePopupDefaultStyling: false,
        usePopupCaption: true,
        popupLoaderText: "",
        windowMargin: 50,
        usePopupNav: true,
      });
    }

    // Hack: Adjust margins when 'small' activates.
    if (typeof breakpoints !== "undefined") {
      breakpoints.on(">small", function () {
        galleries.forEach((gallery) => {
          // Assumes Poptrox attached config to the element._poptrox property
          if (gallery._poptrox) gallery._poptrox.windowMargin = 50;
        });
      });

      breakpoints.on("<=small", function () {
        galleries.forEach((gallery) => {
          if (gallery._poptrox) gallery._poptrox.windowMargin = 5;
        });
      });
    }
  });

  // Section transitions (Replacement for Scrollex).
  // Uses IntersectionObserver for performance.
  if (typeof browser !== "undefined" && browser.canUse("transition")) {
    let observers = [];

    // Helper to create observers similar to Scrollex logic
    const createObserver = (selector, options) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) return;

      const observerOptions = {
        root: null,
        // Converting Scrollex "top/bottom" and "middle" logic to rootMargin
        // Scrollex 'middle' ~= threshold 0.5 roughly, or negative margins
        rootMargin: options.rootMargin || "-20% 0px -20% 0px",
        threshold: options.threshold || 0,
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (options.enter) options.enter(entry.target);
          } else {
            if (options.leave) options.leave(entry.target);
          }
        });
      }, observerOptions);

      elements.forEach((el) => {
        if (options.initialize) options.initialize(el);
        observer.observe(el);
      });

      observers.push({ observer, elements, terminate: options.terminate });
    };

    const on = function () {
      // Galleries.
      createObserver(".gallery", {
        rootMargin: "-30% 0px -30% 0px", // top: 30vh, bottom: 30vh
        initialize: (el) => el.classList.add("inactive"),
        terminate: (el) => el.classList.remove("inactive"),
        enter: (el) => el.classList.remove("inactive"),
        leave: (el) => el.classList.add("inactive"),
      });

      // Generic sections (style1).
      createObserver(".main.style1", {
        rootMargin: "0px 0px 0px 0px", // mode: middle (approx)
        threshold: 0.25,
        initialize: (el) => el.classList.add("inactive"),
        terminate: (el) => el.classList.remove("inactive"),
        enter: (el) => el.classList.remove("inactive"),
        leave: (el) => el.classList.add("inactive"),
      });

      // Generic sections (style2).
      createObserver(".main.style2", {
        rootMargin: "0px 0px 0px 0px",
        threshold: 0.25,
        initialize: (el) => el.classList.add("inactive"),
        terminate: (el) => el.classList.remove("inactive"),
        enter: (el) => el.classList.remove("inactive"),
        leave: (el) => el.classList.add("inactive"),
      });

      // Contact.
      createObserver("#contact", {
        rootMargin: "-40% 0px -40% 0px", // top: 50% (roughly)
        initialize: (el) => el.classList.add("inactive"),
        terminate: (el) => el.classList.remove("inactive"),
        enter: (el) => el.classList.remove("inactive"),
        leave: (el) => el.classList.add("inactive"),
      });
    };

    const off = function () {
      observers.forEach((item) => {
        item.observer.disconnect();
        if (item.terminate) {
          item.elements.forEach((el) => item.terminate(el));
        }
      });
      observers = [];
    };

    if (typeof breakpoints !== "undefined") {
      breakpoints.on("<=small", off);
      breakpoints.on(">small", on);
    } else {
      on(); // Default on if no breakpoints lib
    }
  }

  // Events.
  let resizeTimeout;

  const handleResize = function () {
    // Disable animations/transitions.
    body.classList.add("is-resizing");

    clearTimeout(resizeTimeout);

    resizeTimeout = setTimeout(function () {
      // Update scrolly links (Vanilla replacement)
      // Note: In vanilla, we don't strictly need to "update" listeners on resize
      // unless coordinates change dramatically, but we'll recalculate offsets dynamically on click.

      // Re-enable animations/transitions.
      setTimeout(function () {
        body.classList.remove("is-resizing");
        // Trigger scroll to ensure observers update
        windowObj.dispatchEvent(new Event("scroll"));
      }, 0);
    }, 100);
  };

  windowObj.addEventListener("resize", handleResize);

  // Initial Trigger
  windowObj.addEventListener("load", function () {
    windowObj.dispatchEvent(new Event("resize"));
  });

  // Scrolly Replacement (Smooth Scrolling)
  // Delegated listener for all anchor links starting with #
  document.addEventListener("click", function (e) {
    const anchor = e.target.closest('a[href^="#"]');
    if (anchor) {
      const href = anchor.getAttribute("href");
      if (href.length > 1) {
        // Ignore just "#"
        const targetEl = document.querySelector(href);
        if (targetEl) {
          e.preventDefault();

          // Header offset calculation
          const headerHeight = header ? header.offsetHeight : 0;
          const offset = headerHeight - 1;
          const elementPosition = targetEl.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - offset;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        }
      }
    }
  });
})();
