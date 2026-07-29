/* envidzz — portfolio. no deps, no network, no images. */
(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- loader: hello in 15 popular languages ---------- */
  var hellos = [
    'Hello', '你好', 'こんにちは', '안녕하세요', 'नमस्ते',
    'Hola', 'Bonjour', 'Hallo', 'Здравствуйте', 'مرحبا',
    'Olá', 'Ciao', 'Merhaba', 'Halo', 'Xin chào'
  ];

  (function runLoader() {
    var loader = document.getElementById('loader');
    var word = document.getElementById('loaderWord');
    var bar = document.getElementById('loaderBar');
    var page = document.getElementById('page');
    if (!loader || !word || !bar || !page) return;
    if (reduced) { loader.classList.add('hide'); page.classList.add('ready'); return; }

    var i = 0;
    var per = 130;
    bar.style.width = (100 / hellos.length) + '%';
    var t = setInterval(function () {
      i++;
      if (i >= hellos.length) {
        clearInterval(t);
        bar.style.width = '100%';
        setTimeout(function () { page.classList.add('ready'); loader.classList.add('hide'); }, 120);
        return;
      }
      word.style.animation = 'none';
      void word.offsetWidth;
      word.textContent = hellos[i];
      word.style.animation = '';
      bar.style.width = ((i + 1) / hellos.length * 100) + '%';
    }, per);
  })();

  /* ---------- nav scrolled state ---------- */
  var nav = document.getElementById('nav');
  function onScroll() {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 8);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- scroll reveal ---------- */
  (function reveal() {
    if (reduced || !('IntersectionObserver' in window)) {
      document.querySelectorAll('.reveal').forEach(function (e) { e.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal').forEach(function (e) { io.observe(e); });
  })();

  /* ---------- active nav link ---------- */
  (function activeLink() {
    var links = Array.prototype.slice.call(document.querySelectorAll('.nav-links a'));
    var sections = links.map(function (l) { return document.querySelector(l.getAttribute('href')); });
    if (!('IntersectionObserver' in window)) return;
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (l) { l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' }).observe;
    // simpler: scroll-based
    window.addEventListener('scroll', function () {
      var y = window.scrollY + 120;
      var current = sections[0] && sections[0].id;
      sections.forEach(function (s) { if (s && s.offsetTop <= y) current = s.id; });
      links.forEach(function (l) { l.classList.toggle('active', l.getAttribute('href') === '#' + current); });
    }, { passive: true });
  })();
})();