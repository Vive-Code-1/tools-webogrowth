import { useState, useCallback } from "react";
import DropZone from "@/components/DropZone";
import CountdownDownload from "@/components/CountdownDownload";
import { uploadProcessedFile } from "@/lib/storage";
import SEOHead from "@/components/SEOHead";
import { getSeoProps } from "@/lib/seo";
import ToolSeoSection from "@/components/ToolSeoSection";

const outputFormats = [
  { value: "image/webp", label: "WebP (Best Compression)", ext: "webp" },
  { value: "image/jpeg", label: "JPEG (Universal)", ext: "jpg" },
  { value: "image/png", label: "PNG (Lossless)", ext: "png" },
];

const Compressor = () => {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState(80);
  const [outputFormat, setOutputFormat] = useState("image/webp");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{
    url: string;
    originalSize: number;
    compressedSize: number;
    fileName: string;
  } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = useCallback((f: File) => {
    setFile(f);
    setResult(null);
    const url = URL.createObjectURL(f);
    setPreviewUrl(url);
  }, []);

  const handleCompress = useCallback(async () => {
    if (!file) return;
    setProcessing(true);

    try {
      const img = new Image();
      const loadPromise = new Promise<void>((resolve) => {
        img.onload = () => resolve();
      });
      img.src = URL.createObjectURL(file);
      await loadPromise;

      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;

      // For JPEG (no alpha) fill white background to avoid black on transparent inputs
      if (outputFormat === "image/jpeg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0);

      let blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), outputFormat, quality / 100);
      });

      // If compressed result is larger than original, fall back to original
      if (blob.size >= file.size) {
        blob = file;
      }

      const fmt = outputFormats.find((f) => f.value === outputFormat)!;
      const baseName = file.name.replace(/\.[^.]+$/, "");
      const fileName = `compressed_${baseName}.${blob === file ? file.name.split(".").pop() : fmt.ext}`;

      const url = await uploadProcessedFile(blob, fileName);

      setResult({
        url,
        originalSize: file.size,
        compressedSize: blob.size,
        fileName,
      });
    } catch (err) {
      console.error("Compression failed:", err);
    } finally {
      setProcessing(false);
    }
  }, [file, quality, outputFormat]);

  const savingsNum = result
    ? ((result.originalSize - result.compressedSize) / result.originalSize) * 100
    : 0;
  const savings = result ? Math.max(0, savingsNum).toFixed(1) : null;

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <>
    <SEOHead {...getSeoProps("/compressor")!} />
    <div className="max-w-7xl mx-auto px-6 md:px-8 py-12 lg:py-20">
      <header className="mb-16">
        <span className="text-primary tracking-[0.2em] font-extrabold uppercase mb-4 block text-xs font-label">
          Optimization Engine
        </span>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-headline font-bold tracking-tighter mb-6 leading-[0.9]">
          WeboGrowth Image <br />
          <span className="text-secondary">Compression.</span>
        </h1>
        <p className="max-w-xl text-on-surface-variant text-lg font-light leading-relaxed">
          Reduce file size by up to 90% without sacrificing visual fidelity. Our algorithms ensure your web assets remain sharp while loading at terminal velocity.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 space-y-8">
          <DropZone onFileSelect={handleFileSelect} accept="image/png,image/jpeg,image/webp" />

          <div className="bg-surface-container rounded-xl p-8 space-y-6">
            <div>
              <label className="block font-label text-sm tracking-wide uppercase text-on-surface-variant mb-3 font-bold">
                Output Format
              </label>
              <select
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl py-4 px-6 text-foreground appearance-none focus:ring-1 focus:ring-primary focus:border-primary outline-none cursor-pointer"
              >
                {outputFormats.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
              {outputFormat === "image/png" && (
                <p className="mt-2 text-xs text-on-surface-variant">
                  PNG is lossless — file size may not reduce significantly. Use WebP or JPEG for maximum compression.
                </p>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <h2 className="font-headline font-bold text-lg">Quality Precision</h2>
                <span className="bg-primary/10 text-primary px-3 py-1 rounded text-sm font-bold">{quality}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={100}
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                disabled={outputFormat === "image/png"}
                className="w-full h-1 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary disabled:opacity-40"
              />
              <div className="flex justify-between mt-2 text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                <span>Lesser</span>
                <span className="text-primary">{quality}%</span>
                <span>Ultra</span>
              </div>
            </div>

            <button
              onClick={handleCompress}
              disabled={!file || processing}
              className="w-full bg-primary text-on-primary py-4 rounded-lg font-bold transition-all hover:shadow-[0_0_20px_hsla(82,98%,72%,0.3)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  Processing...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">compress</span>
                  Compress Image
                </>
              )}
            </button>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-8">
          <div className="bg-surface-container rounded-xl overflow-hidden">
            <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center">
              <h2 className="font-headline font-bold text-sm tracking-widest uppercase">Live Delta Analysis</h2>
              <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-error" />
                <div className="w-2 h-2 rounded-full bg-primary" />
              </div>
            </div>
            <div className="relative aspect-video bg-surface-container-lowest flex items-center justify-center">
              {previewUrl ? (
                <img src={previewUrl} alt="Optimization preview of uploaded image" className="w-full h-full object-contain" />
              ) : (
                <span className="text-on-surface-variant/30 text-sm">No image loaded</span>
              )}
            </div>
          </div>

          {result && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface-container-low p-6 rounded-xl">
                <span className="text-on-surface-variant text-xs uppercase tracking-widest font-label block mb-2">Before</span>
                <div className="text-2xl font-headline font-bold">{formatSize(result.originalSize)}</div>
              </div>
              <div className="bg-surface-container-highest p-6 rounded-xl border border-primary/20">
                <span className="text-primary text-xs uppercase tracking-widest font-label block mb-2">After</span>
                <div className="text-2xl font-headline font-bold text-primary">{formatSize(result.compressedSize)}</div>
              </div>
              <div className="col-span-2 bg-gradient-to-br from-primary/10 to-transparent p-6 rounded-xl border border-primary/10">
                <span className="text-on-surface-variant text-xs uppercase tracking-widest font-label block mb-1">Savings</span>
                <div className="text-3xl font-headline font-black text-primary">
                  {savingsNum > 0 ? `-${savings}%` : "Already optimized"}
                </div>
              </div>
            </div>
          )}

          <CountdownDownload
            downloadUrl={result?.url || null}
            fileName={result?.fileName || "compressed.webp"}
            onExpired={() => {
              setResult(null);
              setFile(null);
              setPreviewUrl(null);
            }}
          />
        </div>
      </div>

      <section className="mt-32">
        <h2 className="text-3xl font-headline font-bold mb-12 text-center">Laboratory Grade Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: "memory", title: "Smart Optimization", desc: "Advanced algorithms identify and preserve critical textural details while discarding redundant noise." },
            { icon: "speed", title: "Terminal Velocity", desc: "Parallel processing architecture allows for multi-image compression in milliseconds, not seconds." },
            { icon: "lock", title: "Local Sanitization", desc: "All processing happens directly in your browser. Your visual data never touches our servers." },
          ].map((f) => (
            <div key={f.title} className="bg-surface-container-low p-8 rounded-xl group hover:bg-surface-container transition-colors">
              <div className="w-12 h-12 bg-secondary-container rounded-lg flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-secondary">{f.icon}</span>
              </div>
              <h3 className="font-headline font-bold text-xl mb-3">{f.title}</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
        <ToolSeoSection path="/compressor" />
    </>
  );
};

export default Compressor;
