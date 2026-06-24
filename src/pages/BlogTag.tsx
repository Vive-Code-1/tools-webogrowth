import { Link, useParams, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { getTagBySlug, getPostsByTagSlug, getAllTags } from "@/blog/taxonomy";
import BlogPostCard from "@/components/BlogPostCard";

const SITE_URL = "https://tools.webogrowth.com";

const BlogTag = () => {
  const { slug } = useParams<{ slug: string }>();
  const tag = slug ? getTagBySlug(slug) : undefined;
  if (!slug || !tag) return <Navigate to="/blog" replace />;

  const posts = [...getPostsByTagSlug(slug)].sort((a, b) =>
    a.date < b.date ? 1 : a.date > b.date ? -1 : 0,
  );
  const url = `${SITE_URL}/blog/tag/${slug}`;
  const title = `${tag.name} — Blog Tag | WeboGrowth Tools`;
  const description = `All blog posts tagged "${tag.name}" on WeboGrowth Tools — ${tag.count} ${tag.count === 1 ? "guide" : "guides"} covering ${tag.name.toLowerCase()}.`;

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Posts tagged ${tag.name}`,
    url,
    itemListElement: posts.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/blog/${p.slug}`,
      name: p.title,
    })),
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
      { "@type": "ListItem", position: 3, name: tag.name, item: url },
    ],
  };

  const popularTags = getAllTags().filter((t) => t.slug !== slug).slice(0, 20);

  return (
    <div className="max-w-5xl mx-auto px-6 md:px-8 py-16">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={url} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={url} />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <script type="application/ld+json">{JSON.stringify(itemListLd)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbLd)}</script>
      </Helmet>

      <nav className="text-xs uppercase tracking-widest font-label text-on-surface-variant/60 mb-6" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-primary">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/blog" className="hover:text-primary">Blog</Link>
        <span className="mx-2">/</span>
        <span className="text-primary">#{tag.name}</span>
      </nav>

      <header className="mb-10">
        <p className="text-xs font-label uppercase tracking-widest text-primary font-bold mb-3">Tag</p>
        <h1 className="text-4xl md:text-5xl font-headline font-black tracking-tight mb-3">#{tag.name}</h1>
        <p className="text-on-surface-variant/80 text-lg max-w-2xl">
          {tag.count} {tag.count === 1 ? "post" : "posts"} tagged with “{tag.name}”.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-6">
        {posts.map((p) => <BlogPostCard key={p.slug} post={p} />)}
      </div>

      {popularTags.length > 0 && (
        <section className="mt-16 pt-10 border-t border-outline-variant/15">
          <h2 className="text-sm font-label uppercase tracking-widest text-on-surface-variant/60 font-bold mb-4">Explore more tags</h2>
          <div className="flex flex-wrap gap-2">
            {popularTags.map((t) => (
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

export default BlogTag;
