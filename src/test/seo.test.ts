import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { TOOL_SEO, getSeoProps, buildJsonLdFor, SITE } from "@/lib/seo";
import { BLOG_POSTS } from "@/blog/posts";

// All public routes registered in src/App.tsx (admin + 404 excluded).
const PUBLIC_ROUTES = [
  "/", "/compressor", "/converter", "/svg-optimizer", "/favicon",
  "/json-formatter", "/meta-tag-generator", "/color-palette", "/qr-code",
  "/image-resizer", "/css-minifier", "/base64", "/gradient-generator",
  "/lorem-ipsum", "/robots-generator", "/og-preview", "/placeholder",
  "/html-to-markdown", "/privacy-policy", "/terms-of-service",
  "/about-us", "/contact-us",
  // Newer tools — keep in sync with src/App.tsx <Route path=...> entries.
  "/alt-text-generator", "/background-remover", "/curl-builder",
  "/diff-checker", "/heic-to-jpg", "/image-to-svg", "/jwt-decoder",
  "/pagespeed-analyzer", "/pdf-toolkit", "/regex-tester",
  "/schema-generator", "/sitemap-generator", "/video-to-gif", "/watermark",
];

// Blog routes are owned by Blog.tsx/BlogPost.tsx — they generate SEO at
// render time from BLOG_POSTS, so they're excluded from TOOL_SEO coverage
// but must still appear in the sitemap.
const BLOG_ROUTES = ["/blog", ...BLOG_POSTS.map((p) => `/blog/${p.slug}`)];
const ALL_INDEXABLE_ROUTES = [...PUBLIC_ROUTES, ...BLOG_ROUTES];

const STATIC_ROUTES = ["/about-us", "/contact-us", "/privacy-policy", "/terms-of-service"];
const TOOL_ROUTES = PUBLIC_ROUTES.filter((p) => !STATIC_ROUTES.includes(p));

describe("SEO registry coverage", () => {
  it("has an entry for every public route in App.tsx", () => {
    for (const path of PUBLIC_ROUTES) {
      expect(TOOL_SEO[path], `missing SEO entry for ${path}`).toBeDefined();
    }
  });
});

describe.each(PUBLIC_ROUTES)("SEO fields for %s", (path) => {
  const props = getSeoProps(path)!;

  it("title is non-empty and ≤ 60 chars", () => {
    expect(props.title, "title missing").toBeTruthy();
    expect(props.title.length, `title too long (${props.title.length})`).toBeLessThanOrEqual(60);
  });

  it("description is non-empty and ≤ 160 chars", () => {
    expect(props.description, "description missing").toBeTruthy();
    expect(props.description.length, `description too long (${props.description.length})`).toBeLessThanOrEqual(160);
  });

  it("canonical path self-references the route", () => {
    expect(props.canonicalPath).toBe(path);
  });

  it("keywords are present", () => {
    expect(props.keywords?.trim().length).toBeGreaterThan(0);
  });

  it("breadcrumb JSON-LD uses internal links only", () => {
    const blocks = buildJsonLdFor(path) as any[];
    const breadcrumb = blocks.find((b) => b["@type"] === "BreadcrumbList");
    expect(breadcrumb, "BreadcrumbList missing").toBeDefined();
    expect(breadcrumb.itemListElement.length).toBeGreaterThan(0);
    for (const it of breadcrumb.itemListElement) {
      expect(it.item.startsWith(SITE.url), `non-internal breadcrumb link: ${it.item}`).toBe(true);
    }
  });

  it("references the external WeboGrowth parent domain", () => {
    const blocks = buildJsonLdFor(path) as any[];
    const sa = blocks.find((b) => b["@type"] === "SoftwareApplication");
    const wp = blocks.find((b) => b["@type"] === "WebPage");
    const root = sa ?? wp;
    if (sa) {
      expect(JSON.stringify(root)).toContain(SITE.parent);
    }
  });
});

// ---- Strict schema.org validation ---------------------------------------

function validateFAQPage(faq: any, path: string) {
  expect(faq["@context"], `${path}: FAQPage missing @context`).toBe("https://schema.org");
  expect(faq["@type"]).toBe("FAQPage");
  expect(Array.isArray(faq.mainEntity), `${path}: FAQPage.mainEntity must be array`).toBe(true);
  expect(faq.mainEntity.length).toBeGreaterThan(0);
  for (const q of faq.mainEntity) {
    expect(q["@type"]).toBe("Question");
    expect(typeof q.name).toBe("string");
    expect(q.name.length).toBeGreaterThan(0);
    expect(q.acceptedAnswer, `${path}: Question missing acceptedAnswer`).toBeDefined();
    expect(q.acceptedAnswer["@type"]).toBe("Answer");
    expect(typeof q.acceptedAnswer.text).toBe("string");
    expect(q.acceptedAnswer.text.length).toBeGreaterThan(0);
  }
}

function validateHowTo(howto: any, path: string) {
  expect(howto["@context"], `${path}: HowTo missing @context`).toBe("https://schema.org");
  expect(howto["@type"]).toBe("HowTo");
  expect(typeof howto.name).toBe("string");
  expect(howto.name.length).toBeGreaterThan(0);
  expect(typeof howto.description).toBe("string");
  expect(Array.isArray(howto.step)).toBe(true);
  expect(howto.step.length).toBeGreaterThan(0);
  howto.step.forEach((s: any, i: number) => {
    expect(s["@type"]).toBe("HowToStep");
    expect(s.position).toBe(i + 1);
    expect(typeof s.name).toBe("string");
    expect(s.name.length).toBeGreaterThan(0);
    expect(typeof s.text).toBe("string");
    expect(s.text.length).toBeGreaterThan(0);
  });
}

describe.each(TOOL_ROUTES)("Schema.org JSON-LD for %s", (path) => {
  const blocks = buildJsonLdFor(path) as any[];

  it("FAQPage is valid schema.org and has Questions with Answers", () => {
    const faq = blocks.find((b) => b["@type"] === "FAQPage");
    expect(faq, `FAQPage missing for ${path}`).toBeDefined();
    validateFAQPage(faq, path);
  });

  it("HowTo is valid schema.org with positioned HowToStep entries", () => {
    const howto = blocks.find((b) => b["@type"] === "HowTo");
    expect(howto, `HowTo missing for ${path}`).toBeDefined();
    validateHowTo(howto, path);
  });
});

// ---- Sitemap coverage ---------------------------------------------------

function loadSitemapUrls(): string[] {
  const xml = readFileSync(resolve(__dirname, "../../public/sitemap.xml"), "utf-8");
  return Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g)).map((m) => m[1]);
}

describe("sitemap.xml coverage", () => {
  const urls = loadSitemapUrls();

  it("contains at least one URL", () => {
    expect(urls.length).toBeGreaterThan(0);
  });

  it.each(urls)("sitemap URL %s maps to a registered indexable route", (url) => {
    expect(url.startsWith(SITE.url), `sitemap URL not on canonical host: ${url}`).toBe(true);
    const path = url.replace(SITE.url, "") || "/";
    const normalized = path === "" ? "/" : path.replace(/\/$/, "") || "/";
    const isBlog = normalized === "/blog" || normalized.startsWith("/blog/");
    if (!isBlog) {
      expect(TOOL_SEO[normalized], `sitemap URL ${url} has no SEO entry`).toBeDefined();
    }
    expect(ALL_INDEXABLE_ROUTES, `sitemap URL ${url} not registered`).toContain(normalized);
  });

  it("every indexable route appears in sitemap.xml", () => {
    const paths = urls.map((u) => u.replace(SITE.url, "") || "/").map((p) => p.replace(/\/$/, "") || "/");
    for (const route of ALL_INDEXABLE_ROUTES) {
      expect(paths, `route ${route} missing from sitemap.xml`).toContain(route);
    }
  });
});
