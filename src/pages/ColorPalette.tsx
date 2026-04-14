import { useState, useMemo } from "react";
import SEOHead from "@/components/SEOHead";
import RelatedTools from "@/components/RelatedTools";

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

const ColorPalette = () => {
  const [baseColor, setBaseColor] = useState("#3B82F6");

  const palettes = useMemo(() => {
    const [h, s, l] = hexToHsl(baseColor);
    return {
      complementary: [baseColor, hslToHex((h + 180) % 360, s, l)],
      analogous: [hslToHex((h - 30 + 360) % 360, s, l), baseColor, hslToHex((h + 30) % 360, s, l)],
      triadic: [baseColor, hslToHex((h + 120) % 360, s, l), hslToHex((h + 240) % 360, s, l)],
      shades: Array.from({ length: 5 }, (_, i) => hslToHex(h, s, Math.max(10, l - 15 + i * 15))),
    };
  }, [baseColor]);

  const copyColor = (color: string) => navigator.clipboard.writeText(color);

  const PaletteRow = ({ name, colors }: { name: string; colors: string[] }) => (
    <div className="space-y-3">
      <h3 className="font-headline font-bold text-lg capitalize">{name}</h3>
      <div className="flex gap-3 flex-wrap">
        {colors.map((c, i) => (
          <button key={i} onClick={() => copyColor(c)} className="group relative">
            <div className="w-20 h-20 rounded-xl shadow-lg transition-transform group-hover:scale-110" style={{ backgroundColor: c }} />
            <span className="block text-center text-xs font-mono mt-2 text-on-surface-variant uppercase">{c}</span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <SEOHead
        title="Color Palette Generator Online Free | WeboGrowth"
        description="Generate beautiful color palettes from any base color. Create complementary, analogous, triadic, and shade palettes for your design projects instantly."
        keywords="color palette generator, color scheme generator, complementary colors, analogous colors, triadic colors, design color tools"
        canonicalPath="/color-palette"
        jsonLd={{ "@context": "https://schema.org", "@type": "SoftwareApplication", name: "Color Palette Generator", url: "https://tools.webogrowth.com/color-palette", applicationCategory: "DesignApplication", operatingSystem: "Any", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, author: { "@type": "Organization", name: "WeboGrowth", url: "https://webogrowth.com" } }}
      />
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-12 lg:py-20">
        <header className="mb-12">
          <span className="text-primary tracking-[0.2em] font-extrabold uppercase mb-4 block text-xs font-label">Design Tool</span>
          <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tighter mb-6 leading-[0.9]">
            Color Palette <br /><span className="text-secondary">Generator</span>
          </h1>
          <p className="max-w-xl text-on-surface-variant text-lg leading-relaxed">
            Pick a base color and instantly generate complementary, analogous, triadic, and shade palettes for your next design project.
          </p>
        </header>

        <div className="mb-12 flex items-center gap-6">
          <input type="color" value={baseColor} onChange={(e) => setBaseColor(e.target.value)} className="w-16 h-16 rounded-xl cursor-pointer border-0 bg-transparent" />
          <div>
            <label className="text-sm font-label uppercase tracking-widest text-on-surface-variant block mb-1">Base Color</label>
            <input value={baseColor} onChange={(e) => setBaseColor(e.target.value)} className="bg-surface-container rounded-lg px-4 py-2 font-mono text-foreground uppercase outline-none focus:ring-1 focus:ring-primary w-32" />
          </div>
        </div>

        <div className="space-y-10">
          <PaletteRow name="Complementary" colors={palettes.complementary} />
          <PaletteRow name="Analogous" colors={palettes.analogous} />
          <PaletteRow name="Triadic" colors={palettes.triadic} />
          <PaletteRow name="Shades" colors={palettes.shades} />
        </div>

        <section className="mt-24">
          <h2 className="text-3xl font-headline font-bold mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6 max-w-3xl">
            {[
              { q: "What is a complementary color?", a: "A complementary color sits directly opposite on the color wheel. Together they create high contrast and visual interest." },
              { q: "What are analogous colors?", a: "Analogous colors are adjacent on the color wheel. They create harmonious, cohesive designs." },
              { q: "Can I copy color codes?", a: "Yes! Click any color swatch to copy its hex code to your clipboard." },
            ].map((faq) => (
              <div key={faq.q} className="bg-surface-container rounded-xl p-6">
                <h3 className="font-headline font-bold mb-2">{faq.q}</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        <RelatedTools currentPath="/color-palette" />
      </div>
    </>
  );
};

export default ColorPalette;
