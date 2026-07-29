/* envidzz — sleek tabbed portfolio. no deps, no network, no images. */
(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- loader: hello in 15 popular languages ---------- */
  var hellos = [
    'Hello',        // English
    '你好',         // Mandarin
    'こんにちは',   // Japanese
    '안녕하세요',   // Korean
    'नमस्ते',        // Hindi
    'Hola',         // Spanish
    'Bonjour',      // French
    'Hallo',        // German
    'Здравствуйте', // Russian
    'مرحبا',        // Arabic
    'Olá',          // Portuguese
    'Ciao',         // Italian
    'Merhaba',      // Turkish
    'Halo',         // Indonesian
    'Xin chào'      // Vietnamese
  ];

  (function runLoader() {
    var loader = document.getElementById('loader');
    var word = document.getElementById('loaderWord');
    var bar = document.getElementById('loaderBar');
    var page = document.getElementById('page');
    if (!loader || !word || !bar || !page) return;

    if (reduced) {
      loader.classList.add('hide');
      page.classList.add('ready');
      return;
    }

    var i = 0;
    var per = 130; // ms per word — quick
    // first word already rendered in HTML
    bar.style.width = (100 / hellos.length) + '%';

    var t = setInterval(function () {
      i++;
      if (i >= hellos.length) {
        clearInterval(t);
        bar.style.width = '100%';
        // reveal page, fade loader
        setTimeout(function () {
          page.classList.add('ready');
          loader.classList.add('hide');
        }, 120);
        return;
      }
      word.style.animation = 'none';
      // force reflow to restart animation
      void word.offsetWidth;
      word.textContent = hellos[i];
      word.style.animation = '';
      bar.style.width = ((i + 1) / hellos.length * 100) + '%';
    }, per);
  })();

  /* ---------- tabs ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab'));
  var views = Array.prototype.slice.call(document.querySelectorAll('.view'));

  function show(name) {
    tabs.forEach(function (t) {
      var on = t.dataset.tab === name;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', String(on));
    });
    views.forEach(function (v) {
      var on = v.id === name;
      if (on) v.removeAttribute('hidden'); else v.setAttribute('hidden', '');
    });
  }

  tabs.forEach(function (t) {
    t.addEventListener('click', function () { show(t.dataset.tab); });
  });

  // arrow-key nav between tabs
  document.addEventListener('keydown', function (e) {
    if (!/ArrowLeft|ArrowRight/.test(e.key)) return;
    var active = document.activeElement;
    if (!active || !active.classList || !active.classList.contains('tab')) return;
    var i = tabs.indexOf(active);
    if (i < 0) return;
    var next = e.key === 'ArrowRight' ? (i + 1) % tabs.length : (i - 1 + tabs.length) % tabs.length;
    tabs[next].focus();
    show(tabs[next].dataset.tab);
  });

  // deep-link: #projects etc.
  function fromHash() {
    var h = (location.hash || '').replace('#', '');
    return h && tabs.some(function (t) { return t.dataset.tab === h; }) ? h : null;
  }
  if (fromHash()) show(fromHash());
  window.addEventListener('hashchange', function () { var h = fromHash(); if (h) show(h); });
})();