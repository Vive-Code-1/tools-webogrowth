import { Link } from "react-router-dom";

const footerLinks = [
  {
    title: "Image Tools",
    links: [
      { label: "Image Compressor", path: "/compressor" },
      { label: "Format Converter", path: "/converter" },
      { label: "Image Resizer", path: "/image-resizer" },
      { label: "Favicon Generator", path: "/favicon" },
      { label: "Placeholder Image", path: "/placeholder" },
    ],
  },
  {
    title: "Developer Tools",
    links: [
      { label: "JSON Formatter", path: "/json-formatter" },
      { label: "CSS Minifier", path: "/css-minifier" },
      { label: "Base64 Tool", path: "/base64" },
      { label: "SVG Optimizer", path: "/svg-optimizer" },
      { label: "HTML to Markdown", path: "/html-to-markdown" },
    ],
  },
  {
    title: "SEO & Design",
    links: [
      { label: "Meta Tag Generator", path: "/meta-tag-generator" },
      { label: "OG Preview", path: "/og-preview" },
      { label: "Robots.txt Generator", path: "/robots-generator" },
      { label: "Color Palette", path: "/color-palette" },
      { label: "Gradient Generator", path: "/gradient-generator" },
      { label: "QR Code Generator", path: "/qr-code" },
      { label: "Lorem Ipsum Generator", path: "/lorem-ipsum" },
    ],
  },
];

const Footer = () => (
  <footer className="w-full mt-20 bg-surface-container-lowest">
    <div className="max-w-7xl mx-auto px-6 md:px-8 py-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
        <div className="col-span-2 md:col-span-1">
          <Link to="/" className="text-lg font-black text-primary font-headline uppercase tracking-tighter block mb-3">
            WeboGrowth
          </Link>
          <p className="text-on-surface-variant/60 text-sm leading-relaxed mb-4">
            Free online tools for developers and designers. Compress, convert, optimize, and generate — all in your browser.
          </p>
          <div className="space-y-1">
            <Link to="/about-us" className="block text-sm text-on-surface-variant/60 hover:text-foreground transition-colors">About Us</Link>
            <Link to="/contact-us" className="block text-sm text-on-surface-variant/60 hover:text-foreground transition-colors">Contact Us</Link>
          </div>
        </div>
        {footerLinks.map((group) => (
          <div key={group.title}>
            <span className="text-[10px] font-label uppercase tracking-widest text-primary font-bold block mb-4">{group.title}</span>
            <div className="space-y-2">
              {group.links.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="block text-sm text-on-surface-variant/60 hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-outline-variant/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-on-surface-variant/50 font-label text-sm tracking-wide uppercase">
          © 2026{" "}
          <a href="https://webogrowth.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            WeboGrowth.Com
          </a>{" "}
          Copyright Reserved.
        </p>
        <div className="flex gap-6">
          <Link to="/privacy-policy" className="text-on-surface-variant/50 hover:text-secondary transition-colors font-label text-sm tracking-wide uppercase">
            Privacy Policy
          </Link>
          <Link to="/terms-of-service" className="text-on-surface-variant/50 hover:text-secondary transition-colors font-label text-sm tracking-wide uppercase">
            Terms of Service
          </Link>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
