/* =========================================================================
   Anagram Generator — page wiring. Logic lives in /assets/js/word-tools.js.
   Generates single-word anagrams and sub-anagrams from the entered letters.
   ========================================================================= */
(function () {
  const T = window.WordTools;
  const els = {};
  let view = null;

  function cache() {
    els.form = document.getElementById("anagram-form");
    els.phrase = document.getElementById("phrase");
    els.minlen = document.getElementById("minlen");
    els.length = document.getElementById("length");
    els.include = document.getElementById("include");
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
    els.phrase.removeAttribute("aria-invalid");
  }
  function showError(msg) {
    els.error.textContent = msg;
    els.error.hidden = false;
    els.phrase.setAttribute("aria-invalid", "true");
    els.phrase.focus();
  }

  function viewConfig() {
    switch (els.sort.value) {
      case "alpha": return { sort: "alpha", mode: "flat", flatLabel: "All anagrams (A–Z)" };
      case "score": return { sort: "scoreDesc", mode: "flat", flatLabel: "All anagrams (by score)" };
      default: return { sort: "lengthDesc", mode: "grouped" };
    }
  }

  function solve() {
    clearError();
    const letters = T.cleanLetters(els.phrase.value); // spaces/punctuation ignored
    if (letters.length < 2) {
      view.clear();
      showError("Enter at least 2 letters (a name or short phrase works too).");
      return;
    }

    const include = T.cleanLetters(els.include.value);
    const cfg = viewConfig();
    let words = T.searchWords({
      letters, include, lengthMode: els.length.value, sort: cfg.sort
    });

    // Minimum-length filter (applies on top of the exact-length dropdown).
    const min = Number(els.minlen.value) || 2;
    words = words.filter((w) => w.length >= min);

    const longest = words.reduce((a, b) => (b.length > a.length ? b : a), "");
    const lead =
      `<span><strong>${words.length.toLocaleString("en-US")}</strong> anagram${words.length === 1 ? "" : "s"} found</span>` +
      `<span><strong>${letters.length}</strong> letters used</span>` +
      `<span>Longest: <strong>${longest ? longest.toUpperCase() : "—"}</strong></span>`;

    view.render(words, {
      mode: cfg.mode,
      flatLabel: cfg.flatLabel,
      leadSpans: lead,
      emptyMessage: "No anagrams found. Try a lower minimum length, remove the must-include letters, or add more letters."
    });
  }

  function clearAll() {
    els.form.reset();
    view.clear();
    clearError();
    els.phrase.focus();
  }

  function init() {
    cache();
    view = T.createResultsView({ resultsEl: els.results, summaryEl: els.summary, liveEl: els.live });
    els.form.addEventListener("submit", (e) => { e.preventDefault(); solve(); });
    els.clear.addEventListener("click", clearAll);
    els.sort.addEventListener("change", () => { if (els.phrase.value) solve(); });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
