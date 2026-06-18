/* =========================================================================
   Word Unscrambler — page wiring.

   All word logic and the dictionary now live in the shared utility:
       /assets/js/word-tools.js   (window.WordTools)
   Ad initialization lives in:
       /assets/js/ads.js
   This file only wires the page's form/inputs to WordTools.searchWords()
   and renders the results. No dictionary or solving logic is duplicated here.
   ========================================================================= */
(function () {
  // Shared utilities: from the browser global, or via require() under Node.
  const T = (typeof window !== "undefined" && window.WordTools) ||
            (typeof require !== "undefined" && require("../assets/js/word-tools.js"));

  const els = {};
  let view = null;
  let lastLetters = "";

  function cache() {
    els.form = document.getElementById("unscramble-form");
    els.letters = document.getElementById("letters");
    els.required = document.getElementById("required");
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

  // "length" keeps the grouped-by-length view; alpha/score show a flat list.
  function viewConfig() {
    switch (els.sort.value) {
      case "alpha": return { sort: "alpha", mode: "flat", flatLabel: "All words (A–Z)" };
      case "score": return { sort: "scoreDesc", mode: "flat", flatLabel: "All words (by score)" };
      default: return { sort: "lengthDesc", mode: "grouped" };
    }
  }

  function solve() {
    clearError();
    const letters = T.cleanLetters(els.letters.value);

    if (letters.length < 2) {
      showError("Enter at least 2 letters (A–Z) to unscramble.");
      view.clear();
      return;
    }

    lastLetters = letters;
    const cfg = viewConfig();
    const words = T.searchWords({
      letters,
      include: T.cleanLetters(els.required.value),
      lengthMode: els.length.value,
      sort: cfg.sort
    });

    const longest = words.reduce((a, b) => (b.length > a.length ? b : a), "");
    const lead =
      `<span><strong>${words.length.toLocaleString("en-US")}</strong> word${words.length === 1 ? "" : "s"} found</span>` +
      `<span><strong>${letters.length}</strong> letters used</span>` +
      `<span>Longest: <strong>${longest ? longest.toUpperCase() : "—"}</strong></span>`;

    view.render(words, {
      mode: cfg.mode,
      flatLabel: cfg.flatLabel,
      leadSpans: lead,
      emptyMessage: "No words matched those letters. Try removing the length filter, " +
        "clearing the required letters, or adding a few more tiles."
    });
  }

  function clearAll() {
    els.letters.value = "";
    els.required.value = "";
    els.length.value = "any";
    if (els.sort) els.sort.value = "length";
    view.clear();
    clearError();
    els.letters.focus();
  }

  function init() {
    cache();
    view = T.createResultsView({ resultsEl: els.results, summaryEl: els.summary, liveEl: els.live });
    els.form.addEventListener("submit", (e) => { e.preventDefault(); solve(); });
    els.clear.addEventListener("click", clearAll);
    els.sort.addEventListener("change", () => { if (els.letters.value) solve(); });
  }

  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", init);
  }
})();

/* =========================================================================
   INTEGRATION TESTS  (Node only — never runs in the browser)
   -------------------------------------------------------------------------
   These no longer test duplicated logic. They confirm the Word Unscrambler
   page is correctly wired to the shared WordTools utilities: the same
   query the page issues (letters + optional include + length, sorted
   length-desc) produces the expected results.

   Run with:   node script.js
   (The shared logic itself is unit-tested in: node assets/js/word-tools.js)
   ========================================================================= */
if (typeof require !== "undefined" && require.main === module) {
  const T = require("../assets/js/word-tools.js");
  let passed = 0, failed = 0;
  function assert(label, cond) {
    if (cond) { passed++; console.log("  ✓ " + label); }
    else { failed++; console.error("  ✗ " + label); }
  }
  // Mirror exactly what the page does on submit.
  function unscramble(letters, required, lengthMode) {
    return T.searchWords({
      letters: T.cleanLetters(letters),
      include: T.cleanLetters(required || ""),
      lengthMode: lengthMode || "any",
      sort: "lengthDesc"
    });
  }
  function has(list, expected) { return expected.every((w) => list.includes(w)); }

  console.log("Word Unscrambler — integration with shared WordTools\n");

  // The page depends on these shared utilities existing.
  assert("WordTools exposes the functions the page uses",
    typeof T.cleanLetters === "function" &&
    typeof T.searchWords === "function" &&
    typeof T.renderGrouped === "function" &&
    typeof T.renderEmpty === "function");

  // Worked examples shown on the page.
  assert("listen -> silent, enlist, tinsel, inlets",
    has(unscramble("listen"), ["silent", "enlist", "tinsel", "inlets"]));
  assert("trace -> cater, crate, react, caret, trace",
    has(unscramble("trace"), ["cater", "crate", "react", "caret", "trace"]));
  assert("spare -> spear, pears, parse, rapes",
    has(unscramble("spare"), ["spear", "pears", "parse", "rapes"]));
  assert("stone -> notes, tones, onset",
    has(unscramble("stone"), ["notes", "tones", "onset"]));

  // Behavior the page promises, delegated to the shared engine.
  const sorted = unscramble("trace");
  assert("results sorted by length desc, then alphabetically",
    sorted.every((w, i) => i === 0 ||
      sorted[i - 1].length > w.length ||
      (sorted[i - 1].length === w.length && sorted[i - 1].localeCompare(w) <= 0)));
  assert("length filter '5' returns only 5-letter words",
    unscramble("listen", "", "5").every((w) => w.length === 5));
  assert("required-letter filter keeps only matching words",
    unscramble("trace", "c").every((w) => w.includes("c")));
  assert("repeated letters respected: one 'e' rack cannot build 'free'",
    !unscramble("fre").includes("free") && unscramble("free").includes("free"));

  console.log("\n" + passed + " passed, " + failed + " failed.");
  if (failed > 0) process.exit(1);
}
