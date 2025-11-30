/* browser.js v1.0 | @ajlkn | MIT licensed */
var browser = (function () {
  "use strict";

  var e = {
    name: null,
    version: null,
    os: null,
    osVersion: null,
    touch: null,
    mobile: null,
    _canUse: null,

    canUse: function (n) {
      // Create a test element if not already created
      e._canUse || (e._canUse = document.createElement("div"));
      var o = e._canUse.style,
        r = n.charAt(0).toUpperCase() + n.slice(1);

      // Check if property is supported with various vendor prefixes
      return (
        n in o ||
        "Moz" + r in o ||
        "Webkit" + r in o ||
        "O" + r in o ||
        "ms" + r in o
      );
    },

    init: function () {
      var n,
        o,
        r,
        i,
        t = navigator.userAgent;

      // Detect browser name and version
      n = "other";
      o = 0;
      r = [
        ["firefox", /Firefox\/([0-9\.]+)/],
        ["bb", /BlackBerry.+Version\/([0-9\.]+)/],
        ["bb", /BB[0-9]+.+Version\/([0-9\.]+)/],
        ["opera", /OPR\/([0-9\.]+)/],
        ["opera", /Opera\/([0-9\.]+)/],
        ["edge", /Edge\/([0-9\.]+)/],
        ["safari", /Version\/([0-9\.]+).+Safari/],
        ["chrome", /Chrome\/([0-9\.]+)/],
        ["ie", /MSIE ([0-9]+)/],
        ["ie", /Trident\/.+rv:([0-9]+)/],
      ];

      for (i = 0; i < r.length; i++) {
        if (t.match(r[i][1])) {
          n = r[i][0];
          o = parseFloat(RegExp.$1);
          break;
        }
      }

      e.name = n;
      e.version = o;

      // Detect operating system and version
      n = "other";
      o = 0;
      r = [
        [
          "ios",
          /([0-9_]+) like Mac OS X/,
          function (e) {
            return e.replace("_", ".").replace("_", "");
          },
        ],
        [
          "ios",
          /CPU like Mac OS X/,
          function () {
            return 0;
          },
        ],
        ["wp", /Windows Phone ([0-9\.]+)/, null],
        ["android", /Android ([0-9\.]+)/, null],
        [
          "mac",
          /Macintosh.+Mac OS X ([0-9_]+)/,
          function (e) {
            return e.replace("_", ".").replace("_", "");
          },
        ],
        ["windows", /Windows NT ([0-9\.]+)/, null],
        ["bb", /BlackBerry.+Version\/([0-9\.]+)/, null],
        ["bb", /BB[0-9]+.+Version\/([0-9\.]+)/, null],
        ["linux", /Linux/, null],
        ["bsd", /BSD/, null],
        ["unix", /X11/, null],
      ];

      for (i = 0; i < r.length; i++) {
        if (t.match(r[i][1])) {
          n = r[i][0];
          o = parseFloat(r[i][2] ? r[i][2](RegExp.$1) : RegExp.$1);
          break;
        }
      }

      e.os = n;
      e.osVersion = o;

      // Detect touch capability
      e.touch =
        e.os === "wp"
          ? navigator.msMaxTouchPoints > 0
          : !!("ontouchstart" in window);

      // Detect if mobile
      e.mobile =
        e.os === "wp" || e.os === "android" || e.os === "ios" || e.os === "bb";
    },
  };

  // Initialize immediately
  e.init();

  return e;
})();

// Export for AMD, CommonJS, or global
!(function (e, n) {
  if (typeof define === "function" && define.amd) {
    define([], n);
  } else if (typeof exports === "object") {
    module.exports = n();
  } else {
    e.browser = n();
  }
})(this, function () {
  return browser;
});
