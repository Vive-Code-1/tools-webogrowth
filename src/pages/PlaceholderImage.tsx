import { useState, useRef, useEffect } from "react";
import SEOHead from "@/components/SEOHead";
import RelatedTools from "@/components/RelatedTools";

const PlaceholderImage = () => {
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [bgColor, setBgColor] = useState("#374151");
  const [textColor, setTextColor] = useState("#9CA3AF");
  const [text, setText] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const displayText = text || `${width} × ${height}`;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = Math.min(width, 1920);
    canvas.height = Math.min(height, 1080);
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = textColor;
    const fontSize = Math.max(16, Math.min(canvas.width, canvas.height) / 10);
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(displayText, canvas.width / 2, canvas.height / 2);
  }, [width, height, bgColor, textColor, displayText]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `placeholder_${width}x${height}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  return (
    <>
      <SEOHead
        title="Placeholder Image Generator Online Free | WeboGrowth"
        description="Generate custom placeholder images online for free. Set dimensions, colors, and text for your design mockups and development projects."
        keywords="placeholder image generator, dummy image generator, placeholder image online, custom placeholder image, mockup image generator"
        canonicalPath="/placeholder"
      />
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-12 lg:py-20">
        <header className="mb-12">
          <span className="text-primary tracking-[0.2em] font-extrabold uppercase mb-4 block text-xs font-label">Design Tool</span>
          <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tighter mb-6 leading-[0.9]">
            Placeholder Image <br /><span className="text-secondary">Generator</span>
          </h1>
          <p className="max-w-xl text-on-surface-variant text-lg leading-relaxed">
            Generate custom placeholder images with specific dimensions, colors, and text for your mockups and prototypes.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-label uppercase tracking-widest text-on-surface-variant block mb-2">Width (px)</label>
                <input type="number" value={width} onChange={(e) => setWidth(Number(e.target.value))} min={50} max={1920} className="w-full bg-surface-container rounded-lg px-4 py-3 text-foreground outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="text-sm font-label uppercase tracking-widest text-on-surface-variant block mb-2">Height (px)</label>
                <input type="number" value={height} onChange={(e) => setHeight(Number(e.target.value))} min={50} max={1080} className="w-full bg-surface-container rounded-lg px-4 py-3 text-foreground outline-none focus:ring-1 focus:ring-primary" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-label uppercase tracking-widest text-on-surface-variant block mb-2">Background</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-12 h-12 rounded-lg cursor-pointer border-0 bg-transparent" />
                  <input value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="flex-1 bg-surface-container rounded-lg px-3 py-2 font-mono text-sm text-foreground outline-none" />
                </div>
              </div>
              <div>
                <label className="text-sm font-label uppercase tracking-widest text-on-surface-variant block mb-2">Text Color</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-12 h-12 rounded-lg cursor-pointer border-0 bg-transparent" />
                  <input value={textColor} onChange={(e) => setTextColor(e.target.value)} className="flex-1 bg-surface-container rounded-lg px-3 py-2 font-mono text-sm text-foreground outline-none" />
                </div>
              </div>
            </div>
            <div>
              <label className="text-sm font-label uppercase tracking-widest text-on-surface-variant block mb-2">Custom Text (optional)</label>
              <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Default: width × height" className="w-full bg-surface-container rounded-lg px-4 py-3 text-foreground placeholder:text-foreground/30 outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <button onClick={handleDownload} className="w-full bg-primary text-on-primary py-4 rounded-lg font-bold hover:shadow-[0_0_20px_hsla(82,98%,72%,0.3)] transition-all flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">download</span>Download PNG
            </button>
          </div>
          <div className="flex items-center justify-center bg-surface-container rounded-xl p-4 overflow-hidden">
            <canvas ref={canvasRef} className="max-w-full max-h-[400px] object-contain rounded-lg" />
          </div>
        </div>

        <RelatedTools currentPath="/placeholder" />
      </div>
    </>
  );
};

export default PlaceholderImage;
