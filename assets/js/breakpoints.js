/* breakpoints.js v1.0 | @ajlkn | MIT licensed */
var breakpoints = (function () {
  "use strict";

  function e(config) {
    t.init(config);
  }

  var t = {
    list: null,
    media: {},
    events: [],

    init: function (list) {
      t.list = list;
      window.addEventListener("resize", t.poll);
      window.addEventListener("orientationchange", t.poll);
      window.addEventListener("load", t.poll);
      window.addEventListener("fullscreenchange", t.poll);
    },

    active: function (query) {
      var n, a, s, i, r, d, c;

      if (!(query in t.media)) {
        if (">=" == query.substr(0, 2)) {
          a = "gte";
          n = query.substr(2);
        } else if ("<=" == query.substr(0, 2)) {
          a = "lte";
          n = query.substr(2);
        } else if (">" == query.substr(0, 1)) {
          a = "gt";
          n = query.substr(1);
        } else if ("<" == query.substr(0, 1)) {
          a = "lt";
          n = query.substr(1);
        } else if ("!" == query.substr(0, 1)) {
          a = "not";
          n = query.substr(1);
        } else {
          a = "eq";
          n = query;
        }

        if (n && n in t.list) {
          i = t.list[n];

          if (Array.isArray(i)) {
            r = parseInt(i[0]);
            d = parseInt(i[1]);

            if (isNaN(r)) {
              if (isNaN(d)) return;
              c = i[1].substr(String(d).length);
            } else {
              c = i[0].substr(String(r).length);
            }

            if (isNaN(r)) {
              switch (a) {
                case "gte":
                  s = "screen";
                  break;
                case "lte":
                  s = "screen and (max-width: " + d + c + ")";
                  break;
                case "gt":
                  s = "screen and (min-width: " + (d + 1) + c + ")";
                  break;
                case "lt":
                  s = "screen and (max-width: -1px)";
                  break;
                case "not":
                  s = "screen and (min-width: " + (d + 1) + c + ")";
                  break;
                default:
                  s = "screen and (max-width: " + d + c + ")";
              }
            } else if (isNaN(d)) {
              switch (a) {
                case "gte":
                  s = "screen and (min-width: " + r + c + ")";
                  break;
                case "lte":
                  s = "screen";
                  break;
                case "gt":
                  s = "screen and (max-width: -1px)";
                  break;
                case "lt":
                  s = "screen and (max-width: " + (r - 1) + c + ")";
                  break;
                case "not":
                  s = "screen and (max-width: " + (r - 1) + c + ")";
                  break;
                default:
                  s = "screen and (min-width: " + r + c + ")";
              }
            } else {
              switch (a) {
                case "gte":
                  s = "screen and (min-width: " + r + c + ")";
                  break;
                case "lte":
                  s = "screen and (max-width: " + d + c + ")";
                  break;
                case "gt":
                  s = "screen and (min-width: " + (d + 1) + c + ")";
                  break;
                case "lt":
                  s = "screen and (max-width: " + (r - 1) + c + ")";
                  break;
                case "not":
                  s =
                    "screen and (max-width: " +
                    (r - 1) +
                    c +
                    "), screen and (min-width: " +
                    (d + 1) +
                    c +
                    ")";
                  break;
                default:
                  s =
                    "screen and (min-width: " +
                    r +
                    c +
                    ") and (max-width: " +
                    d +
                    c +
                    ")";
              }
            }
          } else {
            s = "(" == i.charAt(0) ? "screen and " + i : i;
          }

          t.media[query] = !!s && s;
        }
      }

      return t.media[query] !== !1 && window.matchMedia(t.media[query]).matches;
    },

    on: function (query, handler) {
      t.events.push({ query: query, handler: handler, state: !1 });
      t.active(query) && handler();
    },

    poll: function () {
      var e, n;
      for (e = 0; e < t.events.length; e++) {
        n = t.events[e];
        if (t.active(n.query)) {
          if (!n.state) {
            n.state = !0;
            n.handler();
          }
        } else if (n.state) {
          n.state = !1;
        }
      }
    },
  };

  e._ = t;
  e.on = function (query, handler) {
    t.on(query, handler);
  };
  e.active = function (query) {
    return t.active(query);
  };

  return e;
})();

!(function (e, t) {
  if (typeof define === "function" && define.amd) {
    define([], t);
  } else if (typeof exports === "object") {
    module.exports = t();
  } else {
    e.breakpoints = t();
  }
})(this, function () {
  return breakpoints;
});