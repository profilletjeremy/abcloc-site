/* ABC LOC — interactions. Aucune dépendance, ~3 Ko. */
(function () {
  "use strict";

  /* ---- menu mobile ---- */
  var burger = document.querySelector(".burger");
  var nav = document.getElementById("nav");
  if (burger && nav) {
    burger.addEventListener("click", function () {
      var open = burger.getAttribute("aria-expanded") === "true";
      burger.setAttribute("aria-expanded", String(!open));
      nav.setAttribute("data-open", String(!open));
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        burger.setAttribute("aria-expanded", "false");
        nav.setAttribute("data-open", "false");
      }
    });
  }

  /* ---- entête : transparent sur le hero, opaque au scroll ---- */
  var header = document.querySelector(".header");
  var hasHero = document.body.classList.contains("has-hero");
  if (header) {
    var onScroll = function () {
      var scrolled = window.scrollY > 40;
      header.classList.toggle("header--solid", scrolled || !hasHero);
      header.classList.toggle("header--over", hasHero && !scrolled);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---- filtres véhicules ---- */
  var filters = document.querySelectorAll(".filter");
  var grid = document.getElementById("cars");
  if (filters.length && grid) {
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".car"));
    var empty = grid.querySelector(".cars__empty");

    var apply = function (key) {
      var shown = 0;
      cards.forEach(function (card) {
        var tags = (card.getAttribute("data-tags") || "").split(" ");
        var match = key === "all" || tags.indexOf(key) !== -1;
        card.hidden = !match;
        if (match) shown++;
      });
      if (empty) empty.hidden = shown > 0;
    };

    filters.forEach(function (btn) {
      btn.addEventListener("click", function () {
        filters.forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
        btn.setAttribute("aria-pressed", "true");
        apply(btn.getAttribute("data-filter"));
      });
    });
  }

  /* ---- accordéon FAQ ---- */
  document.querySelectorAll(".qa__q").forEach(function (q) {
    q.addEventListener("click", function () {
      var item = q.closest(".qa");
      var open = item.getAttribute("data-open") === "true";
      item.setAttribute("data-open", String(!open));
      q.setAttribute("aria-expanded", String(!open));
    });
  });

  /* ---- apparition au scroll ---- */
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var targets = document.querySelectorAll(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    targets.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    targets.forEach(function (el, i) {
      el.style.transitionDelay = Math.min(i % 4, 3) * 70 + "ms";
      io.observe(el);
    });
  }

  /* ---- année du copyright ---- */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();
