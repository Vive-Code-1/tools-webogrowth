import { useCallback, useEffect, useRef, useState } from "react";
import SEOHead from "@/components/SEOHead";
import { getSeoProps } from "@/lib/seo";
import ToolSeoSection from "@/components/ToolSeoSection";
import RelatedTools from "@/components/RelatedTools";
import DropZone from "@/components/DropZone";
import ResultCountdownPanel from "@/components/ResultCountdownPanel";
import JSZip from "jszip";
import { useToast } from "@/hooks/use-toast";

type Position = "tl" | "tr" | "bl" | "br" | "center";

const Watermark = () => {
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [text, setText] = useState("© WeboGrowth");
  const [logo, setLogo] = useState<File | null>(null);
  const [position, setPosition] = useState<Position>("br");
  const [opacity, setOpacity] = useState(0.6);
  const [fontSize, setFontSize] = useState(48);
  const [color, setColor] = useState("#ffffff");
  const [margin, setMargin] = useState(24);
  const [tile, setTile] = useState(false);
  const [outputs, setOutputs] = useState<{ name: string; url: string; blob: Blob }[]>([]);
  const [processing, setProcessing] = useState(false);
  const [countdownKey, setCountdownKey] = useState(0);
  const previewRef = useRef<HTMLCanvasElement>(null);

  const handleExpire = useCallback(() => {
    setOutputs((prev) => {
      prev.forEach((o) => {
        if (o.url.startsWith("blob:")) URL.revokeObjectURL(o.url);
      });
      return [];
    });
  }, []);


  const drawWatermark = async (img: HTMLImageElement, logoImg: HTMLImageElement | null): Promise<Blob> => {
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0);
    ctx.globalAlpha = opacity;

    const drawAt = (x: number, y: number) => {
      if (logoImg) {
        const lw = Math.min(canvas.width * 0.2, logoImg.naturalWidth);
        const lh = (lw / logoImg.naturalWidth) * logoImg.naturalHeight;
        ctx.drawImage(logoImg, x - lw / 2, y - lh / 2, lw, lh);
      } else {
        ctx.fillStyle = color;
        ctx.font = `bold ${fontSize}px system-ui, sans-serif`;
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.fillText(text, x, y);
      }
    };

    if (tile) {
      const step = Math.max(fontSize * 6, 200);
      for (let y = step / 2; y < canvas.height; y += step) {
        for (let x = step / 2; x < canvas.width; x += step) {
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(-Math.PI / 6);
          drawAt(0, 0);
          ctx.restore();
        }
      }
    } else {
      let x = canvas.width - margin, y = canvas.height - margin;
      if (position === "tl") { x = margin; y = margin; ctx.textAlign = "left"; ctx.textBaseline = "top"; }
      else if (position === "tr") { x = canvas.width - margin; y = margin; ctx.textAlign = "right"; ctx.textBaseline = "top"; }
      else if (position === "bl") { x = margin; y = canvas.height - margin; ctx.textAlign = "left"; ctx.textBaseline = "bottom"; }
      else if (position === "br") { x = canvas.width - margin; y = canvas.height - margin; ctx.textAlign = "right"; ctx.textBaseline = "bottom"; }
      else { x = canvas.width / 2; y = canvas.height / 2; ctx.textAlign = "center"; ctx.textBaseline = "middle"; }
      if (logoImg) drawAt(canvas.width / 2, canvas.height / 2);
      else { ctx.fillStyle = color; ctx.font = `bold ${fontSize}px system-ui, sans-serif`; ctx.fillText(text, x, y); }
    }

    return await new Promise((res) => canvas.toBlob((b) => res(b!), "image/png"));
  };

  const loadImg = (src: string): Promise<HTMLImageElement> => new Promise((res, rej) => {
    const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src;
  });

  // Live preview from first file
  useEffect(() => {
    if (!files.length || !previewRef.current) return;
    const url = URL.createObjectURL(files[0]);
    const logoUrl = logo ? URL.createObjectURL(logo) : null;
    (async () => {
      const img = await loadImg(url);
      const lImg = logoUrl ? await loadImg(logoUrl) : null;
      const blob = await drawWatermark(img, lImg);
      const burl = URL.createObjectURL(blob);
      const pimg = await loadImg(burl);
      const canvas = previewRef.current!;
      const maxW = 600;
      const ratio = Math.min(1, maxW / pimg.naturalWidth);
      canvas.width = pimg.naturalWidth * ratio;
      canvas.height = pimg.naturalHeight * ratio;
      canvas.getContext("2d")!.drawImage(pimg, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(burl); URL.revokeObjectURL(url); if (logoUrl) URL.revokeObjectURL(logoUrl);
    })();
  }, [files, logo, text, position, opacity, fontSize, color, margin, tile]);

  const processAll = async () => {
    if (!files.length) return;
    setProcessing(true); setOutputs([]);
    try {
      const logoUrl = logo ? URL.createObjectURL(logo) : null;
      const lImg = logoUrl ? await loadImg(logoUrl) : null;
      const results: { name: string; url: string; blob: Blob }[] = [];
      for (const f of files) {
        const u = URL.createObjectURL(f);
        const img = await loadImg(u);
        const blob = await drawWatermark(img, lImg);
        results.push({ name: f.name.replace(/\.[^.]+$/, "") + "-wm.png", url: URL.createObjectURL(blob), blob });
        URL.revokeObjectURL(u);
      }
      if (logoUrl) URL.revokeObjectURL(logoUrl);
      setOutputs(results);
      toast({ title: `Watermarked ${results.length} image${results.length > 1 ? "s" : ""}` });
    } finally { setProcessing(false); }
  };

  const downloadZip = async () => {
    const zip = new JSZip();
    outputs.forEach((o) => zip.file(o.name, o.blob));
    const blob = await zip.generateAsync({ type: "blob" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "watermarked.zip"; a.click();
  };

  return (
    <>
      <SEOHead {...getSeoProps("/watermark")!} />
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-12 lg:py-20">
        <header className="mb-12">
          <span className="text-primary tracking-[0.2em] font-extrabold uppercase mb-4 block text-xs font-label">Image Tool</span>
          <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tighter mb-6 leading-[0.9]">
            Image Watermark <br /><span className="text-secondary">Tool</span>
          </h1>
          <p className="max-w-xl text-on-surface-variant text-lg leading-relaxed">
            Add text or logo watermarks to bulk images. Position, opacity, tile pattern — all in your browser.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
          <div className="lg:col-span-3 space-y-4">
            <DropZone multiple onFilesSelect={(f) => setFiles((p) => [...p, ...f].slice(0, 20))}
              accept="image/*" label="Drop images" sublabel="Up to 20 files" hasFiles={files.length > 0} />
            {files.length > 0 && (
              <div className="bg-surface-container rounded-xl p-4 text-sm flex justify-between items-center">
                <span>{files.length} image{files.length > 1 ? "s" : ""}</span>
                <button onClick={() => { setFiles([]); setOutputs([]); }} className="text-destructive">Clear</button>
              </div>
            )}
            <div className="bg-surface-container rounded-xl p-4">
              <h3 className="text-xs font-label uppercase tracking-widest text-on-surface-variant mb-3">Live Preview</h3>
              <div className="w-full h-[420px] md:h-[520px] rounded-lg bg-surface-container-lowest flex items-center justify-center overflow-hidden">
                {files.length ? (
                  <canvas ref={previewRef} className="max-w-full max-h-full w-auto h-auto object-contain" />
                ) : (
                  <p className="text-on-surface-variant text-sm">Upload an image to preview.</p>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="bg-surface-container rounded-xl p-5 space-y-3">
              <label className="text-xs font-label uppercase tracking-widest text-on-surface-variant">Text</label>
              <input value={text} onChange={(e) => setText(e.target.value)}
                className="w-full bg-surface-container-lowest rounded-lg px-3 py-2 text-sm outline-none" />
              <label className="text-xs font-label uppercase tracking-widest text-on-surface-variant block">Or Logo (PNG)</label>
              <input type="file" accept="image/png,image/svg+xml" onChange={(e) => setLogo(e.target.files?.[0] || null)}
                className="text-sm" />
              {logo && <button onClick={() => setLogo(null)} className="text-xs text-destructive">Remove logo</button>}

              <label className="text-xs font-label uppercase tracking-widest text-on-surface-variant block">Position</label>
              <div className="grid grid-cols-3 gap-2">
                {(["tl", "tr", "center", "bl", "br"] as Position[]).map((p) => (
                  <button key={p} onClick={() => setPosition(p)}
                    className={`py-2 rounded text-xs font-bold ${position === p && !tile ? "bg-primary text-on-primary" : "bg-surface-container-lowest"}`}>{p.toUpperCase()}</button>
                ))}
              </div>
              <label className="flex items-center gap-2 text-sm mt-2">
                <input type="checkbox" checked={tile} onChange={(e) => setTile(e.target.checked)} /> Tile pattern (anti-piracy)
              </label>

              <label className="text-xs font-label uppercase tracking-widest text-on-surface-variant block">Opacity: {Math.round(opacity * 100)}%</label>
              <input type="range" min="0.1" max="1" step="0.05" value={opacity} onChange={(e) => setOpacity(+e.target.value)} className="w-full" />

              <label className="text-xs font-label uppercase tracking-widest text-on-surface-variant block">Font Size: {fontSize}px</label>
              <input type="range" min="16" max="200" value={fontSize} onChange={(e) => setFontSize(+e.target.value)} className="w-full" />

              <label className="text-xs font-label uppercase tracking-widest text-on-surface-variant block">Margin: {margin}px</label>
              <input type="range" min="0" max="200" value={margin} onChange={(e) => setMargin(+e.target.value)} className="w-full" />

              <label className="text-xs font-label uppercase tracking-widest text-on-surface-variant block">Text Color</label>
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-full h-10 bg-transparent rounded" />
            </div>

            <button onClick={processAll} disabled={!files.length || processing}
              className="w-full bg-primary text-on-primary font-bold py-3 rounded-lg disabled:opacity-50">
              {processing ? "Processing…" : `Apply to ${files.length} image${files.length !== 1 ? "s" : ""}`}
            </button>

            {outputs.length > 0 && (
              <div className="bg-surface-container rounded-xl p-4 space-y-2">
                <button onClick={downloadZip} className="w-full bg-secondary text-on-secondary font-bold py-2 rounded-lg">Download ZIP</button>
                {outputs.map((o) => (
                  <a key={o.name} href={o.url} download={o.name} className="block text-xs text-primary truncate">{o.name}</a>
                ))}
              </div>
            )}
          </div>
        </div>

        <ToolSeoSection path="/watermark" />
        <RelatedTools currentPath="/watermark" />
      </div>
    </>
  );
};

export default Watermark;
