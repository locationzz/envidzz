/* envidzz — tabbed portfolio. no deps, no network, no images. */
(function () {
  'use strict';
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

  // keyboard nav between tabs (left/right)
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

  // deep link: #projects etc.
  var hash = (location.hash || '').replace('#', '');
  if (hash && tabs.some(function (t) { return t.dataset.tab === hash; })) {
    show(hash);
  }
  window.addEventListener('hashchange', function () {
    var h = (location.hash || '').replace('#', '');
    if (h && tabs.some(function (t) { return t.dataset.tab === h; })) show(h);
  });
})();