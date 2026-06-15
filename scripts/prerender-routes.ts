/**
 * Post-build prerender: writes a static index.html per route into `dist/<route>/index.html`
 * with route-specific <title>, description, canonical, og:url, og:title, og:description,
 * twitter:title, twitter:description and JSON-LD blocks patched into the head.
 *
 * Solves the "Helmet client-side mutation" problem: social/preview crawlers that don't
 * execute JS (LinkedIn, Slack, Facebook, X, Discord, etc.) now see the correct
 * og:url + og:title + og:description for every route in the static HTML.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { TOOL_SEO, SITE, buildJsonLdFor, getSeoProps } from "../src/lib/seo";
import { BLOG_POSTS } from "../src/blog/posts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(__dirname, "../dist");
const TEMPLATE_PATH = resolve(DIST, "index.html");

if (!existsSync(TEMPLATE_PATH)) {
  console.error(`[prerender] dist/index.html not found at ${TEMPLATE_PATH}. Run 'vite build' first.`);
  process.exit(1);
}

const TEMPLATE = readFileSync(TEMPLATE_PATH, "utf-8");

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

interface RouteMeta {
  path: string;            // e.g. "/compressor" or "/blog/<slug>"
  title: string;
  description: string;
  canonicalUrl: string;
  ogUrl: string;
  jsonLd: object[];
}

function patchHead(html: string, meta: RouteMeta): string {
  const title = escapeHtml(meta.title);
  const desc = escapeHtml(meta.description);
  const url = escapeHtml(meta.canonicalUrl);

  let out = html;

  // <title>
  out = out.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);

  // description (name=)
  out = out.replace(
    /<meta\s+name="description"[^>]*>/i,
    `<meta name="description" content="${desc}">`,
  );

  // og:title / og:description / og:url
  out = replaceOrAppendMeta(out, "property", "og:title", title);
  out = replaceOrAppendMeta(out, "property", "og:description", desc);
  out = replaceOrAppendMeta(out, "property", "og:url", url);

  // twitter:title / twitter:description
  out = replaceOrAppendMeta(out, "name", "twitter:title", title);
  out = replaceOrAppendMeta(out, "name", "twitter:description", desc);

  // canonical
  if (/<link[^>]+rel="canonical"[^>]*>/i.test(out)) {
    out = out.replace(/<link[^>]+rel="canonical"[^>]*>/i, `<link rel="canonical" href="${url}">`);
  } else {
    out = out.replace(/<\/head>/i, `  <link rel="canonical" href="${url}">\n</head>`);
  }

  // Per-route JSON-LD (appended just before </head>; sitewide ones from index.html stay)
  if (meta.jsonLd.length) {
    const blocks = meta.jsonLd
      .map((b) => `<script type="application/ld+json">${JSON.stringify(b)}</script>`)
      .join("\n    ");
    out = out.replace(/<\/head>/i, `    ${blocks}\n</head>`);
  }

  return out;
}

function replaceOrAppendMeta(html: string, attr: "name" | "property", key: string, content: string) {
  const re = new RegExp(`<meta\\s+${attr}="${key.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")}"[^>]*>`, "i");
  const tag = `<meta ${attr}="${key}" content="${content}">`;
  if (re.test(html)) return html.replace(re, tag);
  return html.replace(/<\/head>/i, `  ${tag}\n</head>`);
}

function writeRoute(meta: RouteMeta) {
  if (meta.path === "/") {
    // Overwrite root index.html so the homepage also self-references og:url correctly.
    writeFileSync(TEMPLATE_PATH, patchHead(TEMPLATE, meta), "utf-8");
    return;
  }
  const out = resolve(DIST, meta.path.replace(/^\//, ""), "index.html");
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, patchHead(TEMPLATE, meta), "utf-8");
}

const routes: RouteMeta[] = [];

// Tool + static routes from registry
for (const path of Object.keys(TOOL_SEO)) {
  const seo = getSeoProps(path)!;
  routes.push({
    path,
    title: seo.title,
    description: seo.description,
    canonicalUrl: `${SITE.url}${path === "/" ? "/" : path}`,
    ogUrl: `${SITE.url}${path === "/" ? "/" : path}`,
    jsonLd: buildJsonLdFor(path) as object[],
  });
}

// Blog index
routes.push({
  path: "/blog",
  title: "WeboGrowth Blog — Web Tools, SEO & Performance Guides",
  description:
    "Tutorials and deep dives on image optimization, SEO, performance and developer workflow — written by the WeboGrowth Tools team.",
  canonicalUrl: `${SITE.url}/blog`,
  ogUrl: `${SITE.url}/blog`,
  jsonLd: [
    {
      "@context": "https://schema.org",
      "@type": "Blog",
      name: "WeboGrowth Blog",
      url: `${SITE.url}/blog`,
      publisher: { "@type": "Organization", name: SITE.parentBrand, url: SITE.parent },
    },
  ],
});

// Blog posts
for (const p of BLOG_POSTS) {
  const url = `${SITE.url}/blog/${p.slug}`;
  routes.push({
    path: `/blog/${p.slug}`,
    title: p.title,
    description: p.description,
    canonicalUrl: url,
    ogUrl: url,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: p.title,
        description: p.description,
        datePublished: p.date,
        dateModified: p.updated ?? p.date,
        author: { "@type": "Organization", name: p.author },
        publisher: { "@type": "Organization", name: SITE.parentBrand, url: SITE.parent },
        mainEntityOfPage: url,
        url,
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE.url}/` },
          { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE.url}/blog` },
          { "@type": "ListItem", position: 3, name: p.title, item: url },
        ],
      },
    ],
  });
}

for (const r of routes) writeRoute(r);

console.log(`[prerender] wrote ${routes.length} static HTML files into dist/`);
