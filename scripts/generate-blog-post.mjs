#!/usr/bin/env node
/**
 * Auto-generate a SEO-optimized blog post via Google AI Studio (Gemini API).
 *
 * - Picks the next un-posted topic from marketing/blog-topic-queue.json
 * - Calls Gemini 2.5 Flash (text) + Gemini 2.5 Flash Image (cover) directly
 *   on Google's Generative Language API using GEMINI_API_KEY
 * - Validates JSON, appends a fully-formed post to src/blog/posts.ts
 * - Adds a sitemap.xml entry, saves cover image to public/blog-images/
 * - Marks the topic as posted in the queue
 *
 * Optional env: GEMINI_API_KEY  (get from https://aistudio.google.com/apikey)
 * If Gemini is unavailable, the workflow publishes a deterministic fallback post + SVG cover.
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

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey && !dry) {
  console.warn("⚠ GEMINI_API_KEY missing. Publishing a deterministic fallback post instead of failing the workflow.");
}

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const TEXT_MODEL = "gemini-2.5-flash";
const IMAGE_MODEL = "gemini-2.5-flash-image";

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

function uniqueSlug(base, used) {
  const cleanBase = slugify(base || topic.title) || `blog-post-${Date.now()}`;
  if (!used.has(cleanBase)) return cleanBase;

  for (let n = 2; n < 1000; n++) {
    const suffix = `-${n}`;
    const candidate = `${cleanBase.slice(0, 80 - suffix.length)}${suffix}`;
    if (!used.has(candidate)) return candidate;
  }

  return `${cleanBase.slice(0, 69)}-${Date.now().toString(36)}`;
}

function titleCase(value) {
  return String(value)
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function clampText(value, max, fallback) {
  const text = String(value || fallback || "").replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;
  return text.slice(0, Math.max(0, max - 3)).replace(/[\s,.;:-]+$/g, "") + "...";
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sanitizeRelatedTools(input) {
  const first = { label: topic.relatedToolLabel, path: topic.relatedToolPath };
  const seen = new Set([first.path]);
  const tools = [first];

  for (const tool of Array.isArray(input) ? input : []) {
    if (!tool?.label || !tool?.path || !String(tool.path).startsWith("/")) continue;
    if (seen.has(tool.path)) continue;
    seen.add(tool.path);
    tools.push({ label: String(tool.label).slice(0, 60), path: String(tool.path).slice(0, 80) });
    if (tools.length >= 4) break;
  }

  return tools;
}

function buildFallbackBody() {
  const keyword = topic.primaryKeyword;
  const toolLabel = topic.relatedToolLabel;
  const toolPath = topic.relatedToolPath;
  const shortTitle = topic.title.replace(/\s*\([^)]*\)\s*/g, " ").replace(/\s+/g, " ").trim();

  return `${shortTitle} is easier when you use a fast browser-based workflow. This guide shows how to handle ${keyword} without uploads, installs, or confusing settings. Built by the team at [WeboGrowth](https://webogrowth.com), it focuses on practical steps you can use today.

## Why ${keyword} matters

People usually search for ${keyword} because they need a quick result, not a long technical lesson. The safest approach is to use a tool that runs in your browser, keeps your files private, and gives you an output that works across websites, email, and social platforms.

The [${toolLabel}](${toolPath}) is designed for that workflow. It keeps the process simple: choose your file or input, review the result, and download or copy the final output.

## Quick comparison

| Method | Best for | Privacy | Setup time |
|---|---|---|---|
| Browser tool | Fast one-off tasks and client work | High, when processing stays local | Under 1 minute |
| Desktop app | Large repeat batches | Depends on the app | 5-20 minutes |
| Server upload tool | Sharing across teams | Lower, files leave your device | 1-3 minutes |

For most small business, SEO, design, and developer tasks, the browser option is the best balance of speed and control.

## Step-by-step workflow

1. Open the [${toolLabel}](${toolPath}).
2. Add your file or paste the content you want to process.
3. Keep the default settings first, then adjust quality, size, or output format only if needed.
4. Preview the result before downloading or copying it.
5. Save the optimized output with a clear file name that includes the target keyword or page name.

This simple workflow reduces mistakes because you can see the result before publishing it.

## Best settings to start with

Use conservative settings when quality matters. If you are preparing assets for a landing page, blog post, product page, or social preview, start with the default output and only reduce quality or size when the file is still too large.

For SEO pages, pair the output with helpful metadata. If the task relates to images, write descriptive alt text. If it relates to code or markup, validate the result before shipping it.

## Common mistakes

- **Using random upload sites for private files.** Prefer browser-based tools for client or internal work.
- **Over-optimizing the result.** Smaller is not always better if readability or quality drops.
- **Forgetting the final page context.** A file, snippet, or tag should support the page's search intent.
- **Skipping a preview.** Always check the result before adding it to a live page.

## Where WeboGrowth Tools fits

The [${toolLabel}](${toolPath}) is part of WeboGrowth Tools, a free toolkit for image, SEO, design, and developer workflows. If your next step is technical SEO, you can also use tools like the [Meta Tag Generator](/meta-tag-generator), [Sitemap Generator](/sitemap-generator), or [PageSpeed Analyzer](/pagespeed-analyzer).

## TL;DR

For ${keyword}, use a browser-based workflow first. It is faster, safer for private work, and easier to repeat. Start with the [${toolLabel}](${toolPath}), preview the output, then publish only after checking quality and SEO context.`;
}

function buildFallbackPost(reason = "") {
  if (reason) console.warn(`⚠ Using fallback post: ${reason}`);
  const keyword = topic.primaryKeyword;
  const title = clampText(topic.title, 60, titleCase(keyword));
  return {
    _fallback: true,
    slug: slugify(topic.title),
    title,
    description: clampText(`${titleCase(keyword)} guide with simple steps, privacy tips, common mistakes, and a free browser-based tool from WeboGrowth.`, 158),
    keywords: [
      keyword,
      `${keyword} guide`,
      `${keyword} free`,
      `${keyword} online`,
      topic.relatedToolLabel.toLowerCase(),
      "webogrowth tools",
    ].join(", "),
    category: topic.category,
    readMinutes: 6,
    excerpt: clampText(`A practical guide to ${keyword}, including the safest workflow, best settings, common mistakes, and a free browser tool.`, 200),
    relatedTools: [{ label: topic.relatedToolLabel, path: topic.relatedToolPath }],
    imagePrompt: `Modern editorial cover for ${keyword}: a clean workstation screen with abstract file cards, subtle lime-green accents, dark background, soft studio lighting, no text.`,
    imageAlt: clampText(`${keyword} guide cover image`, 120),
    body: buildFallbackBody(),
  };
}

function normalizePost(input) {
  const fallback = buildFallbackPost();
  const post = { ...fallback, ...(input && typeof input === "object" ? input : {}) };

  post.slug = uniqueSlug(post.slug || post.title || fallback.slug, existingSlugs);
  post.title = clampText(post.title, 70, fallback.title);
  post.description = clampText(post.description, 160, fallback.description);
  post.keywords = clampText(post.keywords, 500, fallback.keywords);
  post.excerpt = clampText(post.excerpt, 200, fallback.excerpt);
  post.relatedTools = sanitizeRelatedTools(post.relatedTools);
  post.body = String(post.body || fallback.body).trim() || fallback.body;
  post.imagePrompt = clampText(post.imagePrompt, 500, fallback.imagePrompt);
  post.imageAlt = clampText(post.imageAlt, 120, fallback.imageAlt);

  const validCats = ["Image", "Developer", "SEO", "Design", "Guide"];
  if (!validCats.includes(post.category)) post.category = topic.category;

  const minutes = Number(post.readMinutes);
  post.readMinutes = Number.isFinite(minutes) ? Math.min(12, Math.max(3, Math.round(minutes))) : fallback.readMinutes;

  return post;
}

function createFallbackCover(slug, title, subtitle = topic.primaryKeyword) {
  if (dry) return null;

  const dir = path.join(ROOT, "public/blog-images");
  fs.mkdirSync(dir, { recursive: true });

  const filename = `${slug}.svg`;
  const filePath = path.join(dir, filename);
  const safeTitle = escapeHtml(clampText(title, 58, topic.title));
  const safeSubtitle = escapeHtml(clampText(subtitle, 96, topic.primaryKeyword));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720" role="img" aria-label="${safeTitle}">
  <defs>
    <radialGradient id="glow" cx="24%" cy="18%" r="70%">
      <stop offset="0" stop-color="#bef264" stop-opacity="0.36"/>
      <stop offset="0.42" stop-color="#365314" stop-opacity="0.16"/>
      <stop offset="1" stop-color="#020617" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="card" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="#1f2937"/>
      <stop offset="1" stop-color="#0f172a"/>
    </linearGradient>
  </defs>
  <rect width="1280" height="720" fill="#020617"/>
  <rect width="1280" height="720" fill="url(#glow)"/>
  <circle cx="1080" cy="118" r="190" fill="#84cc16" opacity="0.08"/>
  <circle cx="1130" cy="610" r="260" fill="#22c55e" opacity="0.06"/>
  <g opacity="0.25" stroke="#bef264" stroke-width="1">
    <path d="M120 170H1160M120 250H1160M120 330H1160M120 410H1160M120 490H1160M120 570H1160"/>
    <path d="M200 110V620M360 110V620M520 110V620M680 110V620M840 110V620M1000 110V620"/>
  </g>
  <rect x="150" y="145" width="980" height="430" rx="34" fill="url(#card)" stroke="#bef264" stroke-opacity="0.28" stroke-width="2"/>
  <rect x="190" y="185" width="190" height="38" rx="19" fill="#bef264" opacity="0.95"/>
  <text x="215" y="211" fill="#0f172a" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="700" letter-spacing="2">WEBOGROWTH GUIDE</text>
  <text x="190" y="330" fill="#f8fafc" font-family="Arial, Helvetica, sans-serif" font-size="56" font-weight="800">${safeTitle}</text>
  <text x="190" y="405" fill="#cbd5e1" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="500">${safeSubtitle}</text>
  <path d="M190 475H530" stroke="#bef264" stroke-width="8" stroke-linecap="round"/>
  <g transform="translate(840 262)">
    <rect width="190" height="150" rx="24" fill="#111827" stroke="#84cc16" stroke-opacity="0.45"/>
    <path d="M46 96l35-42 33 31 22-25 25 36" fill="none" stroke="#bef264" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="59" cy="50" r="14" fill="#bef264"/>
  </g>
</svg>
`;

  fs.writeFileSync(filePath, svg);
  console.log(`✓ Fallback cover image: /blog-images/${filename}`);
  return `/blog-images/${filename}`;
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
- Exactly ONE inline link to our parent agency https://webogrowth.com — placed naturally in the intro OR the closing TL;DR (e.g. "Built by the team at [WeboGrowth](https://webogrowth.com)")
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
  "imagePrompt": "A short, vivid scene description (1-2 sentences) for a 16:9 editorial cover image illustrating the article. No text in the image. Modern, clean, professional. Dark background friendly. Include subject, mood, lighting, style.",
  "imageAlt": "Concise alt text for the cover image, includes the primary keyword naturally, ≤ 120 chars",
  "body": "full markdown body, NO leading H1 (the page renders the title), starts with the intro paragraph"
}`;

const USER = `Topic: ${topic.title}
Primary keyword: ${topic.primaryKeyword}
Category: ${topic.category}
Required related tool (must be the first item of relatedTools): { "label": "${topic.relatedToolLabel}", "path": "${topic.relatedToolPath}" }
You may add 1–2 more related tools from this set if relevant: /compressor, /converter, /image-resizer, /image-to-svg, /svg-optimizer, /favicon, /background-remover, /watermark, /video-to-gif, /pdf-toolkit, /alt-text-generator, /pagespeed-analyzer, /json-formatter, /css-minifier, /base64, /html-to-markdown, /jwt-decoder, /regex-tester, /curl-builder, /diff-checker, /meta-tag-generator, /og-preview, /sitemap-generator, /robots-generator, /schema-generator, /color-palette, /gradient-generator, /qr-code, /placeholder, /lorem-ipsum.

Write the article now. Output JSON only.`;

// Retry transient Gemini failures (429 rate limit, 500/502/503/504 outages).
async function fetchWithRetry(url, init, { tries = 5, baseDelayMs = 4000 } = {}) {
  let lastErr;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, init);
      if (res.ok) return res;
      if (![429, 500, 502, 503, 504].includes(res.status)) return res;
      const body = await res.text();
      lastErr = new Error(`HTTP ${res.status}: ${body.slice(0, 200)}`);
      console.warn(`  ↻ attempt ${i + 1}/${tries} failed (${res.status}); retrying...`);
    } catch (e) {
      lastErr = e;
      console.warn(`  ↻ attempt ${i + 1}/${tries} network error: ${e.message}`);
    }
    if (i < tries - 1) {
      const delay = baseDelayMs * Math.pow(2, i) + Math.floor(Math.random() * 1000);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastErr ?? new Error("fetchWithRetry exhausted");
}

async function callModel() {
  if (dry) {
    return buildFallbackPost("dry run");
  }

  if (!apiKey) {
    return buildFallbackPost("missing GEMINI_API_KEY");
  }

  try {
    const url = `${GEMINI_BASE}/${TEXT_MODEL}:generateContent?key=${apiKey}`;
    const body = JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM }] },
      contents: [{ role: "user", parts: [{ text: USER }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.7,
        maxOutputTokens: 8192,
      },
    });
    const res = await fetchWithRetry(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`Gemini API ${res.status}: ${t.slice(0, 500)}`);
    }

    const data = await res.json();
    const content = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).filter(Boolean).join("");
    if (!content) throw new Error("Empty completion: " + JSON.stringify(data).slice(0, 500));
    return safeParseJson(content);
  } catch (e) {
    return buildFallbackPost(e?.message || "model generation failed");
  }
}

// Gemini sometimes emits invalid JSON inside markdown body strings:
//   - invalid escapes: "\ ", "\|", "\-", "\!"
//   - raw control chars (literal newlines/tabs) inside string values
// Repair them with a string-aware scanner before JSON.parse.
function safeParseJson(raw) {
  let text = raw.trim();
  // strip markdown fences if present
  text = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "");
  // trim to outermost JSON object
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start > 0 || end < text.length - 1) {
    if (start !== -1 && end !== -1 && end > start) text = text.slice(start, end + 1);
  }
  try { return JSON.parse(text); } catch {}
  return JSON.parse(repairJsonStrings(text));
}

function repairJsonStrings(input) {
  const validEscapes = new Set(['"', "\\", "/", "b", "f", "n", "r", "t", "u"]);
  let out = "";
  let inString = false;
  for (let i = 0; i < input.length; i++) {
    const c = input[i];
    if (!inString) {
      out += c;
      if (c === '"') inString = true;
      continue;
    }
    // inside a string
    if (c === "\\") {
      const next = input[i + 1];
      if (next === undefined) { out += "\\\\"; continue; }
      if (validEscapes.has(next)) { out += c + next; i++; continue; }
      // invalid escape — drop the backslash, keep the char
      out += next;
      i++;
      continue;
    }
    if (c === '"') { out += c; inString = false; continue; }
    // escape raw control chars that are illegal inside JSON strings
    const code = c.charCodeAt(0);
    if (code < 0x20) {
      if (c === "\n") out += "\\n";
      else if (c === "\r") out += "\\r";
      else if (c === "\t") out += "\\t";
      else out += "\\u" + code.toString(16).padStart(4, "0");
      continue;
    }
    out += c;
  }
  return out;
}


const post = normalizePost(await callModel());

// ---- validate ----
const required = ["slug", "title", "description", "keywords", "category", "readMinutes", "excerpt", "relatedTools", "body"];
for (const k of required) if (post[k] == null) Object.assign(post, normalizePost(buildFallbackPost(`missing field: ${k}`)));

const today = new Date().toISOString().slice(0, 10);

// ---- generate cover image via Google Gemini Image API ----
async function generateCover(prompt, slug) {
  if (dry) return null;
  if (!apiKey) return null;
  if (!prompt) return null;
  try {
    const url = `${GEMINI_BASE}/${IMAGE_MODEL}:generateContent?key=${apiKey}`;
    const res = await fetchWithRetry(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Create a 16:9 widescreen editorial cover image. Modern, clean, professional, dark-mode friendly with subtle lime-green accents. No text, no watermarks, no logos. Scene: ${prompt}`,
              },
            ],
          },
        ],
        generationConfig: { responseModalities: ["IMAGE", "TEXT"] },
      }),
    });
    if (!res.ok) {
      console.warn(`✗ Image gen failed ${res.status}: ${await res.text()}`);
      return null;
    }
    const data = await res.json();
    const parts = data?.candidates?.[0]?.content?.parts || [];
    const imgPart = parts.find((p) => p.inlineData?.data);
    if (!imgPart) {
      console.warn("✗ No image data in response: " + JSON.stringify(data).slice(0, 300));
      return null;
    }
    const buf = Buffer.from(imgPart.inlineData.data, "base64");
    const dir = path.join(ROOT, "public/blog-images");
    fs.mkdirSync(dir, { recursive: true });
    const mimeType = String(imgPart.inlineData.mimeType || "image/png").toLowerCase();
    const ext = mimeType.includes("jpeg") || mimeType.includes("jpg") ? "jpg" : mimeType.includes("webp") ? "webp" : "png";
    const filename = `${slug}.${ext}`;
    fs.writeFileSync(path.join(dir, filename), buf);
    console.log(`✓ Cover image: /blog-images/${filename} (${Math.round(buf.length / 1024)} KB)`);
    return `/blog-images/${filename}`;
  } catch (e) {
    console.warn(`✗ Image gen error: ${e.message}`);
    return null;
  }
}

const coverPath = (post._fallback ? null : await generateCover(post.imagePrompt, post.slug)) ?? createFallbackCover(post.slug, post.title, post.imageAlt);
const coverAlt = post.imageAlt || post.title;

// ---- build TS literal ----
const esc = (s) => s.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
const relatedTools = post.relatedTools
  .filter((t) => t && t.label && t.path)
  .slice(0, 4)
  .map((t) => `      { label: ${JSON.stringify(t.label)}, path: ${JSON.stringify(t.path)} },`)
  .join("\n");

// Guarantee a webogrowth.com link exists in the body
let finalBody = post.body;
if (!/webogrowth\.com/i.test(finalBody)) {
  finalBody += `\n\n---\n\n*Published by the team at [WeboGrowth](https://webogrowth.com) — SEO &amp; growth services for ambitious brands.*\n`;
}

const coverField = coverPath ? `    cover: ${JSON.stringify(coverPath)},\n` : "";

const block = `  post({
    slug: ${JSON.stringify(post.slug)},
    title: ${JSON.stringify(post.title)},
    description: ${JSON.stringify(post.description)},
    keywords: ${JSON.stringify(post.keywords)},
    date: ${JSON.stringify(today)},
    author: "WeboGrowth Team",
    category: ${JSON.stringify(post.category)},
    readMinutes: ${Number(post.readMinutes) || 6},
${coverField}    excerpt: ${JSON.stringify(post.excerpt)},
    relatedTools: [
${relatedTools}
    ],
    body: \`${esc(finalBody)}\`,
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
