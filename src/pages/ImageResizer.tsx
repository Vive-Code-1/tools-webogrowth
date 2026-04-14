import { useState, useCallback, useRef } from "react";
import DropZone from "@/components/DropZone";
import SEOHead from "@/components/SEOHead";
import RelatedTools from "@/components/RelatedTools";

const ImageResizer = () => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [keepAspect, setKeepAspect] = useState(true);
  const [originalDimensions, setOriginalDimensions] = useState({ w: 0, h: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileSelect = useCallback((f: File) => {
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreviewUrl(url);
    const img = new Image();
    img.onload = () => {
      setOriginalDimensions({ w: img.naturalWidth, h: img.naturalHeight });
      setWidth(img.naturalWidth);
      setHeight(img.naturalHeight);
    };
    img.src = url;
  }, []);

  const handleWidthChange = (w: number) => {
    setWidth(w);
    if (keepAspect && originalDimensions.w > 0) {
      setHeight(Math.round((w / originalDimensions.w) * originalDimensions.h));
    }
  };

  const handleHeightChange = (h: number) => {
    setHeight(h);
    if (keepAspect && originalDimensions.h > 0) {
      setWidth(Math.round((h / originalDimensions.h) * originalDimensions.w));
    }
  };

  const handleResize = () => {
    if (!file || !previewUrl) return;
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => {
        if (!blob) return;
        const link = document.createElement("a");
        link.download = `resized_${width}x${height}_${file.name}`;
        link.href = URL.createObjectURL(blob);
        link.click();
      }, file.type || "image/png");
    };
    img.src = previewUrl;
  };

  return (
    <>
      <SEOHead
        title="Image Resizer Online Free - Resize & Crop Images | WeboGrowth"
        description="Resize images online for free. Change dimensions, maintain aspect ratio, and download resized images instantly. Supports PNG, JPEG, and WebP formats."
        keywords="resize image online, image resizer free, change image size, resize photo online, crop image online, image dimensions"
        canonicalPath="/image-resizer"
        jsonLd={{ "@context": "https://schema.org", "@type": "SoftwareApplication", name: "Image Resizer", url: "https://tools.webogrowth.com/image-resizer", applicationCategory: "MultimediaApplication", operatingSystem: "Any", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, author: { "@type": "Organization", name: "WeboGrowth", url: "https://webogrowth.com" } }}
      />
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-12 lg:py-20">
        <header className="mb-12">
          <span className="text-primary tracking-[0.2em] font-extrabold uppercase mb-4 block text-xs font-label">Image Tool</span>
          <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tighter mb-6 leading-[0.9]">
            Image Resizer <br /><span className="text-secondary">& Cropper</span>
          </h1>
          <p className="max-w-xl text-on-surface-variant text-lg leading-relaxed">
            Resize your images to exact dimensions with precision. Maintain aspect ratio or set custom width and height values.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <DropZone onFileSelect={handleFileSelect} accept="image/png,image/jpeg,image/webp" />
            {file && (
              <div className="bg-surface-container rounded-xl p-6 space-y-5">
                <p className="text-sm text-on-surface-variant">Original: {originalDimensions.w} × {originalDimensions.h}px</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-label uppercase tracking-widest text-on-surface-variant block mb-2">Width (px)</label>
                    <input type="number" value={width} onChange={(e) => handleWidthChange(Number(e.target.value))} className="w-full bg-surface-container-highest rounded-lg px-4 py-3 text-foreground outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="text-sm font-label uppercase tracking-widest text-on-surface-variant block mb-2">Height (px)</label>
                    <input type="number" value={height} onChange={(e) => handleHeightChange(Number(e.target.value))} className="w-full bg-surface-container-highest rounded-lg px-4 py-3 text-foreground outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={keepAspect} onChange={(e) => setKeepAspect(e.target.checked)} className="accent-primary w-4 h-4" />
                  <span className="text-sm text-on-surface-variant">Lock aspect ratio</span>
                </label>
                <button onClick={handleResize} className="w-full bg-primary text-on-primary py-4 rounded-lg font-bold hover:shadow-[0_0_20px_hsla(82,98%,72%,0.3)] transition-all flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined">aspect_ratio</span>Resize & Download
                </button>
              </div>
            )}
          </div>
          <div className="bg-surface-container rounded-xl overflow-hidden flex items-center justify-center min-h-[400px]">
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="max-w-full max-h-[500px] object-contain" />
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
