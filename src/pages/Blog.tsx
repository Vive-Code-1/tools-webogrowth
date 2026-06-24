import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { BLOG_POSTS } from "@/blog/posts";

const SITE_URL = "https://tools.webogrowth.com";

const Blog = () => {
  const sortedPosts = [...BLOG_POSTS].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "WeboGrowth Tools Blog",
    url: `${SITE_URL}/blog`,
    blogPost: sortedPosts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      description: p.description,
      datePublished: p.date,
      author: { "@type": "Organization", name: p.author },
      url: `${SITE_URL}/blog/${p.slug}`,
    })),
  };

  return (
    <div className="max-w-5xl mx-auto px-6 md:px-8 py-16">
      <Helmet>
        <title>Blog — Image, SEO & Developer Guides | WeboGrowth Tools</title>
        <meta
          name="description"
          content="Practical guides on image compression, JSON formatting, SEO, QR codes and modern web tooling. Written by the WeboGrowth team."
        />
        <meta name="keywords" content="web tools blog, image compression guide, json tutorial, seo guide, qr code marketing, free developer tools" />
        <link rel="canonical" href={`${SITE_URL}/blog`} />
        <meta property="og:title" content="WeboGrowth Tools Blog" />
        <meta property="og:description" content="Practical guides on image compression, JSON, SEO and modern web tooling." />
        <meta property="og:url" content={`${SITE_URL}/blog`} />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify(itemListLd)}</script>
      </Helmet>

      <header className="mb-12">
        <p className="text-xs font-label uppercase tracking-widest text-primary font-bold mb-3">WeboGrowth Blog</p>
        <h1 className="text-4xl md:text-5xl font-headline font-black tracking-tight mb-4">
          Guides for designers, developers &amp; marketers
        </h1>
        <p className="text-on-surface-variant/80 text-lg max-w-2xl">
          Practical, tool-driven tutorials on image optimization, JSON, SEO and the modern web. Every post links to a free tool you can use right now.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-6">
        {sortedPosts.map((post) => (
          <article
            key={post.slug}
            className="group bg-surface-container-lowest border border-outline-variant/15 rounded-2xl p-6 hover:border-primary/40 transition-all"
          >
            {post.cover && (
              <Link to={`/blog/${post.slug}`} aria-label={post.title} className="block mb-5 overflow-hidden rounded-xl border border-outline-variant/15 bg-surface-container-lowest">
                <img
                  src={post.cover}
                  alt={post.title}
                  loading="lazy"
                  width={1280}
                  height={720}
                  className="aspect-[16/9] w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </Link>
            )}
            <div className="flex items-center gap-3 mb-3 text-xs uppercase tracking-widest font-label">
              <span className="text-primary font-bold">{post.category}</span>
              <span className="text-on-surface-variant/40">•</span>
              <span className="text-on-surface-variant/60">{post.readMinutes} min read</span>
            </div>
            <h2 className="text-xl md:text-2xl font-headline font-bold tracking-tight mb-3 group-hover:text-primary transition-colors">
              <Link to={`/blog/${post.slug}`} className="after:absolute after:inset-0">
                {post.title}
              </Link>
            </h2>
            <p className="text-on-surface-variant/70 text-sm leading-relaxed mb-4">{post.excerpt}</p>
            <div className="flex items-center gap-2 text-xs text-on-surface-variant/50">
              <time dateTime={post.date}>{new Date(post.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</time>
              <span>•</span>
              <span>{post.author}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default Blog;
