import { Link } from "react-router-dom";
import type { BlogPost } from "@/blog/posts";
import { slugify } from "@/blog/taxonomy";

interface Props {
  post: BlogPost;
}

const BlogPostCard = ({ post }: Props) => (
  <article className="group bg-surface-container-lowest border border-outline-variant/15 rounded-2xl p-6 hover:border-primary/40 transition-all">
    {post.cover && (
      <Link
        to={`/blog/${post.slug}`}
        aria-label={post.title}
        className="block mb-5 overflow-hidden rounded-xl border border-outline-variant/15 bg-surface-container-lowest"
      >
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
      <Link
        to={`/blog/category/${slugify(post.category)}`}
        className="text-primary font-bold hover:underline"
      >
        {post.category}
      </Link>
      <span className="text-on-surface-variant/40">•</span>
      <span className="text-on-surface-variant/60">{post.readMinutes} min read</span>
    </div>
    <h2 className="text-xl md:text-2xl font-headline font-bold tracking-tight mb-3 group-hover:text-primary transition-colors">
      <Link to={`/blog/${post.slug}`}>{post.title}</Link>
    </h2>
    <p className="text-on-surface-variant/70 text-sm leading-relaxed mb-4">{post.excerpt}</p>
    <div className="flex items-center gap-2 text-xs text-on-surface-variant/50">
      <time dateTime={post.date}>
        {new Date(post.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
      </time>
      <span>•</span>
      <span>{post.author}</span>
    </div>
  </article>
);

export default BlogPostCard;
