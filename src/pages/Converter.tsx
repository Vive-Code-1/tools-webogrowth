import { useCallback, useMemo, useState } from "react";
import JSZip from "jszip";
import DropZone from "@/components/DropZone";
import SEOHead from "@/components/SEOHead";
import { getSeoProps } from "@/lib/seo";
import ToolSeoSection from "@/components/ToolSeoSection";
import {
  convertImage,
  convertImageToTargetSize,
  formatExtension,
  type ImageFormat,
} from "@/lib/imageConvert";

const formats: { value: ImageFormat; label: string }[] = [
  { value: "image/webp", label: "WebP (Optimized)" },
  { value: "image/png", label: "PNG (Lossless)" },
  { value: "image/jpeg", label: "JPG (Compressed)" },
];

type ItemStatus = "queued" | "converting" | "done" | "failed";

interface Item {
  id: string;
  file: File;
  status: ItemStatus;
  outBlob?: Blob;
  outName?: string;
  outSize?: number;
  reachedTarget?: boolean;
  error?: string;
}

const fmtKB = (n: number) => `${(n / 1024).toFixed(1)} KB`;

const Converter = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [targetFormat, setTargetFormat] = useState<ImageFormat>("image/webp");
  const [quality, setQuality] = useState(85);
  const [limitSize, setLimitSize] = useState(false);
  const [targetKB, setTargetKB] = useState<number>(200);
  const [processing, setProcessing] = useState(false);

  const handleFilesSelect = useCallback((files: File[]) => {
    setItems((prev) => [
      ...prev,
      ...files.map((f) => ({
        id: `${f.name}-${f.size}-${Math.random().toString(36).slice(2, 8)}`,
        file: f,
        status: "queued" as ItemStatus,
      })),
    ]);
  }, []);

  const removeItem = (id: string) =>
    setItems((p) => p.filter((i) => i.id !== id));

  const clearAll = () => setItems([]);

  const updateItem = (id: string, patch: Partial<Item>) =>
    setItems((p) => p.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  const handleConvertAll = useCallback(async () => {
    if (!items.length) return;
    setProcessing(true);
    for (const it of items) {
      if (it.status === "done") continue;
      updateItem(it.id, { status: "converting", error: undefined });
      try {
        const baseName = it.file.name.replace(/\.[^.]+$/, "");
        if (limitSize && targetKB > 0) {
          const r = await convertImageToTargetSize(it.file, {
            format: targetFormat,
            targetKB,
          });
          const ext = formatExtension(r.format);
          updateItem(it.id, {
            status: "done",
            outBlob: r.blob,
            outName: `${baseName}.${ext}`,
            outSize: r.blob.size,
            reachedTarget: r.reachedTarget,
          });
        } else {
          const blob = await convertImage(it.file, { format: targetFormat, quality });
          const ext = formatExtension(targetFormat);
          updateItem(it.id, {
            status: "done",
            outBlob: blob,
            outName: `${baseName}.${ext}`,
            outSize: blob.size,
            reachedTarget: true,
          });
        }
      } catch (e) {
        updateItem(it.id, {
          status: "failed",
          error: e instanceof Error ? e.message : "Conversion failed",
        });
      }
    }
    setProcessing(false);
  }, [items, limitSize, targetKB, targetFormat, quality]);

  const doneItems = useMemo(
    () => items.filter((i) => i.status === "done" && i.outBlob),
    [items],
  );

  const downloadOne = (it: Item) => {
    if (!it.outBlob || !it.outName) return;
    const url = URL.createObjectURL(it.outBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = it.outName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  const downloadZip = async () => {
    if (!doneItems.length) return;
    if (doneItems.length === 1) return downloadOne(doneItems[0]);
    const zip = new JSZip();
    const seen = new Map<string, number>();
    for (const it of doneItems) {
      let name = it.outName!;
      const count = seen.get(name) || 0;
      if (count > 0) {
        const dot = name.lastIndexOf(".");
        name = `${name.slice(0, dot)}-${count}${name.slice(dot)}`;
      }
      seen.set(it.outName!, count + 1);
      zip.file(name, it.outBlob!);
    }
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `converted-images-${Date.now()}.zip`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  return (
    <>
      <SEOHead {...getSeoProps("/converter")!} />
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-12 lg:py-20">
        <header className="mb-16">
          <div className="inline-block px-3 py-1 bg-surface-container-highest rounded-full mb-6">
            <span className="font-label text-sm tracking-wide uppercase text-primary font-bold">
              Image Processing Unit
            </span>
          </div>
          <h1 className="font-headline text-4xl md:text-6xl lg:text-8xl font-bold tracking-tighter leading-tight mb-6">
            Format <span className="gradient-text">Converter</span>
          </h1>
          <p className="text-on-surface-variant max-w-2xl text-lg font-light leading-relaxed">
            Bulk convert images with laboratory precision. WebP, PNG, JPG —
            with optional target file size.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-4">
            <DropZone
              multiple
              onFilesSelect={handleFilesSelect}
              accept="image/png,image/jpeg,image/webp,image/gif"
              label="Drop your media here"
              sublabel="Bulk upload — PNG, JPEG, WebP, GIF up to 50MB each"
              maxSizeMB={50}
            />

            {items.length > 0 && (
              <div className="bg-surface-container-low rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm">
                    {items.length} file{items.length > 1 ? "s" : ""} queued
                  </span>
                  <button
                    onClick={clearAll}
                    className="text-xs text-on-surface-variant hover:text-primary"
                  >
                    Clear all
                  </button>
                </div>
                <ul className="space-y-2 max-h-96 overflow-auto">
                  {items.map((it) => (
                    <li
                      key={it.id}
                      className="flex items-center gap-3 bg-surface-container rounded-lg p-3"
                    >
                      <span className="material-symbols-outlined text-primary">
                        image
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-bold truncate">
                          {it.file.name}
                        </div>
                        <div className="text-xs text-on-surface-variant">
                          {fmtKB(it.file.size)}
                          {it.outSize != null && (
                            <>
                              {" → "}
                              <span className="text-primary">
                                {fmtKB(it.outSize)}
                              </span>
                              {it.reachedTarget === false && (
                                <span className="ml-2 text-amber-400">
                                  (target missed)
                                </span>
                              )}
                            </>
                          )}
                          {it.error && (
                            <span className="ml-2 text-red-400">
                              {it.error}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-xs font-bold">
                        {it.status === "converting" && (
                          <span className="material-symbols-outlined animate-spin text-primary">
                            progress_activity
                          </span>
                        )}
                        {it.status === "done" && (
                          <button
                            onClick={() => downloadOne(it)}
                            className="text-primary hover:underline"
                          >
                            Download
                          </button>
                        )}
                        {it.status === "queued" && (
                          <span className="text-on-surface-variant">
                            Queued
                          </span>
                        )}
                        {it.status === "failed" && (
                          <span className="text-red-400">Failed</span>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(it.id)}
                        className="text-on-surface-variant hover:text-red-400"
                        aria-label="Remove"
                      >
                        <span className="material-symbols-outlined text-base">
                          close
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
            <div className="bg-surface-container-high rounded-xl p-8 shadow-2xl space-y-6">
              <h3 className="font-headline text-xl font-bold">
                Conversion Options
              </h3>
              <div>
                <label className="block font-label text-sm tracking-wide uppercase text-on-surface-variant mb-3 font-bold">
                  Convert To
                </label>
                <select
                  value={targetFormat}
                  onChange={(e) => setTargetFormat(e.target.value as ImageFormat)}
                  className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl py-4 px-6 text-foreground appearance-none focus:ring-1 focus:ring-primary focus:border-primary outline-none cursor-pointer"
                >
                  {formats.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>

              {!limitSize && (
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
              )}

              <div className="border-t border-outline-variant/20 pt-5 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={limitSize}
                    onChange={(e) => setLimitSize(e.target.checked)}
                    className="w-4 h-4 accent-primary cursor-pointer"
                  />
                  <span className="font-bold text-sm">Limit file size</span>
                </label>
                {limitSize && (
                  <>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        value={targetKB}
                        onChange={(e) =>
                          setTargetKB(Math.max(1, Number(e.target.value) || 0))
                        }
                        className="flex-1 bg-surface-container-lowest border border-outline-variant/50 rounded-lg py-3 px-4 text-foreground focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                        placeholder="200"
                      />
                      <span className="px-4 py-3 bg-surface-container-lowest border border-outline-variant/50 rounded-lg text-on-surface-variant font-bold">
                        KB
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      Each image will be compressed to stay under{" "}
                      <span className="text-primary font-bold">{targetKB} KB</span>.
                      {targetFormat === "image/png" && (
                        <> PNG can't be lossy-compressed, so JPEG will be used.</>
                      )}
                    </p>
                  </>
                )}
              </div>

              <button
                onClick={handleConvertAll}
                disabled={!items.length || processing}
                className="w-full bg-primary text-on-primary py-5 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 hover:shadow-[0_0_15px_hsla(82,98%,72%,0.2)]"
              >
                {processing ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">
                      progress_activity
                    </span>
                    Converting...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">autorenew</span>
                    Convert {items.length > 0 ? `All (${items.length})` : ""}
                  </>
                )}
              </button>

              {doneItems.length > 0 && (
                <button
                  onClick={downloadZip}
                  className="w-full bg-surface-container-lowest border border-primary/40 text-primary py-4 rounded-xl font-bold transition-all active:scale-95 hover:bg-primary/10 flex items-center justify-center gap-3"
                >
                  <span className="material-symbols-outlined">
                    folder_zip
                  </span>
                  {doneItems.length > 1
                    ? `Download ZIP (${doneItems.length})`
                    : "Download File"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <ToolSeoSection path="/converter" />
    </>
  );
};

export default Converter;
