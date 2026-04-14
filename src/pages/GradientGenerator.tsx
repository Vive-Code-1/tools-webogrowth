import { useState } from "react";
import SEOHead from "@/components/SEOHead";
import RelatedTools from "@/components/RelatedTools";

const GradientGenerator = () => {
  const [color1, setColor1] = useState("#3B82F6");
  const [color2, setColor2] = useState("#8B5CF6");
  const [angle, setAngle] = useState(135);
  const [type, setType] = useState<"linear" | "radial">("linear");

  const cssValue = type === "linear"
    ? `linear-gradient(${angle}deg, ${color1}, ${color2})`
    : `radial-gradient(circle, ${color1}, ${color2})`;

  const cssCode = `background: ${cssValue};`;

  const handleCopy = () => navigator.clipboard.writeText(cssCode);

  return (
    <>
      <SEOHead
        title="CSS Gradient Generator - Create Gradients Online | WeboGrowth"
        description="Create beautiful CSS gradients visually with our free online gradient generator. Build linear and radial gradients, customize colors and angles, copy CSS code."
        keywords="css gradient generator, gradient maker, linear gradient, radial gradient, css gradient tool, create gradient online"
        canonicalPath="/gradient-generator"
      />
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-12 lg:py-20">
        <header className="mb-12">
          <span className="text-primary tracking-[0.2em] font-extrabold uppercase mb-4 block text-xs font-label">Design Tool</span>
          <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tighter mb-6 leading-[0.9]">
            CSS Gradient <br /><span className="text-secondary">Generator</span>
          </h1>
          <p className="max-w-xl text-on-surface-variant text-lg leading-relaxed">
            Create stunning CSS gradients visually. Choose colors, adjust angles, and copy the CSS code for your projects.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <div className="space-y-6">
            <div className="flex gap-3">
              <button onClick={() => setType("linear")} className={`px-6 py-3 rounded-lg font-bold transition-all ${type === "linear" ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant"}`}>Linear</button>
              <button onClick={() => setType("radial")} className={`px-6 py-3 rounded-lg font-bold transition-all ${type === "radial" ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant"}`}>Radial</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-label uppercase tracking-widest text-on-surface-variant block mb-2">Color 1</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={color1} onChange={(e) => setColor1(e.target.value)} className="w-12 h-12 rounded-lg cursor-pointer border-0 bg-transparent" />
                  <input value={color1} onChange={(e) => setColor1(e.target.value)} className="flex-1 bg-surface-container rounded-lg px-3 py-2 font-mono text-sm text-foreground outline-none" />
                </div>
              </div>
              <div>
                <label className="text-sm font-label uppercase tracking-widest text-on-surface-variant block mb-2">Color 2</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={color2} onChange={(e) => setColor2(e.target.value)} className="w-12 h-12 rounded-lg cursor-pointer border-0 bg-transparent" />
                  <input value={color2} onChange={(e) => setColor2(e.target.value)} className="flex-1 bg-surface-container rounded-lg px-3 py-2 font-mono text-sm text-foreground outline-none" />
                </div>
              </div>
            </div>
            {type === "linear" && (
              <div>
                <label className="text-sm font-label uppercase tracking-widest text-on-surface-variant block mb-2">Angle: {angle}°</label>
                <input type="range" min={0} max={360} value={angle} onChange={(e) => setAngle(Number(e.target.value))} className="w-full accent-primary" />
              </div>
            )}
            <div className="bg-surface-container rounded-xl p-6">
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-label uppercase tracking-widest text-on-surface-variant">CSS Code</label>
                <button onClick={handleCopy} className="text-xs text-primary font-bold uppercase tracking-widest hover:underline flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">content_copy</span>Copy
                </button>
              </div>
              <pre className="font-mono text-sm text-foreground">{cssCode}</pre>
            </div>
          </div>
          <div className="rounded-xl overflow-hidden aspect-square shadow-2xl" style={{ background: cssValue }} />
        </div>

        <RelatedTools currentPath="/gradient-generator" />
      </div>
    </>
  );
};

export default GradientGenerator;
