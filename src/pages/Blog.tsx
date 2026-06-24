import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { BLOG_POSTS } from "@/blog/posts";
import { getAllCategories, getAllTags } from "@/blog/taxonomy";
import BlogPostCard from "@/components/BlogPostCard";

const SITE_URL = "https://tools.webogrowth.com";

const Blog = () => {
  const sortedPosts = [...BLOG_POSTS].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  const categories = getAllCategories();
  const tags = getAllTags().slice(0, 24);

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
          content="Practical guides on image compression, JSON formatting, SEO, QR codes and modern web tooling. Browse by category or tag."
        />
        <meta name="keywords" content="web tools blog, image compression guide, json tutorial, seo guide, qr code marketing, free developer tools" />
        <link rel="canonical" href={`${SITE_URL}/blog`} />
        <meta property="og:title" content="WeboGrowth Tools Blog" />
        <meta property="og:description" content="Practical guides on image compression, JSON, SEO and modern web tooling." />
        <meta property="og:url" content={`${SITE_URL}/blog`} />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify(itemListLd)}</script>
      </Helmet>

      <header className="mb-10">
        <p className="text-xs font-label uppercase tracking-widest text-primary font-bold mb-3">WeboGrowth Blog</p>
        <h1 className="text-4xl md:text-5xl font-headline font-black tracking-tight mb-4">
          Guides for designers, developers &amp; marketers
        </h1>
        <p className="text-on-surface-variant/80 text-lg max-w-2xl">
          Practical, tool-driven tutorials on image optimization, JSON, SEO and the modern web. Every post links to a free tool you can use right now.
        </p>
      </header>

      {categories.length > 0 && (
        <nav className="mb-10 flex flex-wrap gap-2" aria-label="Blog categories">
          <span className="px-3 py-1.5 rounded-full text-sm bg-primary text-on-primary font-bold">
            All <span className="opacity-60">({sortedPosts.length})</span>
          </span>
          {categories.map((c) => (
            <Link
              key={c.slug}
              to={`/blog/category/${c.slug}`}
              className="px-3 py-1.5 rounded-full text-sm border border-outline-variant/20 hover:border-primary hover:text-primary transition-colors"
            >
              {c.name} <span className="text-on-surface-variant/50">({c.count})</span>
            </Link>
          ))}
        </nav>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {sortedPosts.map((post) => (
          <BlogPostCard key={post.slug} post={post} />
        ))}
      </div>

      {tags.length > 0 && (
        <section className="mt-16 pt-10 border-t border-outline-variant/15">
          <h2 className="text-sm font-label uppercase tracking-widest text-on-surface-variant/60 font-bold mb-4">
            Popular tags
          </h2>
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <Link
                key={t.slug}
                to={`/blog/tag/${t.slug}`}
                className="px-3 py-1.5 rounded-full text-sm border border-outline-variant/20 hover:border-primary hover:text-primary transition-colors"
              >
                #{t.name} <span className="text-on-surface-variant/50">({t.count})</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Blog;
