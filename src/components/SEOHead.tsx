import { Helmet } from "react-helmet-async";

interface SEOHeadProps {
  title: string;
  description: string;
  keywords: string;
  canonicalPath: string;
  ogType?: string;
  jsonLd?: Record<string, any> | Record<string, any>[];
}

const SITE_URL = "https://tools.webogrowth.com";
const OG_IMAGE = `${SITE_URL}/og-image.jpg`;

const SEOHead = ({
  title,
  description,
  keywords,
  canonicalPath,
  ogType = "website",
  jsonLd,
}: SEOHeadProps) => {
  const ldArray = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="WeboGrowth" />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
      <link rel="canonical" href={`${SITE_URL}${canonicalPath}`} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={`${SITE_URL}${canonicalPath}`} />
      <meta property="og:image" content={OG_IMAGE} />
      <meta property="og:site_name" content="WeboGrowth Tools" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={OG_IMAGE} />
      {ldArray.map((block, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(block)}</script>
      ))}
    </Helmet>
  );
};

export default SEOHead;
