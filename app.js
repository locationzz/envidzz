/* envidzz — portfolio + reviews. no deps, no images. */
(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============================================================
     Reviews go through a serverless proxy on Vercel. The Supabase
     key lives server-side in that function — it is NOT in this file,
     not in the repo, and never sent to the browser. RLS still guards
     the database; the proxy adds server-side validation too.
     ============================================================ */
  var API_URL = 'https://envidzz-api.vercel.app';

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

  /* ---------- nav scrolled state ---------- */
  var nav = document.getElementById('nav');
  function onScrollNav() { if (nav) nav.classList.toggle('scrolled', window.scrollY > 8); }
  onScrollNav(); window.addEventListener('scroll', onScrollNav, { passive: true });

  /* ---------- scroll reveal ---------- */
  (function reveal() {
    var els = document.querySelectorAll('.reveal');
    if (reduced || !('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (e) { io.observe(e); });
  })();

  /* ---------- active nav link ---------- */
  (function activeLink() {
    var links = Array.prototype.slice.call(document.querySelectorAll('.nav-links a'));
    var sections = links.map(function (l) { return document.querySelector(l.getAttribute('href')); }).filter(Boolean);
    if (!sections.length) return;
    window.addEventListener('scroll', function () {
      var y = window.scrollY + 120, current = sections[0].id;
      sections.forEach(function (s) { if (s.offsetTop <= y) current = s.id; });
      links.forEach(function (l) { l.classList.toggle('active', l.getAttribute('href') === '#' + current); });
    }, { passive: true });
  })();

  /* ---------- toast ---------- */
  var toastEl = document.getElementById('toast');
  var toastTimer = null;
  function toast(msg, kind) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.className = 'toast show' + (kind ? ' ' + kind : '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2200);
  }

  /* ============================================================
     Reviews
     ============================================================ */
  var starsWrap = document.getElementById('rStars');
  var rating = 0;

  (function starInput() {
    if (!starsWrap) return;
    var btns = Array.prototype.slice.call(starsWrap.querySelectorAll('.star'));
    function paint(n) { btns.forEach(function (b) { b.classList.toggle('on', +b.dataset.v <= n); }); }
    btns.forEach(function (b) {
      b.addEventListener('click', function () { rating = +b.dataset.v; paint(rating); });
      b.addEventListener('mouseenter', function () { paint(+b.dataset.v); });
    });
    starsWrap.addEventListener('mouseleave', function () { paint(rating); });
    paint(rating);
  })();

  function fmtDate(iso) {
    try {
      var d = new Date(iso);
      return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) { return ''; }
  }
  function starsStr(n) { return '★★★★★'.slice(0, n) + '☆☆☆☆☆'.slice(0, 5 - n); }

  function renderSummary(rows) {
    var sum = document.getElementById('reviewSummary');
    if (!rows.length) { if (sum) sum.hidden = true; return; }
    if (sum) sum.hidden = false;
    var avg = rows.reduce(function (a, r) { return a + r.rating; }, 0) / rows.length;
    document.getElementById('rsAvg').textContent = avg.toFixed(1);
    document.getElementById('rsStars').textContent = starsStr(Math.round(avg));
    document.getElementById('rsCount').textContent = rows.length + (rows.length === 1 ? ' review' : ' reviews');
  }

  function el(tag, cls) { var n = document.createElement(tag); if (cls) n.className = cls; return n; }

  function renderReviews(rows) {
    var list = document.getElementById('reviewsList');
    if (!list) return;
    while (list.firstChild) list.removeChild(list.firstChild);
    renderSummary(rows);
    if (!rows.length) {
      var p = el('p', 'reviews-empty');
      p.textContent = 'no reviews yet — be the first to leave one.';
      list.appendChild(p);
      return;
    }
    rows.forEach(function (r) {
      var card = el('div', 'review-card');
      var head = el('div', 'rc-head');
      var name = el('span', 'rc-name'); name.textContent = r.name;
      var stars = el('span', 'rc-stars'); stars.textContent = starsStr(r.rating);
      var date = el('span', 'rc-date'); date.textContent = fmtDate(r.created_at);
      head.appendChild(name); head.appendChild(stars); head.appendChild(date);
      var body = el('p', 'rc-body'); body.textContent = r.body;
      card.appendChild(head); card.appendChild(body);
      list.appendChild(card);
    });
  }

  function loadReviews() {
    var list = document.getElementById('reviewsList');
    if (!list) return;
    if (!API_URL) {
      list.textContent = '';
      var note = el('p', 'reviews-empty');
      note.textContent = 'reviews are being set up — check back shortly.';
      list.appendChild(note);
      return;
    }
    fetch(API_URL + '/api/reviews').then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    }).then(renderReviews).catch(function () {
      list.textContent = '';
      var err = el('p', 'reviews-error');
      err.textContent = "couldn't load reviews. try again later.";
      list.appendChild(err);
    });
  }

  // basic spam cooldown via localStorage (soft, client-side only)
  function onCooldown() {
    try {
      var last = parseInt(localStorage.getItem('envidzz_review_last') || '0', 10);
      return Date.now() - last < 15000;
    } catch (e) { return false; }
  }
  function markCooldown() { try { localStorage.setItem('envidzz_review_last', String(Date.now())); } catch (e) {} }

  (function reviewForm() {
    var form = document.getElementById('reviewForm');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!API_URL) { toast('reviews not configured yet', 'err'); return; }
      var name = (document.getElementById('rName').value || '').trim();
      var body = (document.getElementById('rBody').value || '').trim();
      if (!name || !body) { toast('name and review are required', 'err'); return; }
      if (rating < 1 || rating > 5) { toast('pick a star rating', 'err'); return; }
      if (onCooldown()) { toast('slow down — wait a few seconds', 'err'); return; }

      var btn = document.getElementById('rSubmit');
      btn.disabled = true; btn.textContent = 'Posting…';

      fetch(API_URL + '/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.slice(0, 32), rating: rating, body: body.slice(0, 1000) })
      }).then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      }).then(function () {
        markCooldown();
        form.reset(); rating = 0;
        Array.prototype.forEach.call(starsWrap.querySelectorAll('.star'), function (b) { b.classList.remove('on'); });
        toast('review posted ✓', 'ok');
        loadReviews();
      }).catch(function () {
        toast('failed to post review', 'err');
      }).finally(function () {
        btn.disabled = false; btn.textContent = 'Post review';
      });
    });
  })();

  loadReviews();
})();