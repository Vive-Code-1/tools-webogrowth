import { useState, useCallback } from "react";
import JSZip from "jszip";
import DropZone from "@/components/DropZone";
import CountdownDownload from "@/components/CountdownDownload";

const ICON_SIZES = [
  { size: 16, name: "favicon-16x16.png", category: "Desktop" },
  { size: 32, name: "favicon-32x32.png", category: "Desktop" },
  { size: 48, name: "favicon-48x48.png", category: "Desktop" },
  { size: 180, name: "apple-touch-icon.png", category: "iOS" },
  { size: 192, name: "android-chrome-192x192.png", category: "Android" },
  { size: 512, name: "android-chrome-512x512.png", category: "Android" },
];

const Favicon = () => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [bgColor, setBgColor] = useState("#CFFE70");
  const [radius, setRadius] = useState(20);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ url: string; fileName: string } | null>(null);

  const handleFileSelect = useCallback((f: File) => {
    setFile(f);
    setResult(null);
    setPreviewUrl(URL.createObjectURL(f));
  }, []);

  const generateIcon = useCallback(
    async (img: HTMLImageElement, size: number): Promise<Blob> => {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d")!;

      // Background
      const r = (radius / 100) * (size / 2);
      ctx.beginPath();
      ctx.moveTo(r, 0);
      ctx.lineTo(size - r, 0);
      ctx.quadraticCurveTo(size, 0, size, r);
      ctx.lineTo(size, size - r);
      ctx.quadraticCurveTo(size, size, size - r, size);
      ctx.lineTo(r, size);
      ctx.quadraticCurveTo(0, size, 0, size - r);
      ctx.lineTo(0, r);
      ctx.quadraticCurveTo(0, 0, r, 0);
      ctx.closePath();
      ctx.fillStyle = bgColor;
      ctx.fill();
      ctx.clip();

      // Draw image with padding
      const padding = size * 0.1;
      ctx.drawImage(img, padding, padding, size - padding * 2, size - padding * 2);

      return new Promise((resolve) => {
        canvas.toBlob((b) => resolve(b!), "image/png");
      });
    },
    [bgColor, radius]
  );

  const handleGenerate = useCallback(async () => {
    if (!file) return;
    setProcessing(true);

    try {
      const img = new Image();
      const loadPromise = new Promise<void>((resolve) => { img.onload = () => resolve(); });
      img.src = URL.createObjectURL(file);
      await loadPromise;

      const zip = new JSZip();

      for (const iconDef of ICON_SIZES) {
        const blob = await generateIcon(img, iconDef.size);
        zip.file(iconDef.name, blob);
      }

      // Generate webmanifest
      const manifest = {
        name: "My App",
        short_name: "App",
        icons: ICON_SIZES.filter((s) => s.size >= 192).map((s) => ({
          src: `/${s.name}`,
          sizes: `${s.size}x${s.size}`,
          type: "image/png",
        })),
        theme_color: bgColor,
        background_color: bgColor,
        display: "standalone",
      };
      zip.file("site.webmanifest", JSON.stringify(manifest, null, 2));

      // Generate HTML snippet
      const htmlSnippet = `<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">`;
      zip.file("usage.html", htmlSnippet);

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      setResult({ url, fileName: "favicon-package.zip" });
    } catch (err) {
      console.error("Favicon generation failed:", err);
    } finally {
      setProcessing(false);
    }
  }, [file, generateIcon, bgColor]);

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-8 py-12 lg:py-20">
      <header className="mb-20">
        <div className="inline-block px-3 py-1 bg-secondary-container/30 text-secondary text-[10px] font-black uppercase tracking-[0.2em] rounded-full mb-6">
          Developer Utility
        </div>
        <h1 className="text-4xl md:text-6xl lg:text-8xl font-headline font-bold tracking-tighter mb-6 leading-[0.9]">
          Favicon <span className="text-primary">Laboratory.</span>
        </h1>
        <p className="text-xl text-on-surface-variant max-w-2xl leading-relaxed">
          Generate a complete set of high-performance icons for every platform in seconds.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Upload & Config */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-surface-container-low p-8 rounded-xl border border-primary/5 group hover:border-primary/20 transition-all duration-500">
            <div className="flex items-center justify-between mb-8">
              <span className="text-xs font-black uppercase tracking-widest text-foreground/40">Input Module</span>
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            </div>
            <DropZone
              onFileSelect={handleFileSelect}
              accept="image/png,image/svg+xml,image/webp"
              label="Drop master logo here"
              sublabel="SVG, PNG, or WEBP (min 512x512)"
            />
          </div>

          {/* Config */}
          <div className="bg-surface-container p-8 rounded-xl space-y-6">
            <span className="text-xs font-black uppercase tracking-widest text-foreground/40">Parameters</span>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Background Color</label>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-surface-container-lowest border border-outline-variant flex items-center justify-center overflow-hidden">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-12 h-12 cursor-pointer border-none"
                  />
                </div>
                <input
                  type="text"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="bg-surface-container-lowest border-none text-foreground font-mono text-sm rounded-lg w-full focus:ring-1 focus:ring-primary py-3 px-4 outline-none"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Icon Radius</label>
              <input
                type="range"
                min={0}
                max={100}
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-[10px] font-bold text-foreground/40">
                <span>SHARP</span>
                <span>CIRCLE</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!file || processing}
            className="w-full py-5 bg-gradient-to-br from-primary to-primary-container text-on-primary font-black uppercase tracking-widest rounded-xl shadow-[0_20px_40px_-12px_hsla(82,98%,72%,0.3)] hover:translate-y-[-2px] active:translate-y-0 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {processing ? (
              <>
                <span className="material-symbols-outlined animate-spin">progress_activity</span>
                Generating...
              </>
            ) : (
              "Process & Generate Package"
            )}
          </button>

          <CountdownDownload
            downloadUrl={result?.url || null}
            fileName={result?.fileName || "favicon-package.zip"}
            onExpired={() => {
              if (result?.url) URL.revokeObjectURL(result.url);
              setResult(null);
            }}
          />
        </div>

        {/* Right: Preview */}
        <div className="lg:col-span-7">
          <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-8 md:p-10 overflow-hidden relative">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 blur-[100px] rounded-full" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-secondary/10 blur-[100px] rounded-full" />

            <div className="relative flex items-center justify-between mb-12">
              <h3 className="text-2xl font-headline font-bold tracking-tight">
                Technical <span className="text-primary">Output</span>
              </h3>
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-outline-variant/30" />
                <div className="w-3 h-3 rounded-full bg-outline-variant/30" />
                <div className="w-3 h-3 rounded-full bg-outline-variant/30" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
              {/* Desktop */}
              <div className="bg-surface-container-high p-6 rounded-xl group hover:bg-surface-container-highest transition-all">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-secondary-container/20 rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-secondary">desktop_windows</span>
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Desktop</p>
                    <p className="font-bold text-sm">favicon.ico (16/32/48px)</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-surface-container p-4 rounded-lg">
                  <div className="w-8 h-8 rounded shadow-lg flex items-center justify-center overflow-hidden" style={{ backgroundColor: bgColor, borderRadius: `${(radius / 100) * 4}px` }}>
                    {previewUrl && <img src={previewUrl} alt="icon" className="w-5 h-5 object-contain" />}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="h-2 w-full bg-outline-variant/20 rounded-full" />
                    <div className="h-2 w-2/3 bg-outline-variant/10 rounded-full" />
                  </div>
                </div>
              </div>

              {/* iOS */}
              <div className="bg-surface-container-high p-6 rounded-xl group hover:bg-surface-container-highest transition-all">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-secondary-container/20 rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-secondary">phone_iphone</span>
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant">iOS</p>
                    <p className="font-bold text-sm">apple-touch-icon.png</p>
                  </div>
                </div>
                <div className="aspect-square w-24 mx-auto shadow-2xl overflow-hidden p-3 border-4 border-black/10" style={{ backgroundColor: bgColor, borderRadius: "22%" }}>
                  {previewUrl && <img src={previewUrl} alt="ios icon" className="w-full h-full object-contain" />}
                </div>
                <p className="text-center mt-4 text-[10px] font-bold text-foreground/40">180 x 180 PX</p>
              </div>

              {/* Android */}
              <div className="bg-surface-container-high p-6 rounded-xl group hover:bg-surface-container-highest transition-all">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-secondary-container/20 rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-secondary">android</span>
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Android</p>
                    <p className="font-bold text-sm">android-chrome.png</p>
                  </div>
                </div>
                <div className="aspect-square w-24 rounded-full mx-auto shadow-2xl overflow-hidden p-3 border-4 border-black/10" style={{ backgroundColor: bgColor }}>
                  {previewUrl && <img src={previewUrl} alt="android icon" className="w-full h-full object-contain" />}
                </div>
                <p className="text-center mt-4 text-[10px] font-bold text-foreground/40">512 x 512 PX</p>
              </div>

              {/* Manifest */}
              <div className="bg-surface-container-high p-6 rounded-xl group hover:bg-surface-container-highest transition-all flex flex-col justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-secondary-container/20 rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-secondary">code</span>
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Manifest</p>
                    <p className="font-bold text-sm">site.webmanifest</p>
                  </div>
                </div>
                <div className="mt-6 bg-surface-container-lowest p-4 rounded-lg font-mono text-[10px] text-primary/70 leading-relaxed border border-outline-variant/10">
                  {`{\n  "name": "My App",\n  "icons": [\n    { "src": "/fav.png", ... }\n  ]\n}`}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Favicon;
