import { useState } from "react";
import SEOHead from "@/components/SEOHead";
import RelatedTools from "@/components/RelatedTools";

const OgPreview = () => {
  const [ogTitle, setOgTitle] = useState("My Awesome Page");
  const [ogDesc, setOgDesc] = useState("This is a description of my page that appears in social media previews.");
  const [ogImage, setOgImage] = useState("https://via.placeholder.com/1200x630/3B82F6/FFFFFF?text=OG+Image");
  const [ogUrl, setOgUrl] = useState("https://example.com");
  const [siteName, setSiteName] = useState("Example Site");

  return (
    <>
      <SEOHead
        title="Open Graph Preview Tool - Test OG Tags Free | WeboGrowth"
        description="Preview how your website will look when shared on Facebook, Twitter, and LinkedIn. Test Open Graph meta tags without deploying. Free OG tag preview tool."
        keywords="og preview tool, open graph preview, test og tags, social media preview, facebook preview, twitter card preview"
        canonicalPath="/og-preview"
        jsonLd={{ "@context": "https://schema.org", "@type": "SoftwareApplication", name: "Open Graph Preview Tool", url: "https://tools.webogrowth.com/og-preview", applicationCategory: "DeveloperApplication", operatingSystem: "Any", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, author: { "@type": "Organization", name: "WeboGrowth", url: "https://webogrowth.com" } }}
      />
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-12 lg:py-20">
        <header className="mb-12">
          <span className="text-primary tracking-[0.2em] font-extrabold uppercase mb-4 block text-xs font-label">SEO Tool</span>
          <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tighter mb-6 leading-[0.9]">
            Open Graph <br /><span className="text-secondary">Preview</span>
          </h1>
          <p className="max-w-xl text-on-surface-variant text-lg leading-relaxed">
            Preview how your page will appear when shared on social media. Test your Open Graph tags before deploying.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-5">
            <div>
              <label className="text-sm font-label uppercase tracking-widest text-on-surface-variant block mb-2">OG Title</label>
              <input value={ogTitle} onChange={(e) => setOgTitle(e.target.value)} className="w-full bg-surface-container rounded-xl px-6 py-4 text-foreground outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="text-sm font-label uppercase tracking-widest text-on-surface-variant block mb-2">OG Description</label>
              <textarea value={ogDesc} onChange={(e) => setOgDesc(e.target.value)} rows={3} className="w-full bg-surface-container rounded-xl px-6 py-4 text-foreground outline-none focus:ring-1 focus:ring-primary resize-none" />
            </div>
            <div>
              <label className="text-sm font-label uppercase tracking-widest text-on-surface-variant block mb-2">OG Image URL</label>
              <input value={ogImage} onChange={(e) => setOgImage(e.target.value)} className="w-full bg-surface-container rounded-xl px-6 py-4 text-foreground outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="text-sm font-label uppercase tracking-widest text-on-surface-variant block mb-2">Page URL</label>
              <input value={ogUrl} onChange={(e) => setOgUrl(e.target.value)} className="w-full bg-surface-container rounded-xl px-6 py-4 text-foreground outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="text-sm font-label uppercase tracking-widest text-on-surface-variant block mb-2">Site Name</label>
              <input value={siteName} onChange={(e) => setSiteName(e.target.value)} className="w-full bg-surface-container rounded-xl px-6 py-4 text-foreground outline-none focus:ring-1 focus:ring-primary" />
            </div>
          </div>

          <div className="space-y-8">
            {/* Facebook Preview */}
            <div>
              <h3 className="text-sm font-label uppercase tracking-widest text-on-surface-variant mb-3">Facebook Preview</h3>
              <div className="bg-[#242526] rounded-lg overflow-hidden border border-[#3E4042]">
                <img src={ogImage} alt="OG Preview" className="w-full h-48 object-cover" />
                <div className="p-3">
                  <p className="text-[#B0B3B8] text-xs uppercase">{new URL(ogUrl || "https://example.com").hostname}</p>
                  <p className="text-[#E4E6EB] font-bold text-base mt-1">{ogTitle}</p>
                  <p className="text-[#B0B3B8] text-sm mt-1 line-clamp-2">{ogDesc}</p>
                </div>
              </div>
            </div>

            {/* Twitter Preview */}
            <div>
              <h3 className="text-sm font-label uppercase tracking-widest text-on-surface-variant mb-3">Twitter Preview</h3>
              <div className="bg-[#15202B] rounded-2xl overflow-hidden border border-[#38444D]">
                <img src={ogImage} alt="OG Preview" className="w-full h-44 object-cover" />
                <div className="p-3">
                  <p className="text-[#8B98A5] text-sm">{siteName}</p>
                  <p className="text-[#E7E9EA] font-bold">{ogTitle}</p>
                  <p className="text-[#8B98A5] text-sm line-clamp-2">{ogDesc}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <RelatedTools currentPath="/og-preview" />
      </div>
    </>
  );
};

export default OgPreview;
