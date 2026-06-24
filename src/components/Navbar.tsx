import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  ArrowShrink02Icon,
  Exchange01Icon,
  ImageCropIcon,
  Svg01Icon,
  Svg02Icon,
  AiEraserIcon,
  Resize01Icon,
  Stamp01Icon,
  GifIcon,
  StarIcon,
  LayerMask01Icon,
  BracketsIcon,
  FileKeyIcon,
  RegexIcon,
  FileDiffIcon,
  TerminalIcon,
  Pdf01Icon,
  CssThreeIcon,
  BinaryCodeIcon,
  HtmlFiveIcon,
  HashtagIcon,
  HierarchyIcon,
  Flowchart01Icon,
  AiMagicIcon,
  DashboardSpeed02Icon,
  SearchVisualIcon,
  Robot02Icon,
  ColorsIcon,
  PaintBoardIcon,
  TextFontIcon,
  QrCode01Icon,
} from "@hugeicons/core-free-icons";

type ToolItem = {
  label: string;
  path: string;
  desc: string;
  icon: IconSvgElement;
  /** Tailwind text color for the icon + tinted bg. Pairs with bg-{color}-500/10 */
  accent: string;
};

const toolCategories: { label: string; tools: ToolItem[] }[] = [
  {
    label: "Image Tools",
    tools: [
      { label: "Compressor", path: "/compressor", desc: "Shrink PNG, JPEG & WebP up to 90%", icon: ArrowShrink02Icon, accent: "text-sky-400 bg-sky-400/10" },
      { label: "Converter", path: "/converter", desc: "Swap between WebP, PNG, JPEG", icon: Exchange01Icon, accent: "text-violet-400 bg-violet-400/10" },
      { label: "HEIC to JPG", path: "/heic-to-jpg", desc: "iPhone photos to JPG in browser", icon: ImageCropIcon, accent: "text-orange-400 bg-orange-400/10" },
      { label: "Image to SVG", path: "/image-to-svg", desc: "Trace bitmaps into clean vectors", icon: Svg01Icon, accent: "text-pink-400 bg-pink-400/10" },
      { label: "Background Remover", path: "/background-remover", desc: "AI cutout, no upload required", icon: AiEraserIcon, accent: "text-fuchsia-400 bg-fuchsia-400/10" },
      { label: "Image Resizer", path: "/image-resizer", desc: "Resize for web, social and print", icon: Resize01Icon, accent: "text-blue-400 bg-blue-400/10" },
      { label: "Watermark Tool", path: "/watermark", desc: "Stamp images with text or logo", icon: Stamp01Icon, accent: "text-amber-400 bg-amber-400/10" },
      { label: "Video to GIF", path: "/video-to-gif", desc: "Convert clips to optimized GIFs", icon: GifIcon, accent: "text-rose-400 bg-rose-400/10" },
      { label: "Favicon Generator", path: "/favicon", desc: "Multi-size favicons in one click", icon: StarIcon, accent: "text-yellow-400 bg-yellow-400/10" },
      { label: "Placeholder Image", path: "/placeholder", desc: "Custom placeholders for mockups", icon: LayerMask01Icon, accent: "text-emerald-400 bg-emerald-400/10" },
    ],
  },
  {
    label: "Developer Tools",
    tools: [
      { label: "JSON Formatter", path: "/json-formatter", desc: "Beautify, validate and minify JSON", icon: BracketsIcon, accent: "text-lime-400 bg-lime-400/10" },
      { label: "JWT Decoder", path: "/jwt-decoder", desc: "Inspect header, payload & signature", icon: FileKeyIcon, accent: "text-amber-400 bg-amber-400/10" },
      { label: "Regex Tester", path: "/regex-tester", desc: "Live match, groups and flags", icon: RegexIcon, accent: "text-cyan-400 bg-cyan-400/10" },
      { label: "Diff Checker", path: "/diff-checker", desc: "Side-by-side text comparison", icon: FileDiffIcon, accent: "text-teal-400 bg-teal-400/10" },
      { label: "cURL Builder", path: "/curl-builder", desc: "Compose HTTP requests visually", icon: TerminalIcon, accent: "text-slate-300 bg-slate-300/10" },
      { label: "PDF Toolkit", path: "/pdf-toolkit", desc: "Merge, split and compress PDFs", icon: Pdf01Icon, accent: "text-red-400 bg-red-400/10" },
      { label: "CSS Minifier", path: "/css-minifier", desc: "Strip comments & whitespace", icon: CssThreeIcon, accent: "text-blue-400 bg-blue-400/10" },
      { label: "Base64 Tool", path: "/base64", desc: "Encode and decode text or files", icon: BinaryCodeIcon, accent: "text-indigo-400 bg-indigo-400/10" },
      { label: "SVG Optimizer", path: "/svg-optimizer", desc: "Shrink SVGs without breaking them", icon: Svg02Icon, accent: "text-pink-400 bg-pink-400/10" },
      { label: "HTML to Markdown", path: "/html-to-markdown", desc: "Clean Markdown from any HTML", icon: HtmlFiveIcon, accent: "text-orange-400 bg-orange-400/10" },
    ],
  },
  {
    label: "SEO & Design",
    tools: [
      { label: "Meta Tag Generator", path: "/meta-tag-generator", desc: "Title, description & OG tags", icon: HashtagIcon, accent: "text-emerald-400 bg-emerald-400/10" },
      { label: "Schema Generator", path: "/schema-generator", desc: "JSON-LD for rich results", icon: HierarchyIcon, accent: "text-violet-400 bg-violet-400/10" },
      { label: "Sitemap Generator", path: "/sitemap-generator", desc: "XML sitemap from any URL list", icon: Flowchart01Icon, accent: "text-teal-400 bg-teal-400/10" },
      { label: "AI Alt Text", path: "/alt-text-generator", desc: "Describe images with AI", icon: AiMagicIcon, accent: "text-fuchsia-400 bg-fuchsia-400/10" },
      { label: "PageSpeed Analyzer", path: "/pagespeed-analyzer", desc: "Core Web Vitals at a glance", icon: DashboardSpeed02Icon, accent: "text-lime-400 bg-lime-400/10" },
      { label: "OG Preview", path: "/og-preview", desc: "See your link card before posting", icon: SearchVisualIcon, accent: "text-sky-400 bg-sky-400/10" },
      { label: "Robots.txt Generator", path: "/robots-generator", desc: "Control how crawlers see you", icon: Robot02Icon, accent: "text-slate-300 bg-slate-300/10" },
      { label: "Color Palette", path: "/color-palette", desc: "Extract palettes from any image", icon: ColorsIcon, accent: "text-pink-400 bg-pink-400/10" },
      { label: "Gradient Generator", path: "/gradient-generator", desc: "Build smooth CSS gradients", icon: PaintBoardIcon, accent: "text-purple-400 bg-purple-400/10" },
      { label: "Lorem Ipsum", path: "/lorem-ipsum", desc: "Filler text for mockups", icon: TextFontIcon, accent: "text-amber-400 bg-amber-400/10" },
      { label: "QR Code Generator", path: "/qr-code", desc: "Branded QR codes for any URL", icon: QrCode01Icon, accent: "text-lime-400 bg-lime-400/10" },
    ],
  },
];

const SETTINGS_KEY = "wg_admin_settings";

const Navbar = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopDropdown, setDesktopDropdown] = useState(false);
  const [logo, setLogo] = useState("");

  useEffect(() => {
    const loadLogo = () => {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setLogo(parsed.logo || "");
        } catch {}
      }
    };
    loadLogo();
    window.addEventListener("storage", loadLogo);
    window.addEventListener("wg-settings-updated", loadLogo);
    return () => {
      window.removeEventListener("storage", loadLogo);
      window.removeEventListener("wg-settings-updated", loadLogo);
    };
  }, []);

  const navLinkClass = (path: string) =>
    `transition-all duration-300 ${location.pathname === path ? "text-primary" : "text-on-surface-variant hover:text-primary"}`;

  return (
    <header className="fixed top-0 w-full z-50 bg-surface-container-low/70 backdrop-blur-xl">
      <nav className="flex justify-between items-center px-6 md:px-8 py-4 max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-2">
          {logo ? (
            <img src={logo} alt="WeboGrowth" className="h-8 w-auto" width="160" height="32" fetchPriority="high" decoding="async" />
          ) : (
            <span className="text-2xl font-bold tracking-tighter text-foreground font-headline">WeboGrowth</span>
          )}
        </Link>

        <div className="hidden md:flex items-center gap-8 font-headline tracking-tight">
          <Link to="/" className={navLinkClass("/")}>Home</Link>
          <Link to="/blog" className={navLinkClass("/blog")}>Blog</Link>
          <Link to="/about-us" className={navLinkClass("/about-us")}>About Us</Link>
          <div
            className="relative"
            onMouseEnter={() => setDesktopDropdown(true)}
            onMouseLeave={() => setDesktopDropdown(false)}
          >
            <button
              className="text-on-surface-variant hover:text-primary transition-all duration-300 flex items-center gap-1"
              aria-haspopup="true"
              aria-expanded={desktopDropdown}
            >
              All Tools
              <span className={`material-symbols-outlined text-sm transition-transform ${desktopDropdown ? "rotate-180" : ""}`}>expand_more</span>
            </button>
            {desktopDropdown && (
              <>
                {/* Invisible hover bridge so the menu stays open while the cursor crosses the gap */}
                <div className="fixed inset-x-0 top-[52px] h-5 z-40" aria-hidden="true" />
                <div
                  role="menu"
                  className="fixed top-[68px] left-1/2 -translate-x-1/2 w-[min(1120px,calc(100vw-1.5rem))] max-h-[calc(100vh-84px)] bg-surface-container-low backdrop-blur-2xl rounded-2xl border border-outline-variant/25 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.85)] ring-1 ring-inset ring-white/5 animate-fade-in overflow-hidden flex flex-col z-50 before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-b before:from-white/[0.06] before:via-transparent before:to-transparent"
                >
                  <div className="relative z-10 p-4 md:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 overflow-y-auto">
                    {toolCategories.map((cat) => (
                      <section key={cat.label} className="min-w-0">
                        <div className="flex items-center justify-between mb-2.5 px-1">
                          <span className="text-[11px] font-label uppercase tracking-[0.18em] text-primary font-bold">
                            {cat.label}
                          </span>
                          <span className="text-[10px] text-on-surface-variant/50">{cat.tools.length}</span>
                        </div>
                        <ul className="space-y-0.5">
                          {cat.tools.map((tool) => {
                            const active = location.pathname === tool.path;
                            return (
                              <li key={tool.path}>
                                <Link
                                  to={tool.path}
                                  role="menuitem"
                                  onClick={() => setDesktopDropdown(false)}
                                  className={`group flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors ${
                                    active
                                      ? "bg-primary/10"
                                      : "hover:bg-surface-container-high/60"
                                  }`}
                                >
                                  <span
                                    className={`shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-md ${tool.accent}`}
                                    aria-hidden="true"
                                  >
                                    <HugeiconsIcon icon={tool.icon} size={18} strokeWidth={1.7} />
                                  </span>
                                  <span className="min-w-0 flex-1">
                                    <span
                                      className={`block text-[13px] font-bold leading-tight truncate ${
                                        active ? "text-primary" : "text-foreground group-hover:text-primary"
                                      }`}
                                    >
                                      {tool.label}
                                    </span>
                                    <span className="block text-[11px] text-on-surface-variant/65 leading-snug truncate">
                                      {tool.desc}
                                    </span>
                                  </span>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </section>
                    ))}
                  </div>
                  <div className="relative border-t border-outline-variant/20 bg-surface-container px-5 py-2.5 flex items-center justify-between shrink-0">
                    <span className="text-[11px] text-on-surface-variant/70">
                      Free, browser-based — no signup required
                    </span>
                    <Link
                      to="/"
                      onClick={() => setDesktopDropdown(false)}
                      className="text-[11px] font-bold text-primary hover:underline"
                    >
                      Browse all tools →
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/contact-us"
            className="hidden md:inline-flex bg-primary text-on-primary px-6 py-2 rounded-lg font-bold transition-all duration-300 hover:shadow-[0_0_20px_hsla(82,98%,72%,0.3)] active:scale-95"
          >
            Contact Us
          </Link>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-foreground"
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
          >
            <span className="material-symbols-outlined text-2xl" aria-hidden="true">{mobileOpen ? "close" : "menu"}</span>
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div id="mobile-navigation" className="md:hidden bg-surface-container-low/95 backdrop-blur-xl border-t border-outline-variant/15 px-6 py-4 space-y-4 max-h-[80vh] overflow-y-auto">
          <Link to="/" onClick={() => setMobileOpen(false)} className={`block py-2 font-headline text-base ${location.pathname === "/" ? "text-primary" : "text-on-surface-variant"}`}>Home</Link>
          <Link to="/blog" onClick={() => setMobileOpen(false)} className={`block py-2 font-headline text-base ${location.pathname.startsWith("/blog") ? "text-primary" : "text-on-surface-variant"}`}>Blog</Link>
          <Link to="/about-us" onClick={() => setMobileOpen(false)} className={`block py-2 font-headline text-base ${location.pathname === "/about-us" ? "text-primary" : "text-on-surface-variant"}`}>About Us</Link>
          <Link to="/contact-us" onClick={() => setMobileOpen(false)} className={`block py-2 font-headline text-base ${location.pathname === "/contact-us" ? "text-primary" : "text-on-surface-variant"}`}>Contact Us</Link>
          <hr className="border-outline-variant/15" />
          {toolCategories.map((cat) => (
            <div key={cat.label}>
              <span className="text-xs font-label uppercase tracking-widest text-primary font-bold block mb-2">{cat.label}</span>
              <div className="grid grid-cols-1 gap-1">
                {cat.tools.map((tool) => (
                  <Link
                    key={tool.path}
                    to={tool.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 py-2 px-2 rounded-lg ${location.pathname === tool.path ? "bg-primary/10 text-primary" : "text-on-surface-variant"}`}
                  >
                    <span className={`inline-flex items-center justify-center w-9 h-9 rounded-lg ${tool.accent}`} aria-hidden="true">
                      <HugeiconsIcon icon={tool.icon} size={20} strokeWidth={1.6} />
                    </span>
                    <span className="font-headline text-base">{tool.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </header>
  );
};

export default Navbar;
