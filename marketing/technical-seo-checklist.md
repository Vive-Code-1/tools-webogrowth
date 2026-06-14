# Technical SEO Checklist — WeboGrowth Tools

**Last reviewed:** 2026-06-14  ·  **Owner:** WeboGrowth team

This file tracks every technical-SEO control on the site, where it lives, and how to verify it.

---

## 1. Schema.org / Structured Data ✅

| Schema type | Where | Pages |
|---|---|---|
| `Organization` | `index.html` `<script type="application/ld+json">` | sitewide |
| `WebSite` + `SearchAction` | `index.html` | sitewide |
| `WebApplication` (sitewide) | `index.html` | sitewide |
| `SoftwareApplication` per tool | `src/lib/seo.ts → softwareApplicationSchema()` | 17 tool pages |
| `FAQPage` per tool | `src/lib/seo.ts → faqPageSchema()` | every tool |
| `HowTo` per tool | `src/lib/seo.ts → howToSchema()` | every tool |
| `BreadcrumbList` | `src/lib/seo.ts → buildBreadcrumb()` | every tool |
| `BlogPosting` + `BreadcrumbList` | `src/pages/BlogPost.tsx` | each blog post |
| `Blog` | `src/pages/Blog.tsx` | /blog index |

**Verify:** https://search.google.com/test/rich-results?url=https://tools.webogrowth.com/compressor

---

## 2. Head Metadata ✅

- Sitewide tags → `index.html`
- Per-route via `react-helmet-async` → `src/components/SEOHead.tsx` + `src/lib/seo.ts`
- Canonical + og:url **self-reference** every route
- Open Graph image set sitewide; per-route titles/descriptions override

**Verify:** https://www.opengraph.xyz/url/https%3A%2F%2Ftools.webogrowth.com

---

## 3. Crawlability ✅

- `public/robots.txt` — allows all crawlers, lists sitemap
- `public/sitemap.xml` — 28 URLs (17 tools + 4 site + 1 blog index + 5 blog posts + 1 home)
- IndexNow key file: `public/02a13238b42e97d3a8ff90893f5215d6.txt`
- Submit on publish: `bun run seo:indexnow`

---

## 4. Internal Linking ✅

Run: `bun run seo:links`  (CI gate: `bun run seo:links:strict`)

| Metric | Current |
|---|---|
| Total routes | 23 |
| Total internal links | 156 |
| Orphan pages | 0 |
| Under-linked (<2) | 0 |
| Stale links | 0 |
| Top-linked | `/` (12), `/blog` (12), `/compressor` (11) |

Report artifacts: `reports/internal-links.json` + `reports/internal-links.html`

**Rule of thumb:** every new route must have ≥ 2 inbound links before merge — typically Footer + RelatedTools + Nav.

---

## 5. Page Speed ✅

Run: `bun run seo:pagespeed:run`  (runs Lighthouse + analyses) — gates merges in `.github/workflows/seo.yml`.

**Thresholds (desktop + mobile):**

| Metric | Threshold |
|---|---|
| Performance | ≥ 0.85 |
| Accessibility | ≥ 0.95 |
| Best Practices | ≥ 0.90 |
| SEO | ≥ 0.95 |

**Active optimizations:**

- All routes lazy-loaded via `React.lazy()` (`src/App.tsx`) — only the home bundle is eager
- Fonts loaded async via `media="print" onload` swap + `<noscript>` fallback
- LCP hero image preloaded with `fetchpriority="high"` in `index.html`
- `preconnect` to `fonts.googleapis.com` + `fonts.gstatic.com`
- `dns-prefetch` to Supabase
- Image assets compressed (WebP-first); image tools run 100% client-side
- Vite production build → tree-shaking, code-splitting, brotli-ready output

**Per-page LCP / CLS / TBT** logged in `reports/page-speed.json`.

---

## 6. Mobile-First ✅

- Viewport meta + `viewport-fit=cover` for iOS notch
- Mobile Lighthouse runs in CI (`lighthouserc.mobile.cjs`)
- All tool UIs responsive (Tailwind `md:` / `lg:` breakpoints)
- Touch targets ≥ 44×44 px on every button

---

## 7. Security & Trust Signals ✅

- HTTPS enforced (Vercel)
- HSTS header (Vercel default)
- `referrer-policy: strict-origin-when-cross-origin` in `index.html`
- No third-party trackers without admin opt-in (`AdminHeadInjector` controls GA/GSC/Bing/Ads)
- Privacy + Terms pages indexed

---

## 8. Continuous Monitoring

| Cadence | Action | Where |
|---|---|---|
| Per PR | SEO lint + e2e + Lighthouse (desktop + mobile) | `.github/workflows/seo.yml` |
| Per PR | Snapshot diff vs last successful run | `scripts/seo-snapshot.mjs` |
| Per PR | Internal link audit (strict) | `bun run seo:links:strict` |
| Per release | IndexNow submission | `bun run seo:indexnow` |
| Weekly | Manual GSC + Bing Webmaster review | Google Search Console |
| Monthly | Re-run rich-results test on top 5 pages | Google rich results tester |

---

## 9. Known TODOs / Future Improvements

- [ ] Add `Article` schema to blog posts via `og:image` per post (currently uses sitewide image)
- [ ] Generate per-tool OG images (1200×630) for richer social previews
- [ ] Add `hreflang` if translating to Bangla
- [ ] Server-side rendering (currently CSR + Helmet — Google parses fine, but social previews use static `index.html` head)
- [ ] Move blog post bodies out of `posts.ts` into MDX files for easier editing
