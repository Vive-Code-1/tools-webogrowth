import { describe, it, expect } from "vitest";
import { TOOL_SEO, getSeoProps, buildJsonLdFor, SITE } from "@/lib/seo";

// All public routes registered in src/App.tsx (admin + 404 excluded).
const PUBLIC_ROUTES = [
  "/", "/compressor", "/converter", "/svg-optimizer", "/favicon",
  "/json-formatter", "/meta-tag-generator", "/color-palette", "/qr-code",
  "/image-resizer", "/css-minifier", "/base64", "/gradient-generator",
  "/lorem-ipsum", "/robots-generator", "/og-preview", "/placeholder",
  "/html-to-markdown", "/privacy-policy", "/terms-of-service",
  "/about-us", "/contact-us",
];

// Routes that should expose tool-style structured data (FAQPage + HowTo).
const TOOL_ROUTES = PUBLIC_ROUTES.filter(
  (p) => !["/about-us", "/contact-us", "/privacy-policy", "/terms-of-service"].includes(p)
);

describe("SEO registry coverage", () => {
  it("has an entry for every public route in App.tsx", () => {
    for (const path of PUBLIC_ROUTES) {
      expect(TOOL_SEO[path], `missing SEO entry for ${path}`).toBeDefined();
    }
  });
});

describe.each(PUBLIC_ROUTES)("SEO for %s", (path) => {
  const props = getSeoProps(path)!;

  it("has a non-empty title ≤ 60 chars", () => {
    expect(props.title).toBeTruthy();
    expect(props.title.length).toBeLessThanOrEqual(60);
  });

  it("has a meta description ≤ 160 chars", () => {
    expect(props.description).toBeTruthy();
    expect(props.description.length).toBeLessThanOrEqual(160);
  });

  it("has a self-referencing canonical path", () => {
    expect(props.canonicalPath).toBe(path);
  });

  it("has keywords", () => {
    expect(props.keywords.trim().length).toBeGreaterThan(0);
  });

  it("includes a BreadcrumbList JSON-LD with internal links to the site", () => {
    const blocks = buildJsonLdFor(path) as any[];
    const breadcrumb = blocks.find((b) => b["@type"] === "BreadcrumbList");
    expect(breadcrumb, "BreadcrumbList missing").toBeDefined();
    const items = breadcrumb.mainEntity ?? breadcrumb.itemListElement;
    expect(items.length).toBeGreaterThan(0);
    for (const it of breadcrumb.itemListElement) {
      expect(it.item.startsWith(SITE.url)).toBe(true);
    }
  });

  it("references the external WeboGrowth parent site (external link)", () => {
    const blocks = buildJsonLdFor(path) as any[];
    const serialized = JSON.stringify(blocks);
    // SoftwareApplication/WebPage carries author/publisher with parent URL.
    if (blocks.some((b) => b["@type"] === "SoftwareApplication")) {
      expect(serialized).toContain(SITE.parent);
    }
  });
});

describe.each(TOOL_ROUTES)("Structured data for tool route %s", (path) => {
  const blocks = buildJsonLdFor(path) as any[];

  it("includes FAQPage JSON-LD with at least one Question", () => {
    const faq = blocks.find((b) => b["@type"] === "FAQPage");
    expect(faq, `FAQPage missing for ${path}`).toBeDefined();
    expect(Array.isArray(faq.mainEntity)).toBe(true);
    expect(faq.mainEntity.length).toBeGreaterThan(0);
    for (const q of faq.mainEntity) {
      expect(q["@type"]).toBe("Question");
      expect(q.name).toBeTruthy();
      expect(q.acceptedAnswer?.text).toBeTruthy();
    }
  });

  it("includes HowTo JSON-LD with ordered steps", () => {
    const howto = blocks.find((b) => b["@type"] === "HowTo");
    expect(howto, `HowTo missing for ${path}`).toBeDefined();
    expect(howto.step.length).toBeGreaterThan(0);
    howto.step.forEach((s: any, i: number) => {
      expect(s["@type"]).toBe("HowToStep");
      expect(s.position).toBe(i + 1);
      expect(s.name).toBeTruthy();
      expect(s.text).toBeTruthy();
    });
  });
});
