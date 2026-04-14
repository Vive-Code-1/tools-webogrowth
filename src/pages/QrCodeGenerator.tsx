import { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import SEOHead from "@/components/SEOHead";
import RelatedTools from "@/components/RelatedTools";

const QrCodeGenerator = () => {
  const [text, setText] = useState("https://webogrowth.com");
  const [size, setSize] = useState(300);
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && text) {
      QRCode.toCanvas(canvasRef.current, text, {
        width: size,
        margin: 2,
        color: { dark: fgColor, light: bgColor },
      });
    }
  }, [text, size, fgColor, bgColor]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = "qrcode.png";
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  return (
    <>
      <SEOHead
        title="QR Code Generator Free Online | WeboGrowth"
        description="Generate QR codes from any text or URL for free. Customize colors, size, and download as PNG. Fast, private, browser-based QR code generator."
        keywords="qr code generator free, create qr code online, qr code maker, generate qr code, url to qr code, text to qr code"
        canonicalPath="/qr-code"
        jsonLd={{ "@context": "https://schema.org", "@type": "SoftwareApplication", name: "QR Code Generator", url: "https://tools.webogrowth.com/qr-code", applicationCategory: "UtilitiesApplication", operatingSystem: "Any", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, author: { "@type": "Organization", name: "WeboGrowth", url: "https://webogrowth.com" } }}
      />
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-12 lg:py-20">
        <header className="mb-12">
          <span className="text-primary tracking-[0.2em] font-extrabold uppercase mb-4 block text-xs font-label">Utility Tool</span>
          <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tighter mb-6 leading-[0.9]">
            QR Code <br /><span className="text-secondary">Generator</span>
          </h1>
          <p className="max-w-xl text-on-surface-variant text-lg leading-relaxed">
            Generate QR codes from any URL or text instantly. Customize colors, adjust size, and download high-quality PNG images.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <div className="space-y-6">
            <div>
              <label className="text-sm font-label uppercase tracking-widest text-on-surface-variant block mb-2">Text or URL</label>
              <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Enter text or URL..." rows={3} className="w-full bg-surface-container rounded-xl px-6 py-4 text-foreground placeholder:text-foreground/30 outline-none focus:ring-1 focus:ring-primary resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-label uppercase tracking-widest text-on-surface-variant block mb-2">Size (px)</label>
                <input type="number" value={size} onChange={(e) => setSize(Number(e.target.value))} min={100} max={1000} className="w-full bg-surface-container rounded-xl px-6 py-4 text-foreground outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-label uppercase tracking-widest text-on-surface-variant block mb-2">FG</label>
                  <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="w-full h-12 rounded-lg cursor-pointer border-0 bg-transparent" />
                </div>
                <div>
                  <label className="text-sm font-label uppercase tracking-widest text-on-surface-variant block mb-2">BG</label>
                  <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-full h-12 rounded-lg cursor-pointer border-0 bg-transparent" />
                </div>
              </div>
            </div>
            <button onClick={handleDownload} className="w-full bg-primary text-on-primary py-4 rounded-lg font-bold hover:shadow-[0_0_20px_hsla(82,98%,72%,0.3)] transition-all flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">download</span>Download PNG
            </button>
          </div>
          <div className="flex items-center justify-center bg-surface-container rounded-xl p-8">
            <canvas ref={canvasRef} />
          </div>
        </div>

        <section className="mt-24">
          <h2 className="text-3xl font-headline font-bold mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6 max-w-3xl">
            {[
              { q: "Is this QR code generator free?", a: "Yes, completely free with no limits. Generate as many QR codes as you need." },
              { q: "Can I customize QR code colors?", a: "Yes, you can change both foreground and background colors to match your brand." },
              { q: "What formats can I download?", a: "QR codes are downloaded as high-quality PNG images." },
            ].map((faq) => (
              <div key={faq.q} className="bg-surface-container rounded-xl p-6">
                <h3 className="font-headline font-bold mb-2">{faq.q}</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        <RelatedTools currentPath="/qr-code" />
      </div>
    </>
  );
};

export default QrCodeGenerator;
