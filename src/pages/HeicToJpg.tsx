import { useCallback, useRef, useState, type DragEvent } from "react";
import heic2any from "heic2any";
import SEOHead from "@/components/SEOHead";
import { getSeoProps } from "@/lib/seo";
import ToolSeoSection from "@/components/ToolSeoSection";
import { uploadProcessedFile } from "@/lib/storage";
import CountdownDownload from "@/components/CountdownDownload";
import { toast } from "@/hooks/use-toast";

type OutFormat = "image/jpeg" | "image/png" | "image/webp";

interface ConvertedItem {
  name: string;
  url: string;
  originalSize: number;
  outSize: number;
  previewUrl: string;
}

const MAX_MB = 50;

const isHeicLike = (file: File) => {
  const name = file.name.toLowerCase();
  const t = (file.type || "").toLowerCase();
  return (
    name.endsWith(".heic") ||
    name.endsWith(".heif") ||
    t === "image/heic" ||
    t === "image/heif" ||
    t === "" // Many browsers return empty mime for HEIC
  );
};

const formatBytes = (b: number) => {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(2)} MB`;
};

const HeicToJpg = () => {
  const seo = getSeoProps("/heic-to-jpg")!;
  const inputRef = useRef<HTMLInputElement>(null);
  const [queue, setQueue] = useState<File[]>([]);
  const [results, setResults] = useState<ConvertedItem[]>([]);
  const [quality, setQuality] = useState(92);
  const [format, setFormat] = useState<OutFormat>("image/jpeg");
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const acceptFiles = useCallback((files: File[]) => {
    const ok: File[] = [];
    const skipped: string[] = [];
    for (const f of files) {
      if (f.size > MAX_MB * 1024 * 1024) {
        skipped.push(`${f.name} (too large)`);
        continue;
      }
      if (!isHeicLike(f)) {
        skipped.push(`${f.name} (not HEIC)`);
        continue;
      }
      ok.push(f);
    }
    if (skipped.length) {
      toast({
        title: `${skipped.length} file${skipped.length > 1 ? "s" : ""} skipped`,
        description: skipped.slice(0, 3).join(", "),
        variant: "destructive",
      });
    }
    if (ok.length) {
      setQueue((prev) => [...prev, ...ok]);
      setResults([]);
    }
  }, []);

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    acceptFiles(Array.from(e.dataTransfer.files));
  };

  const ext = format === "image/jpeg" ? "jpg" : format === "image/png" ? "png" : "webp";

  const convertOne = async (file: File): Promise<ConvertedItem> => {
    const converted = await heic2any({
      blob: file,
      toType: format,
      quality: quality / 100,
    });
    const blob = Array.isArray(converted) ? converted[0] : converted;
    const baseName = file.name.replace(/\.(heic|heif)$/i, "");
    const fileName = `${baseName}.${ext}`;
    const url = await uploadProcessedFile(blob, fileName);
    const previewUrl = URL.createObjectURL(blob);
    return {
      name: fileName,
      url,
      originalSize: file.size,
      outSize: blob.size,
      previewUrl,
    };
  };

  const handleConvert = async () => {
    if (!queue.length) return;
    setProcessing(true);
    setProgress({ done: 0, total: queue.length });
    const out: ConvertedItem[] = [];
    for (let i = 0; i < queue.length; i++) {
      try {
        const item = await convertOne(queue[i]);
        out.push(item);
      } catch (err) {
        console.error("[heic-to-jpg] conversion failed", queue[i].name, err);
        toast({
          title: `Couldn't convert ${queue[i].name}`,
          description: err instanceof Error ? err.message : "Unknown error",
          variant: "destructive",
        });
      }
      setProgress({ done: i + 1, total: queue.length });
    }
    setResults(out);
    setProcessing(false);
    setProgress(null);
    if (out.length) {
      toast({
        title: `Converted ${out.length} file${out.length > 1 ? "s" : ""}`,
        description: `Saved as ${ext.toUpperCase()} — ready to download.`,
      });
    }
  };

  const removeFromQueue = (i: number) => {
    setQueue((prev) => prev.filter((_, idx) => idx !== i));
  };

  const clearAll = () => {
    setQueue([]);
    setResults([]);
  };

  const downloadAll = () => {
    results.forEach((r) => {
      const a = document.createElement("a");
      a.href = r.url;
      a.download = r.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
    });
  };

  return (
    <>
      <SEOHead {...seo} />
      <div className="max-w-5xl mx-auto px-6 md:px-8 pt-16 pb-12">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container text-secondary text-xs font-medium mb-5">
            <span className="material-symbols-outlined text-base">image</span>
            iPhone Photos · 100% Private
          </div>
          <h1 className="text-4xl md:text-5xl font-headline font-bold mb-4 leading-tight">
            HEIC to JPG Converter
          </h1>
          <p className="text-lg text-on-surface-variant max-w-2xl">
            Convert iPhone HEIC photos to JPG, PNG or WebP — instantly, in your browser.
            No upload, no signup, no watermark. Batch convert up to {MAX_MB} MB per file.
          </p>
        </div>

        {/* Drop area */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            if (!processing) setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          onClick={() => !processing && inputRef.current?.click()}
          className={`rounded-2xl border-2 border-dashed transition-colors cursor-pointer p-12 text-center ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-outline-variant/40 bg-surface-container hover:bg-surface-container-high"
          } ${processing ? "opacity-60 pointer-events-none" : ""}`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".heic,.heif,image/heic,image/heif"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) acceptFiles(Array.from(e.target.files));
              if (inputRef.current) inputRef.current.value = "";
            }}
          />
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-secondary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-secondary text-3xl">
              upload_file
            </span>
          </div>
          <p className="font-headline text-xl font-bold mb-1">
            Drop HEIC files here, or click to browse
          </p>
          <p className="text-sm text-on-surface-variant">
            .heic & .heif — up to {MAX_MB} MB each — batch supported
          </p>
        </div>

        {/* Options */}
        {(queue.length > 0 || results.length > 0) && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-surface-container rounded-xl p-5">
              <label className="text-xs uppercase tracking-wider text-on-surface-variant font-medium block mb-3">
                Output format
              </label>
              <div className="flex gap-2 flex-wrap">
                {(
                  [
                    { v: "image/jpeg", l: "JPG" },
                    { v: "image/png", l: "PNG" },
                    { v: "image/webp", l: "WebP" },
                  ] as { v: OutFormat; l: string }[]
                ).map((opt) => (
                  <button
                    key={opt.v}
                    type="button"
                    disabled={processing}
                    onClick={() => setFormat(opt.v)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      format === opt.v
                        ? "bg-primary text-primary-foreground"
                        : "bg-surface-container-high hover:bg-surface-container-highest"
                    }`}
                  >
                    {opt.l}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-surface-container rounded-xl p-5">
              <label className="text-xs uppercase tracking-wider text-on-surface-variant font-medium block mb-3">
                Quality: <span className="text-foreground">{quality}%</span>
                {format === "image/png" && (
                  <span className="ml-2 text-on-surface-variant/70 normal-case">
                    (ignored for PNG)
                  </span>
                )}
              </label>
              <input
                type="range"
                min={50}
                max={100}
                step={1}
                value={quality}
                disabled={processing || format === "image/png"}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
          </div>
        )}

        {/* Queue */}
        {queue.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-headline font-bold text-lg">
                Queue ({queue.length})
              </h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={clearAll}
                  disabled={processing}
                  className="px-3 py-1.5 text-sm rounded-lg bg-surface-container-high hover:bg-surface-container-highest disabled:opacity-50"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={handleConvert}
                  disabled={processing}
                  className="px-5 py-1.5 text-sm rounded-lg bg-primary text-primary-foreground font-medium disabled:opacity-50"
                >
                  {processing
                    ? progress
                      ? `Converting ${progress.done}/${progress.total}…`
                      : "Converting…"
                    : `Convert ${queue.length} file${queue.length > 1 ? "s" : ""}`}
                </button>
              </div>
            </div>
            <ul className="space-y-2">
              {queue.map((f, i) => (
                <li
                  key={`${f.name}-${i}`}
                  className="flex items-center justify-between bg-surface-container rounded-lg px-4 py-3"
                >
                  <div className="min-w-0 flex-1 mr-3">
                    <p className="font-medium truncate">{f.name}</p>
                    <p className="text-xs text-on-surface-variant">
                      {formatBytes(f.size)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFromQueue(i)}
                    disabled={processing}
                    className="text-on-surface-variant hover:text-foreground disabled:opacity-50"
                    aria-label={`Remove ${f.name}`}
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="mt-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-headline font-bold text-lg">
                Converted ({results.length})
              </h2>
              {results.length > 1 && (
                <button
                  type="button"
                  onClick={downloadAll}
                  className="px-5 py-1.5 text-sm rounded-lg bg-secondary text-secondary-foreground font-medium"
                >
                  Download all
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((r) => {
                const savings = r.originalSize
                  ? Math.round(((r.originalSize - r.outSize) / r.originalSize) * 100)
                  : 0;
                return (
                  <div
                    key={r.name}
                    className="bg-surface-container rounded-xl overflow-hidden"
                  >
                    <div className="aspect-square bg-surface-container-high overflow-hidden">
                      <img
                        src={r.previewUrl}
                        alt={r.name}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <p className="font-medium truncate text-sm mb-1">{r.name}</p>
                      <p className="text-xs text-on-surface-variant mb-3">
                        {formatBytes(r.originalSize)} → {formatBytes(r.outSize)}
                        {savings > 0 && (
                          <span className="text-secondary ml-1">
                            (−{savings}%)
                          </span>
                        )}
                      </p>
                      <CountdownDownload url={r.url} fileName={r.name} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <ToolSeoSection path="/heic-to-jpg" />
    </>
  );
};

export default HeicToJpg;
