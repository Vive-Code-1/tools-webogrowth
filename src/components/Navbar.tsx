import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

const navLinks = [
  { label: "Compressor", path: "/compressor" },
  { label: "Converter", path: "/converter" },
  { label: "SVG Optimizer", path: "/svg-optimizer" },
  { label: "Favicon", path: "/favicon" },
];

const Navbar = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full z-50 bg-surface-container-low/70 backdrop-blur-xl">
      <nav className="flex justify-between items-center px-6 md:px-8 py-4 max-w-7xl mx-auto">
        <Link to="/" className="text-2xl font-bold tracking-tighter text-foreground font-headline">
          WeboGrowth Tools
        </Link>
        <div className="hidden md:flex items-center gap-8 font-headline tracking-tight">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`transition-all duration-300 ${
                  isActive
                    ? "text-primary relative after:content-[''] after:absolute after:-bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-primary after:rounded-full"
                    : "text-on-surface-variant hover:text-primary"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
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
        <div className="md:hidden bg-surface-container-low/95 backdrop-blur-xl border-t border-outline-variant/15 px-6 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileOpen(false)}
              className={`block py-2 font-headline ${
                location.pathname === link.path ? "text-primary" : "text-on-surface-variant"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
};

export default Navbar;
