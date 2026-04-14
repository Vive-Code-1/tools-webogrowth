import { Link } from "react-router-dom";
import SEOHead from "@/components/SEOHead";

const tools = [
  {
    title: "Image Compressor",
    desc: "Lossless and lossy compression for PNG, JPEG, and WebP. Reduce file sizes by up to 90% without sacrificing visual fidelity.",
    icon: "compress",
    path: "/compressor",
    span: "md:col-span-8",
    large: true,
  },
  {
    title: "Format Converter",
    desc: "Transform assets between formats instantly. Supports AVIF, WebP, and SVG.",
    icon: "swap_horiz",
    path: "/converter",
    span: "md:col-span-4",
    tags: ["WebP", "AVIF", "SVG"],
  },
  {
    title: "SVG Path Optimizer",
    desc: "Clean up messy exports from Illustrator or Figma. Minify paths and remove metadata.",
    icon: "slide_library",
    path: "/svg-optimizer",
    span: "md:col-span-4",
  },
  {
    title: "Favicon Generator",
    desc: "Generate the complete set of icons for every platform. Includes Apple Touch Icons, Android manifest, and classic ICO formats in seconds.",
    icon: "branding_watermark",
    path: "/favicon",
    span: "md:col-span-8",
    large: true,
  },
];

const stats = [
  { value: "0ms", label: "Latency" },
  { value: "100%", label: "Privacy" },
];

const Index = () => (
  <div>
    <SEOHead
      title="WeboGrowth Tools - Free Online Image Compressor, Converter & Optimizer"
      description="Free online image optimization tools by WeboGrowth. Compress PNG, JPEG, WebP images, convert formats, optimize SVGs, and generate favicons instantly."
      keywords="image compressor online free, compress image, convert image format, svg optimizer, favicon generator, webp converter"
      canonicalPath="/"
    />
    {/* Hero */}
    <section className="relative overflow-hidden py-24 md:py-32">
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[100px]" />
      <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
        <div className="max-w-3xl">
          <span className="inline-block px-3 py-1 bg-secondary-container text-secondary text-xs font-bold tracking-widest uppercase rounded mb-6 font-label">
            WeboGrowth Laboratory v1.0
          </span>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-headline font-bold leading-[0.9] tracking-tight text-foreground mb-8">
            Optimize Your{" "}
            <span className="gradient-text">Web Assets</span>
          </h1>
          <p className="text-lg md:text-xl text-on-surface-variant max-w-xl mb-10 leading-relaxed">
            High-performance developer utilities for the modern web. Sanitize, compress, and convert with surgical precision.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/compressor"
              className="bg-primary text-on-primary px-8 py-4 rounded-lg font-bold flex items-center gap-3 transition-all duration-300 hover:shadow-[0_0_20px_hsla(82,98%,72%,0.3)] group"
            >
              Launch Compressor
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </Link>
            <Link
              to="/converter"
              className="bg-transparent border border-outline-variant/20 text-foreground px-8 py-4 rounded-lg font-bold hover:bg-surface-container-highest transition-all duration-300"
            >
              View Tools
            </Link>
          </div>
        </div>
      </div>
    </section>

    {/* Tool Grid */}
    <section className="py-20 px-6 md:px-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {tools.map((tool) => (
          <Link
            key={tool.path}
            to={tool.path}
            className={`${tool.span} bg-surface-container rounded-xl overflow-hidden group hover:bg-surface-container-highest transition-all duration-500 relative border border-transparent hover:border-primary/10`}
          >
            <div className={`p-8 md:p-10 h-full flex flex-col justify-between relative z-10`}>
              <div>
                <div className="w-12 h-12 bg-secondary-container flex items-center justify-center rounded-lg mb-6">
                  <span className="material-symbols-outlined text-secondary">{tool.icon}</span>
                </div>
                <h3 className={`${tool.large ? "text-2xl md:text-3xl" : "text-xl md:text-2xl"} font-headline font-bold mb-4`}>
                  {tool.title}
                </h3>
                <p className="text-on-surface-variant max-w-md leading-relaxed">{tool.desc}</p>
              </div>
              {tool.tags && (
                <div className="mt-8 flex gap-2">
                  {tool.tags.map((tag) => (
                    <span key={tag} className="px-2 py-1 bg-surface-container-low rounded text-[10px] font-bold text-foreground/60 uppercase">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              {tool.large && (
                <div className="mt-12 flex items-center gap-4">
                  <span className="text-primary font-bold tracking-tight">Open Tool</span>
                  <div className="h-[1px] flex-grow bg-outline-variant/20" />
                  <span className="text-xs font-label uppercase text-foreground/40 tracking-widest">Stable</span>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>

    {/* Stats & Newsletter */}
    <section className="py-24 bg-surface-container-low/30">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-headline font-bold mb-4">Precision Engineered</h2>
            <p className="text-on-surface-variant">
              Our tools use browser-native APIs for near-native performance. No files are ever uploaded permanently, ensuring 100% privacy and security for your sensitive assets.
            </p>
          </div>
          <div className="flex gap-12">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl md:text-4xl font-headline font-bold text-primary mb-1">{s.value}</div>
                <div className="text-[10px] uppercase tracking-widest text-foreground/40 font-bold">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        {/* Newsletter CTA */}
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
      </div>
    </section>
  </div>
);

export default Index;
