#!/usr/bin/env node
/**
 * Internal Linking Audit
 *
 * Scans every <Route path="..."> in src/App.tsx, then counts how many times
 * each route is linked to from src/**, blog markdown, and footer/nav.
 *
 * Reports:
 *   - Orphan pages (0 inbound internal links → SEO dead-ends)
 *   - Under-linked pages (< 2 inbound links)
 *   - Routes with most inbound links (your "money pages")
 *   - Stale links (link target not in route table)
 *
 * Output: console table + reports/internal-links.json + reports/internal-links.html
 */
import fs from "node:fs";
import path from "node:path";

const SRC_DIR = "src";
const OUT_DIR = "reports";
const APP = fs.readFileSync(path.join(SRC_DIR, "App.tsx"), "utf8");

// 1. Discover routes
const routes = [...APP.matchAll(/path="(\/[^"]*)"/g)]
  .map((m) => m[1])
  .filter((p) => !p.includes("*") && p !== "/admin");

// 2. Walk src/ + public/sitemap.xml for internal link references
const walk = (dir, list = []) => {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) walk(p, list);
    else if (/\.(tsx?|jsx?|mdx?|md)$/.test(f.name)) list.push(p);
  }
  return list;
};
const files = walk(SRC_DIR).concat(["public/sitemap.xml"].filter(fs.existsSync));

const inbound = Object.fromEntries(routes.map((r) => [r, []]));
const stale = [];

const linkPatterns = [
  /to=["'`](\/[^"'`#?\s]*)/g,             // <Link to="/path">
  /href=["'`](\/[^"'`#?\s]*)/g,           // <a href="/path">
  /path:\s*["'`](\/[^"'`]*)["'`]/g,       // posts.ts relatedTools
  /<loc>https?:\/\/[^<]+?(\/[^<]*?)<\/loc>/g, // sitemap
];

for (const file of files) {
  if (file === path.join(SRC_DIR, "App.tsx")) continue; // skip route table itself
  const src = fs.readFileSync(file, "utf8");
  for (const re of linkPatterns) {
    for (const m of src.matchAll(re)) {
      let target = m[1].split(/[?#]/)[0].replace(/\/$/, "") || "/";
      // /blog/:slug → record under /blog
      const routeKey = target.startsWith("/blog/") ? "/blog" : target;
      if (inbound[routeKey] !== undefined) inbound[routeKey].push(file.replace(/\\/g, "/"));
      else if (target.startsWith("/") && !target.startsWith("//")) stale.push({ target, file });
    }
  }
}

// 3. Score + report
const rows = routes
  .map((r) => ({ route: r, count: inbound[r].length, sources: [...new Set(inbound[r])].length }))
  .sort((a, b) => a.count - b.count);

const orphans = rows.filter((r) => r.count === 0);
const under = rows.filter((r) => r.count > 0 && r.count < 2);
const top = [...rows].sort((a, b) => b.count - a.count).slice(0, 5);

console.log("\n━━━ Internal Linking Audit ━━━\n");
console.log(`Total routes scanned: ${routes.length}`);
console.log(`Total internal links: ${rows.reduce((s, r) => s + r.count, 0)}`);
console.log(`Orphan pages: ${orphans.length}`);
console.log(`Under-linked (<2 links): ${under.length}`);
console.log(`Stale link targets: ${stale.length}\n`);

if (orphans.length) {
  console.log("🚨 ORPHANS (0 inbound links — fix by linking from nav/footer/related):");
  orphans.forEach((r) => console.log(`   ${r.route}`));
  console.log();
}
if (under.length) {
  console.log("⚠️  UNDER-LINKED (<2 inbound links):");
  under.forEach((r) => console.log(`   ${r.route}  →  ${r.count} link(s)`));
  console.log();
}
console.log("⭐ TOP linked pages:");
top.forEach((r) => console.log(`   ${r.route.padEnd(28)} ${r.count} links`));

if (stale.length) {
  console.log("\n⚠️  STALE LINKS (target route does not exist):");
  stale.slice(0, 20).forEach((s) => console.log(`   ${s.target}  ←  ${s.file}`));
}

// 4. Persist
fs.mkdirSync(OUT_DIR, { recursive: true });
const json = {
  generatedAt: new Date().toISOString(),
  totals: { routes: routes.length, links: rows.reduce((s, r) => s + r.count, 0), orphans: orphans.length, under: under.length, stale: stale.length },
  rows,
  orphans,
  under,
  stale,
  inbound,
};
fs.writeFileSync(path.join(OUT_DIR, "internal-links.json"), JSON.stringify(json, null, 2));

const html = `<!doctype html><meta charset="utf-8"><title>Internal Linking Audit</title>
<style>body{font:14px/1.5 system-ui;margin:2rem;max-width:960px;background:#0d0f12;color:#e5e7eb}
h1{color:#d4f17a}h2{margin-top:2rem;border-bottom:1px solid #333;padding-bottom:.3rem}
table{border-collapse:collapse;width:100%;margin:.5rem 0}td,th{padding:.4rem .8rem;border-bottom:1px solid #222;text-align:left}
.bad{color:#ff6b6b}.warn{color:#fbbf24}.good{color:#d4f17a}code{background:#1a1d22;padding:.1rem .4rem;border-radius:3px}</style>
<h1>Internal Linking Audit</h1>
<p>Generated ${json.generatedAt}</p>
<p><strong>${routes.length}</strong> routes · <strong>${json.totals.links}</strong> internal links ·
<span class="bad">${orphans.length} orphans</span> ·
<span class="warn">${under.length} under-linked</span> ·
<span class="warn">${stale.length} stale</span></p>
<h2>All routes by inbound links</h2>
<table><tr><th>Route</th><th>Inbound links</th><th>Status</th></tr>
${rows.map(r => `<tr><td><code>${r.route}</code></td><td>${r.count}</td><td>${r.count===0?'<span class="bad">orphan</span>':r.count<2?'<span class="warn">under-linked</span>':'<span class="good">ok</span>'}</td></tr>`).join("")}
</table>`;
fs.writeFileSync(path.join(OUT_DIR, "internal-links.html"), html);

console.log(`\n✓ Wrote ${OUT_DIR}/internal-links.json + .html`);

// 5. Exit non-zero on regressions (CI gate)
if (process.argv.includes("--strict") && (orphans.length || stale.length)) {
  console.error(`\n✗ Strict mode: ${orphans.length} orphan(s) and ${stale.length} stale link(s)`);
  process.exit(1);
}
