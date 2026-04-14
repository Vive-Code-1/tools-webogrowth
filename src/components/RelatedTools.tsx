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
  { title: "SVG Optimizer", path: "/svg-optimizer", icon: "slide_library", desc: "Minify and clean SVG files" },
  { title: "Favicon Generator", path: "/favicon", icon: "branding_watermark", desc: "Generate favicons for all platforms" },
  { title: "JSON Formatter", path: "/json-formatter", icon: "data_object", desc: "Format, validate & minify JSON" },
  { title: "Meta Tag Generator", path: "/meta-tag-generator", icon: "code", desc: "Generate SEO meta tags" },
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
