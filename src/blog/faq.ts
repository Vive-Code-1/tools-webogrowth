import type { BlogPost } from "./posts";

export interface FaqItem {
  question: string;
  answer: string;
}

/**
 * Extract FAQ Q&A pairs from a markdown body.
 *
 * Looks for an H2 section whose heading matches "FAQ", "FAQs", or
 * "Frequently Asked Questions" (case-insensitive). Inside that section,
 * each H3 is treated as a question and the following paragraph(s) (until
 * the next H3 or H2) as the answer.
 */
export function extractFaqsFromMarkdown(body: string): FaqItem[] {
  if (!body) return [];
  const lines = body.split(/\r?\n/);
  let inFaq = false;
  let currentQ: string | null = null;
  let currentA: string[] = [];
  const faqs: FaqItem[] = [];

  const flush = () => {
    if (currentQ) {
      const answer = currentA.join("\n").trim();
      if (answer) faqs.push({ question: currentQ.trim(), answer });
    }
    currentQ = null;
    currentA = [];
  };

  for (const raw of lines) {
    const line = raw;
    const h2 = line.match(/^##\s+(.+?)\s*$/);
    const h3 = line.match(/^###\s+(.+?)\s*$/);

    if (h2) {
      if (inFaq) flush();
      const heading = h2[1].toLowerCase().replace(/[^a-z ]/g, "").trim();
      inFaq = /^(faq|faqs|frequently asked questions)$/.test(heading);
      continue;
    }
    if (!inFaq) continue;
    if (h3) {
      flush();
      currentQ = h3[1].replace(/^\d+\.\s*/, "");
      continue;
    }
    if (currentQ) currentA.push(line);
  }
  if (inFaq) flush();
  return faqs;
}

/** Strip markdown formatting to plain text suitable for schema.org Answer.text. */
function mdToPlain(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, "$1")
    .replace(/^>\s?/gm, "")
    .replace(/\s+\n/g, "\n")
    .replace(/\n{2,}/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/** Get FAQs for a post — explicit `faqs` field wins, else auto-extract. */
export function getPostFaqs(post: Pick<BlogPost, "faqs" | "body">): FaqItem[] {
  if (post.faqs && post.faqs.length > 0) return post.faqs;
  return extractFaqsFromMarkdown(post.body);
}

/** Build schema.org FAQPage JSON-LD from FAQ items. */
export function buildFaqPageSchema(faqs: FaqItem[]) {
  if (!faqs.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: mdToPlain(f.answer),
      },
    })),
  };
}
