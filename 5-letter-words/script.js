/* =========================================================================
   5 Letter Words — page wiring. Logic lives in /assets/js/word-tools.js.
   Searches only 5-letter words, filtered by position/letter clues.
   ========================================================================= */
(function () {
  const T = window.WordTools;
  const els = {};
  let view = null;

  function cache() {
    els.form = document.getElementById("five-form");
    els.starts = document.getElementById("starts");
    els.ends = document.getElementById("ends");
    els.contains = document.getElementById("contains");
    els.include = document.getElementById("include");
    els.exclude = document.getElementById("exclude");
    els.pattern = document.getElementById("pattern");
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
  }

  function solve() {
    clearError();

    // Default alphabetical; optional sort by Scrabble score.
    const sort = els.sort.value === "score" ? "scoreDesc" : "alpha";

    // All criteria optional. With none set, every 5-letter word is returned.
    const words = T.searchWords({
      fixedLength: 5,
      startsWith: T.cleanLetters(els.starts.value),
      endsWith: T.cleanLetters(els.ends.value),
      contains: T.cleanLetters(els.contains.value),
      include: T.cleanLetters(els.include.value),
      exclude: T.cleanLetters(els.exclude.value), // protected by pattern + include
      pattern: els.pattern.value.trim(),
      sort: sort
    });

    const lead =
      `<span><strong>${words.length.toLocaleString("en-US")}</strong> five-letter word${words.length === 1 ? "" : "s"}</span>`;

    view.render(words, {
      mode: "flat",
      flatLabel: "5-letter words",
      leadSpans: lead,
      emptyMessage: "No 5-letter words match those filters. Try loosening a filter or clearing the excluded letters."
    });
  }

  function clearAll() {
    els.form.reset();
    view.clear();
    clearError();
    els.starts.focus();
  }

  function init() {
    cache();
    view = T.createResultsView({ resultsEl: els.results, summaryEl: els.summary, liveEl: els.live });
    els.form.addEventListener("submit", (e) => { e.preventDefault(); solve(); });
    els.clear.addEventListener("click", clearAll);
    // Re-sort only when results are already on screen.
    els.sort.addEventListener("change", () => { if (els.results.children.length) solve(); });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
