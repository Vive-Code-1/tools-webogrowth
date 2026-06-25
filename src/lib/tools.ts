// Single source of truth for the tool catalog.
// Add/remove tools here and the count (TOTAL_TOOLS) updates everywhere automatically.
import { type IconSvgElement } from "@hugeicons/react";
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

export type ToolItem = {
  label: string;
  path: string;
  desc: string;
  icon: IconSvgElement;
  accent: string;
};

export const toolCategories: { label: string; tools: ToolItem[] }[] = [
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

/** Total number of tools across all categories. Updates automatically when tools are added/removed. */
export const TOTAL_TOOLS = toolCategories.reduce((sum, c) => sum + c.tools.length, 0);

/** Display label like "31+" — used in marketing copy across the site. */
export const TOTAL_TOOLS_LABEL = `${TOTAL_TOOLS}+`;
