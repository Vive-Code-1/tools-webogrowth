import { useState } from "react";
import SEOHead from "@/components/SEOHead";
import RelatedTools from "@/components/RelatedTools";

const MetaTagGenerator = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [keywords, setKeywords] = useState("");
  const [author, setAuthor] = useState("");
  const [ogUrl, setOgUrl] = useState("");

  const generatedCode = `<title>${title}</title>
<meta name="description" content="${description}" />
<meta name="keywords" content="${keywords}" />
<meta name="author" content="${author}" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${description}" />
<meta property="og:url" content="${ogUrl}" />
<meta property="og:type" content="website" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${title}" />
<meta name="twitter:description" content="${description}" />`;

  const handleCopy = () => navigator.clipboard.writeText(generatedCode);

  return (
    <>
      <SEOHead
        title="Meta Tag Generator for SEO - Free Online Tool | WeboGrowth"
        description="Generate perfect meta tags for your website. Create title, description, Open Graph, and Twitter Card tags to boost your SEO and social media presence."
        keywords="meta tag generator, seo meta tags, og tags generator, twitter card generator, meta description generator, seo tools free"
        canonicalPath="/meta-tag-generator"
        jsonLd={{ "@context": "https://schema.org", "@type": "SoftwareApplication", name: "Meta Tag Generator", url: "https://tools.webogrowth.com/meta-tag-generator", applicationCategory: "DeveloperApplication", operatingSystem: "Any", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, author: { "@type": "Organization", name: "WeboGrowth", url: "https://webogrowth.com" } }}
      />
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-12 lg:py-20">
        <header className="mb-12">
          <span className="text-primary tracking-[0.2em] font-extrabold uppercase mb-4 block text-xs font-label">SEO Tool</span>
          <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tighter mb-6 leading-[0.9]">
            Meta Tag <br /><span className="text-secondary">Generator</span>
          </h1>
          <p className="max-w-xl text-on-surface-variant text-lg leading-relaxed">
            Generate optimized meta tags for better search engine rankings and social media previews. Includes Open Graph and Twitter Card support.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-5">
            <div>
              <label className="text-sm font-label uppercase tracking-widest text-on-surface-variant block mb-2">Page Title <span className="text-primary">({title.length}/60)</span></label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Your Page Title" className="w-full bg-surface-container rounded-xl px-6 py-4 text-foreground placeholder:text-foreground/30 outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="text-sm font-label uppercase tracking-widest text-on-surface-variant block mb-2">Meta Description <span className="text-primary">({description.length}/160)</span></label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Your page description..." rows={3} className="w-full bg-surface-container rounded-xl px-6 py-4 text-foreground placeholder:text-foreground/30 outline-none focus:ring-1 focus:ring-primary resize-none" />
            </div>
            <div>
              <label className="text-sm font-label uppercase tracking-widest text-on-surface-variant block mb-2">Keywords</label>
              <input value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="keyword1, keyword2, keyword3" className="w-full bg-surface-container rounded-xl px-6 py-4 text-foreground placeholder:text-foreground/30 outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="text-sm font-label uppercase tracking-widest text-on-surface-variant block mb-2">Author</label>
              <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Author name" className="w-full bg-surface-container rounded-xl px-6 py-4 text-foreground placeholder:text-foreground/30 outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="text-sm font-label uppercase tracking-widest text-on-surface-variant block mb-2">Page URL</label>
              <input value={ogUrl} onChange={(e) => setOgUrl(e.target.value)} placeholder="https://example.com" className="w-full bg-surface-container rounded-xl px-6 py-4 text-foreground placeholder:text-foreground/30 outline-none focus:ring-1 focus:ring-primary" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-label uppercase tracking-widest text-on-surface-variant">Generated HTML</label>
              <button onClick={handleCopy} className="text-xs text-primary font-bold uppercase tracking-widest hover:underline flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">content_copy</span>Copy
              </button>
            </div>
            <pre className="w-full bg-surface-container-highest rounded-xl p-6 font-mono text-sm text-foreground overflow-x-auto whitespace-pre-wrap min-h-[320px]">{generatedCode}</pre>
          </div>
        </div>

        <section className="mt-24">
          <h2 className="text-3xl font-headline font-bold mb-8">Why Meta Tags Matter for SEO</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: "search", title: "Search Rankings", desc: "Well-crafted meta titles and descriptions help search engines understand your page content and improve click-through rates." },
              { icon: "share", title: "Social Sharing", desc: "Open Graph and Twitter Card tags control how your page appears when shared on social media platforms." },
              { icon: "verified", title: "Professional Appearance", desc: "Proper meta tags make your website look professional and trustworthy in search results and social feeds." },
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

        <RelatedTools currentPath="/meta-tag-generator" />
      </div>
    </>
  );
};

export default MetaTagGenerator;
