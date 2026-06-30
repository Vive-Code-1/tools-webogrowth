# Keyword Strategy — WeboGrowth Tools

Source: Semrush (US database), 14 Jun 2026. Authority Score is currently very low (~0), so the strategy targets **winnable long-tail keywords (KDI < 50)** as primary terms and head terms as secondary upside.

## Per-tool primary target (in <title>) + secondary

| Tool | Primary KW (in title) | Volume | KDI | Secondary |
|---|---|---|---|---|
| /compressor | webp compressor | 1,000 | 30 ✅ | compress png (12.1K/53), compress jpeg (8.1K/67) |
| /converter | png to webp | 12,100 | 47 ✅ | png to avif (590/19 ⭐), jpg to webp (6.6K/69) |
| /svg-optimizer | svgo online | 20 | 0 ⭐ | minify svg (110/34), svg optimizer (880/61) |
| /favicon | apple touch icon generator | 20 | 0 ⭐ | favicon generator (12.1K/72) |
| /image-resizer | resize image without losing quality | long-tail | < 50 | resize image online (12.1K/90, aspirational) |
| /placeholder | dummy image | 480 | 42 ✅ | placeholder image generator (320/53) |
| /json-formatter | json minifier | 1,300 | 27 ⭐ | json formatter (90.5K/53), json beautifier (18.1K/51) |
| /css-minifier | css minifier | 880 | 41 ✅ | minify css (1.3K/52) |
| /base64 | base64 decoder | 9,900 | 54 | base64 encoder (4.4K/58) |
| /html-to-markdown | html to markdown | 1,600 | 56 | — |
| /meta-tag-generator | meta tag generator | 320 | 44 ✅ | open graph generator |
| /og-preview | og image preview | 90 | 30 ⭐ | og preview (260/36), open graph preview (260/39) |
| /robots-generator | robots txt generator | 1,000 | 39 ✅ | create robots.txt |
| /color-palette | color palette from image | 6,600 | 58 | color palette generator (90.5K/99, head only) |
| /gradient-generator | gradient generator | 3,600 | 55 | css gradient generator (1.9K/67) |
| /qr-code | wifi qr code | 2,900 | 37 ⭐ | vcard qr code (1.3K/33 ⭐), qr code with logo (1.6K/84) |
| /lorem-ipsum | dummy text generator | 720 | 50 | lorem ipsum (110K/78, head) |

## Why the pivots

- **/compressor**: Lead with WebP — the only term we can realistically rank for (KDI 30). Generic "image compressor" (KDI 91) is unwinnable today.
- **/converter**: PNG→WebP and PNG→AVIF have the cleanest difficulty-to-volume ratio. AVIF (KDI 19) is a quick-win.
- **/svg-optimizer** & **/favicon**: Lead with KDI 0 terms ("svgo online", "apple touch icon generator") — those rank fastest, then head terms follow as authority grows.
- **/qr-code**: "wifi qr code" and "vcard qr code" are commercial-intent + KDI < 40. Avoid the unwinnable head "qr code generator" (823K vol, KDI 96).
- **/og-preview**, **/robots-generator**, **/meta-tag-generator**: KDI 30-44 — realistic 6-month wins with consistent backlinks.

## Next moves

1. ✅ Titles, descriptions, keywords updated in `src/lib/seo.ts`.
2. Write 2 blog posts per primary KW (cluster strategy) — see `src/blog/posts.ts`.
3. Re-submit sitemap to GSC + IndexNow after deploy.
4. Track positions weekly via Semrush Position Tracking (use Semrush connector for in-app dashboard).

---

## 90-Day Blog Calendar (auto-rotated)

The `marketing/blog-topic-queue.json` file holds the next 83 un-posted topics (after the first 7 HEIC posts already shipped). Topics are interleaved by **category** to prevent the daily auto-publisher from binge-posting one niche.

Rotation per week: `Image → Developer → SEO → Marketing → Design → PDF → (SEO or Developer)`.

Each topic targets a **low-KDI / long-tail / high-intent keyword** drawn from the per-tool table above. Sample focus areas:
- **Image** — webp compressor, png→webp, png→avif, image resizer (Instagram/Amazon), background remover, watermark
- **Developer** — json minifier, jwt decoder, base64 encoder/decoder, css minifier, regex tester, diff checker, html→markdown, curl builder
- **SEO** — svgo online, apple touch icon, meta tag generator, robots.txt, sitemap, schema markup (FAQ / LocalBusiness / Article / Product), Core Web Vitals, alt text
- **Marketing** — wifi qr, vcard qr, menu qr, instagram/spotify/payment qr, qr with logo
- **Design** — color palette from image, css gradient (linear/radial/mesh), dummy text, image→svg, video→gif
- **PDF** — merge / split / compress / unlock / rotate / convert (word, jpg, png, html)

Refresh the queue every 60 days based on actual GSC click data (drop zero-impression topics, double-down on winners).
