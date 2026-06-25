import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { toolCategories } from "@/lib/tools";

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
    <header className="fixed top-0 w-full z-[70] bg-surface-container-low/90 backdrop-blur-xl border-b border-outline-variant/10">
      <nav className="relative z-[80] flex justify-between items-center px-6 md:px-8 py-4 max-w-7xl mx-auto">
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
                <div className="fixed inset-x-0 top-[64px] h-8 z-[65]" aria-hidden="true" />



                <div
                  role="menu"
                  className="fixed top-[88px] left-1/2 -translate-x-1/2 w-[min(1120px,calc(100vw-1.5rem))] max-h-[calc(100vh-108px)] bg-surface-container-low rounded-2xl border border-outline-variant/40 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.95)] ring-1 ring-inset ring-white/5 animate-fade-in overflow-hidden flex flex-col z-[75] before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-b before:from-white/[0.06] before:via-transparent before:to-transparent"
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

      {/* Full-viewport scrim for the desktop mega menu. It stays below the nav and menu, while
          still covering all page content behind them. */}
      {desktopDropdown && (
        <div
          className="fixed inset-0 z-[60] animate-fade-in"
          aria-hidden="true"
          onClick={() => setDesktopDropdown(false)}
        >
          <div
            className="absolute inset-0 supports-[backdrop-filter]:bg-background/70 bg-background"
            style={{
              backdropFilter: "blur(32px) saturate(140%)",
              WebkitBackdropFilter: "blur(32px) saturate(140%)",
            }}
          />
          <div className="absolute inset-0 bg-background/95" />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background/90" />
        </div>
      )}


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
