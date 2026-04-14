import { useState } from "react";
import SEOHead from "@/components/SEOHead";
import RelatedTools from "@/components/RelatedTools";

const Base64Tool = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");

  const handleProcess = () => {
    try {
      if (mode === "encode") {
        setOutput(btoa(unescape(encodeURIComponent(input))));
      } else {
        setOutput(decodeURIComponent(escape(atob(input))));
      }
    } catch {
      setOutput("Error: Invalid input for " + mode + " operation.");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setOutput(result);
    };
    reader.readAsDataURL(file);
  };

  const handleCopy = () => navigator.clipboard.writeText(output);

  return (
    <>
      <SEOHead
        title="Base64 Encoder Decoder Online Free | WeboGrowth"
        description="Encode and decode Base64 strings online for free. Convert text to Base64 or decode Base64 to text. Also supports file to Base64 conversion."
        keywords="base64 encoder, base64 decoder, base64 encode online, base64 decode online, text to base64, image to base64"
        canonicalPath="/base64"
      />
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-12 lg:py-20">
        <header className="mb-12">
          <span className="text-primary tracking-[0.2em] font-extrabold uppercase mb-4 block text-xs font-label">Developer Tool</span>
          <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tighter mb-6 leading-[0.9]">
            Base64 <br /><span className="text-secondary">Encoder / Decoder</span>
          </h1>
          <p className="max-w-xl text-on-surface-variant text-lg leading-relaxed">
            Encode text or files to Base64, or decode Base64 strings back to plain text. All processing happens locally in your browser.
          </p>
        </header>

        <div className="flex gap-3 mb-8">
          <button onClick={() => setMode("encode")} className={`px-6 py-3 rounded-lg font-bold transition-all ${mode === "encode" ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-highest"}`}>Encode</button>
          <button onClick={() => setMode("decode")} className={`px-6 py-3 rounded-lg font-bold transition-all ${mode === "decode" ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-highest"}`}>Decode</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <label className="text-sm font-label uppercase tracking-widest text-on-surface-variant block">
              {mode === "encode" ? "Plain Text" : "Base64 String"}
            </label>
            <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder={mode === "encode" ? "Enter text to encode..." : "Paste Base64 string..."} className="w-full h-64 bg-surface-container rounded-xl p-6 font-mono text-sm text-foreground placeholder:text-foreground/30 outline-none focus:ring-1 focus:ring-primary resize-none" />
            {mode === "encode" && (
              <label className="block">
                <span className="text-xs text-on-surface-variant font-label uppercase tracking-widest">Or upload a file:</span>
                <input type="file" onChange={handleFileUpload} className="mt-2 block text-sm text-on-surface-variant file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-on-primary file:font-bold file:cursor-pointer" />
              </label>
            )}
            <button onClick={handleProcess} className="w-full bg-primary text-on-primary py-4 rounded-lg font-bold hover:shadow-[0_0_20px_hsla(82,98%,72%,0.3)] transition-all flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">{mode === "encode" ? "lock" : "lock_open"}</span>
              {mode === "encode" ? "Encode to Base64" : "Decode from Base64"}
            </button>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-label uppercase tracking-widest text-on-surface-variant">Result</label>
              {output && (
                <button onClick={handleCopy} className="text-xs text-primary font-bold uppercase tracking-widest hover:underline flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">content_copy</span>Copy
                </button>
              )}
            </div>
            <textarea value={output} readOnly placeholder="Output will appear here..." className="w-full h-64 bg-surface-container-highest rounded-xl p-6 font-mono text-sm text-foreground placeholder:text-foreground/30 outline-none resize-none" />
          </div>
        </div>

        <RelatedTools currentPath="/base64" />
      </div>
    </>
  );
};

export default Base64Tool;
