(function () {
  var root = document.documentElement;
  var pages = Array.prototype.slice.call(document.querySelectorAll("article.page"));
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-link"));
  var order = navLinks.map(function (a) { return a.getAttribute("href").slice(1); });
  var byId = {};
  pages.forEach(function (p) { byId[p.id] = p; });
  var tocList = document.getElementById("tocList");
  var sidebar = document.getElementById("sideNav");
  var scrim = document.getElementById("scrim");
  var menuBtn = document.getElementById("menuBtn");
  var current = null, observer = null;

  function text(el, sel) { var n = el.querySelector(sel); return n ? n.textContent.trim() : ""; }
  function titleOf(id) { return text(byId[id], "h1"); }
  function leadOf(id) { return text(byId[id], ".lead"); }
  function chevron(dir) {
    return '<svg class="i" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + (dir === "left" ? "m15 18-6-6 6-6" : "m9 18 6-6-6-6") + '"/></svg>';
  }
  function esc(s) { return s.replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  function buildToc(page) {
    var secs = Array.prototype.slice.call(page.querySelectorAll("h2.sec"));
    var items = secs.map(function (h) { return '<li><a href="#' + h.id + '" data-sec="' + h.id + '">' + esc(h.textContent.trim()) + "</a></li>"; }).join("");
    tocList.innerHTML = items;
    document.getElementById("toc").style.visibility = secs.length ? "visible" : "hidden";
    var inline = page.querySelector(".toc-inline");
    if (inline) {
      inline.hidden = secs.length < 2;
      inline.open = false;
      inline.querySelector("ol").innerHTML = items;
    }
    if (observer) observer.disconnect();
    if (secs.length && "IntersectionObserver" in window) {
      observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) setActive(en.target.id);
        });
      }, { rootMargin: "-40px 0px -70% 0px" });
      secs.forEach(function (h) { observer.observe(h); });
      setActive(secs[0].id);
    }
  }
  function setActive(id) {
    Array.prototype.forEach.call(tocList.querySelectorAll("a"), function (a) {
      a.classList.toggle("active", a.getAttribute("data-sec") === id);
    });
  }

  function buildPager(page) {
    var i = order.indexOf(page.id), html = "";
    if (i > 0) {
      var p = order[i - 1];
      html += '<a class="prev" href="#' + p + '"><span class="p-t">' + chevron("left") + esc(titleOf(p)) + '</span><span class="p-d">' + esc(leadOf(p)) + "</span></a>";
    }
    if (i < order.length - 1) {
      var n = order[i + 1];
      html += '<a class="next" href="#' + n + '"><span class="p-t">' + chevron("right") + esc(titleOf(n)) + '</span><span class="p-d">' + esc(leadOf(n)) + "</span></a>";
    }
    page.querySelector(".pager").innerHTML = html;
  }

  function show(page, section) {
    if (page !== current) {
      if (current) current.hidden = true;
      page.hidden = false;
      current = page;
      navLinks.forEach(function (a) {
        var on = a.getAttribute("href") === "#" + page.id;
        if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
        if (on && a.scrollIntoView) {
          var nav = a.parentElement, r = a.getBoundingClientRect(), nr = nav.getBoundingClientRect();
          if (r.top < nr.top || r.bottom > nr.bottom) a.scrollIntoView({ block: "nearest" });
        }
      });
      buildToc(page);
      buildPager(page);
      document.title = titleOf(page.id) + " | LM Studio Lab Wiki";
      window.scrollTo(0, 0);
    }
    closeMenu();
    if (section) {
      var inline = page.querySelector(".toc-inline");
      if (inline) inline.open = false;
      section.scrollIntoView({ block: "start" });
      setActive(section.id);
    }
  }

  function route() {
    var h = "";
    try { h = decodeURIComponent(location.hash.slice(1)); } catch (e) { h = location.hash.slice(1); }
    var el = h ? document.getElementById(h) : null;
    var page = el && el.closest ? el.closest("article.page") : null;
    var section = page && el !== page ? el : null;
    show(page || byId["start-here"] || pages[0], section);
  }
  window.addEventListener("hashchange", route);
  window.addEventListener("popstate", route);

  /* Switch pages directly. Embeds such as Google Sites run this page in a sealed frame
     where "#page" links don't navigate, so never rely on the address changing. */
  function go(id) {
    var el = document.getElementById(id);
    if (!el) return;
    var page = el.closest ? el.closest("article.page") : null;
    if (!page) return;
    show(page, el !== page ? el : null);
    try { history.pushState(null, "", "#" + id); } catch (e) {}
  }
  document.addEventListener("click", function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!a) return;
    var id = a.getAttribute("href").slice(1);
    if (!id || !document.getElementById(id)) return;
    e.preventDefault();
    if (!overlay.hidden) closeSearch();
    go(id);
  });

  /* ---------- mobile menu ---------- */
  function closeMenu() {
    sidebar.classList.remove("open");
    scrim.hidden = true;
    menuBtn.setAttribute("aria-expanded", "false");
  }
  menuBtn.addEventListener("click", function () {
    var open = !sidebar.classList.contains("open");
    sidebar.classList.toggle("open", open);
    scrim.hidden = !open;
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
  });
  scrim.addEventListener("click", closeMenu);

  /* ---------- theme ---------- */
  try { var saved = localStorage.getItem("lmwiki-theme"); if (saved === "light" || saved === "dark") root.setAttribute("data-theme", saved); } catch (e) {}
  document.getElementById("themeBtn").addEventListener("click", function () {
    var now = root.getAttribute("data-theme") || (window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    var next = now === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("lmwiki-theme", next); } catch (e) {}
  });

  /* ---------- search ---------- */
  var overlay = document.getElementById("searchOverlay");
  var sq = document.getElementById("sq");
  var sres = document.getElementById("sres");
  var index = pages.map(function (p) {
    return {
      id: p.id,
      title: titleOf(p.id),
      group: text(p, ".crumb"),
      lead: leadOf(p.id),
      t: titleOf(p.id).toLowerCase(),
      all: (p.querySelector(".lead").textContent + " " + p.querySelector(".prose").textContent).toLowerCase()
    };
  });
  var suggested = ["start-here", "lab-rules", "approved-models", "troubleshooting", "glossary"];
  var sel = 0;

  function resultHtml(r) {
    return '<li><a href="#' + r.id + '"><span class="r-g">' + esc(r.group) + '</span><span class="r-t">' + esc(r.title) + '</span><span class="r-d">' + esc(r.lead) + "</span></a></li>";
  }
  function runSearch() {
    var words = sq.value.toLowerCase().split(/\s+/).filter(Boolean);
    var list;
    if (!words.length) {
      list = suggested.map(function (id) { return index.filter(function (r) { return r.id === id; })[0]; }).filter(Boolean);
      sres.innerHTML = '<li class="label">Suggested</li>' + list.map(resultHtml).join("");
    } else {
      list = index.map(function (r, i) {
        var hay = r.t + " " + r.all;
        if (!words.every(function (w) { return hay.indexOf(w) >= 0; })) return null;
        var score = 0;
        words.forEach(function (w) {
          if (r.t.indexOf(w) >= 0) score += 10;
          if (r.lead.toLowerCase().indexOf(w) >= 0) score += 3;
          score += Math.min(r.all.split(w).length - 1, 6);
        });
        return { r: r, s: score, i: i };
      }).filter(Boolean).sort(function (a, b) { return b.s - a.s || a.i - b.i; }).slice(0, 20).map(function (x) { return x.r; });
      sres.innerHTML = list.length ? list.map(resultHtml).join("") : '<li class="none">No pages match. Try one word, like “preset” or “server.”</li>';
    }
    sel = 0; mark();
  }
  function links() { return Array.prototype.slice.call(sres.querySelectorAll("a")); }
  function mark() {
    links().forEach(function (a, i) {
      a.classList.toggle("sel", i === sel);
      if (i === sel) a.scrollIntoView({ block: "nearest" });
    });
  }
  function openSearch() {
    overlay.hidden = false;
    sq.value = "";
    runSearch();
    setTimeout(function () { sq.focus(); }, 0);
  }
  function closeSearch() { overlay.hidden = true; }
  Array.prototype.forEach.call(document.querySelectorAll("[data-open-search]"), function (b) { b.addEventListener("click", openSearch); });
  document.getElementById("searchClose").addEventListener("click", closeSearch);
  overlay.addEventListener("click", function (e) { if (e.target === overlay) closeSearch(); });
  sq.addEventListener("input", runSearch);
  sq.addEventListener("keydown", function (e) {
    var ls = links();
    if (e.key === "ArrowDown") { e.preventDefault(); if (ls.length) { sel = (sel + 1) % ls.length; mark(); } }
    else if (e.key === "ArrowUp") { e.preventDefault(); if (ls.length) { sel = (sel - 1 + ls.length) % ls.length; mark(); } }
    else if (e.key === "Enter") { e.preventDefault(); if (ls[sel]) { closeSearch(); go(ls[sel].getAttribute("href").slice(1)); } }
  });
  document.addEventListener("keydown", function (e) {
    var typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
    if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) { e.preventDefault(); overlay.hidden ? openSearch() : closeSearch(); }
    else if (e.key === "/" && !typing && overlay.hidden) { e.preventDefault(); openSearch(); }
    else if (e.key === "Escape") { if (!overlay.hidden) closeSearch(); else closeMenu(); }
  });

  /* ---------- copy buttons ---------- */
  Array.prototype.forEach.call(document.querySelectorAll(".copy"), function (btn) {
    btn.addEventListener("click", function () {
      var code = btn.parentElement.querySelector("code");
      var textToCopy = code.textContent;
      function done(label) { btn.textContent = label; setTimeout(function () { btn.textContent = "Copy"; }, 1600); }
      function fallback() {
        var range = document.createRange();
        range.selectNodeContents(code);
        var s = window.getSelection();
        s.removeAllRanges();
        s.addRange(range);
        var ok = false;
        try { ok = document.execCommand("copy"); } catch (err) { ok = false; }
        done(ok ? "Copied" : "Press Ctrl+C");
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(textToCopy).then(function () { done("Copied"); }, fallback);
      } else { fallback(); }
    });
  });

  route();
})();

