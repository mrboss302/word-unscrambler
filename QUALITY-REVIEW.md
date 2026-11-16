# Quality review and AdSense resubmission checklist

Updated: November 15, 2026

This is a product-quality and maintenance record, not a certification of Google AdSense compliance or an assertion that the live site has been redeployed.

## Implemented in this branch

- Remove unused, empty manual advertising containers and their obsolete JavaScript/CSS; preserve the AdSense verification loader.
- Remove social image metadata pointing to a nonexistent PNG.
- Provide a real homepage search via ?letters=, now understood by the unscrambler.
- Add support for up to two blank tiles and zero-point scoring for them.
- Respect repeated letters in required-letter filters.
- Add precise two-pass Wordle feedback processing and user-entered guess history; include a reproducible EERIE/LEVEL example and deterministic heuristic suggestions.
- Add an actual full-anagram filter so the anagram generator has a distinctive function.
- Publish a worked guide to duplicate-letter feedback, linked from the tool and guides index.
- Provide bug reporting through the project's GitHub issue tracker.
- Document word-list limitations and add Node regression and site consistency checks with CI.

## Manual checks before merging or requesting AdSense review

- [ ] Verify hello@thewordpuzzlesolver.com exists, receives email, and is monitored. Replace it if necessary.
- [ ] Audit the provenance, license, and permitted redistribution of assets/js/dictionary.js. Do not assume an unknown word list is public domain.
- [ ] Check the AdSense publisher ID in ads.txt and the meta/script tags against your actual account.
- [ ] Revisit the Privacy Policy for the actual analytics/advertising behavior, and enable an appropriate consent solution where applicable.
- [ ] Review the pages on mobile and desktop and test keyboard/screen-reader use of the five feedback tiles.
- [ ] Verify that all five tools work from the public deployed domain after merging, not just in code.
- [ ] Inspect Search Console crawl and indexing reports; check for soft-404s and excluded pages.
- [ ] Review Analytics/Search Console for genuine user engagement and organic search interest. Do not buy or manufacture traffic.
- [ ] Ensure the site's guides and features are periodically reviewed and updated with real improvements.
- [ ] Run npm test and verify GitHub Actions is green.

## Realistic limitation

Google does not disclose one exact threshold for its 'low value content' decision. Useful, original features and transparent site operations improve the site but cannot guarantee acceptance. Request a new review only after the changes are deployed and the checks above are complete.
