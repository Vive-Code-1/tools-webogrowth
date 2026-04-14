## WeboGrowth Tools — Image Optimization Suite

### Overview

A dark-themed, "WeboGrowth Tools" web tools site with 4 image optimization tools, built with the exact design system from your mockups (Lime Green + Periwinkle, Space Grotesk + Manrope, glassmorphism surfaces). Connected to Supabase with auto-cleanup storage.

### Pages & Routes

1. **Landing Page (`/`)** — Hero section, bento-grid tool cards, stats section, newsletter CTA, footer
2. **Image Compressor (`/compressor`)** — Drag & drop upload, quality slider (lossless → max compression), live delta analysis preview, before/after stats, 5-min countdown download
3. **Format Converter (`/converter`)** — Drag & drop, format selector (WebP/AVIF/PNG/JPG/SVG), quality precision slider, convert & download with 5-min timer
4. **SVG Path Optimizer (`/svg-optimizer`)** — SVG upload, path optimization, before/after code preview, download
5. **Favicon Generator (`/favicon`)** — Logo upload, background color picker, icon radius slider, technical output preview (desktop/iOS/Android/manifest), generate & download .zip with 5-min timer

### Design System Setup

- Full custom color palette from your DESIGN.md (surface hierarchy, primary #cffe70, secondary #8f93ff, etc.)
- Space Grotesk for headlines, Manrope for body/labels
- "No-Line" rule: background color shifts instead of borders, ghost borders at 15% opacity
- Glassmorphism for floating elements, ambient glows, tonal layering
- Shared Navbar (sticky, blurred) + Footer across all pages

### Core Functionality

**Client-Side Image Processing:**

- Image compression using browser-based Canvas API (lossy) and libraries
- Format conversion (JPG↔WebP↔PNG, SVG↔PNG) via Canvas + Blob APIs
- SVG path optimization using SVGO (browser build)
- Favicon generation: resize source image to all required sizes (16, 32, 48, 180, 192, 512px), generate ICO + PNG + webmanifest, package as ZIP

**Supabase Storage with 5-Minute Auto-Cleanup:**

- Processed files uploaded to a Supabase Storage bucket
- Edge function (cron or scheduled) to delete files older than 5 minutes
- Each file gets a metadata timestamp for expiry tracking

**5-Minute Countdown Download System:**

- After processing, a visible countdown timer starts (5:00 → 0:00)
- User can download during the countdown window
- When timer expires: download button disabled, alert shown saying "সময় শেষ! আবার নতুন করে ইমেজ প্রসেস করুন" (Time's up! Please process the image again)
- File deleted from storage on expiry

### Supabase Integration

- Storage bucket for temporary processed files
- Edge function for auto-cleanup (runs every minute, deletes files > 5 min old)
- RLS policies for public read access (time-limited via signed URLs)