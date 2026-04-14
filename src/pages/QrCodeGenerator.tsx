import { useState, useEffect, useRef, useCallback } from "react";
import QRCode from "qrcode";
import SEOHead from "@/components/SEOHead";
import RelatedTools from "@/components/RelatedTools";
import AnimatedSection from "@/components/AnimatedSection";
import { motion } from "framer-motion";

type ContentType = "url" | "text" | "email" | "phone" | "sms" | "wifi" | "vcard";
type BodyShape = "square" | "rounded" | "dots";
type EyeShape = "square" | "circle" | "rounded";

const contentTypes: { id: ContentType; label: string; icon: string }[] = [
  { id: "url", label: "URL", icon: "link" },
  { id: "text", label: "Text", icon: "text_fields" },
  { id: "email", label: "Email", icon: "mail" },
  { id: "phone", label: "Phone", icon: "call" },
  { id: "sms", label: "SMS", icon: "sms" },
  { id: "wifi", label: "WiFi", icon: "wifi" },
  { id: "vcard", label: "vCard", icon: "contact_page" },
];

const bodyShapes: { id: BodyShape; label: string }[] = [
  { id: "square", label: "Square" },
  { id: "rounded", label: "Rounded" },
  { id: "dots", label: "Dots" },
];

const eyeShapes: { id: EyeShape; label: string }[] = [
  { id: "square", label: "Square" },
  { id: "circle", label: "Circle" },
  { id: "rounded", label: "Rounded" },
];

const QrCodeGenerator = () => {
  const [contentType, setContentType] = useState<ContentType>("url");
  const [url, setUrl] = useState("https://webogrowth.com");
  const [text, setText] = useState("");
  const [emailAddr, setEmailAddr] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [phone, setPhone] = useState("");
  const [smsPhone, setSmsPhone] = useState("");
  const [smsMessage, setSmsMessage] = useState("");
  const [wifiSsid, setWifiSsid] = useState("");
  const [wifiPass, setWifiPass] = useState("");
  const [wifiEncryption, setWifiEncryption] = useState("WPA");
  const [vcardName, setVcardName] = useState("");
  const [vcardPhone, setVcardPhone] = useState("");
  const [vcardEmail, setVcardEmail] = useState("");
  const [vcardOrg, setVcardOrg] = useState("");

  const [size, setSize] = useState(300);
  const [quality, setQuality] = useState(2);
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [transparentBg, setTransparentBg] = useState(false);
  const [bodyShape, setBodyShape] = useState<BodyShape>("square");
  const [eyeShape, setEyeShape] = useState<EyeShape>("square");
  const [logoFile, setLogoFile] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);

  const getQrData = useCallback((): string => {
    switch (contentType) {
      case "url": return url || "https://webogrowth.com";
      case "text": return text || "Hello World";
      case "email": return `mailto:${emailAddr}?subject=${encodeURIComponent(emailSubject)}`;
      case "phone": return `tel:${phone}`;
      case "sms": return `sms:${smsPhone}${smsMessage ? `?body=${encodeURIComponent(smsMessage)}` : ""}`;
      case "wifi": return `WIFI:T:${wifiEncryption};S:${wifiSsid};P:${wifiPass};;`;
      case "vcard": return `BEGIN:VCARD\nVERSION:3.0\nFN:${vcardName}\nTEL:${vcardPhone}\nEMAIL:${vcardEmail}\nORG:${vcardOrg}\nEND:VCARD`;
      default: return url;
    }
  }, [contentType, url, text, emailAddr, emailSubject, phone, smsPhone, smsMessage, wifiSsid, wifiPass, wifiEncryption, vcardName, vcardPhone, vcardEmail, vcardOrg]);

  const renderQr = useCallback(async (targetCanvas: HTMLCanvasElement, renderSize: number) => {
    const data = getQrData();
    const margin = bodyShape === "dots" ? 4 : 2;

    await QRCode.toCanvas(targetCanvas, data, {
      width: renderSize,
      margin,
      color: {
        dark: fgColor,
        light: transparentBg ? "#00000000" : bgColor,
      },
      errorCorrectionLevel: logoFile ? "H" : "M",
    });

    const ctx = targetCanvas.getContext("2d");
    if (!ctx) return;

    // Apply body shape modifications
    if (bodyShape === "dots" || bodyShape === "rounded") {
      const imageData = ctx.getImageData(0, 0, targetCanvas.width, targetCanvas.height);
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = targetCanvas.width;
      tempCanvas.height = targetCanvas.height;
      const tempCtx = tempCanvas.getContext("2d")!;
      tempCtx.putImageData(imageData, 0, 0);
      
      ctx.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
      if (!transparentBg) {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, targetCanvas.width, targetCanvas.height);
      }
      ctx.drawImage(tempCanvas, 0, 0);
    }

    // Draw logo overlay
    if (logoFile) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise<void>((resolve) => {
        img.onload = () => {
          const logoSize = renderSize * 0.22;
          const x = (targetCanvas.width - logoSize) / 2;
          const y = (targetCanvas.height - logoSize) / 2;

          ctx.fillStyle = transparentBg ? "rgba(255,255,255,0.9)" : bgColor;
          const pad = logoSize * 0.12;
          const radius = eyeShape === "circle" ? (logoSize + pad * 2) / 2 : eyeShape === "rounded" ? 12 : 4;

          ctx.beginPath();
          if (eyeShape === "circle") {
            ctx.arc(x + logoSize / 2, y + logoSize / 2, (logoSize + pad * 2) / 2, 0, Math.PI * 2);
          } else {
            const rx = x - pad, ry = y - pad, rw = logoSize + pad * 2, rh = logoSize + pad * 2;
            ctx.moveTo(rx + radius, ry);
            ctx.lineTo(rx + rw - radius, ry);
            ctx.quadraticCurveTo(rx + rw, ry, rx + rw, ry + radius);
            ctx.lineTo(rx + rw, ry + rh - radius);
            ctx.quadraticCurveTo(rx + rw, ry + rh, rx + rw - radius, ry + rh);
            ctx.lineTo(rx + radius, ry + rh);
            ctx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - radius);
            ctx.lineTo(rx, ry + radius);
            ctx.quadraticCurveTo(rx, ry, rx + radius, ry);
          }
          ctx.closePath();
          ctx.fill();

          ctx.drawImage(img, x, y, logoSize, logoSize);
          resolve();
        };
        img.onerror = () => resolve();
        img.src = logoFile;
      });
    }
  }, [getQrData, fgColor, bgColor, transparentBg, bodyShape, eyeShape, logoFile]);

  useEffect(() => {
    if (canvasRef.current) {
      renderQr(canvasRef.current, size);
    }
  }, [renderQr, size]);

  const handleDownload = async (format: "png" | "svg") => {
    if (format === "svg") {
      const data = getQrData();
      const svgStr = await QRCode.toString(data, {
        type: "svg",
        width: size,
        margin: 2,
        color: { dark: fgColor, light: transparentBg ? "#00000000" : bgColor },
      });
      const blob = new Blob([svgStr], { type: "image/svg+xml" });
      const link = document.createElement("a");
      link.download = "qrcode.svg";
      link.href = URL.createObjectURL(blob);
      link.click();
      URL.revokeObjectURL(link.href);
      return;
    }

    // PNG download at high quality
    const exportSize = size * quality;
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = exportSize;
    exportCanvas.height = exportSize;
    await renderQr(exportCanvas, exportSize);

    const link = document.createElement("a");
    link.download = "qrcode.png";
    link.href = exportCanvas.toDataURL("image/png");
    link.click();
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogoFile(reader.result as string);
    reader.readAsDataURL(file);
  };

  const renderContentFields = () => {
    switch (contentType) {
      case "url":
        return (
          <div>
            <label className="text-sm font-label uppercase tracking-widest text-on-surface-variant block mb-2">URL</label>
            <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com" className="w-full bg-surface-container rounded-xl px-6 py-4 text-foreground placeholder:text-foreground/30 outline-none focus:ring-1 focus:ring-primary" />
          </div>
        );
      case "text":
        return (
          <div>
            <label className="text-sm font-label uppercase tracking-widest text-on-surface-variant block mb-2">Text Content</label>
            <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Enter your text..." rows={3} className="w-full bg-surface-container rounded-xl px-6 py-4 text-foreground placeholder:text-foreground/30 outline-none focus:ring-1 focus:ring-primary resize-none" />
          </div>
        );
      case "email":
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-label uppercase tracking-widest text-on-surface-variant block mb-2">Email Address</label>
              <input value={emailAddr} onChange={(e) => setEmailAddr(e.target.value)} placeholder="name@example.com" className="w-full bg-surface-container rounded-xl px-6 py-4 text-foreground placeholder:text-foreground/30 outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="text-sm font-label uppercase tracking-widest text-on-surface-variant block mb-2">Subject</label>
              <input value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} placeholder="Email subject..." className="w-full bg-surface-container rounded-xl px-6 py-4 text-foreground placeholder:text-foreground/30 outline-none focus:ring-1 focus:ring-primary" />
            </div>
          </div>
        );
      case "phone":
        return (
          <div>
            <label className="text-sm font-label uppercase tracking-widest text-on-surface-variant block mb-2">Phone Number</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+880 1791208768" className="w-full bg-surface-container rounded-xl px-6 py-4 text-foreground placeholder:text-foreground/30 outline-none focus:ring-1 focus:ring-primary" />
          </div>
        );
      case "sms":
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-label uppercase tracking-widest text-on-surface-variant block mb-2">Phone Number</label>
              <input value={smsPhone} onChange={(e) => setSmsPhone(e.target.value)} placeholder="+880 1791208768" className="w-full bg-surface-container rounded-xl px-6 py-4 text-foreground placeholder:text-foreground/30 outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="text-sm font-label uppercase tracking-widest text-on-surface-variant block mb-2">Message (Optional)</label>
              <textarea value={smsMessage} onChange={(e) => setSmsMessage(e.target.value)} placeholder="Pre-filled SMS text..." rows={2} className="w-full bg-surface-container rounded-xl px-6 py-4 text-foreground placeholder:text-foreground/30 outline-none focus:ring-1 focus:ring-primary resize-none" />
            </div>
          </div>
        );
      case "wifi":
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-label uppercase tracking-widest text-on-surface-variant block mb-2">Network Name (SSID)</label>
              <input value={wifiSsid} onChange={(e) => setWifiSsid(e.target.value)} placeholder="MyWiFi" className="w-full bg-surface-container rounded-xl px-6 py-4 text-foreground placeholder:text-foreground/30 outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="text-sm font-label uppercase tracking-widest text-on-surface-variant block mb-2">Password</label>
              <input value={wifiPass} onChange={(e) => setWifiPass(e.target.value)} placeholder="WiFi password" className="w-full bg-surface-container rounded-xl px-6 py-4 text-foreground placeholder:text-foreground/30 outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="text-sm font-label uppercase tracking-widest text-on-surface-variant block mb-2">Encryption</label>
              <select value={wifiEncryption} onChange={(e) => setWifiEncryption(e.target.value)} className="w-full bg-surface-container rounded-xl px-6 py-4 text-foreground outline-none focus:ring-1 focus:ring-primary">
                <option value="WPA">WPA/WPA2</option>
                <option value="WEP">WEP</option>
                <option value="nopass">None</option>
              </select>
            </div>
          </div>
        );
      case "vcard":
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-label uppercase tracking-widest text-on-surface-variant block mb-2">Full Name</label>
              <input value={vcardName} onChange={(e) => setVcardName(e.target.value)} placeholder="John Doe" className="w-full bg-surface-container rounded-xl px-6 py-4 text-foreground placeholder:text-foreground/30 outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="text-sm font-label uppercase tracking-widest text-on-surface-variant block mb-2">Phone</label>
              <input value={vcardPhone} onChange={(e) => setVcardPhone(e.target.value)} placeholder="+880 1791208768" className="w-full bg-surface-container rounded-xl px-6 py-4 text-foreground placeholder:text-foreground/30 outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="text-sm font-label uppercase tracking-widest text-on-surface-variant block mb-2">Email</label>
              <input value={vcardEmail} onChange={(e) => setVcardEmail(e.target.value)} placeholder="john@example.com" className="w-full bg-surface-container rounded-xl px-6 py-4 text-foreground placeholder:text-foreground/30 outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="text-sm font-label uppercase tracking-widest text-on-surface-variant block mb-2">Organization</label>
              <input value={vcardOrg} onChange={(e) => setVcardOrg(e.target.value)} placeholder="Company name" className="w-full bg-surface-container rounded-xl px-6 py-4 text-foreground placeholder:text-foreground/30 outline-none focus:ring-1 focus:ring-primary" />
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <SEOHead
        title="QR Code Generator Free Online | WeboGrowth"
        description="Generate QR codes from any text, URL, WiFi, vCard, email, or phone. Customize colors, add logo, choose body shapes, and download as PNG or SVG. Free online QR code maker."
        keywords="qr code generator free, create qr code online, qr code maker, generate qr code, url to qr code, wifi qr code, vcard qr code, qr code with logo"
        canonicalPath="/qr-code"
        jsonLd={{ "@context": "https://schema.org", "@type": "SoftwareApplication", name: "QR Code Generator", url: "https://tools.webogrowth.com/qr-code", applicationCategory: "UtilitiesApplication", operatingSystem: "Any", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, author: { "@type": "Organization", name: "WeboGrowth", url: "https://webogrowth.com" } }}
      />
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-12 lg:py-20">
        <AnimatedSection>
          <header className="mb-12">
            <span className="text-primary tracking-[0.2em] font-extrabold uppercase mb-4 block text-xs font-label">Utility Tool</span>
            <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tighter mb-6 leading-[0.9]">
              QR Code <br /><span className="text-secondary">Generator</span>
            </h1>
            <p className="max-w-xl text-on-surface-variant text-lg leading-relaxed">
              Generate advanced QR codes with custom colors, logo overlay, body shapes, and multiple content types. Download as PNG or SVG.
            </p>
          </header>
        </AnimatedSection>

        {/* Content Type Tabs */}
        <AnimatedSection delay={0.1}>
          <div className="flex flex-wrap gap-2 mb-8">
            {contentTypes.map((ct) => (
              <motion.button
                key={ct.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setContentType(ct.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${contentType === ct.id ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-highest"}`}
              >
                <span className="material-symbols-outlined text-base">{ct.icon}</span>
                {ct.label}
              </motion.button>
            ))}
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <AnimatedSection delay={0.15}>
            <div className="space-y-6">
              {/* Content Fields */}
              {renderContentFields()}

              {/* Colors */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-label uppercase tracking-widest text-on-surface-variant block mb-2">Foreground</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent" />
                    <input value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="flex-1 bg-surface-container rounded-lg px-3 py-2 text-foreground text-sm outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-label uppercase tracking-widest text-on-surface-variant block mb-2">Background</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent" disabled={transparentBg} />
                    <input value={transparentBg ? "Transparent" : bgColor} onChange={(e) => setBgColor(e.target.value)} disabled={transparentBg} className="flex-1 bg-surface-container rounded-lg px-3 py-2 text-foreground text-sm outline-none focus:ring-1 focus:ring-primary disabled:opacity-50" />
                  </div>
                </div>
                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer bg-surface-container rounded-lg px-4 py-3">
                    <input type="checkbox" checked={transparentBg} onChange={(e) => setTransparentBg(e.target.checked)} className="accent-primary" />
                    <span className="text-sm text-on-surface-variant">Transparent</span>
                  </label>
                </div>
              </div>

              {/* Body Shape */}
              <div>
                <label className="text-sm font-label uppercase tracking-widest text-on-surface-variant block mb-3">Body Shape</label>
                <div className="flex gap-3">
                  {bodyShapes.map((s) => (
                    <motion.button
                      key={s.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setBodyShape(s.id)}
                      className={`flex-1 py-3 rounded-lg text-sm font-bold transition-colors ${bodyShape === s.id ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-highest"}`}
                    >
                      {s.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Eye Shape */}
              <div>
                <label className="text-sm font-label uppercase tracking-widest text-on-surface-variant block mb-3">Eye Frame Shape</label>
                <div className="flex gap-3">
                  {eyeShapes.map((s) => (
                    <motion.button
                      key={s.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setEyeShape(s.id)}
                      className={`flex-1 py-3 rounded-lg text-sm font-bold transition-colors ${eyeShape === s.id ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-highest"}`}
                    >
                      {s.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Logo Upload */}
              <div>
                <label className="text-sm font-label uppercase tracking-widest text-on-surface-variant block mb-3">Logo Overlay</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 bg-surface-container px-6 py-3 rounded-lg cursor-pointer hover:bg-surface-container-highest transition-colors">
                    <span className="material-symbols-outlined text-primary">add_photo_alternate</span>
                    <span className="text-sm font-bold text-on-surface-variant">{logoFile ? "Change Logo" : "Upload Logo"}</span>
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </label>
                  {logoFile && (
                    <button onClick={() => setLogoFile(null)} className="text-sm text-error hover:underline">Remove</button>
                  )}
                </div>
              </div>

              {/* Size & Quality */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-label uppercase tracking-widest text-on-surface-variant block mb-2">Size ({size}px)</label>
                  <input type="range" min={100} max={600} value={size} onChange={(e) => setSize(Number(e.target.value))} className="w-full accent-primary" />
                </div>
                <div>
                  <label className="text-sm font-label uppercase tracking-widest text-on-surface-variant block mb-2">Quality ({quality}x = {size * quality}px)</label>
                  <input type="range" min={1} max={4} value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="w-full accent-primary" />
                </div>
              </div>

              {/* Download Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleDownload("png")}
                  className="bg-primary text-on-primary py-4 rounded-lg font-bold hover:shadow-[0_0_20px_hsla(82,98%,72%,0.3)] transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">download</span>Download PNG
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleDownload("svg")}
                  className="bg-secondary text-on-secondary py-4 rounded-lg font-bold hover:shadow-[0_0_20px_hsla(82,98%,72%,0.2)] transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">download</span>Download SVG
                </motion.button>
              </div>
            </div>
          </AnimatedSection>

          {/* Preview */}
          <AnimatedSection delay={0.2}>
            <div className="sticky top-24">
              <div className={`flex items-center justify-center rounded-xl p-8 ${transparentBg ? "bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZTBlMGUwIi8+PHJlY3QgeD0iMTAiIHk9IjEwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiNlMGUwZTAiLz48L3N2Zz4=')] bg-surface-container" : "bg-surface-container"}`}>
                <canvas ref={canvasRef} className="max-w-full h-auto rounded-lg" />
              </div>
              <canvas ref={hiddenCanvasRef} className="hidden" />
              <div className="mt-4 text-center text-xs text-on-surface-variant/60">
                Preview: {size}×{size}px • Export: {size * quality}×{size * quality}px
              </div>
            </div>
          </AnimatedSection>
        </div>

        {/* FAQ */}
        <AnimatedSection delay={0.1} className="mt-24">
          <h2 className="text-3xl font-headline font-bold mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6 max-w-3xl">
            {[
              { q: "Is this QR code generator free?", a: "Yes, completely free with no limits. Generate as many QR codes as you need with all features included." },
              { q: "Can I add my company logo to the QR code?", a: "Yes! Upload any image as a logo overlay. The QR code automatically uses higher error correction to remain scannable." },
              { q: "What content types are supported?", a: "URL, plain text, email, phone number, SMS, WiFi credentials, and vCard contact information." },
              { q: "Can I download with a transparent background?", a: "Yes, enable the transparent background option and download as PNG to get a QR code without any background." },
              { q: "What's the difference between PNG and SVG?", a: "PNG is a raster format ideal for web and print. SVG is a vector format that scales infinitely without losing quality." },
            ].map((faq) => (
              <motion.div key={faq.q} whileHover={{ scale: 1.01 }} className="bg-surface-container rounded-xl p-6">
                <h3 className="font-headline font-bold mb-2">{faq.q}</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>

        <RelatedTools currentPath="/qr-code" />
      </div>
    </>
  );
};

export default QrCodeGenerator;
