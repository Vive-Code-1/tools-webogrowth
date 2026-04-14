import { useState, useCallback } from "react";
import DropZone from "@/components/DropZone";
import CountdownDownload from "@/components/CountdownDownload";
import { uploadProcessedFile } from "@/lib/storage";
import SEOHead from "@/components/SEOHead";

const formats = [
  { value: "image/webp", label: "WebP (Optimized)" },
  { value: "image/png", label: "PNG (Lossless)" },
  { value: "image/jpeg", label: "JPG (Compressed)" },
];

const Converter = () => {
  const [file, setFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState("image/webp");
  const [quality, setQuality] = useState(85);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ url: string; fileName: string } | null>(null);

  const handleFileSelect = useCallback((f: File) => {
    setFile(f);
    setResult(null);
  }, []);

  const handleConvert = useCallback(async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const img = new Image();
      const loadPromise = new Promise<void>((resolve) => { img.onload = () => resolve(); });
      img.src = URL.createObjectURL(file);
      await loadPromise;

      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), targetFormat, quality / 100);
      });

      const ext = targetFormat === "image/webp" ? "webp" : targetFormat === "image/png" ? "png" : "jpg";
      const fileName = `converted_${file.name.split(".")[0]}.${ext}`;

      // Upload to Supabase storage
      const url = await uploadProcessedFile(blob, fileName);
      setResult({ url, fileName });
    } catch (err) {
      console.error("Conversion failed:", err);
    } finally {
      setProcessing(false);
    }
  }, [file, targetFormat, quality]);

  return (
    <>
    <SEOHead
      title="Image Format Converter - Convert PNG to WebP, JPEG Online Free | WeboGrowth"
      description="Convert images between PNG, WebP, and JPEG formats online for free. High-quality format conversion with no upload required."
      keywords="convert image format online, png to webp, jpeg to webp, image converter free, webp converter"
      canonicalPath="/converter"
    />
    <div className="max-w-7xl mx-auto px-6 md:px-8 py-12 lg:py-20">
      <header className="mb-16">
        <div className="inline-block px-3 py-1 bg-surface-container-highest rounded-full mb-6">
          <span className="font-label text-sm tracking-wide uppercase text-primary font-bold">Image Processing Unit</span>
        </div>
        <h1 className="font-headline text-4xl md:text-6xl lg:text-8xl font-bold tracking-tighter leading-tight mb-6">
          Format <span className="gradient-text">Converter</span>
        </h1>
        <p className="text-on-surface-variant max-w-2xl text-lg font-light leading-relaxed">
          Transform your assets with laboratory precision. High-fidelity output for WebP, PNG, and JPG.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8">
          <DropZone
            onFileSelect={handleFileSelect}
            accept="image/png,image/jpeg,image/webp,image/gif"
            label="Drop your media here"
            sublabel="Supports PNG, JPEG, WebP, and GIF up to 50MB"
            maxSizeMB={50}
          />
          {file && (
            <div className="mt-4 bg-surface-container-low rounded-xl p-4 flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">image</span>
              <span className="text-sm font-bold truncate">{file.name}</span>
              <span className="text-xs text-on-surface-variant ml-auto">
                {(file.size / 1024).toFixed(1)} KB
              </span>
            </div>
          )}
        </div>

        <div className="lg:col-span-4 sticky top-24 space-y-6">
          <div className="bg-surface-container-high rounded-xl p-8 shadow-2xl space-y-6">
            <h3 className="font-headline text-xl font-bold">Conversion Options</h3>
            <div>
              <label className="block font-label text-sm tracking-wide uppercase text-on-surface-variant mb-3 font-bold">
                Convert To
              </label>
              <select
                value={targetFormat}
                onChange={(e) => setTargetFormat(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl py-4 px-6 text-foreground appearance-none focus:ring-1 focus:ring-primary focus:border-primary outline-none cursor-pointer"
              >
                {formats.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-label text-sm tracking-wide uppercase text-on-surface-variant mb-3 font-bold">
                Quality Precision
              </label>
              <input
                type="range"
                min={10}
                max={100}
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full h-1 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between mt-2 text-xs font-bold text-on-surface-variant">
                <span>Lesser</span>
                <span className="text-primary">{quality}%</span>
                <span>Ultra</span>
              </div>
            </div>
            <button
              onClick={handleConvert}
              disabled={!file || processing}
              className="w-full bg-primary text-on-primary py-5 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 hover:shadow-[0_0_15px_hsla(82,98%,72%,0.2)]"
            >
              {processing ? (
                <>
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  Converting...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">autorenew</span>
                  Convert
                </>
              )}
            </button>
          </div>

          <CountdownDownload
            downloadUrl={result?.url || null}
            fileName={result?.fileName || "converted.webp"}
            onExpired={() => {
              setResult(null);
              setFile(null);
            }}
          />
        </div>
      </div>
    </div>
    </>
  );
};

export default Converter;
