import { useState } from "react";
import SEOHead from "@/components/SEOHead";
import RelatedTools from "@/components/RelatedTools";

const CssMinifier = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const handleMinify = () => {
    const minified = input
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/\s+/g, " ")
      .replace(/\s*([{}:;,>+~])\s*/g, "$1")
      .replace(/;}/g, "}")
      .trim();
    setOutput(minified);
  };

  const handleBeautify = () => {
    let depth = 0;
    let result = "";
    const chars = input.replace(/\/\*[\s\S]*?\*\//g, "").trim();
    for (let i = 0; i < chars.length; i++) {
      const c = chars[i];
      if (c === "{") {
        depth++;
        result += " {\n" + "  ".repeat(depth);
      } else if (c === "}") {
        depth--;
        result += "\n" + "  ".repeat(depth) + "}\n" + "  ".repeat(depth);
      } else if (c === ";") {
        result += ";\n" + "  ".repeat(depth);
      } else {
        result += c;
      }
    }
    setOutput(result.trim());
  };

  const handleCopy = () => navigator.clipboard.writeText(output);

  const savings = input.length && output.length
    ? (((input.length - output.length) / input.length) * 100).toFixed(1)
    : null;

  return (
    <>
      <SEOHead
        title="CSS Minifier & Beautifier Online Free | WeboGrowth"
        description="Minify or beautify CSS code online for free. Reduce CSS file size by removing whitespace and comments, or format compressed CSS for readability."
        keywords="css minifier online, css beautifier, compress css, format css, minify css free, css optimizer"
        canonicalPath="/css-minifier"
      />
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-12 lg:py-20">
        <header className="mb-12">
          <span className="text-primary tracking-[0.2em] font-extrabold uppercase mb-4 block text-xs font-label">Developer Tool</span>
          <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tighter mb-6 leading-[0.9]">
            CSS Minifier <br /><span className="text-secondary">& Beautifier</span>
          </h1>
          <p className="max-w-xl text-on-surface-variant text-lg leading-relaxed">
            Minify your CSS to reduce file size or beautify compressed CSS for readability. All processing happens in your browser.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <label className="text-sm font-label uppercase tracking-widest text-on-surface-variant block">Input CSS</label>
            <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Paste your CSS here..." className="w-full h-72 bg-surface-container rounded-xl p-6 font-mono text-sm text-foreground placeholder:text-foreground/30 outline-none focus:ring-1 focus:ring-primary resize-none" />
            <div className="flex gap-3">
              <button onClick={handleMinify} className="bg-primary text-on-primary px-6 py-3 rounded-lg font-bold hover:shadow-[0_0_20px_hsla(82,98%,72%,0.3)] transition-all flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">compress</span>Minify
              </button>
              <button onClick={handleBeautify} className="bg-secondary text-on-secondary px-6 py-3 rounded-lg font-bold hover:opacity-90 transition-all flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">format_align_left</span>Beautify
              </button>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-label uppercase tracking-widest text-on-surface-variant">Output</label>
              <div className="flex items-center gap-4">
                {savings && Number(savings) > 0 && <span className="text-xs text-primary font-bold">-{savings}% size</span>}
                {output && (
                  <button onClick={handleCopy} className="text-xs text-primary font-bold uppercase tracking-widest hover:underline flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">content_copy</span>Copy
                  </button>
                )}
              </div>
            </div>
            <textarea value={output} readOnly placeholder="Result will appear here..." className="w-full h-72 bg-surface-container-highest rounded-xl p-6 font-mono text-sm text-foreground placeholder:text-foreground/30 outline-none resize-none" />
          </div>
        </div>

        <RelatedTools currentPath="/css-minifier" />
      </div>
    </>
  );
};

export default CssMinifier;
