import { Helmet } from "react-helmet-async";

interface SEOHeadProps {
  title: string;
  description: string;
  keywords: string;
  canonicalPath: string;
  ogType?: string;
}

const SITE_URL = "https://tools.webogrowth.com";

const SEOHead = ({
  title,
  description,
  keywords,
  canonicalPath,
  ogType = "website",
}: SEOHeadProps) => (
  <Helmet>
    <title>{title}</title>
    <meta name="description" content={description} />
    <meta name="keywords" content={keywords} />
    <link rel="canonical" href={`${SITE_URL}${canonicalPath}`} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content={ogType} />
    <meta property="og:url" content={`${SITE_URL}${canonicalPath}`} />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
  </Helmet>
);

export default SEOHead;
