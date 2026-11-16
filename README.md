# Word Puzzle Solver

Source for https://thewordpuzzlesolver.com, a static collection of browser-based word-game tools.

## Tools

- **Word Unscrambler:** Find words from a rack, including up to two zero-point blank tiles.
- **Word Solver:** Combine letter pools with prefix, suffix, substring, and length filters.
- **Wordle Helper:** Filter by manual clues or recorded color feedback from complete guesses (including duplicate letters); view a deterministic letter-coverage heuristic.
- **Anagram Generator:** Compare full single-word anagrams with shorter sub-anagrams.
- **5 Letter Words:** Browse the shared dictionary by patterns and constraints.

All solving happens in the browser. Pages share the dictionary in assets/js/dictionary.js and the engine in assets/js/word-tools.js. No bundler or web service is required.

## Local development

Use a static server rather than opening HTML files with file:// paths:

    python3 -m http.server 8080

Then open http://localhost:8080/. Install Node.js 20+ to run automated checks (no npm dependencies):

    npm test

The test suite checks blank scoring, duplicate required letters, exact Wordle feedback, navigation targets, sitemap/canonical consistency, metadata, and JavaScript syntax. GitHub Actions runs the checks on PRs and pushes to main.

## Dictionary notice

The distributed word list is not an official Scrabble, Words With Friends, or Wordle word list. A provenance/licensing review of the large source dictionary is still required before considering its redistribution rights verified. Do not attribute an unconfirmed license or claim the list is authoritative.

## AdSense review

The site retains the existing AdSense site-verification script and ads.txt. Unused manual ad placeholders were removed. **Approval is not guaranteed by code changes.** Before resubmitting, the owner should verify email delivery, the publisher ID, dictionary licensing, relevant advertising/consent disclosures, deployment health, Search Console coverage, and genuine visitor interest. See QUALITY-REVIEW.md for a checklist.
