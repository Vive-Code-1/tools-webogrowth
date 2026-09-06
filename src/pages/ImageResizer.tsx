import { useState, useCallback } from "react";
import DropZone from "@/components/DropZone";
import SEOHead from "@/components/SEOHead";
import { getSeoProps } from "@/lib/seo";
import RelatedTools from "@/components/RelatedTools";
import { runWithConcurrency } from "@/lib/concurrency";

interface Item {
  file: File;
  previewUrl: string;
  w: number;
  h: number;
}

const ImageResizer = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [keepAspect, setKeepAspect] = useState(true);
  const [processing, setProcessing] = useState(false);

  const handleFilesSelect = useCallback((files: File[]) => {
    files.forEach((f, idx) => {
      const url = URL.createObjectURL(f);
      const img = new Image();
      img.onload = () => {
        setItems((prev) => {
          if (prev.some((i) => i.file.name === f.name && i.file.size === f.size)) return prev;
          const next = [...prev, { file: f, previewUrl: url, w: img.naturalWidth, h: img.naturalHeight }];
          return next.slice(0, 30);
        });
        if (idx === 0) {
          setWidth((prevW) => (items.length === 0 ? img.naturalWidth : prevW));
          setHeight((prevH) => (items.length === 0 ? img.naturalHeight : prevH));
        }
      };
      img.src = url;
    });
  }, [items.length]);

  const first = items[0];

  const handleWidthChange = (w: number) => {
    setWidth(w);
    if (keepAspect && first && first.w > 0) setHeight(Math.round((w / first.w) * first.h));
  };

  const handleHeightChange = (h: number) => {
    setHeight(h);
    if (keepAspect && first && first.h > 0) setWidth(Math.round((h / first.h) * first.w));
  };

  const removeItem = (index: number) => {
    setItems((prev) => {
      const t = prev[index];
      if (t) URL.revokeObjectURL(t.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const clearAll = () => {
    items.forEach((i) => URL.revokeObjectURL(i.previewUrl));
    setItems([]);
  };

  const resizeOne = (item: Item) =>
    new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => {
        // Per-image target: keep each image's own aspect ratio when locked
        let targetW = width;
        let targetH = height;
        if (keepAspect && img.naturalWidth > 0) {
          targetH = Math.round((width / img.naturalWidth) * img.naturalHeight);
        }
        const canvas = document.createElement("canvas");
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, targetW, targetH);
        canvas.toBlob((blob) => {
          if (blob) {
            const link = document.createElement("a");
            link.download = `resized_${targetW}x${targetH}_${item.file.name}`;
            link.href = URL.createObjectURL(blob);
            link.click();
          }
          resolve();
        }, item.file.type || "image/png");
      };
      img.onerror = () => resolve();
      img.src = item.previewUrl;
    });

  const handleResize = async () => {
    if (!items.length) return;
    setProcessing(true);
    try {
      await runWithConcurrency(items, 2, async (item) => {
        await resizeOne(item);
        await new Promise((r) => setTimeout(r, 200));
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <SEOHead {...getSeoProps("/image-resizer")!} />
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-12 lg:py-20">
        <header className="mb-12">
          <span className="text-primary tracking-[0.2em] font-extrabold uppercase mb-4 block text-xs font-label">Image Tool</span>
          <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tighter mb-6 leading-[0.9]">
            Image Resizer <br /><span className="text-secondary">& Cropper</span>
          </h1>
          <p className="max-w-xl text-on-surface-variant text-lg leading-relaxed">
            Resize one image or a whole batch to exact dimensions. Lock the aspect ratio or set custom width and height values.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="space-y-6">
            <DropZone
              multiple
              onFilesSelect={handleFilesSelect}
              accept="image/png,image/jpeg,image/webp"
              label="Drop your images here"
              sublabel="PNG, JPG or WebP. Up to 30 images, 25MB each."
              processing={processing}
              hasFiles={items.length > 0}
            />

            {items.length > 0 && (
              <div className="bg-surface-container rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-headline font-bold text-sm tracking-widest uppercase">
                    {items.length} image{items.length > 1 ? "s" : ""} queued
                  </h2>
                  <button onClick={clearAll} className="text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-primary">
                    Clear all
                  </button>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-64 overflow-y-auto scrollbar-brand">
                  {items.map((item, i) => (
                    <div key={`${item.file.name}-${i}`} className="relative group">
                      <img src={item.previewUrl} alt={item.file.name} className="w-full aspect-square object-cover rounded-lg" />
                      <button
                        onClick={() => removeItem(i)}
                        aria-label={`Remove ${item.file.name}`}
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-surface-container-highest border border-outline-variant/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                      <p className="mt-1 text-[10px] text-on-surface-variant truncate">{item.file.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {items.length > 0 && (
              <div className="bg-surface-container rounded-xl p-6 space-y-5">
                {first && (
                  <p className="text-sm text-on-surface-variant">First image: {first.w} × {first.h}px</p>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-label uppercase tracking-widest text-on-surface-variant block mb-2">Width (px)</label>
                    <input type="number" value={width} onChange={(e) => handleWidthChange(Number(e.target.value))} className="w-full bg-surface-container-highest rounded-lg px-4 py-3 text-foreground outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="text-sm font-label uppercase tracking-widest text-on-surface-variant block mb-2">Height (px)</label>
                    <input type="number" value={height} disabled={keepAspect} onChange={(e) => handleHeightChange(Number(e.target.value))} className="w-full bg-surface-container-highest rounded-lg px-4 py-3 text-foreground outline-none focus:ring-1 focus:ring-primary disabled:opacity-50" />
                  </div>
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={keepAspect} onChange={(e) => setKeepAspect(e.target.checked)} className="accent-primary w-4 h-4" />
                  <span className="text-sm text-on-surface-variant">Lock aspect ratio (each image keeps its own ratio)</span>
                </label>
                <button
                  onClick={handleResize}
                  disabled={processing}
                  className="w-full bg-primary text-on-primary py-4 rounded-lg font-bold hover:shadow-[0_0_20px_hsla(82,98%,72%,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <span className={`material-symbols-outlined ${processing ? "animate-spin" : ""}`}>{processing ? "progress_activity" : "aspect_ratio"}</span>
                  {processing ? "Resizing..." : `Resize & Download ${items.length > 1 ? `${items.length} Images` : ""}`}
                </button>
              </div>
            )}
          </div>
          <div className="bg-surface-container rounded-xl overflow-hidden flex items-center justify-center min-h-[400px]">
            {first ? (
              <img src={first.previewUrl} alt="Preview" className="max-w-full max-h-[500px] object-contain" />
            ) : (
              <span className="text-on-surface-variant/30 text-sm">No image loaded</span>
            )}
          </div>
        </div>

        <RelatedTools currentPath="/image-resizer" />
      </div>
    </>
  );
};

export default ImageResizer;
