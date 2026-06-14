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
const PW_RESULTS = resolve(ROOT, "playwright-report", "results.json");

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

// ---- Optional: enrich with Playwright failure artifacts -------------------
// When CI runs Playwright with `--reporter=json`, it writes results.json with
// per-attempt attachments (trace.zip, screenshot.png, video.webm). We surface
// those as links beside the related route so the SEO dashboard becomes a
// one-stop debugging spot.
const pwFailures = new Map(); // route -> [{ title, trace, screenshot, video }]
if (existsSync(PW_RESULTS)) {
  try {
    const pw = JSON.parse(readFileSync(PW_RESULTS, "utf-8"));
    const walk = (suite) => {
      for (const s of suite.suites ?? []) walk(s);
      for (const spec of suite.specs ?? []) {
        for (const test of spec.tests ?? []) {
          const lastRun = test.results?.[test.results.length - 1];
          if (!lastRun || lastRun.status === "passed") continue;
          // suite title looks like "Rendered SEO for /qr-code"
          const m = (spec.title || "").match(/(\/[a-z0-9\-/]*)/i) ||
                    (suite.title || "").match(/(\/[a-z0-9\-/]*)/i);
          const route = m ? m[1] : "(other)";
          const artifacts = {};
          for (const a of lastRun.attachments ?? []) {
            if (a.name === "trace" && a.path) artifacts.trace = a.path;
            if (a.name === "screenshot" && a.path) artifacts.screenshot = a.path;
            if (a.name === "video" && a.path) artifacts.video = a.path;
          }
          if (!pwFailures.has(route)) pwFailures.set(route, []);
          pwFailures.get(route).push({ title: spec.title, ...artifacts });
        }
      }
    };
    for (const s of pw.suites ?? []) walk(s);
  } catch (e) {
    console.warn("Could not parse Playwright results.json:", e.message);
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
      playwright: pwFailures.get(route) ?? [],
    };
  })
  .sort((a, b) => b.failedCount - a.failedCount || a.route.localeCompare(b.route));

const failingRoutes = routeReports.filter((r) => r.failedCount > 0);

writeFileSync(JSON_OUT, JSON.stringify({ summary, routes: routeReports, other }, null, 2));

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const relArtifact = (p) => {
  // Artifacts get copied into the dashboard alongside playwright/ — strip
  // local absolute paths to a clean relative href.
  const idx = p.indexOf("playwright-report");
  return idx >= 0 ? "playwright/" + p.slice(idx + "playwright-report/".length) : p;
};

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>SEO Test Report</title>
<style>
  body{font-family:ui-sans-serif,system-ui,sans-serif;background:#0d0f12;color:#e6e6e6;margin:0;padding:32px;max-width:1100px;margin-inline:auto}
  h1{margin:0 0 8px;font-size:28px}
  .meta{color:#9aa;font-size:13px;margin-bottom:24px}
  .summary{display:flex;gap:16px;margin:24px 0;flex-wrap:wrap}
  .card{flex:1;min-width:180px;padding:18px;border-radius:12px;background:#15181d;border:1px solid #232830}
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
  .toolbar{display:flex;gap:10px;flex-wrap:wrap;margin:12px 0 4px}
  .toolbar input,.toolbar select{background:#0a0c0f;color:#e6e6e6;border:1px solid #232830;border-radius:8px;padding:8px 12px;font-size:13px}
  .toolbar input{flex:1;min-width:220px}
  .pw a{color:#60a5fa;margin-right:10px;font-size:12px;text-decoration:none}
  .pw a:hover{text-decoration:underline}
  .pw{margin-top:8px;padding:8px;background:#0a0c0f;border-radius:6px;font-size:12px}
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
  <div class="toolbar">
    <input id="q" placeholder="Search routes (e.g. /qr-code)" />
    <select id="status"><option value="all">All statuses</option><option value="fail">Failing only</option><option value="pass">Passing only</option></select>
    <span id="count" style="color:#9aa;align-self:center;font-size:12px"></span>
  </div>
  <table id="routes">
    <thead><tr><th>Route</th><th>Status</th><th>Passed</th><th>Failed</th><th>Missing / failing checks</th></tr></thead>
    <tbody>
    ${routeReports.map((r) => `
      <tr data-route="${esc(r.route)}" data-status="${r.failedCount ? "fail" : "pass"}">
        <td><code>${esc(r.route)}</code></td>
        <td><span class="pill ${r.failedCount ? "bad" : "ok"}">${r.failedCount ? "FAIL" : "PASS"}</span></td>
        <td>${r.passed}</td>
        <td>${r.failedCount}</td>
        <td>${
          r.failed.length === 0 && r.playwright.length === 0
            ? "—"
            : (r.failed.length
                ? `<details open><summary>${r.failed.length} failure(s)</summary>${
                    r.failed.map((f) => `<div><strong>${esc(f.check)}</strong><pre>${esc(f.reason)}</pre></div>`).join("")
                  }</details>`
                : "") + (r.playwright.length
                ? `<div class="pw"><strong>Playwright artifacts:</strong><br>${
                    r.playwright.map((p) => `${esc(p.title)} — ${
                      [p.trace && `<a target="_blank" href="${esc(relArtifact(p.trace))}">trace</a>`,
                       p.screenshot && `<a target="_blank" href="${esc(relArtifact(p.screenshot))}">screenshot</a>`,
                       p.video && `<a target="_blank" href="${esc(relArtifact(p.video))}">video</a>`,
                       `<a target="_blank" href="playwright/index.html">html report</a>`].filter(Boolean).join(" · ")
                    }`).join("<br>")
                  }</div>`
                : "")
        }</td>
      </tr>`).join("")}
    </tbody>
  </table>

  ${failingRoutes.length === 0 ? `<p class="ok" style="margin-top:24px">All routes pass every SEO check.</p>` : ""}

<script>
(function(){
  const q = document.getElementById("q");
  const status = document.getElementById("status");
  const count = document.getElementById("count");
  const rows = [...document.querySelectorAll("#routes tbody tr")];
  function apply(){
    const s = q.value.trim().toLowerCase();
    const f = status.value;
    let shown = 0;
    for (const r of rows){
      const route = r.dataset.route.toLowerCase();
      const st = r.dataset.status;
      const ok = (!s || route.includes(s)) && (f === "all" || st === f);
      r.style.display = ok ? "" : "none";
      if (ok) shown++;
    }
    count.textContent = shown + " / " + rows.length + " routes";
  }
  q.addEventListener("input", apply); status.addEventListener("change", apply); apply();
})();
</script>
</body></html>`;

writeFileSync(HTML_OUT, html);

console.log(`\nSEO report written:`);
console.log(`  JSON: ${JSON_OUT}`);
console.log(`  HTML: ${HTML_OUT}`);
console.log(`  Summary: ${summary.passed}/${summary.total} passed, ${summary.failed} failed`);
console.log(`  Failing routes: ${failingRoutes.length}`);
console.log(`  Playwright failure groups: ${pwFailures.size}`);

process.exit(summary.success ? 0 : 1);
