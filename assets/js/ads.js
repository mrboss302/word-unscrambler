/* =========================================================================
   Shared AdSense initializer for all tool pages.

   DEV NOTES:
   - Replace ca-pub-XXXXXXXXXXXXXXXX in each page's loader + <ins> tags with
     your real AdSense publisher ID, and the placeholder data-ad-slot values
     (1111111111 / 2222222222 / 3333333333) with real ad unit IDs.
   - Ads will NOT appear on localhost, on unapproved domains, or before your
     AdSense account/site is approved. Empty reserved space is expected then.
   - Never click your own ads while testing.
   - Ads live only in the labeled .ad containers — never inside result lists.

   Each <ins class="adsbygoogle"> is pushed exactly once. A data flag guards
   against duplicate pushes, hidden/zero-width slots are skipped, and any
   failure (ad blocker, no network) is caught so the tools keep working.
   ========================================================================= */
(function () {
  function initializeAds() {
    var units = document.querySelectorAll(".adsbygoogle");
    for (var i = 0; i < units.length; i++) {
      var ad = units[i];
      if (ad.dataset.adsInitialized === "true") continue;
      if (ad.offsetParent === null || ad.offsetWidth === 0) continue;
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        ad.dataset.adsInitialized = "true";
      } catch (error) {
        console.warn("AdSense could not initialize this ad slot.", error);
      }
    }
  }
  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", initializeAds);
  }
})();
