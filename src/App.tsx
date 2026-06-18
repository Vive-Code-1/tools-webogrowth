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
const ImageToSvg = lazy(() => import("./pages/ImageToSvg"));
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
              <Route path="/image-to-svg" element={<ImageToSvg />} />
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
