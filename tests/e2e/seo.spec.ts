import { test, expect, type Page } from "@playwright/test";
import { TOOL_SEO, getSeoProps, buildJsonLdFor } from "../../src/lib/seo";

const ROUTES = Object.keys(TOOL_SEO);

async function getMeta(page: Page, selector: string) {
  return page.locator(selector).first().getAttribute("content");
}

for (const path of ROUTES) {
  test.describe(`Rendered SEO for ${path}`, () => {
    const expected = getSeoProps(path)!;

    test("title, description, canonical match the SEO registry", async ({ page }) => {
      await page.goto(path);
      // Wait for react-helmet-async to mutate <head>.
      await expect(page).toHaveTitle(expected.title, { timeout: 10_000 });

      const description = await getMeta(page, 'meta[name="description"]');
      expect(description).toBe(expected.description);

      const canonical = await page.locator('link[rel="canonical"]').first().getAttribute("href");
      expect(canonical).toContain(expected.canonicalPath);

      const ogTitle = await getMeta(page, 'meta[property="og:title"]');
      expect(ogTitle).toBe(expected.title);

      const ogDesc = await getMeta(page, 'meta[property="og:description"]');
      expect(ogDesc).toBe(expected.description);
    });

    test("rendered JSON-LD matches the expected schema blocks", async ({ page }) => {
      await page.goto(path);
      // Allow Helmet a tick to inject scripts.
      await page.waitForFunction(
        () => document.querySelectorAll('script[type="application/ld+json"]').length > 0,
        { timeout: 10_000 },
      );

      const rendered = await page.$$eval(
        'script[type="application/ld+json"]',
        (nodes) => nodes.map((n) => JSON.parse(n.textContent || "{}")),
      );

      const types = rendered.map((b) => b["@type"]);
      const expectedBlocks = buildJsonLdFor(path) as any[];
      for (const block of expectedBlocks) {
        expect(types, `${path}: missing @type ${block["@type"]}`).toContain(block["@type"]);
      }

      const faq = rendered.find((b) => b["@type"] === "FAQPage");
      if (faq) {
        expect(faq["@context"]).toBe("https://schema.org");
        expect(Array.isArray(faq.mainEntity)).toBe(true);
        for (const q of faq.mainEntity) {
          expect(q["@type"]).toBe("Question");
          expect(q.acceptedAnswer?.["@type"]).toBe("Answer");
          expect(typeof q.acceptedAnswer?.text).toBe("string");
        }
      }

      const howto = rendered.find((b) => b["@type"] === "HowTo");
      if (howto) {
        expect(howto["@context"]).toBe("https://schema.org");
        expect(Array.isArray(howto.step)).toBe(true);
        howto.step.forEach((s: any, i: number) => {
          expect(s["@type"]).toBe("HowToStep");
          expect(s.position).toBe(i + 1);
        });
      }
    });
  });
}
