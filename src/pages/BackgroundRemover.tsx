import { useState, useCallback, useEffect } from "react";
import JSZip from "jszip";
import DropZone from "@/components/DropZone";
import SEOHead from "@/components/SEOHead";
import { getSeoProps } from "@/lib/seo";
import ToolSeoSection from "@/components/ToolSeoSection";
import RelatedTools from "@/components/RelatedTools";
import { useToast } from "@/hooks/use-toast";
import { uploadProcessedFile, deleteProcessedFile } from "@/lib/storage";
import CountdownDownload from "@/components/CountdownDownload";

interface QueueItem {
  id: string;
  file: File;
  originalUrl: string;
  resultUrl?: string;
  resultBlob?: Blob;
  status: "queued" | "processing" | "done" | "failed";
  error?: string;
}

const BackgroundRemover = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<QueueItem[]>([]);
  const [processing, setProcessing] = useState(false);
  const [zipResult, setZipResult] = useState<{ url: string; fileName: string } | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    return () => {
      items.forEach((it) => {
        URL.revokeObjectURL(it.originalUrl);
        if (it.resultUrl) URL.revokeObjectURL(it.resultUrl);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFiles = useCallback((files: File[]) => {
    const newItems: QueueItem[] = files.map((f) => ({
      id: `${Date.now()}-${Math.random()}`,
      file: f,
      originalUrl: URL.createObjectURL(f),
      status: "queued",
    }));
    setItems((prev) => [...prev, ...newItems].slice(0, 10));
    setZipResult(null);
  }, []);

  const removeItem = (id: string) => {
    setItems((prev) => {
      const it = prev.find((x) => x.id === id);
      if (it) {
        URL.revokeObjectURL(it.originalUrl);
        if (it.resultUrl) URL.revokeObjectURL(it.resultUrl);
      }
      return prev.filter((x) => x.id !== id);
    });
  };

  const handleProcess = async () => {
    if (!items.length) return;
    setProcessing(true);
    setProgress(0);
    try {
      const { removeBackground } = await import("@imgly/background-removal");
      let done = 0;
      for (const item of items) {
        if (item.status === "done") {
          done++;
          continue;
        }
        setItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, status: "processing" } : x)));
        try {
          const blob = await removeBackground(item.file);
          const url = URL.createObjectURL(blob);
          setItems((prev) =>
            prev.map((x) =>
              x.id === item.id ? { ...x, status: "done", resultBlob: blob, resultUrl: url } : x,
            ),
          );
        } catch (err) {
          console.error("BG removal failed:", err);
          setItems((prev) =>
            prev.map((x) =>
              x.id === item.id ? { ...x, status: "failed", error: (err as Error).message } : x,
            ),
          );
        }
        done++;
        setProgress(Math.round((done / items.length) * 100));
      }
      toast({ title: "Background removed!", description: "Download each image or grab the ZIP below." });
    } catch (err) {
      console.error(err);
      toast({ title: "Could not load model", description: "Check your connection and retry.", variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadOne = (item: QueueItem) => {
    if (!item.resultUrl) return;
    const a = document.createElement("a");
    a.href = item.resultUrl;
    a.download = `nobg_${item.file.name.replace(/\.[^.]+$/, "")}.png`;
    a.click();
  };

  const handleDownloadZip = async () => {
    const done = items.filter((x) => x.status === "done" && x.resultBlob);
    if (!done.length) return;
    const zip = new JSZip();
    done.forEach((it) => {
      const name = `nobg_${it.file.name.replace(/\.[^.]+$/, "")}.png`;
      zip.file(name, it.resultBlob!);
    });
    const blob = await zip.generateAsync({ type: "blob" });
    if (zipResult?.url) deleteProcessedFile(zipResult.url);
    const url = await uploadProcessedFile(blob, "background-removed.zip");
    setZipResult({ url, fileName: "background-removed.zip" });
  };

  const handleReset = () => {
    items.forEach((it) => {
      URL.revokeObjectURL(it.originalUrl);
      if (it.resultUrl) URL.revokeObjectURL(it.resultUrl);
    });
    setItems([]);
    setZipResult(null);
    setProgress(0);
  };

  const doneCount = items.filter((x) => x.status === "done").length;

  return (
    <>
      <SEOHead {...getSeoProps("/background-remover")!} />
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-12 lg:py-20">
        <header className="mb-12">
          <span className="text-primary tracking-[0.2em] font-extrabold uppercase mb-4 block text-xs font-label">AI Image Tool</span>
          <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tighter mb-6 leading-[0.9]">
            Background <br /><span className="text-secondary">Remover</span>
          </h1>
          <p className="max-w-xl text-on-surface-variant text-lg leading-relaxed">
            Remove image backgrounds instantly with on-device AI. Bulk processing, transparent PNG output, 100% private — your images never leave your browser.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 items-start">
          <DropZone
            multiple
            accept="image/png,image/jpeg,image/webp"
            label="Drop images to remove background"
            sublabel="PNG, JPG, WEBP — up to 10 files, 15MB each"
            maxSizeMB={15}
            onFilesSelect={handleFiles}
            processing={processing}
            hasFiles={items.length > 0}
          />

          <div className="bg-surface-container rounded-xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-headline font-bold text-lg">Queue ({items.length}/10)</h3>
              {items.length > 0 && (
                <button onClick={handleReset} className="text-xs text-on-surface-variant hover:text-destructive uppercase font-bold tracking-widest">
                  Clear all
                </button>
              )}
            </div>
            {!items.length ? (
              <p className="text-sm text-on-surface-variant py-12 text-center">No images yet. First run downloads the AI model (~30MB), cached after.</p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {items.map((it) => (
                  <div key={it.id} className="flex items-center gap-3 bg-surface-container-low rounded-lg p-2">
                    <img src={it.resultUrl || it.originalUrl} alt="" className="w-12 h-12 object-cover rounded checkered-bg" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{it.file.name}</p>
                      <p className="text-xs text-on-surface-variant">
                        {(it.file.size / 1024).toFixed(0)} KB · {it.status}
                      </p>
                    </div>
                    {it.status === "done" && (
                      <button onClick={() => handleDownloadOne(it)} className="text-primary p-2 hover:bg-primary/10 rounded" aria-label="Download">
                        <span className="material-symbols-outlined text-base">download</span>
                      </button>
                    )}
                    <button onClick={() => removeItem(it.id)} className="text-on-surface-variant p-2 hover:text-destructive" aria-label="Remove">
                      <span className="material-symbols-outlined text-base">close</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {processing && (
              <div>
                <div className="flex justify-between text-xs text-on-surface-variant mb-1">
                  <span>Processing…</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            <button
              onClick={handleProcess}
              disabled={!items.length || processing}
              className="w-full bg-primary text-on-primary font-bold py-4 rounded-lg disabled:opacity-50 hover:shadow-[0_0_20px_hsla(82,98%,72%,0.3)] transition-all"
            >
              {processing ? "Removing backgrounds…" : `Remove Background (${items.length})`}
            </button>

            {doneCount > 1 && !processing && (
              <button
                onClick={handleDownloadZip}
                className="w-full bg-secondary text-on-secondary font-bold py-3 rounded-lg hover:opacity-90 transition-all"
              >
                Bundle {doneCount} as ZIP
              </button>
            )}
          </div>
        </div>

        {zipResult && (
          <div className="max-w-xl mx-auto">
            <CountdownDownload
              downloadUrl={zipResult.url}
              fileName={zipResult.fileName}
              onExpired={() => setZipResult(null)}
            />
          </div>
        )}

        <ToolSeoSection path="/background-remover" />
        <RelatedTools currentPath="/background-remover" />
      </div>

      <style>{`
        .checkered-bg {
          background-image:
            linear-gradient(45deg, #ccc 25%, transparent 25%),
            linear-gradient(-45deg, #ccc 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #ccc 75%),
            linear-gradient(-45deg, transparent 75%, #ccc 75%);
          background-size: 8px 8px;
          background-position: 0 0, 0 4px, 4px -4px, -4px 0px;
        }
      `}</style>
    </>
  );
};

export default BackgroundRemover;
