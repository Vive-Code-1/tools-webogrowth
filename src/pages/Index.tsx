import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Lottie from "lottie-react";
import { useState } from "react";
import heroAnimation from "@/assets/home-hero-animation.json";
import SEOHead from "@/components/SEOHead";
import { getSeoProps } from "@/lib/seo";
import AnimatedSection from "@/components/AnimatedSection";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const imageTools = [
  { title: "Image Compressor", desc: "Lossless and lossy compression for PNG, JPEG, and WebP. Reduce file sizes by up to 90% without sacrificing visual fidelity.", icon: "compress", path: "/compressor", span: "md:col-span-8", large: true },
  { title: "Format Converter", desc: "Transform assets between formats instantly. Supports AVIF, WebP, and SVG.", icon: "swap_horiz", path: "/converter", span: "md:col-span-4", tags: ["WebP", "AVIF", "SVG"] },
  { title: "AI Background Remover", desc: "Remove image backgrounds with on-device AI. Bulk processing, transparent PNG output, 100% private — no upload to any server.", icon: "background_replace", path: "/background-remover", span: "md:col-span-6", tags: ["AI", "Bulk", "PNG"] },
  { title: "Image to SVG Icon", desc: "Vectorize PNG, JPG or WebP into scalable SVG icons in standard sizes (16–256px). Bulk upload, color or B&W tracing.", icon: "polyline", path: "/image-to-svg", span: "md:col-span-6", tags: ["SVG", "Icon", "Vector"] },
  { title: "Video → GIF Converter", desc: "Convert short videos to optimized GIF, WebM or MP4 with trimming, FPS and resolution control. Powered by FFmpeg in your browser.", icon: "gif_box", path: "/video-to-gif", span: "md:col-span-8", large: true, tags: ["GIF", "WebM", "MP4"] },
  { title: "Watermark Tool", desc: "Add text or logo watermarks to bulk images. Position, opacity and tile pattern.", icon: "branding_watermark", path: "/watermark", span: "md:col-span-4", tags: ["Bulk"] },
  { title: "SVG Path Optimizer", desc: "Clean up messy exports from Illustrator or Figma. Minify paths and remove metadata.", icon: "slide_library", path: "/svg-optimizer", span: "md:col-span-4" },
  { title: "Favicon Generator", desc: "Generate the complete set of icons for every platform. Includes Apple Touch Icons, Android manifest, and classic ICO formats.", icon: "branding_watermark", path: "/favicon", span: "md:col-span-8", large: true },
  { title: "Image Resizer", desc: "Resize and crop images to exact dimensions with precision. Maintain aspect ratio or set custom values.", icon: "aspect_ratio", path: "/image-resizer", span: "md:col-span-6" },
  { title: "Placeholder Image", desc: "Generate custom placeholder images with specific dimensions, colors, and text for your mockups.", icon: "image", path: "/placeholder", span: "md:col-span-6" },
];

const devTools = [
  { title: "PDF Toolkit", desc: "Merge, split, compress and convert PDFs to images. Fully browser-based — no upload, no watermarks, no signup.", icon: "picture_as_pdf", path: "/pdf-toolkit", span: "md:col-span-8", large: true, tags: ["Merge", "Split", "Compress"] },
  { title: "JWT Decoder", desc: "Decode and verify JSON Web Tokens. Inspect claims, check expiry, verify HMAC signatures locally.", icon: "key", path: "/jwt-decoder", span: "md:col-span-4", tags: ["Auth"] },
  { title: "Regex Tester", desc: "Test JavaScript regular expressions with live match highlighting, capture groups, replace preview and a cheat sheet.", icon: "code_blocks", path: "/regex-tester", span: "md:col-span-6", tags: ["Regex"] },
  { title: "Diff Checker", desc: "Compare two text blocks side-by-side with line or word-level diff highlighting.", icon: "compare_arrows", path: "/diff-checker", span: "md:col-span-6", tags: ["Compare"] },
  { title: "cURL / HTTP Builder", desc: "Build HTTP requests visually, copy as cURL or fetch(), and test directly in your browser.", icon: "terminal", path: "/curl-builder", span: "md:col-span-6", tags: ["API"] },
  { title: "JSON Formatter", desc: "Format, validate, and minify JSON data instantly. Detect syntax errors and fix malformed JSON with ease.", icon: "data_object", path: "/json-formatter", span: "md:col-span-6" },
  { title: "CSS Minifier", desc: "Minify your CSS to reduce file size or beautify compressed CSS for readability.", icon: "css", path: "/css-minifier", span: "md:col-span-4" },
  { title: "Base64 Tool", desc: "Encode text or files to Base64, or decode Base64 strings back to plain text.", icon: "password", path: "/base64", span: "md:col-span-4" },
  { title: "HTML to Markdown", desc: "Convert HTML code to clean, readable Markdown format for documentation and README files.", icon: "html", path: "/html-to-markdown", span: "md:col-span-4" },
];

const seoTools = [
  { title: "AI Alt Text Generator", desc: "Generate SEO-optimized, accessibility-friendly alt text for bulk images using AI vision.", icon: "auto_awesome", path: "/alt-text-generator", span: "md:col-span-8", large: true, tags: ["AI", "Bulk"] },
  { title: "Schema Generator", desc: "Build JSON-LD structured data for Article, Product, FAQ, LocalBusiness, Organization and more.", icon: "schema", path: "/schema-generator", span: "md:col-span-4", tags: ["JSON-LD"] },
  { title: "Sitemap Generator", desc: "Build a Google-ready XML sitemap from a URL list with per-page priority and validate the output.", icon: "account_tree", path: "/sitemap-generator", span: "md:col-span-6", tags: ["XML"] },
  { title: "Meta Tag Generator", desc: "Generate optimized meta tags for better search engine rankings and social media previews.", icon: "code", path: "/meta-tag-generator", span: "md:col-span-6" },
  { title: "PageSpeed Analyzer", desc: "Audit Core Web Vitals (LCP, CLS, INP) with Google Lighthouse — the same score Google uses for ranking.", icon: "speed", path: "/pagespeed-analyzer", span: "md:col-span-4", tags: ["CWV"] },
  { title: "OG Preview", desc: "Preview how your page will appear when shared on Facebook, Twitter, and LinkedIn.", icon: "preview", path: "/og-preview", span: "md:col-span-4" },
  { title: "Robots.txt Generator", desc: "Create robots.txt files to control how search engines crawl your website.", icon: "smart_toy", path: "/robots-generator", span: "md:col-span-4" },
  { title: "Color Palette", desc: "Generate complementary, analogous, and triadic palettes from any base color.", icon: "palette", path: "/color-palette", span: "md:col-span-4" },
  { title: "CSS Gradient", desc: "Create stunning CSS gradients visually. Choose colors, adjust angles, and copy CSS code.", icon: "gradient", path: "/gradient-generator", span: "md:col-span-4" },
  { title: "QR Code Generator", desc: "Generate advanced QR codes with logo overlay, custom shapes, WiFi, vCard and more.", icon: "qr_code_2", path: "/qr-code", span: "md:col-span-4" },
  { title: "Lorem Ipsum Generator", desc: "Generate placeholder dummy text for your designs. Choose paragraphs, sentences, or words.", icon: "notes", path: "/lorem-ipsum", span: "md:col-span-6" },
];

const stats = [
  { value: "17+", label: "Free Tools" },
  { value: "0ms", label: "Latency" },
  { value: "100%", label: "Privacy" },
];

interface ToolCardData { title: string; desc: string; icon: string; path: string; span: string; large?: boolean; tags?: string[] }

const ToolCard = ({ tool, index }: { tool: ToolCardData; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-30px" }}
    transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
    className={tool.span}
  >
    <Link
      to={tool.path}
      className="block bg-surface-container rounded-xl overflow-hidden group hover:bg-surface-container-highest transition-all duration-500 relative border border-transparent hover:border-primary/10 h-full"
    >
      <motion.div
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.3 }}
        className={`p-8 md:p-10 h-full flex flex-col justify-between relative z-10`}
      >
        <div>
          <div className="w-12 h-12 bg-secondary-container flex items-center justify-center rounded-lg mb-6 group-hover:shadow-[0_0_20px_hsla(82,98%,72%,0.15)] transition-shadow duration-500">
            <span className="material-symbols-outlined text-secondary">{tool.icon}</span>
          </div>
          <h3 className={`${tool.large ? "text-2xl md:text-3xl" : "text-xl md:text-2xl"} font-headline font-bold mb-4`}>{tool.title}</h3>
          <p className="text-on-surface-variant max-w-md leading-relaxed">{tool.desc}</p>
        </div>
        {"tags" in tool && (tool as any).tags && (
          <div className="mt-8 flex gap-2">
            {(tool as any).tags.map((tag: string) => (
              <span key={tag} className="px-2 py-1 bg-surface-container-low rounded text-[10px] font-bold text-foreground/60 uppercase">{tag}</span>
            ))}
          </div>
        )}
        {tool.large && (
          <div className="mt-12 flex items-center gap-4">
            <span className="text-primary font-bold tracking-tight group-hover:translate-x-1 transition-transform">Open Tool</span>
            <div className="h-[1px] flex-grow bg-outline-variant/20" />
            <span className="text-xs font-label uppercase text-foreground/40 tracking-widest">Free</span>
          </div>
        )}
      </motion.div>
    </Link>
  </motion.div>
);



const HeroSection = () => {
  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[100px]" />
      <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-block px-3 py-1 bg-secondary-container text-secondary text-xs font-bold tracking-widest uppercase rounded mb-6 font-label"
            >
              WeboGrowth Laboratory v1.0
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-5xl md:text-7xl lg:text-8xl font-headline font-bold leading-[0.9] tracking-tight text-foreground mb-8"
            >
              Optimize Your{" "}
              <span className="gradient-text">Web Assets</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="text-lg md:text-xl text-on-surface-variant max-w-xl mb-10 leading-relaxed"
            >
              17+ free developer and designer tools for the modern web. Compress images, format JSON, generate QR codes, create meta tags, and more — all in your browser with 100% privacy.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-wrap gap-4"
            >
              <Link
                to="/compressor"
                className="bg-primary text-on-primary px-8 py-4 rounded-lg font-bold flex items-center gap-3 transition-all duration-300 hover:shadow-[0_0_20px_hsla(82,98%,72%,0.3)] group"
              >
                Launch Compressor
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </Link>
              <Link
                to="/json-formatter"
                className="bg-transparent border border-outline-variant/20 text-foreground px-8 py-4 rounded-lg font-bold hover:bg-surface-container-highest transition-all duration-300"
              >
                Try JSON Formatter
              </Link>
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="hidden lg:flex items-center justify-center"
          >
            <Lottie animationData={heroAnimation} loop className="w-full max-w-xl" />

          </motion.div>
        </div>
      </div>
    </section>
  );
};

const Index = () => {
  const { toast } = useToast();
  const [nlEmail, setNlEmail] = useState("");
  const [nlSending, setNlSending] = useState(false);

  const handleNewsletterSubscribe = async () => {
    if (!nlEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nlEmail)) {
      toast({ title: "Please enter a valid email", variant: "destructive" });
      return;
    }
    setNlSending(true);
    try {
      let toEmail = "rafikuzzaman10@gmail.com";
      try {
        const saved = localStorage.getItem("wg_admin_settings");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.newsletterEmail) toEmail = parsed.newsletterEmail;
        }
      } catch {}

      const { error } = await supabase.functions.invoke("send-contact-email", {
        body: { email: nlEmail.trim(), toEmail, type: "newsletter" },
      });
      if (error) throw error;
      toast({ title: "Subscribed successfully!", description: "You'll receive updates from WeboGrowth." });
      setNlEmail("");
    } catch {
      toast({ title: "Could not subscribe", description: "Please try again later.", variant: "destructive" });
    } finally {
      setNlSending(false);
    }
  };

  return (
  <div>
    <SEOHead {...getSeoProps("/")!} />
    <HeroSection />

    <section className="py-20 px-6 md:px-8 max-w-7xl mx-auto">
      <AnimatedSection>
        <div className="mb-10">
          <span className="text-[10px] font-label uppercase tracking-widest text-primary font-bold block mb-2">Image Tools</span>
          <h2 className="text-3xl md:text-4xl font-headline font-bold">Compress, Convert & Optimize</h2>
        </div>
      </AnimatedSection>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {imageTools.map((tool, i) => <ToolCard key={tool.path} tool={tool} index={i} />)}
      </div>
    </section>

    <section className="py-20 px-6 md:px-8 max-w-7xl mx-auto">
      <AnimatedSection>
        <div className="mb-10">
          <span className="text-[10px] font-label uppercase tracking-widest text-primary font-bold block mb-2">Developer Tools</span>
          <h2 className="text-3xl md:text-4xl font-headline font-bold">Format, Minify & Convert</h2>
        </div>
      </AnimatedSection>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {devTools.map((tool, i) => <ToolCard key={tool.path} tool={tool} index={i} />)}
      </div>
    </section>

    <section className="py-20 px-6 md:px-8 max-w-7xl mx-auto">
      <AnimatedSection>
        <div className="mb-10">
          <span className="text-[10px] font-label uppercase tracking-widest text-primary font-bold block mb-2">SEO & Design</span>
          <h2 className="text-3xl md:text-4xl font-headline font-bold">Generate, Preview & Create</h2>
        </div>
      </AnimatedSection>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {seoTools.map((tool, i) => <ToolCard key={tool.path} tool={tool} index={i} />)}
      </div>
    </section>

    <section className="py-24 bg-surface-container-low/30">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <AnimatedSection>
          <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-headline font-bold mb-4">Precision Engineered</h2>
              <p className="text-on-surface-variant">
                Our tools use browser-native APIs for near-native performance. No files are ever uploaded permanently, ensuring 100% privacy and security for your sensitive assets. Visit{" "}
                <a href="https://webogrowth.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">WeboGrowth.Com</a> for more.
              </p>
            </div>
            <div className="flex gap-12">
              {stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="text-center"
                >
                  <div className="text-3xl md:text-4xl font-headline font-bold text-primary mb-1">{s.value}</div>
                  <div className="text-[10px] uppercase tracking-widest text-foreground/40 font-bold">{s.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </AnimatedSection>
        <AnimatedSection delay={0.1}>
          <div className="bg-gradient-to-r from-surface-container to-surface-container-high p-8 md:p-12 rounded-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <h3 className="text-2xl font-headline font-bold mb-2">Join the WeboGrowth Lab</h3>
                <p className="text-on-surface-variant">Get notified when we release new optimization engines.</p>
              </div>
              <div className="flex w-full md:w-auto gap-2">
                <input
                  className="bg-surface-container-lowest border-none focus:ring-1 focus:ring-primary rounded-lg px-6 py-4 w-full md:w-80 text-foreground placeholder:text-foreground/30 outline-none"
                  placeholder="Enter your email"
                  type="email"
                  value={nlEmail}
                  onChange={(e) => setNlEmail(e.target.value)}
                />
                <button
                  onClick={handleNewsletterSubscribe}
                  disabled={nlSending}
                  className="bg-secondary text-on-secondary px-6 py-4 rounded-lg font-bold hover:opacity-90 transition-colors whitespace-nowrap disabled:opacity-50"
                >
                  {nlSending ? "..." : "Subscribe"}
                </button>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  </div>
  );
};

export default Index;
