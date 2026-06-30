#!/usr/bin/env node
/**
 * Generates public/sitemap.xml from:
 *  - Static routes declared in src/App.tsx (excludes /admin, /not-found, dynamic params)
 *  - Blog posts from src/blog/posts.ts
 *  - Blog categories + tags derived from posts
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), "..");
const BASE = "https://tools.webogrowth.com";
const TODAY = new Date().toISOString().slice(0, 10);

// ---------- Static routes from App.tsx ----------
const appSrc = fs.readFileSync(path.join(ROOT, "src/App.tsx"), "utf8");
const routes = [...appSrc.matchAll(/path="(\/[^"]*)"/g)]
  .map((m) => m[1])
  .filter((p) => !p.includes(":") && p !== "*" && p !== "/admin");

// Priority/changefreq map
const META = {
  "/": { p: "1.0", c: "weekly" },
  "/blog": { p: "0.9", c: "daily" },
  "/compressor": { p: "0.9", c: "monthly" },
  "/background-remover": { p: "0.9", c: "monthly" },
  "/pdf-toolkit": { p: "0.9", c: "monthly" },
  "/heic-to-jpg": { p: "0.9", c: "monthly" },
  "/privacy-policy": { p: "0.3", c: "yearly" },
  "/terms-of-service": { p: "0.3", c: "yearly" },
  "/about-us": { p: "0.5", c: "monthly" },
  "/contact-us": { p: "0.5", c: "monthly" },
};
const DEFAULT_TOOL = { p: "0.8", c: "monthly" };

// ---------- Blog posts ----------
const postsSrc = fs.readFileSync(path.join(ROOT, "src/blog/posts.ts"), "utf8");
const slugs = [...postsSrc.matchAll(/^\s*slug:\s*"([a-z0-9-]+)"/gm)].map((m) => m[1]);

// ---------- Categories + tags ----------
const categories = [...postsSrc.matchAll(/^\s*category:\s*"([^"]+)"/gm)].map((m) => m[1]);
const tagsBlocks = [...postsSrc.matchAll(/tags:\s*\[([^\]]+)\]/g)].map((m) => m[1]);
const tags = new Set();
for (const blk of tagsBlocks) {
  for (const t of blk.matchAll(/"([^"]+)"/g)) tags.add(t[1]);
}
const slugify = (s) =>
  s
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const catSlugs = [...new Set(categories.map(slugify))].filter(Boolean);
const tagSlugs = [...new Set([...tags].map(slugify))].filter(Boolean);

// ---------- Build entries ----------
const entries = [];
for (const r of routes) {
  const meta = META[r] || DEFAULT_TOOL;
  entries.push({ loc: BASE + r, p: meta.p, c: meta.c });
}
for (const s of slugs) entries.push({ loc: `${BASE}/blog/${s}`, p: "0.8", c: "monthly" });
for (const s of catSlugs) entries.push({ loc: `${BASE}/blog/category/${s}`, p: "0.6", c: "weekly" });
for (const s of tagSlugs) entries.push({ loc: `${BASE}/blog/tag/${s}`, p: "0.5", c: "weekly" });

// Dedup
const seen = new Set();
const unique = entries.filter((e) => (seen.has(e.loc) ? false : seen.add(e.loc)));

const xml =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  unique
    .map(
      (e) =>
        `  <url><loc>${e.loc}</loc><lastmod>${TODAY}</lastmod><changefreq>${e.c}</changefreq><priority>${e.p}</priority></url>`
    )
    .join("\n") +
  `\n</urlset>\n`;

fs.writeFileSync(path.join(ROOT, "public/sitemap.xml"), xml);
console.log(`sitemap.xml written — ${unique.length} URLs (routes: ${routes.length}, posts: ${slugs.length}, categories: ${catSlugs.length}, tags: ${tagSlugs.length})`);
