import { Link } from "react-router-dom";

interface Tool {
  title: string;
  path: string;
  icon: string;
  desc: string;
}

const allTools: Tool[] = [
  { title: "Image Compressor", path: "/compressor", icon: "compress", desc: "Compress PNG, JPEG, WebP images" },
  { title: "Format Converter", path: "/converter", icon: "swap_horiz", desc: "Convert between image formats" },
  { title: "Background Remover", path: "/background-remover", icon: "background_replace", desc: "AI background removal, browser-side" },
  { title: "Image to SVG", path: "/image-to-svg", icon: "polyline", desc: "Vectorize images to SVG icons" },
  { title: "Video to GIF", path: "/video-to-gif", icon: "gif_box", desc: "Trim & convert video to GIF/WebM" },
  { title: "Watermark Tool", path: "/watermark", icon: "branding_watermark", desc: "Add text/logo watermarks in bulk" },
  { title: "SVG Optimizer", path: "/svg-optimizer", icon: "slide_library", desc: "Minify and clean SVG files" },
  { title: "Favicon Generator", path: "/favicon", icon: "branding_watermark", desc: "Generate favicons for all platforms" },
  { title: "PDF Toolkit", path: "/pdf-toolkit", icon: "picture_as_pdf", desc: "Merge, split, compress PDFs" },
  { title: "JWT Decoder", path: "/jwt-decoder", icon: "key", desc: "Decode & verify JSON Web Tokens" },
  { title: "Regex Tester", path: "/regex-tester", icon: "code_blocks", desc: "Test regex with live highlights" },
  { title: "Diff Checker", path: "/diff-checker", icon: "compare_arrows", desc: "Compare two text blocks" },
  { title: "cURL Builder", path: "/curl-builder", icon: "terminal", desc: "Build HTTP requests visually" },
  { title: "JSON Formatter", path: "/json-formatter", icon: "data_object", desc: "Format, validate & minify JSON" },
  { title: "PageSpeed Analyzer", path: "/pagespeed-analyzer", icon: "speed", desc: "Core Web Vitals audit" },
  { title: "Meta Tag Generator", path: "/meta-tag-generator", icon: "code", desc: "Generate SEO meta tags" },
  { title: "Schema Generator", path: "/schema-generator", icon: "schema", desc: "JSON-LD structured data" },
  { title: "Sitemap Generator", path: "/sitemap-generator", icon: "account_tree", desc: "Build & validate sitemap.xml" },
  { title: "AI Alt Text", path: "/alt-text-generator", icon: "auto_awesome", desc: "AI image alt text generator" },
  { title: "Color Palette", path: "/color-palette", icon: "palette", desc: "Generate color palettes" },
  { title: "QR Code Generator", path: "/qr-code", icon: "qr_code_2", desc: "Generate QR codes from text/URL" },
  { title: "Image Resizer", path: "/image-resizer", icon: "aspect_ratio", desc: "Resize & crop images online" },
  { title: "CSS Minifier", path: "/css-minifier", icon: "css", desc: "Minify or beautify CSS code" },
  { title: "Base64 Tool", path: "/base64", icon: "password", desc: "Encode & decode Base64" },
  { title: "Gradient Generator", path: "/gradient-generator", icon: "gradient", desc: "Create CSS gradients visually" },
  { title: "Lorem Ipsum", path: "/lorem-ipsum", icon: "notes", desc: "Generate dummy placeholder text" },
  { title: "Robots.txt Generator", path: "/robots-generator", icon: "smart_toy", desc: "Build robots.txt files" },
  { title: "OG Preview", path: "/og-preview", icon: "preview", desc: "Preview Open Graph tags" },
  { title: "Placeholder Image", path: "/placeholder", icon: "image", desc: "Generate placeholder images" },
  { title: "HTML to Markdown", path: "/html-to-markdown", icon: "html", desc: "Convert HTML to Markdown" },
];

const RelatedToolsRandomized = (currentPath: string, max: number) => {
  const others = allTools.filter((t) => t.path !== currentPath);
  // Simple shuffle for variety
  for (let i = others.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [others[i], others[j]] = [others[j], others[i]];
  }
  return others.slice(0, max);
};

interface RelatedToolsProps {
  currentPath: string;
  maxTools?: number;
}

const RelatedTools = ({ currentPath, maxTools = 4 }: RelatedToolsProps) => {
  const related = allTools.filter((t) => t.path !== currentPath).slice(0, maxTools);

  return (
    <section className="mt-24 pt-16 border-t border-outline-variant/10">
      <h2 className="text-2xl md:text-3xl font-headline font-bold mb-8">Related Tools</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {related.map((tool) => (
          <Link
            key={tool.path}
            to={tool.path}
            className="bg-surface-container rounded-xl p-6 hover:bg-surface-container-highest transition-all duration-300 group border border-transparent hover:border-primary/10"
          >
            <div className="w-10 h-10 bg-secondary-container rounded-lg flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-secondary text-xl">{tool.icon}</span>
            </div>
            <h3 className="font-headline font-bold mb-2 group-hover:text-primary transition-colors">{tool.title}</h3>
            <p className="text-on-surface-variant text-sm">{tool.desc}</p>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default RelatedTools;
