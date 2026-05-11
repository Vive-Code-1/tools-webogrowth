# Site-Wide SEO & Schema Markup Upgrade

Goal: every page scores 95+ on SEO audits, qualifies for Google Rich Results, and links internally + externally (to webogrowth.com) with tool-specific keyword optimization.

## What gets added to every tool page

1. **Optimized SEO metadata** (unique per page, tool-keyword focused)
   - Title: ≤60 chars, primary keyword first, brand suffix
   - Description: ≤160 chars, action verb + benefit + keyword
   - Keywords: 6–8 long-tail variants per tool
   - Canonical URL, OG tags, Twitter card (already in `SEOHead`)

2. **Rich JSON-LD schema** (multiple types per page)
   - `SoftwareApplication` (tool itself, with `aggregateRating`, `offers`, `featureList`)
   - `BreadcrumbList` (Home → Category → Tool)
   - `FAQPage` (3–5 tool-specific Q&As)
   - `HowTo` (step-by-step usage, 3–5 steps)
   - `WebSite` + `Organization` (site-wide, in index.html)

3. **On-page SEO content blocks** (visible HTML, helps ranking)
   - Single `<h1>` (already present), proper `<h2>`/`<h3>` hierarchy
   - "How to use" section (matches HowTo schema)
   - "FAQ" section (matches FAQPage schema)
   - "Why use [tool name]" benefits block with tool keywords
   - Internal links to 3–4 related tools (RelatedTools already exists — keep)
   - External link to `https://webogrowth.com` with descriptive anchor (e.g. "Built by WeboGrowth — web growth agency")
   - `alt` text + `aria-label` audit on icons/buttons

4. **Tool-specific keyword targeting**
   Each page gets a curated keyword set, e.g.:
   - Compressor → "image compressor online", "compress jpeg without losing quality", "reduce png size", "webp converter free"
   - JSON Formatter → "json formatter online", "json validator", "json beautifier", "minify json"
   - QR Code → "qr code generator free", "custom qr code with logo", "wifi qr code", "vcard qr code"
   - …same approach for all 20+ pages

## Architecture changes

### A. New shared helper: `src/lib/seo.ts`
Central registry so we don't repeat schema boilerplate per page.

```ts
export const SITE = {
  url: "https://tools.webogrowth.com",
  brand: "WeboGrowth Tools",
  parent: "https://webogrowth.com",
};

export interface ToolSeo {
  path: string;
  title: string;          // ≤60 chars
  description: string;    // ≤160 chars
  keywords: string;
  category: "Image" | "Developer" | "SEO" | "Design" | "Content";
  h1: string;
  features: string[];     // -> SoftwareApplication.featureList
  faqs: { q: string; a: string }[];
  steps: { name: string; text: string }[];
  rating?: { value: number; count: number };
}

export const TOOL_SEO: Record<string, ToolSeo> = { /* every route */ };

export function buildToolJsonLd(tool: ToolSeo): object[];   // returns SoftwareApplication + Breadcrumb + FAQPage + HowTo
export function buildHomeJsonLd(): object[];                // WebSite + Organization + ItemList of tools
```

### B. Upgrade `SEOHead` to accept array of JSON-LD blocks
```ts
jsonLd?: object | object[];
```
Render one `<script type="application/ld+json">` per object so Google parses each independently.

### C. New shared component: `src/components/ToolSeoSection.tsx`
Renders the visible "How to use", "FAQ", "Benefits" + external/internal links block. Pulls content from `TOOL_SEO[path]`. Drop into every tool page above `<RelatedTools/>`.

### D. Site-wide upgrades (one-time)
- `index.html`: add `Organization` + `WebSite` (with `SearchAction`) JSON-LD in `<head>`
- `src/components/Layout.tsx`: inject `BreadcrumbList` schema dynamically based on current route
- `Footer.tsx`: ensure prominent external link to `webogrowth.com` (rel="noopener", descriptive anchor — not "click here")
- `Navbar.tsx`: confirm semantic `<nav>` + `aria-label`

### E. Per-page edits (all 20+ tool pages + About/Contact/Privacy/Terms/Home/404)
For each `src/pages/*.tsx`:
1. Replace inline `SEOHead` props with `TOOL_SEO[path]` derived values
2. Pass full JSON-LD array (SoftwareApplication + Breadcrumb + FAQ + HowTo)
3. Append `<ToolSeoSection path="…" />` before `<RelatedTools/>`
4. Ensure single H1, proper heading hierarchy, descriptive button labels
5. Add 1 contextual link to `webogrowth.com` inside the benefits paragraph

Static pages (About, Contact, Privacy, Terms) get `WebPage` schema + breadcrumbs only (no FAQ/HowTo).

## Pages covered (24 total)

| Group | Pages |
|---|---|
| Image | Compressor, Converter, SvgOptimizer, Favicon, ImageResizer, PlaceholderImage |
| Developer | JsonFormatter, CssMinifier, Base64Tool, HtmlToMarkdown |
| SEO | MetaTagGenerator, OgPreview, RobotsTxtGenerator |
| Design | ColorPalette, GradientGenerator, QrCodeGenerator |
| Content | LoremIpsum |
| Home/Static | Index, AboutUs, ContactUs, PrivacyPolicy, TermsOfService, NotFound |

## Out of scope
- Server-side rendering / pre-rendering (current Vite SPA — Google does render JS, schema still works; SSG would be a separate larger refactor)
- Backlink building / off-site SEO
- Submitting to Search Console (user already has GSC verification configured)

## Validation after build
- Manually verify schema for 2 pages with Google's Rich Results Test (recommend to user)
- Run Lighthouse SEO audit (target 95+)

## Deliverables
- 1 new file: `src/lib/seo.ts` (single source of truth, ~400 lines of content)
- 1 new file: `src/components/ToolSeoSection.tsx`
- Updated: `SEOHead`, `Layout`, `Footer`, `index.html`
- Updated: all 24 page files (mostly small — swap props, add 1 component)
