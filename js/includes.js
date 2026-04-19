/**
 * Sitezy — includes.js
 * ─────────────────────────────────────────────────────────
 * Fetches /components/header.html and /components/footer.html
 * and injects them into #site-header and #site-footer.
 *
 * Also handles:
 *  • Active nav link highlighting (matches current URL)
 *  • Hamburger menu toggle
 *  • Nav shadow on scroll
 *  • Scroll reveal (.reveal → .in)
 *  • Stagger delay for card grids
 * ─────────────────────────────────────────────────────────
 */

(function () {
  'use strict';

  /* ── helpers ── */
  function fetchHTML(url) {
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error('Failed to load ' + url);
      return r.text();
    });
  }

  /* ── inject header ── */
  function injectHeader(html) {
    var el = document.getElementById('site-header');
    if (!el) return;
    el.innerHTML = html;
    setActiveLinks();
    initHamburger();
    initNavScroll();
  }

  /* ── inject footer ── */
  function injectFooter(html) {
    var el = document.getElementById('site-footer');
    if (!el) return;
    el.innerHTML = html;
  }

  /* ── active nav links ── */
  function setActiveLinks() {
    var path = window.location.pathname.replace(/\/$/, '') || '/';
    document.querySelectorAll('.nav-links a, .drawer-link').forEach(function (a) {
      var href = a.getAttribute('href');
      if (!href) return;
      // Strip hash for comparison
      var linkPath = href.split('#')[0].replace(/\/$/, '') || '/';
      if (linkPath && linkPath !== '/' && path.startsWith(linkPath)) {
        a.classList.add('active');
      } else if (linkPath === '/' && path === '/') {
        a.classList.add('active');
      }
    });
  }

  /* ── hamburger ── */
  function initHamburger() {
    var ham = document.getElementById('nav-ham');
    var drawer = document.getElementById('nav-drawer');
    if (!ham || !drawer) return;

    function close() {
      ham.classList.remove('open');
      drawer.classList.remove('open');
      ham.setAttribute('aria-expanded', 'false');
      drawer.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    ham.addEventListener('click', function () {
      var isOpen = ham.classList.toggle('open');
      drawer.classList.toggle('open', isOpen);
      ham.setAttribute('aria-expanded', String(isOpen));
      drawer.setAttribute('aria-hidden', String(!isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    drawer.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', close);
    });

    document.addEventListener('click', function (e) {
      if (!ham.contains(e.target) && !drawer.contains(e.target)) close();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });
  }

  /* ── nav shadow on scroll ── */
  function initNavScroll() {
    var nav = document.getElementById('main-nav');
    if (!nav) return;
    window.addEventListener('scroll', function () {
      nav.style.boxShadow = window.scrollY > 50
        ? '0 4px 32px rgba(0,0,0,.5)'
        : 'none';
    }, { passive: true });
  }

  /* ── scroll reveal ── */
  function initReveal() {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e, i) {
        if (e.isIntersecting) {
          setTimeout(function () {
            e.target.classList.add('in');
          }, i * 70);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach(function (el) {
      obs.observe(el);
    });
  }

  /* ── stagger card grids ── */
  function initStagger() {
    var sel = [
      '.pain-card', '.serve-card', '.plan', '.testi-card',
      '.tech-card', '.aaa-card', '.guar-card', '.bc', '.pc'
    ].join(',');
    document.querySelectorAll(sel).forEach(function (c, i) {
      c.style.transitionDelay = ((i % 4) * 55) + 'ms';
    });
  }

  /* ── boot ── */
  Promise.all([
    fetchHTML('/components/header.html'),
    fetchHTML('/components/footer.html')
  ]).then(function (results) {
    injectHeader(results[0]);
    injectFooter(results[1]);
    // Run reveals after DOM settles
    requestAnimationFrame(function () {
      initReveal();
      initStagger();
    });
  }).catch(function (err) {
    console.warn('Sitezy includes.js:', err.message);
    // Graceful degradation — page still works, just no nav/footer
  });

})();
