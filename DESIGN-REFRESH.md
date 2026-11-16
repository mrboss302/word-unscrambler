# Word Puzzle Solver — Visual Refresh

Design proposal, November 2026. This branch is intended for review before publishing.

## Design direction

The site now has a warmer, more distinctive word-game identity rather than a generic collection of pale utility cards. The design uses editorial serif headlines, practical sans-serif controls, deep forest green, cream backgrounds, lime accent tiles, and a simple CSS-drawn anagram illustration. No external images, font services, build system, or JavaScript framework were added.

## Changes

- A two-column homepage hero with the existing working letter-search form and an illustrative LISTEN → SILENT anagram board.
- A five-card featured-tool section with a clear visual hierarchy, large tap targets, and distinctive icons.
- Consistent header/navigation, tool forms, result chips, long-form guides, and footer across all 16 public pages.
- Horizontal, touch-scrollable tool navigation on narrow screens; no hamburger dependency or extra JavaScript.
- A separate assets/css/refresh.css file layered after the existing stylesheet, keeping the original design intact for rollback.
- Preserved search parameters, AdSense verification, existing accessibility labels, core JavaScript, and page URLs.
- A site test ensuring every indexed page loads the new design stylesheet.

## Verification

- Browser mockups checked at 320px, 390px, 768px, and 1440px. No document-wide horizontal overflow was detected.
- The stylesheet parsed without syntax errors, and sample foreground/background combinations were checked for readable contrast.
- Source checks verified all 16 indexed HTML pages include the base and new stylesheet exactly once, retain an H1 and canonical URL, and preserve the homepage quick-search form.
- Automated CI tests must pass in the pull request.

## Review before merge

These mockups use representative markup and the real new stylesheet, not a deployed staging environment. Review actual page appearance with a browser, especially Wordle guess-history controls, long result lists, navigation at small widths, keyboard focus, and screen-reader interactions, before merging. This is a visual redesign, not an AdSense approval guarantee.
