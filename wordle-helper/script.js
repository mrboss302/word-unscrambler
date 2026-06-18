/* =========================================================================
   Wordle Helper — page wiring. Logic lives in /assets/js/word-tools.js.

   Mapping of Wordle feedback to inputs:
     GREEN  (right letter, right spot) -> pattern field, e.g. "A__E_"
     YELLOW (right letter, wrong spot) -> include letters + position exclusions
     GRAY   (letter not in word)       -> exclude letters
   ========================================================================= */
(function () {
  const T = window.WordTools;
  const els = {};
  let view = null;

  function cache() {
    els.form = document.getElementById("wordle-form");
    els.pattern = document.getElementById("pattern");
    els.include = document.getElementById("include");
    els.exclude = document.getElementById("exclude");
    els.pos = [1, 2, 3, 4, 5].map((n) => document.getElementById("pos" + n));
    els.clear = document.getElementById("clear-btn");
    els.error = document.getElementById("form-error");
    els.results = document.getElementById("results");
    els.summary = document.getElementById("results-summary");
    els.live = document.getElementById("results-status");
  }

  function clearError() {
    els.error.textContent = "";
    els.error.hidden = true;
    els.pattern.removeAttribute("aria-invalid");
  }
  function showError(msg) {
    els.error.textContent = msg;
    els.error.hidden = false;
    els.pattern.setAttribute("aria-invalid", "true");
    els.pattern.focus();
  }

  function solve() {
    clearError();

    // Pattern may contain letters and blanks; it is auto-sized to 5 chars.
    const pattern = els.pattern.value.trim();
    const include = T.cleanLetters(els.include.value);
    const exclude = T.cleanLetters(els.exclude.value);
    const posExcludes = els.pos.map((p) => T.cleanLetters(p.value));

    const hasConstraint =
      include || exclude || posExcludes.some(Boolean) ||
      T.cleanPattern(pattern).replace(/_/g, "");

    if (!hasConstraint) {
      view.clear();
      showError("Add at least one clue: a green letter, a yellow letter, or a gray letter.");
      return;
    }

    const words = T.searchWords({
      fixedLength: 5,
      pattern,
      include,
      exclude,        // grays; protected by pattern + include letters
      posExcludes,    // yellows can't sit in these positions
      sort: "alpha"
    });

    const lead =
      `<span><strong>${words.length.toLocaleString("en-US")}</strong> possible word${words.length === 1 ? "" : "s"}</span>`;
    view.render(words, {
      mode: "flat",
      flatLabel: "Possible words",
      leadSpans: lead,
      emptyMessage: "No 5-letter words match those clues. Double-check your gray letters — a letter can be both present and absent if it is doubled."
    });
  }

  function clearAll() {
    els.form.reset();
    view.clear();
    clearError();
    els.pattern.focus();
  }

  function init() {
    cache();
    view = T.createResultsView({ resultsEl: els.results, summaryEl: els.summary, liveEl: els.live });
    els.form.addEventListener("submit", (e) => { e.preventDefault(); solve(); });
    els.clear.addEventListener("click", clearAll);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
