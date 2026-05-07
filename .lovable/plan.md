## Plan: Upgrade Gradient Generator to Grainy/Noisy Gradient Image Maker

### Goal
Transform the current CSS-only Gradient Generator into a tool that **renders downloadable PNG images** styled like the user's reference uploads — soft, blurred, grainy gradients (radial blooms, mesh-like color fields, vertical light bars) — using two user-picked colors. Add custom size input + clickable size presets.

### Reference Aesthetic
The four uploaded images show:
1. Radial green bloom on dark background (grainy)
2. Vertical blurred light bars in green tone (noisy)
3. Soft curved green-on-black wave (smooth grain)
4. Vertical thin striped gradient (green→teal→navy)

Common traits: **soft blur**, **film grain noise overlay**, **organic light/dark falloff**, **two-color harmony**.

### Features to Build

1. **Color inputs** — keep existing Color 1 + Color 2 pickers.
2. **Gradient style selector** — replace Linear/Radial with 4 styles matching the references:
   - `Bloom` (radial soft glow, off-center)
   - `Bars` (vertical blurred light streaks)
   - `Wave` (curved soft gradient)
   - `Stripes` (thin vertical gradient bands)
3. **Grain intensity slider** (0–100) to control noise overlay.
4. **Size controls**:
   - Width + Height number inputs (custom).
   - **Preset chips below** — click to apply: `1920×1080` (Desktop), `1080×1920` (Mobile), `1200×630` (OG/Social), `1080×1080` (Square), `2560×1440` (2K), `576×1024` (Phone Wallpaper).
5. **Live canvas preview** rendered with HTML5 `<canvas>` (downscaled fit-to-container preview, full resolution on download).
6. **Download PNG button** — exports canvas at chosen resolution.
7. Keep CSS code box for the Linear option as a bonus (optional — can drop if cluttered). Decision: **drop it**, since output is now an image.

### Rendering Approach (Canvas 2D)

For each style, draw onto an offscreen canvas at full requested resolution:

- **Bloom**: fill with color2 (dark), then `createRadialGradient` with color1 at ~70% opacity centered slightly off-axis, large radius.
- **Bars**: fill color2; draw 6–8 vertical `createLinearGradient` rectangles (color1 → transparent) at varied widths/positions with `filter: blur(40px)` via `ctx.filter`.
- **Wave**: fill color2; draw large arc/ellipse paths filled with radial gradient color1, blurred heavily.
- **Stripes**: draw N=80 thin vertical bars where each bar's color is interpolated from color1→color2 across X, with subtle per-bar lightness variation for the "ridged" look.
- **Grain overlay**: generate noise via `ImageData` (random alpha 0–grainIntensity) and composite with `globalCompositeOperation = "overlay"` or `"soft-light"`.

### Download Flow
On click → render full-resolution canvas → `canvas.toBlob('image/png')` → trigger anchor download as `gradient_{style}_{w}x{h}.png`. No backend, no storage upload.

### Files to Modify
- `src/pages/GradientGenerator.tsx` — full rewrite of UI + canvas rendering logic.

### Files Unchanged
- Routing, SEO, related tools, Layout — no other touch points needed.

### Out of Scope
- Saving presets to localStorage
- More than 2 colors / mesh editor
- SVG export

After approval, I'll implement directly in `GradientGenerator.tsx` and visually verify the four styles render correctly.