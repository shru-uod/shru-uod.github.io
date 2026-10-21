/* =========================================================
   SHRU website — behaviour
   You normally do NOT need to edit this file.
   Edit the JSON files in /content instead (see README.md).
   ========================================================= */
(function () {
  "use strict";

  var LANGS = { en: { dir: "ltr", html: "en" }, ar: { dir: "rtl", html: "ar" }, ku: { dir: "rtl", html: "ku-Arab" } };
  var HOME_COUNT = { news: 3, activities: 3, publications: 5 };
  var GALLERY_MAX = 6, GALLERY_DELAY = 6500;
  var expanded = { news: false, activities: false, publications: false };
  var page = document.body.getAttribute("data-page") || "home";
  var lang = pickLang();
  var T = {}, DATA = {};

  function pickLang() {
    var q = new URLSearchParams(location.search).get("lang");
    if (q && LANGS[q]) return q;
    try { var s = localStorage.getItem("shru-lang"); if (s && LANGS[s]) return s; } catch (e) {}
    return "en";
  }
  // A field can be plain text or {"en": "...", "ar": "...", "ku": "..."}
  function tr(v) { if (v == null) return ""; if (typeof v === "string") return v; return v[lang] || v.en || ""; }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function fmtDate(iso) {
    var d = new Date(iso); if (isNaN(d)) return esc(iso || "");
    return d.getUTCDate() + " " + ((T.months || [])[d.getUTCMonth()] || (d.getUTCMonth() + 1)) + " " + d.getUTCFullYear();
  }
  function getJSON(path) { return fetch(path, { cache: "no-cache" }).then(function (r) { if (!r.ok) throw new Error(path + " " + r.status); return r.json(); }); }
  function byDateDesc(a, b) { return String(b.date || b.year || "").localeCompare(String(a.date || a.year || "")); }
  function $(id) { return document.getElementById(id); }

  var TRACE = '<svg viewBox="0 0 200 60" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true"><polyline points="0,30 60,30 72,10 84,52 96,18 106,40 116,30 200,30"/></svg>';
  var PH_IMG = '<div class="card-img-ph" aria-hidden="true">' + TRACE + '</div>';

  /* ---------- UI strings ---------- */
  function applyStrings() {
    var cfg = LANGS[lang];
    document.documentElement.lang = cfg.html;
    document.documentElement.dir = cfg.dir;
    document.querySelectorAll("[data-i18n]").forEach(function (el) { var k = el.getAttribute("data-i18n"); if (typeof T[k] === "string") el.textContent = T[k]; });
    document.querySelectorAll("[data-toggle]").forEach(function (b) { b.textContent = expanded[b.getAttribute("data-toggle")] ? T.show_less : T.view_all; });
    document.querySelectorAll(".lang-switch button").forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-lang") === lang ? "true" : "false"); });
    if ($("gal-prev")) { $("gal-prev").setAttribute("aria-label", T.gal_prev || "Previous"); $("gal-next").setAttribute("aria-label", T.gal_next || "Next"); }
    if (page === "home" && T.page_title) document.title = T.page_title;
  }

  /* ---------- hero gallery ---------- */
  var gal = { items: [], i: 0, timer: null, paused: false };
  function galleryItems() {
    var acts = (DATA.activities || []).map(function (a) { return { src: a, kind: "activity" }; });
    var news = (DATA.news || []).map(function (n) { return { src: n, kind: "news" }; });
    var all = acts.concat(news).sort(function (a, b) { return byDateDesc(a.src, b.src); });
    var hl = all.filter(function (x) { return x.src.highlight; });
    if (!hl.length) hl = all.filter(function (x) { return x.src.image; });
    if (!hl.length) hl = all;
    return hl.slice(0, GALLERY_MAX);
  }
  function tagOf(x) { return x.kind === "news" ? (T.type_news || "News") : (T["type_" + x.src.type] || ""); }
  function renderGallery() {
    var stage = $("gal-stage"); if (!stage) return;
    gal.items = galleryItems();
    if (gal.i >= gal.items.length) gal.i = 0;
    if (!gal.items.length) {
      stage.innerHTML = '<figure class="slide is-active"><div class="slide-ph">' + TRACE + '</div><figcaption><div class="container"><div class="caption"><h2>' +
        esc(T.intro_title || "") + '</h2><p>' + esc(T.empty || "") + '</p></div></div></figcaption></figure>';
      $("gal-dots").innerHTML = ""; $("gal-thumbs").innerHTML = ""; $("gal-count").textContent = "";
      $("gal-prev").hidden = $("gal-next").hidden = true; return;
    }
    stage.innerHTML = gal.items.map(function (x, k) {
      var s = x.src;
      var img = s.image ? '<img src="' + esc(s.image) + '" alt="' + esc(tr(s.title)) + '"' + (k ? ' loading="lazy"' : '') + '>' : '<div class="slide-ph">' + TRACE + '</div>';
      var tag = tagOf(x) ? '<span class="tag">' + esc(tagOf(x)) + '</span>' : '';
      var more = s.link ? '<a href="' + esc(s.link) + '" target="_blank" rel="noopener">' + esc(T.read_more || "Read more") + '</a>' : '';
      var place = s.place ? ' · ' + esc(tr(s.place)) : '';
      return '<figure class="slide' + (k === gal.i ? ' is-active' : '') + '" role="group" aria-roledescription="slide" aria-label="' + (k + 1) + ' / ' + gal.items.length + '">' + img +
        '<figcaption><div class="container"><div class="caption">' + tag + '<time datetime="' + esc(s.date || "") + '">' + fmtDate(s.date) + place + '</time>' +
        '<h2>' + esc(tr(s.title)) + '</h2><p>' + esc(tr(s.summary)) + '</p>' + more + '</div></div></figcaption></figure>';
    }).join("");
    $("gal-dots").innerHTML = gal.items.map(function (x, k) {
      return '<button type="button" data-k="' + k + '" aria-label="' + esc((T.gal_goto || "Show slide {n}").replace("{n}", k + 1)) + '"></button>';
    }).join("");
    $("gal-thumbs").innerHTML = gal.items.slice(0, 4).map(function (x, k) {
      var s = x.src, im = s.image ? '<img src="' + esc(s.image) + '" alt="" loading="lazy">' : '<span class="t-ph"></span>';
      return '<button type="button" class="thumb" data-k="' + k + '">' + im + '<span><b>' + esc(tr(s.title)) + '</b><small>' + esc(tagOf(x)) + ' · ' + fmtDate(s.date) + '</small></span></button>';
    }).join("");
    var one = gal.items.length < 2;
    $("gal-prev").hidden = $("gal-next").hidden = one;
    showSlide(gal.i, true);
  }
  function showSlide(k, noRestart) {
    var n = gal.items.length; if (!n) return;
    gal.i = (k + n) % n;
    document.querySelectorAll("#gal-stage .slide").forEach(function (el, j) { el.classList.toggle("is-active", j === gal.i); });
    document.querySelectorAll("#gal-dots button, #gal-thumbs .thumb").forEach(function (b) { b.setAttribute("aria-current", +b.getAttribute("data-k") === gal.i ? "true" : "false"); });
    $("gal-count").textContent = (gal.i + 1) + " / " + n;
    if (!noRestart) restart();
  }
  function restart() {
    clearInterval(gal.timer);
    if (gal.items.length < 2 || gal.paused || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gal.timer = setInterval(function () { showSlide(gal.i + 1, true); }, GALLERY_DELAY);
  }
  function initGallery() {
    var root = document.querySelector(".gallery"); if (!root) return;
    $("gal-prev").addEventListener("click", function () { showSlide(gal.i - 1); });
    $("gal-next").addEventListener("click", function () { showSlide(gal.i + 1); });
    [$("gal-dots"), $("gal-thumbs")].forEach(function (box) {
      box.addEventListener("click", function (e) { var b = e.target.closest("[data-k]"); if (b) showSlide(+b.getAttribute("data-k")); });
    });
    root.addEventListener("mouseenter", function () { gal.paused = true; restart(); });
    root.addEventListener("mouseleave", function () { gal.paused = false; restart(); });
    root.addEventListener("focusin", function () { gal.paused = true; restart(); });
    root.addEventListener("focusout", function () { gal.paused = false; restart(); });
    root.addEventListener("keydown", function (e) {
      var rtl = document.documentElement.dir === "rtl";
      if (e.key === "ArrowRight") showSlide(gal.i + (rtl ? -1 : 1));
      if (e.key === "ArrowLeft") showSlide(gal.i + (rtl ? 1 : -1));
    });
    var x0 = null;
    root.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    root.addEventListener("touchend", function (e) {
      if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 40) { var rtl = document.documentElement.dir === "rtl"; showSlide(gal.i + ((dx < 0) !== rtl ? 1 : -1)); }
    });
    restart();
  }

  /* ---------- sections ---------- */
  function visible(key, list) {
    var btn = document.querySelector('[data-toggle="' + key + '"]');
    if (btn) btn.hidden = list.length <= HOME_COUNT[key];
    return expanded[key] ? list : list.slice(0, HOME_COUNT[key]);
  }
  function renderResearch() {
    var el = $("research-list"); if (!el) return;
    el.innerHTML = (DATA.research || []).map(function (r, i) {
      return '<article class="card research-card"><div class="card-body"><span class="num">' + String(i + 1).padStart(2, "0") + '</span>' +
        '<h3>' + esc(tr(r.title)) + '</h3><p>' + esc(tr(r.summary)) + '</p></div></article>';
    }).join("") || '<p class="empty">' + esc(T.empty) + '</p>';
  }
  function card(item, tag) {
    var img = item.image ? '<img class="card-img" src="' + esc(item.image) + '" alt="" loading="lazy">' : PH_IMG;
    var more = item.link ? '<a class="card-more" href="' + esc(item.link) + '" target="_blank" rel="noopener">' + esc(T.read_more) + '</a>' : "";
    return '<article class="card">' + img + '<div class="card-body"><span class="card-meta">' + (tag ? '<span class="tag">' + esc(tag) + '</span>' : '') +
      '<time datetime="' + esc(item.date || "") + '">' + fmtDate(item.date) + '</time></span>' +
      '<h3>' + esc(tr(item.title)) + '</h3><p>' + esc(tr(item.summary)) + '</p>' +
      (item.place ? '<span class="place">' + esc(tr(item.place)) + '</span>' : '') + more + '</div></article>';
  }
  function renderNews() {
    var el = $("news-list"); if (!el) return;
    var list = (DATA.news || []).slice().sort(byDateDesc);
    el.innerHTML = visible("news", list).map(function (n) { return card(n, ""); }).join("") || '<p class="empty">' + esc(T.empty) + '</p>';
  }
  function renderActivities() {
    var el = $("activities-list"); if (!el) return;
    var list = (DATA.activities || []).slice().sort(byDateDesc);
    el.innerHTML = visible("activities", list).map(function (a) { return card(a, T["type_" + a.type] || ""); }).join("") || '<p class="empty">' + esc(T.empty) + '</p>';
  }
  function renderPublications() {
    var el = $("publications-list"); if (!el) return;
    var list = (DATA.publications || []).slice().sort(byDateDesc);
    el.innerHTML = visible("publications", list).map(function (p) {
      var href = p.doi ? "https://doi.org/" + p.doi : (p.link || "");
      var title = href ? '<a class="pub-title" href="' + esc(href) + '" target="_blank" rel="noopener">' + esc(p.title) + '</a>' : '<span class="pub-title">' + esc(p.title) + '</span>';
      return '<li class="pub"><span class="pub-year">' + esc(p.year || "") + '</span><div>' + title + '<div class="pub-meta">' + esc(p.authors || "") +
        (p.venue ? ' — <em>' + esc(p.venue) + '</em>' : '') + (p.doi ? ' · DOI: ' + esc(p.doi) : '') + '</div></div></li>';
    }).join("") || '<li class="empty">' + esc(T.empty) + '</li>';
  }
  function renderTeam() {
    var el = $("team-list"); if (!el) return;
    var AV = '<div class="avatar" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg></div>';
    el.innerHTML = (DATA.team || []).map(function (m) {
      var name = tr(m.name);
      var pic = m.photo ? '<img src="' + esc(m.photo) + '" alt="' + esc(name) + '" loading="lazy">' : AV;
      var nm = m.link ? '<a href="' + esc(m.link) + '" target="_blank" rel="noopener">' + esc(name) + '</a>' : esc(name);
      return '<div class="member">' + pic + '<h3>' + nm + '</h3><p>' + esc(tr(m.role)) + '</p>' + (m.email ? '<p><a href="mailto:' + esc(m.email) + '">' + esc(m.email) + '</a></p>' : '') + '</div>';
    }).join("") || '<p class="empty">' + esc(T.empty) + '</p>';
  }
  function renderSite() {
    var s = DATA.site || {}, a = $("contact-email");
    if (s.email && a) { a.href = "mailto:" + s.email; a.textContent = s.email; }
  }
  function renderAll() {
    applyStrings();
    renderSite(); renderGallery(); renderResearch(); renderActivities(); renderNews(); renderPublications(); renderTeam();
    window.SHRU = { lang: lang, T: T };
    document.dispatchEvent(new CustomEvent("shru:lang", { detail: { lang: lang, T: T } }));
  }

  /* ---------- language + UI events ---------- */
  function setLang(l) {
    lang = l;
    try { localStorage.setItem("shru-lang", l); } catch (e) {}
    getJSON("content/i18n/" + l + ".json").then(function (t) { T = t; renderAll(); });
  }
  document.querySelectorAll(".lang-switch button").forEach(function (b) { b.addEventListener("click", function () { setLang(b.getAttribute("data-lang")); }); });
  document.querySelectorAll("[data-toggle]").forEach(function (b) {
    b.addEventListener("click", function () { var k = b.getAttribute("data-toggle"); expanded[k] = !expanded[k]; renderAll(); });
  });
  var toggle = document.querySelector(".nav-toggle"), nav = $("main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () { var open = nav.classList.toggle("open"); toggle.setAttribute("aria-expanded", open ? "true" : "false"); });
    nav.addEventListener("click", function (e) { if (e.target.tagName === "A") { nav.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); } });
  }
  if ($("year")) $("year").textContent = new Date().getFullYear();

  /* ---------- boot ---------- */
  var files = page === "home" ? ["site", "research", "news", "activities", "publications", "team"] : ["site"];
  Promise.all([getJSON("content/i18n/" + lang + ".json")].concat(files.map(function (f) {
    return getJSON("content/" + f + ".json").catch(function (e) { console.warn(e); return []; });
  }))).then(function (res) {
    T = res[0];
    files.forEach(function (f, i) { DATA[f] = res[i + 1]; });
    renderAll();
    initGallery();
  }).catch(function (e) {
    console.error(e);
    var box = $("gal-stage") || $("page-error");
    if (box) box.innerHTML = '<p style="padding:40px 20px;color:#fff">Content could not load. If you opened the file directly from your computer, use GitHub Pages or a local web server (see README).</p>';
  });
})();
