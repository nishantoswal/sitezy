(function () {
  'use strict';

  /* ══════════════════════════════════════════
     SITEZY includes.js
     Fetches header + footer components and
     injects them, then boots all interactivity
  ══════════════════════════════════════════ */

  function fetchHTML(url) {
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error('Failed: ' + url);
      return r.text();
    });
  }

  function boot() {
    setActiveLinks();
    initHamburger();
    initNavScroll();
    initReveal();
    initStagger();
    initDropdowns();
    initDrawerAccordions();
  }

  /* ── inject header ── */
  var headerEl = document.getElementById('site-header');
  if (headerEl && headerEl.children.length === 0) {
    fetchHTML('/components/header.html')
      .then(function (html) {
        headerEl.innerHTML = html;
        boot();
      })
      .catch(function () {
        boot(); // still run interactivity even if header fails
      });
  } else {
    /* header already inlined — just boot */
    document.addEventListener('DOMContentLoaded', boot);
  }

  /* ── inject footer ── */
  var footerEl = document.getElementById('site-footer');
  if (footerEl && footerEl.children.length === 0) {
    fetchHTML('/components/footer.html')
      .then(function (html) {
        footerEl.innerHTML = html;
      })
      .catch(function () {});
  }

  /* ══ ACTIVE NAV LINKS ══ */
  function setActiveLinks() {
    var path = window.location.pathname.replace(/\/$/, '') || '/';
    document.querySelectorAll('.nav-links a, .drawer-link').forEach(function (a) {
      var href = a.getAttribute('href');
      if (!href) return;
      var linkPath = href.split('#')[0].replace(/\/$/, '') || '/';
      if (linkPath && linkPath !== '/' && path.startsWith(linkPath)) {
        a.classList.add('active');
      } else if (linkPath === '/' && path === '/') {
        a.classList.add('active');
      }
    });
  }

  /* ══ HAMBURGER ══ */
  function initHamburger() {
    var ham = document.getElementById('nav-ham');
    var drawer = document.getElementById('nav-drawer');
    if (!ham || !drawer) return;

    function closeDrawer() {
      ham.classList.remove('open');
      drawer.classList.remove('open');
      ham.setAttribute('aria-expanded', 'false');
      drawer.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      drawer.querySelectorAll('.drawer-acc-body.open').forEach(function (b) {
        b.classList.remove('open');
        b.previousElementSibling.setAttribute('aria-expanded', 'false');
      });
    }

    ham.addEventListener('click', function () {
      var isOpen = ham.classList.toggle('open');
      drawer.classList.toggle('open', isOpen);
      ham.setAttribute('aria-expanded', String(isOpen));
      drawer.setAttribute('aria-hidden', String(!isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    drawer.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeDrawer);
    });

    document.addEventListener('click', function (e) {
      if (!ham.contains(e.target) && !drawer.contains(e.target)) closeDrawer();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeDrawer();
    });
  }

  /* ══ NAV SCROLL SHADOW ══ */
  function initNavScroll() {
    var nav = document.getElementById('main-nav');
    if (!nav) return;
    window.addEventListener('scroll', function () {
      nav.style.boxShadow = window.scrollY > 50
        ? '0 4px 32px rgba(0,0,0,.5)'
        : 'none';
    }, { passive: true });
  }

  /* ══ SCROLL REVEAL ══ */
  function initReveal() {
    if (!window.IntersectionObserver) return;
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e, i) {
        if (e.isIntersecting) {
          setTimeout(function () { e.target.classList.add('in'); }, i * 70);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach(function (el) {
      obs.observe(el);
    });
  }

  /* ══ STAGGER CARD GRIDS ══ */
  function initStagger() {
    var sel = '.pain-card,.serve-card,.plan,.testi-card,.tech-card,.guar-card,.bc,.sol-card';
    document.querySelectorAll(sel).forEach(function (c, i) {
      c.style.transitionDelay = ((i % 4) * 55) + 'ms';
    });
  }

  /* ══ DESKTOP DROPDOWNS ══ */
  function initDropdowns() {
    /* Click-toggle for touch devices */
    document.querySelectorAll('.drop-trigger').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var li = btn.closest('.has-drop');
        var isOpen = li.classList.contains('force-open');
        document.querySelectorAll('.has-drop.force-open').forEach(function (el) {
          el.classList.remove('force-open');
        });
        if (!isOpen) li.classList.add('force-open');
      });
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest('.has-drop')) {
        document.querySelectorAll('.has-drop.force-open').forEach(function (li) {
          li.classList.remove('force-open');
        });
      }
    });
  }

  /* ══ MOBILE ACCORDION ══ */
  function initDrawerAccordions() {
    window.toggleAcc = function (btn) {
      var body = btn.nextElementSibling;
      var isOpen = body.classList.contains('open');
      document.querySelectorAll('.drawer-acc-body.open').forEach(function (b) {
        b.classList.remove('open');
        b.previousElementSibling.setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        body.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    };
  }

})();
