/* =========================================================================
   Word Solver — page wiring. Logic lives in /assets/js/word-tools.js.
   ========================================================================= */
(function () {
  const T = window.WordTools;
  const els = {};
  let view = null;
  let lastLetters = "";

  function cache() {
    els.form = document.getElementById("solver-form");
    els.letters = document.getElementById("letters");
    els.include = document.getElementById("include");
    els.starts = document.getElementById("starts");
    els.ends = document.getElementById("ends");
    els.contains = document.getElementById("contains");
    els.length = document.getElementById("length");
    els.sort = document.getElementById("sort");
    els.clear = document.getElementById("clear-btn");
    els.error = document.getElementById("form-error");
    els.results = document.getElementById("results");
    els.summary = document.getElementById("results-summary");
    els.live = document.getElementById("results-status");
  }

  function clearError() {
    els.error.textContent = "";
    els.error.hidden = true;
    els.letters.removeAttribute("aria-invalid");
  }
  function showError(msg) {
    els.error.textContent = msg;
    els.error.hidden = false;
    els.letters.setAttribute("aria-invalid", "true");
    els.letters.focus();
  }

  // Sort control maps to a query sort + a presentation mode.
  // "length" keeps the grouped-by-length view; alpha/score show a flat list.
  function viewConfig() {
    switch (els.sort.value) {
      case "alpha": return { sort: "alpha", mode: "flat", flatLabel: "All matches (A–Z)" };
      case "score": return { sort: "scoreDesc", mode: "flat", flatLabel: "All matches (by score)" };
      default: return { sort: "lengthDesc", mode: "grouped" };
    }
  }

  function solve() {
    clearError();
    const letters = T.cleanLetters(els.letters.value);
    const include = T.cleanLetters(els.include.value);
    const starts = T.cleanLetters(els.starts.value);
    const ends = T.cleanLetters(els.ends.value);
    const contains = T.cleanLetters(els.contains.value);

    if (!letters && !include && !starts && !ends && !contains) {
      view.clear();
      showError("Enter some letters, or use a starts-with, ends-with, or contains filter.");
      return;
    }

    lastLetters = letters;
    const cfg = viewConfig();
    const words = T.searchWords({
      letters, include, startsWith: starts, endsWith: ends, contains,
      lengthMode: els.length.value, sort: cfg.sort
    });
    paint(words, cfg);
  }

  function paint(words, cfg) {
    const longest = words.reduce((a, b) => (b.length > a.length ? b : a), "");
    const lead =
      `<span><strong>${words.length.toLocaleString("en-US")}</strong> word${words.length === 1 ? "" : "s"} found</span>` +
      (lastLetters ? `<span><strong>${lastLetters.length}</strong> letters used</span>` : "") +
      `<span>Longest: <strong>${longest ? longest.toUpperCase() : "—"}</strong></span>`;

    view.render(words, {
      mode: cfg.mode,
      flatLabel: cfg.flatLabel,
      leadSpans: lead,
      emptyMessage: "No words matched. Try fewer filters, a different length, or more letters."
    });
  }

  function clearAll() {
    els.form.reset();
    view.clear();
    clearError();
    els.letters.focus();
  }

  function init() {
    cache();
    view = T.createResultsView({ resultsEl: els.results, summaryEl: els.summary, liveEl: els.live });
    els.form.addEventListener("submit", (e) => { e.preventDefault(); solve(); });
    els.clear.addEventListener("click", clearAll);
    // Re-run on sort change only when there is already a query in the box.
    els.sort.addEventListener("change", () => {
      if (els.letters.value || els.include.value || els.starts.value || els.ends.value || els.contains.value) solve();
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
