import { useMemo, useState } from "react";
import SEOHead from "@/components/SEOHead";
import { getSeoProps } from "@/lib/seo";
import ToolSeoSection from "@/components/ToolSeoSection";
import RelatedTools from "@/components/RelatedTools";
import { useToast } from "@/hooks/use-toast";

type Entry = { loc: string; lastmod: string; changefreq: string; priority: string };

const today = () => new Date().toISOString().slice(0, 10);

const SitemapGenerator = () => {
  const { toast } = useToast();
  const [bulk, setBulk] = useState("");
  const [entries, setEntries] = useState<Entry[]>([
    { loc: "https://example.com/", lastmod: today(), changefreq: "weekly", priority: "1.0" },
  ]);
  const [defaultFreq, setDefaultFreq] = useState("monthly");
  const [defaultPrio, setDefaultPrio] = useState("0.8");
  const [validation, setValidation] = useState<{ ok: boolean; msg: string } | null>(null);

  const importBulk = () => {
    const urls = bulk.split(/\s+/).map((s) => s.trim()).filter((s) => /^https?:\/\//i.test(s));
    if (!urls.length) return;
    const next: Entry[] = urls.map((u) => ({ loc: u, lastmod: today(), changefreq: defaultFreq, priority: defaultPrio }));
    setEntries(next);
    setBulk("");
    toast({ title: `Imported ${urls.length} URLs` });
  };

  const xml = useMemo(() => {
    const items = entries.filter((e) => e.loc.trim()).map((e) =>
      `  <url>\n    <loc>${e.loc}</loc>\n    <lastmod>${e.lastmod}</lastmod>\n    <changefreq>${e.changefreq}</changefreq>\n    <priority>${e.priority}</priority>\n  </url>`
    ).join("\n");
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</urlset>`;
  }, [entries]);

  const validate = () => {
    try {
      const doc = new DOMParser().parseFromString(xml, "text/xml");
      const err = doc.querySelector("parsererror");
      const urls = doc.getElementsByTagName("url").length;
      if (err) throw new Error("Malformed XML");
      if (urls > 50000) throw new Error("Sitemap exceeds 50,000 URL limit");
      setValidation({ ok: true, msg: `Valid. ${urls} URL${urls > 1 ? "s" : ""}, ${(new Blob([xml]).size / 1024).toFixed(1)} KB.` });
    } catch (e: any) {
      setValidation({ ok: false, msg: e.message });
    }
  };

  const download = () => {
    const blob = new Blob([xml], { type: "application/xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "sitemap.xml"; a.click();
  };

  const robots = `User-agent: *\nAllow: /\n\nSitemap: ${entries[0]?.loc ? new URL(entries[0].loc).origin + "/sitemap.xml" : "https://example.com/sitemap.xml"}`;

  return (
    <>
      <SEOHead {...getSeoProps("/sitemap-generator")!} />
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-12 lg:py-20">
        <header className="mb-12">
          <span className="text-primary tracking-[0.2em] font-extrabold uppercase mb-4 block text-xs font-label">SEO Tool</span>
          <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tighter mb-6 leading-[0.9]">
            Sitemap Generator <br /><span className="text-secondary">& Validator</span>
          </h1>
          <p className="max-w-xl text-on-surface-variant text-lg leading-relaxed">
            Build a Google-ready XML sitemap from a URL list with per-page priority, changefreq and lastmod. Validate against the sitemap.org spec.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-surface-container rounded-xl p-5 space-y-3">
              <h3 className="font-headline font-bold">Bulk Import URLs</h3>
              <textarea value={bulk} onChange={(e) => setBulk(e.target.value)} placeholder="Paste URLs, one per line"
                className="w-full h-32 bg-surface-container-lowest rounded-lg p-3 font-mono text-sm outline-none resize-none" />
              <div className="grid grid-cols-2 gap-2">
                <select value={defaultFreq} onChange={(e) => setDefaultFreq(e.target.value)} className="bg-surface-container-lowest rounded px-2 py-1.5 text-sm">
                  {["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"].map((f) => <option key={f}>{f}</option>)}
                </select>
                <input value={defaultPrio} onChange={(e) => setDefaultPrio(e.target.value)} placeholder="Priority"
                  className="bg-surface-container-lowest rounded px-2 py-1.5 text-sm" />
              </div>
              <button onClick={importBulk} className="w-full bg-primary text-on-primary font-bold py-2 rounded-lg">Import</button>
            </div>

            <div className="bg-surface-container rounded-xl p-5 space-y-2 max-h-[500px] overflow-y-auto">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-headline font-bold">URLs ({entries.length})</h3>
                <button onClick={() => setEntries((e) => [...e, { loc: "", lastmod: today(), changefreq: defaultFreq, priority: defaultPrio }])}
                  className="text-xs text-primary">+ Add</button>
              </div>
              {entries.map((e, i) => (
                <div key={i} className="bg-surface-container-lowest rounded-lg p-2 space-y-2">
                  <input value={e.loc} onChange={(ev) => setEntries((arr) => arr.map((x, ix) => ix === i ? { ...x, loc: ev.target.value } : x))}
                    placeholder="https://..." className="w-full bg-surface-container rounded px-2 py-1.5 text-sm font-mono outline-none" />
                  <div className="grid grid-cols-3 gap-2">
                    <input type="date" value={e.lastmod} onChange={(ev) => setEntries((arr) => arr.map((x, ix) => ix === i ? { ...x, lastmod: ev.target.value } : x))}
                      className="bg-surface-container rounded px-2 py-1 text-xs outline-none" />
                    <select value={e.changefreq} onChange={(ev) => setEntries((arr) => arr.map((x, ix) => ix === i ? { ...x, changefreq: ev.target.value } : x))}
                      className="bg-surface-container rounded px-2 py-1 text-xs">
                      {["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"].map((f) => <option key={f}>{f}</option>)}
                    </select>
                    <div className="flex gap-1">
                      <input value={e.priority} onChange={(ev) => setEntries((arr) => arr.map((x, ix) => ix === i ? { ...x, priority: ev.target.value } : x))}
                        className="flex-1 bg-surface-container rounded px-2 py-1 text-xs outline-none" />
                      <button onClick={() => setEntries((arr) => arr.filter((_, ix) => ix !== i))} className="text-destructive px-1">×</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex gap-2">
              <button onClick={validate} className="flex-1 bg-secondary text-on-secondary font-bold py-2 rounded-lg">Validate</button>
              <button onClick={download} className="flex-1 bg-primary text-on-primary font-bold py-2 rounded-lg">Download XML</button>
            </div>
            {validation && (
              <div className={`rounded-lg p-3 text-sm ${validation.ok ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>{validation.msg}</div>
            )}
            <div className="bg-surface-container rounded-xl p-5">
              <div className="flex justify-between mb-2">
                <h3 className="font-headline font-bold">sitemap.xml</h3>
                <button onClick={() => { navigator.clipboard.writeText(xml); toast({ title: "Copied" }); }} className="text-xs text-primary">Copy</button>
              </div>
              <pre className="font-mono text-xs bg-surface-container-lowest rounded-lg p-4 overflow-x-auto max-h-[400px]">{xml}</pre>
            </div>
            <div className="bg-surface-container rounded-xl p-5">
              <div className="flex justify-between mb-2">
                <h3 className="font-headline font-bold">Suggested robots.txt</h3>
                <button onClick={() => { navigator.clipboard.writeText(robots); toast({ title: "Copied" }); }} className="text-xs text-primary">Copy</button>
              </div>
              <pre className="font-mono text-xs bg-surface-container-lowest rounded-lg p-4">{robots}</pre>
            </div>
          </div>
        </div>

        <ToolSeoSection path="/sitemap-generator" />
        <RelatedTools currentPath="/sitemap-generator" />
      </div>
    </>
  );
};

export default SitemapGenerator;
