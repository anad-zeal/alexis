(function () {
  "use strict";

  // Helper: Handle multiple elements (jQuery-like behavior)
  function select(selector) {
    if (typeof selector === "string") {
      return document.querySelectorAll(selector);
    }
    if (selector instanceof NodeList || Array.isArray(selector)) {
      return selector;
    }
    return [selector];
  }

  // Helper: Count parents for indentation
  function countParents(element, tag) {
    let count = 0;
    let parent = element.parentElement;
    while (parent) {
      if (parent.tagName.toLowerCase() === tag.toLowerCase()) {
        count++;
      }
      parent = parent.parentElement;
    }
    return count;
  }

  // Helper: Object Deep Merge (simplified for config)
  function extend(defaults, options) {
    return Object.assign({}, defaults, options);
  }

  /**
   * NavList: Generate an indented list of links.
   * Usage: const html = navList(document.querySelector('#nav'));
   * @param {HTMLElement} element
   * @return {String} HTML string
   */
  function navList(element) {
    const links = element.querySelectorAll("a");
    const b = [];

    links.forEach((a) => {
      const indent = Math.max(0, countParents(a, "li") - 1);
      const href = a.getAttribute("href");
      const target = a.getAttribute("target");

      b.push(
        "<a " +
          'class="link depth-' +
          indent +
          '"' +
          (target && target !== "" ? ' target="' + target + '"' : "") +
          (href && href !== "" ? ' href="' + href + '"' : "") +
          ">" +
          '<span class="indent-' +
          indent +
          '"></span>' +
          a.textContent +
          "</a>",
      );
    });

    return b.join("");
  }

  /**
   * Panel: Panel-ify an element.
   * Usage: panel(document.getElementById('myPanel'), { side: 'right' });
   * @param {HTMLElement|String} selector
   * @param {Object} userConfig
   */
  function panel(selector, userConfig) {
    const elements = select(selector);

    elements.forEach((element) => {
      const body = document.body;
      const id = element.getAttribute("id");

      // Config
      const config = extend(
        {
          delay: 0,
          hideOnClick: false,
          hideOnEscape: false,
          hideOnSwipe: false,
          resetScroll: false,
          resetForms: false,
          side: null,
          target: element,
          visibleClass: "visible",
        },
        userConfig,
      );

      // Expand "target" if it is a string selector
      if (typeof config.target === "string") {
        config.target = document.querySelector(config.target);
      }

      // Methods
      const hide = (event) => {
        // Already hidden? Bail.
        if (!config.target.classList.contains(config.visibleClass)) return;

        // If an event was provided, cancel it.
        if (event) {
          event.preventDefault();
          event.stopPropagation();
        }

        // Hide.
        config.target.classList.remove(config.visibleClass);

        // Post-hide stuff.
        window.setTimeout(() => {
          // Reset scroll position.
          if (config.resetScroll) element.scrollTop = 0;

          // Reset forms.
          if (config.resetForms) {
            const forms = element.querySelectorAll("form");
            forms.forEach((f) => f.reset());
          }
        }, config.delay);
      };

      // Vendor fixes
      element.style.msOverflowStyle = "-ms-autohiding-scrollbar";
      element.style.webkitOverflowScrolling = "touch";

      // Hide on click
      if (config.hideOnClick) {
        const links = element.querySelectorAll("a");
        links.forEach(
          (a) => (a.style.webkitTapHighlightColor = "rgba(0,0,0,0)"),
        );

        // Event Delegation for 'a' clicks
        element.addEventListener("click", (event) => {
          const a = event.target.closest("a");
          if (!a || !element.contains(a)) return;

          const href = a.getAttribute("href");
          const target = a.getAttribute("target");

          if (!href || href === "#" || href === "" || href === "#" + id) return;

          // Cancel original event.
          event.preventDefault();
          event.stopPropagation();

          // Hide panel.
          hide();

          // Redirect to href.
          window.setTimeout(() => {
            if (target === "_blank") {
              window.open(href);
            } else {
              window.location.href = href;
            }
          }, config.delay + 10);
        });
      }

      // Event: Touch stuff
      let touchPosX = null;
      let touchPosY = null;

      element.addEventListener(
        "touchstart",
        (event) => {
          touchPosX = event.touches[0].pageX;
          touchPosY = event.touches[0].pageY;
        },
        { passive: false },
      );

      element.addEventListener(
        "touchmove",
        (event) => {
          if (touchPosX === null || touchPosY === null) return;

          const diffX = touchPosX - event.touches[0].pageX;
          const diffY = touchPosY - event.touches[0].pageY;
          const th = element.offsetHeight;
          const ts = element.scrollHeight - element.scrollTop;

          // Hide on swipe?
          if (config.hideOnSwipe) {
            let result = false;
            const boundary = 20;
            const delta = 50;

            switch (config.side) {
              case "left":
                result =
                  diffY < boundary && diffY > -1 * boundary && diffX > delta;
                break;
              case "right":
                result =
                  diffY < boundary &&
                  diffY > -1 * boundary &&
                  diffX < -1 * delta;
                break;
              case "top":
                result =
                  diffX < boundary && diffX > -1 * boundary && diffY > delta;
                break;
              case "bottom":
                result =
                  diffX < boundary &&
                  diffX > -1 * boundary &&
                  diffY < -1 * delta;
                break;
              default:
                break;
            }

            if (result) {
              touchPosX = null;
              touchPosY = null;
              hide();
              return false;
            }
          }

          // Prevent vertical scrolling past the top or bottom.
          if (
            (element.scrollTop < 0 && diffY < 0) ||
            (ts > th - 2 && ts < th + 2 && diffY > 0)
          ) {
            event.preventDefault();
            event.stopPropagation();
          }
        },
        { passive: false },
      );

      // Event: Prevent certain events inside the panel from bubbling.
      ["click", "touchend", "touchstart", "touchmove"].forEach((evt) => {
        element.addEventListener(evt, (event) => {
          event.stopPropagation();
        });
      });

      // Event: Hide panel if a child anchor tag pointing to its ID is clicked.
      const internalLinks = element.querySelectorAll('a[href="#' + id + '"]');
      internalLinks.forEach((link) => {
        link.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          config.target.classList.remove(config.visibleClass);
        });
      });

      // Body Events

      // Hide panel on body click/tap
      const bodyClickHandler = (event) => {
        hide(event);
      };
      body.addEventListener("click", bodyClickHandler);
      body.addEventListener("touchend", bodyClickHandler);

      // Toggle
      // Note: We need to attach this to body to catch links anywhere
      body.addEventListener("click", (event) => {
        const toggleLink = event.target.closest('a[href="#' + id + '"]');
        if (toggleLink) {
          event.preventDefault();
          event.stopPropagation();
          config.target.classList.toggle(config.visibleClass);
        }
      });

      // Window Event: Hide on ESC
      if (config.hideOnEscape) {
        window.addEventListener("keydown", (event) => {
          if (event.keyCode === 27) hide(event);
        });
      }
    });
  }

  /**
   * Placeholder: Polyfill for placeholder attribute.
   * Note: This is largely obsolete in modern browsers, but included for logic translation.
   * Usage: placeholder(document.querySelectorAll('input'));
   */
  function placeholder(selector) {
    // Browser natively supports placeholders? Bail.
    if (typeof document.createElement("input").placeholder !== "undefined")
      return;

    const elements = select(selector);

    elements.forEach((wrapper) => {
      // Text, TextArea
      const textInputs = wrapper.querySelectorAll("input[type=text], textarea");
      textInputs.forEach((i) => {
        if (i.value === "" || i.value === i.getAttribute("placeholder")) {
          i.classList.add("polyfill-placeholder");
          i.value = i.getAttribute("placeholder");
        }

        i.addEventListener("blur", () => {
          if (i.name.match(/-polyfill-field$/)) return;
          if (i.value === "") {
            i.classList.add("polyfill-placeholder");
            i.value = i.getAttribute("placeholder");
          }
        });

        i.addEventListener("focus", () => {
          if (i.name.match(/-polyfill-field$/)) return;
          if (i.value === i.getAttribute("placeholder")) {
            i.classList.remove("polyfill-placeholder");
            i.value = "";
          }
        });
      });

      // Password
      const passwordInputs = wrapper.querySelectorAll("input[type=password]");
      passwordInputs.forEach((i) => {
        const x = i.cloneNode(true);
        x.type = "text"; // Make it text to show placeholder

        if (i.id) x.id = i.id + "-polyfill-field";
        if (i.name) x.name = i.name + "-polyfill-field";

        x.classList.add("polyfill-placeholder");
        x.value = x.getAttribute("placeholder");

        i.parentNode.insertBefore(x, i.nextSibling);

        if (i.value === "") {
          i.style.display = "none";
        } else {
          x.style.display = "none";
        }

        i.addEventListener("blur", (event) => {
          event.preventDefault();
          // const x = i.parent().find... equivalent:
          // We know x is next sibling based on insertion above, but let's find by name to be safe
          const relatedX = i.parentNode.querySelector(
            'input[name="' + i.name + '-polyfill-field"]',
          );
          if (i.value === "") {
            i.style.display = "none";
            if (relatedX) relatedX.style.display = ""; // default display
          }
        });

        x.addEventListener("focus", (event) => {
          event.preventDefault();
          const relatedI = x.parentNode.querySelector(
            'input[name="' + x.name.replace("-polyfill-field", "") + '"]',
          );

          x.style.display = "none";
          if (relatedI) {
            relatedI.style.display = "";
            relatedI.focus();
          }
        });

        x.addEventListener("keypress", (event) => {
          event.preventDefault();
          x.value = "";
        });
      });

      // Form Events
      wrapper.addEventListener("submit", () => {
        wrapper
          .querySelectorAll("input[type=text], input[type=password], textarea")
          .forEach((i) => {
            if (i.name.match(/-polyfill-field$/)) i.name = "";
            if (i.value === i.getAttribute("placeholder")) {
              i.classList.remove("polyfill-placeholder");
              i.value = "";
            }
          });
      });

      wrapper.addEventListener("reset", (event) => {
        event.preventDefault();

        const selectFirst = wrapper.querySelector("select option");
        if (selectFirst) selectFirst.parentElement.value = selectFirst.value;

        wrapper.querySelectorAll("input, textarea").forEach((i) => {
          i.classList.remove("polyfill-placeholder");

          // Logic to reset to defaultValue
          // (Simplified translation of logic)
          switch (i.type) {
            case "submit":
            case "reset":
              break;
            case "password":
              i.value = i.defaultValue;
              const x = i.parentNode.querySelector(
                'input[name="' + i.name + '-polyfill-field"]',
              );
              if (i.value === "") {
                i.style.display = "none";
                if (x) x.style.display = "";
              } else {
                i.style.display = "";
                if (x) x.style.display = "none";
              }
              break;
            case "checkbox":
            case "radio":
              i.checked = i.defaultChecked;
              break;
            case "text":
            case "textarea":
              i.value = i.defaultValue;
              if (i.value === "") {
                i.classList.add("polyfill-placeholder");
                i.value = i.getAttribute("placeholder");
              }
              break;
          }
        });
      });
    });
  }

  /**
   * Prioritize: Moves elements to/from the first positions of their respective parents.
   * Usage: prioritize('.my-elements', true);
   * @param {HTMLElement|String} selector
   * @param {Boolean} condition
   */
  function prioritize(selector, condition) {
    const key = "__prioritize";
    const elements = select(selector);

    elements.forEach((e) => {
      const parent = e.parentElement;
      if (!parent) return;

      // Check if we have moved it using a custom property on the DOM node
      const movedReference = e[key];

      if (!movedReference) {
        // Not moved
        if (!condition) return;

        // Get placeholder (previous element)
        const p = e.previousElementSibling;

        // If no previous element, it's already at top
        if (!p) return;

        // Move to top
        parent.prepend(e);

        // Mark as moved, store reference to the element it used to be after
        e[key] = p;
      } else {
        // Moved already
        if (condition) return;

        const p = e[key];

        // Move back: insert after the stored placeholder
        if (p && p.parentNode === parent) {
          parent.insertBefore(e, p.nextSibling);
        } else {
          // Fallback if placeholder is gone? Append to end or handle error
          // For strict fidelity to original, we just assume p exists
          parent.appendChild(e);
        }

        // Unmark
        delete e[key];
      }
    });
  }

  // Expose to window/global scope if needed, or export as module
  window.navList = navList;
  window.panel = panel;
  window.placeholder = placeholder;
  window.prioritize = prioritize;
})();
