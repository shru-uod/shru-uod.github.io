/* =========================================================
   SHRU website — behaviour
   You normally do NOT need to edit this file.
   Edit the JSON files in /content instead (see README.md).
   ========================================================= */
(function () {
  "use strict";

  var LANGS = { en: { dir: "ltr", html: "en" }, ar: { dir: "rtl", html: "ar" }, ku: { dir: "rtl", html: "ku-Arab" } };
  var HOME_COUNT = { news: 4 };
  var GALLERY_DELAY = 6500;
  var expanded = { news: false };
  var page = document.body.getAttribute("data-page") || "home";
  var lang = pickLang();
  var T = {}, DATA = {};

  function pickLang() {
    var q = new URLSearchParams(location.search).get("lang");
    if (q && LANGS[q]) return q;
    try { var s = localStorage.getItem("shru-lang"); if (s && LANGS[s]) return s; } catch (e) {}
    return "en";
  }
  function tr(v) { if (v == null) return ""; if (typeof v === "string") return v; return v[lang] || v.en || ""; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function fmtDate(iso) {
    var d = new Date(iso); if (isNaN(d)) return esc(iso || "");
    return d.getUTCDate() + " " + ((T.months || [])[d.getUTCMonth()] || (d.getUTCMonth() + 1)) + " " + d.getUTCFullYear();
  }
  function getJSON(path) { return fetch(path, { cache: "no-cache" }).then(function (r) { if (!r.ok) throw new Error(path + " " + r.status); return r.json(); }); }
  function byDateDesc(a, b) { return String(b.date || b.year || "").localeCompare(String(a.date || a.year || "")); }
  function $(id) { return document.getElementById(id); }
  function ext(u) { return /^https?:/.test(u || "") ? ' target="_blank" rel="noopener"' : ""; }
  var ICON = {
    pdf: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/><path d="M12 12v6M9 15l3 3 3-3"/></svg>',
    img: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 17l-5-5-9 8"/></svg>',
    link: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></svg>',
    code: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h12l4 4v12H4z"/><path d="M8 12h8M8 16h8M8 8h4"/></svg>',
    thesis: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c3 2 9 2 12 0v-5"/></svg>',
    map: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14M15 6v14"/></svg>',
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="rgba(0,0,0,.55)" stroke="none"/><path d="M10 8l6 4-6 4z" fill="#fff" stroke="none"/></svg>'
  };

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

  /* ---------- hero gallery (content/highlights.json) ---------- */
  var gal = { items: [], i: 0, timer: null, paused: false };
  function renderGallery() {
    var stage = $("gal-stage"); if (!stage) return;
    gal.items = (DATA.highlights || []).slice(0, 8);
    if (gal.i >= gal.items.length) gal.i = 0;
    stage.innerHTML = gal.items.map(function (s, k) {
      var link = s.link ? '<a class="cap-link" href="' + esc(s.link) + '"' + ext(s.link) + '>' + esc(T.read_more || "Read more") + ' →</a>' : "";
      return '<figure class="slide' + (k === gal.i ? " is-active" : "") + '" role="group" aria-roledescription="slide" aria-label="' + (k + 1) + " / " + gal.items.length + '">' +
        '<div class="slide-bg" style="background-image:url(\'' + esc(s.image) + '\')"></div>' +
        '<div class="container slide-inner"><figcaption class="caption"><span class="tag">' + esc(tr(s.tag)) + '</span>' +
        '<time datetime="' + esc(s.date) + '">' + fmtDate(s.date) + '</time><h2>' + esc(tr(s.title)) + '</h2><p>' + esc(tr(s.summary)) + '</p>' + link + '</figcaption>' +
        '<div class="slide-media"><img src="' + esc(s.image) + '" alt="' + esc(tr(s.title)) + '"' + (k ? ' loading="lazy"' : "") + '></div></div></figure>';
    }).join("");
    $("gal-dots").innerHTML = gal.items.map(function (x, k) {
      return '<button type="button" data-k="' + k + '" aria-label="' + esc((T.gal_goto || "Show slide {n}").replace("{n}", k + 1)) + '"></button>';
    }).join("");
    $("gal-thumbs").innerHTML = gal.items.slice(0, 5).map(function (s, k) {
      return '<button type="button" class="thumb" data-k="' + k + '"><img src="' + esc(s.image) + '" alt="" loading="lazy"><span><b>' + esc(tr(s.title)) + '</b><small>' + esc(tr(s.tag)) + " · " + fmtDate(s.date) + '</small></span></button>';
    }).join("");
    $("gal-prev").hidden = $("gal-next").hidden = gal.items.length < 2;
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

  /* ---------- numbers + visitor counter ---------- */
  var visits = null;
  function renderStats() {
    var el = $("stats-list"); if (!el) return;
    var s = DATA.site || {};
    var tiles = (s.stats || []).map(function (x) { return '<div class="stat-tile"><b>' + esc(x.value) + '</b><span>' + esc(tr(x.label)) + '</span></div>'; });
    tiles.push('<div class="stat-tile visits" title="' + esc(T.visitors_note || "") + '"><b id="visits-n">' + (visits ? esc(visits) : "—") + '</b><span>' + esc(T.visitors || "website visits") + '</span></div>');
    el.innerHTML = tiles.join("");
    var fv = $("footer-visits"); if (fv) fv.textContent = visits ? " · " + visits + " " + (T.visitors || "") : "";
  }
  function initCounter() {
    var code = (DATA.site || {}).goatcounter; if (!code) return;
    var base = "https://" + code + ".goatcounter.com";
    var sc = document.createElement("script");
    sc.async = true; sc.src = "https://gc.zgo.at/count.js"; sc.setAttribute("data-goatcounter", base + "/count");
    document.body.appendChild(sc);
    fetch(base + "/counter/TOTAL.json").then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .then(function (j) { visits = j.count; renderStats(); }).catch(function () {});
  }

  /* ---------- sections ---------- */
  function renderResearch() {
    var el = $("research-list"); if (!el) return;
    el.innerHTML = (DATA.research || []).map(function (r, i) {
      return '<article class="card research-card"><div class="card-body"><span class="num">' + String(i + 1).padStart(2, "0") + '</span>' +
        '<h3>' + esc(tr(r.title)) + '</h3><p>' + esc(tr(r.summary)) + '</p></div></article>';
    }).join("");
  }
  function renderBuildings() {
    var el = $("buildings-list"); if (!el) return;
    el.innerHTML = (DATA.buildings || []).map(function (b) {
      return '<figure class="photo"><button type="button" class="zoom" data-src="' + esc(b.image) + '" data-cap="' + esc(tr(b.title)) + '"><img src="' + esc(b.image) + '" alt="' + esc(tr(b.title)) + '" loading="lazy"></button>' +
        '<figcaption><b>' + esc(tr(b.title)) + '</b><span>' + esc(tr(b.text)) + '</span></figcaption></figure>';
    }).join("");
  }
  function renderStudies() {
    var el = $("studies-list"); if (!el) return;
    el.innerHTML = (DATA.studies || []).map(function (s) {
      var btns = [];
      if (s.download) btns.push('<a class="btn btn-primary btn-sm" href="' + esc(s.download) + '" download>' + ICON.pdf + esc(T.download_thesis) + '</a>');
      if (s.card) btns.push('<a class="btn btn-outline btn-sm" href="' + esc(s.card) + '" download>' + ICON.img + esc(T.summary_card) + '</a>');
      return '<article class="study">' +
        '<button type="button" class="study-fig zoom" data-src="' + esc(s.card || s.image) + '" data-cap="' + esc(s.title) + '"><img src="' + esc(s.image) + '" alt="" loading="lazy"><span class="deg">' + esc(s.degree) + " · " + esc(s.year) + '</span></button>' +
        '<div class="study-body"><div class="chips"><span class="chip">' + esc(tr(s.city)) + '</span><span class="chip">' + esc(tr(s.typology)) + '</span></div>' +
        '<h3 dir="ltr">' + esc(s.title) + '</h3>' +
        '<p class="study-meta" dir="ltr">' + esc(s.author) + " · " + esc(s.institution) + '</p>' +
        (s.supervisor ? '<p class="study-sup"><b>' + esc(T.supervision) + ':</b> <span dir="ltr">' + esc(s.supervisor) + '</span></p>' : "") +
        '<p>' + esc(tr(s.summary)) + '</p>' +
        '<details><summary>' + esc(T.findings) + '</summary><ul dir="ltr">' + s.findings.map(function (f) { return "<li>" + esc(f) + "</li>"; }).join("") + '</ul></details>' +
        (s.related ? '<p class="study-rel"><b>' + esc(T.related) + ':</b> <span dir="ltr">' + esc(s.related) + '</span></p>' : "") +
        '<div class="btn-row">' + btns.join("") + (s.download ? "" : '<span class="muted">' + esc(T.not_public) + '</span>') + '</div></div></article>';
    }).join("");
  }
  function renderNews() {
    var el = $("news-list"); if (!el) return;
    var list = (DATA.news || []).slice().sort(byDateDesc);
    var btn = document.querySelector('[data-toggle="news"]'); if (btn) btn.hidden = list.length <= HOME_COUNT.news;
    if (!expanded.news) list = list.slice(0, HOME_COUNT.news);
    el.innerHTML = list.map(function (n, idx) {
      var imgs = n.images && n.images.length ? n.images : (n.image ? [n.image] : []);
      var pics = imgs.map(function (src, j) { return '<button type="button" class="zoom' + (j ? " small" : "") + '" data-src="' + esc(src) + '" data-cap="' + esc(tr(n.title)) + '"><img src="' + esc(src) + '" alt="' + esc(tr(n.title)) + '" loading="lazy"></button>'; }).join("");
      var more = n.link ? '<a class="card-more" href="' + esc(n.link) + '"' + ext(n.link) + '>' + esc(T.read_more) + ' →</a>' : "";
      return '<article class="news' + (idx === 0 ? " news-lead" : "") + '"><div class="news-pics n' + Math.min(imgs.length, 2) + '">' + pics + '</div>' +
        '<div class="news-body"><span class="card-meta"><span class="tag">' + esc(T["type_" + n.type] || T.type_news) + '</span><time datetime="' + esc(n.date) + '">' + fmtDate(n.date) + '</time></span>' +
        '<h3>' + esc(tr(n.title)) + '</h3><p>' + esc(tr(n.summary)) + '</p>' + (n.place ? '<span class="place">' + esc(tr(n.place)) + '</span>' : "") + more + '</div></article>';
    }).join("") || '<p class="empty">' + esc(T.empty) + '</p>';
  }
  function renderPublications() {
    var el = $("publications-list"); if (!el) return;
    var list = (DATA.publications || []).slice().sort(function (a, b) { return (a.access === "prep") - (b.access === "prep") || b.year - a.year; });
    el.innerHTML = list.map(function (p) {
      var badge = p.access === "open" ? '<span class="badge ok">' + esc(T.open_access) + '</span>' : (p.access === "prep" ? '<span class="badge prep">' + esc(T.in_prep) + '</span>' : '');
      var btns = [];
      if (p.pdf) btns.push('<a class="btn btn-primary btn-sm" href="' + esc(p.pdf) + '" download>' + ICON.pdf + 'PDF</a>');
      if (p.doi) btns.push('<a class="btn btn-outline btn-sm" href="https://doi.org/' + esc(p.doi) + '" target="_blank" rel="noopener">' + ICON.link + 'DOI</a>');
      return '<article class="pub-card" dir="ltr"><div class="pub-top"><span class="pub-year">' + esc(p.year) + '</span>' + badge + '</div>' +
        '<h3>' + esc(p.title) + '</h3><p class="pub-meta">' + esc(p.authors) + ' — <em>' + esc(p.venue) + '</em>' + (p.doi ? ' · doi:' + esc(p.doi) : "") + '</p>' +
        (p.finding ? '<p class="pub-find">' + esc(p.finding) + '</p>' : "") + '<div class="btn-row">' + btns.join("") + '</div></article>';
    }).join("");
  }
  function renderResources() {
    var el = $("resources-list"); if (!el) return;
    el.innerHTML = (DATA.resources || []).map(function (r) {
      return '<article class="res"><span class="res-ico">' + (ICON[r.kind] || ICON.pdf) + '</span><div><h3>' + esc(tr(r.title)) + '</h3><p>' + esc(tr(r.text)) + '</p>' +
        '<p class="res-meta">' + esc(r.lang) + " · " + esc(r.size) + '</p><a class="btn btn-primary btn-sm" href="' + esc(r.file) + '" download>' + ICON.pdf + esc(T.download) + '</a></div></article>';
    }).join("");
  }
  function renderQuakes() {
    var Q = DATA.quakes; if (!Q || !$("q-stats")) return;
    var c = Q.counts;
    $("q-stats").innerHTML = [[c.m7, T.q_m7], [c.m6, T.q_m6], ["M" + c.largest, T.q_largest], ["≥ " + Number(7000).toLocaleString("en"), T.q_deaths]].map(function (x) {
      return '<div class="stat-tile light"><b>' + esc(x[0]) + '</b><span>' + esc(x[1]) + '</span></div>';
    }).join("");
    var max = Math.max.apply(null, Q.months.map(function (m) { return m.n; }));
    $("q-bars").innerHTML = Q.months.map(function (m) {
      var mi = +m.m.slice(5, 7) - 1;
      return '<div class="bar"><span class="bar-n">' + m.n + '</span><i style="height:' + Math.round(m.n / max * 100) + '%"></i><span class="bar-l">' + esc((T.months || [])[mi] || m.m) + '</span></div>';
    }).join("");
    $("q-rows").innerHTML = Q.m7.slice().sort(function (a, b) { return b.time.localeCompare(a.time); }).map(function (e) {
      var cls = e.mag >= 7.7 ? "m-hi" : e.mag >= 7.4 ? "m-mid" : "m-lo";
      return '<tr><td>' + fmtDate(e.time) + '</td><td dir="ltr"><a href="https://earthquake.usgs.gov/earthquakes/eventpage/' + esc(e.id) + '" target="_blank" rel="noopener">' + esc(e.place) + '</a></td>' +
        '<td><span class="mag-pill ' + cls + '">M' + e.mag.toFixed(1) + '</span></td><td dir="ltr">' + Math.round(e.depth) + ' km</td><td dir="ltr">' + esc(e.impact) + '</td></tr>';
    }).join("");
    $("q-videos").innerHTML = (Q.videos || []).map(function (v) {
      return '<figure class="video"><button type="button" class="yt" data-id="' + esc(v.id) + '" aria-label="Play: ' + esc(v.title) + '">' +
        '<img src="https://i.ytimg.com/vi/' + esc(v.id) + '/hqdefault.jpg" alt="" loading="lazy">' + ICON.play + '</button><figcaption dir="ltr">' + esc(v.title) + '</figcaption></figure>';
    }).join("");
  }
  function renderTeam() {
    var el = $("team-list"); if (!el) return;
    el.innerHTML = (DATA.team || []).map(function (m) {
      var name = tr(m.name), en = (m.name && m.name.en) || name;
      var ini = en.replace(/(Asst\.|Prof\.|Dr\.)/g, "").trim().split(/\s+/).filter(Boolean).map(function (w) { return w.charAt(0); }).slice(0, 2).join("");
      var pic = m.photo ? '<img src="' + esc(m.photo) + '" alt="' + esc(name) + '" loading="lazy">' : '<div class="avatar" aria-hidden="true">' + esc(ini) + '</div>';
      return '<div class="member">' + pic + '<h3>' + esc(name) + '</h3><p>' + esc(tr(m.role)) + '</p>' + (m.email ? '<p><a href="mailto:' + esc(m.email) + '">' + esc(m.email) + '</a></p>' : "") + '</div>';
    }).join("");
  }
  function renderSite() {
    var s = DATA.site || {}, a = $("contact-email"), ad = $("contact-address");
    if (s.email && a) { a.href = "mailto:" + s.email; a.textContent = s.email; }
    if (s.address && ad) ad.textContent = tr(s.address);
  }
  function renderAll() {
    applyStrings();
    renderSite(); renderGallery(); renderStats(); renderResearch(); renderBuildings(); renderStudies();
    renderQuakes(); renderNews(); renderPublications(); renderResources(); renderTeam();
    window.SHRU = { lang: lang, T: T };
    document.dispatchEvent(new CustomEvent("shru:lang", { detail: { lang: lang, T: T } }));
  }

  /* ---------- lightbox + video facade ---------- */
  var lb = $("lightbox");
  document.addEventListener("click", function (e) {
    var z = e.target.closest(".zoom");
    if (z && lb) { lb.querySelector("img").src = z.getAttribute("data-src"); lb.querySelector(".lb-cap").textContent = z.getAttribute("data-cap") || ""; lb.hidden = false; lb.querySelector(".lb-close").focus(); return; }
    var y = e.target.closest(".yt");
    if (y) {
      var f = document.createElement("iframe");
      f.src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(y.getAttribute("data-id")) + "?autoplay=1&rel=0";
      f.title = y.getAttribute("aria-label"); f.allow = "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"; f.allowFullscreen = true;
      y.replaceWith(f); return;
    }
    if (lb && !lb.hidden && (e.target === lb || e.target.closest(".lb-close"))) lb.hidden = true;
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && lb) lb.hidden = true; });

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
  var files = page === "home"
    ? { site: "site", highlights: "highlights", research: "research", buildings: "buildings", studies: "studies", quakes: "earthquakes-2026", news: "news", publications: "publications", resources: "resources", team: "team" }
    : { site: "site" };
  var keys = Object.keys(files);
  Promise.all([getJSON("content/i18n/" + lang + ".json")].concat(keys.map(function (k) {
    return getJSON("content/" + files[k] + ".json").catch(function (e) { console.warn(e); return null; });
  }))).then(function (res) {
    T = res[0];
    keys.forEach(function (k, i) { DATA[k] = res[i + 1]; });
    renderAll();
    initGallery();
    initCounter();
  }).catch(function (e) {
    console.error(e);
    var box = $("gal-stage") || $("page-error");
    if (box) box.innerHTML = '<p style="padding:40px 20px;color:#fff">Content could not load. If you opened the file directly from your computer, use GitHub Pages or a local web server (see README).</p>';
  });
})();
