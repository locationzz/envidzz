(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
    if (!loader) { if (page) page.classList.add('ready'); return; }
    if (!word || !bar || !page) return;
    if (reduced) { loader.classList.add('hide'); page.classList.add('ready'); return; }

    var i = 0, per = 130;
    bar.style.width = (100 / hellos.length) + '%';
    var t = setInterval(function () {
      i++;
      if (i >= hellos.length) {
        clearInterval(t); bar.style.width = '100%';
        setTimeout(function () { page.classList.add('ready'); loader.classList.add('hide'); }, 120);
        return;
      }
      word.style.animation = 'none'; void word.offsetWidth;
      word.textContent = hellos[i]; word.style.animation = '';
      bar.style.width = ((i + 1) / hellos.length * 100) + '%';
    }, per);
  })();

  var nav = document.getElementById('nav');
  function onScrollNav() { if (nav) nav.classList.toggle('scrolled', window.scrollY > 8); }
  onScrollNav(); window.addEventListener('scroll', onScrollNav, { passive: true });

  (function reveal() {
    var els = document.querySelectorAll('.reveal');
    if (reduced || !('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (e) { io.observe(e); });
  })();
})();
