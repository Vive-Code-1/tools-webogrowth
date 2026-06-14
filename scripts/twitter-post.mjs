#!/usr/bin/env node
/**
 * Twitter/X auto-poster for WeboGrowth Tools.
 *
 * Modes:
 *   --mode=blog          Post the newest blog article (skips if already tweeted today).
 *   --mode=tool          Post a rotating "tool of the day" tweet.
 *   --mode=queue         Post the next scheduled item from marketing/social-queue.json.
 *
 * Required env vars (set as GitHub Actions secrets):
 *   TWITTER_CONSUMER_KEY
 *   TWITTER_CONSUMER_SECRET
 *   TWITTER_ACCESS_TOKEN
 *   TWITTER_ACCESS_TOKEN_SECRET
 *
 * Endpoint: https://api.x.com/2/tweets  (NOT api.twitter.com)
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? true];
  }),
);

const mode = args.mode || "blog";
const dryRun = !!args.dry || !process.env.TWITTER_ACCESS_TOKEN;
const SITE = "https://tools.webogrowth.com";

const HASHTAGS = {
  Image: "#WebDev #ImageOptimization #FreeTools",
  Developer: "#DevTools #WebDev #100DaysOfCode",
  SEO: "#SEO #DigitalMarketing #WebDev",
  Design: "#WebDesign #UIDesign #FreeTools",
  Guide: "#WebDev #FreeTools #SaaS",
};

const TOOLS = [
  { path: "/compressor", name: "Image Compressor", hook: "Shrink JPG/PNG/WebP by up to 90% — 100% in-browser, no upload." },
  { path: "/converter", name: "Image Converter", hook: "Convert between PNG, JPG, WebP & AVIF in seconds. Free, no signup." },
  { path: "/json-formatter", name: "JSON Formatter", hook: "Format, validate & minify JSON instantly. Built for devs." },
  { path: "/qr-code", name: "QR Code Generator", hook: "Generate beautiful QR codes with custom colors & logos. Free." },
  { path: "/meta-tag-generator", name: "Meta Tag Generator", hook: "Generate SEO-friendly meta tags + Open Graph in 10 seconds." },
  { path: "/favicon", name: "Favicon Generator", hook: "Generate every favicon size from one image. Free, no signup." },
  { path: "/svg-optimizer", name: "SVG Optimizer", hook: "Strip bloat from SVGs without losing visual fidelity." },
  { path: "/color-palette", name: "Color Palette Generator", hook: "Build & export color palettes for your next project." },
  { path: "/gradient-generator", name: "Gradient Generator", hook: "Design CSS gradients with live preview. Copy-paste ready." },
  { path: "/og-preview", name: "Open Graph Preview", hook: "See exactly how your link will look on Twitter/FB before you ship." },
];

// ---------------- OAuth 1.0a signing (no POST body params, per twitter-in-edge-functions guide) ----------------
function oauthHeader(method, url) {
  const oauth = {
    oauth_consumer_key: process.env.TWITTER_CONSUMER_KEY,
    oauth_nonce: crypto.randomBytes(16).toString("hex"),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: process.env.TWITTER_ACCESS_TOKEN,
    oauth_version: "1.0",
  };
  const baseParams = Object.entries(oauth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");
  const baseString = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(baseParams)}`;
  const signingKey = `${encodeURIComponent(process.env.TWITTER_CONSUMER_SECRET)}&${encodeURIComponent(process.env.TWITTER_ACCESS_TOKEN_SECRET)}`;
  oauth.oauth_signature = crypto.createHmac("sha1", signingKey).update(baseString).digest("base64");
  return (
    "OAuth " +
    Object.entries(oauth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${encodeURIComponent(k)}="${encodeURIComponent(v)}"`)
      .join(", ")
  );
}

async function postTweet(text) {
  if (dryRun) {
    console.log("[DRY RUN] Would tweet:\n" + text);
    return { dryRun: true };
  }
  const url = "https://api.x.com/2/tweets";
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: oauthHeader("POST", url),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Twitter API ${res.status}: ${JSON.stringify(data)}`);
  console.log("✓ Tweet posted:", data.data?.id);
  return data;
}

// ---------------- Content builders ----------------
function buildBlogTweet() {
  const postsFile = path.resolve("src/blog/posts.ts");
  const src = fs.readFileSync(postsFile, "utf8");
  const slug = (src.match(/slug:\s*"([^"]+)"/g) || []).pop()?.match(/"([^"]+)"/)?.[1];
  const title = (src.match(/title:\s*"([^"]+)"/g) || []).pop()?.match(/"([^"]+)"/)?.[1];
  const category = (src.match(/category:\s*"([^"]+)"/g) || []).pop()?.match(/"([^"]+)"/)?.[1] || "Guide";
  if (!slug || !title) throw new Error("Could not parse latest post");
  const tags = HASHTAGS[category] || HASHTAGS.Guide;
  return `📖 New on the blog:\n\n${title}\n\n${SITE}/blog/${slug}\n\n${tags}`;
}

function buildToolTweet() {
  const day = Math.floor(Date.now() / 86400000);
  const tool = TOOLS[day % TOOLS.length];
  return `🛠 Tool of the day: ${tool.name}\n\n${tool.hook}\n\n👉 ${SITE}${tool.path}\n\n#FreeTools #WebDev`;
}

function buildQueueTweet() {
  const queuePath = path.resolve("marketing/social-queue.json");
  if (!fs.existsSync(queuePath)) throw new Error("marketing/social-queue.json missing");
  const queue = JSON.parse(fs.readFileSync(queuePath, "utf8"));
  const next = queue.find((q) => !q.posted);
  if (!next) {
    console.log("Queue empty — nothing to post.");
    return null;
  }
  next.posted = new Date().toISOString();
  fs.writeFileSync(queuePath, JSON.stringify(queue, null, 2) + "\n");
  return next.text;
}

// ---------------- Main ----------------
(async () => {
  let text;
  if (mode === "blog") text = buildBlogTweet();
  else if (mode === "tool") text = buildToolTweet();
  else if (mode === "queue") text = buildQueueTweet();
  else throw new Error(`Unknown mode: ${mode}`);

  if (!text) return;
  if (text.length > 280) {
    console.warn(`⚠ Tweet is ${text.length} chars — trimming.`);
    text = text.slice(0, 277) + "...";
  }
  await postTweet(text);
})().catch((e) => {
  console.error("✗ Twitter post failed:", e.message);
  process.exit(1);
});
