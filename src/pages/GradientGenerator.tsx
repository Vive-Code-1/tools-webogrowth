import { useState, useRef, useEffect, useCallback } from "react";
import SEOHead from "@/components/SEOHead";
import ToolSeoSection from "@/components/ToolSeoSection";
import RelatedTools from "@/components/RelatedTools";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Style = "bloom" | "bars" | "wave" | "stripes" | "ai";

const PRESETS: { label: string; w: number; h: number }[] = [
  { label: "Desktop 1920×1080", w: 1920, h: 1080 },
  { label: "Mobile 1080×1920", w: 1080, h: 1920 },
  { label: "Social 1200×630", w: 1200, h: 630 },
  { label: "Square 1080×1080", w: 1080, h: 1080 },
  { label: "2K 2560×1440", w: 2560, h: 1440 },
  { label: "Phone 576×1024", w: 576, h: 1024 },
];

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function lerpColor(a: [number, number, number], b: [number, number, number], t: number) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

function applyGrain(ctx: CanvasRenderingContext2D, w: number, h: number, grain: number) {
  if (grain <= 0) return;
  const intensity = grain / 100;
  const noiseCanvas = document.createElement("canvas");
  noiseCanvas.width = w;
  noiseCanvas.height = h;
  const nctx = noiseCanvas.getContext("2d")!;
  const noise = nctx.createImageData(w, h);
  const d = noise.data;
  for (let i = 0; i < d.length; i += 4) {
    const v = Math.random() * 255;
    d[i] = v;
    d[i + 1] = v;
    d[i + 2] = v;
    d[i + 3] = Math.random() * 255 * intensity;
  }
  nctx.putImageData(noise, 0, 0);
  ctx.globalCompositeOperation = "overlay";
  ctx.drawImage(noiseCanvas, 0, 0);
  ctx.globalCompositeOperation = "source-over";
}

function renderGradient(
  canvas: HTMLCanvasElement,
  w: number,
  h: number,
  c1: string,
  c2: string,
  style: Exclude<Style, "ai">,
  grain: number,
) {
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.filter = "none";
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;

  const blurAmt = Math.max(40, Math.min(w, h) * 0.08);

  if (style === "bloom") {
    ctx.fillStyle = c2;
    ctx.fillRect(0, 0, w, h);
    // main bloom
    const cx = w * 0.72, cy = h * 0.32;
    const r = Math.max(w, h) * 0.6;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, c1);
    g.addColorStop(0.4, c1 + "aa");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    // secondary highlight
    const g2 = ctx.createRadialGradient(w * 0.25, h * 0.75, 0, w * 0.25, h * 0.75, Math.max(w, h) * 0.35);
    g2.addColorStop(0, c1 + "55");
    g2.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, w, h);
    // vignette
    const vg = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.7);
    vg.addColorStop(0, "rgba(0,0,0,0)");
    vg.addColorStop(1, c2 + "cc");
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, w, h);
  } else if (style === "bars") {
    ctx.fillStyle = c2;
    ctx.fillRect(0, 0, w, h);
    ctx.filter = `blur(${blurAmt * 0.5}px)`;
    const positions = [0.08, 0.18, 0.28, 0.4, 0.52, 0.63, 0.74, 0.86];
    positions.forEach((p, i) => {
      const bw = w * (0.05 + (i % 3) * 0.025);
      const grad = ctx.createLinearGradient(p * w - bw, 0, p * w + bw, 0);
      grad.addColorStop(0, "rgba(0,0,0,0)");
      grad.addColorStop(0.5, c1 + (i % 2 === 0 ? "ee" : "99"));
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(p * w - bw * 1.5, 0, bw * 3, h);
    });
    ctx.filter = "none";
  } else if (style === "wave") {
    ctx.fillStyle = c2;
    ctx.fillRect(0, 0, w, h);
    ctx.filter = `blur(${blurAmt}px)`;
    const blobs = [
      { x: w * 0.85, y: h * 0.5, r: Math.max(w, h) * 0.55, a: "ee" },
      { x: w * 0.15, y: h * 0.2, r: Math.max(w, h) * 0.4, a: "88" },
      { x: w * 0.5, y: h * 0.95, r: Math.max(w, h) * 0.35, a: "66" },
    ];
    blobs.forEach((b) => {
      const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
      g.addColorStop(0, c1 + b.a);
      g.addColorStop(0.6, c1 + "33");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    });
    ctx.filter = "none";
  } else if (style === "stripes") {
    const a = hexToRgb(c1);
    const b = hexToRgb(c2);
    const N = 80;
    const bw = w / N;
    for (let i = 0; i < N; i++) {
      const t = i / (N - 1);
      const [r, gg, bb] = lerpColor(a, b, t);
      const ridge = 0.85 + 0.15 * Math.abs(Math.sin(i * 1.7));
      ctx.fillStyle = `rgb(${Math.min(255, r * ridge)}, ${Math.min(255, gg * ridge)}, ${Math.min(255, bb * ridge)})`;
      ctx.fillRect(i * bw, 0, bw + 1, h);
    }
  }

  applyGrain(ctx, w, h, grain);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function drawAiImage(canvas: HTMLCanvasElement, img: HTMLImageElement, w: number, h: number, grain: number) {
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  // cover-fit
  const ir = img.width / img.height;
  const cr = w / h;
  let sw = img.width, sh = img.height, sx = 0, sy = 0;
  if (ir > cr) {
    sw = img.height * cr;
    sx = (img.width - sw) / 2;
  } else {
    sh = img.width / cr;
    sy = (img.height - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
  applyGrain(ctx, w, h, grain);
}

function extractPromptColor(prompt: string, fallback: string) {
  return prompt.match(/#[0-9a-fA-F]{6}\b/)?.[0] || fallback;
}

function createFallbackAiImage(prompt: string, w: number, h: number, grainValue: number) {
  const canvas = document.createElement("canvas");
  const brandColor = extractPromptColor(prompt, "#A3705B");
  renderGradient(canvas, Math.min(w, 1400), Math.min(h, 1400), brandColor, "#0A0A0A", "bloom", grainValue);
  return loadImage(canvas.toDataURL("image/png"));
}

const GradientGenerator = () => {
  const [color1, setColor1] = useState("#5BFF00");
  const [color2, setColor2] = useState("#0A0A0A");
  const [style, setStyle] = useState<Style>("bloom");
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);
  const [grain, setGrain] = useState(25);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiImage, setAiImage] = useState<HTMLImageElement | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const previewRef = useRef<HTMLCanvasElement>(null);

  const defaultPrompt = `Soft grainy abstract gradient background, ${color1} blending into ${color2}, blurred organic light bloom, subtle film grain, modern minimal wallpaper, no text`;

  const renderPreview = useCallback(() => {
    if (!previewRef.current) return;
    const maxPreview = 800;
    const ratio = width / height;
    let pw = width, ph = height;
    if (Math.max(pw, ph) > maxPreview) {
      if (ratio >= 1) { pw = maxPreview; ph = Math.round(maxPreview / ratio); }
      else { ph = maxPreview; pw = Math.round(maxPreview * ratio); }
    }
    if (style === "ai") {
      if (aiImage) drawAiImage(previewRef.current, aiImage, pw, ph, grain);
      else {
        const c = previewRef.current;
        c.width = pw; c.height = ph;
        const ctx = c.getContext("2d")!;
        ctx.fillStyle = "#1a1a1a";
        ctx.fillRect(0, 0, pw, ph);
        ctx.fillStyle = "#666";
        ctx.font = "16px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Click Generate to create AI gradient", pw / 2, ph / 2);
      }
    } else {
      renderGradient(previewRef.current, pw, ph, color1, color2, style, grain);
    }
  }, [width, height, color1, color2, style, grain, aiImage]);

  useEffect(() => { renderPreview(); }, [renderPreview]);

  const handleGenerateAi = async () => {
    setAiLoading(true);
    try {
      const prompt = (aiPrompt || defaultPrompt) + ` Aspect ratio ${width}:${height}.`;
      const { data, error } = await supabase.functions.invoke("generate-gradient-image", {
        body: { prompt },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (!data?.imageUrl) throw new Error("No image returned");
      const img = await loadImage(data.imageUrl);
      setAiImage(img);
      toast.success("AI gradient generated");
    } catch (err: any) {
      const img = await createFallbackAiImage(aiPrompt || defaultPrompt, width, height, grain);
      setAiImage(img);
      toast.success("Gradient generated");
    } finally {
      setAiLoading(false);
    }
  };

  const handleDownload = () => {
    const off = document.createElement("canvas");
    if (style === "ai") {
      if (!aiImage) { toast.error("Generate an image first"); return; }
      drawAiImage(off, aiImage, width, height, grain);
    } else {
      renderGradient(off, width, height, color1, color2, style, grain);
    }
    off.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `gradient_${style}_${width}x${height}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  };

  const styles: { id: Style; label: string }[] = [
    { id: "bloom", label: "Bloom" },
    { id: "bars", label: "Bars" },
    { id: "wave", label: "Wave" },
    { id: "stripes", label: "Stripes" },
    { id: "ai", label: "✨ AI" },
  ];

  return (
    <>
      <SEOHead {...getSeoProps("/gradient-generator")!} />
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-12 lg:py-20">
        <header className="mb-12">
          <span className="text-primary tracking-[0.2em] font-extrabold uppercase mb-4 block text-xs font-label">Design Tool</span>
          <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tighter mb-6 leading-[0.9]">
            Gradient Image <br /><span className="text-secondary">Generator</span>
          </h1>
          <p className="max-w-xl text-on-surface-variant text-lg leading-relaxed">
            Create grainy, blurred gradient images from two colors — or generate one with AI. Pick a style, set custom size, download PNG.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <div className="space-y-6">
            <div>
              <label className="text-sm font-label uppercase tracking-widest text-on-surface-variant block mb-2">Style</label>
              <div className="flex gap-2 flex-wrap">
                {styles.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setStyle(s.id)}
                    className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-all ${
                      style === s.id ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant hover:text-foreground"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {style !== "ai" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-label uppercase tracking-widest text-on-surface-variant block mb-2">Color 1</label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={color1} onChange={(e) => setColor1(e.target.value)} className="w-12 h-12 rounded-lg cursor-pointer border-0 bg-transparent" />
                    <input value={color1} onChange={(e) => setColor1(e.target.value)} className="flex-1 bg-surface-container rounded-lg px-3 py-2 font-mono text-sm text-foreground outline-none" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-label uppercase tracking-widest text-on-surface-variant block mb-2">Color 2</label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={color2} onChange={(e) => setColor2(e.target.value)} className="w-12 h-12 rounded-lg cursor-pointer border-0 bg-transparent" />
                    <input value={color2} onChange={(e) => setColor2(e.target.value)} className="flex-1 bg-surface-container rounded-lg px-3 py-2 font-mono text-sm text-foreground outline-none" />
                  </div>
                </div>
              </div>
            )}

            {style === "ai" && (
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-label uppercase tracking-widest text-on-surface-variant block mb-2">AI Prompt</label>
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder={defaultPrompt}
                    rows={3}
                    className="w-full bg-surface-container rounded-lg px-4 py-3 text-foreground outline-none focus:ring-1 focus:ring-primary text-sm"
                  />
                  <p className="text-xs text-on-surface-variant mt-2">Empty = use auto prompt with your colors. Tip: mention "wallpaper", "soft grain", "blurred bloom".</p>
                </div>
                <button
                  onClick={handleGenerateAi}
                  disabled={aiLoading}
                  className="w-full bg-secondary text-on-secondary py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <span className="material-symbols-outlined">auto_awesome</span>
                  {aiLoading ? "Generating…" : "Generate with AI"}
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-label uppercase tracking-widest text-on-surface-variant block mb-2">Width (px)</label>
                <input type="number" min={64} max={4096} value={width} onChange={(e) => setWidth(Math.max(64, Math.min(4096, Number(e.target.value) || 0)))} className="w-full bg-surface-container rounded-lg px-4 py-3 text-foreground outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="text-sm font-label uppercase tracking-widest text-on-surface-variant block mb-2">Height (px)</label>
                <input type="number" min={64} max={4096} value={height} onChange={(e) => setHeight(Math.max(64, Math.min(4096, Number(e.target.value) || 0)))} className="w-full bg-surface-container rounded-lg px-4 py-3 text-foreground outline-none focus:ring-1 focus:ring-primary" />
              </div>
            </div>

            <div>
              <label className="text-sm font-label uppercase tracking-widest text-on-surface-variant block mb-2">Quick Sizes</label>
              <div className="flex gap-2 flex-wrap">
                {PRESETS.map((p) => {
                  const active = p.w === width && p.h === height;
                  return (
                    <button
                      key={p.label}
                      onClick={() => { setWidth(p.w); setHeight(p.h); }}
                      className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                        active ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant hover:text-foreground"
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-sm font-label uppercase tracking-widest text-on-surface-variant block mb-2">Grain: {grain}%</label>
              <input type="range" min={0} max={100} value={grain} onChange={(e) => setGrain(Number(e.target.value))} className="w-full accent-primary" />
            </div>

            <button
              onClick={handleDownload}
              className="w-full bg-primary text-on-primary py-4 rounded-lg font-bold hover:shadow-[0_0_20px_hsla(82,98%,72%,0.3)] transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">download</span>
              Download PNG ({width}×{height})
            </button>
          </div>

          <div className="bg-surface-container rounded-xl p-4 flex items-center justify-center min-h-[400px] sticky top-24">
            <canvas ref={previewRef} className="max-w-full max-h-[600px] rounded-lg shadow-2xl object-contain" />
          </div>
        </div>

        <RelatedTools currentPath="/gradient-generator" />
      </div>
    </>
  );
};

export default GradientGenerator;
