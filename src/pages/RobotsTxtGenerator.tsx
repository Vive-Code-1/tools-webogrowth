import { useState } from "react";
import SEOHead from "@/components/SEOHead";
import RelatedTools from "@/components/RelatedTools";

interface Rule {
  userAgent: string;
  allow: string;
  disallow: string;
}

const RobotsTxtGenerator = () => {
  const [rules, setRules] = useState<Rule[]>([{ userAgent: "*", allow: "/", disallow: "" }]);
  const [sitemapUrl, setSitemapUrl] = useState("");

  const addRule = () => setRules([...rules, { userAgent: "*", allow: "", disallow: "" }]);
  const removeRule = (i: number) => setRules(rules.filter((_, idx) => idx !== i));
  const updateRule = (i: number, field: keyof Rule, value: string) => {
    const updated = [...rules];
    updated[i] = { ...updated[i], [field]: value };
    setRules(updated);
  };

  const output = rules
    .map((r) => {
      let block = `User-agent: ${r.userAgent}`;
      if (r.allow) block += `\nAllow: ${r.allow}`;
      if (r.disallow) block += `\nDisallow: ${r.disallow}`;
      return block;
    })
    .join("\n\n") + (sitemapUrl ? `\n\nSitemap: ${sitemapUrl}` : "");

  const handleCopy = () => navigator.clipboard.writeText(output);
  const handleDownload = () => {
    const blob = new Blob([output], { type: "text/plain" });
    const link = document.createElement("a");
    link.download = "robots.txt";
    link.href = URL.createObjectURL(blob);
    link.click();
  };

  return (
    <>
      <SEOHead
        title="Robots.txt Generator Free Online | WeboGrowth"
        description="Generate robots.txt files for your website with our free online tool. Control search engine crawling, add sitemap references, and manage bot access easily."
        keywords="robots.txt generator, create robots.txt, robots.txt maker, seo robots file, search engine crawl control"
        canonicalPath="/robots-generator"
      />
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-12 lg:py-20">
        <header className="mb-12">
          <span className="text-primary tracking-[0.2em] font-extrabold uppercase mb-4 block text-xs font-label">SEO Tool</span>
          <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tighter mb-6 leading-[0.9]">
            Robots.txt <br /><span className="text-secondary">Generator</span>
          </h1>
          <p className="max-w-xl text-on-surface-variant text-lg leading-relaxed">
            Create robots.txt files to control how search engines crawl your site. Add rules, specify sitemaps, and download the file.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            {rules.map((rule, i) => (
              <div key={i} className="bg-surface-container rounded-xl p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-label uppercase tracking-widest text-on-surface-variant">Rule {i + 1}</span>
                  {rules.length > 1 && (
                    <button onClick={() => removeRule(i)} className="text-error text-xs font-bold uppercase hover:underline">Remove</button>
                  )}
                </div>
                <input value={rule.userAgent} onChange={(e) => updateRule(i, "userAgent", e.target.value)} placeholder="User-agent (e.g. *)" className="w-full bg-surface-container-highest rounded-lg px-4 py-3 text-foreground outline-none focus:ring-1 focus:ring-primary font-mono text-sm" />
                <input value={rule.allow} onChange={(e) => updateRule(i, "allow", e.target.value)} placeholder="Allow (e.g. /)" className="w-full bg-surface-container-highest rounded-lg px-4 py-3 text-foreground outline-none focus:ring-1 focus:ring-primary font-mono text-sm" />
                <input value={rule.disallow} onChange={(e) => updateRule(i, "disallow", e.target.value)} placeholder="Disallow (e.g. /admin)" className="w-full bg-surface-container-highest rounded-lg px-4 py-3 text-foreground outline-none focus:ring-1 focus:ring-primary font-mono text-sm" />
              </div>
            ))}
            <button onClick={addRule} className="text-primary font-bold text-sm hover:underline flex items-center gap-1">
              <span className="material-symbols-outlined text-lg">add</span>Add Rule
            </button>
            <div>
              <label className="text-sm font-label uppercase tracking-widest text-on-surface-variant block mb-2">Sitemap URL</label>
              <input value={sitemapUrl} onChange={(e) => setSitemapUrl(e.target.value)} placeholder="https://example.com/sitemap.xml" className="w-full bg-surface-container rounded-lg px-4 py-3 text-foreground outline-none focus:ring-1 focus:ring-primary font-mono text-sm" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-label uppercase tracking-widest text-on-surface-variant">Output</label>
              <div className="flex gap-3">
                <button onClick={handleCopy} className="text-xs text-primary font-bold uppercase tracking-widest hover:underline flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">content_copy</span>Copy
                </button>
                <button onClick={handleDownload} className="text-xs text-secondary font-bold uppercase tracking-widest hover:underline flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">download</span>Download
                </button>
              </div>
            </div>
            <pre className="w-full bg-surface-container-highest rounded-xl p-6 font-mono text-sm text-foreground whitespace-pre-wrap min-h-[300px]">{output}</pre>
          </div>
        </div>

        <RelatedTools currentPath="/robots-generator" />
      </div>
    </>
  );
};

export default RobotsTxtGenerator;
