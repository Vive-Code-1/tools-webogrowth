import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import JSZip from "jszip";
import DropZone from "@/components/DropZone";
import SEOHead from "@/components/SEOHead";
import { getSeoProps } from "@/lib/seo";
import ToolSeoSection from "@/components/ToolSeoSection";
import { toast } from "@/hooks/use-toast";
import { traceToSvg, svgToBlob, type ColorMode, type QualityPreset } from "@/lib/imageToSvg";
import {
  type RGB,
  toHex,
  fromHex,
  avgLuminance,
  extractPaletteFromFile,
} from "@/lib/palette";
import { uploadToStorage, deleteFromStorage } from "@/lib/processedStorage";
import { runWithConcurrency } from "@/lib/concurrency";

const CONCURRENCY = 2;
const COUNTDOWN_SECONDS = 300;

const ICON_SIZES = [16, 24, 32, 48, 64, 128, 256];

type Status = "queued" | "tracing" | "done" | "failed";

interface Item {
  id: string;
  file: File;
  preview: string;
  status: Status;
  svg?: string;
  outName?: string;
  outSize?: number;
  pathCount?: number;
  error?: string;
}

const fmtKB = (n: number) => `${(n / 1024).toFixed(1)} KB`;

const ImageToSvg = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [size, setSize] = useState(64);
  const [colorMode, setColorMode] = useState<ColorMode>("color");
  const [preset, setPreset] = useState<QualityPreset>("icon");
  const [paletteMode, setPaletteMode] = useState<"auto" | "manual">("auto");
  const [colorCount, setColorCount] = useState(16);
  const [lockColors, setLockColors] = useState(true);
  const [detectedPalette, setDetectedPalette] = useState<RGB[]>([]);
  const [detectedLuminance, setDetectedLuminance] = useState(0);
  const [paletteLoading, setPaletteLoading] = useState(false);
  const [manualPalette, setManualPalette] = useState<RGB[]>([]);
  const [smoothing, setSmoothing] = useState(1);
  const [background, setBackground] = useState<"transparent" | "white" | "custom">("transparent");
  const [customBg, setCustomBg] = useState("#ffffff");
  const [zoom, setZoom] = useState(100);
  const [processing, setProcessing] = useState(false);

  const [zipUrl, setZipUrl] = useState<string | null>(null);
  const [zipName, setZipName] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [expired, setExpired] = useState(false);
  const zipUrlRef = useRef<string | null>(null);
  const storagePathRef = useRef<string | null>(null);
  const [preparing, setPreparing] = useState(false);

  // Mobile sheet
  const [sheetOpen, setSheetOpen] = useState(false);
  const dragStartY = useRef<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);

  useEffect(() => {
    if (!sheetOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSheetOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sheetOpen]);

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
      deleteFromStorage(storagePathRef.current);
      storagePathRef.current = null;
    }
    zipUrlRef.current = null;
  }, []);

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

  useEffect(() => () => {
    clearDownload();
    items.forEach((i) => URL.revokeObjectURL(i.preview));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Extract live palette from the first image whenever the queue changes.
  useEffect(() => {
    if (!items.length || colorMode !== "color") {
      setDetectedPalette([]);
      return;
    }
    let cancelled = false;
    const targetCount = Math.max(4, Math.min(24, colorCount));
    setPaletteLoading(true);
    extractPaletteFromFile(items[0].file, targetCount)
      .then((res) => {
        if (cancelled) return;
        setDetectedPalette(res.palette);
        setDetectedLuminance(res.avgLuminance);
        // Seed manual palette the first time the user has nothing yet.
        setManualPalette((prev) => (prev.length ? prev : res.palette));
      })
      .catch(() => {
        if (!cancelled) setDetectedPalette([]);
      })
      .finally(() => {
        if (!cancelled) setPaletteLoading(false);
      });
    return () => { cancelled = true; };
  }, [items, colorMode, colorCount]);

  const handleFilesSelect = useCallback((files: File[]) => {
    setItems((prev) => [
      ...prev,
      ...files.map((f) => ({
        id: `${f.name}-${f.size}-${Math.random().toString(36).slice(2, 8)}`,
        file: f,
        preview: URL.createObjectURL(f),
        status: "queued" as Status,
      })),
    ]);
  }, []);

  const removeItem = (id: string) =>
    setItems((p) => {
      const it = p.find((x) => x.id === id);
      if (it) URL.revokeObjectURL(it.preview);
      return p.filter((i) => i.id !== id);
    });

  const clearAll = () => {
    items.forEach((i) => URL.revokeObjectURL(i.preview));
    setItems([]);
    clearDownload();
    setZipUrl(null);
    setExpired(false);
  };

  const updateItem = (id: string, patch: Partial<Item>) =>
    setItems((p) => p.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  const resolvedBg = background === "transparent" ? "transparent" : background === "white" ? "#ffffff" : customBg;

  const handleConvertAll = useCallback(
    async (opts: { redoAll?: boolean } = {}) => {
      if (!items.length) return;
      setProcessing(true);
      clearDownload();
      setZipUrl(null);
      setExpired(false);

      const targets = opts.redoAll ? items : items.filter((i) => i.status !== "done");
      setItems((prev) =>
        prev.map((i) =>
          targets.find((t) => t.id === i.id)
            ? { ...i, status: "queued", error: undefined, svg: undefined, outName: undefined, outSize: undefined, pathCount: undefined }
            : i,
        ),
      );

      let failed = 0;
      const brightnessShifts: string[] = [];
      const activePalette: RGB[] | undefined =
        colorMode === "color"
          ? paletteMode === "manual" && manualPalette.length >= 2
            ? manualPalette
            : lockColors && detectedPalette.length >= 2
              ? detectedPalette
              : undefined
          : undefined;

      await runWithConcurrency(targets, CONCURRENCY, async (it) => {
        updateItem(it.id, { status: "tracing" });
        try {
          const r = await traceToSvg(it.file, {
            size,
            colorMode,
            preset,
            colorCount: paletteMode === "auto" ? "auto" : colorCount,
            smoothing,
            background: resolvedBg,
            palette: activePalette,
            lockColors: colorMode === "color" ? lockColors || paletteMode === "manual" : true,
          });
          const baseName = it.file.name.replace(/\.[^.]+$/, "");
          updateItem(it.id, {
            status: "done",
            svg: r.svg,
            outName: `${baseName}.svg`,
            outSize: r.size,
            pathCount: r.pathCount,
          });

          // Brightness-shift validator: warn if SVG palette went much darker
          // than the source — typical "everything turned black" failure.
          if (colorMode === "color" && r.sourceLuminance > 80) {
            const outLum = avgLuminance(r.usedPalette);
            if (outLum < r.sourceLuminance * 0.5 && outLum < 70) {
              brightnessShifts.push(it.file.name);
            }
          }
        } catch (e) {
          failed++;
          updateItem(it.id, {
            status: "failed",
            error: e instanceof Error ? e.message : "Trace failed",
          });
        }
      });

      setProcessing(false);
      if (failed) {
        toast({
          title: `${failed} image${failed > 1 ? "s" : ""} failed`,
          description: "Try a different quality preset or color mode.",
          variant: "destructive",
        });
      }
      if (brightnessShifts.length) {
        toast({
          title: "Output looks darker than source",
          description: `${brightnessShifts.length} SVG${brightnessShifts.length > 1 ? "s" : ""} came out much darker. Try “Lock colors”, switch to Manual palette, or raise Color Count, then reconvert.`,
          variant: "destructive",
        });
      }
    },
    [items, size, colorMode, preset, colorCount, paletteMode, manualPalette, lockColors, detectedPalette, smoothing, resolvedBg, clearDownload],
  );

  const handleConvertAgain = useCallback(() => {
    setExpired(false);
    clearDownload();
    setZipUrl(null);
    handleConvertAll({ redoAll: true });
  }, [handleConvertAll, clearDownload]);

  const doneItems = useMemo(() => items.filter((i) => i.status === "done" && i.svg), [items]);

  const downloadOne = (it: Item) => {
    if (!it.svg || !it.outName) return;
    const url = URL.createObjectURL(svgToBlob(it.svg));
    const a = document.createElement("a");
    a.href = url;
    a.download = it.outName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  const copySvg = async (it: Item) => {
    if (!it.svg) return;
    try {
      await navigator.clipboard.writeText(it.svg);
      toast({ title: "Copied SVG to clipboard" });
    } catch {
      toast({ title: "Copy failed", variant: "destructive" });
    }
  };

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
        await publishBlob(svgToBlob(it.svg!), it.outName!);
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
        zip.file(name, it.svg!);
      }
      const blob = await zip.generateAsync({ type: "blob" });
      await publishBlob(blob, `svg-icons-${Date.now()}.zip`);
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

  const onSheetTouchStart = (e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY;
    setDragOffset(0);
  };
  const onSheetTouchMove = (e: React.TouchEvent) => {
    if (dragStartY.current == null) return;
    const dy = e.touches[0].clientY - dragStartY.current;
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

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");
  const progressPct = (secondsLeft / COUNTDOWN_SECONDS) * 100;

  return (
    <>
      <SEOHead {...getSeoProps("/image-to-svg")!} />
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-12 lg:py-20 pb-32 lg:pb-20">
        <header className="mb-16">
          <div className="inline-block px-3 py-1 bg-surface-container-highest rounded-full mb-6">
            <span className="font-label text-sm tracking-wide uppercase text-primary font-bold">
              Vector Engine
            </span>
          </div>
          <h1 className="font-headline text-4xl md:text-6xl lg:text-8xl font-bold tracking-tighter leading-tight mb-6">
            Image to <span className="gradient-text">SVG Icon</span>
          </h1>
          <p className="text-on-surface-variant max-w-2xl text-lg font-light leading-relaxed">
            Convert PNG, JPG or WebP raster images into scalable SVG icons —
            with color or monochrome tracing, standard icon sizes, and bulk download.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-4 flex flex-col">
            <DropZone
              multiple
              onFilesSelect={handleFilesSelect}
              accept="image/png,image/jpeg,image/webp,image/gif,image/bmp"
              label="Drop images to vectorize"
              sublabel="PNG, JPG, WebP, GIF, BMP — up to 10MB each"
              maxSizeMB={10}
              processing={processing}
              hasFiles={items.length > 0}
            />

            {items.length > 0 && (
              <div className="bg-surface-container-low rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm">
                    {items.length} image{items.length > 1 ? "s" : ""} ·{" "}
                    {doneItems.length} done
                  </span>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-xs text-on-surface-variant">
                      Zoom
                      <input
                        type="range"
                        min={50}
                        max={400}
                        step={10}
                        value={zoom}
                        onChange={(e) => setZoom(Number(e.target.value))}
                        className="w-24 accent-primary"
                      />
                      <span className="text-primary font-bold w-10 text-right">{zoom}%</span>
                    </label>
                    <button
                      onClick={clearAll}
                      className="text-xs text-on-surface-variant hover:text-primary"
                    >
                      Clear all
                    </button>
                  </div>
                </div>

                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[640px] overflow-auto">
                  {items.map((it) => (
                    <li
                      key={it.id}
                      className="bg-surface-container rounded-lg p-3 space-y-3"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="material-symbols-outlined text-primary text-base">image</span>
                        <span className="text-xs font-bold truncate flex-1">{it.file.name}</span>
                        <button
                          onClick={() => removeItem(it.id)}
                          className="text-on-surface-variant hover:text-red-400"
                          aria-label="Remove"
                        >
                          <span className="material-symbols-outlined text-base">close</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-surface-container-lowest rounded-md p-2 flex flex-col items-center justify-center min-h-[120px]">
                          <span className="text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Original</span>
                          <img
                            src={it.preview}
                            alt="original"
                            className="max-w-full max-h-[100px] object-contain"
                            style={{ transform: `scale(${zoom / 100})`, transformOrigin: "center" }}
                          />
                        </div>
                        <div
                          className="bg-surface-container-lowest rounded-md p-2 flex flex-col items-center justify-center min-h-[120px]"
                          style={{
                            backgroundImage:
                              resolvedBg === "transparent"
                                ? "linear-gradient(45deg, #2a2a2a 25%, transparent 25%), linear-gradient(-45deg, #2a2a2a 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #2a2a2a 75%), linear-gradient(-45deg, transparent 75%, #2a2a2a 75%)"
                                : undefined,
                            backgroundSize: "12px 12px",
                            backgroundPosition: "0 0, 0 6px, 6px -6px, -6px 0",
                          }}
                        >
                          <span className="text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">SVG</span>
                          {it.status === "tracing" && (
                            <span className="material-symbols-outlined text-primary animate-spin">progress_activity</span>
                          )}
                          {it.status === "queued" && (
                            <span className="text-xs text-on-surface-variant">Queued</span>
                          )}
                          {it.status === "failed" && (
                            <span className="text-xs text-red-400 text-center">{it.error || "Failed"}</span>
                          )}
                          {it.status === "done" && it.svg && (
                            <div
                              className="max-w-full max-h-[100px] flex items-center justify-center"
                              style={{ transform: `scale(${zoom / 100})`, transformOrigin: "center" }}
                              dangerouslySetInnerHTML={{ __html: it.svg }}
                            />
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <div className="text-on-surface-variant space-x-2">
                          <span>{fmtKB(it.file.size)}</span>
                          {it.outSize != null && (
                            <>
                              <span>→</span>
                              <span className="text-primary font-bold">{fmtKB(it.outSize)}</span>
                            </>
                          )}
                          {it.pathCount != null && (
                            <span className="px-1.5 py-0.5 bg-surface-container-highest rounded text-[10px]">
                              {it.pathCount} paths
                            </span>
                          )}
                        </div>
                        {it.status === "done" && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => copySvg(it)}
                              className="text-primary hover:underline font-bold"
                            >
                              Copy
                            </button>
                            <button
                              onClick={() => downloadOne(it)}
                              className="text-primary hover:underline font-bold"
                            >
                              .svg
                            </button>
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Mobile backdrop */}
          <div
            onClick={() => setSheetOpen(false)}
            aria-hidden="true"
            className={`fixed inset-0 z-30 bg-black/40 lg:hidden transition-opacity duration-300 ${
              sheetOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          />
          <div
            role="region"
            aria-label="SVG options"
            className="fixed inset-x-0 bottom-0 z-40 lg:relative lg:inset-auto lg:bottom-auto lg:col-span-4 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto"
            style={{
              transform: dragOffset !== 0 ? `translateY(${dragOffset}px)` : undefined,
              transition: dragStartY.current == null ? "transform 300ms cubic-bezier(0.32, 0.72, 0, 1)" : "none",
            }}
          >
            <div
              className={`bg-surface-container-high lg:rounded-xl rounded-t-2xl shadow-2xl border-t border-outline-variant/20 lg:border-0 transition-[max-height] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] overflow-hidden lg:overflow-visible lg:max-h-none ${
                sheetOpen ? "max-h-[85vh]" : "max-h-[88px]"
              }`}
            >
              <div
                onTouchStart={onSheetTouchStart}
                onTouchMove={onSheetTouchMove}
                onTouchEnd={onSheetTouchEnd}
                className="lg:hidden touch-none"
              >
                <div className="flex justify-center pt-2 pb-1">
                  <span className="w-10 h-1.5 rounded-full bg-outline-variant/50" aria-hidden="true" />
                </div>
                <button
                  type="button"
                  onClick={() => setSheetOpen((o) => !o)}
                  className="w-full flex items-center justify-between px-5 pb-3 pt-1"
                  aria-expanded={sheetOpen}
                >
                  <span className="flex items-center gap-2 font-headline font-bold min-w-0">
                    <span className="material-symbols-outlined text-primary">tune</span>
                    <span className="truncate">SVG Options</span>
                    {items.length > 0 && (
                      <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded-full">
                        {items.length}
                      </span>
                    )}
                  </span>
                  <span className={`material-symbols-outlined transition-transform duration-300 ${sheetOpen ? "rotate-180" : ""}`}>
                    expand_less
                  </span>
                </button>
                {!sheetOpen && (
                  <div className="px-5 pb-3 flex items-center gap-2 overflow-x-auto text-xs">
                    <span className="px-2 py-1 rounded-full bg-surface-container-highest font-bold whitespace-nowrap">
                      {size}px
                    </span>
                    <span className="px-2 py-1 rounded-full bg-surface-container-highest font-bold whitespace-nowrap">
                      {colorMode === "bw" ? "B&W" : colorMode === "grayscale" ? "Gray" : paletteMode === "manual" ? `Manual ${manualPalette.length}` : `Auto ${detectedPalette.length || colorCount}`}
                    </span>
                    <span className="px-2 py-1 rounded-full bg-surface-container-highest font-bold whitespace-nowrap">
                      {preset}
                    </span>
                    {zipUrl && !expired && (
                      <span className="px-2 py-1 rounded-full bg-primary/20 text-primary font-bold whitespace-nowrap">
                        Ready {mm}:{ss}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div
                className={`lg:block lg:max-h-none lg:overflow-visible overflow-y-auto p-8 space-y-6 transition-all duration-300 ${
                  sheetOpen ? "max-h-[calc(85vh-104px)] opacity-100" : "max-h-0 p-0 opacity-0 lg:opacity-100 lg:p-8"
                }`}
              >
                <h3 className="font-headline text-xl font-bold">SVG Options</h3>

                <div>
                  <label className="block font-label text-sm uppercase text-on-surface-variant mb-3 font-bold">
                    Icon Size
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {ICON_SIZES.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSize(s)}
                        className={`py-2 rounded-lg text-xs font-bold transition-all ${
                          size === s
                            ? "bg-primary text-on-primary"
                            : "bg-surface-container-lowest border border-outline-variant/30 text-foreground hover:border-primary/50"
                        }`}
                      >
                        {s}px
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-label text-sm uppercase text-on-surface-variant mb-3 font-bold">
                    Color Mode
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["color", "grayscale", "bw"] as ColorMode[]).map((m) => (
                      <button
                        key={m}
                        onClick={() => setColorMode(m)}
                        className={`py-2 rounded-lg text-xs font-bold transition-all ${
                          colorMode === m
                            ? "bg-primary text-on-primary"
                            : "bg-surface-container-lowest border border-outline-variant/30 hover:border-primary/50"
                        }`}
                      >
                        {m === "bw" ? "B & W" : m === "grayscale" ? "Grayscale" : "Color"}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-label text-sm uppercase text-on-surface-variant mb-3 font-bold">
                    Quality Preset
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["icon", "detailed", "logo"] as QualityPreset[]).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPreset(p)}
                        className={`py-2 rounded-lg text-xs font-bold capitalize transition-all ${
                          preset === p
                            ? "bg-primary text-on-primary"
                            : "bg-surface-container-lowest border border-outline-variant/30 hover:border-primary/50"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {colorMode === "color" && (
                  <div className="space-y-3">
                    <label className="block font-label text-sm uppercase text-on-surface-variant font-bold">
                      Palette Mode
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(["auto", "manual"] as const).map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => {
                            setPaletteMode(m);
                            if (m === "manual" && !manualPalette.length && detectedPalette.length) {
                              setManualPalette(detectedPalette);
                            }
                          }}
                          className={`py-2 rounded-lg text-xs font-bold capitalize transition-all ${
                            paletteMode === m
                              ? "bg-primary text-on-primary"
                              : "bg-surface-container-lowest border border-outline-variant/30 hover:border-primary/50"
                          }`}
                          aria-pressed={paletteMode === m}
                        >
                          {m}
                        </button>
                      ))}
                    </div>

                    {paletteMode === "auto" && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] uppercase tracking-widest text-on-surface-variant font-bold">
                            Max colors
                          </span>
                          <span className="text-primary text-xs font-bold">{colorCount}</span>
                        </div>
                        <input
                          type="range"
                          min={2}
                          max={64}
                          value={colorCount}
                          onChange={(e) => setColorCount(Number(e.target.value))}
                          className="w-full accent-primary"
                        />
                        <div className="flex justify-between text-[10px] font-bold text-on-surface-variant">
                          <span>2</span>
                          <span>64</span>
                        </div>
                      </div>
                    )}

                    {/* Live palette preview */}
                    <div className="bg-surface-container-lowest rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] uppercase tracking-widest text-on-surface-variant font-bold">
                          {paletteMode === "manual" ? "Your palette" : "Detected palette"}
                        </span>
                        <span className="text-[10px] text-on-surface-variant">
                          {paletteLoading
                            ? "Analyzing…"
                            : `${(paletteMode === "manual" ? manualPalette : detectedPalette).length} colors`}
                        </span>
                      </div>
                      {!items.length ? (
                        <p className="text-[11px] text-on-surface-variant">
                          Upload an image to preview its palette.
                        </p>
                      ) : paletteMode === "manual" ? (
                        <>
                          <div className="grid grid-cols-8 gap-1.5">
                            {manualPalette.map((c, i) => (
                              <div key={i} className="relative group">
                                <input
                                  type="color"
                                  value={toHex(c)}
                                  onChange={(e) =>
                                    setManualPalette((p) =>
                                      p.map((x, j) => (j === i ? fromHex(e.target.value) : x)),
                                    )
                                  }
                                  className="w-full h-8 rounded cursor-pointer border border-outline-variant/30 bg-transparent"
                                  aria-label={`Color ${i + 1}`}
                                  title={toHex(c)}
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    setManualPalette((p) => p.filter((_, j) => j !== i))
                                  }
                                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-surface-container-highest text-[10px] leading-none opacity-0 group-hover:opacity-100 transition-opacity"
                                  aria-label={`Remove color ${i + 1}`}
                                  disabled={manualPalette.length <= 2}
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                            {manualPalette.length < 32 && (
                              <button
                                type="button"
                                onClick={() =>
                                  setManualPalette((p) => [...p, { r: 128, g: 128, b: 128 }])
                                }
                                className="w-full h-8 rounded border border-dashed border-outline-variant/50 text-on-surface-variant hover:border-primary/50 hover:text-primary text-lg leading-none"
                                aria-label="Add color"
                              >
                                +
                              </button>
                            )}
                          </div>
                          <div className="flex items-center justify-between pt-1">
                            <button
                              type="button"
                              onClick={() => setManualPalette(detectedPalette)}
                              disabled={!detectedPalette.length}
                              className="text-[11px] text-primary font-bold hover:underline disabled:opacity-40"
                            >
                              Reset to detected
                            </button>
                            <button
                              type="button"
                              onClick={() => setManualPalette([])}
                              className="text-[11px] text-on-surface-variant hover:text-red-400"
                            >
                              Clear
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="grid grid-cols-8 gap-1.5">
                          {detectedPalette.map((c, i) => (
                            <div
                              key={i}
                              className="w-full h-8 rounded border border-outline-variant/20"
                              style={{ backgroundColor: toHex(c) }}
                              title={toHex(c)}
                            />
                          ))}
                          {!detectedPalette.length && !paletteLoading && (
                            <p className="col-span-8 text-[11px] text-on-surface-variant">
                              Could not extract palette.
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <label className="flex items-center justify-between gap-2 bg-surface-container-lowest rounded-lg p-3 cursor-pointer">
                      <div className="min-w-0">
                        <div className="text-xs font-bold flex items-center gap-2">
                          <span className="material-symbols-outlined text-base text-primary">lock</span>
                          Lock colors
                        </div>
                        <p className="text-[11px] text-on-surface-variant mt-0.5">
                          Skip re-quantization so colors stay exact.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={lockColors || paletteMode === "manual"}
                        disabled={paletteMode === "manual"}
                        onChange={(e) => setLockColors(e.target.checked)}
                        className="w-5 h-5 accent-primary"
                      />
                    </label>
                  </div>
                )}

                <div>
                  <label className="block font-label text-sm uppercase text-on-surface-variant mb-3 font-bold">
                    Path Smoothing
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={5}
                    step={1}
                    value={smoothing}
                    onChange={(e) => setSmoothing(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                  <div className="flex justify-between text-xs font-bold text-on-surface-variant">
                    <span>Sharp</span>
                    <span className="text-primary">{smoothing}</span>
                    <span>Smooth</span>
                  </div>
                </div>

                <div>
                  <label className="block font-label text-sm uppercase text-on-surface-variant mb-3 font-bold">
                    Background
                  </label>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    {(["transparent", "white", "custom"] as const).map((b) => (
                      <button
                        key={b}
                        onClick={() => setBackground(b)}
                        className={`py-2 rounded-lg text-xs font-bold capitalize transition-all ${
                          background === b
                            ? "bg-primary text-on-primary"
                            : "bg-surface-container-lowest border border-outline-variant/30 hover:border-primary/50"
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                  {background === "custom" && (
                    <input
                      type="color"
                      value={customBg}
                      onChange={(e) => setCustomBg(e.target.value)}
                      className="w-full h-10 rounded-lg cursor-pointer bg-transparent"
                    />
                  )}
                </div>

                <button
                  onClick={() => handleConvertAll()}
                  disabled={!items.length || processing}
                  className="w-full bg-primary text-on-primary py-5 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 hover:shadow-[0_0_15px_hsla(82,98%,72%,0.2)]"
                >
                  {processing ? (
                    <>
                      <span className="material-symbols-outlined animate-spin">progress_activity</span>
                      Vectorizing...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined">auto_fix_high</span>
                      Vectorize {items.length > 0 ? `All (${items.length})` : ""}
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
                      Download {doneItems.length > 1 ? "ZIP" : "SVG"}
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

      <ToolSeoSection path="/image-to-svg" />
    </>
  );
};

export default ImageToSvg;
