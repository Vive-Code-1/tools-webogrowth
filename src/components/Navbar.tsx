import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

const toolCategories = [
  {
    label: "Image Tools",
    tools: [
      { label: "Compressor", path: "/compressor" },
      { label: "Converter", path: "/converter" },
      { label: "Image Resizer", path: "/image-resizer" },
      { label: "Favicon Generator", path: "/favicon" },
      { label: "Placeholder Image", path: "/placeholder" },
    ],
  },
  {
    label: "Developer Tools",
    tools: [
      { label: "JSON Formatter", path: "/json-formatter" },
      { label: "CSS Minifier", path: "/css-minifier" },
      { label: "Base64 Tool", path: "/base64" },
      { label: "SVG Optimizer", path: "/svg-optimizer" },
      { label: "HTML to Markdown", path: "/html-to-markdown" },
    ],
  },
  {
    label: "SEO & Design",
    tools: [
      { label: "Meta Tag Generator", path: "/meta-tag-generator" },
      { label: "OG Preview", path: "/og-preview" },
      { label: "Robots.txt Generator", path: "/robots-generator" },
      { label: "Color Palette", path: "/color-palette" },
      { label: "Gradient Generator", path: "/gradient-generator" },
      { label: "Lorem Ipsum Generator", path: "/lorem-ipsum" },
      { label: "QR Code Generator", path: "/qr-code" },
    ],
  },
];

const Navbar = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopDropdown, setDesktopDropdown] = useState(false);

  return (
    <header className="fixed top-0 w-full z-50 bg-surface-container-low/70 backdrop-blur-xl">
      <nav className="flex justify-between items-center px-6 md:px-8 py-4 max-w-7xl mx-auto">
        <Link to="/" className="text-2xl font-bold tracking-tighter text-foreground font-headline">
          WeboGrowth Tools
        </Link>
        <div className="hidden md:flex items-center gap-8 font-headline tracking-tight">
          <Link
            to="/compressor"
            className={`transition-all duration-300 ${location.pathname === "/compressor" ? "text-primary" : "text-on-surface-variant hover:text-primary"}`}
          >
            Compressor
          </Link>
          <Link
            to="/converter"
            className={`transition-all duration-300 ${location.pathname === "/converter" ? "text-primary" : "text-on-surface-variant hover:text-primary"}`}
          >
            Converter
          </Link>
          <div
            className="relative"
            onMouseEnter={() => setDesktopDropdown(true)}
            onMouseLeave={() => setDesktopDropdown(false)}
          >
            <button className="text-on-surface-variant hover:text-primary transition-all duration-300 flex items-center gap-1">
              All Tools
              <span className={`material-symbols-outlined text-sm transition-transform ${desktopDropdown ? "rotate-180" : ""}`}>expand_more</span>
            </button>
            {/* Invisible hover bridge */}
            {desktopDropdown && (
              <div className="absolute top-full right-0 w-full h-4" />
            )}
            {desktopDropdown && (
              <div className="absolute top-[calc(100%+16px)] right-0 bg-surface-container-low/95 backdrop-blur-xl rounded-xl border border-outline-variant/15 p-8 min-w-[640px] shadow-2xl grid grid-cols-3 gap-8">
                {toolCategories.map((cat) => (
                  <div key={cat.label}>
                    <span className="text-xs font-label uppercase tracking-widest text-primary font-bold block mb-4">{cat.label}</span>
                    <div className="space-y-1">
                      {cat.tools.map((tool) => (
                        <Link
                          key={tool.path}
                          to={tool.path}
                          className={`block text-base py-1.5 transition-colors ${location.pathname === tool.path ? "text-primary font-bold" : "text-on-surface-variant hover:text-foreground"}`}
                        >
                          {tool.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/compressor"
            className="hidden md:inline-flex bg-primary text-on-primary px-6 py-2 rounded-lg font-bold transition-all duration-300 hover:shadow-[0_0_20px_hsla(82,98%,72%,0.3)] active:scale-95"
          >
            Get Started
          </Link>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-foreground"
          >
            <span className="material-symbols-outlined text-2xl">
              {mobileOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </nav>
      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-surface-container-low/95 backdrop-blur-xl border-t border-outline-variant/15 px-6 py-4 space-y-4 max-h-[80vh] overflow-y-auto">
          {toolCategories.map((cat) => (
            <div key={cat.label}>
              <span className="text-xs font-label uppercase tracking-widest text-primary font-bold block mb-2">{cat.label}</span>
              {cat.tools.map((tool) => (
                <Link
                  key={tool.path}
                  to={tool.path}
                  onClick={() => setMobileOpen(false)}
                  className={`block py-2 font-headline text-base ${location.pathname === tool.path ? "text-primary" : "text-on-surface-variant"}`}
                >
                  {tool.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
      )}
    </header>
  );
};

export default Navbar;
