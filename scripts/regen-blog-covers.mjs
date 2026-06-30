#!/usr/bin/env node
/**
 * Regenerate topic-aware SVG cover images for every entry in src/blog/posts.ts.
 *
 * Usage:
 *   node scripts/regen-blog-covers.mjs            # write all
 *   node scripts/regen-blog-covers.mjs --slug=foo # write a single slug
 *   node scripts/regen-blog-covers.mjs --dry      # log only
 */
import fs from "node:fs";
import path from "node:path";
import { buildCoverSvg } from "./lib-blog-cover.mjs";

const ROOT = process.cwd();
const POSTS = path.join(ROOT, "src/blog/posts.ts");
const OUT_DIR = path.join(ROOT, "public/blog-images");

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? true];
  }),
);
const dry = !!args.dry;
const onlySlug = args.slug && args.slug !== true ? String(args.slug) : null;

const src = fs.readFileSync(POSTS, "utf8");

// Naive but reliable parse: split on `post({` boundaries and pull required fields per block.
const blocks = src.split(/post\(\{/).slice(1);
const records = [];
for (const raw of blocks) {
  const slug = (raw.match(/slug:\s*"([^"]+)"/) || [])[1];
  const title = (raw.match(/title:\s*"((?:[^"\\]|\\.)*)"/) || [])[1] || "";
  const description = (raw.match(/description:\s*\n?\s*"((?:[^"\\]|\\.)*)"/) || raw.match(/description:\s*"((?:[^"\\]|\\.)*)"/) || [])[1] || "";
  const keywords = (raw.match(/keywords:\s*\n?\s*"((?:[^"\\]|\\.)*)"/) || raw.match(/keywords:\s*"((?:[^"\\]|\\.)*)"/) || [])[1] || "";
  const category = (raw.match(/category:\s*"([^"]+)"/) || [])[1] || "Guide";
  if (!slug) continue;
  records.push({
    slug,
    title: title.replace(/\\"/g, '"'),
    description: description.replace(/\\"/g, '"'),
    keyword: keywords.split(",")[0]?.trim() || title,
    category,
  });
}

if (!records.length) {
  console.error("No posts parsed from src/blog/posts.ts");
  process.exit(1);
}

fs.mkdirSync(OUT_DIR, { recursive: true });

let n = 0;
for (const r of records) {
  if (onlySlug && r.slug !== onlySlug) continue;
  const subtitle = r.keyword || r.description.slice(0, 70);
  const svg = buildCoverSvg({
    slug: r.slug,
    title: r.title,
    subtitle,
    category: r.category,
    keyword: r.keyword,
  });
  const out = path.join(OUT_DIR, `${r.slug}.svg`);
  if (dry) {
    console.log(`(dry) would write ${out}  [${r.category}]`);
  } else {
    fs.writeFileSync(out, svg);
    console.log(`✓ ${r.slug}.svg  [${r.category}]`);
  }
  n++;
}
console.log(`Done — ${n} cover${n === 1 ? "" : "s"} ${dry ? "previewed" : "written"}.`);
