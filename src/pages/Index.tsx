import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Lottie from "lottie-react";
import { useState, useEffect } from "react";
import SEOHead from "@/components/SEOHead";
import AnimatedSection from "@/components/AnimatedSection";

const imageTools = [
  { title: "Image Compressor", desc: "Lossless and lossy compression for PNG, JPEG, and WebP. Reduce file sizes by up to 90% without sacrificing visual fidelity.", icon: "compress", path: "/compressor", span: "md:col-span-8", large: true },
  { title: "Format Converter", desc: "Transform assets between formats instantly. Supports AVIF, WebP, and SVG.", icon: "swap_horiz", path: "/converter", span: "md:col-span-4", tags: ["WebP", "AVIF", "SVG"] },
  { title: "SVG Path Optimizer", desc: "Clean up messy exports from Illustrator or Figma. Minify paths and remove metadata.", icon: "slide_library", path: "/svg-optimizer", span: "md:col-span-4" },
  { title: "Favicon Generator", desc: "Generate the complete set of icons for every platform. Includes Apple Touch Icons, Android manifest, and classic ICO formats.", icon: "branding_watermark", path: "/favicon", span: "md:col-span-8", large: true },
  { title: "Image Resizer", desc: "Resize and crop images to exact dimensions with precision. Maintain aspect ratio or set custom values.", icon: "aspect_ratio", path: "/image-resizer", span: "md:col-span-6" },
  { title: "Placeholder Image", desc: "Generate custom placeholder images with specific dimensions, colors, and text for your mockups.", icon: "image", path: "/placeholder", span: "md:col-span-6" },
];

const devTools = [
  { title: "JSON Formatter", desc: "Format, validate, and minify JSON data instantly. Detect syntax errors and fix malformed JSON with ease.", icon: "data_object", path: "/json-formatter", span: "md:col-span-6" },
  { title: "CSS Minifier", desc: "Minify your CSS to reduce file size or beautify compressed CSS for readability.", icon: "css", path: "/css-minifier", span: "md:col-span-6" },
  { title: "Base64 Tool", desc: "Encode text or files to Base64, or decode Base64 strings back to plain text.", icon: "password", path: "/base64", span: "md:col-span-4" },
  { title: "HTML to Markdown", desc: "Convert HTML code to clean, readable Markdown format for documentation and README files.", icon: "html", path: "/html-to-markdown", span: "md:col-span-8", large: true },
];

const seoTools = [
  { title: "Meta Tag Generator", desc: "Generate optimized meta tags for better search engine rankings and social media previews.", icon: "code", path: "/meta-tag-generator", span: "md:col-span-8", large: true },
  { title: "OG Preview", desc: "Preview how your page will appear when shared on Facebook, Twitter, and LinkedIn.", icon: "preview", path: "/og-preview", span: "md:col-span-4" },
  { title: "Robots.txt Generator", desc: "Create robots.txt files to control how search engines crawl your website.", icon: "smart_toy", path: "/robots-generator", span: "md:col-span-4" },
  { title: "Color Palette", desc: "Generate complementary, analogous, and triadic palettes from any base color.", icon: "palette", path: "/color-palette", span: "md:col-span-4" },
  { title: "CSS Gradient", desc: "Create stunning CSS gradients visually. Choose colors, adjust angles, and copy CSS code.", icon: "gradient", path: "/gradient-generator", span: "md:col-span-4" },
  { title: "QR Code Generator", desc: "Generate advanced QR codes with logo overlay, custom shapes, WiFi, vCard and more.", icon: "qr_code_2", path: "/qr-code", span: "md:col-span-6" },
  { title: "Lorem Ipsum Generator", desc: "Generate placeholder dummy text for your designs. Choose paragraphs, sentences, or words.", icon: "notes", path: "/lorem-ipsum", span: "md:col-span-6" },
];

const stats = [
  { value: "17+", label: "Free Tools" },
  { value: "0ms", label: "Latency" },
  { value: "100%", label: "Privacy" },
];

const ToolCard = ({ tool, index }: { tool: typeof imageTools[0]; index: number }) => (
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

const LOTTIE_URL = "https://lottie.host/f4e2f8c1-0e30-4e0c-9e3e-4e8c1e2b3c4d/coding-animation.json";

const HeroSection = () => {
  const [animationData, setAnimationData] = useState<any>(null);

  useEffect(() => {
    fetch("https://lottie.host/64ad9a81-aabc-4a8f-b50f-6a61b36480b5/UZHLkEhNJA.json")
      .then(res => res.json())
      .then(setAnimationData)
      .catch(() => {});
  }, []);

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
            {animationData ? (
              <Lottie animationData={animationData} loop className="w-full max-w-lg" />
            ) : (
              <div className="w-full max-w-lg aspect-square bg-surface-container/30 rounded-2xl animate-pulse" />
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const Index = () => (
  <div>
    <SEOHead
      title="WeboGrowth Tools - Free Online Image Compressor, Converter & Optimizer"
      description="Free online image optimization tools by WeboGrowth. Compress PNG, JPEG, WebP images, convert formats, optimize SVGs, generate favicons, format JSON, create QR codes, and 17+ more tools."
      keywords="image compressor online free, compress image, convert image format, svg optimizer, favicon generator, webp converter, json formatter, meta tag generator, qr code generator, css minifier"
      canonicalPath="/"
    />
    {/* Hero */}
    <HeroSection />

    {/* Image Tools */}
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

    {/* Developer Tools */}
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

    {/* SEO & Design Tools */}
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

    {/* Stats & Newsletter */}
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
                />
                <button className="bg-secondary text-on-secondary px-6 py-4 rounded-lg font-bold hover:opacity-90 transition-colors whitespace-nowrap">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  </div>
);

export default Index;
