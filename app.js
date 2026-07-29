/* envidzz@craft — app.js · 0 dependencies · 0 network calls · no images */
(function () {
  'use strict';
  var $ = function (s, ctx) { return (ctx || document).querySelector(s); };
  var $$ = function (s, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(s)); };
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- boot log ---------- */
  var bootLines = [
    'envidzz bootstrap v1.21',
    'loading paper/spigot runtime ... [ OK ]',
    'mounting java 21 lts ......... [ OK ]',
    'linking adventure components .. [ OK ]',
    'registering commands ......... [ OK ]',
    '3 plugins detected · 0 errors · starting session'
  ];
  (function boot() {
    var overlay = $('#boot');
    var log = $('#bootLog');
    if (!overlay || !log) return;
    if (reduced) { overlay.style.display = 'none'; return; }
    bootLines.forEach(function (line, i) {
      var div = document.createElement('div');
      div.className = 'boot-line';
      div.style.animationDelay = (i * 0.12) + 's';
      div.textContent = line;
      log.appendChild(div);
    });
    // overlay fades out via CSS at 2.6s
  })();

  /* ---------- titlebar scrolled state ---------- */
  var tb = $('.titlebar');
  if (tb && 'IntersectionObserver' in window) {
    var sentinel = document.createElement('div');
    sentinel.style.cssText = 'position:absolute;top:0;left:0;height:1px;width:1px';
    document.body.prepend(sentinel);
    new IntersectionObserver(function (entries) {
      tb.classList.toggle('scrolled', !entries[0].isIntersecting);
    }, { rootMargin: '-40px 0px 0px 0px' }).observe(sentinel);
  }

  /* ---------- card mount on scroll ---------- */
  (function mountCards() {
    if (reduced) { $$('.card').forEach(function (c) { c.classList.add('mounted'); }); return; }
    if (!('IntersectionObserver' in window)) { $$('.card').forEach(function (c) { c.classList.add('mounted'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e, idx) {
        if (!e.isIntersecting) return;
        var card = e.target;
        var slot = card.dataset.slot || 1;
        card.style.animationDelay = ((slot - 1) * 0.12) + 's';
        card.classList.add('mounted');
        io.unobserve(card);
      });
    }, { threshold: 0.15 });
    $$('.card').forEach(function (c) { io.observe(c); });
  })();

  /* ---------- mobile nav ---------- */
  var burger = $('#hamburger');
  var mnav = $('#mobileNav');
  if (burger && mnav) {
    burger.addEventListener('click', function () {
      var open = mnav.hasAttribute('hidden');
      if (open) mnav.removeAttribute('hidden'); else mnav.setAttribute('hidden', '');
      burger.setAttribute('aria-expanded', String(open));
    });
    $$('a', mnav).forEach(function (a) {
      a.addEventListener('click', function () {
        mnav.setAttribute('hidden', '');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- card expand / collapse ---------- */
  $$('.card').forEach(function (card) {
    var ul = $('.bullets', card);
    var btn = $('.expand', card);
    var head = $('.card-head', card);
    if (!ul || !btn) return;
    var total = ul.children.length;
    var hiddenCount = Math.max(0, total - 3);
    if (hiddenCount <= 0) { btn.style.display = 'none'; return; }
    btn.textContent = '... show more (' + hiddenCount + ')';

    function toggle(expand) {
      var isExpanded = expand == null ? ul.getAttribute('data-collapsed') === 'true' : !expand;
      ul.setAttribute('data-collapsed', String(isExpanded));
      btn.setAttribute('aria-expanded', String(!isExpanded));
      btn.textContent = isExpanded ? '... show more (' + hiddenCount + ')' : '... show less';
    }
    btn.addEventListener('click', function () { toggle(); });
    head.addEventListener('click', function (e) {
      if (e.target.closest('.copy-btn')) return;
      toggle();
    });
    head.style.cursor = 'pointer';
  });

  /* ---------- copy command chips ---------- */
  $$('.copy-btn').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var text = btn.getAttribute('data-copy') || '';
      copy(text, btn, '[ COPIED ]');
    });
  });
  function copy(text, anchor, label) {
    var done = function () { toast(label || '[ COPIED ]', anchor); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(function () { fallback(text); done(); });
    } else { fallback(text); done(); }
  }
  function fallback(text) {
    var t = document.createElement('textarea');
    t.value = text; t.style.position = 'fixed'; t.style.opacity = '0';
    document.body.appendChild(t); t.select();
    try { document.execCommand('copy'); } catch (_) {}
    document.body.removeChild(t);
  }

  /* ---------- tail -f log line on card hover ---------- */
  var tailTimers = {};
  $$('.card').forEach(function (card) {
    var plugin = card.dataset.plugin || 'plugin';
    var feats = card.querySelector('.bullets') ? card.querySelector('.bullets').children.length : 0;
    card.addEventListener('mouseenter', function () {
      if (reduced) return;
      if ($('.tail-line', card)) return;
      clearTimeout(tailTimers[plugin]);
      var t = setTimeout(function () {
        var line = document.createElement('div');
        line.className = 'tail-line';
        line.textContent = '[INFO] ' + plugin + ' enabled — ' + feats + ' features registered';
        card.appendChild(line);
      }, 120);
      tailTimers[plugin] = t;
    });
    card.addEventListener('mouseleave', function () {
      clearTimeout(tailTimers[plugin]);
      tailTimers[plugin] = setTimeout(function () {
        var line = $('.tail-line', card);
        if (line) line.remove();
      }, 400);
    });
  });

  /* ---------- recompile button ---------- */
  var recompile = $('#recompile');
  if (recompile) {
    recompile.addEventListener('click', function () {
      $$('.card').forEach(function (card) {
        card.classList.remove('mounted');
        void card.offsetWidth; // reflow
        var slot = card.dataset.slot || 1;
        card.style.animationDelay = ((slot - 1) * 0.12) + 's';
        card.classList.add('mounted');
      });
      $$('.ok-line').forEach(function (l, i) {
        l.style.animation = 'none'; void l.offsetWidth;
        l.style.animation = ''; l.style.animationDelay = (i * 0.2 + 0.1) + 's';
      });
      toast('[ OK ] recompiled', recompile);
    });
  }

  /* ---------- command palette ---------- */
  // press 1/2/3 -> inspect slot; / -> focus say input; g then p -> projects
  var sayInput = $('#sayInput');
  var gPressed = false; var gTimer = null;
  document.addEventListener('keydown', function (e) {
    if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
    if (e.key === '/') { e.preventDefault(); if (sayInput) sayInput.focus(); return; }
    if (e.key === '1' || e.key === '2' || e.key === '3') {
      var card = $('.card[data-slot="' + e.key + '"]');
      if (card) { card.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
        var btn = $('.expand', card); if (btn && ulCollapsed(card)) btn.click();
      }
      return;
    }
    if (e.key.toLowerCase() === 'g') { gPressed = true; clearTimeout(gTimer); gTimer = setTimeout(function () { gPressed = false; }, 700); return; }
    if (gPressed && e.key.toLowerCase() === 'p') {
      gPressed = false;
      var p = $('#projects'); if (p) p.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
    }
  });
  function ulCollapsed(card) { var ul = card.querySelector('.bullets'); return ul && ul.getAttribute('data-collapsed') === 'true'; }

  /* ---------- say input ---------- */
  if (sayInput) {
    sayInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        var val = sayInput.value.trim();
        sayInput.value = '';
        toast(val ? '[ SENT ✓ ]' : '[ EMPTY ]', sayInput);
      }
      if (e.key === 'Escape') { sayInput.blur(); }
    });
  }

  /* ---------- live clocks ---------- */
  function tick() {
    var d = new Date();
    var h = String(d.getHours()).padStart(2, '0');
    var m = String(d.getMinutes()).padStart(2, '0');
    var s = String(d.getSeconds()).padStart(2, '0');
    var str = h + ':' + m + ':' + s;
    var a = $('#statusClock'); if (a) a.textContent = str;
    var b = $('#footerClock'); if (b) b.textContent = str;
  }
  tick(); setInterval(tick, 1000);

  /* ---------- toast ---------- */
  var toastEl = $('#toast');
  var toastTimer = null;
  function toast(msg, anchor) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 1200);
  }
})();