import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "./components/Layout";
import AdminHeadInjector from "./components/AdminHeadInjector";
import Index from "./pages/Index";

const Compressor = lazy(() => import("./pages/Compressor"));
const Converter = lazy(() => import("./pages/Converter"));
const HeicToJpg = lazy(() => import("./pages/HeicToJpg"));
const ImageToSvg = lazy(() => import("./pages/ImageToSvg"));
const BackgroundRemover = lazy(() => import("./pages/BackgroundRemover"));
const PdfToolkit = lazy(() => import("./pages/PdfToolkit"));
const JwtDecoder = lazy(() => import("./pages/JwtDecoder"));
const PageSpeedAnalyzer = lazy(() => import("./pages/PageSpeedAnalyzer"));
const RegexTester = lazy(() => import("./pages/RegexTester"));
const SchemaGenerator = lazy(() => import("./pages/SchemaGenerator"));
const Watermark = lazy(() => import("./pages/Watermark"));
const AltTextGenerator = lazy(() => import("./pages/AltTextGenerator"));
const VideoToGif = lazy(() => import("./pages/VideoToGif"));
const DiffChecker = lazy(() => import("./pages/DiffChecker"));
const CurlBuilder = lazy(() => import("./pages/CurlBuilder"));
const SitemapGenerator = lazy(() => import("./pages/SitemapGenerator"));
const SvgOptimizer = lazy(() => import("./pages/SvgOptimizer"));
const Favicon = lazy(() => import("./pages/Favicon"));
const JsonFormatter = lazy(() => import("./pages/JsonFormatter"));
const MetaTagGenerator = lazy(() => import("./pages/MetaTagGenerator"));
const ColorPalette = lazy(() => import("./pages/ColorPalette"));
const QrCodeGenerator = lazy(() => import("./pages/QrCodeGenerator"));
const ImageResizer = lazy(() => import("./pages/ImageResizer"));
const CssMinifier = lazy(() => import("./pages/CssMinifier"));
const Base64Tool = lazy(() => import("./pages/Base64Tool"));
const GradientGenerator = lazy(() => import("./pages/GradientGenerator"));
const LoremIpsum = lazy(() => import("./pages/LoremIpsum"));
const RobotsTxtGenerator = lazy(() => import("./pages/RobotsTxtGenerator"));
const OgPreview = lazy(() => import("./pages/OgPreview"));
const PlaceholderImage = lazy(() => import("./pages/PlaceholderImage"));
const HtmlToMarkdown = lazy(() => import("./pages/HtmlToMarkdown"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const ContactUs = lazy(() => import("./pages/ContactUs"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const BlogCategory = lazy(() => import("./pages/BlogCategory"));
const BlogTag = lazy(() => import("./pages/BlogTag"));
const Admin = lazy(() => import("./pages/Admin"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const PageFallback = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AdminHeadInjector />
      <BrowserRouter>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Index />} />
              <Route path="/compressor" element={<Compressor />} />
              <Route path="/converter" element={<Converter />} />
              <Route path="/heic-to-jpg" element={<HeicToJpg />} />
              <Route path="/image-to-svg" element={<ImageToSvg />} />
              <Route path="/background-remover" element={<BackgroundRemover />} />
              <Route path="/pdf-toolkit" element={<PdfToolkit />} />
              <Route path="/jwt-decoder" element={<JwtDecoder />} />
              <Route path="/pagespeed-analyzer" element={<PageSpeedAnalyzer />} />
              <Route path="/regex-tester" element={<RegexTester />} />
              <Route path="/schema-generator" element={<SchemaGenerator />} />
              <Route path="/watermark" element={<Watermark />} />
              <Route path="/alt-text-generator" element={<AltTextGenerator />} />
              <Route path="/video-to-gif" element={<VideoToGif />} />
              <Route path="/diff-checker" element={<DiffChecker />} />
              <Route path="/curl-builder" element={<CurlBuilder />} />
              <Route path="/sitemap-generator" element={<SitemapGenerator />} />
              <Route path="/svg-optimizer" element={<SvgOptimizer />} />
              <Route path="/favicon" element={<Favicon />} />
              <Route path="/json-formatter" element={<JsonFormatter />} />
              <Route path="/meta-tag-generator" element={<MetaTagGenerator />} />
              <Route path="/color-palette" element={<ColorPalette />} />
              <Route path="/qr-code" element={<QrCodeGenerator />} />
              <Route path="/image-resizer" element={<ImageResizer />} />
              <Route path="/css-minifier" element={<CssMinifier />} />
              <Route path="/base64" element={<Base64Tool />} />
              <Route path="/gradient-generator" element={<GradientGenerator />} />
              <Route path="/lorem-ipsum" element={<LoremIpsum />} />
              <Route path="/robots-generator" element={<RobotsTxtGenerator />} />
              <Route path="/og-preview" element={<OgPreview />} />
              <Route path="/placeholder" element={<PlaceholderImage />} />
              <Route path="/html-to-markdown" element={<HtmlToMarkdown />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/about-us" element={<AboutUs />} />
              <Route path="/contact-us" element={<ContactUs />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/category/:slug" element={<BlogCategory />} />
              <Route path="/blog/tag/:slug" element={<BlogTag />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
            </Route>
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
