import { useState } from "react";
import TurndownService from "turndown";
import SEOHead from "@/components/SEOHead";
import RelatedTools from "@/components/RelatedTools";

const turndown = new TurndownService({ headingStyle: "atx", codeBlockStyle: "fenced" });

const HtmlToMarkdown = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const handleConvert = () => {
    try {
      const md = turndown.turndown(input);
      setOutput(md);
    } catch {
      setOutput("Error: Could not convert the provided HTML.");
    }
  };

  const handleCopy = () => navigator.clipboard.writeText(output);

  return (
    <>
      <SEOHead
        title="HTML to Markdown Converter Online Free | WeboGrowth"
        description="Convert HTML to Markdown online for free. Paste HTML code and get clean, readable Markdown output instantly. Supports headings, links, images, and code blocks."
        keywords="html to markdown, convert html to markdown, html to md, markdown converter online, html converter free"
        canonicalPath="/html-to-markdown"
        jsonLd={{ "@context": "https://schema.org", "@type": "SoftwareApplication", name: "HTML to Markdown Converter", url: "https://tools.webogrowth.com/html-to-markdown", applicationCategory: "DeveloperApplication", operatingSystem: "Any", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, author: { "@type": "Organization", name: "WeboGrowth", url: "https://webogrowth.com" } }}
      />
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-12 lg:py-20">
        <header className="mb-12">
          <span className="text-primary tracking-[0.2em] font-extrabold uppercase mb-4 block text-xs font-label">Developer Tool</span>
          <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tighter mb-6 leading-[0.9]">
            HTML to <br /><span className="text-secondary">Markdown</span>
          </h1>
          <p className="max-w-xl text-on-surface-variant text-lg leading-relaxed">
            Convert HTML code to clean, readable Markdown format. Supports headings, links, images, lists, and code blocks.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <label className="text-sm font-label uppercase tracking-widest text-on-surface-variant block">Input HTML</label>
            <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="<h1>Hello World</h1><p>This is a paragraph.</p>" className="w-full h-72 bg-surface-container rounded-xl p-6 font-mono text-sm text-foreground placeholder:text-foreground/30 outline-none focus:ring-1 focus:ring-primary resize-none" />
            <button onClick={handleConvert} className="w-full bg-primary text-on-primary py-4 rounded-lg font-bold hover:shadow-[0_0_20px_hsla(82,98%,72%,0.3)] transition-all flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">transform</span>Convert to Markdown
            </button>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-label uppercase tracking-widest text-on-surface-variant">Markdown Output</label>
              {output && (
                <button onClick={handleCopy} className="text-xs text-primary font-bold uppercase tracking-widest hover:underline flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">content_copy</span>Copy
                </button>
              )}
            </div>
            <textarea value={output} readOnly placeholder="Markdown will appear here..." className="w-full h-72 bg-surface-container-highest rounded-xl p-6 font-mono text-sm text-foreground placeholder:text-foreground/30 outline-none resize-none" />
          </div>
        </div>

        <section className="mt-24">
          <h2 className="text-3xl font-headline font-bold mb-8">Why Convert HTML to Markdown?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: "edit_note", title: "Simpler Writing", desc: "Markdown is easier to read and write than HTML. Perfect for documentation and README files." },
              { icon: "devices", title: "Cross-Platform", desc: "Markdown works everywhere — GitHub, Notion, blogs, and static site generators all support it." },
              { icon: "speed", title: "Faster Editing", desc: "No need to deal with HTML tags. Write content faster with clean, minimal syntax." },
            ].map((f) => (
              <div key={f.title} className="bg-surface-container-low p-8 rounded-xl">
                <div className="w-12 h-12 bg-secondary-container rounded-lg flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-secondary">{f.icon}</span>
                </div>
                <h3 className="font-headline font-bold text-xl mb-3">{f.title}</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <RelatedTools currentPath="/html-to-markdown" />
      </div>
    </>
  );
};

export default HtmlToMarkdown;
