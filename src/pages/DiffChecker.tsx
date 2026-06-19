import { useMemo, useState } from "react";
import SEOHead from "@/components/SEOHead";
import { getSeoProps } from "@/lib/seo";
import ToolSeoSection from "@/components/ToolSeoSection";
import RelatedTools from "@/components/RelatedTools";
import { diffLines, diffWords } from "diff";

const DiffChecker = () => {
  const [a, setA] = useState("The quick brown fox\njumps over the lazy dog.\nLine three stays the same.");
  const [b, setB] = useState("The quick red fox\njumps over the sleepy dog.\nLine three stays the same.\nLine four is new.");
  const [mode, setMode] = useState<"line" | "word">("line");
  const [ignoreCase, setIgnoreCase] = useState(false);

  const parts = useMemo(() => {
    const A = ignoreCase ? a.toLowerCase() : a;
    const B = ignoreCase ? b.toLowerCase() : b;
    return mode === "line" ? diffLines(A, B) : diffWords(A, B);
  }, [a, b, mode, ignoreCase]);

  const stats = useMemo(() => {
    let added = 0, removed = 0;
    parts.forEach((p) => {
      const lines = p.value.split("\n").filter(Boolean).length;
      if (p.added) added += lines;
      else if (p.removed) removed += lines;
    });
    return { added, removed };
  }, [parts]);

  return (
    <>
      <SEOHead {...getSeoProps("/diff-checker")!} />
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-12 lg:py-20">
        <header className="mb-12">
          <span className="text-primary tracking-[0.2em] font-extrabold uppercase mb-4 block text-xs font-label">Developer Tool</span>
          <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tighter mb-6 leading-[0.9]">
            Diff Checker <br /><span className="text-secondary">Text Compare</span>
          </h1>
          <p className="max-w-xl text-on-surface-variant text-lg leading-relaxed">
            Compare two text blocks side-by-side with line or word level diff highlighting. Detect added, removed and changed content instantly.
          </p>
        </header>

        <div className="flex flex-wrap gap-4 items-center mb-4">
          <div className="bg-surface-container rounded-lg p-1 flex">
            {(["line", "word"] as const).map((m) => (
              <button key={m} onClick={() => setMode(m)}
                className={`px-4 py-1.5 rounded text-sm font-bold ${mode === m ? "bg-primary text-on-primary" : "text-on-surface-variant"}`}>{m === "line" ? "Line Diff" : "Word Diff"}</button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={ignoreCase} onChange={(e) => setIgnoreCase(e.target.checked)} /> Ignore case
          </label>
          <div className="ml-auto flex gap-3 text-sm">
            <span className="text-primary font-bold">+{stats.added} added</span>
            <span className="text-destructive font-bold">−{stats.removed} removed</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-xs font-label uppercase tracking-widest text-on-surface-variant block mb-2">Original</label>
            <textarea value={a} onChange={(e) => setA(e.target.value)}
              className="w-full h-60 bg-surface-container rounded-xl p-4 font-mono text-sm outline-none focus:ring-1 focus:ring-primary resize-y" />
          </div>
          <div>
            <label className="text-xs font-label uppercase tracking-widest text-on-surface-variant block mb-2">Changed</label>
            <textarea value={b} onChange={(e) => setB(e.target.value)}
              className="w-full h-60 bg-surface-container rounded-xl p-4 font-mono text-sm outline-none focus:ring-1 focus:ring-primary resize-y" />
          </div>
        </div>

        <div className="bg-surface-container rounded-xl p-5">
          <h3 className="font-headline font-bold mb-3">Diff Result</h3>
          <pre className="font-mono text-sm whitespace-pre-wrap break-words bg-surface-container-lowest rounded-lg p-4 max-h-[500px] overflow-y-auto">
            {parts.map((p, i) => (
              <span key={i} className={p.added ? "bg-primary/20 text-primary" : p.removed ? "bg-destructive/20 text-destructive line-through" : "text-on-surface-variant"}>
                {p.value}
              </span>
            ))}
          </pre>
        </div>

        <ToolSeoSection path="/diff-checker" />
        <RelatedTools currentPath="/diff-checker" />
      </div>
    </>
  );
};

export default DiffChecker;
