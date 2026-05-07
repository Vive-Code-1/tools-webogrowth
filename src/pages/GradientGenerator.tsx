import { useState, useRef, useEffect, useCallback } from "react";
import SEOHead from "@/components/SEOHead";
import RelatedTools from "@/components/RelatedTools";

type Style = "bloom" | "bars" | "wave" | "stripes";

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
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function lerpColor(a: [number, number, number], b: [number, number, number], t: number) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

function renderGradient(
  canvas: HTMLCanvasElement,
  w: number,
  h: number,
  c1: string,
  c2: string,
  style: Style,
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
    const cx = w * 0.72;
    const cy = h * 0.32;
    const r = Math.max(w, h) * 0.55;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, c1);
    g.addColorStop(0.45, c1 + "cc");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  } else if (style === "bars") {
    ctx.fillStyle = c2;
    ctx.fillRect(0, 0, w, h);
    ctx.filter = `blur(${blurAmt * 0.6}px)`;
    const positions = [0.05, 0.14, 0.22, 0.32, 0.44, 0.55, 0.66, 0.78];
    positions.forEach((p, i) => {
      const bw = w * (0.04 + (i % 3) * 0.02);
      const grad = ctx.createLinearGradient(p * w, 0, p * w + bw, 0);
      grad.addColorStop(0, "rgba(0,0,0,0)");
      grad.addColorStop(0.5, c1);
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(p * w - bw, 0, bw * 3, h);
    });
    ctx.filter = "none";
  } else if (style === "wave") {
    ctx.fillStyle = c2;
    ctx.fillRect(0, 0, w, h);
    ctx.filter = `blur(${blurAmt}px)`;
    const cx1 = w * 0.85;
    const cy1 = h * 0.5;
    const r1 = Math.max(w, h) * 0.6;
    const g1 = ctx.createRadialGradient(cx1, cy1, r1 * 0.2, cx1, cy1, r1);
    g1.addColorStop(0, "rgba(0,0,0,0)");
    g1.addColorStop(0.5, c1);
    g1.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, w, h);
    const g2 = ctx.createRadialGradient(w * 0.1, h * 0.1, 0, w * 0.1, h * 0.1, Math.max(w, h) * 0.4);
    g2.addColorStop(0, c1 + "88");
    g2.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, w, h);
    ctx.filter = "none";
  } else if (style === "stripes") {
    const a = hexToRgb(c1);
    const b = hexToRgb(c2);
    const N = 80;
    const bw = w / N;
    for (let i = 0; i < N; i++) {
      const t = i / (N - 1);
      const [r, gg, bb] = lerpColor(a, b, t);
      // ridge effect: subtle vertical lightness oscillation
      const ridge = 0.85 + 0.15 * Math.abs(Math.sin(i * 1.7));
      ctx.fillStyle = `rgb(${Math.min(255, r * ridge)}, ${Math.min(255, gg * ridge)}, ${Math.min(255, bb * ridge)})`;
      ctx.fillRect(i * bw, 0, bw + 1, h);
    }
  }

  // Grain overlay
  if (grain > 0) {
    const intensity = grain / 100;
    const noise = ctx.createImageData(w, h);
    const d = noise.data;
    for (let i = 0; i < d.length; i += 4) {
      const v = Math.random() * 255;
      d[i] = v;
      d[i + 1] = v;
      d[i + 2] = v;
      d[i + 3] = Math.random() * 255 * intensity;
    }
    ctx.globalCompositeOperation = "overlay";
    ctx.putImageData(noise, 0, 0);
    ctx.globalCompositeOperation = "source-over";
  }
}

const GradientGenerator = () => {
  const [color1, setColor1] = useState("#5BFF00");
  const [color2, setColor2] = useState("#0A0A0A");
  const [style, setStyle] = useState<Style>("bloom");
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);
  const [grain, setGrain] = useState(35);
  const previewRef = useRef<HTMLCanvasElement>(null);

  const renderPreview = useCallback(() => {
    if (!previewRef.current) return;
    // preview at lower res for performance
    const maxPreview = 800;
    const ratio = width / height;
    let pw = width;
    let ph = height;
    if (Math.max(pw, ph) > maxPreview) {
      if (ratio >= 1) {
        pw = maxPreview;
        ph = Math.round(maxPreview / ratio);
      } else {
        ph = maxPreview;
        pw = Math.round(maxPreview * ratio);
      }
    }
    renderGradient(previewRef.current, pw, ph, color1, color2, style, grain);
  }, [width, height, color1, color2, style, grain]);

  useEffect(() => {
    renderPreview();
  }, [renderPreview]);

  const handleDownload = () => {
    const off = document.createElement("canvas");
    renderGradient(off, width, height, color1, color2, style, grain);
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
  ];

  return (
    <>
      <SEOHead
        title="Grainy Gradient Image Generator | WeboGrowth"
        description="Create grainy, blurred gradient background images from any two colors. Choose bloom, bars, wave or stripes styles, set custom size, and download PNG."
        keywords="gradient image generator, grainy gradient, noise gradient, mesh gradient, gradient background maker, gradient png download"
        canonicalPath="/gradient-generator"
        jsonLd={{ "@context": "https://schema.org", "@type": "SoftwareApplication", name: "Grainy Gradient Generator", url: "https://tools.webogrowth.com/gradient-generator", applicationCategory: "DesignApplication", operatingSystem: "Any", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, author: { "@type": "Organization", name: "WeboGrowth", url: "https://webogrowth.com" } }}
      />
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-12 lg:py-20">
        <header className="mb-12">
          <span className="text-primary tracking-[0.2em] font-extrabold uppercase mb-4 block text-xs font-label">Design Tool</span>
          <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tighter mb-6 leading-[0.9]">
            Gradient Image <br /><span className="text-secondary">Generator</span>
          </h1>
          <p className="max-w-xl text-on-surface-variant text-lg leading-relaxed">
            Create grainy, blurred gradient images from two colors. Pick a style, set custom size, and download a PNG.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <div className="space-y-6">
            {/* Style */}
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

            {/* Colors */}
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

            {/* Size */}
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

            {/* Size presets */}
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

            {/* Grain */}
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

          <div className="bg-surface-container rounded-xl p-4 flex items-center justify-center min-h-[400px]">
            <canvas ref={previewRef} className="max-w-full max-h-[600px] rounded-lg shadow-2xl object-contain" />
          </div>
        </div>

        <RelatedTools currentPath="/gradient-generator" />
      </div>
    </>
  );
};

export default GradientGenerator;
