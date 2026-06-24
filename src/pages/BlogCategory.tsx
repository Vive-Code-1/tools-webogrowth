import { Link, useParams, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { getCategoryBySlug, getPostsByCategorySlug, getAllCategories } from "@/blog/taxonomy";
import BlogPostCard from "@/components/BlogPostCard";

const SITE_URL = "https://tools.webogrowth.com";

const BlogCategory = () => {
  const { slug } = useParams<{ slug: string }>();
  const category = slug ? getCategoryBySlug(slug) : undefined;
  if (!slug || !category) return <Navigate to="/blog" replace />;

  const posts = [...getPostsByCategorySlug(slug)].sort((a, b) =>
    a.date < b.date ? 1 : a.date > b.date ? -1 : 0,
  );
  const url = `${SITE_URL}/blog/category/${slug}`;
  const title = `${category.name} — Blog Category | WeboGrowth Tools`;
  const description = `Browse ${category.count} ${category.name.toLowerCase()} guides and tutorials from the WeboGrowth Tools team — practical, tool-driven articles you can apply today.`;

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${category.name} posts`,
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
      { "@type": "ListItem", position: 3, name: category.name, item: url },
    ],
  };

  const otherCategories = getAllCategories().filter((c) => c.slug !== slug);

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
        <span className="text-primary">{category.name}</span>
      </nav>

      <header className="mb-10">
        <p className="text-xs font-label uppercase tracking-widest text-primary font-bold mb-3">Category</p>
        <h1 className="text-4xl md:text-5xl font-headline font-black tracking-tight mb-3">{category.name} guides</h1>
        <p className="text-on-surface-variant/80 text-lg max-w-2xl">
          {category.count} {category.count === 1 ? "post" : "posts"} in {category.name.toLowerCase()}.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-6">
        {posts.map((p) => <BlogPostCard key={p.slug} post={p} />)}
      </div>

      {otherCategories.length > 0 && (
        <section className="mt-16 pt-10 border-t border-outline-variant/15">
          <h2 className="text-sm font-label uppercase tracking-widest text-on-surface-variant/60 font-bold mb-4">Other categories</h2>
          <div className="flex flex-wrap gap-2">
            {otherCategories.map((c) => (
              <Link
                key={c.slug}
                to={`/blog/category/${c.slug}`}
                className="px-3 py-1.5 rounded-full text-sm border border-outline-variant/20 hover:border-primary hover:text-primary transition-colors"
              >
                {c.name} <span className="text-on-surface-variant/50">({c.count})</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default BlogCategory;
