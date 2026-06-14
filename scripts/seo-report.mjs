#!/usr/bin/env node
// Generate an HTML + JSON SEO test report from Vitest JSON output.
// Usage:
//   node scripts/seo-report.mjs            # runs vitest then writes report
//   node scripts/seo-report.mjs --from-file reports/seo-results.json

import { execSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const REPORTS = resolve(ROOT, "reports");
const RAW = resolve(REPORTS, "seo-results.json");
const JSON_OUT = resolve(REPORTS, "seo-report.json");
const HTML_OUT = resolve(REPORTS, "seo-report.html");

mkdirSync(REPORTS, { recursive: true });

const fromFile = process.argv.includes("--from-file");
if (!fromFile) {
  try {
    execSync(
      `npx vitest run src/test/seo.test.ts --reporter=json --outputFile=${RAW}`,
      { stdio: "inherit", cwd: ROOT },
    );
  } catch {
    // Vitest exits non-zero on test failures; we still want the JSON report.
  }
}

if (!existsSync(RAW)) {
  console.error(`Vitest JSON output not found at ${RAW}`);
  process.exit(2);
}

const data = JSON.parse(readFileSync(RAW, "utf-8"));

// Parse "SEO fields for /route" → group by route.
const routes = new Map();
const other = [];

function bucket(name) {
  const m = name.match(/^(?:SEO fields for|Schema\.org JSON-LD for|sitemap URL )(\S+)/) ||
            name.match(/sitemap URL (\S+) /);
  if (!m) return null;
  return m[1];
}

for (const file of data.testResults ?? []) {
  for (const t of file.assertionResults ?? []) {
    const suite = (t.ancestorTitles ?? []).join(" > ");
    const route = bucket(suite) || bucket(t.fullName || "") || null;
    const entry = {
      suite,
      title: t.title,
      status: t.status,
      duration: t.duration ?? 0,
      messages: t.failureMessages ?? [],
    };
    if (route) {
      if (!routes.has(route)) routes.set(route, []);
      routes.get(route).push(entry);
    } else {
      other.push(entry);
    }
  }
}

const summary = {
  total: data.numTotalTests ?? 0,
  passed: data.numPassedTests ?? 0,
  failed: data.numFailedTests ?? 0,
  startTime: data.startTime,
  success: data.success ?? (data.numFailedTests === 0),
};

const routeReports = [...routes.entries()]
  .map(([route, tests]) => {
    const failed = tests.filter((t) => t.status === "failed");
    return {
      route,
      passed: tests.length - failed.length,
      failedCount: failed.length,
      failed: failed.map((f) => ({
        check: f.title,
        suite: f.suite,
        reason: (f.messages[0] || "").split("\n").slice(0, 4).join("\n"),
      })),
    };
  })
  .sort((a, b) => b.failedCount - a.failedCount || a.route.localeCompare(b.route));

const failingRoutes = routeReports.filter((r) => r.failedCount > 0);

writeFileSync(JSON_OUT, JSON.stringify({ summary, routes: routeReports, other }, null, 2));

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>SEO Test Report</title>
<style>
  body{font-family:ui-sans-serif,system-ui,sans-serif;background:#0d0f12;color:#e6e6e6;margin:0;padding:32px;max-width:1100px;margin-inline:auto}
  h1{margin:0 0 8px;font-size:28px}
  .meta{color:#9aa;font-size:13px;margin-bottom:24px}
  .summary{display:flex;gap:16px;margin:24px 0}
  .card{flex:1;padding:18px;border-radius:12px;background:#15181d;border:1px solid #232830}
  .card .num{font-size:32px;font-weight:700}
  .ok{color:#a3e635}.bad{color:#f87171}
  table{width:100%;border-collapse:collapse;margin-top:16px}
  th,td{text-align:left;padding:10px 12px;border-bottom:1px solid #232830;font-size:14px;vertical-align:top}
  th{color:#9aa;font-weight:600;font-size:12px;text-transform:uppercase;letter-spacing:.08em}
  .pill{display:inline-block;padding:2px 10px;border-radius:999px;font-size:12px;font-weight:600}
  .pill.ok{background:#1a2e10;color:#a3e635}
  .pill.bad{background:#3a1414;color:#f87171}
  pre{margin:6px 0 0;padding:10px;background:#0a0c0f;border-radius:8px;font-size:12px;overflow:auto;color:#fca5a5}
  details summary{cursor:pointer;color:#a3e635}
  code{background:#0a0c0f;padding:2px 6px;border-radius:4px}
</style></head>
<body>
  <h1>SEO Test Report</h1>
  <div class="meta">Generated ${new Date().toISOString()} · WeboGrowth Tools</div>
  <div class="summary">
    <div class="card"><div class="num">${summary.total}</div><div>Total checks</div></div>
    <div class="card"><div class="num ok">${summary.passed}</div><div>Passed</div></div>
    <div class="card"><div class="num ${summary.failed ? "bad" : "ok"}">${summary.failed}</div><div>Failed</div></div>
    <div class="card"><div class="num ${summary.success ? "ok" : "bad"}">${summary.success ? "PASS" : "FAIL"}</div><div>Overall</div></div>
  </div>

  <h2>Routes (${routeReports.length})</h2>
  <table>
    <thead><tr><th>Route</th><th>Status</th><th>Passed</th><th>Failed</th><th>Missing / failing checks</th></tr></thead>
    <tbody>
    ${routeReports.map((r) => `
      <tr>
        <td><code>${esc(r.route)}</code></td>
        <td><span class="pill ${r.failedCount ? "bad" : "ok"}">${r.failedCount ? "FAIL" : "PASS"}</span></td>
        <td>${r.passed}</td>
        <td>${r.failedCount}</td>
        <td>${
          r.failed.length === 0
            ? "—"
            : `<details><summary>${r.failed.length} failure(s)</summary>${
                r.failed.map((f) => `<div><strong>${esc(f.check)}</strong><pre>${esc(f.reason)}</pre></div>`).join("")
              }</details>`
        }</td>
      </tr>`).join("")}
    </tbody>
  </table>

  ${failingRoutes.length === 0 ? `<p class="ok" style="margin-top:24px">All routes pass every SEO check.</p>` : ""}
</body></html>`;

writeFileSync(HTML_OUT, html);

console.log(`\nSEO report written:`);
console.log(`  JSON: ${JSON_OUT}`);
console.log(`  HTML: ${HTML_OUT}`);
console.log(`  Summary: ${summary.passed}/${summary.total} passed, ${summary.failed} failed`);
console.log(`  Failing routes: ${failingRoutes.length}`);

process.exit(summary.success ? 0 : 1);
