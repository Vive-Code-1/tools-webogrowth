import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="w-full mt-20 bg-surface-container-lowest">
    <div className="flex flex-col md:flex-row justify-between items-center px-8 py-12 max-w-7xl mx-auto">
      <div className="mb-8 md:mb-0">
        <span className="text-lg font-black text-primary font-headline uppercase tracking-tighter">
          WeboGrowth
        </span>
        <p className="text-on-surface-variant/50 font-label text-sm tracking-wide uppercase mt-2">
          © 2026{" "}
          <a href="https://webogrowth.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            WeboGrowth.Com
          </a>{" "}
          Copyright Reserved.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-8">
        {["Privacy Policy", "Terms of Service", "API Docs", "GitHub"].map((item) => (
          <a
            key={item}
            href="#"
            className="text-on-surface-variant/50 hover:text-secondary transition-colors font-label text-sm tracking-wide uppercase"
          >
            {item}
          </a>
        ))}
      </div>
    </div>
  </footer>
);

export default Footer;
