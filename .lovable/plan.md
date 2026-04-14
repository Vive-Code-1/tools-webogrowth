

## Plan: ১৩টি নতুন টুল + Full SEO Optimization

### নতুন টুলস (১৩টি)

**High Priority (৫টি)**
1. **JSON Formatter/Validator** (`/json-formatter`) — JSON paste করে format, validate, minify
2. **Meta Tag Generator** (`/meta-tag-generator`) — Title, description, OG tags generate করে copy
3. **Color Palette Generator** (`/color-palette`) — Input color থেকে complementary, analogous, triadic palette
4. **QR Code Generator** (`/qr-code`) — URL/text থেকে QR code generate ও download
5. **Image Resizer & Cropper** (`/image-resizer`) — Canvas-based resize, crop with custom dimensions

**Medium Priority (৫টি)**
6. **CSS Minifier/Beautifier** (`/css-minifier`) — CSS paste করে minify বা beautify
7. **Base64 Encoder/Decoder** (`/base64`) — Text/image to Base64 এবং reverse
8. **CSS Gradient Generator** (`/gradient-generator`) — Visual gradient builder with CSS output
9. **Lorem Ipsum Generator** (`/lorem-ipsum`) — Paragraphs, sentences, words generate
10. **Robots.txt Generator** (`/robots-generator`) — Form-based robots.txt builder

**Bonus (৩টি)**
11. **Open Graph Preview** (`/og-preview`) — URL-less OG tag preview simulator
12. **Placeholder Image Generator** (`/placeholder`) — Custom size/color placeholder images
13. **HTML to Markdown Converter** (`/html-to-markdown`) — HTML paste করে Markdown output

### প্রতিটি টুলের জন্য SEO

প্রতিটি পেজে থাকবে:
- `<SEOHead>` with unique title, meta description, focus keywords, canonical URL, OG tags
- Proper H1-H6 heading hierarchy
- SEO-friendly content section (How to Use, FAQ) with internal links to other tools
- Schema.org JSON-LD (`WebApplication` type)

### SEO Keyword Strategy

| Tool | Title Tag | Focus Keyword |
|------|-----------|--------------|
| JSON Formatter | "JSON Formatter & Validator Online Free \| WeboGrowth" | json formatter online |
| Meta Tag Generator | "Meta Tag Generator for SEO - Free Online Tool \| WeboGrowth" | meta tag generator |
| Color Palette | "Color Palette Generator Online Free \| WeboGrowth" | color palette generator |
| QR Code | "QR Code Generator Free Online \| WeboGrowth" | qr code generator free |
| Image Resizer | "Image Resizer Online Free - Resize & Crop Images \| WeboGrowth" | resize image online |
| CSS Minifier | "CSS Minifier & Beautifier Online Free \| WeboGrowth" | css minifier online |
| Base64 | "Base64 Encoder Decoder Online Free \| WeboGrowth" | base64 encode decode |
| Gradient Generator | "CSS Gradient Generator - Create Gradients Online \| WeboGrowth" | css gradient generator |
| Lorem Ipsum | "Lorem Ipsum Generator - Dummy Text Online \| WeboGrowth" | lorem ipsum generator |
| Robots.txt | "Robots.txt Generator Free Online \| WeboGrowth" | robots.txt generator |
| OG Preview | "Open Graph Preview Tool - Test OG Tags Free \| WeboGrowth" | og preview tool |
| Placeholder | "Placeholder Image Generator Online Free \| WeboGrowth" | placeholder image generator |
| HTML to Markdown | "HTML to Markdown Converter Online Free \| WeboGrowth" | html to markdown |

### Site-Wide SEO Updates

1. **Navbar** — Dropdown menu with tool categories (Image Tools, Developer Tools, SEO Tools)
2. **Homepage** — Updated tool grid with all 17 tools, categorized sections, internal linking
3. **Footer** — Add tool links for internal linking, keep WeboGrowth.Com link
4. **Sitemap** — Add all 13 new routes
5. **index.html** — Updated JSON-LD schema listing all tools
6. **Each tool page** — "Related Tools" section at bottom for internal linking
7. **URL Structure** — Clean, keyword-rich URLs (already planned above)

### Files to Create (১৩ new pages)
- `src/pages/JsonFormatter.tsx`
- `src/pages/MetaTagGenerator.tsx`
- `src/pages/ColorPalette.tsx`
- `src/pages/QrCodeGenerator.tsx`
- `src/pages/ImageResizer.tsx`
- `src/pages/CssMinifier.tsx`
- `src/pages/Base64Tool.tsx`
- `src/pages/GradientGenerator.tsx`
- `src/pages/LoremIpsum.tsx`
- `src/pages/RobotsTxtGenerator.tsx`
- `src/pages/OgPreview.tsx`
- `src/pages/PlaceholderImage.tsx`
- `src/pages/HtmlToMarkdown.tsx`

### Files to Update
- `src/App.tsx` — Add 13 new routes
- `src/components/Navbar.tsx` — Dropdown with categories
- `src/components/Footer.tsx` — Tool links section
- `src/pages/Index.tsx` — Full tool grid with categories
- `public/sitemap.xml` — Add 13 new URLs
- `index.html` — Extended JSON-LD
- All existing tool pages — Add "Related Tools" section

### Dependencies to Add
- `qrcode` — QR code generation
- `turndown` — HTML to Markdown conversion

### Implementation Order
1. Create all 13 tool pages with full functionality + SEO
2. Update routing, navbar, footer, homepage
3. Update sitemap & JSON-LD
4. Add internal linking (Related Tools) to all pages

