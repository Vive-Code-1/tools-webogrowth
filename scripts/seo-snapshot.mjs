#!/usr/bin/env node
// Snapshot SEO fields and diff against a configurable baseline.
//
// Usage:
//   node scripts/seo-snapshot.mjs                          # write reports/seo-snapshot.json
//   node scripts/seo-snapshot.mjs --diff                   # diff vs default baseline
//   node scripts/seo-snapshot.mjs --diff --baseline=<path> # diff vs an explicit baseline file
//   node scripts/seo-snapshot.mjs --diff --source=last     # baseline = last successful run
//   node scripts/seo-snapshot.mjs --diff --source=pr-42    # baseline = saved PR baseline
//   node scripts/seo-snapshot.mjs --promote                # promote current snapshot to baselines
//                                                          # rotates last-5 history and (with --pr=N) saves PR baseline
// Baseline layout under reports/baseline/:
//   seo-snapshot.json        canonical (= "last successful run", same as history/01.json)
//   history/01.json…05.json  rolling last 5 successful runs (01 = newest)
//   pr/pr-<N>.json           per-PR baseline (frozen at PR creation/update)

import { execFileSync } from "node:child_process";
import {
  mkdirSync, readFileSync, writeFileSync, existsSync, copyFileSync, readdirSync, renameSync, unlinkSync,
} from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const REPORTS = resolve(ROOT, "reports");
const BASELINE_DIR = resolve(REPORTS, "baseline");
const HISTORY_DIR = resolve(BASELINE_DIR, "history");
const PR_DIR = resolve(BASELINE_DIR, "pr");
const SNAPSHOT = resolve(REPORTS, "seo-snapshot.json");
const BASELINE = resolve(BASELINE_DIR, "seo-snapshot.json");
const DIFF_JSON = resolve(REPORTS, "seo-diff.json");
const DIFF_HTML = resolve(REPORTS, "seo-diff.html");

mkdirSync(REPORTS, { recursive: true });
mkdirSync(BASELINE_DIR, { recursive: true });
mkdirSync(HISTORY_DIR, { recursive: true });
mkdirSync(PR_DIR, { recursive: true });

// ---------- CLI parsing ----------
const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const opt = (name) => {
  const a = args.find((a) => a.startsWith(`--${name}=`));
  return a ? a.split("=").slice(1).join("=") : null;
};
const HISTORY_KEEP = 5;

// ---------- Snapshot ----------
const tsxScript = `
import { TOOL_SEO, buildJsonLdFor, getSeoProps } from "./src/lib/seo";
const out = {};
for (const p of Object.keys(TOOL_SEO)) {
  const props = getSeoProps(p);
  const ld = buildJsonLdFor(p);
  out[p] = {
    title: props.title,
    description: props.description,
    keywords: props.keywords,
    canonicalPath: props.canonicalPath,
    jsonLdTypes: ld.map((b) => b["@type"]),
    faqCount: ld.find((b) => b["@type"] === "FAQPage")?.mainEntity?.length ?? 0,
    howtoSteps: ld.find((b) => b["@type"] === "HowTo")?.step?.length ?? 0,
  };
}
process.stdout.write(JSON.stringify(out));
`;
const routesJson = execFileSync("npx", ["tsx", "-e", tsxScript], { cwd: ROOT, encoding: "utf-8" });

const snapshot = { generatedAt: new Date().toISOString(), routes: JSON.parse(routesJson) };
writeFileSync(SNAPSHOT, JSON.stringify(snapshot, null, 2));
console.log(`Snapshot written: ${SNAPSHOT} (${Object.keys(snapshot.routes).length} routes)`);

// ---------- --promote: rotate history and save PR baseline ----------
if (flag("--promote")) {
  // Rotate history: 04→05, 03→04, …, drop oldest > KEEP.
  const existing = readdirSync(HISTORY_DIR)
    .filter((f) => /^\d+\.json$/.test(f))
    .sort();
  for (const f of [...existing].reverse()) {
    const n = parseInt(f, 10);
    if (n >= HISTORY_KEEP) { unlinkSync(resolve(HISTORY_DIR, f)); continue; }
    renameSync(resolve(HISTORY_DIR, f), resolve(HISTORY_DIR, String(n + 1).padStart(2, "0") + ".json"));
  }
  copyFileSync(SNAPSHOT, resolve(HISTORY_DIR, "01.json"));
  copyFileSync(SNAPSHOT, BASELINE);
  console.log(`Baseline promoted (history rotated, ${HISTORY_KEEP} kept).`);
  const pr = opt("pr");
  if (pr) {
    const dest = resolve(PR_DIR, `pr-${pr}.json`);
    copyFileSync(SNAPSHOT, dest);
    console.log(`PR baseline saved: ${dest}`);
  }
  process.exit(0);
}

if (!flag("--diff")) process.exit(0);

// ---------- Resolve baseline file from --baseline / --source ----------
function resolveBaselinePath() {
  const explicit = opt("baseline");
  if (explicit) return resolve(ROOT, explicit);
  const source = opt("source") || "default";
  if (source === "default" || source === "last") return BASELINE;
  if (source.startsWith("history:")) {
    const n = parseInt(source.split(":")[1], 10);
    return resolve(HISTORY_DIR, String(n).padStart(2, "0") + ".json");
  }
  if (source.startsWith("pr-")) return resolve(PR_DIR, `${source}.json`);
  return BASELINE;
}
const baselinePath = resolveBaselinePath();

if (!existsSync(baselinePath)) {
  console.log(`No baseline at ${baselinePath}; seeding it with the current snapshot.`);
  copyFileSync(SNAPSHOT, baselinePath);
  if (baselinePath === BASELINE) copyFileSync(SNAPSHOT, resolve(HISTORY_DIR, "01.json"));
  writeFileSync(DIFF_JSON, JSON.stringify({ initial: true, baselineSource: baselinePath, routes: [] }, null, 2));
  writeFileSync(DIFF_HTML, `<!doctype html><meta charset="utf-8"><title>SEO Diff</title><body style="font-family:sans-serif;padding:32px"><h1>SEO snapshot diff</h1><p>Initial baseline created — nothing to compare yet.</p></body>`);
  process.exit(0);
}

const baseline = JSON.parse(readFileSync(baselinePath, "utf-8"));
const fields = ["title", "description", "keywords", "canonicalPath", "faqCount", "howtoSteps"];

const changes = [];
const allRoutes = new Set([...Object.keys(baseline.routes), ...Object.keys(snapshot.routes)]);
for (const path of allRoutes) {
  const before = baseline.routes[path];
  const after = snapshot.routes[path];
  if (!before) { changes.push({ path, kind: "added", after }); continue; }
  if (!after)  { changes.push({ path, kind: "removed", before }); continue; }
  const diffs = [];
  for (const f of fields) {
    if (JSON.stringify(before[f]) !== JSON.stringify(after[f])) {
      diffs.push({ field: f, before: before[f], after: after[f] });
    }
  }
  const beforeTypes = [...(before.jsonLdTypes ?? [])].sort().join(",");
  const afterTypes = [...(after.jsonLdTypes ?? [])].sort().join(",");
  if (beforeTypes !== afterTypes) {
    diffs.push({ field: "jsonLdTypes", before: before.jsonLdTypes, after: after.jsonLdTypes });
  }
  if (diffs.length) changes.push({ path, kind: "changed", diffs });
}

writeFileSync(DIFF_JSON, JSON.stringify({
  baselineSource: baselinePath.replace(ROOT + "/", ""),
  baselineAt: baseline.generatedAt,
  currentAt: snapshot.generatedAt,
  totalChanges: changes.length,
  changes,
}, null, 2));

const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const fmt = (v) => typeof v === "object" ? JSON.stringify(v) : String(v ?? "");

const html = `<!doctype html><html><head><meta charset="utf-8"><title>SEO Snapshot Diff</title>
<style>
 body{font-family:ui-sans-serif,system-ui,sans-serif;background:#0d0f12;color:#e6e6e6;margin:0;padding:32px;max-width:1100px;margin-inline:auto}
 h1{margin:0 0 8px}.meta{color:#9aa;margin-bottom:24px;font-size:13px}
 .route{background:#15181d;border:1px solid #232830;border-radius:12px;padding:18px;margin-bottom:16px}
 .route h2{margin:0 0 10px;font-size:18px}
 .pill{display:inline-block;padding:2px 10px;border-radius:999px;font-size:11px;font-weight:700;text-transform:uppercase}
 .added{background:#1a2e10;color:#a3e635}.removed{background:#3a1414;color:#f87171}.changed{background:#2a2410;color:#fbbf24}
 table{width:100%;border-collapse:collapse;margin-top:8px;font-size:13px}
 th,td{text-align:left;padding:8px;border-bottom:1px solid #232830;vertical-align:top}
 th{color:#9aa;font-size:11px;text-transform:uppercase}
 del{color:#f87171;text-decoration:none;background:#3a1414;padding:1px 4px;border-radius:3px}
 ins{color:#a3e635;text-decoration:none;background:#1a2e10;padding:1px 4px;border-radius:3px}
 code{background:#0a0c0f;padding:2px 6px;border-radius:4px}
 .ok{color:#a3e635;text-align:center;padding:48px}
 .toolbar{display:flex;gap:10px;flex-wrap:wrap;margin:12px 0 18px}
 .toolbar input,.toolbar select{background:#0a0c0f;color:#e6e6e6;border:1px solid #232830;border-radius:8px;padding:8px 12px;font-size:13px}
 .toolbar input{flex:1;min-width:220px}
</style></head><body>
<h1>SEO Snapshot Diff</h1>
<div class="meta">Baseline <code>${esc(baselinePath.replace(ROOT + "/", ""))}</code> @ ${esc(baseline.generatedAt)} → Current @ ${esc(snapshot.generatedAt)} · ${changes.length} route(s) changed</div>
<div class="toolbar">
  <input id="q" placeholder="Search routes (e.g. /qr-code)" />
  <select id="kind"><option value="all">All changes</option><option value="changed">Changed only</option><option value="added">New only</option><option value="removed">Removed only</option></select>
  <span id="count" style="color:#9aa;align-self:center;font-size:12px"></span>
</div>
<div id="list">
${changes.length === 0 ? '<div class="ok">✓ No SEO field changes vs baseline.</div>' : changes.map((c) => `
  <div class="route" data-path="${esc(c.path)}" data-kind="${c.kind}">
    <h2><span class="pill ${c.kind}">${c.kind}</span> <code>${esc(c.path)}</code></h2>
    ${c.kind === "changed" ? `
      <table><thead><tr><th>Field</th><th>Before</th><th>After</th></tr></thead><tbody>
        ${c.diffs.map((d) => `<tr><td><code>${esc(d.field)}</code></td><td><del>${esc(fmt(d.before))}</del></td><td><ins>${esc(fmt(d.after))}</ins></td></tr>`).join("")}
      </tbody></table>` : ""}
    ${c.kind === "added" ? `<p>New route added with title: <strong>${esc(c.after.title)}</strong></p>` : ""}
    ${c.kind === "removed" ? `<p>Route removed. Last title: <strong>${esc(c.before.title)}</strong></p>` : ""}
  </div>
`).join("")}
</div>
<script>
(function(){
  const q = document.getElementById("q"), kind = document.getElementById("kind"), count = document.getElementById("count");
  const items = [...document.querySelectorAll("#list .route")];
  function apply(){
    const s = q.value.trim().toLowerCase(), f = kind.value; let shown = 0;
    for (const r of items){
      const ok = (!s || r.dataset.path.toLowerCase().includes(s)) && (f === "all" || r.dataset.kind === f);
      r.style.display = ok ? "" : "none"; if (ok) shown++;
    }
    count.textContent = shown + " / " + items.length + " changes";
  }
  if (q){ q.addEventListener("input", apply); kind.addEventListener("change", apply); apply(); }
})();
</script>
</body></html>`;

writeFileSync(DIFF_HTML, html);
console.log(`Diff written vs ${baselinePath}: ${changes.length} change(s)`);
