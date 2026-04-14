

## Plan: Kinetic → WeboGrowth Laboratory রিপ্লেস + Full SEO Optimization + Footer Update

### 1. "Kinetic" → "WeboGrowth Laboratory" রিপ্লেস

| File | Current | Replace With |
|------|---------|-------------|
| `src/pages/Index.tsx` | "Kinetic Laboratory v1.0" | "WeboGrowth Laboratory v1.0" |
| `src/pages/Index.tsx` | "Join the Kinetic Lab" | "Join the WeboGrowth Lab" |
| `src/pages/Compressor.tsx` | "Kinetic Image" | "WeboGrowth Image" |
| `src/components/Footer.tsx` | "© 2024 WeboGrowth. Kinetic Laboratory Design." | "© 2026 WeboGrowth.Com Copyright Reserved." (linked to https://webogrowth.com) |

### 2. Full SEO Optimization — Per-Page `<title>` & `<meta>`

Since this is a React SPA, I'll add **react-helmet-async** to set unique `<title>`, `<meta description>`, `<meta keywords>`, canonical URL, and Open Graph tags per page:

| Page | Title | Focus Keyword | Meta Description |
|------|-------|--------------|-----------------|
| **Home** (`/`) | "WeboGrowth Tools - Free Online Image Compressor, Converter & Optimizer" | "image compressor online free" | "Free online image optimization tools by WeboGrowth. Compress PNG, JPEG, WebP images, convert formats, optimize SVGs, and generate favicons instantly." |
| **Compressor** (`/compressor`) | "Image Compressor Online Free - Compress PNG, JPEG, WebP \| WeboGrowth" | "compress image online" | "Compress images online for free. Reduce PNG, JPEG, WebP file sizes by up to 90% without losing quality. Fast, private, browser-based compression." |
| **Converter** (`/converter`) | "Image Format Converter - Convert PNG to WebP, JPEG Online Free \| WeboGrowth" | "convert image format online" | "Convert images between PNG, WebP, and JPEG formats online for free. High-quality format conversion with no upload required." |
| **SVG Optimizer** (`/svg-optimizer`) | "SVG Optimizer Online - Minify & Clean SVG Files Free \| WeboGrowth" | "svg optimizer online" | "Optimize and minify SVG files online for free. Remove metadata, clean paths, and reduce SVG file sizes from Figma or Illustrator exports." |
| **Favicon** (`/favicon`) | "Favicon Generator Online Free - ICO, PNG, Apple Touch Icon \| WeboGrowth" | "favicon generator online" | "Generate complete favicon packages for all platforms. Create ICO, PNG, Apple Touch Icon, and Android icons from any image in seconds." |

### 3. Additional SEO Enhancements

- **Update `index.html`** — Default title, meta description, OG tags updated with WeboGrowth branding
- **Structured data (JSON-LD)** — Add `WebApplication` schema to homepage for rich results
- **Canonical URLs** — Each page gets a canonical link
- **`robots.txt`** — Add `Sitemap:` directive
- **`public/sitemap.xml`** — Create sitemap with all 5 pages
- **Update OG image meta** — Remove Lovable placeholder, use WeboGrowth branding

### 4. Footer Update

Replace current footer copyright with:
```
© 2026 WeboGrowth.Com Copyright Reserved.
```
"WeboGrowth.Com" will be a clickable link to `https://webogrowth.com`.

### Technical Details

- Install `react-helmet-async` for per-page meta tags
- Create a reusable `<SEOHead>` component used in every page
- All changes are in: `index.html`, `Footer.tsx`, `Index.tsx`, `Compressor.tsx`, `Converter.tsx`, `SvgOptimizer.tsx`, `Favicon.tsx`, `App.tsx`, `robots.txt`, new `sitemap.xml`

