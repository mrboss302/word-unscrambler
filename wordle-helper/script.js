/* Wordle Helper: simple clue fields plus precise whole-guess feedback.
   Both modes share the same dictionary and accessible, paginated results. */
(function () {
  "use strict";

  const T = window.WordTools;
  const colors = ["gray", "yellow", "green"];
  const els = {};
  let view = null;
  let guesses = [];
  let draftColors = Array(5).fill("gray");

  function cache() {
    const get = (id) => document.getElementById(id);
    els.form = get("wordle-form");
    els.pattern = get("pattern");
    els.include = get("include");
    els.exclude = get("exclude");
    els.pos = [1, 2, 3, 4, 5].map((n) => get("pos" + n));
    els.clear = get("clear-btn");
    els.error = get("form-error");
    els.results = get("results");
    els.summary = get("results-summary");
    els.live = get("results-status");
    els.guessInput = get("guess-entry");
    els.guessTiles = get("guess-tiles");
    els.addGuess = get("add-guess");
    els.clearGuesses = get("clear-guesses");
    els.guessError = get("guess-error");
    els.guessHistory = get("guess-history");
    els.insights = get("candidate-insights");
    els.insightSummary = get("insight-summary");
    els.insightWords = get("insight-words");
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
  function showGuessError(msg) {
    els.guessError.textContent = msg;
    els.guessError.hidden = false;
    els.guessInput.setAttribute("aria-invalid", "true");
    els.guessInput.focus();
  }
  function clearGuessError() {
    els.guessError.textContent = "";
    els.guessError.hidden = true;
    els.guessInput.removeAttribute("aria-invalid");
  }

  function hasManualClue() {
    return Boolean(
      T.cleanPattern(els.pattern.value.trim()).replace(/_/g, "") ||
      T.cleanLetters(els.include.value) || T.cleanLetters(els.exclude.value) ||
      els.pos.some((p) => T.cleanLetters(p.value))
    );
  }

  function showInsights(words) {
    els.insights.hidden = words.length === 0;
    els.insightWords.replaceChildren();
    if (!words.length) return;

    // Each candidate contributes one vote per distinct letter. Ranking is a
    // deterministic, local heuristic for covering common candidate letters.
    const frequency = Object.create(null);
    for (const word of words) {
      for (const ch of new Set(word)) frequency[ch] = (frequency[ch] || 0) + 1;
    }
    const ranked = words.map((word) => ({
      word,
      distinct: new Set(word).size,
      coverage: [...new Set(word)].reduce((sum, ch) => sum + frequency[ch], 0)
    })).sort((a, b) => (b.coverage - a.coverage) ||
      (b.distinct - a.distinct) || a.word.localeCompare(b.word));

    els.insightSummary.textContent = words.length === 1 ?
      "One dictionary candidate fits these clues." :
      words.length.toLocaleString("en-US") +
      " dictionary candidates remain. These five candidates test letters found most often in the remaining possibilities:";

    for (const item of ranked.slice(0, 5)) {
      const li = document.createElement("li");
      const name = document.createElement("strong");
      name.textContent = item.word.toUpperCase();
      const hint = document.createElement("span");
      hint.textContent = item.distinct + " distinct letters";
      li.append(name, hint);
      els.insightWords.appendChild(li);
    }
  }

  function solve() {
    clearError();
    const pattern = els.pattern.value.trim();
    const include = T.cleanLetters(els.include.value);
    const exclude = T.cleanLetters(els.exclude.value);
    const posExcludes = els.pos.map((p) => T.cleanLetters(p.value));

    if (!hasManualClue() && guesses.length === 0) {
      view.clear();
      showInsights([]);
      showError("Add a manual clue or record at least one previous guess.");
      return;
    }

    let words = T.searchWords({
      fixedLength: 5,
      pattern,
      include,
      exclude,
      posExcludes,
      sort: "alpha"
    });

    if (guesses.length) {
      words = words.filter((word) =>
        guesses.every((g) => T.matchesGuessFeedback(word, g.word, g.feedback))
      );
    }

    const lead = "<span><strong>" + words.length.toLocaleString("en-US") +
      "</strong> possible word" + (words.length === 1 ? "" : "s") + "</span>" +
      (guesses.length ? "<span>" + guesses.length + " recorded guess" +
      (guesses.length === 1 ? "" : "es") + "</span>" : "");

    view.render(words, {
      mode: "flat",
      flatLabel: "Possible words",
      leadSpans: lead,
      emptyMessage: "No words fit those clues. Check the colors, especially gray letters repeated in a guess, or clear a manual filter."
    });
    showInsights(words);
  }

  function paintDraft() {
    const guess = T.cleanLetters(els.guessInput.value).slice(0, 5).toUpperCase();
    const buttons = els.guessTiles.querySelectorAll("button[data-index]");
    buttons.forEach((button, index) => {
      const state = draftColors[index];
      button.textContent = guess[index] || "·";
      button.className = "guess-tile guess-tile--" + state;
      button.setAttribute("aria-label", "Letter " + (index + 1) +
        (guess[index] ? " " + guess[index] : "") + ": " + state +
        "; activate to change the color");
      button.title = "Current: " + state + ". Click to cycle gray, yellow, green.";
    });
  }

  function paintHistory() {
    els.guessHistory.replaceChildren();
    guesses.forEach((entry, index) => {
      const li = document.createElement("li");
      const tiles = document.createElement("span");
      tiles.className = "guess-history__tiles";
      tiles.setAttribute("aria-label", entry.word.toUpperCase() + ": " +
        entry.feedback.join(", "));
      [...entry.word.toUpperCase()].forEach((ch, i) => {
        const tile = document.createElement("span");
        tile.className = "guess-tile guess-tile--" + entry.feedback[i];
        tile.textContent = ch;
        tile.setAttribute("aria-hidden", "true");
        tiles.appendChild(tile);
      });
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "btn btn--ghost guess-history__remove";
      remove.textContent = "Remove";
      remove.setAttribute("aria-label", "Remove guess " + entry.word.toUpperCase());
      remove.addEventListener("click", () => {
        guesses.splice(index, 1);
        paintHistory();
        solveOrClear();
      });
      li.append(tiles, remove);
      els.guessHistory.appendChild(li);
    });
  }

  function addGuess() {
    clearGuessError();
    const word = T.cleanLetters(els.guessInput.value);
    if (word.length !== 5) {
      showGuessError("Enter exactly five letters (A–Z) before adding this guess.");
      return;
    }
    if (guesses.length >= 12) {
      showGuessError("Remove an earlier guess before adding more than 12.");
      return;
    }
    guesses.push({ word, feedback: draftColors.slice() });
    els.guessInput.value = "";
    draftColors = Array(5).fill("gray");
    paintDraft();
    paintHistory();
    solve();
    els.guessInput.focus();
  }

  function solveOrClear() {
    clearError();
    if (guesses.length || hasManualClue()) solve();
    else {
      view.clear();
      showInsights([]);
    }
  }

  function clearAll() {
    els.form.reset();
    guesses = [];
    draftColors = Array(5).fill("gray");
    els.guessInput.value = "";
    clearError();
    clearGuessError();
    paintHistory();
    paintDraft();
    view.clear();
    showInsights([]);
    els.pattern.focus();
  }

  function init() {
    cache();
    view = T.createResultsView({
      resultsEl: els.results, summaryEl: els.summary, liveEl: els.live
    });
    els.form.addEventListener("submit", (event) => {
      event.preventDefault();
      solve();
    });
    els.clear.addEventListener("click", clearAll);
    els.guessInput.addEventListener("input", () => {
      clearGuessError();
      paintDraft();
    });
    els.guessInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") { event.preventDefault(); addGuess(); }
    });
    els.guessTiles.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-index]");
      if (!button) return;
      const index = Number(button.dataset.index);
      draftColors[index] = colors[(colors.indexOf(draftColors[index]) + 1) % colors.length];
      paintDraft();
    });
    els.addGuess.addEventListener("click", addGuess);
    els.clearGuesses.addEventListener("click", () => {
      guesses = [];
      paintHistory();
      clearGuessError();
      solveOrClear();
    });
    paintDraft();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
