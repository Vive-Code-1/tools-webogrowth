import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "./components/Layout";
import AdminHeadInjector from "./components/AdminHeadInjector";
import Index from "./pages/Index";
import Compressor from "./pages/Compressor";
import Converter from "./pages/Converter";
import SvgOptimizer from "./pages/SvgOptimizer";
import Favicon from "./pages/Favicon";
import JsonFormatter from "./pages/JsonFormatter";
import MetaTagGenerator from "./pages/MetaTagGenerator";
import ColorPalette from "./pages/ColorPalette";
import QrCodeGenerator from "./pages/QrCodeGenerator";
import ImageResizer from "./pages/ImageResizer";
import CssMinifier from "./pages/CssMinifier";
import Base64Tool from "./pages/Base64Tool";
import GradientGenerator from "./pages/GradientGenerator";
import LoremIpsum from "./pages/LoremIpsum";
import RobotsTxtGenerator from "./pages/RobotsTxtGenerator";
import OgPreview from "./pages/OgPreview";
import PlaceholderImage from "./pages/PlaceholderImage";
import HtmlToMarkdown from "./pages/HtmlToMarkdown";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/compressor" element={<Compressor />} />
            <Route path="/converter" element={<Converter />} />
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
          </Route>
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
