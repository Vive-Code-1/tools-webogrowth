import { useState, useCallback } from "react";
import CountdownDownload from "@/components/CountdownDownload";
import { uploadProcessedFile } from "@/lib/storage";
import SEOHead from "@/components/SEOHead";

function optimizeSvg(svgString: string): string {
  let optimized = svgString;
  optimized = optimized.replace(/<!--[\s\S]*?-->/g, "");
  optimized = optimized.replace(/<metadata[\s\S]*?<\/metadata>/gi, "");
  optimized = optimized.replace(/<desc[\s\S]*?<\/desc>/gi, "");
  optimized = optimized.replace(/<title[\s\S]*?<\/title>/gi, "");
  optimized = optimized.replace(/<g>\s*<\/g>/g, "");
  optimized = optimized.replace(/\s+(xmlns:[\w]+="[^"]*")/g, (match, p1) => {
    if (p1.includes('xmlns:svg') || p1 === 'xmlns="http://www.w3.org/2000/svg"') return match;
    if (p1.includes('xmlns:xlink')) return match;
    return "";
  });
  optimized = optimized.replace(/\s+data-[\w-]+="[^"]*"/g, "");
  optimized = optimized.replace(/\s+(inkscape|sodipodi|sketch|illustrator)[\w:]*="[^"]*"/gi, "");
  optimized = optimized.replace(/\s+/g, " ").trim();
  optimized = optimized.replace(/>\s+</g, "><");
  return optimized;
}

const SvgOptimizer = () => {
  const [originalSvg, setOriginalSvg] = useState("");
  const [optimizedSvg, setOptimizedSvg] = useState("");
  const [result, setResult] = useState<{ url: string; fileName: string } | null>(null);
  const [fileName, setFileName] = useState("optimized.svg");
  const [processing, setProcessing] = useState(false);

  const handleFileSelect = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".svg";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        const content = reader.result as string;
        setOriginalSvg(content);
        setOptimizedSvg("");
        setResult(null);
      };
      reader.readAsText(file);
    };
    input.click();
  }, []);

  const handlePaste = useCallback((text: string) => {
    setOriginalSvg(text);
    setOptimizedSvg("");
    setResult(null);
  }, []);

  const handleOptimize = useCallback(async () => {
    if (!originalSvg) return;
    setProcessing(true);
    try {
      const optimized = optimizeSvg(originalSvg);
      setOptimizedSvg(optimized);
      const blob = new Blob([optimized], { type: "image/svg+xml" });
      const outputName = `optimized_${fileName}`;
      const url = await uploadProcessedFile(blob, outputName);
      setResult({ url, fileName: outputName });
    } catch (err) {
      console.error("SVG optimization failed:", err);
    } finally {
      setProcessing(false);
    }
  }, [originalSvg, fileName]);

  const originalSize = new Blob([originalSvg]).size;
  const optimizedSize = optimizedSvg ? new Blob([optimizedSvg]).size : 0;
  const savings = originalSize > 0 && optimizedSize > 0
    ? (((originalSize - optimizedSize) / originalSize) * 100).toFixed(1)
    : null;

  return (
    <>
    <SEOHead
      title="SVG Optimizer Online - Minify & Clean SVG Files Free | WeboGrowth"
      description="Optimize and minify SVG files online for free. Remove metadata, clean paths, and reduce SVG file sizes from Figma or Illustrator exports."
      keywords="svg optimizer online, minify svg, clean svg, svg compressor, optimize svg file, svg minifier"
      canonicalPath="/svg-optimizer"
    />
    <div className="max-w-7xl mx-auto px-6 md:px-8 py-12 lg:py-20">
      <header className="mb-16">
        <span className="text-primary tracking-[0.2em] font-extrabold uppercase mb-4 block text-xs font-label">
          Vector Processing
        </span>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-headline font-bold tracking-tighter mb-6 leading-[0.9]">
          SVG Path <br />
          <span className="text-secondary">Optimizer.</span>
        </h1>
        <p className="max-w-xl text-on-surface-variant text-lg font-light leading-relaxed">
          Clean up messy exports. Strip metadata, minify paths, and reduce SVG file sizes dramatically.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-headline font-bold text-sm uppercase tracking-widest">Input SVG</h3>
            <button
              onClick={handleFileSelect}
              className="text-primary text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all"
            >
              <span className="material-symbols-outlined text-sm">upload_file</span>
              Upload File
            </button>
          </div>
          <textarea
            value={originalSvg}
            onChange={(e) => handlePaste(e.target.value)}
            placeholder="Paste your SVG code here or upload a file..."
            className="w-full h-80 bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-6 text-sm font-mono text-foreground placeholder:text-foreground/30 resize-none focus:ring-1 focus:ring-primary outline-none"
          />
          {originalSvg && (
            <div className="text-xs text-on-surface-variant">
              Original size: <span className="text-foreground font-bold">{(originalSize / 1024).toFixed(1)} KB</span>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-headline font-bold text-sm uppercase tracking-widest">Optimized Output</h3>
            {savings && (
              <span className="text-primary text-sm font-bold">-{savings}% reduction</span>
            )}
          </div>
          <div className="w-full h-80 bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-6 text-sm font-mono text-primary/70 overflow-auto">
            {optimizedSvg || <span className="text-foreground/20">Optimized SVG will appear here...</span>}
          </div>
          {optimizedSvg && (
            <div className="text-xs text-on-surface-variant">
              Optimized size: <span className="text-primary font-bold">{(optimizedSize / 1024).toFixed(1)} KB</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center gap-6">
        <button
          onClick={handleOptimize}
          disabled={!originalSvg || processing}
          className="bg-primary text-on-primary px-12 py-4 rounded-xl font-bold transition-all hover:shadow-[0_0_20px_hsla(82,98%,72%,0.3)] active:scale-95 disabled:opacity-50 flex items-center gap-3"
        >
          <span className="material-symbols-outlined">auto_fix_high</span>
          {processing ? "Optimizing..." : "Optimize SVG"}
        </button>

        <div className="w-full max-w-md">
          <CountdownDownload
            downloadUrl={result?.url || null}
            fileName={result?.fileName || "optimized.svg"}
            onExpired={() => {
              setResult(null);
              setOptimizedSvg("");
            }}
          />
        </div>
      </div>

      {originalSvg && (
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-surface-container-low rounded-xl p-8">
            <h4 className="font-headline font-bold text-sm uppercase tracking-widest mb-4 text-on-surface-variant">Original Preview</h4>
            <div className="aspect-square bg-surface-container-lowest rounded-lg flex items-center justify-center p-4"
              dangerouslySetInnerHTML={{ __html: originalSvg }}
            />
          </div>
          {optimizedSvg && (
            <div className="bg-surface-container-low rounded-xl p-8">
              <h4 className="font-headline font-bold text-sm uppercase tracking-widest mb-4 text-primary">Optimized Preview</h4>
              <div className="aspect-square bg-surface-container-lowest rounded-lg flex items-center justify-center p-4"
                dangerouslySetInnerHTML={{ __html: optimizedSvg }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SvgOptimizer;
