import { Link, useParams, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getPostBySlug, BLOG_POSTS } from "@/blog/posts";
import ShareButtons from "@/components/ShareButtons";

const SITE_URL = "https://tools.webogrowth.com";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getPostBySlug(slug) : undefined;

  if (!post) return <Navigate to="/blog" replace />;

  const url = `${SITE_URL}/blog/${post.slug}`;
  const coverUrl = post.cover ? (post.cover.startsWith("http") ? post.cover : `${SITE_URL}${post.cover}`) : `${SITE_URL}/og-image.jpg`;

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    author: { "@type": "Organization", name: post.author, url: "https://webogrowth.com" },
    publisher: {
      "@type": "Organization",
      name: "WeboGrowth",
      url: "https://webogrowth.com",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/og-image.jpg` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    keywords: post.keywords,
    articleSection: post.category,
    wordCount: post.body.split(/\s+/).length,
    image: coverUrl,
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: url },
    ],
  };

  // Internal-link Markdown rendering: rewrite relative links to use <Link>
  const components = {
    a: ({ href, children, ...rest }: any) => {
      if (href?.startsWith("/")) {
        return (
          <Link to={href} className="text-primary underline underline-offset-4 hover:no-underline">
            {children}
          </Link>
        );
      }
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-4 hover:no-underline" {...rest}>
          {children}
        </a>
      );
    },
  };

  const related = BLOG_POSTS.filter((p) => p.slug !== post.slug && p.category === post.category).slice(0, 3);

  return (
    <div className="max-w-3xl mx-auto px-6 md:px-8 py-16">
      <Helmet>
        <title>{post.title}</title>
        <meta name="description" content={post.description} />
        <meta name="keywords" content={post.keywords} />
        <meta name="author" content={post.author} />
        <link rel="canonical" href={url} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.description} />
        <meta property="og:url" content={url} />
        <meta property="article:published_time" content={post.date} />
        <meta property="article:author" content={post.author} />
        <meta property="article:section" content={post.category} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.description} />
        <script type="application/ld+json">{JSON.stringify(articleLd)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbLd)}</script>
      </Helmet>

      <nav className="text-xs uppercase tracking-widest font-label text-on-surface-variant/60 mb-6" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-primary">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/blog" className="hover:text-primary">Blog</Link>
        <span className="mx-2">/</span>
        <span className="text-primary">{post.category}</span>
      </nav>

      <header className="mb-10">
        <div className="flex items-center gap-3 mb-4 text-xs uppercase tracking-widest font-label">
          <span className="text-primary font-bold">{post.category}</span>
          <span className="text-on-surface-variant/40">•</span>
          <span className="text-on-surface-variant/60">{post.readMinutes} min read</span>
          <span className="text-on-surface-variant/40">•</span>
          <time dateTime={post.date} className="text-on-surface-variant/60">
            {new Date(post.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
          </time>
        </div>
        <h1 className="text-3xl md:text-5xl font-headline font-black tracking-tight mb-4">{post.title}</h1>
        <p className="text-on-surface-variant/80 text-lg leading-relaxed mb-8">{post.excerpt}</p>
        <ShareButtons url={url} title={post.title} description={post.description} hashtags={["webogrowth", "webtools"]} />
      </header>

      <article className="prose prose-invert prose-lg max-w-none prose-headings:font-headline prose-headings:tracking-tight prose-h2:text-2xl prose-h2:mt-12 prose-h3:text-xl prose-a:text-primary prose-strong:text-foreground prose-code:text-primary prose-code:before:content-none prose-code:after:content-none prose-table:text-sm">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
          {post.body}
        </ReactMarkdown>
      </article>

      <div className="mt-10 pt-8 border-t border-outline-variant/15">
        <ShareButtons url={url} title={post.title} description={post.description} hashtags={["webogrowth", "webtools"]} />
      </div>

      <aside className="mt-16 p-6 bg-primary/5 border border-primary/20 rounded-2xl">
        <p className="text-xs font-label uppercase tracking-widest text-primary font-bold mb-3">Try the tools mentioned</p>
        <div className="flex flex-wrap gap-3">
          {post.relatedTools.map((t) => (
            <Link
              key={t.path}
              to={t.path}
              className="bg-primary text-on-primary px-4 py-2 rounded-lg font-bold text-sm hover:shadow-[0_0_20px_hsla(82,98%,72%,0.3)] transition-all"
            >
              {t.label} →
            </Link>
          ))}
        </div>
      </aside>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-headline font-bold tracking-tight mb-6">Related guides</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {related.map((r) => (
              <Link
                key={r.slug}
                to={`/blog/${r.slug}`}
                className="block bg-surface-container-lowest border border-outline-variant/15 rounded-xl p-4 hover:border-primary/40 transition-all"
              >
                <p className="text-xs text-primary font-bold uppercase tracking-widest mb-2">{r.category}</p>
                <h3 className="font-headline font-bold text-base leading-snug">{r.title}</h3>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="mt-12 text-center">
        <Link to="/blog" className="text-primary hover:underline text-sm font-bold">← Back to all posts</Link>
      </div>
    </div>
  );
};

export default BlogPost;
