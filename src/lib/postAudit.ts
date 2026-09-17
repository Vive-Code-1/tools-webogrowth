/**
 * Per-post SEO audit: pure scoring rules shared by the Admin dashboard
 * and the blog generation script, so every new post ships optimized.
 */

export interface AuditablePost {
  slug: string;
  title: string;
  description: string;
  keywords: string;
  excerpt?: string;
  body: string;
  category?: string;
  date?: string;
  updated?: string;
  relatedTools?: { label: string; path: string }[];
  faqs?: { question: string; answer: string }[];
}

export interface AuditIssue {
  id: string;
  severity: "high" | "medium" | "low";
  label: string;
  suggestion: string;
  points: number;
}

export interface AuditResult {
  slug: string;
  title: string;
  score: number; // 0-100
  wordCount: number;
  internalLinks: number;
  h2Count: number;
  focusKeyword: string;
  issues: AuditIssue[];
}

const WORD_TARGET = 1100;
const INTERNAL_LINK_TARGET = 4;
const H2_TARGET = 4;

export function focusKeywordOf(post: AuditablePost): string {
  return (post.keywords || "").split(",")[0]?.trim().toLowerCase() || "";
}

export function auditPost(post: AuditablePost): AuditResult {
  const body = post.body || "";
  const issues: AuditIssue[] = [];
  const add = (i: AuditIssue) => issues.push(i);

  const words = body.replace(/```[\s\S]*?```/g, " ").split(/\s+/).filter(Boolean).length;
  const h2Count = (body.match(/^##\s+/gm) || []).length;
  const h3Count = (body.match(/^###\s+/gm) || []).length;
  const internalLinks = (body.match(/\]\((\/[a-z0-9/-]*)\)/gi) || []).length;
  const externalLinks = (body.match(/\]\(https?:\/\//gi) || []).length;
  const images = (body.match(/!\[[^\]]*\]\([^)]+\)/g) || []).length;
  const imagesMissingAlt = (body.match(/!\[\s*\]\([^)]+\)/g) || []).length;
  const focus = focusKeywordOf(post);
  const titleLower = (post.title || "").toLowerCase();
  const descLower = (post.description || "").toLowerCase();
  const firstParagraph = body.split(/\n{2,}/).find((p) => p.trim() && !p.trim().startsWith("#")) || "";

  if (post.title.length < 30 || post.title.length > 62) {
    add({
      id: "title-length",
      severity: "medium",
      label: `Title is ${post.title.length} characters`,
      suggestion: "Keep the title between 30 and 62 characters so Google shows it in full.",
      points: 6,
    });
  }
  if (focus && !titleLower.includes(focus)) {
    add({
      id: "title-keyword",
      severity: "high",
      label: "Focus keyword missing from title",
      suggestion: `Put “${focus}” near the start of the title.`,
      points: 12,
    });
  }
  if (post.description.length < 110 || post.description.length > 160) {
    add({
      id: "meta-length",
      severity: "medium",
      label: `Meta description is ${post.description.length} characters`,
      suggestion: "Aim for 120–158 characters with a clear benefit and a verb.",
      points: 6,
    });
  }
  if (focus && !descLower.includes(focus)) {
    add({
      id: "meta-keyword",
      severity: "medium",
      label: "Focus keyword missing from meta description",
      suggestion: `Work “${focus}” naturally into the description.`,
      points: 6,
    });
  }
  if (focus && !firstParagraph.toLowerCase().includes(focus)) {
    add({
      id: "intro-keyword",
      severity: "medium",
      label: "Focus keyword missing from the intro",
      suggestion: `Mention “${focus}” in the first paragraph, within the first 100 words.`,
      points: 6,
    });
  }
  if (words < WORD_TARGET) {
    add({
      id: "word-count",
      severity: words < 700 ? "high" : "medium",
      label: `${words} words (target ${WORD_TARGET}+)`,
      suggestion: "Add a comparison table, a troubleshooting section, or a real example to go deeper than competitors.",
      points: words < 700 ? 14 : 8,
    });
  }
  if (h2Count < H2_TARGET) {
    add({
      id: "headings",
      severity: "medium",
      label: `${h2Count} H2 sections`,
      suggestion: "Use at least 4 H2 sections phrased like real search questions.",
      points: 8,
    });
  }
  if (h3Count === 0 && words > 900) {
    add({
      id: "subheadings",
      severity: "low",
      label: "No H3 sub-sections",
      suggestion: "Break long sections into H3 steps — it wins more featured snippets.",
      points: 3,
    });
  }
  if (internalLinks < INTERNAL_LINK_TARGET) {
    add({
      id: "internal-links",
      severity: "high",
      label: `${internalLinks} internal links (target ${INTERNAL_LINK_TARGET}+)`,
      suggestion: "Link to the matching tool page and 2–3 related posts using descriptive anchor text.",
      points: 12,
    });
  }
  if (externalLinks === 0) {
    add({
      id: "external-links",
      severity: "low",
      label: "No outbound citations",
      suggestion: "Cite one authoritative source (web.dev, MDN, Google docs) to build trust.",
      points: 4,
    });
  }
  if (!post.relatedTools || post.relatedTools.length < 2) {
    add({
      id: "related-tools",
      severity: "medium",
      label: "Fewer than 2 related tools",
      suggestion: "Attach 2–4 related tools so readers convert into tool users.",
      points: 6,
    });
  }
  const faqCount = post.faqs?.length ?? (body.match(/^###\s+.*\?$/gm) || []).length;
  if (faqCount < 3) {
    add({
      id: "faq",
      severity: "high",
      label: `${faqCount} FAQ entries`,
      suggestion: "Add 4–5 FAQs taken from People Also Ask — they power FAQ rich results.",
      points: 10,
    });
  }
  if (images === 0) {
    add({
      id: "images",
      severity: "low",
      label: "No in-body image",
      suggestion: "Add at least one illustration or screenshot with descriptive alt text.",
      points: 4,
    });
  }
  if (imagesMissingAlt > 0) {
    add({
      id: "alt-text",
      severity: "medium",
      label: `${imagesMissingAlt} image(s) without alt text`,
      suggestion: "Describe each image in its alt text, including the keyword where it fits.",
      points: 5,
    });
  }
  const freshnessDate = post.updated || post.date;
  if (freshnessDate) {
    const ageDays = (Date.now() - new Date(freshnessDate).getTime()) / 86_400_000;
    if (ageDays > 180) {
      add({
        id: "freshness",
        severity: "medium",
        label: `Last updated ${Math.round(ageDays)} days ago`,
        suggestion: "Refresh the data, re-check the steps, and set an updated date.",
        points: 6,
      });
    }
  }

  const deducted = issues.reduce((a, i) => a + i.points, 0);
  const score = Math.max(0, Math.min(100, 100 - deducted));

  return {
    slug: post.slug,
    title: post.title,
    score,
    wordCount: words,
    internalLinks,
    h2Count,
    focusKeyword: focus,
    issues: issues.sort((a, b) => b.points - a.points),
  };
}

export function scoreBand(score: number): "good" | "ok" | "poor" {
  if (score >= 85) return "good";
  if (score >= 65) return "ok";
  return "poor";
}
