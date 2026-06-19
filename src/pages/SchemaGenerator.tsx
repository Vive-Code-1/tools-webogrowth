import { useMemo, useState } from "react";
import SEOHead from "@/components/SEOHead";
import { getSeoProps } from "@/lib/seo";
import ToolSeoSection from "@/components/ToolSeoSection";
import RelatedTools from "@/components/RelatedTools";
import { useToast } from "@/hooks/use-toast";

type SchemaType = "Article" | "Product" | "FAQPage" | "LocalBusiness" | "Organization" | "BreadcrumbList" | "Event";

const SchemaGenerator = () => {
  const { toast } = useToast();
  const [type, setType] = useState<SchemaType>("Article");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [faqs, setFaqs] = useState<{ q: string; a: string }[]>([{ q: "", a: "" }]);
  const [crumbs, setCrumbs] = useState<{ name: string; url: string }[]>([{ name: "", url: "" }]);

  const v = (k: string) => fields[k] || "";
  const set = (k: string, val: string) => setFields((f) => ({ ...f, [k]: val }));

  const schema = useMemo(() => {
    const base: any = { "@context": "https://schema.org", "@type": type };
    if (type === "Article") {
      Object.assign(base, {
        headline: v("headline"),
        image: v("image") ? [v("image")] : undefined,
        author: v("author") ? { "@type": "Person", name: v("author") } : undefined,
        publisher: v("publisher") ? { "@type": "Organization", name: v("publisher") } : undefined,
        datePublished: v("datePublished") || undefined,
        dateModified: v("dateModified") || undefined,
        description: v("description") || undefined,
      });
    } else if (type === "Product") {
      Object.assign(base, {
        name: v("name"),
        image: v("image") ? [v("image")] : undefined,
        description: v("description") || undefined,
        sku: v("sku") || undefined,
        brand: v("brand") ? { "@type": "Brand", name: v("brand") } : undefined,
        offers: v("price") ? {
          "@type": "Offer",
          price: v("price"),
          priceCurrency: v("currency") || "USD",
          availability: `https://schema.org/${v("availability") || "InStock"}`,
          url: v("url") || undefined,
        } : undefined,
        aggregateRating: v("rating") ? {
          "@type": "AggregateRating",
          ratingValue: v("rating"),
          reviewCount: v("reviews") || "1",
        } : undefined,
      });
    } else if (type === "FAQPage") {
      base.mainEntity = faqs.filter((f) => f.q && f.a).map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      }));
    } else if (type === "BreadcrumbList") {
      base.itemListElement = crumbs.filter((c) => c.name).map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: c.name,
        item: c.url || undefined,
      }));
    } else if (type === "LocalBusiness") {
      Object.assign(base, {
        name: v("name"),
        image: v("image") || undefined,
        telephone: v("phone") || undefined,
        priceRange: v("priceRange") || undefined,
        address: {
          "@type": "PostalAddress",
          streetAddress: v("street") || undefined,
          addressLocality: v("city") || undefined,
          addressRegion: v("region") || undefined,
          postalCode: v("postal") || undefined,
          addressCountry: v("country") || undefined,
        },
        url: v("url") || undefined,
      });
    } else if (type === "Organization") {
      Object.assign(base, {
        name: v("name"),
        url: v("url") || undefined,
        logo: v("logo") || undefined,
        sameAs: v("sameAs") ? v("sameAs").split(/\n+/).filter(Boolean) : undefined,
      });
    } else if (type === "Event") {
      Object.assign(base, {
        name: v("name"),
        startDate: v("startDate"),
        endDate: v("endDate") || undefined,
        location: v("location") ? { "@type": "Place", name: v("location"), address: v("address") || undefined } : undefined,
        description: v("description") || undefined,
        image: v("image") || undefined,
      });
    }
    // strip undefined
    return JSON.parse(JSON.stringify(base));
  }, [type, fields, faqs, crumbs]);

  const output = `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`;

  const Input = ({ k, label, ph }: { k: string; label: string; ph?: string }) => (
    <div>
      <label className="text-xs font-label uppercase tracking-widest text-on-surface-variant block mb-1">{label}</label>
      <input value={v(k)} onChange={(e) => set(k, e.target.value)} placeholder={ph}
        className="w-full bg-surface-container-lowest rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary" />
    </div>
  );

  return (
    <>
      <SEOHead {...getSeoProps("/schema-generator")!} />
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-12 lg:py-20">
        <header className="mb-12">
          <span className="text-primary tracking-[0.2em] font-extrabold uppercase mb-4 block text-xs font-label">SEO Tool</span>
          <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tighter mb-6 leading-[0.9]">
            Schema Markup <br /><span className="text-secondary">Generator</span>
          </h1>
          <p className="max-w-xl text-on-surface-variant text-lg leading-relaxed">
            Generate clean JSON-LD structured data for Article, Product, FAQ, LocalBusiness, Organization, Breadcrumb and Event — ready to paste into your &lt;head&gt;.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-surface-container rounded-xl p-5">
              <label className="text-xs font-label uppercase tracking-widest text-on-surface-variant block mb-2">Schema Type</label>
              <select value={type} onChange={(e) => setType(e.target.value as SchemaType)}
                className="w-full bg-surface-container-lowest rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-primary">
                {(["Article", "Product", "FAQPage", "LocalBusiness", "Organization", "BreadcrumbList", "Event"] as SchemaType[]).map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="bg-surface-container rounded-xl p-5 space-y-3">
              {type === "Article" && (<>
                <Input k="headline" label="Headline" />
                <Input k="image" label="Image URL" />
                <Input k="author" label="Author" />
                <Input k="publisher" label="Publisher" />
                <Input k="datePublished" label="Date Published" ph="2026-06-18" />
                <Input k="dateModified" label="Date Modified" ph="2026-06-19" />
                <Input k="description" label="Description" />
              </>)}
              {type === "Product" && (<>
                <Input k="name" label="Product Name" />
                <Input k="image" label="Image URL" />
                <Input k="description" label="Description" />
                <Input k="sku" label="SKU" />
                <Input k="brand" label="Brand" />
                <div className="grid grid-cols-2 gap-3">
                  <Input k="price" label="Price" ph="29.99" />
                  <Input k="currency" label="Currency" ph="USD" />
                </div>
                <Input k="availability" label="Availability" ph="InStock / OutOfStock" />
                <Input k="url" label="Product URL" />
                <div className="grid grid-cols-2 gap-3">
                  <Input k="rating" label="Rating" ph="4.8" />
                  <Input k="reviews" label="Review Count" />
                </div>
              </>)}
              {type === "FAQPage" && (
                <div className="space-y-3">
                  {faqs.map((f, i) => (
                    <div key={i} className="bg-surface-container-lowest rounded-lg p-3 space-y-2">
                      <input value={f.q} onChange={(e) => setFaqs((arr) => arr.map((x, ix) => ix === i ? { ...x, q: e.target.value } : x))}
                        placeholder="Question" className="w-full bg-surface-container rounded px-2 py-1.5 text-sm outline-none" />
                      <textarea value={f.a} onChange={(e) => setFaqs((arr) => arr.map((x, ix) => ix === i ? { ...x, a: e.target.value } : x))}
                        placeholder="Answer" className="w-full bg-surface-container rounded px-2 py-1.5 text-sm h-20 outline-none resize-none" />
                      <button onClick={() => setFaqs((arr) => arr.filter((_, ix) => ix !== i))} className="text-xs text-destructive">Remove</button>
                    </div>
                  ))}
                  <button onClick={() => setFaqs((arr) => [...arr, { q: "", a: "" }])} className="w-full bg-surface-container-lowest rounded-lg py-2 text-sm">+ Add FAQ</button>
                </div>
              )}
              {type === "BreadcrumbList" && (
                <div className="space-y-3">
                  {crumbs.map((c, i) => (
                    <div key={i} className="flex gap-2">
                      <input value={c.name} onChange={(e) => setCrumbs((arr) => arr.map((x, ix) => ix === i ? { ...x, name: e.target.value } : x))}
                        placeholder="Name" className="flex-1 bg-surface-container-lowest rounded px-2 py-1.5 text-sm outline-none" />
                      <input value={c.url} onChange={(e) => setCrumbs((arr) => arr.map((x, ix) => ix === i ? { ...x, url: e.target.value } : x))}
                        placeholder="URL" className="flex-1 bg-surface-container-lowest rounded px-2 py-1.5 text-sm outline-none" />
                      <button onClick={() => setCrumbs((arr) => arr.filter((_, ix) => ix !== i))} className="text-destructive px-2">×</button>
                    </div>
                  ))}
                  <button onClick={() => setCrumbs((arr) => [...arr, { name: "", url: "" }])} className="w-full bg-surface-container-lowest rounded-lg py-2 text-sm">+ Add Step</button>
                </div>
              )}
              {type === "LocalBusiness" && (<>
                <Input k="name" label="Business Name" />
                <Input k="image" label="Image" />
                <Input k="phone" label="Phone" />
                <Input k="priceRange" label="Price Range" ph="$$" />
                <Input k="street" label="Street" />
                <div className="grid grid-cols-2 gap-3">
                  <Input k="city" label="City" />
                  <Input k="region" label="Region" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input k="postal" label="Postal Code" />
                  <Input k="country" label="Country" />
                </div>
                <Input k="url" label="Website URL" />
              </>)}
              {type === "Organization" && (<>
                <Input k="name" label="Organization Name" />
                <Input k="url" label="URL" />
                <Input k="logo" label="Logo URL" />
                <div>
                  <label className="text-xs font-label uppercase tracking-widest text-on-surface-variant block mb-1">Social Profiles (one per line)</label>
                  <textarea value={v("sameAs")} onChange={(e) => set("sameAs", e.target.value)}
                    className="w-full h-24 bg-surface-container-lowest rounded-lg px-3 py-2 text-sm outline-none resize-none" />
                </div>
              </>)}
              {type === "Event" && (<>
                <Input k="name" label="Event Name" />
                <Input k="startDate" label="Start Date" ph="2026-09-01T10:00" />
                <Input k="endDate" label="End Date" />
                <Input k="location" label="Location" />
                <Input k="address" label="Address" />
                <Input k="image" label="Image" />
                <Input k="description" label="Description" />
              </>)}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-surface-container rounded-xl p-5">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-headline font-bold">JSON-LD Output</h3>
                <button onClick={() => { navigator.clipboard.writeText(output); toast({ title: "Copied" }); }}
                  className="text-xs bg-primary text-on-primary px-3 py-1.5 rounded font-bold">Copy</button>
              </div>
              <pre className="font-mono text-xs bg-surface-container-lowest rounded-lg p-4 overflow-x-auto max-h-[600px]">{output}</pre>
            </div>
            <a href={`https://search.google.com/test/rich-results?utm_source=webogrowth`} target="_blank" rel="noopener noreferrer"
              className="block text-center text-sm text-primary hover:underline">Validate with Google Rich Results Test →</a>
          </div>
        </div>

        <ToolSeoSection path="/schema-generator" />
        <RelatedTools currentPath="/schema-generator" />
      </div>
    </>
  );
};

export default SchemaGenerator;
