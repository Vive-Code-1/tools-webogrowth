import { BLOG_POSTS, type BlogPost } from "./posts";

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/** Tags for a post — prefers explicit `tags` field; falls back to splitting `keywords`. */
export function getPostTags(post: BlogPost): string[] {
  const explicit = (post as BlogPost & { tags?: string[] }).tags;
  const raw =
    explicit && explicit.length > 0
      ? explicit
      : post.keywords
          .split(/[,;]/)
          .map((s) => s.trim())
          .filter(Boolean);
  // dedupe (case-insensitive) and cap at 6
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of raw) {
    const k = t.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(t);
    if (out.length >= 6) break;
  }
  return out;
}

export interface TaxonomyEntry {
  name: string;
  slug: string;
  count: number;
}

export function getAllCategories(): TaxonomyEntry[] {
  const map = new Map<string, TaxonomyEntry>();
  for (const p of BLOG_POSTS) {
    const slug = slugify(p.category);
    const e = map.get(slug);
    if (e) e.count++;
    else map.set(slug, { name: p.category, slug, count: 1 });
  }
  return [...map.values()].sort((a, b) => b.count - a.count);
}

export function getAllTags(): TaxonomyEntry[] {
  const map = new Map<string, TaxonomyEntry>();
  for (const p of BLOG_POSTS) {
    for (const t of getPostTags(p)) {
      const slug = slugify(t);
      if (!slug) continue;
      const e = map.get(slug);
      if (e) e.count++;
      else map.set(slug, { name: t, slug, count: 1 });
    }
  }
  return [...map.values()].sort((a, b) => b.count - a.count);
}

export function getCategoryBySlug(slug: string): TaxonomyEntry | undefined {
  return getAllCategories().find((c) => c.slug === slug);
}

export function getTagBySlug(slug: string): TaxonomyEntry | undefined {
  return getAllTags().find((t) => t.slug === slug);
}

export function getPostsByCategorySlug(slug: string): BlogPost[] {
  return BLOG_POSTS.filter((p) => slugify(p.category) === slug);
}

export function getPostsByTagSlug(slug: string): BlogPost[] {
  return BLOG_POSTS.filter((p) => getPostTags(p).some((t) => slugify(t) === slug));
}
