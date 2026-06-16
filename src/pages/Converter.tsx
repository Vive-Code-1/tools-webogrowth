import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import JSZip from "jszip";
import DropZone from "@/components/DropZone";
import SEOHead from "@/components/SEOHead";
import { getSeoProps } from "@/lib/seo";
import ToolSeoSection from "@/components/ToolSeoSection";
import { toast } from "@/hooks/use-toast";
import {
  convertImage,
  convertImageToTargetSize,
  formatExtension,
  type ImageFormat,
} from "@/lib/imageConvert";
import { uploadToStorage, deleteFromStorage } from "@/lib/processedStorage";
import { runWithConcurrency } from "@/lib/concurrency";

const CONCURRENCY = 3;

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
  estSize?: number;
  progress?: number; // 0-100
  reachedTarget?: boolean;
  error?: string;
}

const fmtKB = (n: number) => `${(n / 1024).toFixed(1)} KB`;
const COUNTDOWN_SECONDS = 300;

const Converter = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [targetFormat, setTargetFormat] = useState<ImageFormat>("image/webp");
  const [quality, setQuality] = useState(85);
  const [limitSize, setLimitSize] = useState(false);
  const [targetKB, setTargetKB] = useState<number>(200);
  const [processing, setProcessing] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const dragStartY = useRef<number | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);


  // Esc to close sheet on mobile
  useEffect(() => {
    if (!sheetOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSheetOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sheetOpen]);

  const onSheetTouchStart = (e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY;
    setDragOffset(0);
  };
  const onSheetTouchMove = (e: React.TouchEvent) => {
    if (dragStartY.current == null) return;
    const dy = e.touches[0].clientY - dragStartY.current;
    // When open, allow drag down; when closed, allow drag up (negative)
    if (sheetOpen) setDragOffset(Math.max(0, dy));
    else setDragOffset(Math.min(0, dy));
  };
  const onSheetTouchEnd = () => {
    const dy = dragOffset;
    dragStartY.current = null;
    setDragOffset(0);
    if (sheetOpen && dy > 60) setSheetOpen(false);
    else if (!sheetOpen && dy < -40) setSheetOpen(true);
  };

  // ZIP download countdown
  const [zipUrl, setZipUrl] = useState<string | null>(null);
  const [zipName, setZipName] = useState<string>("");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [expired, setExpired] = useState(false);
  const zipUrlRef = useRef<string | null>(null);
  const storagePathRef = useRef<string | null>(null);

  // Auto-collapse on conversion start, auto-expand when result ready / expired (mobile only)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(min-width: 1024px)").matches) return;
    if (processing) setSheetOpen(false);
  }, [processing]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(min-width: 1024px)").matches) return;
    if (zipUrl || expired) setSheetOpen(true);
  }, [zipUrl, expired]);



  const clearDownload = useCallback(() => {
    if (zipUrlRef.current && zipUrlRef.current.startsWith("blob:")) {
      URL.revokeObjectURL(zipUrlRef.current);
    }
    if (storagePathRef.current) {
      // Fire-and-forget server-side deletion
      deleteFromStorage(storagePathRef.current);
      storagePathRef.current = null;
    }
    zipUrlRef.current = null;
  }, []);

  // Tick countdown
  useEffect(() => {
    if (!zipUrl || expired) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(id);
          setExpired(true);
          clearDownload();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [zipUrl, expired, clearDownload]);

  // Cleanup on unmount
  useEffect(() => () => clearDownload(), [clearDownload]);

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

  const clearAll = () => {
    setItems([]);
    clearDownload();
    setZipUrl(null);
    setExpired(false);
  };

  const updateItem = (id: string, patch: Partial<Item>) =>
    setItems((p) => p.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  const handleConvertAll = useCallback(
    async (opts: { redoAll?: boolean } = {}) => {
      if (!items.length) return;
      if (limitSize && (!targetKB || targetKB < 1)) {
        toast({
          title: "Invalid target size",
          description: "Target size must be at least 1 KB.",
          variant: "destructive",
        });
        return;
      }
      setProcessing(true);
      // reset prior zip / storage
      clearDownload();
      setZipUrl(null);
      setExpired(false);

      // Reset items to queued so progress UI is fresh
      const targets = opts.redoAll
        ? items
        : items.filter((i) => i.status !== "done");

      setItems((prev) =>
        prev.map((i) =>
          targets.find((t) => t.id === i.id)
            ? {
                ...i,
                status: "queued",
                error: undefined,
                progress: 0,
                estSize: undefined,
                outBlob: undefined,
                outSize: undefined,
                outName: undefined,
                reachedTarget: undefined,
              }
            : i,
        ),
      );

      let missed = 0;
      let failed = 0;

      await runWithConcurrency(targets, CONCURRENCY, async (it) => {
        updateItem(it.id, { status: "converting", progress: 0 });
        try {
          const baseName = it.file.name.replace(/\.[^.]+$/, "");
          if (limitSize && targetKB > 0) {
            const r = await convertImageToTargetSize(it.file, {
              format: targetFormat,
              targetKB,
              onProgress: ({ estimatedSize, step, totalSteps }) => {
                updateItem(it.id, {
                  estSize: estimatedSize,
                  progress: Math.round((step / totalSteps) * 100),
                });
              },
            });
            const ext = formatExtension(r.format);
            if (!r.reachedTarget) missed++;
            updateItem(it.id, {
              status: "done",
              outBlob: r.blob,
              outName: `${baseName}.${ext}`,
              outSize: r.blob.size,
              reachedTarget: r.reachedTarget,
              progress: 100,
              error: r.reachedTarget ? undefined : `Could not fit ${targetKB} KB limit`,
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
              progress: 100,
            });
          }
        } catch (e) {
          failed++;
          updateItem(it.id, {
            status: "failed",
            error: e instanceof Error ? e.message : "Conversion failed",
          });
        }
      });

      setProcessing(false);

      if (failed) {
        toast({
          title: `${failed} image${failed > 1 ? "s" : ""} failed`,
          description: "Check the queue for details.",
          variant: "destructive",
        });
      }
      if (missed) {
        toast({
          title: `${missed} image${missed > 1 ? "s" : ""} exceeded target`,
          description: `Couldn't compress to ${targetKB} KB even at lowest quality.`,
          variant: "destructive",
        });
      }
    },
    [items, limitSize, targetKB, targetFormat, quality, clearDownload],
  );

  const handleConvertAgain = useCallback(() => {
    setExpired(false);
    clearDownload();
    setZipUrl(null);
    handleConvertAll({ redoAll: true });
  }, [handleConvertAll, clearDownload]);

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

  const [preparing, setPreparing] = useState(false);

  const publishBlob = async (blob: Blob, fileName: string) => {
    try {
      const remote = await uploadToStorage(blob, fileName);
      zipUrlRef.current = remote.url;
      storagePathRef.current = remote.path;
      setZipName(fileName);
      setZipUrl(remote.url);
    } catch (e) {
      console.warn("Storage upload failed, using local blob URL:", e);
      const url = URL.createObjectURL(blob);
      zipUrlRef.current = url;
      storagePathRef.current = null;
      setZipName(fileName);
      setZipUrl(url);
      toast({
        title: "Using local download",
        description: "Cloud storage unavailable — download stays in your browser only.",
      });
    }
    setSecondsLeft(COUNTDOWN_SECONDS);
    setExpired(false);
  };

  const prepareZip = async () => {
    if (!doneItems.length) return;
    setPreparing(true);
    try {
      if (doneItems.length === 1) {
        const it = doneItems[0];
        await publishBlob(it.outBlob!, it.outName!);
        return;
      }
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
      await publishBlob(blob, `converted-images-${Date.now()}.zip`);
    } finally {
      setPreparing(false);
    }
  };

  const triggerDownload = async () => {
    if (expired || !zipUrl) {
      toast({
        title: "Download window expired",
        description: "Please reconvert your images to download again.",
        variant: "destructive",
      });
      return;
    }
    try {
      const resp = await fetch(zipUrl);
      const blob = await resp.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = zipName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
    } catch {
      const a = document.createElement("a");
      a.href = zipUrl;
      a.download = zipName;
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  };

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");
  const progressPct = (secondsLeft / COUNTDOWN_SECONDS) * 100;

  return (
    <>
      <SEOHead {...getSeoProps("/converter")!} />
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-12 lg:py-20 pb-32 lg:pb-20">
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
          <div className="lg:col-span-8 space-y-4 flex flex-col">
            <DropZone
              multiple
              onFilesSelect={handleFilesSelect}
              accept="image/png,image/jpeg,image/webp,image/gif"
              label="Drop your media here"
              sublabel="Bulk upload — PNG, JPEG, WebP, GIF up to 50MB each"
              maxSizeMB={50}
              processing={processing}
              hasFiles={items.length > 0}
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
                  {items.map((it) => {
                    const overTarget =
                      limitSize && it.estSize != null && it.estSize > targetKB * 1024;
                    return (
                      <li
                        key={it.id}
                        className="flex flex-col gap-2 bg-surface-container rounded-lg p-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-primary">
                            image
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-bold truncate">
                              {it.file.name}
                            </div>
                            <div className="text-xs text-on-surface-variant">
                              {fmtKB(it.file.size)}
                              {it.status === "converting" && it.estSize != null && (
                                <>
                                  {" → est. "}
                                  <span className={overTarget ? "text-amber-400" : "text-primary"}>
                                    {fmtKB(it.estSize)}
                                  </span>
                                </>
                              )}
                              {it.outSize != null && it.status === "done" && (
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
                              <span className="text-primary">{it.progress ?? 0}%</span>
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
                        </div>
                        {(it.status === "converting" || it.status === "done") && (
                          <div className="w-full h-1 bg-surface-container-highest rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all duration-300 rounded-full"
                              style={{ width: `${it.progress ?? 0}%` }}
                            />
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

          <div className="fixed inset-x-0 bottom-0 z-40 lg:relative lg:inset-auto lg:bottom-auto lg:col-span-4 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
            <div className={`bg-surface-container-high lg:rounded-xl rounded-t-2xl shadow-2xl lg:shadow-2xl border-t border-outline-variant/20 lg:border-0 transition-[max-height] duration-300 ease-out overflow-hidden lg:overflow-visible lg:max-h-none ${sheetOpen ? "max-h-[85vh]" : "max-h-[64px]"}`}>
              <button
                type="button"
                onClick={() => setSheetOpen((o) => !o)}
                className="lg:hidden w-full flex items-center justify-between px-5 py-4 border-b border-outline-variant/20"
                aria-expanded={sheetOpen}
              >
                <span className="flex items-center gap-2 font-headline font-bold">
                  <span className="material-symbols-outlined text-primary">tune</span>
                  Conversion Options
                  {items.length > 0 && (
                    <span className="ml-1 text-xs px-2 py-0.5 bg-primary/20 text-primary rounded-full">
                      {items.length}
                    </span>
                  )}
                </span>
                <span className={`material-symbols-outlined transition-transform ${sheetOpen ? "rotate-180" : ""}`}>
                  expand_less
                </span>
              </button>
            <div className={`lg:block lg:max-h-none lg:overflow-visible overflow-y-auto p-8 space-y-6 ${sheetOpen ? "max-h-[calc(85vh-64px)]" : "max-h-0 p-0 lg:p-8"}`}>
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
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <span className="relative inline-flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={limitSize}
                      onChange={(e) => setLimitSize(e.target.checked)}
                      className="peer appearance-none w-5 h-5 rounded-full border-2 border-primary bg-surface-container-lowest checked:bg-primary cursor-pointer transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    />
                    <span className="pointer-events-none absolute inset-0 hidden peer-checked:flex items-center justify-center text-on-primary">
                      <svg viewBox="0 0 16 16" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3,8 7,12 13,4" />
                      </svg>
                    </span>
                  </span>
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
                onClick={() => handleConvertAll()}
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

              {doneItems.length > 0 && !zipUrl && !expired && (
                <button
                  onClick={prepareZip}
                  disabled={preparing}
                  className="w-full bg-surface-container-lowest border border-primary/40 text-primary py-4 rounded-xl font-bold transition-all active:scale-95 hover:bg-primary/10 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  <span className={`material-symbols-outlined ${preparing ? "animate-spin" : ""}`}>
                    {preparing ? "progress_activity" : "folder_zip"}
                  </span>
                  {preparing
                    ? "Uploading..."
                    : doneItems.length > 1
                      ? `Prepare ZIP (${doneItems.length})`
                      : "Prepare Download"}
                </button>
              )}

              {zipUrl && !expired && (
                <div className="bg-surface-container rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">timer</span>
                      <span className="font-headline font-bold text-lg">{mm}:{ss}</span>
                    </div>
                    <span className="text-xs text-on-surface-variant uppercase tracking-widest font-bold">
                      {storagePathRef.current ? "Cloud" : "Local"}
                    </span>
                  </div>
                  <div className="w-full h-1 bg-surface-container-highest rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-1000 rounded-full"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <button
                    onClick={triggerDownload}
                    className="w-full bg-primary text-on-primary py-4 rounded-lg font-bold flex items-center justify-center gap-3 active:scale-95 hover:shadow-[0_0_20px_hsla(82,98%,72%,0.3)]"
                  >
                    <span className="material-symbols-outlined">download</span>
                    Download {doneItems.length > 1 ? "ZIP" : "File"}
                  </button>
                  <p className="text-[11px] text-on-surface-variant text-center">
                    File auto-deletes from cloud in {mm}:{ss}
                  </p>
                </div>
              )}

              {expired && (
                <div className="bg-destructive/10 border border-destructive/40 rounded-xl p-5 text-center space-y-3">
                  <span className="material-symbols-outlined text-destructive text-3xl">timer_off</span>
                  <h4 className="font-headline font-bold text-destructive">Download window expired</h4>
                  <p className="text-xs text-on-surface-variant">
                    File has been deleted from cloud storage. Reconvert to download again.
                  </p>
                  <button
                    onClick={handleConvertAgain}
                    disabled={processing || !items.length}
                    className="w-full bg-primary text-on-primary py-3 rounded-lg font-bold flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined">refresh</span>
                    আবার কনভার্ট করুন
                  </button>
                </div>
              )}
            </div>
            </div>
          </div>
        </div>
      </div>

      <ToolSeoSection path="/converter" />
    </>
  );
};

export default Converter;
