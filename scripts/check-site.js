/* Static site checks. No dependencies or network required. */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const root = path.resolve(__dirname, "..");
const domain = "https://thewordpuzzlesolver.com";
const sitemap = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
let visited = 0;

function localFile(url) {
  const parsed = new URL(url, domain);
  if (parsed.origin !== domain) return null;
  const pathname = decodeURIComponent(parsed.pathname);
  if (pathname === "/") return "index.html";
  if (pathname.endsWith("/")) return pathname.slice(1) + "index.html";
  return pathname.slice(1);
}

for (const loc of locs) {
  assert.ok(loc.startsWith(domain + "/"), "Sitemap contains an external URL: " + loc);
  const filename = localFile(loc);
  const absolute = path.join(root, filename);
  assert.ok(fs.existsSync(absolute), "Sitemap references missing page: " + filename);
  const html = fs.readFileSync(absolute, "utf8");
  visited++;

  assert.match(html, /<title>[^<]+<\/title>/, filename + " is missing a title");
  assert.match(html, /<h1\b[^>]*>/, filename + " is missing a primary heading");
  assert.ok(html.includes('<link rel="canonical" href="' + loc + '"'),
    filename + " has an incorrect canonical URL");
  assert.match(html, /<link rel="stylesheet" href="\/assets\/css\/refresh\.css"\s*\/>/, filename + " is missing the shared refreshed theme");
  assert.ok(!html.includes("og-word-unscrambler.png"), filename + " has a missing social image");
  assert.ok(!html.includes("This email address is a placeholder"),
    filename + " still advertises a placeholder email");
  assert.ok(!/class="ad ad--/.test(html), filename + " has an empty manual ad slot");

  for (const match of html.matchAll(/(?:href|src)="(\/[^"]+)"/g)) {
    const target = match[1];
    if (target.startsWith("//")) continue;
    const file = localFile(target);
    assert.ok(fs.existsSync(path.join(root, file)),
      filename + " links to missing resource " + target);
  }
}

assert.equal(new Set(locs).size, locs.length, "Sitemap contains duplicate page URLs");
assert.ok(visited >= 15, "Too few substantive pages in sitemap");
const css = fs.readFileSync(path.join(root, "assets/css/refresh.css"), "utf8");
assert.ok(css.includes(".hero__panel") && css.includes(".site-nav") && css.includes(".tool"), "Theme is missing core layout hooks");
assert.ok(fs.existsSync(path.join(root, "ads.txt")), "Missing ads.txt");
console.log("Site checks passed for " + visited + " pages; internal resources exist.");
