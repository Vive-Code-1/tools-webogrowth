import { useState } from "react";
import SEOHead from "@/components/SEOHead";
import { getSeoProps } from "@/lib/seo";
import ToolSeoSection from "@/components/ToolSeoSection";
import RelatedTools from "@/components/RelatedTools";
import DropZone from "@/components/DropZone";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Item { file: File; preview: string; alt?: string; error?: string; loading?: boolean }

const fileToDataUrl = (f: File): Promise<string> =>
  new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result as string); r.onerror = rej; r.readAsDataURL(f); });

const AltTextGenerator = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<Item[]>([]);
  const [context, setContext] = useState("");
  const [seoMode, setSeoMode] = useState(true);
  const [processing, setProcessing] = useState(false);

  const onFiles = (files: File[]) => {
    const next = files.slice(0, 10).map((f) => ({ file: f, preview: URL.createObjectURL(f) }));
    setItems((p) => [...p, ...next].slice(0, 10));
  };

  const generate = async () => {
    if (!items.length) return;
    setProcessing(true);
    try {
      for (let i = 0; i < items.length; i++) {
        if (items[i].alt) continue;
        setItems((p) => p.map((x, ix) => ix === i ? { ...x, loading: true, error: undefined } : x));
        try {
          const dataUrl = await fileToDataUrl(items[i].file);
          const { data, error } = await supabase.functions.invoke("generate-alt-text", {
            body: { imageDataUrl: dataUrl, context, seoMode },
          });
          if (error) throw error;
          const alt = (data as any)?.alt || "";
          setItems((p) => p.map((x, ix) => ix === i ? { ...x, alt, loading: false } : x));
        } catch (e: any) {
          setItems((p) => p.map((x, ix) => ix === i ? { ...x, loading: false, error: e.message || "Failed" } : x));
        }
      }
      toast({ title: "Alt text generated" });
    } finally { setProcessing(false); }
  };

  const copyAll = () => {
    const csv = "filename,alt\n" + items.filter((i) => i.alt).map((i) => `"${i.file.name}","${(i.alt || "").replace(/"/g, '""')}"`).join("\n");
    navigator.clipboard.writeText(csv);
    toast({ title: "CSV copied to clipboard" });
  };

  return (
    <>
      <SEOHead {...getSeoProps("/alt-text-generator")!} />
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-12 lg:py-20">
        <header className="mb-12">
          <span className="text-primary tracking-[0.2em] font-extrabold uppercase mb-4 block text-xs font-label">AI Tool</span>
          <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tighter mb-6 leading-[0.9]">
            AI Alt Text <br /><span className="text-secondary">Generator</span>
          </h1>
          <p className="max-w-xl text-on-surface-variant text-lg leading-relaxed">
            Generate SEO-optimized, accessibility-friendly alt text for bulk images using AI vision. Up to 10 images per batch.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <DropZone multiple onFilesSelect={onFiles} accept="image/*" label="Drop images" sublabel="Up to 10 images, max 10MB each" maxSizeMB={10} hasFiles={items.length > 0} />
            <div className="bg-surface-container rounded-xl p-5 space-y-3">
              <label className="text-xs font-label uppercase tracking-widest text-on-surface-variant">Context (optional)</label>
              <input value={context} onChange={(e) => setContext(e.target.value)} placeholder="e.g. product photo for vegan skincare brand"
                className="w-full bg-surface-container-lowest rounded-lg px-3 py-2 text-sm outline-none" />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={seoMode} onChange={(e) => setSeoMode(e.target.checked)} />
                SEO mode (include relevant keywords naturally)
              </label>
            </div>
            <button onClick={generate} disabled={!items.length || processing}
              className="w-full bg-primary text-on-primary font-bold py-3 rounded-lg disabled:opacity-50">
              {processing ? "Generating…" : `Generate Alt Text for ${items.length} image${items.length !== 1 ? "s" : ""}`}
            </button>
            {items.some((i) => i.alt) && (
              <button onClick={copyAll} className="w-full bg-secondary text-on-secondary font-bold py-2 rounded-lg text-sm">Copy All as CSV</button>
            )}
          </div>

          <div className="space-y-3 max-h-[800px] overflow-y-auto">
            {items.map((it, i) => (
              <div key={i} className="bg-surface-container rounded-xl p-4 flex gap-4">
                <img src={it.preview} alt="" className="w-24 h-24 object-cover rounded-lg shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-on-surface-variant truncate">{it.file.name}</p>
                  {it.loading && <p className="text-sm text-primary animate-pulse mt-2">Analyzing…</p>}
                  {it.error && <p className="text-sm text-destructive mt-2">{it.error}</p>}
                  {it.alt && (
                    <>
                      <textarea value={it.alt} onChange={(e) => setItems((p) => p.map((x, ix) => ix === i ? { ...x, alt: e.target.value } : x))}
                        className="w-full mt-2 bg-surface-container-lowest rounded p-2 text-sm h-20 outline-none resize-none" />
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-on-surface-variant">{it.alt.length} chars</span>
                        <button onClick={() => { navigator.clipboard.writeText(it.alt!); toast({ title: "Copied" }); }} className="text-xs text-primary">Copy</button>
                      </div>
                    </>
                  )}
                  <button onClick={() => setItems((p) => p.filter((_, ix) => ix !== i))} className="text-xs text-destructive mt-2">Remove</button>
                </div>
              </div>
            ))}
            {!items.length && <p className="text-on-surface-variant text-center py-12">No images yet.</p>}
          </div>
        </div>

        <ToolSeoSection path="/alt-text-generator" />
        <RelatedTools currentPath="/alt-text-generator" />
      </div>
    </>
  );
};

export default AltTextGenerator;
