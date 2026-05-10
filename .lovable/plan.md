# Fixes & Performance Optimization Plan

## 1. Image Compressor — Real Quality Control

**সমস্যা:** Slider 21% করলেও সাইজ কমে না, বরং বাড়ে (1.33MB → 1.56MB)। কারণ — input PNG হলে আমরা output-ও PNG করি, আর `canvas.toBlob` PNG-এর জন্য quality argument ignore করে (PNG lossless)। তাই slider কাজ করে না।

**সমাধান:** `src/pages/Compressor.tsx`-এ Converter-এর মতো সম্পূর্ণ flow:
- Input format নির্বিশেষে output সবসময় JPEG বা WebP-তে compress হবে (user input format নির্বাচন করতে পারবে: WebP/JPEG; PNG অপশন থাকবে কিন্তু "lossless – size will not reduce" hint দেখাবে)।
- Default output = WebP (best compression)।
- Slider label = "Quality Precision" (Lesser → 90% → Ultra), Converter UI-র সাথে consistent।
- যদি `compressedSize >= originalSize` হয় → "Already optimized" message + original ফেরত দেওয়া (negative savings লুকানো)।
- Savings সর্বদা positive নাহলে "0%" দেখাবে (no `--16.8%` bug)।

## 2. Home Page — Placeholder Flash Fix

**সমস্যা:** Reload করলে আগে empty placeholder box দেখায়, তারপর Lottie load হয় (284KB JSON fetch + parse)।

**সমাধান:** `src/pages/Index.tsx`:
- Lottie JSON-কে `import heroAnimation from "@/assets/home-hero-animation.json"` দিয়ে bundle করব (fetch round-trip বাদ)।
- File `public/lottie/` থেকে `src/assets/`-এ move।
- `lottie-react`-কে `React.lazy` দিয়ে dynamic import — initial bundle থেকে বের, কিন্তু animationData immediately available থাকলে first paint-এ render হবে।
- Placeholder box-এ subtle gradient রাখব যাতে empty না দেখায়।

## 3. Speed Optimization (Target: 95+ Desktop, 90+ Mobile)

বর্তমান: Desktop 83, Mobile 56। FCP/LCP slow।

### Bundle splitting
- App.tsx-এ সব 22+ pages eagerly imported → বিশাল initial bundle। সব route page-কে `React.lazy()` + `<Suspense>` দিয়ে code-split করব। Index page শুধু eager থাকবে।

### Font optimization
- `src/index.css`-এ Google Fonts `@import` বাদ দিয়ে `index.html`-এ `<link rel="preload">` + `display=swap` সহ তিনটি font file (Manrope, Space Grotesk, Material Symbols) load করব।
- Material Symbols-এর জন্য শুধু ব্যবহৃত icons-এর subset URL parameter ব্যবহার করব (`text=` parameter দিয়ে শুধু needed glyphs)।

### Heavy library trimming
- Homepage থেকে `framer-motion` ব্যবহার ভারী — ToolCard-এর scroll animation CSS-only (Tailwind animate + IntersectionObserver in `AnimatedSection`) দিয়ে replace করব যেখানে সম্ভব।
- `lottie-react` শুধু Index page-এ lazy load হবে (`React.lazy` wrapper)।

### HTML & assets
- `index.html`-এ `<link rel="preconnect">` ইতিমধ্যে আছে — `dns-prefetch` যোগ করব Supabase URL-এর জন্য।
- OG image (currently external Google Storage WebP) → SEOHead-এ `loading="lazy"` সংক্রান্ত image কোথাও থাকলে নিশ্চিত করব।
- `vite.config.ts`-এ `build.rollupOptions.output.manualChunks` দিয়ে vendor chunks (react, radix-ui, framer-motion) আলাদা করব caching-এর জন্য।

### Misc
- `src/index.css`-এ unused Material Symbols variation settings simplify।
- Hero section-এর দুটো বিশাল `blur-[120px]` background ball — GPU-heavy। `will-change: transform` যোগ করে অথবা mobile-এ disable করব।

## Files to change
- `src/pages/Compressor.tsx` (rewrite compress logic + UI options)
- `src/pages/Index.tsx` (bundled lottie, lazy Lottie component)
- `src/App.tsx` (lazy routes + Suspense)
- `src/index.css` (remove font @import)
- `index.html` (font preload, dns-prefetch)
- `vite.config.ts` (manual chunks)
- Move `public/lottie/home-hero-animation.json` → `src/assets/`

## Out of scope
- Server-side rendering / SSG migration
- Replacing framer-motion entirely (only homepage trimmed)
- Image CDN setup

Approval please proceed করব।