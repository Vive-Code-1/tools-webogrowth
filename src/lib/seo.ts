// Central SEO registry — one source of truth for titles, descriptions,
// keywords, FAQ + HowTo content, and JSON-LD generation for every page.

export const SITE = {
  url: "https://tools.webogrowth.com",
  brand: "WeboGrowth Tools",
  parent: "https://webogrowth.com",
  parentBrand: "WeboGrowth",
  logo: "https://tools.webogrowth.com/og-image.jpg",
};

export type ToolCategory = "Image" | "Developer" | "SEO" | "Design" | "Content" | "Site";

export interface ToolSeo {
  path: string;
  title: string;          // ≤60 chars
  description: string;    // ≤160 chars
  keywords: string;
  category: ToolCategory;
  h1: string;
  intro: string;          // 1-2 sentence visible intro for the SEO content block
  features: string[];
  faqs: { q: string; a: string }[];
  steps: { name: string; text: string }[];
  benefits: string[];
  rating?: { value: number; count: number };
}

const defaultRating = { value: 4.9, count: 1280 };

const f = (path: string, data: Omit<ToolSeo, "path" | "rating"> & { rating?: ToolSeo["rating"] }): ToolSeo => ({
  path,
  rating: defaultRating,
  ...data,
});

export const TOOL_SEO: Record<string, ToolSeo> = {
  "/": f("/", {
    title: "WeboGrowth Tools — 17+ Free Online Web Tools",
    description:
      "Free online tools for developers and designers. Compress images, format JSON, generate QR codes, build meta tags and more — fast, private, browser-based.",
    keywords:
      "free online tools, web developer tools, image compressor online, json formatter, qr code generator, meta tag generator, css minifier, color palette generator",
    category: "Site",
    h1: "Optimize Your Web Assets",
    intro:
      "WeboGrowth Tools is a free, privacy-first toolkit of 17+ utilities for image optimization, code formatting, SEO and design.",
    features: [
      "Image Compressor", "Format Converter", "SVG Optimizer", "Favicon Generator",
      "Image Resizer", "JSON Formatter", "Meta Tag Generator", "Color Palette",
      "QR Code Generator", "CSS Minifier", "Base64 Tool", "Gradient Generator",
      "Lorem Ipsum", "Robots.txt Generator", "OG Preview", "Placeholder Image",
      "HTML to Markdown",
    ],
    faqs: [
      { q: "Are WeboGrowth Tools really free?", a: "Yes. All 17+ tools are 100% free with no signup, no watermarks, and no usage limits." },
      { q: "Is my data safe?", a: "All processing happens in your browser. Files are not uploaded to a server unless explicitly required, ensuring full privacy." },
      { q: "Do I need to install anything?", a: "No installation required. Every tool runs directly in modern browsers like Chrome, Firefox, Safari and Edge." },
      { q: "Can I use these tools commercially?", a: "Yes. Output from every tool is free to use in personal and commercial projects." },
    ],
    steps: [
      { name: "Pick a tool", text: "Browse the categorized list and open the tool you need." },
      { name: "Drop your file or paste your data", text: "Use drag-and-drop or paste directly into the tool." },
      { name: "Download the optimized result", text: "Copy or download the processed output instantly." },
    ],
    benefits: [
      "Zero signup, zero ads, zero limits",
      "All processing in-browser for full privacy",
      "Built and maintained by WeboGrowth",
    ],
  }),

  "/compressor": f("/compressor", {
    title: "WebP Compressor — Compress PNG, JPEG & WebP Online Free",
    description:
      "Free WebP compressor — compress PNG, JPEG and WebP images online up to 90% smaller with no visible quality loss. Browser-based and private.",
    keywords:
      "webp compressor, compress png, compress jpeg, compress webp, image compressor online, reduce png size, compress image online free, optimize images for web",
    category: "Image",
    h1: "Image Compressor",
    intro:
      "Shrink JPEG, PNG and WebP files without visible quality loss. Adjust the precision slider to balance size and fidelity for blogs, eCommerce and email.",
    features: [
      "Lossy and near-lossless compression",
      "Supports JPEG, PNG and WebP output",
      "Quality precision slider (lesser → ultra)",
      "Live before/after size comparison",
      "100% in-browser — files never uploaded",
    ],
    faqs: [
      { q: "How much can I compress an image?", a: "Most JPEGs and PNGs shrink 60–90% when re-encoded as WebP at 80% quality with no visible difference." },
      { q: "Will compression hurt image quality?", a: "At 80–90% quality the difference is invisible. Lower the slider for smaller files when fidelity matters less." },
      { q: "Is there a file size limit?", a: "No hard limit — processing speed depends on your device. Most photos under 25 MB compress in under a second." },
      { q: "Are my images uploaded to a server?", a: "No. Compression runs locally in your browser; your files never leave your device." },
    ],
    steps: [
      { name: "Drop or pick an image", text: "Upload a JPG, PNG or WebP file via drag-and-drop." },
      { name: "Choose output format and quality", text: "Pick WebP for best compression, JPEG for compatibility, or PNG for lossless." },
      { name: "Download the compressed image", text: "Click compress and download the optimized file." },
    ],
    benefits: [
      "Faster page loads and better Core Web Vitals",
      "Lower bandwidth and CDN bills",
      "Higher SEO scores from optimized images",
    ],
  }),

  "/converter": f("/converter", {
    title: "PNG to WebP & AVIF Converter — Image Format Converter Free",
    description:
      "Convert PNG to WebP, PNG to AVIF, JPG to WebP and back online for free. Batch image format converter — fast, private, browser-based.",
    keywords:
      "png to webp, png to avif, jpg to webp, convert to webp, image format converter, webp converter online, avif converter, image converter free",
    category: "Image",
    h1: "Image Format Converter",
    intro:
      "Switch images between modern (WebP, AVIF) and classic (JPG, PNG) formats instantly. Perfect for migrating sites to next-gen formats.",
    features: [
      "JPG, PNG, WebP and AVIF support",
      "One-click format switching",
      "Quality slider for lossy outputs",
      "Preserves transparency where supported",
      "In-browser — your files stay private",
    ],
    faqs: [
      { q: "Which format is smallest?", a: "AVIF is typically smallest, followed by WebP. Both are widely supported in modern browsers." },
      { q: "Does PNG to WebP keep transparency?", a: "Yes. WebP supports alpha transparency, so PNG-to-WebP conversion preserves the alpha channel." },
      { q: "Can I batch convert?", a: "Yes — drop multiple files and convert them with the same settings." },
      { q: "Is conversion lossy?", a: "JPEG/WebP/AVIF outputs use a quality slider. PNG output is lossless." },
    ],
    steps: [
      { name: "Upload your image", text: "Drag a file into the drop zone." },
      { name: "Pick a target format", text: "Choose WebP, AVIF, JPG or PNG." },
      { name: "Download the converted file", text: "Save the new file to your device." },
    ],
    benefits: [
      "Modern formats for faster page loads",
      "Compatibility fallbacks for older browsers",
      "No upload — full privacy",
    ],
  }),

  "/image-to-svg": f("/image-to-svg", {
    title: "Image to SVG Icon Converter — PNG/JPG to SVG Free",
    description:
      "Convert PNG, JPG and WebP images to scalable SVG icons online. Bulk upload, color or B&W tracing, standard icon sizes 16–256px. Free & private.",
    keywords:
      "image to svg, png to svg, jpg to svg converter, raster to vector online, image vectorizer, svg icon generator, bulk image to svg, free svg converter",
    category: "Image",
    h1: "Image to SVG Icon Converter",
    intro:
      "Vectorize raster images into clean SVG icons at standard sizes. Color, grayscale or black-and-white tracing with bulk processing.",
    features: [
      "Standard icon sizes: 16, 24, 32, 48, 64, 128, 256 px",
      "Color, grayscale and B&W tracing modes",
      "Icon / Detailed / Logo quality presets",
      "Live preview with zoom (50–400%)",
      "Bulk upload with ZIP download",
      "Copy SVG code to clipboard",
    ],
    faqs: [
      { q: "Can I convert any image to SVG?", a: "Yes — PNG, JPG, WebP, GIF and BMP. Best results come from clean, high-contrast images with limited colors." },
      { q: "Will the SVG look exactly like the original?", a: "Tracing is approximate. Use the Icon preset and B&W mode for crisp icon-like output; use Detailed for closer fidelity." },
      { q: "How many images can I upload at once?", a: "Bulk upload is supported. Files are processed two at a time to keep your browser responsive." },
      { q: "Are my files uploaded to a server?", a: "Tracing runs fully in your browser. Only the final ZIP is uploaded for the 5-minute download window, then auto-deleted." },
    ],
    steps: [
      { name: "Drop your images", text: "Upload PNG, JPG or WebP files." },
      { name: "Choose icon size and color mode", text: "Pick a standard size and trace style." },
      { name: "Vectorize and download", text: "Download individual SVGs or a ZIP." },
    ],
    benefits: [
      "Scalable, resolution-independent icons",
      "Tiny file sizes for web use",
      "Quick conversion of logo & icon assets",
    ],
  }),

  "/svg-optimizer": f("/svg-optimizer", {
    title: "SVGO Online — Minify & Optimize SVG Files Free",
    description:
      "SVGO online — minify SVG, clean Figma/Illustrator exports and shrink SVG files up to 80%. Free SVG optimizer with no upload.",
    keywords:
      "svgo online, minify svg, svg optimizer, svg optimizer online, clean svg file, optimize svg from figma, reduce svg size, svg cleaner",
    category: "Image",
    h1: "SVG Optimizer",
    intro:
      "Strip editor metadata, collapse paths and shrink SVGs from Figma, Illustrator or Sketch with no quality loss.",
    features: ["Removes editor metadata", "Minifies paths and attributes", "Preserves visual fidelity", "Instant size comparison"],
    faqs: [
      { q: "How much smaller will my SVG get?", a: "Editor exports often shrink 40–80% after metadata removal and path minification." },
      { q: "Will optimization break my SVG?", a: "No — only safe transformations are applied. The visual output is identical." },
      { q: "Can I optimize animated SVGs?", a: "Yes, but verify after optimization since some editors include non-standard animation hints." },
    ],
    steps: [
      { name: "Paste or upload SVG", text: "Drop an SVG file or paste markup directly." },
      { name: "Optimize", text: "Click optimize to minify and clean the SVG." },
      { name: "Copy or download", text: "Grab the optimized SVG for your project." },
    ],
    benefits: ["Smaller bundles and faster renders", "Cleaner inline SVG markup", "Free, private, browser-based"],
  }),

  "/favicon": f("/favicon", {
    title: "Apple Touch Icon & Favicon Generator — All Sizes Free",
    description:
      "Apple Touch Icon generator and favicon maker — create ICO, PNG, Android & Apple Touch Icons plus manifest from one image. Free download.",
    keywords:
      "apple touch icon generator, favicon generator, favicon maker, android favicon, ico generator online, png to favicon, favicon package, web manifest generator",
    category: "Image",
    h1: "Favicon Generator",
    intro:
      "Upload one image and get the full favicon package — ICO, PNGs, Apple Touch Icon and a web manifest — ready to drop into any site.",
    features: ["Generates ICO, PNG and Apple Touch Icon", "Web app manifest included", "Multiple sizes from a single source", "Instant ZIP download"],
    faqs: [
      { q: "What size source image should I upload?", a: "A square PNG of at least 512×512 px gives the cleanest results across every platform." },
      { q: "Do I need an ICO file in 2026?", a: "Yes — older browsers and Windows shortcuts still expect favicon.ico, which is included in the package." },
      { q: "Where do I install the files?", a: "Drop them in your site root and add the included <link> tags to your HTML <head>." },
    ],
    steps: [
      { name: "Upload your logo", text: "Drag in a square PNG, JPG or SVG." },
      { name: "Generate favicons", text: "Click generate to produce every size." },
      { name: "Download the package", text: "Save the ZIP and add the snippet to your <head>." },
    ],
    benefits: ["Pixel-perfect on every platform", "Saves hours of manual export work", "Includes copy-paste install snippet"],
  }),

  "/image-resizer": f("/image-resizer", {
    title: "Image Resizer Online — Resize JPG, PNG & WebP Free",
    description:
      "Resize image online free — change JPG, PNG and WebP dimensions in pixels or percent with aspect-ratio lock. No upload, full privacy.",
    keywords:
      "image resizer online, resize image online, resize image, resize jpg online, png resizer, resize image without losing quality, change image dimensions, free image resizer",
    category: "Image",
    h1: "Image Resizer",
    intro:
      "Resize and crop images to exact pixel dimensions. Lock aspect ratio or use percentage scaling for batch consistency.",
    features: ["Pixel and percentage modes", "Aspect-ratio lock", "Supports JPG, PNG and WebP", "High-quality bicubic scaling"],
    faqs: [
      { q: "Will resizing reduce image quality?", a: "Downscaling preserves quality. Upscaling may soften details — use moderate scale factors." },
      { q: "Does it keep the aspect ratio?", a: "Yes, by default. Toggle the lock to allow free width/height entry." },
      { q: "What output format do I get?", a: "Same format as the input, unless you change it in the export settings." },
    ],
    steps: [
      { name: "Upload an image", text: "Drag a file into the resizer." },
      { name: "Set new dimensions", text: "Type width/height or use a percentage." },
      { name: "Download the resized image", text: "Save the result to your device." },
    ],
    benefits: ["Consistent thumbnails for blogs and shops", "Fast in-browser scaling", "Privacy — files stay local"],
  }),

  "/placeholder": f("/placeholder", {
    title: "Placeholder Image Generator — Dummy Image Maker Online",
    description:
      "Generate dummy images and custom placeholder images online — set exact size, background color and label text for mockups and wireframes.",
    keywords:
      "placeholder image generator, dummy image, dummy image generator, custom placeholder, mockup image, placeholder.com alternative, wireframe images, fake image",
    category: "Image",
    h1: "Placeholder Image Generator",
    intro:
      "Generate sized placeholder images on demand for design mockups, Storybook stories and wireframes.",
    features: ["Exact pixel dimensions", "Custom colors and text", "PNG/JPG download", "Use directly in HTML or design files"],
    faqs: [
      { q: "What sizes can I create?", a: "Any width/height up to 4000×4000 pixels." },
      { q: "Can I customize the label?", a: "Yes — set any text, color and background." },
      { q: "Is the output free to use?", a: "Yes, in personal and commercial projects." },
    ],
    steps: [
      { name: "Set dimensions", text: "Enter width and height in pixels." },
      { name: "Pick colors and text", text: "Choose background, foreground and label." },
      { name: "Download", text: "Save the placeholder PNG to your device." },
    ],
    benefits: ["Speeds up wireframing", "Consistent mockup imagery", "No external dependency"],
  }),

  "/json-formatter": f("/json-formatter", {
    title: "JSON Formatter, Validator, Beautifier & Minifier Online",
    description:
      "Free JSON formatter, validator, beautifier and minifier online. Pretty print, validate and compress JSON instantly with syntax error detection.",
    keywords:
      "json formatter, json validator, json beautifier, json minifier, json formatter online, format json free, pretty print json, json viewer",
    category: "Developer",
    h1: "JSON Formatter & Validator",
    intro:
      "Paste JSON to pretty-print, minify or validate it instantly. Errors are pinpointed with line numbers so you can fix malformed JSON fast.",
    features: ["Beautify with 2-space indentation", "Minify to single line", "Real-time syntax validation", "Copy to clipboard"],
    faqs: [
      { q: "What JSON spec is supported?", a: "Standard RFC 8259 JSON. Comments and trailing commas are flagged as errors." },
      { q: "Can I format very large JSON?", a: "Yes — tested with 10+ MB payloads. Speed depends on your device." },
      { q: "Is my data sent anywhere?", a: "No. Parsing happens entirely in your browser." },
    ],
    steps: [
      { name: "Paste JSON", text: "Drop your JSON into the input panel." },
      { name: "Format or minify", text: "Click beautify or minify." },
      { name: "Copy result", text: "Use the copy button to grab the output." },
    ],
    benefits: ["Catch JSON bugs before deploy", "Cleaner diffs in PRs", "Fast minify for production payloads"],
  }),

  "/css-minifier": f("/css-minifier", {
    title: "CSS Minifier & Beautifier — Minify CSS Online Free",
    description:
      "Free CSS minifier and beautifier — minify CSS to shrink file size 15–35% or beautify minified stylesheets back to readable code instantly.",
    keywords:
      "css minifier, minify css, css minifier online, css beautifier, format css, compress css online, css optimizer, css formatter",
    category: "Developer",
    h1: "CSS Minifier",
    intro:
      "Strip whitespace, comments and redundancies from CSS — or beautify minified stylesheets back to readable code.",
    features: ["Lossless minification", "One-click beautify", "Size savings displayed", "Works on full stylesheets"],
    faqs: [
      { q: "How much can CSS be minified?", a: "Typical savings are 15–35% depending on comments and formatting." },
      { q: "Will minification break my CSS?", a: "No — only whitespace and comments are removed; selectors and rules are preserved." },
      { q: "Is the tool free?", a: "Yes, completely free with no usage limits." },
    ],
    steps: [
      { name: "Paste CSS", text: "Drop your stylesheet into the input." },
      { name: "Click minify or beautify", text: "Run the chosen transform." },
      { name: "Copy the result", text: "Use the output in production or development." },
    ],
    benefits: ["Smaller CSS bundles", "Faster First Contentful Paint", "Easier debugging via beautify"],
  }),

  "/base64": f("/base64", {
    title: "Base64 Encoder & Decoder Online — Text, File & Image",
    description:
      "Base64 encoder and decoder online — encode text, files or images to Base64 and decode Base64 strings back to text or downloadable files free.",
    keywords:
      "base64 encoder, base64 decoder, base64 to text, encode file to base64, decode base64 online, base64 image converter, base64 online",
    category: "Developer",
    h1: "Base64 Encoder / Decoder",
    intro:
      "Convert text and files to and from Base64 for data URIs, JWT inspection, email attachments and inline images.",
    features: ["Text and file modes", "Encode and decode", "Data URI output", "All processing in-browser"],
    faqs: [
      { q: "What is Base64 used for?", a: "Embedding binary data in text formats — data URIs, email attachments, JWT payloads and more." },
      { q: "Is Base64 encryption?", a: "No. Base64 is encoding, not encryption. Anyone can decode it." },
      { q: "Can I encode files?", a: "Yes — upload any file and get its Base64 string or data URI." },
    ],
    steps: [
      { name: "Pick mode", text: "Choose encode or decode, text or file." },
      { name: "Provide input", text: "Type, paste or upload your content." },
      { name: "Copy or download output", text: "Use the encoded/decoded result." },
    ],
    benefits: ["No upload — files stay private", "Inline asset embedding", "Quick JWT inspection"],
  }),

  "/html-to-markdown": f("/html-to-markdown", {
    title: "HTML to Markdown Converter Online — Free HTML to MD",
    description:
      "Convert HTML to Markdown online free — paste HTML and get clean GitHub-flavored Markdown for READMEs, blog migrations and documentation.",
    keywords:
      "html to markdown, html to markdown converter, html to md online, convert html to markdown free, blog to markdown, readme generator, html2md",
    category: "Developer",
    h1: "HTML to Markdown Converter",
    intro:
      "Paste HTML and get clean GitHub-flavored Markdown — ideal for migrating blog posts, generating READMEs or cleaning rich text editor output.",
    features: ["GitHub-flavored Markdown", "Tables, lists and code blocks", "Strips inline styles", "Copy or download .md"],
    faqs: [
      { q: "Does it support tables?", a: "Yes — HTML tables convert to GFM table syntax." },
      { q: "What about images and links?", a: "Both convert with their src/href attributes preserved." },
      { q: "Will inline styles be kept?", a: "No — Markdown is semantic, so inline styles are stripped intentionally." },
    ],
    steps: [
      { name: "Paste HTML", text: "Drop your HTML markup into the input." },
      { name: "Convert", text: "Click convert to generate Markdown." },
      { name: "Copy or download", text: "Use the .md output anywhere." },
    ],
    benefits: ["Faster content migration", "Clean docs for GitHub and Notion", "No data sent to a server"],
  }),

  "/meta-tag-generator": f("/meta-tag-generator", {
    title: "Meta Tag Generator — SEO, Open Graph & Twitter Card Tags",
    description:
      "Free meta tag generator for SEO, Open Graph and Twitter Cards. Build perfect <head> meta tags with live Google, Facebook and Twitter previews.",
    keywords:
      "meta tag generator, seo meta tags, open graph generator, twitter card generator, html meta tags, og tag generator, meta description generator",
    category: "SEO",
    h1: "Meta Tag Generator",
    intro:
      "Build complete <head> meta tags for SEO, Open Graph and Twitter Cards with live previews of search and social snippets.",
    features: ["SEO title, description, canonical", "Open Graph tags", "Twitter Card tags", "Live SERP and social previews"],
    faqs: [
      { q: "What length should my title and description be?", a: "Title under 60 characters, description under 160 characters for full visibility in Google." },
      { q: "Are Open Graph tags required?", a: "Yes if you want rich previews on Facebook, LinkedIn, Slack and other OG-aware platforms." },
      { q: "Where do I install the tags?", a: "Paste them inside the <head> tag of your HTML page." },
    ],
    steps: [
      { name: "Fill in page details", text: "Enter title, description, image and URL." },
      { name: "Preview", text: "Check Google and social previews live." },
      { name: "Copy the snippet", text: "Paste the generated tags into your <head>." },
    ],
    benefits: ["Better SERP click-through", "Rich social shares", "Avoid common SEO mistakes"],
  }),

  "/og-preview": f("/og-preview", {
    title: "Open Graph Preview — OG Image Preview & Social Card Tester",
    description:
      "Open Graph preview tool — test OG image, Twitter Card and LinkedIn previews before publishing. Free social media meta tag debugger.",
    keywords:
      "open graph preview, og preview, og image preview, og tag tester, facebook share preview, twitter card preview, linkedin preview, social media debugger",
    category: "SEO",
    h1: "Open Graph Preview",
    intro:
      "Test Open Graph and Twitter Card markup before publishing. Side-by-side previews for Facebook, Twitter and LinkedIn.",
    features: ["Facebook, Twitter and LinkedIn previews", "Custom OG inputs", "Catches missing fields", "No login required"],
    faqs: [
      { q: "Why does my preview look broken?", a: "Most issues are missing og:image, wrong dimensions, or non-public URLs. The tool flags missing fields." },
      { q: "What size should my OG image be?", a: "1200×630 px is the safe default across Facebook, LinkedIn and Twitter summary_large_image." },
      { q: "Does Facebook cache previews?", a: "Yes. After updating tags, refresh the cache via Facebook's Sharing Debugger." },
    ],
    steps: [
      { name: "Paste a URL or fields", text: "Enter a URL to fetch tags or fill them manually." },
      { name: "Inspect previews", text: "Compare how each platform renders the share." },
      { name: "Fix and republish", text: "Update your meta tags and re-test." },
    ],
    benefits: ["Higher social CTR", "Catches mistakes before publishing", "Free and instant"],
  }),

  "/robots-generator": f("/robots-generator", {
    title: "Robots.txt Generator — Create Robots.txt Online Free",
    description:
      "Free robots.txt generator — create robots.txt online with Googlebot/Bingbot rules, allow/disallow paths and sitemap URL. Download instantly.",
    keywords:
      "robots txt generator, robots.txt generator, create robots.txt, robots txt online, googlebot rules, sitemap robots.txt, seo crawler control, robots.txt maker",
    category: "SEO",
    h1: "Robots.txt Generator",
    intro:
      "Generate a clean robots.txt with crawl rules for major bots, disallow paths and sitemap declarations.",
    features: ["Per-bot rules", "Allow / disallow paths", "Sitemap declaration", "Download or copy output"],
    faqs: [
      { q: "Where do I put robots.txt?", a: "In the root of your domain — e.g. https://example.com/robots.txt." },
      { q: "Does Disallow guarantee privacy?", a: "No. It blocks crawling but the URL can still be indexed if linked elsewhere. Use noindex or auth for privacy." },
      { q: "Should I link my sitemap?", a: "Yes — add a Sitemap: line so crawlers can discover your URLs faster." },
    ],
    steps: [
      { name: "Pick user-agents", text: "Select bots you want to target." },
      { name: "Set allow/disallow paths", text: "List rules per agent." },
      { name: "Download robots.txt", text: "Save the file to your site root." },
    ],
    benefits: ["Better crawl budget", "Block sensitive paths", "Helps search engines find your sitemap"],
  }),

  "/color-palette": f("/color-palette", {
    title: "Color Palette Generator — From Image, Complementary, Triadic",
    description:
      "Color palette generator — extract palettes from image or build complementary, analogous and triadic schemes. Copy HEX, RGB, HSL instantly.",
    keywords:
      "color palette generator, color palette from image, complementary colors, analogous palette, triadic colors, hex color picker, design color scheme, color scheme generator",
    category: "Design",
    h1: "Color Palette Generator",
    intro:
      "Build harmonious color schemes from a base color. Get complementary, analogous, triadic and tetradic palettes with HEX, RGB and HSL values.",
    features: ["Multiple harmony modes", "HEX, RGB and HSL outputs", "Click-to-copy swatches", "Live preview"],
    faqs: [
      { q: "Which palette type should I use?", a: "Analogous for calm UI, complementary for high contrast, triadic for balanced vibrancy." },
      { q: "Can I export the palette?", a: "Yes — copy individual colors or the entire palette as CSS variables." },
      { q: "Is it free for commercial use?", a: "Yes — palettes are free to use in any project." },
    ],
    steps: [
      { name: "Pick a base color", text: "Use the picker or enter a HEX value." },
      { name: "Choose a harmony mode", text: "Try complementary, analogous, triadic or tetradic." },
      { name: "Copy palette", text: "Grab HEX/RGB/HSL for your design." },
    ],
    benefits: ["Faster brand color exploration", "Accessibility-aware contrast", "No signup or download"],
  }),

  "/gradient-generator": f("/gradient-generator", {
    title: "CSS Gradient Generator — Linear & Radial Gradient Maker",
    description:
      "Free CSS gradient generator — design linear, radial and AI gradients with copyable CSS code and PNG export. Live multi-stop editor.",
    keywords:
      "css gradient generator, gradient generator, linear gradient, radial gradient, css gradient online, ai gradient background, web background generator, gradient maker",
    category: "Design",
    h1: "CSS Gradient Generator",
    intro:
      "Design beautiful linear and radial CSS gradients visually. Copy production-ready CSS or export the gradient as a PNG.",
    features: ["Linear and radial gradients", "Multi-stop color control", "Live CSS code", "PNG export", "AI gradient mode"],
    faqs: [
      { q: "Can I use gradients as backgrounds?", a: "Yes — paste the generated CSS into background or background-image properties." },
      { q: "How do I add more color stops?", a: "Click the gradient bar to add a stop, then drag to position it." },
      { q: "Does the AI mode require an API key?", a: "No — it uses our hosted AI gateway and works in your browser." },
    ],
    steps: [
      { name: "Pick gradient type", text: "Linear, radial or AI mode." },
      { name: "Set colors and angle", text: "Adjust stops, angle and shape." },
      { name: "Copy CSS or download PNG", text: "Use the gradient anywhere." },
    ],
    benefits: ["Pixel-perfect CSS gradients", "Faster than hand-coding", "Export-ready assets"],
  }),

  "/qr-code": f("/qr-code", {
    title: "QR Code Generator with Logo — WiFi, vCard & URL QR Codes",
    description:
      "Free QR code generator with logo — create WiFi QR codes, vCard QR codes, URL, email and SMS QR codes with custom colors. PNG & SVG export.",
    keywords:
      "qr code generator, qr code with logo, wifi qr code, vcard qr code, custom qr code free, qr code maker online, url qr code, qr generator with logo",
    category: "Design",
    h1: "QR Code Generator",
    intro:
      "Create custom QR codes for URLs, WiFi networks, vCards, email and SMS. Add a logo, change colors and download as PNG or SVG.",
    features: ["URL, WiFi, vCard, email, SMS", "Logo overlay", "Color customization", "PNG and SVG export", "High error-correction"],
    faqs: [
      { q: "Will QR codes with a logo still scan?", a: "Yes — the tool uses high error-correction so logos up to 25% of the area still scan reliably." },
      { q: "Can I generate WiFi QR codes?", a: "Yes — enter SSID, password and encryption to create a one-tap WiFi join code." },
      { q: "Is there a usage limit?", a: "No. Generate unlimited QR codes for free." },
    ],
    steps: [
      { name: "Pick QR type", text: "URL, WiFi, vCard, email or SMS." },
      { name: "Customize", text: "Set colors and add a logo." },
      { name: "Download", text: "Export as PNG or SVG." },
    ],
    benefits: ["Branded QR codes for marketing", "Free vCard and WiFi codes", "High-resolution SVG export"],
  }),

  "/lorem-ipsum": f("/lorem-ipsum", {
    title: "Lorem Ipsum Generator — Dummy Text Generator Free",
    description:
      "Free Lorem Ipsum generator and dummy text generator — pick paragraphs, sentences or words of placeholder text and copy with one click.",
    keywords:
      "lorem ipsum generator, lorem ipsum, dummy text generator, placeholder text, lorem ipsum copy, design filler text, dummy text, lipsum",
    category: "Content",
    h1: "Lorem Ipsum Generator",
    intro:
      "Generate classic Lorem Ipsum filler text for mockups, wireframes and design prototypes. Pick the exact length you need.",
    features: ["Paragraphs, sentences or words", "Copy with one click", "Optional starting phrase", "Instant output"],
    faqs: [
      { q: "What is Lorem Ipsum?", a: "Industry-standard scrambled Latin used as visual filler text in design mockups." },
      { q: "Is the text random?", a: "It's pseudo-random based on a fixed Lorem Ipsum corpus, ensuring readable rhythm." },
      { q: "Can I use it commercially?", a: "Yes — Lorem Ipsum is in the public domain." },
    ],
    steps: [
      { name: "Pick unit and count", text: "Choose paragraphs, sentences or words." },
      { name: "Generate", text: "Click generate to produce the text." },
      { name: "Copy", text: "Paste into your design or document." },
    ],
    benefits: ["Realistic mockup typography", "Ad-free generator", "Instant copy"],
  }),

  // Static pages
  "/about-us": f("/about-us", {
    title: "About WeboGrowth Tools — Free Web Tools by WeboGrowth",
    description:
      "Learn about WeboGrowth Tools — a free, privacy-first toolkit of 17+ developer and designer utilities built by the WeboGrowth team.",
    keywords: "about webogrowth, free web tools, webogrowth team, online developer tools",
    category: "Site",
    h1: "About WeboGrowth Tools",
    intro: "WeboGrowth Tools is a free, privacy-first online toolkit maintained by the WeboGrowth team.",
    features: [], faqs: [], steps: [], benefits: [],
  }),
  "/contact-us": f("/contact-us", {
    title: "Contact WeboGrowth — Tool Feedback & Support",
    description: "Contact the WeboGrowth team with questions, tool requests or feedback. We reply within 1–2 business days.",
    keywords: "contact webogrowth, tool support, web tools feedback",
    category: "Site",
    h1: "Contact Us",
    intro: "Send us feedback, tool requests or partnership inquiries.",
    features: [], faqs: [], steps: [], benefits: [],
  }),
  "/privacy-policy": f("/privacy-policy", {
    title: "Privacy Policy — WeboGrowth Tools",
    description: "Privacy Policy for WeboGrowth Tools. Learn what data we collect, how we use it and your rights.",
    keywords: "privacy policy, webogrowth privacy, data protection",
    category: "Site",
    h1: "Privacy Policy",
    intro: "How WeboGrowth handles your data on tools.webogrowth.com.",
    features: [], faqs: [], steps: [], benefits: [],
  }),
  "/terms-of-service": f("/terms-of-service", {
    title: "Terms of Service — WeboGrowth Tools",
    description: "Terms of Service for WeboGrowth Tools. Read the rules for using our free online tools.",
    keywords: "terms of service, webogrowth terms, usage policy",
    category: "Site",
    h1: "Terms of Service",
    intro: "The terms governing use of WeboGrowth Tools.",
    features: [], faqs: [], steps: [], benefits: [],
  }),

  "/background-remover": f("/background-remover", {
    title: "AI Background Remover — Free Online, Bulk & Private",
    description:
      "Remove image background online free with on-device AI. Bulk processing, transparent PNG output, no signup. Your images never leave the browser.",
    keywords:
      "background remover, remove background online, ai background remover free, transparent png maker, remove bg, bulk background remover, remove white background",
    category: "Image",
    h1: "AI Background Remover",
    intro:
      "Strip backgrounds from photos and product images instantly. The AI model runs on-device, so images never upload to a server.",
    features: [
      "On-device AI (no upload required)",
      "Bulk processing up to 10 images",
      "Transparent PNG output",
      "ZIP download for batches",
      "Works on people, products, animals, logos",
    ],
    faqs: [
      { q: "Is the background remover really free?", a: "Yes — 100% free, no signup, no watermark. The AI model is downloaded once (~30MB) and cached for instant reuse." },
      { q: "Are my images uploaded?", a: "No. The neural network runs entirely in your browser using WebAssembly and WebGPU when available." },
      { q: "What image types work best?", a: "Photos with a clearly defined subject — people, products, animals — give the cleanest cutouts." },
      { q: "Is there a file or batch limit?", a: "Up to 10 images per batch, 15 MB each. Processing speed depends on your device." },
    ],
    steps: [
      { name: "Drop your images", text: "Upload up to 10 PNG, JPG or WebP files." },
      { name: "Click Remove Background", text: "The AI model processes each image one by one." },
      { name: "Download PNGs or ZIP", text: "Save individually or grab them all as a ZIP." },
    ],
    benefits: [
      "Free alternative to remove.bg with no quota",
      "Total privacy — no server upload",
      "Bulk processing for product photography",
    ],
  }),

  "/pdf-toolkit": f("/pdf-toolkit", {
    title: "PDF Toolkit — Merge, Split, Compress & Convert PDF Free",
    description:
      "Free PDF toolkit — merge PDFs, split pages, compress files and convert PDF to images online. No upload, no watermarks, fully browser-based.",
    keywords:
      "merge pdf online, split pdf, compress pdf, pdf to image, pdf to png, free pdf tools, pdf merger, pdf splitter, online pdf editor free",
    category: "Developer",
    h1: "PDF Toolkit",
    intro:
      "Merge multiple PDFs, split into single pages, compress for sharing, or export every page as PNG — all client-side for full privacy.",
    features: [
      "Merge unlimited PDFs into one",
      "Split a PDF into one file per page",
      "Lossless compression with object streams",
      "PDF to PNG export at 2x resolution",
      "ZIP bundle for batch outputs",
    ],
    faqs: [
      { q: "Is there a file size limit?", a: "Each PDF can be up to 50 MB. Larger files work but depend on your device's memory." },
      { q: "Does compression lose quality?", a: "No — this is lossless structural compression. For heavy compression of images inside PDFs, use Adobe Acrobat." },
      { q: "Are my PDFs uploaded?", a: "Processing happens locally in your browser. Only the final result is uploaded for the 5-minute download window, then auto-deleted." },
      { q: "Can I merge password-protected PDFs?", a: "Encrypted PDFs are loaded with ignoreEncryption; if the file requires a password to open, decrypt it first." },
    ],
    steps: [
      { name: "Pick an operation", text: "Choose Merge, Split, Compress or PDF→Images." },
      { name: "Upload your PDF(s)", text: "Drag and drop your files into the zone." },
      { name: "Download the result", text: "Save the output PDF or ZIP within 5 minutes." },
    ],
    benefits: [
      "All-in-one PDF utility, no ads",
      "Privacy-first browser processing",
      "Free alternative to iLovePDF and SmallPDF",
    ],
  }),

  "/jwt-decoder": f("/jwt-decoder", {
    title: "JWT Decoder & Verifier Online — Decode JSON Web Tokens Free",
    description:
      "Free JWT decoder online — decode header, payload and signature, inspect claims, check expiry and verify HMAC signatures locally in your browser.",
    keywords:
      "jwt decoder, jwt.io alternative, decode jwt online, jwt verifier, json web token decoder, jwt parser, hs256 verify, jwt debugger",
    category: "Developer",
    h1: "JWT Decoder & Verifier",
    intro:
      "Paste any JSON Web Token to inspect its header, payload and signature. Verify HMAC signatures without sending the token to a server.",
    features: [
      "Decode header, payload and signature",
      "Auto-detect expiry and issued-at",
      "Verify HS256, HS384 and HS512 signatures",
      "Copy claims as JSON",
      "100% client-side — tokens never leave the browser",
    ],
    faqs: [
      { q: "Is it safe to paste production tokens?", a: "Decoding happens entirely in your browser. Tokens are never sent to any server." },
      { q: "Which algorithms can be verified?", a: "HMAC algorithms (HS256/HS384/HS512). RS256 and ES256 require public-key verification and are decode-only here." },
      { q: "What's a JWT?", a: "A JSON Web Token is a compact, URL-safe token format used for stateless authentication, with three Base64url-encoded parts separated by dots." },
    ],
    steps: [
      { name: "Paste the JWT", text: "Drop your token into the input box." },
      { name: "Inspect claims", text: "Review decoded header and payload with expiry detection." },
      { name: "Verify signature", text: "Enter the HMAC secret and click Verify to confirm authenticity." },
    ],
    benefits: [
      "Faster than switching to jwt.io",
      "Tokens stay private — no server round-trip",
      "Built for daily auth debugging",
    ],
  }),

  "/pagespeed-analyzer": f("/pagespeed-analyzer", {
    title: "PageSpeed Analyzer — Free Core Web Vitals Audit Tool",
    description:
      "Free PageSpeed analyzer powered by Google Lighthouse. Audit Core Web Vitals (LCP, CLS, INP) for any URL with mobile and desktop scores.",
    keywords:
      "pagespeed analyzer, core web vitals checker, lighthouse audit online, website speed test, lcp checker, cls checker, page speed insights alternative",
    category: "SEO",
    h1: "PageSpeed Analyzer",
    intro:
      "Run a Google Lighthouse audit on any URL and get the same Core Web Vitals score Google uses for search rankings.",
    features: [
      "Powered by Google PageSpeed Insights API",
      "Mobile and desktop strategies",
      "LCP, CLS, INP, TBT, FCP, Speed Index",
      "Actionable optimization opportunities",
      "Real Lighthouse score — same as PSI",
    ],
    faqs: [
      { q: "Is this the same as Google PageSpeed Insights?", a: "Yes — it calls the official PSI API and returns the same Lighthouse score Google uses for indexing." },
      { q: "Why does the score change between runs?", a: "Lighthouse runs on a shared Google server. Network conditions cause variance — run 3 times and take the median." },
      { q: "Does it work on local URLs?", a: "No. The page must be publicly accessible for Google's crawler to reach it." },
      { q: "Is there a rate limit?", a: "Yes — Google's anonymous quota is limited. If you hit it, wait a minute and try again." },
    ],
    steps: [
      { name: "Enter a URL", text: "Type or paste the page you want to audit." },
      { name: "Pick mobile or desktop", text: "Mobile is what Google uses for ranking." },
      { name: "Review the report", text: "Check Core Web Vitals and follow the optimization tips." },
    ],
    benefits: [
      "Official Lighthouse score, no install",
      "Track Core Web Vitals for SEO",
      "Identify performance wins fast",
    ],
  }),

  "/regex-tester": f("/regex-tester", {
    title: "Regex Tester Online — Test JavaScript Regex Free",
    description:
      "Free regex tester with live match highlighting, capture groups, flags, replace preview and a cheat sheet. Test JavaScript regular expressions instantly.",
    keywords: "regex tester, regex101 alternative, javascript regex, regex builder online, regular expression tester, regex match highlighter",
    category: "Developer",
    h1: "Regex Tester & Builder",
    intro: "Test JavaScript regular expressions live with match highlighting, capture groups and replace preview — plus a built-in cheat sheet.",
    features: ["Live match highlighting", "All flags (g, i, m, s, u, y)", "Capture & named groups", "Replace preview with $ refs", "Built-in cheat sheet"],
    faqs: [
      { q: "Which regex engine does this use?", a: "Native JavaScript RegExp — the same engine Node.js and browsers use. Patterns work in your production code." },
      { q: "Does it support named groups?", a: "Yes — use (?<name>...) for named capture groups and $<name> in replacement strings." },
      { q: "Is my test text uploaded anywhere?", a: "No. All matching happens in your browser." },
    ],
    steps: [
      { name: "Enter a pattern", text: "Type your regex and toggle flags." },
      { name: "Paste test text", text: "Matches are highlighted instantly." },
      { name: "Copy or replace", text: "Copy the pattern or preview a replace operation." },
    ],
    benefits: ["No signup or limits", "Cheat sheet at your side", "Native JS engine — production-accurate"],
  }),

  "/schema-generator": f("/schema-generator", {
    title: "Schema Markup Generator — JSON-LD Builder Free",
    description:
      "Generate Google-ready JSON-LD schema markup for Article, Product, FAQ, LocalBusiness, Organization, Breadcrumb and Event — copy & paste into your site.",
    keywords: "schema markup generator, json-ld generator, structured data generator, faq schema, product schema, article schema, localbusiness schema",
    category: "SEO",
    h1: "Schema Markup Generator",
    intro: "Build JSON-LD structured data for seven popular schema.org types with a guided form. Output is ready for the Google Rich Results Test.",
    features: ["Article, Product, FAQ, LocalBusiness, Organization, Breadcrumb, Event", "Clean JSON-LD output", "Copy as <script> tag", "Direct link to Google validator"],
    faqs: [
      { q: "What is JSON-LD?", a: "JSON-LD is the Google-recommended format for structured data. It tells search engines what your page is about for rich snippets." },
      { q: "Does this validate against Google?", a: "Yes — output follows schema.org and the Google Rich Results spec. Use the validator link to confirm." },
      { q: "Where do I paste the output?", a: "Inside the <head> of your HTML. The tool wraps the JSON in a <script type=\"application/ld+json\"> tag." },
    ],
    steps: [
      { name: "Pick schema type", text: "Choose Article, Product, FAQ and more." },
      { name: "Fill the fields", text: "Only enter what you have — empty fields are omitted." },
      { name: "Copy the snippet", text: "Paste into your site <head>." },
    ],
    benefits: ["Rich results in Google", "Higher CTR from snippets", "Spec-compliant JSON-LD"],
  }),

  "/watermark": f("/watermark", {
    title: "Image Watermark Tool — Bulk Watermark Photos Free",
    description:
      "Add text or logo watermarks to bulk images. Position, opacity, tile pattern, custom font size & color. 100% browser-based & private.",
    keywords: "watermark image online, bulk watermark, add watermark to photos, logo watermark tool, photo watermark, free watermark maker",
    category: "Image",
    h1: "Image Watermark Tool",
    intro: "Protect photos and brand assets with text or logo watermarks. Bulk-process up to 20 images with live preview, positioning and tile pattern.",
    features: ["Text or logo watermarks", "5 positions + tile pattern", "Opacity, font size & color", "Bulk processing with ZIP export", "Live preview"],
    faqs: [
      { q: "What image formats are supported?", a: "JPG, PNG and WebP. Output is PNG to preserve quality and transparency." },
      { q: "Will it resize my images?", a: "No — watermarks are added at the original resolution." },
      { q: "Are my images uploaded?", a: "No. Watermarking runs fully in your browser." },
    ],
    steps: [
      { name: "Upload images", text: "Drop up to 20 photos." },
      { name: "Configure watermark", text: "Add text or upload a logo and pick a position." },
      { name: "Apply & download", text: "Download all watermarked images as a ZIP." },
    ],
    benefits: ["Protect against image theft", "Bulk brand-mark hundreds of photos", "Privacy — files never uploaded"],
  }),

  "/alt-text-generator": f("/alt-text-generator", {
    title: "AI Alt Text Generator — Bulk Image Alt Tags Free",
    description:
      "Generate SEO-friendly, accessibility-compliant alt text for images using AI vision. Bulk process up to 10 images per batch, export as CSV.",
    keywords: "ai alt text generator, image alt text, bulk alt text, accessibility alt tags, seo alt text, ai image description",
    category: "SEO",
    h1: "AI Alt Text Generator",
    intro: "Use AI vision to write concise, accessible, SEO-friendly alt text for any image. Add context, batch up to 10 images, copy as CSV.",
    features: ["Powered by Lovable AI vision", "Bulk processing (10/batch)", "Optional context + SEO mode", "Editable output", "CSV export"],
    faqs: [
      { q: "How accurate is the alt text?", a: "Very high for clear photos. Always review before publishing — alt text should match what users care about on the page." },
      { q: "Is there a limit?", a: "Lovable AI free tier covers most usage. Heavy bulk users may need to add credits to their workspace." },
      { q: "Are my images stored?", a: "No. Images are sent to the AI vision API and discarded after generation. We don't keep copies." },
    ],
    steps: [
      { name: "Upload images", text: "Drop up to 10 images per batch." },
      { name: "Add context (optional)", text: "Help the AI tailor descriptions." },
      { name: "Generate & export", text: "Copy each alt text or download CSV." },
    ],
    benefits: ["Massive accessibility win", "Better image SEO rankings", "Hours of writing saved"],
  }),

  "/video-to-gif": f("/video-to-gif", {
    title: "Video to GIF Converter — MP4 to GIF/WebM Online Free",
    description:
      "Convert MP4, MOV, WebM videos to optimized GIF, WebM or MP4 clips with trim, FPS and resolution control. Powered by FFmpeg in your browser.",
    keywords: "video to gif, mp4 to gif, convert video to gif, video trimmer online, webm converter, ffmpeg online, free gif maker",
    category: "Image",
    h1: "Video → GIF / WebM Converter",
    intro: "Trim a video clip, pick FPS and resolution, and convert to GIF, WebM or MP4 — all in your browser with FFmpeg.wasm.",
    features: ["GIF, WebM and MP4 outputs", "Trim start/end with sliders", "Custom FPS and width", "FFmpeg.wasm — no upload", "Conversion progress bar"],
    faqs: [
      { q: "Why does the first conversion take time?", a: "Your browser downloads the ~25MB FFmpeg core once, then caches it. Later conversions are fast." },
      { q: "What input formats work?", a: "MP4, MOV, WebM, MKV and most browser-playable formats. Max 100MB for smooth performance." },
      { q: "Is my video uploaded?", a: "No. Conversion happens fully on your device with FFmpeg.wasm." },
    ],
    steps: [
      { name: "Upload a video", text: "Drop MP4, MOV or WebM." },
      { name: "Trim & configure", text: "Set start/end, FPS and width." },
      { name: "Convert & download", text: "Download GIF, WebM or MP4." },
    ],
    benefits: ["No upload, full privacy", "Studio-grade FFmpeg in browser", "Optimized for social & blog use"],
  }),

  "/diff-checker": f("/diff-checker", {
    title: "Diff Checker Online — Compare Text Side by Side Free",
    description:
      "Compare two text blocks with line or word-level diff highlighting. Spot added, removed and changed content instantly. Free & private.",
    keywords: "diff checker, text compare, compare text online, diff tool, text difference checker, code diff",
    category: "Developer",
    h1: "Diff Checker",
    intro: "Compare any two text blocks — code, JSON, copy or configs — with line or word-level diff highlighting and add/remove counts.",
    features: ["Line and word diff modes", "Ignore-case toggle", "Add / remove counts", "Inline color-coded view", "100% in-browser"],
    faqs: [
      { q: "What's the difference between line and word diff?", a: "Line diff is best for code or paragraphs. Word diff shows changes inside a sentence — better for copywriting edits." },
      { q: "How large can the inputs be?", a: "Comfortably tens of thousands of lines, depending on your device." },
      { q: "Is my text uploaded?", a: "No. Diffing happens entirely in your browser." },
    ],
    steps: [
      { name: "Paste original text", text: "Drop the baseline content on the left." },
      { name: "Paste changed text", text: "Drop the new version on the right." },
      { name: "Review the diff", text: "Inline highlights show what changed." },
    ],
    benefits: ["Catch every change", "Cleaner code reviews", "No upload — private by default"],
  }),

  "/curl-builder": f("/curl-builder", {
    title: "cURL Builder & HTTP Tester — Generate cURL Online Free",
    description:
      "Build HTTP requests visually with method, headers, body, auth — copy as cURL or fetch() and test from the browser. Free Postman alternative.",
    keywords: "curl builder, curl generator, http request builder, postman alternative, fetch generator, online curl tester, api request tool",
    category: "Developer",
    h1: "cURL & HTTP Request Builder",
    intro: "Visually construct any HTTP request — method, headers, auth, body — and export as cURL or fetch(). Send the request directly to test responses.",
    features: ["All HTTP methods", "Custom headers + auth (Bearer, Basic)", "Request body", "Live cURL & fetch() output", "Send request from browser"],
    faqs: [
      { q: "Can I send requests to any URL?", a: "Yes, but the target server must allow CORS for browser-side calls. cURL output works everywhere." },
      { q: "Are credentials stored?", a: "No. Headers and tokens stay in your session — nothing is saved or sent to our servers." },
      { q: "Does it support GraphQL?", a: "Yes — send a POST request to your GraphQL endpoint with the query in the body." },
    ],
    steps: [
      { name: "Choose method and URL", text: "Pick GET, POST, PUT, etc." },
      { name: "Add headers, auth and body", text: "Configure exactly the request you need." },
      { name: "Copy cURL or send", text: "Use the command in your terminal or send it from the browser." },
    ],
    benefits: ["Skip Postman for quick tests", "Share cURL with teammates", "Generate fetch() code instantly"],
  }),

  "/sitemap-generator": f("/sitemap-generator", {
    title: "XML Sitemap Generator & Validator — Free SEO Tool",
    description:
      "Build a Google-ready XML sitemap from a URL list with per-page priority, changefreq, lastmod — and validate it against the sitemap.org spec.",
    keywords: "sitemap generator, xml sitemap, sitemap validator, sitemap.xml generator, google sitemap, free sitemap maker",
    category: "SEO",
    h1: "XML Sitemap Generator & Validator",
    intro: "Bulk-import URLs to generate a clean sitemap.xml with priority, changefreq and lastmod. Validate against the sitemap.org spec and download.",
    features: ["Bulk URL import", "Per-row priority & changefreq", "Validates 50k-URL limit", "Suggested robots.txt", "Downloadable XML"],
    faqs: [
      { q: "What's the max sitemap size?", a: "The sitemap.org spec allows up to 50,000 URLs and 50MB per file. The validator warns you if you exceed that." },
      { q: "Where do I put sitemap.xml?", a: "At your site root, e.g. https://example.com/sitemap.xml. Submit it in Google Search Console." },
      { q: "Do I need lastmod?", a: "It's optional but helps search engines re-crawl updated pages faster." },
    ],
    steps: [
      { name: "Paste your URL list", text: "Bulk import URLs or add them one by one." },
      { name: "Adjust priority & frequency", text: "Tune per-page metadata for SEO." },
      { name: "Validate & download", text: "Download sitemap.xml and submit to Search Console." },
    ],
    benefits: ["Faster Google indexing", "Spec-compliant output", "Includes robots.txt snippet"],
  }),
};

const CATEGORY_LABEL: Record<ToolCategory, string> = {
  Image: "Image Tools",
  Developer: "Developer Tools",
  SEO: "SEO Tools",
  Design: "Design Tools",
  Content: "Content Tools",
  Site: "Site",
};

export function getTool(path: string): ToolSeo | undefined {
  return TOOL_SEO[path];
}

export function buildBreadcrumb(tool: ToolSeo) {
  const items: { name: string; item: string }[] = [{ name: "Home", item: SITE.url + "/" }];
  if (tool.category !== "Site" && tool.path !== "/") {
    items.push({ name: CATEGORY_LABEL[tool.category], item: SITE.url + "/" });
  }
  if (tool.path !== "/") {
    items.push({ name: tool.h1, item: SITE.url + tool.path });
  }
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.item,
    })),
  };
}

function softwareApplicationSchema(tool: ToolSeo) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.h1,
    url: SITE.url + tool.path,
    description: tool.description,
    applicationCategory: tool.category === "Developer" ? "DeveloperApplication" : "UtilitiesApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: tool.features,
    ...(tool.rating
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: tool.rating.value,
            ratingCount: tool.rating.count,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
    author: { "@type": "Organization", name: SITE.parentBrand, url: SITE.parent },
    publisher: { "@type": "Organization", name: SITE.parentBrand, url: SITE.parent },
  };
}

function faqPageSchema(tool: ToolSeo) {
  if (!tool.faqs.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: tool.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

function howToSchema(tool: ToolSeo) {
  if (!tool.steps.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `How to use the ${tool.h1}`,
    description: tool.description,
    step: tool.steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  };
}

function webPageSchema(tool: ToolSeo) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: tool.title,
    url: SITE.url + tool.path,
    description: tool.description,
    isPartOf: { "@type": "WebSite", name: SITE.brand, url: SITE.url },
  };
}

export function buildJsonLdFor(path: string) {
  const tool = TOOL_SEO[path];
  if (!tool) return [];
  const blocks: object[] = [buildBreadcrumb(tool)];
  if (tool.category === "Site" && tool.path !== "/") {
    blocks.unshift(webPageSchema(tool));
  } else {
    blocks.unshift(softwareApplicationSchema(tool));
  }
  const faq = faqPageSchema(tool);
  if (faq) blocks.push(faq);
  const howto = howToSchema(tool);
  if (howto) blocks.push(howto);
  return blocks;
}

export function getSeoProps(path: string) {
  const tool = TOOL_SEO[path];
  if (!tool) return null;
  return {
    title: tool.title,
    description: tool.description,
    keywords: tool.keywords,
    canonicalPath: tool.path,
    jsonLd: buildJsonLdFor(path),
  };
}
