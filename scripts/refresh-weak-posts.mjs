#!/usr/bin/env node
/**
 * Automatically improves existing blog posts instead of only publishing new ones.
 *
 * Order of work each run:
 *   1. Slugs listed in marketing/refresh-priority.json (e.g. "Crawled – not indexed" posts)
 *   2. Then the lowest-scoring posts from the shared SEO audit (src/lib/postAudit.ts)
 * A post is never refreshed twice within 45 days (tracked in marketing/refresh-log.json).
 *
 * Rewrites body, description, excerpt and FAQs with Gemini, keeps slug/title/URL,
 * sets `updated` to today. Run with tsx so the TS modules can be imported:
 *   npx tsx scripts/refresh-weak-posts.mjs [--count=3] [--dry]
 */
import fs from "node:fs";
import path from "node:path";
import { BLOG_POSTS } from "../src/blog/posts.ts";
import { auditPost } from "../src/lib/postAudit.ts";

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? true];
  }),
);
const COUNT = Math.max(1, Math.min(Number(args.count) || 3, 5));
const dry = !!args.dry;

const ROOT = process.cwd();
const POSTS = path.join(ROOT, "src/blog/posts.ts");
const PRIORITY = path.join(ROOT, "marketing/refresh-priority.json");
const LOG = path.join(ROOT, "marketing/refresh-log.json");
const today = new Date().toISOString().slice(0, 10);
const COOLDOWN_DAYS = 45;

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey && !dry) {
  console.log("GEMINI_API_KEY missing — skipping refresh run.");
  process.exit(0);
}

const priority = fs.existsSync(PRIORITY) ? JSON.parse(fs.readFileSync(PRIORITY, "utf8")) : { slugs: [] };
const log = fs.existsSync(LOG) ? JSON.parse(fs.readFileSync(LOG, "utf8")) : {};

const recentlyDone = (slug) =>
  log[slug] && (Date.now() - new Date(log[slug]).getTime()) / 86_400_000 < COOLDOWN_DAYS;

const audits = new Map(BLOG_POSTS.map((p) => [p.slug, auditPost(p)]));
const queue = [
  ...priority.slugs.filter((s) => audits.has(s)),
  ...[...audits.values()].sort((a, b) => a.score - b.score).filter((a) => a.score < 85).map((a) => a.slug),
];
const picked = [...new Set(queue)].filter((s) => !recentlyDone(s)).slice(0, COUNT);

if (picked.length === 0) {
  console.log("Nothing to refresh — every weak post was improved recently.");
  process.exit(0);
}

const toolList = [
  "/compressor", "/converter", "/heic-to-jpg", "/image-resizer", "/background-remover", "/watermark",
  "/image-to-svg", "/svg-optimizer", "/favicon", "/placeholder", "/video-to-gif", "/alt-text-generator",
  "/json-formatter", "/css-minifier", "/base64", "/html-to-markdown", "/jwt-decoder", "/regex-tester",
  "/diff-checker", "/curl-builder", "/meta-tag-generator", "/og-preview", "/robots-generator",
  "/sitemap-generator", "/schema-generator", "/pagespeed-analyzer", "/color-palette",
  "/gradient-generator", "/qr-code", "/lorem-ipsum", "/pdf-toolkit",
].join(", ");

async function rewrite(post, audit) {
  const related = BLOG_POSTS.filter((p) => p.slug !== post.slug && p.category === post.category)
    .slice(0, 6)
    .map((p) => `/blog/${p.slug} — ${p.title}`)
    .join("\n");

  const prompt = `You are improving an existing blog post so Google indexes and ranks it. Keep the same topic and search intent.

Title (do not change): ${post.title}
Focus keyword: ${audit.focusKeyword}
Current audit problems:
${audit.issues.map((i) => `- ${i.label}: ${i.suggestion}`).join("\n") || "- none, but make it deeper and more useful"}

Requirements:
- 1,400–1,900 words of markdown. Start with a 2–3 sentence direct answer containing the focus keyword.
- At least 5 "## " sections phrased like real searches, with "### " steps where useful.
- One comparison table and one concrete worked example with real numbers.
- At least 5 internal links using descriptive anchor text: the main tool page plus related posts. Tool pages: ${toolList}. Related posts:\n${related}
- One outbound citation to an authoritative source (web.dev, MDN, developers.google.com).
- No "## FAQ" section in the body; put 5 FAQs in the JSON instead (real Google questions, 2–4 sentence answers, no markdown).
- Plain, helpful, first-hand tone. No filler, no "in today's digital world".

Return ONLY JSON: {"description": "120-158 chars incl. focus keyword", "excerpt": "1-2 sentences", "body": "markdown", "faqs": [{"question":"...?","answer":"..."}]}

Current post body for reference:
${post.body.slice(0, 12000)}`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.6, maxOutputTokens: 8192 },
      }),
    },
  );
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") || "";
  const json = JSON.parse(text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, ""));
  if (!json.body || json.body.length < 3000) throw new Error("Rewrite too short — keeping the original.");
  return json;
}

const esc = (s) => s.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");

function replaceBlock(src, post, next) {
  const slugIdx = src.indexOf(`slug: ${JSON.stringify(post.slug)}`);
  if (slugIdx === -1) throw new Error(`slug not found: ${post.slug}`);
  const start = src.lastIndexOf("  post({", slugIdx);
  const end = src.indexOf("\n  }),", slugIdx);
  if (start === -1 || end === -1) throw new Error(`block bounds not found: ${post.slug}`);

  const tools = (post.relatedTools || [])
    .map((t) => `      { label: ${JSON.stringify(t.label)}, path: ${JSON.stringify(t.path)} },`)
    .join("\n");
  const faqs = next.faqs
    .map((f) => `      { question: ${JSON.stringify(f.question)}, answer: ${JSON.stringify(f.answer)} },`)
    .join("\n");
  const words = next.body.split(/\s+/).length;

  const block = `  post({
    slug: ${JSON.stringify(post.slug)},
    title: ${JSON.stringify(post.title)},
    description: ${JSON.stringify(next.description)},
    keywords: ${JSON.stringify(post.keywords)},
    date: ${JSON.stringify(post.date)},
    updated: ${JSON.stringify(today)},
    author: ${JSON.stringify(post.author)},
    category: ${JSON.stringify(post.category)},
    readMinutes: ${Math.max(5, Math.round(words / 230))},
${post.cover ? `    cover: ${JSON.stringify(post.cover)},\n` : ""}    excerpt: ${JSON.stringify(next.excerpt || post.excerpt)},
    relatedTools: [
${tools}
    ],
    body: \`${esc(next.body)}\`,
    faqs: [
${faqs}
    ],`;
  return src.slice(0, start) + block + src.slice(end);
}

let src = fs.readFileSync(POSTS, "utf8");
const refreshed = [];

for (const slug of picked) {
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  const before = audits.get(slug);
  try {
    if (dry) {
      console.log(`[dry] would refresh ${slug} (score ${before.score})`);
      continue;
    }
    const next = await rewrite(post, before);
    if (!Array.isArray(next.faqs) || next.faqs.length < 3) throw new Error("Not enough FAQs returned.");
    const after = auditPost({ ...post, ...next, updated: today });
    if (after.score < before.score) throw new Error(`New version scored lower (${after.score} < ${before.score}).`);
    src = replaceBlock(src, post, next);
    log[slug] = today;
    refreshed.push(`https://tools.webogrowth.com/blog/${slug}`);
    console.log(`✓ ${slug}: ${before.score} → ${after.score}`);
  } catch (e) {
    console.warn(`✗ ${slug}: ${e.message}`);
  }
  await new Promise((r) => setTimeout(r, 5000));
}

if (!dry && refreshed.length) {
  fs.writeFileSync(POSTS, src);
  fs.writeFileSync(LOG, JSON.stringify(log, null, 2) + "\n");
  priority.slugs = priority.slugs.filter((s) => !log[s] || log[s] !== today);
  fs.writeFileSync(PRIORITY, JSON.stringify(priority, null, 2) + "\n");
  fs.writeFileSync(path.join(ROOT, ".refreshed-urls.txt"), refreshed.join("\n") + "\n");
}
console.log(`Done — refreshed ${refreshed.length}/${picked.length}.`);
