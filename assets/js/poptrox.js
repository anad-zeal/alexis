/**
 * poptrox.js
 * Vanilla JS port of jquery.poptrox.js v2.5.2-dev
 * Original: (c) @ajlkn | github.com/ajlkn/jquery.poptrox | MIT licensed
 *
 * Converted to Vanilla JS by AI.
 */

(function (window) {
  'use strict';

  // Helper: Cross-browser "disable selection"
  function disableSelection(element) {
    element.style.userSelect = 'none';
    element.style.webkitUserSelect = 'none';
    element.style.mozUserSelect = 'none';
    element.style.msUserSelect = 'none';
  }

  // Helper: Extend objects (similar to $.extend)
  function extend(defaults, options) {
    return Object.assign({}, defaults, options);
  }

  // Main Class
  window.Poptrox = function (selector, options) {
    // Handle multiple elements if selector targets a NodeList
    const elements =
      typeof selector === 'string'
        ? document.querySelectorAll(selector)
        : selector.length
        ? selector
        : [selector];

    if (elements.length === 0) return;

    // Default Settings
    const settings = extend(
      {
        preload: false,
        baseZIndex: 1000,
        fadeSpeed: 300,
        overlayColor: '#000000',
        overlayOpacity: 0.6,
        overlayClass: 'poptrox-overlay',
        windowMargin: 50,
        windowHeightPad: 0,
        selector: 'a',
        caption: null,
        parent: 'body',
        popupSpeed: 300,
        popupWidth: 200,
        popupHeight: 100,
        popupIsFixed: false,
        useBodyOverflow: false,
        usePopupEasyClose: true,
        usePopupForceClose: false,
        usePopupLoader: true,
        usePopupCloser: true,
        usePopupCaption: false,
        usePopupNav: false,
        usePopupDefaultStyling: true,
        popupBackgroundColor: '#FFFFFF',
        popupTextColor: '#000000',
        popupLoaderTextSize: '2em',
        popupCloserBackgroundColor: '#000000',
        popupCloserTextColor: '#FFFFFF',
        popupCloserTextSize: '20px',
        popupPadding: 10,
        popupCaptionHeight: 60,
        popupCaptionTextSize: null,
        popupBlankCaptionText: '(untitled)',
        popupCloserText: '&#215;',
        popupLoaderText: '&bull;&bull;&bull;&bull;',
        popupClass: 'poptrox-popup',
        popupSelector: null,
        popupLoaderSelector: '.loader',
        popupCloserSelector: '.closer',
        popupCaptionSelector: '.caption',
        popupNavPreviousSelector: '.nav-previous',
        popupNavNextSelector: '.nav-next',
        onPopupClose: null,
        onPopupOpen: null,
      },
      options
    );

    // Variables
    const body = document.querySelector('body');
    const queue = [];
    let currentItemIndex = 0;
    let isLocked = false;
    let windowWidth = window.innerWidth;
    let windowHeight = window.innerHeight + settings.windowHeightPad;

    // Containers
    let overlay, popup, pic, loader, caption, closer, navNext, navPrev;

    // --- 1. Build DOM Structure ---

    // Overlay
    overlay = document.createElement('div');
    overlay.className = settings.overlayClass;
    overlay.style.position = 'fixed';
    overlay.style.left = '0';
    overlay.style.top = '0';
    overlay.style.zIndex = settings.baseZIndex;
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.textAlign = 'center';
    overlay.style.cursor = 'pointer';
    overlay.style.display = 'none'; // hidden initially
    overlay.style.opacity = '0';
    overlay.style.transition = `opacity ${settings.fadeSpeed}ms`;

    // Inner vertical alignment helper
    const overlayVerticalAlign = document.createElement('div');
    overlayVerticalAlign.style.display = 'inline-block';
    overlayVerticalAlign.style.height = '100%';
    overlayVerticalAlign.style.verticalAlign = 'middle';
    overlay.appendChild(overlayVerticalAlign);

    // Background color layer (to handle opacity distinct from content)
    const overlayBg = document.createElement('div');
    overlayBg.style.position = 'absolute';
    overlayBg.style.left = '0';
    overlayBg.style.top = '0';
    overlayBg.style.width = '100%';
    overlayBg.style.height = '100%';
    overlayBg.style.backgroundColor = settings.overlayColor;
    overlayBg.style.opacity = settings.overlayOpacity;
    overlay.appendChild(overlayBg);

    // Popup Container
    if (settings.popupSelector) {
      popup = document.querySelector(settings.popupSelector);
    } else {
      popup = document.createElement('div');
      popup.className = settings.popupClass;
      popup.innerHTML = `
                ${
                  settings.usePopupLoader
                    ? `<div class="loader">${settings.popupLoaderText}</div>`
                    : ''
                }
                <div class="pic"></div>
                ${settings.usePopupCaption ? `<div class="caption"></div>` : ''}
                ${
                  settings.usePopupCloser
                    ? `<span class="closer">${settings.popupCloserText}</span>`
                    : ''
                }
                ${
                  settings.usePopupNav
                    ? `<div class="nav-previous"></div><div class="nav-next"></div>`
                    : ''
                }
            `;
    }

    // Append Popup to Overlay
    overlay.appendChild(popup);
    document.querySelector(settings.parent).appendChild(overlay);

    // Select Internal Elements
    pic = popup.querySelector('.pic');
    loader = popup.querySelector(settings.popupLoaderSelector);
    caption = popup.querySelector(settings.popupCaptionSelector);
    closer = popup.querySelector(settings.popupCloserSelector);
    navNext = popup.querySelector(settings.popupNavNextSelector);
    navPrev = popup.querySelector(settings.popupNavPreviousSelector);

    // --- 2. Styling ---

    popup.style.display = 'none';
    popup.style.verticalAlign = 'middle';
    popup.style.position = 'relative';
    popup.style.zIndex = '1';
    popup.style.cursor = 'auto';
    popup.style.transition = `width ${settings.popupSpeed}ms, height ${settings.popupSpeed}ms`;

    if (settings.usePopupDefaultStyling) {
      popup.style.background = settings.popupBackgroundColor;
      popup.style.color = settings.popupTextColor;
      popup.style.padding = settings.popupPadding + 'px';

      if (caption) {
        popup.style.paddingBottom = settings.popupCaptionHeight + 'px';
        caption.style.position = 'absolute';
        caption.style.left = '0';
        caption.style.to = '0';
        caption.style.width = '100%';
        caption.style.textAlign = 'center';
        caption.style.height = settings.popupCaptionHeight + 'px';
        caption.style.lineHeight = settings.popupCaptionHeight + 'px';
        if (settings.popupCaptionTextSize) caption.style.fontSize = settings.popupCaptionTextSize;
      }

      if (closer) {
        closer.style.fontSize = settings.popupCloserTextSize;
        closer.style.background = settings.popupCloserBackgroundColor;
        closer.style.color = settings.popupCloserTextColor;
        closer.style.display = 'block';
        closer.style.width = '40px';
        closer.style.height = '40px';
        closer.style.lineHeight = '40px';
        closer.style.textAlign = 'center';
        closer.style.position = 'absolute';
        closer.style.textDecoration = 'none';
        closer.style.outline = '0';
        closer.style.top = '0';
        closer.style.right = '-40px';
        closer.style.cursor = 'pointer';
      }

      if (loader) {
        loader.style.position = 'relative';
        loader.style.fontSize = settings.popupLoaderTextSize;
        loader.style.textAlign = 'center';
        loader.style.display = 'none'; // Hidden by default
      }

      if (navNext && navPrev) {
        const navStyles = (el) => {
          el.style.fontSize = '75px';
          el.style.textAlign = 'center';
          el.style.color = '#fff';
          el.style.textShadow = 'none';
          el.style.height = '100%';
          el.style.position = 'absolute';
          el.style.top = '0';
          el.style.opacity = '0.35';
          el.style.cursor = 'pointer';
          disableSelection(el);
        };
        navStyles(navNext);
        navStyles(navPrev);

        // Easy Close Areas vs Standard Nav
        const navWidth = settings.usePopupEasyClose ? '100px' : '25%';

        navNext.style.right = '0';
        navNext.style.width = settings.usePopupEasyClose ? '100px' : '25%';
        navNext.innerHTML =
          '<div style="position: absolute; height: 100px; width: 125px; top: 50%; right: 0; margin-top: -50px;">&gt;</div>';

        navPrev.style.left = '0';
        navPrev.style.width = settings.usePopupEasyClose ? '100px' : '25%';
        navPrev.innerHTML =
          '<div style="position: absolute; height: 100px; width: 125px; top: 50%; left: 0; margin-top: -50px;">&lt;</div>';
      }
    }

    // --- 3. Utilities & Logic ---

    function updateMax() {
      windowWidth = window.innerWidth;
      windowHeight = window.innerHeight + settings.windowHeightPad;

      const popupWidthDelta = Math.abs(popup.offsetWidth - popup.clientWidth); // borders/padding
      const popupHeightDelta = Math.abs(popup.offsetHeight - popup.clientHeight);

      const maxW = windowWidth - settings.windowMargin * 2 - popupWidthDelta;
      const maxH = windowHeight - settings.windowMargin * 2 - popupHeightDelta;

      popup.style.minWidth = settings.popupWidth + 'px';
      popup.style.minHeight = settings.popupHeight + 'px';

      // Limit image size inside pic
      Array.from(pic.children).forEach((child) => {
        child.style.maxWidth = maxW + 'px';
        child.style.maxHeight = maxH + 'px';
      });
    }

    // Animation Helpers
    function fadeIn(el, speed, callback) {
      el.style.display = el.tagName === 'SPAN' || el.tagName === 'IMG' ? 'inline-block' : 'block';
      el.style.transition = `opacity ${speed}ms`;
      // Trigger reflow
      void el.offsetWidth;
      el.style.opacity = '1';
      setTimeout(() => {
        if (callback) callback();
      }, speed);
    }

    function fadeOut(el, speed, callback) {
      el.style.transition = `opacity ${speed}ms`;
      el.style.opacity = '0';
      setTimeout(() => {
        el.style.display = 'none';
        if (callback) callback();
      }, speed);
    }

    // --- 4. Event Actions ---

    function triggerReset() {
      updateMax();
      popup.dataset.width = settings.popupWidth;
      popup.dataset.height = settings.popupHeight;

      if (loader) fadeOut(loader, 1);
      if (caption) caption.style.display = 'none';
      if (closer) closer.style.display = 'none';
      if (navNext) navNext.style.display = 'none';
      if (navPrev) navPrev.style.display = 'none';

      pic.style.display = 'none';
      // Clear previous content
      while (pic.firstChild) {
        pic.removeChild(pic.firstChild);
      }
    }

    function triggerClose() {
      if (!isLocked && !settings.usePopupForceClose) return;
      isLocked = true;

      triggerReset();

      if (settings.onPopupClose) settings.onPopupClose();

      fadeOut(overlay, settings.fadeSpeed, () => {
        if (settings.useBodyOverflow) body.style.overflow = 'auto';
        isLocked = false;
      });
    }

    function triggerSwitch(index) {
      if (isLocked) return;
      isLocked = true;

      // Update internal state
      popup.classList.add('loading');

      // Set dimensions to last known
      if (popup.dataset.width) popup.style.width = popup.dataset.width + 'px';
      if (popup.dataset.height) popup.style.height = popup.dataset.height + 'px';

      if (caption) caption.style.display = 'none';

      // Clear content
      while (pic.firstChild) {
        pic.removeChild(pic.firstChild);
      }

      const item = queue[index];
      let contentObject = item.object; // This might be an IMG element or Iframe

      // Prepare Pic Container
      pic.style.textIndent = '-9999px';
      pic.style.display = 'block'; // Show container hidden by indent
      pic.appendChild(contentObject);

      // Handler: Loading Types
      if (item.type === 'ajax') {
        fetch(item.src)
          .then((response) => response.text())
          .then((text) => {
            contentObject.innerHTML = text;
            finalizeSwitch();
          });
      } else if (item.type !== 'image') {
        // Iframes / Video
        let w = item.width;
        let h = item.height;

        // Handle % dimensions
        if (String(w).slice(-1) === '%') {
          w = (parseInt(w) / 100) * window.innerWidth;
        }
        if (String(h).slice(-1) === '%') {
          h = (parseInt(h) / 100) * window.innerHeight;
        }

        contentObject.style.position = 'relative';
        contentObject.style.outline = '0';
        contentObject.style.zIndex = settings.baseZIndex + 100;
        contentObject.width = w;
        contentObject.height = h;

        // For videos/iframes, we skip "load" event wait usually
        finalizeSwitch();
      } else {
        // Images
        // We must set dimensions before showing
        contentObject.onload = function () {
          finalizeSwitch();
        };
        contentObject.src = item.src; // Trigger load
      }

      // Show Loader
      if (loader) fadeIn(loader, 300);
      popup.style.display = 'inline-block'; // Make sure popup is visible

      // Finalize function (called after load)
      function finalizeSwitch() {
        updateMax();

        if (loader) {
          fadeOut(loader, 10); // Hide loader
        }

        // Calculate Target Dimensions
        let targetWidth =
          contentObject.width || contentObject.naturalWidth || contentObject.offsetWidth;
        let targetHeight =
          contentObject.height || contentObject.naturalHeight || contentObject.offsetHeight;

        // The logic to show content
        const showContent = () => {
          if (caption) {
            caption.innerHTML =
              item.captionText && item.captionText.length > 0
                ? item.captionText
                : settings.popupBlankCaptionText;
            fadeIn(caption, settings.fadeSpeed);
          }
          if (closer) fadeIn(closer, settings.fadeSpeed);
          if (navNext) fadeIn(navNext, settings.fadeSpeed);
          if (navPrev) fadeIn(navPrev, settings.fadeSpeed);

          pic.style.textIndent = '0';
          pic.style.display = 'none';
          fadeIn(pic, settings.fadeSpeed, () => {
            isLocked = false;
          });

          currentItemIndex = index;
          popup.classList.remove('loading');
        };

        // Logic: Resize Popup then Show
        if (settings.popupIsFixed) {
          popup.style.width = settings.popupWidth + 'px';
          popup.style.height = settings.popupHeight + 'px';
          showContent();
        } else {
          // Store new dims
          popup.dataset.width = targetWidth;
          popup.dataset.height = targetHeight;
          popup.style.width = 'auto';
          popup.style.height = 'auto';

          // Note: In vanilla, animating width/height smoothly requires explicit pixel values
          // For simplicity, we snap to size like the "fast" logic or let CSS transition handle it if values change
          popup.style.width = targetWidth + 'px';
          popup.style.height = targetHeight + 'px';

          // Wait for transition end or timeout
          setTimeout(showContent, settings.popupSpeed);
        }
      }
    }

    function triggerOpen(index) {
      if (isLocked) return;
      isLocked = true;

      if (settings.useBodyOverflow) body.style.overflow = 'hidden';
      if (settings.onPopupOpen) settings.onPopupOpen();

      popup.classList.add('loading');

      overlay.style.display = 'block';
      // Wait a tick for display:block to apply before changing opacity
      requestAnimationFrame(() => {
        overlay.style.opacity = '1';
        setTimeout(() => {
          triggerSwitch(index);
        }, settings.fadeSpeed);
      });
    }

    function triggerNext() {
      let index = currentItemIndex + 1;
      if (index >= queue.length) index = 0;
      triggerSwitch(index);
    }

    function triggerPrev() {
      let index = currentItemIndex - 1;
      if (index < 0) index = queue.length - 1;
      triggerSwitch(index);
    }

    // --- 5. Event Listeners ---

    window.addEventListener('resize', updateMax);
    window.addEventListener('orientationchange', updateMax);

    // Global Keydown
    window.addEventListener('keydown', (e) => {
      if (overlay.style.display !== 'none' && overlay.style.display !== '') {
        switch (e.keyCode) {
          case 37: // Left
          case 32: // Space
            if (settings.usePopupNav) {
              e.preventDefault();
              triggerPrev();
            }
            break;
          case 39: // Right
            if (settings.usePopupNav) {
              e.preventDefault();
              triggerNext();
            }
            break;
          case 27: // Esc
            e.preventDefault();
            triggerClose();
            break;
        }
      }
    });

    if (closer) {
      closer.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        triggerClose();
      });
    }

    if (navNext) {
      navNext.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        triggerNext();
      });
    }

    if (navPrev) {
      navPrev.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        triggerPrev();
      });
    }

    // Overlay Click (Close)
    overlay.addEventListener('click', (e) => {
      // Check if clicked element is overlay or bg, not the popup content
      if (e.target === overlay || e.target === overlayBg || e.target === overlayVerticalAlign) {
        e.preventDefault();
        e.stopPropagation();
        triggerClose();
      }
    });

    // Popup Click
    if (settings.usePopupEasyClose) {
      if (caption) {
        // Prevent caption link clicks from closing
        const captionLinks = caption.querySelectorAll('a');
        captionLinks.forEach((a) => a.addEventListener('click', (e) => e.stopPropagation()));
      }
      popup.style.cursor = 'pointer';
      popup.addEventListener('click', (e) => {
        // If the click originated from the popup container (background) and not interactive children
        e.preventDefault();
        e.stopPropagation();
        triggerClose();
      });
    } else {
      popup.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }

    // --- 6. Parse Elements & Build Queue ---

    elements.forEach((el, index) => {
      // Find the image inside the anchor/element
      const img = el.querySelector('img');
      const dataAttr = el.getAttribute('data-poptrox');
      const href = el.getAttribute('href');

      // Skip ignore or no href
      if (dataAttr === 'ignore' || !href) return;

      let item = {
        src: href,
        captionText: (img ? img.getAttribute('title') : '') || '',
        width: null,
        height: null,
        type: null,
        object: null,
        options: null,
      };

      // Caption override
      if (settings.caption) {
        if (typeof settings.caption === 'function') {
          item.captionText = settings.caption(el);
        } else if (settings.caption.selector) {
          const captionEl = el.querySelector(settings.caption.selector);
          if (captionEl) {
            item.captionText = settings.caption.attribute
              ? captionEl.getAttribute(settings.caption.attribute)
              : captionEl.innerHTML;
          }
        }
      } else if (img) {
        item.captionText = img.getAttribute('title');
      }

      // Parse data-poptrox="type,widthxheight,options"
      if (dataAttr) {
        const parts = dataAttr.split(',');
        if (parts[0]) item.type = parts[0];
        if (parts[1]) {
          const match = parts[1].match(/([0-9%]+)x([0-9%]+)/);
          if (match && match.length === 3) {
            item.width = match[1];
            item.height = match[2];
          }
        }
        if (parts[2]) item.options = parts[2];
      }

      // Determine Type based on URL if not set
      if (!item.type) {
        const urlParts = item.src.match(/\/\/([a-z0-9\.]+)\/.*/);
        const domain = urlParts && urlParts.length > 1 ? urlParts[1] : '';

        switch (domain) {
          case 'api.soundcloud.com':
            item.type = 'soundcloud';
            break;
          case 'youtu.be':
            item.type = 'youtube';
            break;
          case 'vimeo.com':
            item.type = 'vimeo';
            break;
          case 'wistia.net':
            item.type = 'wistia';
            break;
          case 'bcove.me':
            item.type = 'bcove';
            break;
          default:
            item.type = 'image';
            break;
        }
      }

      // Extract IDs for video services
      const pathMatch = item.src.match(/\/\/[a-z0-9\.]+\/(.*)/);
      const path = pathMatch ? pathMatch[1] : '';

      // Build Object
      switch (item.type) {
        case 'iframe':
          item.object = document.createElement('iframe');
          item.object.src = item.src;
          item.object.frameBorder = '0';
          item.width = item.width || '600';
          item.height = item.height || '400';
          break;
        case 'ajax':
          item.object = document.createElement('div');
          item.object.className = 'poptrox-ajax';
          item.object.style.cursor = 'auto';
          item.object.style.overflow = 'auto';
          item.width = item.width || '600';
          item.height = item.height || '400';
          break;
        case 'soundcloud':
          item.object = document.createElement('iframe');
          item.object.scrolling = 'no';
          item.object.frameBorder = 'no';
          item.object.src = `//w.soundcloud.com/player/?url=${encodeURIComponent(item.src)}&${
            item.options || ''
          }`;
          item.width = '600';
          item.height = '166';
          break;
        case 'youtube':
          item.object = document.createElement('iframe');
          item.object.src = `//www.youtube.com/embed/${path}${
            item.options ? '?' + item.options : ''
          }`;
          item.object.setAttribute('allowfullscreen', '1');
          item.object.frameBorder = '0';
          item.width = item.width || '800';
          item.height = item.height || '480';
          break;
        case 'vimeo':
          item.object = document.createElement('iframe');
          item.object.src = `//player.vimeo.com/video/${path}${
            item.options ? '?' + item.options : ''
          }`;
          item.object.setAttribute('allowFullScreen', '1');
          item.object.frameBorder = '0';
          item.width = item.width || '800';
          item.height = item.height || '480';
          break;
        // Add other video services (wistia, bcove) similarly if needed
        default:
          // Image
          item.object = new Image();
          if (settings.preload) {
            const pre = new Image();
            pre.src = item.src; // Trigger browser cache
          }
          item.width = el.getAttribute('width');
          item.height = el.getAttribute('height');
      }

      // Fix protocol for file://
      if (window.location.protocol === 'file:' && item.src.match(/^\/\//)) {
        item.src = 'http:' + item.src;
      }

      // Add to queue
      queue.push(item);

      // Clean up original element
      if (img) img.removeAttribute('title');
      el.removeAttribute('href');
      el.style.cursor = 'pointer';
      el.style.outline = '0';

      // Bind Click
      el.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        triggerOpen(queue.indexOf(item)); // Use index of pushed item
      });
    });

    // Initialize internal state
    triggerReset();
  };
})(window);
