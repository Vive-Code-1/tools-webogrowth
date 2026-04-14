import { useState } from "react";
import SEOHead from "@/components/SEOHead";
import RelatedTools from "@/components/RelatedTools";

const LOREM = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

const SENTENCES = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
  "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum.",
  "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia.",
  "Nulla facilisi morbi tempus iaculis urna id volutpat lacus laoreet.",
  "Viverra accumsan in nisl nisi scelerisque eu ultrices vitae auctor.",
  "Amet consectetur adipiscing elit pellentesque habitant morbi tristique senectus.",
  "Turpis egestas integer eget aliquet nibh praesent tristique magna sit.",
  "Amet cursus sit amet dictum sit amet justo donec enim.",
];

const WORDS = "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua".split(" ");

const LoremIpsum = () => {
  const [count, setCount] = useState(3);
  const [unit, setUnit] = useState<"paragraphs" | "sentences" | "words">("paragraphs");
  const [output, setOutput] = useState("");

  const generate = () => {
    if (unit === "paragraphs") {
      const paragraphs = Array.from({ length: count }, () => LOREM);
      setOutput(paragraphs.join("\n\n"));
    } else if (unit === "sentences") {
      const result = Array.from({ length: count }, (_, i) => SENTENCES[i % SENTENCES.length]);
      setOutput(result.join(" "));
    } else {
      const result = Array.from({ length: count }, (_, i) => WORDS[i % WORDS.length]);
      setOutput(result.join(" ") + ".");
    }
  };

  const handleCopy = () => navigator.clipboard.writeText(output);

  return (
    <>
      <SEOHead
        title="Lorem Ipsum Generator - Dummy Text Online | WeboGrowth"
        description="Generate lorem ipsum placeholder text online for free. Create paragraphs, sentences, or words of dummy text for your design and development projects."
        keywords="lorem ipsum generator, dummy text generator, placeholder text, lorem ipsum online, generate dummy text free"
        canonicalPath="/lorem-ipsum"
      />
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-12 lg:py-20">
        <header className="mb-12">
          <span className="text-primary tracking-[0.2em] font-extrabold uppercase mb-4 block text-xs font-label">Content Tool</span>
          <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tighter mb-6 leading-[0.9]">
            Lorem Ipsum <br /><span className="text-secondary">Generator</span>
          </h1>
          <p className="max-w-xl text-on-surface-variant text-lg leading-relaxed">
            Generate placeholder dummy text for your designs and layouts. Choose paragraphs, sentences, or words.
          </p>
        </header>

        <div className="flex flex-wrap gap-4 items-end mb-8">
          <div>
            <label className="text-sm font-label uppercase tracking-widest text-on-surface-variant block mb-2">Count</label>
            <input type="number" value={count} onChange={(e) => setCount(Math.max(1, Number(e.target.value)))} min={1} max={100} className="w-24 bg-surface-container rounded-lg px-4 py-3 text-foreground outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div className="flex gap-2">
            {(["paragraphs", "sentences", "words"] as const).map((u) => (
              <button key={u} onClick={() => setUnit(u)} className={`px-5 py-3 rounded-lg font-bold text-sm capitalize transition-all ${unit === u ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-highest"}`}>{u}</button>
            ))}
          </div>
          <button onClick={generate} className="bg-secondary text-on-secondary px-6 py-3 rounded-lg font-bold hover:opacity-90 transition-all flex items-center gap-2">
            <span className="material-symbols-outlined">text_fields</span>Generate
          </button>
        </div>

        {output && (
          <div className="relative">
            <div className="flex justify-end mb-2">
              <button onClick={handleCopy} className="text-xs text-primary font-bold uppercase tracking-widest hover:underline flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">content_copy</span>Copy
              </button>
            </div>
            <div className="bg-surface-container rounded-xl p-8 text-foreground leading-relaxed whitespace-pre-wrap max-h-[500px] overflow-y-auto">{output}</div>
          </div>
        )}

        <RelatedTools currentPath="/lorem-ipsum" />
      </div>
    </>
  );
};

export default LoremIpsum;
