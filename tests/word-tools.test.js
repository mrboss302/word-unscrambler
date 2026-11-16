const test = require("node:test");
const assert = require("node:assert/strict");
const T = require("../assets/js/word-tools.js");

test("wildcards fill missing rack letters but not unlimited letters", () => {
  assert.equal(T.canBuildWord("cat", T.countLetters("ct"), 1), true);
  assert.equal(T.canBuildWord("cat", T.countLetters("c"), 1), false);
  assert.equal(T.canBuildWord("free", T.countLetters("fre"), 0), false);
  assert.equal(T.canBuildWord("free", T.countLetters("fre"), 1), true);
  assert.ok(T.searchWords({ letters: "ct", wildcards: 1 }).includes("cat"));
  assert.ok(!T.searchWords({ letters: "ct", wildcards: 0 }).includes("cat"));
});

test("blank tiles never earn letter points", () => {
  assert.equal(T.scoreWord("cat"), 5);
  assert.equal(T.scoreWord("cat", "ct"), 4);
  assert.equal(T.scoreWord("free", "fre"), 6);
});

test("must-include letters respect duplicate counts", () => {
  assert.equal(T.wordContainsAll("apple", "pp"), true);
  assert.equal(T.wordContainsAll("apple", "ppp"), false);
  assert.ok(T.searchWords({ letters: "apple", include: "pp" }).includes("apple"));
});

test("Wordle feedback handles repeated letters in two passes", () => {
  const result = ["yellow", "green", "gray", "gray", "gray"];
  assert.deepEqual(T.evaluateGuess("level", "eerie"), result);
  assert.equal(T.matchesGuessFeedback("level", "eerie", result), true);
  assert.equal(T.matchesGuessFeedback("level", "eerie",
    ["yellow", "green", "yellow", "gray", "gray"]), false);
});

test("extra copies of a guessed letter must turn gray", () => {
  assert.deepEqual(T.evaluateGuess("civic", "icici"),
    ["yellow", "yellow", "yellow", "yellow", "gray"]);
  assert.equal(T.matchesGuessFeedback("civic", "icici",
    ["yellow", "yellow", "yellow", "yellow", "gray"]), true);
});

test("guess feedback rejects malformed guesses and nonstandard colors", () => {
  assert.equal(T.matchesGuessFeedback("level", "eeri", Array(5).fill("gray")), false);
  assert.equal(T.matchesGuessFeedback("level", "eerie", ["gray"]), false);
  assert.equal(T.matchesGuessFeedback("level", "eerie",
    ["blue", "green", "gray", "gray", "gray"]), false);
  assert.throws(() => T.evaluateGuess("level", "a"));
});

test("full anagrams use every input letter", () => {
  const all = T.searchWords({ letters: "listen" });
  assert.ok(all.includes("silent"));
  assert.ok(all.includes("list"));
  const full = all.filter((word) => word.length === "listen".length);
  assert.ok(full.includes("silent"));
  assert.ok(!full.includes("list"));
});

test("Wordle candidate filtering agrees with exact clue feedback", () => {
  const feedback = T.evaluateGuess("level", "eerie");
  const plausible = ["level", "lever", "leper", "river", "eagle"];
  const matched = plausible.filter((word) => T.matchesGuessFeedback(word, "eerie", feedback));
  assert.ok(matched.includes("level"));
  assert.ok(!matched.includes("river"));
});
