import { useState, useCallback } from "react";
import JSZip from "jszip";
import { PDFDocument } from "pdf-lib";
import DropZone from "@/components/DropZone";
import SEOHead from "@/components/SEOHead";
import { getSeoProps } from "@/lib/seo";
import ToolSeoSection from "@/components/ToolSeoSection";
import RelatedTools from "@/components/RelatedTools";
import { useToast } from "@/hooks/use-toast";
import { uploadProcessedFile } from "@/lib/storage";
import CountdownDownload from "@/components/CountdownDownload";

type Mode = "merge" | "split" | "compress" | "to-images";

const MODES: { id: Mode; label: string; icon: string; desc: string }[] = [
  { id: "merge", label: "Merge PDFs", icon: "merge", desc: "Combine multiple PDFs into one file" },
  { id: "split", label: "Split PDF", icon: "call_split", desc: "Extract each page as a separate PDF" },
  { id: "compress", label: "Compress PDF", icon: "compress", desc: "Reduce PDF file size (light optimization)" },
  { id: "to-images", label: "PDF to Images", icon: "image", desc: "Export each page as PNG" },
];

const PdfToolkit = () => {
  const { toast } = useToast();
  const [mode, setMode] = useState<Mode>("merge");
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ url: string; fileName: string } | null>(null);
  const [progress, setProgress] = useState(0);

  const handleFiles = useCallback((newFiles: File[]) => {
    const pdfs = newFiles.filter((f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"));
    if (pdfs.length !== newFiles.length) {
      toast({ title: "Only PDF files accepted", variant: "destructive" });
    }
    if (mode === "merge") {
      setFiles((prev) => [...prev, ...pdfs]);
    } else {
      setFiles(pdfs.slice(0, 1));
    }
    setResult(null);
  }, [mode, toast]);

  const removeFile = (i: number) => setFiles((prev) => prev.filter((_, idx) => idx !== i));

  const handleProcess = async () => {
    if (!files.length) return;
    setProcessing(true);
    setProgress(0);
    setResult(null);
    try {
      let blob: Blob;
      let fileName: string;

      if (mode === "merge") {
        const merged = await PDFDocument.create();
        for (let i = 0; i < files.length; i++) {
          const bytes = await files[i].arrayBuffer();
          const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
          const pages = await merged.copyPages(doc, doc.getPageIndices());
          pages.forEach((p) => merged.addPage(p));
          setProgress(Math.round(((i + 1) / files.length) * 100));
        }
        const out = await merged.save();
        blob = new Blob([new Uint8Array(out)], { type: "application/pdf" });
        fileName = "merged.pdf";
      } else if (mode === "split") {
        const bytes = await files[0].arrayBuffer();
        const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
        const zip = new JSZip();
        const total = src.getPageCount();
        for (let i = 0; i < total; i++) {
          const out = await PDFDocument.create();
          const [page] = await out.copyPages(src, [i]);
          out.addPage(page);
          const pdfBytes = await out.save();
          zip.file(`page-${String(i + 1).padStart(3, "0")}.pdf`, pdfBytes);
          setProgress(Math.round(((i + 1) / total) * 100));
        }
        blob = await zip.generateAsync({ type: "blob" });
        fileName = `${files[0].name.replace(/\.pdf$/i, "")}-split.zip`;
      } else if (mode === "compress") {
        const bytes = await files[0].arrayBuffer();
        const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
        const out = await doc.save({ useObjectStreams: true, addDefaultPage: false });
        blob = new Blob([new Uint8Array(out)], { type: "application/pdf" });
        fileName = `compressed-${files[0].name}`;
        setProgress(100);
        const saved = files[0].size - blob.size;
        if (saved <= 0) {
          toast({ title: "Already optimized", description: "No further size reduction possible with lossless compression." });
        } else {
          toast({ title: "Compressed", description: `Saved ${(saved / 1024).toFixed(1)} KB` });
        }
      } else {
        // to-images via pdfjs
        const pdfjs: any = await import("pdfjs-dist");
        const worker: any = await import("pdfjs-dist/build/pdf.worker.mjs?url");
        pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
        const bytes = new Uint8Array(await files[0].arrayBuffer());
        const doc = await pdfjs.getDocument({ data: bytes }).promise;
        const zip = new JSZip();
        for (let i = 1; i <= doc.numPages; i++) {
          const page = await doc.getPage(i);
          const viewport = page.getViewport({ scale: 2 });
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext("2d")!;
          await page.render({ canvasContext: ctx, viewport, canvas }).promise;
          const pngBlob: Blob = await new Promise((r) => canvas.toBlob((b) => r(b!), "image/png"));
          zip.file(`page-${String(i).padStart(3, "0")}.png`, pngBlob);
          setProgress(Math.round((i / doc.numPages) * 100));
        }
        blob = await zip.generateAsync({ type: "blob" });
        fileName = `${files[0].name.replace(/\.pdf$/i, "")}-images.zip`;
      }

      const url = await uploadProcessedFile(blob, fileName);
      setResult({ url, fileName });
      toast({ title: "Done!", description: `${fileName} (${(blob.size / 1024).toFixed(1)} KB)` });
    } catch (err) {
      console.error(err);
      toast({ title: "Processing failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <SEOHead {...getSeoProps("/pdf-toolkit")!} />
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-12 lg:py-20">
        <header className="mb-12">
          <span className="text-primary tracking-[0.2em] font-extrabold uppercase mb-4 block text-xs font-label">Document Tool</span>
          <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tighter mb-6 leading-[0.9]">
            PDF <br /><span className="text-secondary">Toolkit</span>
          </h1>
          <p className="max-w-xl text-on-surface-variant text-lg leading-relaxed">
            Merge, split, compress and convert PDFs to images — fully in your browser. No upload, no signup, no watermarks.
          </p>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => { setMode(m.id); setFiles([]); setResult(null); }}
              className={`p-5 rounded-xl text-left transition-all ${mode === m.id ? "bg-primary text-on-primary" : "bg-surface-container hover:bg-surface-container-highest"}`}
            >
              <span className="material-symbols-outlined mb-2 block">{m.icon}</span>
              <div className="font-bold text-sm">{m.label}</div>
              <div className={`text-xs mt-1 ${mode === m.id ? "opacity-80" : "text-on-surface-variant"}`}>{m.desc}</div>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <DropZone
            multiple={mode === "merge"}
            accept="application/pdf"
            label={mode === "merge" ? "Drop PDFs to merge" : "Drop a PDF file"}
            sublabel="PDF only — up to 50MB each"
            maxSizeMB={50}
            onFilesSelect={handleFiles}
            processing={processing}
            hasFiles={files.length > 0}
          />

          <div className="bg-surface-container rounded-xl p-6 space-y-4">
            <h3 className="font-headline font-bold text-lg">
              {mode === "merge" ? `Files to merge (${files.length})` : "Selected file"}
            </h3>
            {!files.length ? (
              <p className="text-sm text-on-surface-variant py-12 text-center">No files yet.</p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 bg-surface-container-low rounded-lg p-3">
                    <span className="material-symbols-outlined text-primary">picture_as_pdf</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{f.name}</p>
                      <p className="text-xs text-on-surface-variant">{(f.size / 1024).toFixed(0)} KB</p>
                    </div>
                    <button onClick={() => removeFile(i)} className="text-on-surface-variant p-2 hover:text-destructive" aria-label="Remove">
                      <span className="material-symbols-outlined text-base">close</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {processing && (
              <div>
                <div className="flex justify-between text-xs text-on-surface-variant mb-1">
                  <span>Processing…</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            <button
              onClick={handleProcess}
              disabled={!files.length || processing || (mode === "merge" && files.length < 2)}
              className="w-full bg-primary text-on-primary font-bold py-4 rounded-lg disabled:opacity-50 hover:shadow-[0_0_20px_hsla(82,98%,72%,0.3)] transition-all"
            >
              {processing ? "Processing…" : MODES.find((m) => m.id === mode)!.label}
            </button>
            {mode === "merge" && files.length === 1 && (
              <p className="text-xs text-on-surface-variant text-center">Add at least 2 PDFs to merge.</p>
            )}
          </div>
        </div>

        {result && (
          <div className="mt-8 max-w-xl mx-auto">
            <CountdownDownload
              downloadUrl={result.url}
              fileName={result.fileName}
              onExpired={() => setResult(null)}
            />
          </div>
        )}

        <ToolSeoSection path="/pdf-toolkit" />
        <RelatedTools currentPath="/pdf-toolkit" />
      </div>
    </>
  );
};

export default PdfToolkit;
