import { useMemo, useState } from "react";
import SEOHead from "@/components/SEOHead";
import { getSeoProps } from "@/lib/seo";
import ToolSeoSection from "@/components/ToolSeoSection";
import RelatedTools from "@/components/RelatedTools";
import { useToast } from "@/hooks/use-toast";

const cheats = [
  { token: "\\d", desc: "digit 0-9" },
  { token: "\\w", desc: "word char [A-Za-z0-9_]" },
  { token: "\\s", desc: "whitespace" },
  { token: ".", desc: "any char except newline" },
  { token: "^ $", desc: "start / end of line" },
  { token: "[abc]", desc: "any of a, b, c" },
  { token: "a|b", desc: "a or b" },
  { token: "a{2,4}", desc: "2 to 4 of a" },
  { token: "(?:...)", desc: "non-capturing group" },
  { token: "(?<name>..)", desc: "named group" },
];

const RegexTester = () => {
  const { toast } = useToast();
  const [pattern, setPattern] = useState("\\b[A-Z]\\w+");
  const [flags, setFlags] = useState("gi");
  const [text, setText] = useState("WeboGrowth Tools are Built for Speed and Privacy.");
  const [replace, setReplace] = useState("");

  const result = useMemo(() => {
    if (!pattern) return { matches: [] as RegExpMatchArray[], error: null as string | null };
    try {
      const re = new RegExp(pattern, flags);
      const matches = flags.includes("g")
        ? Array.from(text.matchAll(re))
        : (text.match(re) ? [text.match(re) as RegExpMatchArray] : []);
      return { matches, error: null };
    } catch (e) {
      return { matches: [], error: (e as Error).message };
    }
  }, [pattern, flags, text]);

  const replaced = useMemo(() => {
    if (!pattern || result.error) return "";
    try {
      const re = new RegExp(pattern, flags);
      return text.replace(re, replace);
    } catch {
      return "";
    }
  }, [pattern, flags, text, replace, result.error]);

  const highlighted = useMemo(() => {
    if (result.error || !result.matches.length) return text;
    const parts: { t: string; m: boolean }[] = [];
    let cursor = 0;
    for (const m of result.matches) {
      const i = m.index ?? -1;
      if (i < 0) continue;
      if (i > cursor) parts.push({ t: text.slice(cursor, i), m: false });
      parts.push({ t: m[0], m: true });
      cursor = i + m[0].length;
    }
    if (cursor < text.length) parts.push({ t: text.slice(cursor), m: false });
    return parts;
  }, [text, result]);

  const toggleFlag = (f: string) => setFlags((cur) => (cur.includes(f) ? cur.replace(f, "") : cur + f));

  return (
    <>
      <SEOHead {...getSeoProps("/regex-tester")!} />
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-12 lg:py-20">
        <header className="mb-12">
          <span className="text-primary tracking-[0.2em] font-extrabold uppercase mb-4 block text-xs font-label">Developer Tool</span>
          <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tighter mb-6 leading-[0.9]">
            Regex Tester <br /><span className="text-secondary">& Builder</span>
          </h1>
          <p className="max-w-xl text-on-surface-variant text-lg leading-relaxed">
            Test JavaScript regular expressions live with match highlighting, capture groups, replace preview and a cheat sheet.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-surface-container rounded-xl p-5 space-y-3">
              <label className="text-xs font-label uppercase tracking-widest text-on-surface-variant">Pattern</label>
              <div className="flex gap-2 items-center">
                <span className="text-on-surface-variant">/</span>
                <input
                  value={pattern}
                  onChange={(e) => setPattern(e.target.value)}
                  className="flex-1 bg-surface-container-lowest rounded-lg px-3 py-2 font-mono text-sm outline-none focus:ring-1 focus:ring-primary"
                />
                <span className="text-on-surface-variant">/</span>
                <input
                  value={flags}
                  onChange={(e) => setFlags(e.target.value.replace(/[^gimsuy]/g, ""))}
                  className="w-20 bg-surface-container-lowest rounded-lg px-3 py-2 font-mono text-sm outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {["g", "i", "m", "s", "u", "y"].map((f) => (
                  <button
                    key={f}
                    onClick={() => toggleFlag(f)}
                    className={`px-3 py-1 rounded-md text-xs font-bold font-mono ${flags.includes(f) ? "bg-primary text-on-primary" : "bg-surface-container-lowest text-on-surface-variant"}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              {result.error && (
                <div className="bg-destructive/10 text-destructive rounded-lg p-3 text-sm font-mono">{result.error}</div>
              )}
            </div>

            <div className="bg-surface-container rounded-xl p-5 space-y-2">
              <label className="text-xs font-label uppercase tracking-widest text-on-surface-variant">Test String</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full h-40 bg-surface-container-lowest rounded-lg p-3 font-mono text-sm outline-none focus:ring-1 focus:ring-primary resize-none"
              />
              <div className="bg-surface-container-lowest rounded-lg p-3 font-mono text-sm whitespace-pre-wrap break-words min-h-[60px]">
                {typeof highlighted === "string" ? (
                  <span className="text-on-surface-variant">{highlighted}</span>
                ) : (
                  highlighted.map((p, i) =>
                    p.m ? (
                      <mark key={i} className="bg-primary/30 text-foreground rounded px-0.5">{p.t}</mark>
                    ) : (
                      <span key={i}>{p.t}</span>
                    ),
                  )
                )}
              </div>
            </div>

            <div className="bg-surface-container rounded-xl p-5 space-y-2">
              <label className="text-xs font-label uppercase tracking-widest text-on-surface-variant">Replace With</label>
              <input
                value={replace}
                onChange={(e) => setReplace(e.target.value)}
                placeholder="$&  or  named groups: $<name>"
                className="w-full bg-surface-container-lowest rounded-lg px-3 py-2 font-mono text-sm outline-none focus:ring-1 focus:ring-primary"
              />
              <div className="bg-surface-container-lowest rounded-lg p-3 font-mono text-sm whitespace-pre-wrap break-words min-h-[60px] text-primary">
                {replaced || <span className="text-on-surface-variant/50">Replacement preview</span>}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-surface-container rounded-xl p-5">
              <h3 className="font-headline font-bold mb-3">Matches <span className="text-primary">({result.matches.length})</span></h3>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {result.matches.map((m, i) => (
                  <div key={i} className="bg-surface-container-lowest rounded-lg p-2 text-xs font-mono">
                    <div className="text-primary">#{i + 1} @{m.index}: <span className="text-foreground">{m[0]}</span></div>
                    {m.length > 1 && (
                      <div className="text-on-surface-variant mt-1">
                        {m.slice(1).map((g, gi) => <div key={gi}>$ {gi + 1}: {g ?? "—"}</div>)}
                      </div>
                    )}
                  </div>
                ))}
                {!result.matches.length && !result.error && (
                  <p className="text-on-surface-variant text-sm">No matches.</p>
                )}
              </div>
            </div>

            <div className="bg-surface-container rounded-xl p-5">
              <h3 className="font-headline font-bold mb-3">Cheat Sheet</h3>
              <div className="space-y-1 text-xs">
                {cheats.map((c) => (
                  <div key={c.token} className="flex justify-between gap-3 py-1 border-b border-outline-variant/10 last:border-0">
                    <code className="text-primary font-mono">{c.token}</code>
                    <span className="text-on-surface-variant text-right">{c.desc}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => { navigator.clipboard.writeText(`/${pattern}/${flags}`); toast({ title: "Pattern copied" }); }}
                className="w-full mt-4 bg-primary text-on-primary font-bold py-2 rounded-lg text-sm"
              >
                Copy Pattern
              </button>
            </div>
          </div>
        </div>

        <ToolSeoSection path="/regex-tester" />
        <RelatedTools currentPath="/regex-tester" />
      </div>
    </>
  );
};

export default RegexTester;
