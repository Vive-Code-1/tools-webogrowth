## Plan: Fix Grain Bug + Add Gemini AI Gradient Mode

### Problem Identified
The preview shows only grain noise — no gradient visible. Root cause: `ctx.putImageData(noise, 0, 0)` **ignores** `globalCompositeOperation`. So the noise overwrites the entire gradient instead of blending on top. That's why you see grey static only.

Additionally, the current canvas-drawn styles don't quite match the soft, organic, AI-art feel of your reference images. So we'll offer two modes.

---

### Fix #1 — Grain blending bug (immediate fix)
In `src/pages/GradientGenerator.tsx`, change grain rendering to:
1. Draw noise into an **offscreen canvas** with `putImageData`.
2. Then `ctx.drawImage(noiseCanvas, 0, 0)` with `globalCompositeOperation = "overlay"` — this respects blend modes.

Result: gradient stays visible, grain overlays it like the references.

### Fix #2 — Improve canvas styles
- **Bloom**: add a second smaller off-axis radial highlight + soft vignette using a third radial of `c2` from edges.
- **Wave**: stack 2–3 large blurred ellipses with varied positions (not just one) so it has organic falloff.
- **Bars**: clear blurred light streaks of varying widths and opacities.
- **Stripes**: keep ridge interpolation but add subtle blur pass.
- Lower default grain to ~25 (current 35 was washing it out).

### Fix #3 — Add "AI Gradient" mode (Gemini)
Add a 5th style toggle: **AI**. When selected:
- Show a **prompt input** (pre-filled with auto prompt: `"Soft grainy gradient background, {color1} blending into {color2}, blurred organic light, film grain, abstract wallpaper"`).
- User can edit prompt, click **Generate**.
- Calls a new edge function `generate-gradient-image` that proxies Google Gemini `imagen-3.0-generate-001` (or `gemini-2.5-flash-image-preview`) with the chosen size aspect ratio.
- Image returned as base64 → drawn into preview canvas → downloadable as PNG with the same Download button (grain slider can still overlay client-side noise on the AI image).

**Secret needed**: `GEMINI_API_KEY` — will be requested via Lovable Cloud secret prompt after approval. (The Lovable AI Gateway already provides Gemini access via `LOVABLE_API_KEY`, so we'll try that first — no key required from you. If you prefer your own Gemini key for image generation specifically, you can add it.)

> Note: Lovable AI Gateway currently supports Gemini text + `gemini-2.5-flash-image-preview` for image generation. We'll use that endpoint via `LOVABLE_API_KEY` (already configured) — **no API key needed from you**.

### Files to change
- `src/pages/GradientGenerator.tsx` — fix grain blending, improve styles, add AI mode UI + prompt input + generate button.
- `supabase/functions/generate-gradient-image/index.ts` — **new** edge function calling Lovable AI Gateway (`https://ai.gateway.lovable.dev/v1/chat/completions` with `google/gemini-2.5-flash-image-preview`), returns base64 PNG.
- `supabase/config.toml` — register new function.

### Out of scope
- Saving generations to history
- Mesh / 3-color gradients
- SVG output

After approval I'll implement, deploy the edge function, and visually verify all 5 modes (Bloom, Bars, Wave, Stripes, AI) render correctly.