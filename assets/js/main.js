// Jackson Bateman — site behavior
//
// This is the *only* JavaScript file on the whole site — every page links
// to it with a single <script src="/assets/js/main.js"> tag, and it wires
// up whatever interactive bits exist on that particular page. Not every
// page has a gallery filter or a lightbox, for example, so most of the
// blocks below start by querying for an element and just do nothing if it
// isn't found on the current page (`if (!header) return;`, etc.) — that's
// what makes one shared file safe to load everywhere.
//
// Everything is wrapped in a single IIFE (Immediately Invoked Function
// Expression — `(function () { ... })()`) in "strict mode". Two reasons:
//   1. Nothing declared in here leaks into the global `window` object,
//      so this file can't accidentally clash with some other script.
//   2. It runs top-to-bottom exactly once, as soon as the browser parses
//      it — there's no framework lifecycle or build step involved.
(function () {
  'use strict';

  /* Header scroll state — adds/removes .is-scrolled on the header so its
     CSS can swap from a transparent header (at the very top of the page)
     to a solid, blurred one once you've scrolled past it. Re-checked on
     every scroll event; { passive: true } tells the browser this listener
     will never call preventDefault(), so it can keep scrolling smooth
     instead of waiting on this handler. */
  var header = document.querySelector('.site-header');
  function onScroll() {
    if (!header) return;
    if (window.scrollY > 12) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* Mobile nav toggle — the hamburger button flips .is-open on both itself
     (for the CSS ×-icon animation) and the nav link list (to slide it into
     view). Tapping any link inside closes the menu again, and toggling
     `document.body.style.overflow` stops the page underneath from
     scrolling while the full-screen mobile menu is open. */
  var toggle = document.querySelector('.nav-toggle');
  var navLinks = document.querySelector('.nav-links');
  if (toggle && navLinks) {
    toggle.addEventListener('click', function () {
      var open = navLinks.classList.toggle('is-open');
      toggle.classList.toggle('is-open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    navLinks.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        navLinks.classList.remove('is-open');
        toggle.classList.remove('is-open');
        document.body.style.overflow = '';
      });
    });
  }

  /* Active nav link — there's no client-side router here (each page is a
     separate .html file requested fresh from the server), so "which nav
     link is active" is worked out after the fact by comparing the current
     URL's filename against every nav link's href. Falls back to
     'index.html' when the path is empty, i.e. visiting "/" itself. */
  var path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(function (a) {
    var href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  /* Scroll reveal — pairs with the .reveal / .is-visible CSS in style.css.
     An IntersectionObserver is the modern, efficient way to know when an
     element scrolls into view: instead of running a scroll-position check
     on every single scroll event (expensive, and easy to get janky), the
     browser itself notifies this callback only when something crosses the
     threshold. `rootMargin: '0px 0px -60px 0px'` shrinks the trigger area
     by 60px from the bottom of the viewport, so an element reveals a beat
     before it's fully on-screen rather than right at the very edge.
     `io.unobserve(entry.target)` stops watching an element once it has
     revealed — it only needs to happen once, ever, per element.
     The `else` branch is the fallback for any browser too old to support
     IntersectionObserver: just show everything immediately, no animation. */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* Duplicate ticker content for a seamless loop — see the long comment on
     .ticker in style.css for how this pairs with the CSS animation. This
     is the one line that actually does the duplicating: it reads the
     ticker's current inner HTML and appends a second copy of itself. */
  document.querySelectorAll('.ticker').forEach(function (ticker) {
    ticker.innerHTML += ticker.innerHTML;
  });

  /* Lightbox — a single overlay element (see the .lightbox markup near the
     end of each gallery-bearing page) gets reused for every photo on that
     page. Every clickable photo has a `data-lightbox` attribute; clicking
     one intercepts the default link behavior (`e.preventDefault()`, since
     the <a> tags point straight at the full-size image as a plain-HTML
     fallback) and opens that same shared overlay instead, swapping in the
     clicked image's URL and caption. `current` tracks which photo in the
     list is showing so prev/next and the keyboard arrows know where to go
     next; `(index + items.length) % items.length` is the standard trick for
     wrapping index math around both ends of an array (next past the last
     photo goes back to the first, previous before the first wraps to the
     last). */
  var lightbox = document.querySelector('.lightbox');
  if (lightbox) {
    var lbImg = lightbox.querySelector('img');
    var lbCaption = lightbox.querySelector('.lightbox-caption');
    var items = Array.prototype.slice.call(document.querySelectorAll('[data-lightbox]'));
    var current = 0;

    function show(index) {
      current = (index + items.length) % items.length;
      var el = items[current];
      lbImg.src = el.getAttribute('href') || el.querySelector('img').src;
      lbCaption.textContent = el.getAttribute('data-caption') || '';
      lightbox.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }
    function close() {
      lightbox.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    items.forEach(function (el, index) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        show(index);
      });
    });

    var closeBtn = lightbox.querySelector('.lightbox-close');
    var prevBtn = lightbox.querySelector('.lightbox-prev');
    var nextBtn = lightbox.querySelector('.lightbox-next');
    if (closeBtn) closeBtn.addEventListener('click', close);
    if (prevBtn) prevBtn.addEventListener('click', function () { show(current - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { show(current + 1); });
    lightbox.addEventListener('click', function (e) { if (e.target === lightbox) close(); });

    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(current - 1);
      if (e.key === 'ArrowRight') show(current + 1);
    });
  }

  /* Gallery filters (performing-arts / gallery pages) — each filter button
     carries a `data-filter` value matching a `data-group` on one of the
     photo groups below it. Clicking a filter just toggles which groups are
     visible (`display: none` vs the default) rather than removing/re-adding
     DOM nodes, which keeps this simple and avoids re-triggering the
     scroll-reveal animation on group switches. */
  var filterBtns = document.querySelectorAll('.filter-btn');
  var groups = document.querySelectorAll('[data-group]');
  if (filterBtns.length && groups.length) {
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filterBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var target = btn.getAttribute('data-filter');
        groups.forEach(function (g) {
          g.style.display = target === 'all' || g.getAttribute('data-group') === target ? '' : 'none';
        });
      });
    });
  }

  /* Footer year — keeps the copyright year correct without editing every
     page's HTML every January. The footer just has an empty
     <span data-year></span>; this fills in the real current year once, on
     load. */
  var yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* Reduced-motion flag, shared by everything below. The CSS reduced-motion
     query at the top of style.css already zeroes out every *declarative*
     CSS animation/transition, but the tilt and magnetic-button effects work
     by writing `element.style.transform` directly from mousemove — that's
     JS-driven, not a CSS transition, so it needs its own explicit check to
     respect the same preference. */
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasFinePointer = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* Lone-star watermarks — see the long comment on .watermark in style.css.
     One inline SVG, built once and cloned, dropped as the first child of
     every .hero / .page-header / .cta-banner / .site-footer on the page (a
     page typically has zero or one of each). Positioning, color, and the
     slow rotation are all CSS — this just plants the shape. */
  var STAR_PATH = 'M12 1.5l3.09 6.26 6.91 1-5 4.87 1.18 6.87L12 17.27l-6.18 3.23L7 13.63l-5-4.87 6.91-1z';
  var watermarkHosts = document.querySelectorAll('.hero, .page-header, .cta-banner, .site-footer');
  watermarkHosts.forEach(function (host) {
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    svg.classList.add('watermark');
    var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', STAR_PATH);
    svg.appendChild(path);
    host.insertBefore(svg, host.firstChild);
  });

  /* Scroll progress bar — a single fixed strip appended once to <body>,
     filled left-to-right by how far down the page you've scrolled. It's a
     position readout rather than decorative motion, so unlike tilt/magnetic
     below it isn't gated behind reduceMotion. */
  var progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress';
  document.body.appendChild(progressBar);
  function onScrollProgress() {
    var doc = document.documentElement;
    var scrollTop = doc.scrollTop || document.body.scrollTop;
    var scrollable = (doc.scrollHeight || document.body.scrollHeight) - doc.clientHeight;
    progressBar.style.width = (scrollable > 0 ? (scrollTop / scrollable) * 100 : 0) + '%';
  }
  onScrollProgress();
  window.addEventListener('scroll', onScrollProgress, { passive: true });

  /* 3D tilt — desktop-with-a-mouse only (touch has no hover, and mouseleave
     doesn't fire reliably on tap), and skipped entirely under
     prefers-reduced-motion. Tilt angle is derived from cursor position
     relative to the card's own center, so it always tilts "toward" the
     cursor. Transition is turned off while actively tracking the mouse (so
     the tilt follows instantly) and turned back on for the snap-back on
     mouseleave. */
  if (hasFinePointer && !reduceMotion) {
    var tiltEls = document.querySelectorAll('.ledger-card, .card, .teaser-card, .music-card, .track-card, .form-card');
    tiltEls.forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var rect = el.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;
        el.style.transition = 'transform 0.1s linear';
        el.style.transform = 'perspective(900px) rotateX(' + (-y * 6) + 'deg) rotateY(' + (x * 8) + 'deg) translateY(-2px)';
      });
      el.addEventListener('mouseleave', function () {
        el.style.transition = 'transform 0.5s var(--ease)';
        el.style.transform = '';
      });
    });

    /* Magnetic buttons — pill-shaped buttons (not full-width .btn-block
       ones, where a "pull toward cursor" over that much width would feel
       like the button is sliding away rather than reacting to you) and the
       small round social icons drift a few pixels toward the cursor. */
    var magnets = document.querySelectorAll('.btn:not(.btn-block), .social-btn');
    magnets.forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var rect = el.getBoundingClientRect();
        var x = e.clientX - rect.left - rect.width / 2;
        var y = e.clientY - rect.top - rect.height / 2;
        el.style.transition = 'transform 0.1s linear';
        el.style.transform = 'translate(' + (x * 0.22) + 'px, ' + (y * 0.22 - 2) + 'px)';
      });
      el.addEventListener('mouseleave', function () {
        el.style.transition = 'transform 0.4s var(--ease)';
        el.style.transform = '';
      });
    });
  }
})();
