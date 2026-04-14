import { useState } from "react";
import SEOHead from "@/components/SEOHead";
import RelatedTools from "@/components/RelatedTools";

const JsonFormatter = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, 2));
      setError("");
    } catch (e: any) {
      setError(e.message);
      setOutput("");
    }
  };

  const handleMinify = () => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      setError("");
    } catch (e: any) {
      setError(e.message);
      setOutput("");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
  };

  return (
    <>
      <SEOHead
        title="JSON Formatter & Validator Online Free | WeboGrowth"
        description="Format, validate and minify JSON online for free. Paste your JSON data, beautify or compress it instantly with syntax error detection."
        keywords="json formatter online, json validator, json beautifier, json minifier, format json free, validate json online"
        canonicalPath="/json-formatter"
        jsonLd={{ "@context": "https://schema.org", "@type": "SoftwareApplication", name: "JSON Formatter & Validator", url: "https://tools.webogrowth.com/json-formatter", applicationCategory: "DeveloperApplication", operatingSystem: "Any", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, author: { "@type": "Organization", name: "WeboGrowth", url: "https://webogrowth.com" } }}
      />
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-12 lg:py-20">
        <header className="mb-12">
          <span className="text-primary tracking-[0.2em] font-extrabold uppercase mb-4 block text-xs font-label">Developer Tool</span>
          <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tighter mb-6 leading-[0.9]">
            JSON Formatter <br /><span className="text-secondary">& Validator</span>
          </h1>
          <p className="max-w-xl text-on-surface-variant text-lg leading-relaxed">
            Paste your JSON data to format, validate, or minify it instantly. Detect syntax errors and fix malformed JSON with ease.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <label className="text-sm font-label uppercase tracking-widest text-on-surface-variant block">Input JSON</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='{"name": "WeboGrowth", "type": "tools"}'
              className="w-full h-80 bg-surface-container rounded-xl p-6 font-mono text-sm text-foreground placeholder:text-foreground/30 outline-none focus:ring-1 focus:ring-primary resize-none"
            />
            <div className="flex gap-3">
              <button onClick={handleFormat} className="bg-primary text-on-primary px-6 py-3 rounded-lg font-bold hover:shadow-[0_0_20px_hsla(82,98%,72%,0.3)] transition-all">
                <span className="flex items-center gap-2"><span className="material-symbols-outlined text-lg">format_align_left</span>Format</span>
              </button>
              <button onClick={handleMinify} className="bg-secondary text-on-secondary px-6 py-3 rounded-lg font-bold hover:opacity-90 transition-all">
                <span className="flex items-center gap-2"><span className="material-symbols-outlined text-lg">compress</span>Minify</span>
              </button>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-label uppercase tracking-widest text-on-surface-variant">Output</label>
              {output && (
                <button onClick={handleCopy} className="text-xs text-primary font-bold uppercase tracking-widest hover:underline flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">content_copy</span>Copy
                </button>
              )}
            </div>
            {error ? (
              <div className="w-full h-80 bg-error/10 border border-error/30 rounded-xl p-6 font-mono text-sm text-error">{error}</div>
            ) : (
              <textarea
                value={output}
                readOnly
                placeholder="Formatted output will appear here..."
                className="w-full h-80 bg-surface-container-highest rounded-xl p-6 font-mono text-sm text-foreground placeholder:text-foreground/30 outline-none resize-none"
              />
            )}
          </div>
        </div>

        {/* How to Use */}
        <section className="mt-24">
          <h2 className="text-3xl font-headline font-bold mb-8">How to Use JSON Formatter</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: "01", title: "Paste JSON", desc: "Paste your raw JSON data into the input field on the left side." },
              { step: "02", title: "Format or Minify", desc: "Click 'Format' for readable output or 'Minify' for compact JSON." },
              { step: "03", title: "Copy Result", desc: "Copy the formatted JSON output to your clipboard with one click." },
            ].map((s) => (
              <div key={s.step} className="bg-surface-container-low p-8 rounded-xl">
                <span className="text-primary font-headline font-black text-4xl opacity-30">{s.step}</span>
                <h3 className="font-headline font-bold text-lg mt-4 mb-2">{s.title}</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-24">
          <h2 className="text-3xl font-headline font-bold mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6 max-w-3xl">
            {[
              { q: "Is this JSON formatter free to use?", a: "Yes, our JSON formatter is completely free with no limits on usage. All processing happens in your browser." },
              { q: "Does my JSON data get uploaded to a server?", a: "No. Everything is processed locally in your browser. Your data never leaves your device." },
              { q: "Can it validate JSON syntax?", a: "Yes. If your JSON has syntax errors, the tool will display the exact error message to help you fix it." },
            ].map((faq) => (
              <div key={faq.q} className="bg-surface-container rounded-xl p-6">
                <h3 className="font-headline font-bold mb-2">{faq.q}</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        <RelatedTools currentPath="/json-formatter" />
      </div>
    </>
  );
};

export default JsonFormatter;
