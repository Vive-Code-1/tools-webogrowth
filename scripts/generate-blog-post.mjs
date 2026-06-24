#!/usr/bin/env node
/**
 * Auto-generate a SEO-optimized blog post via Lovable AI Gateway.
 *
 * - Picks the next un-posted topic from marketing/blog-topic-queue.json
 * - Calls Gemini 2.5 Flash via the Lovable AI Gateway
 * - Validates JSON, appends a fully-formed post to src/blog/posts.ts
 * - Adds a sitemap.xml entry
 * - Marks the topic as posted in the queue
 *
 * Required env: LOVABLE_API_KEY
 * Usage: node scripts/generate-blog-post.mjs [--dry] [--slug=custom-slug]
 */
import fs from "node:fs";
import path from "node:path";

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? true];
  }),
);
const dry = !!args.dry;

const ROOT = process.cwd();
const QUEUE = path.join(ROOT, "marketing/blog-topic-queue.json");
const POSTS = path.join(ROOT, "src/blog/posts.ts");
const SITEMAP = path.join(ROOT, "public/sitemap.xml");
const SITE = "https://tools.webogrowth.com";

const apiKey = process.env.LOVABLE_API_KEY;
if (!apiKey && !dry) {
  console.error("✗ LOVABLE_API_KEY missing. Set it as a repo secret.");
  process.exit(1);
}

// ---- pick next topic ----
const queue = JSON.parse(fs.readFileSync(QUEUE, "utf8"));
const postsSrc = fs.readFileSync(POSTS, "utf8");
const existingSlugs = new Set([...postsSrc.matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]));

const topic = queue.find((t) => !t.posted && !existingSlugs.has(slugify(t.title)));
if (!topic) {
  console.log("Queue empty — nothing to publish today.");
  process.exit(0);
}
console.log(`→ Generating: ${topic.title}`);

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

// ---- prompt the model ----
const SYSTEM = `You are a senior SEO content writer for WeboGrowth Tools (https://tools.webogrowth.com), a free in-browser tool suite for developers, designers and marketers.

Write articles that rank on Google. Follow E-E-A-T. Use the inverted pyramid. Include the primary keyword in: title, first 100 words, at least one H2, and the TL;DR. Aim for 900–1200 words. Write at an 8th-grade reading level. Avoid fluff and AI tells ("dive into", "in today's digital landscape", "unlock the power of").

Always include:
- A short hook intro (2–3 sentences) that answers the search intent immediately
- 4–7 H2 sections with practical, scannable subheadings
- At least one comparison table
- At least one numbered list (step-by-step)
- A "Common mistakes" or "Pitfalls" section
- A "TL;DR" closing section
- Inline links to the related WeboGrowth tool (use relative paths like [/compressor]) at least 2 times
- 1–2 inline links to other WeboGrowth tools or blog posts where genuinely relevant
- No emojis in headings; sparingly in lists is OK
- No external affiliate links

Return STRICT JSON only — no markdown fence, no commentary. Schema:
{
  "slug": "kebab-case-slug-under-80-chars",
  "title": "≤ 60 chars, includes primary keyword",
  "description": "≤ 158 chars meta description, includes primary keyword + benefit",
  "keywords": "comma-separated, 6-10 phrases",
  "category": "Image | Developer | SEO | Design | Guide",
  "readMinutes": 5-9,
  "excerpt": "≤ 200 chars hook for the blog index card",
  "relatedTools": [{ "label": "...", "path": "/..." }],
  "body": "full markdown body, NO leading H1 (the page renders the title), starts with the intro paragraph"
}`;

const USER = `Topic: ${topic.title}
Primary keyword: ${topic.primaryKeyword}
Category: ${topic.category}
Required related tool (must be the first item of relatedTools): { "label": "${topic.relatedToolLabel}", "path": "${topic.relatedToolPath}" }
You may add 1–2 more related tools from this set if relevant: /compressor, /converter, /image-resizer, /image-to-svg, /svg-optimizer, /favicon, /background-remover, /watermark, /video-to-gif, /pdf-toolkit, /alt-text-generator, /pagespeed-analyzer, /json-formatter, /css-minifier, /base64, /html-to-markdown, /jwt-decoder, /regex-tester, /curl-builder, /diff-checker, /meta-tag-generator, /og-preview, /sitemap-generator, /robots-generator, /schema-generator, /color-palette, /gradient-generator, /qr-code, /placeholder, /lorem-ipsum.

Write the article now. Output JSON only.`;

async function callModel() {
  if (dry) {
    return {
      slug: slugify(topic.title),
      title: topic.title,
      description: `Dry-run description for ${topic.primaryKeyword}.`,
      keywords: topic.primaryKeyword,
      category: topic.category,
      readMinutes: 6,
      excerpt: "Dry run.",
      relatedTools: [{ label: topic.relatedToolLabel, path: topic.relatedToolPath }],
      body: "Dry run body.",
    };
  }
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: USER },
      ],
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`AI Gateway ${res.status}: ${t}`);
  }
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty completion: " + JSON.stringify(data));
  return JSON.parse(content);
}

const post = await callModel();

// ---- validate ----
const required = ["slug", "title", "description", "keywords", "category", "readMinutes", "excerpt", "relatedTools", "body"];
for (const k of required) if (post[k] == null) throw new Error(`Missing field: ${k}`);
if (post.title.length > 70) post.title = post.title.slice(0, 67) + "...";
if (post.description.length > 160) post.description = post.description.slice(0, 157) + "...";
post.slug = slugify(post.slug || post.title);
if (existingSlugs.has(post.slug)) {
  console.error(`✗ Slug already exists: ${post.slug}`);
  process.exit(1);
}
const validCats = ["Image", "Developer", "SEO", "Design", "Guide"];
if (!validCats.includes(post.category)) post.category = topic.category;

const today = new Date().toISOString().slice(0, 10);

// ---- build TS literal ----
const esc = (s) => s.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
const relatedTools = post.relatedTools
  .filter((t) => t && t.label && t.path)
  .slice(0, 4)
  .map((t) => `      { label: ${JSON.stringify(t.label)}, path: ${JSON.stringify(t.path)} },`)
  .join("\n");

const block = `  post({
    slug: ${JSON.stringify(post.slug)},
    title: ${JSON.stringify(post.title)},
    description: ${JSON.stringify(post.description)},
    keywords: ${JSON.stringify(post.keywords)},
    date: ${JSON.stringify(today)},
    author: "WeboGrowth Team",
    category: ${JSON.stringify(post.category)},
    readMinutes: ${Number(post.readMinutes) || 6},
    excerpt: ${JSON.stringify(post.excerpt)},
    relatedTools: [
${relatedTools}
    ],
    body: \`${esc(post.body)}\`,
  }),
];`;

const updatedPosts = postsSrc.replace(/\n\];\s*\n\nexport const getPostBySlug/, `\n${block}\n\nexport const getPostBySlug`);
if (updatedPosts === postsSrc) throw new Error("Failed to splice post into src/blog/posts.ts");

// ---- sitemap entry ----
const sitemap = fs.readFileSync(SITEMAP, "utf8");
const newUrl = `  <url><loc>${SITE}/blog/${post.slug}</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>\n</urlset>`;
const updatedSitemap = sitemap.includes(`/blog/${post.slug}`)
  ? sitemap
  : sitemap.replace("</urlset>", newUrl);

// ---- mark queue ----
const idx = queue.findIndex((t) => t.title === topic.title);
queue[idx].posted = new Date().toISOString();
queue[idx].slug = post.slug;

if (dry) {
  console.log("--- DRY RUN ---\n", block.slice(0, 600), "\n...");
  process.exit(0);
}

fs.writeFileSync(POSTS, updatedPosts);
fs.writeFileSync(SITEMAP, updatedSitemap);
fs.writeFileSync(QUEUE, JSON.stringify(queue, null, 2) + "\n");

console.log(`✓ Published /blog/${post.slug}`);
console.log(`  title: ${post.title}`);
console.log(`  words: ~${post.body.split(/\s+/).length}`);
