#!/usr/bin/env node
// Build a static index.html for the published reports directory.
import { readdirSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const dest = process.argv[2] || "site/main";
const entries = [
  { href: "seo-report.html",        label: "SEO test report",     desc: "Per-route pass/fail with search + status filter and Playwright failure artifacts" },
  { href: "seo-diff.html",          label: "Snapshot diff",       desc: "Changed / new / removed routes vs baseline, with route filter" },
  { href: "playwright/index.html",  label: "Playwright audit",    desc: "Rendered title/meta/JSON-LD + screenshots, video, trace viewer on failure" },
  { href: "lighthouse/",            label: "Lighthouse (desktop)", desc: "Performance / accessibility / SEO scores — desktop preset" },
  { href: "lighthouse-mobile/",     label: "Lighthouse (mobile)", desc: "Same thresholds, mobile preset (Moto G Power, slow 4G, 4× CPU)" },
].filter((e) => existsSync(resolve(dest, e.href.replace(/\/$/, "")))).map((e) => e);

writeFileSync(resolve(dest, "index.html"), `<!doctype html><html><head><meta charset="utf-8">
<title>SEO Dashboard</title>
<style>body{font-family:ui-sans-serif,system-ui,sans-serif;background:#0d0f12;color:#e6e6e6;margin:0;padding:40px;max-width:780px;margin-inline:auto}
h1{margin:0 0 24px}a.card{display:block;padding:20px;margin:12px 0;background:#15181d;border:1px solid #232830;border-radius:12px;text-decoration:none;color:inherit}
a.card:hover{border-color:#a3e635}.label{color:#a3e635;font-weight:700}.desc{color:#9aa;font-size:14px;margin-top:4px}</style>
</head><body><h1>SEO Dashboard — ${dest.replace("site/", "")}</h1>
${entries.map((e) => `<a class="card" href="${e.href}"><div class="label">${e.label} →</div><div class="desc">${e.desc}</div></a>`).join("")}
</body></html>`);
console.log(`Dashboard written: ${dest}/index.html`);
