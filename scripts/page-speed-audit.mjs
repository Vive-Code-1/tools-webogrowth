#!/usr/bin/env node
/**
 * Page-Speed Audit
 *
 * Runs Lighthouse against the project's key tool pages (desktop + mobile)
 * and prints a compact pass/fail table. Fails CI when any score drops
 * below the thresholds.
 *
 * Thresholds (matches lighthouserc.cjs):
 *   performance:   ≥ 0.85
 *   accessibility: ≥ 0.95
 *   best-practices: ≥ 0.90
 *   seo:           ≥ 0.95
 *
 * Usage:
 *   node scripts/page-speed-audit.mjs                    # uses existing .lighthouseci/*.json
 *   node scripts/page-speed-audit.mjs --run              # invokes lhci autorun first
 *   node scripts/page-speed-audit.mjs --run --mobile     # uses mobile config
 *   node scripts/page-speed-audit.mjs --strict           # exit 1 on any failure
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const args = new Set(process.argv.slice(2));
const STRICT = args.has("--strict");
const RUN = args.has("--run");
const MOBILE = args.has("--mobile");
const LHCI_DIR = ".lighthouseci";
const OUT_DIR = "reports";

const THRESHOLDS = {
  performance: 0.85,
  accessibility: 0.95,
  "best-practices": 0.90,
  seo: 0.95,
};

if (RUN) {
  const cfg = MOBILE ? "lighthouserc.mobile.cjs" : "lighthouserc.cjs";
  console.log(`▶ Running lhci autorun --config=${cfg}\n`);
  try { execSync(`npx lhci autorun --config=${cfg}`, { stdio: "inherit" }); }
  catch { /* keep going — analyse whatever reports exist */ }
}

if (!fs.existsSync(LHCI_DIR)) {
  console.error(`✗ No ${LHCI_DIR}/ directory. Run with --run, or 'bun run lighthouse' first.`);
  process.exit(STRICT ? 1 : 0);
}

const reports = fs.readdirSync(LHCI_DIR).filter((f) => f.startsWith("lhr-") && f.endsWith(".json"));
if (!reports.length) {
  console.error(`✗ No Lighthouse JSON reports in ${LHCI_DIR}/.`);
  process.exit(STRICT ? 1 : 0);
}

const results = [];
for (const file of reports) {
  const r = JSON.parse(fs.readFileSync(path.join(LHCI_DIR, file), "utf8"));
  const cat = r.categories || {};
  results.push({
    url: r.finalDisplayedUrl || r.requestedUrl,
    formFactor: r.configSettings?.formFactor || "desktop",
    perf: cat.performance?.score ?? 0,
    a11y: cat.accessibility?.score ?? 0,
    bp: cat["best-practices"]?.score ?? 0,
    seo: cat.seo?.score ?? 0,
    lcp: r.audits?.["largest-contentful-paint"]?.numericValue,
    cls: r.audits?.["cumulative-layout-shift"]?.numericValue,
    tbt: r.audits?.["total-blocking-time"]?.numericValue,
  });
}

const fmtScore = (s, threshold) => {
  const pct = Math.round(s * 100);
  const mark = s >= threshold ? "✓" : "✗";
  return `${mark} ${pct}`;
};

console.log("\n━━━ Page-Speed Audit ━━━\n");
console.log(`${"URL".padEnd(50)} ${"Device".padEnd(8)} Perf  A11y  BP    SEO   LCP    CLS    TBT`);
console.log("─".repeat(110));

let failed = 0;
for (const r of results) {
  const fails =
    (r.perf < THRESHOLDS.performance) +
    (r.a11y < THRESHOLDS.accessibility) +
    (r.bp < THRESHOLDS["best-practices"]) +
    (r.seo < THRESHOLDS.seo);
  if (fails) failed++;
  const u = r.url.replace(/^https?:\/\/[^/]+/, "").slice(0, 48).padEnd(50);
  console.log(
    `${u} ${r.formFactor.padEnd(8)} ${fmtScore(r.perf, THRESHOLDS.performance).padEnd(5)} ${fmtScore(r.a11y, THRESHOLDS.accessibility).padEnd(5)} ${fmtScore(r.bp, THRESHOLDS["best-practices"]).padEnd(5)} ${fmtScore(r.seo, THRESHOLDS.seo).padEnd(5)} ${(r.lcp ? Math.round(r.lcp) + "ms" : "—").padEnd(6)} ${(r.cls?.toFixed(3) ?? "—").padEnd(6)} ${r.tbt ? Math.round(r.tbt) + "ms" : "—"}`,
  );
}

console.log("─".repeat(110));
console.log(`\nThresholds: perf ≥${THRESHOLDS.performance}  a11y ≥${THRESHOLDS.accessibility}  bp ≥${THRESHOLDS["best-practices"]}  seo ≥${THRESHOLDS.seo}`);
console.log(`${results.length - failed}/${results.length} pages passed.\n`);

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(path.join(OUT_DIR, "page-speed.json"), JSON.stringify({ generatedAt: new Date().toISOString(), thresholds: THRESHOLDS, results }, null, 2));
console.log(`✓ Wrote ${OUT_DIR}/page-speed.json`);

if (STRICT && failed) {
  console.error(`\n✗ ${failed} page(s) below thresholds — merge blocked.`);
  process.exit(1);
}
