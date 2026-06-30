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
import { buildCoverSvg } from "./lib-blog-cover.mjs";

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
// Try multiple image models in order — Gemini occasionally renames endpoints.
const IMAGE_MODELS = [
  "gemini-2.5-flash-image-preview",
  "gemini-2.5-flash-image",
  "gemini-2.0-flash-preview-image-generation",
  "imagen-3.0-generate-002",
];

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
  post._fallback = Boolean(input && typeof input === "object" && input._fallback);

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

  post.faqs = Array.isArray(post.faqs)
    ? post.faqs
        .filter((f) => f && typeof f.question === "string" && typeof f.answer === "string")
        .slice(0, 8)
        .map((f) => ({
          question: clampText(f.question.trim(), 160, ""),
          answer: clampText(f.answer.trim(), 600, ""),
        }))
        .filter((f) => f.question && f.answer)
    : [];

  return post;
}

// Word-wrap a string into <= maxLines lines, each no wider than maxChars chars.
// Returns array of lines; last line gets ellipsis if input had more words than fit.
function wrapTitle(text, maxChars, maxLines) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length <= maxChars) {
      line = candidate;
    } else {
      if (line) lines.push(line);
      line = word;
      if (lines.length === maxLines) break;
    }
  }
  if (line && lines.length < maxLines) lines.push(line);
  if (lines.length === maxLines && words.join(" ").length > lines.join(" ").length) {
    const last = lines[lines.length - 1];
    lines[lines.length - 1] = last.length > maxChars - 1 ? last.slice(0, maxChars - 1) + "…" : last + "…";
  }
  return lines;
}

// Deterministic hash from a string → integer.
function hashString(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

// Category + keyword → palette + topic icon. Each category has a distinct hue family.
// Icons are 24x24 path data, drawn with stroke; tool/keyword overrides pick the most relevant icon.
const COVER_PALETTES = {
  Image:     { glow: "#bef264", glow2: "#365314", accentA: "#bef264", accentB: "#65a30d", ring: "#84cc16", ring2: "#22c55e", badgeText: "#0a0f05" },
  Developer: { glow: "#67e8f9", glow2: "#0e7490", accentA: "#22d3ee", accentB: "#0891b2", ring: "#06b6d4", ring2: "#3b82f6", badgeText: "#03121a" },
  SEO:       { glow: "#fcd34d", glow2: "#92400e", accentA: "#fbbf24", accentB: "#d97706", ring: "#f59e0b", ring2: "#ea580c", badgeText: "#1a0f02" },
  Design:    { glow: "#f0abfc", glow2: "#86198f", accentA: "#e879f9", accentB: "#a21caf", ring: "#d946ef", ring2: "#ec4899", badgeText: "#1a021a" },
  Marketing: { glow: "#fda4af", glow2: "#9f1239", accentA: "#fb7185", accentB: "#e11d48", ring: "#f43f5e", ring2: "#dc2626", badgeText: "#1a0207" },
  PDF:       { glow: "#c4b5fd", glow2: "#5b21b6", accentA: "#a78bfa", accentB: "#7c3aed", ring: "#8b5cf6", ring2: "#6366f1", badgeText: "#0f0820" },
  Guide:     { glow: "#6ee7b7", glow2: "#065f46", accentA: "#34d399", accentB: "#059669", ring: "#10b981", ring2: "#14b8a6", badgeText: "#021a10" },
};

// Topic icons — 24x24 path strokes. Keyword match wins over category default.
const TOPIC_ICONS = {
  image:    "M3 6a2 2 0 012-2h3l2-2h4l2 2h3a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6zm9 11a4 4 0 100-8 4 4 0 000 8z",
  code:     "M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16",
  search:   "M21 21l-5-5M10.5 17a6.5 6.5 0 110-13 6.5 6.5 0 010 13z",
  palette:  "M12 22a10 10 0 110-20 10 10 0 0110 10c0 2.21-1.79 4-4 4h-2a2 2 0 00-2 2 3 3 0 01-2 4z M7 12a1 1 0 100-2 1 1 0 000 2zM9 7a1 1 0 100-2 1 1 0 000 2zM15 7a1 1 0 100-2 1 1 0 000 2zM17 12a1 1 0 100-2 1 1 0 000 2z",
  megaphone:"M3 11v2a2 2 0 002 2h2l5 4V5L7 9H5a2 2 0 00-2 2zM17 7a6 6 0 010 10",
  pdf:      "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM14 2v6h6 M9 14h6M9 17h4",
  book:     "M4 4h12a4 4 0 014 4v12H8a4 4 0 01-4-4V4z M4 16a4 4 0 014-4h12",
  qr:       "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 14h2v2h-2zM14 18h2v2h-2zM18 18h2v2h-2z",
  json:     "M8 4a4 4 0 00-4 4v3a3 3 0 01-3 3 3 3 0 013 3v3a4 4 0 004 4M16 4a4 4 0 014 4v3a3 3 0 003 3 3 3 0 00-3 3v3a4 4 0 01-4 4",
  css:      "M4 3l1.5 17L12 22l6.5-2L20 3H4zM8 8h8l-.5 4H9l.25 3L12 16l2.75-.75L15 13",
  html:     "M4 3l1.5 17L12 22l6.5-2L20 3H4zM7 7h10l-.5 5H8l.5 5 3.5 1 3.5-1 .25-3",
  color:    "M12 2L4 8v8l8 6 8-6V8l-8-6zM12 2v20M4 8l16 8M20 8L4 16",
  gradient: "M3 21h18M5 17h14M7 13h10M9 9h6M11 5h2",
  sitemap:  "M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8",
  robot:    "M5 8h14v10H5zM9 4v4M15 4v4M9 13h0.01M15 13h0.01M9 17h6",
  speed:    "M12 2a10 10 0 1010 10M12 12l4-4M12 12L7 17",
  shield:   "M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4z",
  text:     "M5 5h14M12 5v14M8 19h8",
  resize:   "M3 3h6M3 3v6M21 21h-6M21 21v-6M3 3l8 8M21 21l-8-8",
  crop:     "M6 2v16h16M2 6h16v16",
  watermark:"M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z",
  video:    "M3 6a2 2 0 012-2h10a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6zM22 6l-5 4v4l5 4V6z",
  layers:   "M12 2L2 8l10 6 10-6-10-6zM2 14l10 6 10-6M2 11l10 6 10-6",
  link:     "M9 15l6-6M11 7l1-1a4 4 0 116 6l-1 1M13 17l-1 1a4 4 0 11-6-6l1-1",
};

function pickIcon(category, keyword) {
  const kw = String(keyword || "").toLowerCase();
  // keyword overrides — most specific first
  const rules = [
    [/qr\s*code|wifi qr|vcard|menu qr/, "qr"],
    [/json/, "json"],
    [/\bcss\b|gradient|stylesheet/, kw.includes("gradient") ? "gradient" : "css"],
    [/\bhtml\b|markup/, "html"],
    [/\bjwt|base64|regex|curl|diff|encoder|decoder|minifier|formatter|developer|api/, "code"],
    [/sitemap/, "sitemap"],
    [/robots/, "robot"],
    [/meta tag|schema|open graph|og image|seo|search console|indexing|backlink|keyword/, "search"],
    [/page speed|core web vitals|lighthouse|performance/, "speed"],
    [/color palette/, "color"],
    [/gradient/, "gradient"],
    [/favicon|apple touch icon/, "shield"],
    [/lorem|dummy text|placeholder text/, "text"],
    [/resize|resizer/, "resize"],
    [/\bcrop\b/, "crop"],
    [/watermark/, "watermark"],
    [/video|gif/, "video"],
    [/pdf|merge pdf|split pdf|compress pdf/, "pdf"],
    [/alt text|alt-text/, "text"],
    [/svg|vector|trace/, "layers"],
    [/internal link|backlink|link\b/, "link"],
    [/heic|jpg|jpeg|png|webp|avif|image|photo|compressor|converter|background remover/, "image"],
    [/design|brand|logo/, "palette"],
    [/announce|launch|promote|marketing|share/, "megaphone"],
  ];
  for (const [re, key] of rules) if (re.test(kw)) return TOPIC_ICONS[key];
  // category fallback
  const catMap = { Image: "image", Developer: "code", SEO: "search", Design: "palette", Marketing: "megaphone", PDF: "pdf", Guide: "book" };
  return TOPIC_ICONS[catMap[category] || "book"];
}

function createFallbackCover(slug, title, subtitle = topic.primaryKeyword, category = topic.category, keyword = topic.primaryKeyword) {
  if (dry) return null;

  const dir = path.join(ROOT, "public/blog-images");
  fs.mkdirSync(dir, { recursive: true });

  const filename = `${slug}.svg`;
  const filePath = path.join(dir, filename);

  // ---- deterministic variation by slug hash ----
  const h = hashString(slug);
  const palette = COVER_PALETTES[category] || COVER_PALETTES.Guide;
  const iconPath = pickIcon(category, keyword);
  const variant = h % 4;            // 4 background layouts
  const glowCx = 12 + (h % 18);     // 12–30 %
  const glowCy = 10 + ((h >> 3) % 22); // 10–32 %
  const orbAng = (h >> 5) % 360;
  const orbAng2 = (h >> 9) % 360;

  // ---- text prep ----
  const rawTitle = String(title || topic.title).trim();
  const titleSize = rawTitle.length > 56 ? 50 : rawTitle.length > 44 ? 56 : rawTitle.length > 32 ? 64 : 72;
  const charsPerLine = titleSize >= 72 ? 17 : titleSize >= 64 ? 19 : titleSize >= 56 ? 22 : 25;
  const titleLines = wrapTitle(rawTitle, charsPerLine, 3).map(escapeHtml);
  const lineHeight = Math.round(titleSize * 1.14);

  const subtitleText = clampText(subtitle, 70, topic.primaryKeyword);
  const safeSubtitle = escapeHtml(subtitleText);

  // Badge sized via textLength so text never overflows the pill, regardless of font fallback.
  const badgeLabel = "WEBOGROWTH GUIDE";
  const badgePadX = 24;
  const badgeTextWidth = 178; // forced width via textLength
  const badgeWidth = badgeTextWidth + badgePadX * 2;
  const badgeHeight = 42;

  // Card geometry — leave a right-side column for the topic icon medallion.
  const cardX = 120, cardY = 135, cardW = 1040, cardH = 450;
  const padX = 175;
  const textRight = 760; // wrap zone — keeps clear of the icon medallion
  const charLimit = Math.min(charsPerLine, Math.floor((textRight - padX) / (titleSize * 0.55)));
  const wrappedLines = wrapTitle(rawTitle, charLimit, 3).map(escapeHtml);
  const finalLines = wrappedLines.length ? wrappedLines : titleLines;

  const badgeY = cardY + 40;
  const titleStartY = badgeY + badgeHeight + 70;
  const totalTitleHeight = finalLines.length * lineHeight;
  const subtitleY = titleStartY + totalTitleHeight - lineHeight + 50;
  const underlineY = subtitleY + 32;

  const titleTspans = finalLines
    .map((l, i) => `<tspan x="${padX}" ${i === 0 ? "" : `dy="${lineHeight}"`}>${l}</tspan>`)
    .join("");

  // Icon medallion (right side of card)
  const iconCx = 990, iconCy = cardY + cardH / 2 - 10;
  const iconR = 110;
  // Icon path 24x24 scaled by 6 (~144px), centered.
  const iconScale = 5.6;
  const iconTx = iconCx - 12 * iconScale;
  const iconTy = iconCy - 12 * iconScale;

  // Decoration variants behind icon
  const decor = (() => {
    switch (variant) {
      case 0: return `<circle cx="${iconCx}" cy="${iconCy}" r="${iconR + 50}" fill="none" stroke="${palette.accentA}" stroke-opacity="0.18" stroke-width="2" stroke-dasharray="4 8"/>`;
      case 1: return `<g opacity="0.22" stroke="${palette.accentA}" stroke-width="1.4" fill="none"><circle cx="${iconCx}" cy="${iconCy}" r="${iconR + 30}"/><circle cx="${iconCx}" cy="${iconCy}" r="${iconR + 60}"/></g>`;
      case 2: return `<rect x="${iconCx - iconR - 40}" y="${iconCy - iconR - 40}" width="${iconR * 2 + 80}" height="${iconR * 2 + 80}" rx="40" fill="none" stroke="${palette.accentA}" stroke-opacity="0.22" stroke-width="2" transform="rotate(${orbAng2 % 20 - 10} ${iconCx} ${iconCy})"/>`;
      default: return `<polygon points="${iconCx},${iconCy - iconR - 50} ${iconCx + iconR + 45},${iconCy} ${iconCx},${iconCy + iconR + 50} ${iconCx - iconR - 45},${iconCy}" fill="none" stroke="${palette.accentA}" stroke-opacity="0.22" stroke-width="2"/>`;
    }
  })();

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720" role="img" aria-label="${escapeHtml(rawTitle)}">
  <defs>
    <radialGradient id="glow" cx="${glowCx}%" cy="${glowCy}%" r="78%">
      <stop offset="0" stop-color="${palette.glow}" stop-opacity="0.45"/>
      <stop offset="0.45" stop-color="${palette.glow2}" stop-opacity="0.20"/>
      <stop offset="1" stop-color="#020617" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="card" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="#1f2937"/>
      <stop offset="1" stop-color="#0b1220"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0" stop-color="${palette.accentA}"/>
      <stop offset="1" stop-color="${palette.accentB}"/>
    </linearGradient>
    <radialGradient id="iconBg" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="${palette.accentA}" stop-opacity="0.30"/>
      <stop offset="1" stop-color="${palette.accentB}" stop-opacity="0.04"/>
    </radialGradient>
  </defs>
  <rect width="1280" height="720" fill="#020617"/>
  <rect width="1280" height="720" fill="url(#glow)"/>
  <g transform="rotate(${orbAng} 1120 120)"><circle cx="1120" cy="120" r="220" fill="${palette.ring}" opacity="0.10"/></g>
  <g transform="rotate(${orbAng2} 1180 640)"><circle cx="1180" cy="640" r="280" fill="${palette.ring2}" opacity="0.07"/></g>
  <g opacity="0.16" stroke="${palette.accentA}" stroke-width="1">
    <path d="M120 180H1160M120 260H1160M120 340H1160M120 420H1160M120 500H1160M120 580H1160"/>
    <path d="M240 110V620M400 110V620M560 110V620M720 110V620M880 110V620M1040 110V620"/>
  </g>
  <rect x="${cardX}" y="${cardY}" width="${cardW}" height="${cardH}" rx="36" fill="url(#card)" stroke="${palette.accentA}" stroke-opacity="0.32" stroke-width="2"/>

  ${decor}
  <circle cx="${iconCx}" cy="${iconCy}" r="${iconR}" fill="url(#iconBg)" stroke="${palette.accentA}" stroke-opacity="0.55" stroke-width="2"/>
  <g transform="translate(${iconTx} ${iconTy}) scale(${iconScale})" fill="none" stroke="${palette.accentA}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <path d="${iconPath}"/>
  </g>

  <rect x="${padX}" y="${badgeY}" width="${badgeWidth}" height="${badgeHeight}" rx="21" fill="url(#accent)"/>
  <text x="${padX + badgePadX}" y="${badgeY + 28}" textLength="${badgeTextWidth}" lengthAdjust="spacingAndGlyphs" fill="${palette.badgeText}" font-family="Inter, Arial, Helvetica, sans-serif" font-size="18" font-weight="800" letter-spacing="2">${badgeLabel}</text>

  <text fill="#f8fafc" font-family="Inter, Arial, Helvetica, sans-serif" font-size="${titleSize}" font-weight="800" y="${titleStartY}" style="letter-spacing:-1px">${titleTspans}</text>
  <text x="${padX}" y="${subtitleY}" fill="#94a3b8" font-family="Inter, Arial, Helvetica, sans-serif" font-size="24" font-weight="500">${safeSubtitle}</text>
  <path d="M${padX} ${underlineY}H${padX + 280}" stroke="url(#accent)" stroke-width="6" stroke-linecap="round"/>
  <text x="1140" y="560" text-anchor="end" fill="#475569" font-family="Inter, Arial, Helvetica, sans-serif" font-size="16" font-weight="600" letter-spacing="3">TOOLS.WEBOGROWTH.COM</text>
</svg>
`;

  fs.writeFileSync(filePath, svg);
  console.log(`✓ Cover image (topic-aware SVG): /blog-images/${filename}`);
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
- A "## FAQ" section near the end with 4–6 H3 questions; each question is a real query a user would type into Google, and each answer is 2–4 plain sentences directly under the H3 (no sub-headings, no lists inside the answer). Mirror these Q&A pairs into the JSON "faqs" array.
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
  "body": "full markdown body, NO leading H1 (the page renders the title), starts with the intro paragraph; MUST include an '## FAQ' H2 section with 4–6 H3 question/answer pairs",
  "faqs": [{ "question": "...?", "answer": "2–4 plain sentences, no markdown" }]
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

// ---- generate cover image via Google Gemini Image API (try multiple models) ----
async function tryImageModel(model, prompt) {
  const url = `${GEMINI_BASE}/${model}:generateContent?key=${apiKey}`;
  const isImagen = model.startsWith("imagen-");
  const body = isImagen
    ? {
        // Imagen REST shape
        instances: [{ prompt: `16:9 widescreen editorial cover. Modern, clean, professional, dark-mode friendly with subtle lime-green accents. No text, no watermarks, no logos. Scene: ${prompt}` }],
        parameters: { sampleCount: 1, aspectRatio: "16:9" },
      }
    : {
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
      };
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`${model} HTTP ${res.status}: ${txt.slice(0, 250)}`);
  }
  const data = await res.json();
  // Imagen returns predictions[].bytesBase64Encoded; Gemini returns candidates[0].content.parts[].inlineData
  let b64, mimeType;
  if (isImagen) {
    const pred = data?.predictions?.[0];
    b64 = pred?.bytesBase64Encoded;
    mimeType = pred?.mimeType || "image/png";
  } else {
    const parts = data?.candidates?.[0]?.content?.parts || [];
    const imgPart = parts.find((p) => p.inlineData?.data);
    b64 = imgPart?.inlineData?.data;
    mimeType = imgPart?.inlineData?.mimeType || "image/png";
  }
  if (!b64) throw new Error(`${model} returned no image bytes: ${JSON.stringify(data).slice(0, 250)}`);
  return { b64, mimeType };
}

async function generateCover(prompt, slug) {
  if (dry) return null;
  if (!apiKey) return null;
  if (!prompt) return null;

  let lastErr;
  for (const model of IMAGE_MODELS) {
    try {
      console.log(`  → trying image model: ${model}`);
      const { b64, mimeType } = await tryImageModel(model, prompt);
      const buf = Buffer.from(b64, "base64");
      const dir = path.join(ROOT, "public/blog-images");
      fs.mkdirSync(dir, { recursive: true });
      const mt = String(mimeType).toLowerCase();
      const ext = mt.includes("jpeg") || mt.includes("jpg") ? "jpg" : mt.includes("webp") ? "webp" : "png";
      const filename = `${slug}.${ext}`;
      fs.writeFileSync(path.join(dir, filename), buf);
      console.log(`✓ Cover image: /blog-images/${filename} (${Math.round(buf.length / 1024)} KB) via ${model}`);
      return `/blog-images/${filename}`;
    } catch (e) {
      lastErr = e;
      console.warn(`  ✗ ${e.message}`);
    }
  }
  console.warn(`✗ All image models failed. Last error: ${lastErr?.message || "unknown"}`);
  return null;
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

// Auto-insert internal links to relevant tool pages (first plain-text mention only,
// max one link per tool, max 4 extra links per post). Skips text already inside [..](..)
// markdown links, inline `code`, fenced ``` blocks, and image alts.
const TOOL_LINKS = [
  ["image compressor", "/compressor"], ["compress png", "/compressor"], ["compress jpeg", "/compressor"],
  ["webp compressor", "/compressor"], ["png to webp", "/converter"], ["jpg to webp", "/converter"],
  ["png to avif", "/converter"], ["heic to jpg", "/heic-to-jpg"], ["image resizer", "/image-resizer"],
  ["resize image", "/image-resizer"], ["background remover", "/background-remover"],
  ["watermark", "/watermark"], ["video to gif", "/video-to-gif"], ["favicon generator", "/favicon"],
  ["apple touch icon", "/favicon"], ["placeholder image", "/placeholder"], ["image to svg", "/image-to-svg"],
  ["svg optimizer", "/svg-optimizer"], ["svgo", "/svg-optimizer"], ["alt text", "/alt-text-generator"],
  ["pagespeed", "/pagespeed-analyzer"], ["core web vitals", "/pagespeed-analyzer"],
  ["json formatter", "/json-formatter"], ["json minifier", "/json-formatter"],
  ["css minifier", "/css-minifier"], ["base64", "/base64"], ["html to markdown", "/html-to-markdown"],
  ["jwt decoder", "/jwt-decoder"], ["regex tester", "/regex-tester"], ["curl builder", "/curl-builder"],
  ["diff checker", "/diff-checker"], ["meta tag generator", "/meta-tag-generator"],
  ["og preview", "/og-preview"], ["open graph preview", "/og-preview"],
  ["sitemap generator", "/sitemap-generator"], ["robots.txt", "/robots-generator"],
  ["schema markup", "/schema-generator"], ["color palette", "/color-palette"],
  ["gradient generator", "/gradient-generator"], ["qr code", "/qr-code"],
  ["lorem ipsum", "/lorem-ipsum"], ["pdf", "/pdf-toolkit"],
];

function autoInternalLink(markdown, existingPaths, maxNew = 4) {
  const skipped = new Set(existingPaths);
  // Mask code blocks, inline code, markdown links/images so we don't touch them.
  const masks = [];
  const stash = (m) => { masks.push(m); return `§MASK${masks.length - 1}§`; };
  let text = markdown
    .replace(/```[\s\S]*?```/g, stash)
    .replace(/`[^`\n]+`/g, stash)
    .replace(/!\[[^\]]*\]\([^)]+\)/g, stash)
    .replace(/\[[^\]]+\]\([^)]+\)/g, stash);

  let added = 0;
  for (const [phrase, href] of TOOL_LINKS) {
    if (added >= maxNew) break;
    if (skipped.has(href)) continue;
    // word-boundary, case-insensitive, first plain-text occurrence
    const re = new RegExp(`(?<![\\w\\[/])(${phrase.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")})(?![\\w/])`, "i");
    const m = text.match(re);
    if (!m) continue;
    text = text.replace(re, `[${m[1]}](${href})`);
    skipped.add(href);
    added++;
  }
  // restore masks
  text = text.replace(/§MASK(\d+)§/g, (_, i) => masks[Number(i)]);
  return { text, added };
}

const existingLinkPaths = [...post.body.matchAll(/\]\((\/[a-z0-9-]+)\)/gi)].map((m) => m[1]);
const linked = autoInternalLink(post.body, existingLinkPaths);
let finalBody = linked.text;
if (linked.added > 0) console.log(`✓ Auto-added ${linked.added} internal tool links`);

// Guarantee a webogrowth.com link exists in the body
if (!/webogrowth\.com/i.test(finalBody)) {
  finalBody += `\n\n---\n\n*Published by the team at [WeboGrowth](https://webogrowth.com) — SEO &amp; growth services for ambitious brands.*\n`;
}

const coverField = coverPath ? `    cover: ${JSON.stringify(coverPath)},\n` : "";

const faqsField = post.faqs && post.faqs.length > 0
  ? `    faqs: [\n${post.faqs
      .map((f) => `      { question: ${JSON.stringify(f.question)}, answer: ${JSON.stringify(f.answer)} },`)
      .join("\n")}\n    ],\n`
  : "";

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
${faqsField}  }),
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
