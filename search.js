(function () {
  function normalizeSpaced(s) {
    return s.toLowerCase();
  }
  function normalizeCollapsed(s) {
    return s.toLowerCase().replace(/[^a-z0-9]/g, "");
  }

  function getPrefix() {
    var path = window.location.pathname;
    if (path.indexOf("/articles/") !== -1 || path.indexOf("/categories/") !== -1) {
      return "../";
    }
    return "";
  }

  document.addEventListener("DOMContentLoaded", function () {
    var input = document.getElementById("site-search-input");
    var resultsBox = document.getElementById("site-search-results");
    var wrapper = document.getElementById("site-search");
    if (!input || !resultsBox || !window.ARTICLES) return;

    var prefix = getPrefix();
    var articles = window.ARTICLES.map(function (a) {
      var haySpaced = normalizeSpaced(a.title + " " + a.desc + " " + a.cat_name);
      var hayCollapsed = normalizeCollapsed(haySpaced);
      return {
        title: a.title,
        desc: a.desc,
        cat_name: a.cat_name,
        href: prefix + "articles/" + a.slug,
        haySpaced: haySpaced,
        hayCollapsed: hayCollapsed
      };
    });

    function closeResults() {
      resultsBox.innerHTML = "";
      resultsBox.classList.remove("show");
    }

    function renderResults(query) {
      var q = query.trim().toLowerCase();
      if (!q) {
        closeResults();
        return;
      }
      var qCollapsed = q.replace(/[^a-z0-9]/g, "");
      var matches = articles.filter(function (a) {
        return a.haySpaced.indexOf(q) !== -1 || (qCollapsed && a.hayCollapsed.indexOf(qCollapsed) !== -1);
      });

      if (matches.length === 0) {
        resultsBox.innerHTML = '<div class="search-empty">No guides match "' + escapeHtml(query) + '".</div>';
        resultsBox.classList.add("show");
        return;
      }

      var limited = matches.slice(0, 8);
      var html = limited.map(function (a) {
        return (
          '<a class="search-result" href="' + a.href + '">' +
          '<span class="search-result-cat">' + escapeHtml(a.cat_name) + '</span>' +
          '<span class="search-result-title">' + escapeHtml(a.title) + '</span>' +
          '</a>'
        );
      }).join("");

      if (matches.length > limited.length) {
        html += '<div class="search-more">' + (matches.length - limited.length) + ' more match' + (matches.length - limited.length === 1 ? "" : "es") + " — keep typing to narrow it down.</div>";
      }

      resultsBox.innerHTML = html;
      resultsBox.classList.add("show");
    }

    function escapeHtml(s) {
      return s.replace(/[&<>"']/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
      });
    }

    input.addEventListener("input", function () {
      renderResults(input.value);
    });

    input.addEventListener("focus", function () {
      if (input.value.trim()) renderResults(input.value);
    });

    input.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        input.value = "";
        closeResults();
        input.blur();
      }
    });

    document.addEventListener("click", function (e) {
      if (wrapper && !wrapper.contains(e.target)) {
        closeResults();
      }
    });
  });
})();
