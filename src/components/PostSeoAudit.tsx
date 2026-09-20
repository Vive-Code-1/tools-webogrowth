import { useMemo, useState } from "react";
import { BLOG_POSTS } from "@/blog/posts";
import { auditPost, scoreBand, type AuditResult } from "@/lib/postAudit";

const bandClass: Record<string, string> = {
  good: "bg-primary/15 text-primary",
  ok: "bg-amber-400/15 text-amber-300",
  poor: "bg-error/15 text-error",
};

const PostSeoAudit = () => {
  const [open, setOpen] = useState<string | null>(null);
  const [only, setOnly] = useState<"all" | "needs-work">("needs-work");

  const results: AuditResult[] = useMemo(
    () => BLOG_POSTS.map((p) => auditPost(p)).sort((a, b) => a.score - b.score),
    [],
  );

  const list = only === "needs-work" ? results.filter((r) => r.score < 85) : results;
  const avg = Math.round(results.reduce((a, r) => a + r.score, 0) / Math.max(1, results.length));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-headline font-bold">Post SEO Audit</h2>
        <p className="text-on-surface-variant text-sm">
          Every published post scored on title, meta, structure, depth, internal links, FAQs and freshness — with the
          exact fix for each gap.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          ["Posts", results.length],
          ["Average score", avg],
          ["Need work", results.filter((r) => r.score < 85).length],
          ["Missing FAQs", results.filter((r) => r.issues.some((i) => i.id === "faq")).length],
        ].map(([label, value]) => (
          <div key={label as string} className="bg-surface-container-highest rounded-xl p-5">
            <p className="text-xs font-label uppercase tracking-widest text-on-surface-variant">{label}</p>
            <p className="text-3xl font-headline font-black mt-2">{value as number}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        {(
          [
            ["needs-work", "Needs work"],
            ["all", "All posts"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setOnly(id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest ${only === id ? "bg-primary/15 text-primary" : "text-on-surface-variant"}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="bg-surface-container rounded-xl divide-y divide-outline-variant/10">
        {list.map((r) => (
          <div key={r.slug}>
            <button
              onClick={() => setOpen(open === r.slug ? null : r.slug)}
              className="w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-surface-container-highest/40"
            >
              <span className={`text-xs font-bold px-2 py-1 rounded ${bandClass[scoreBand(r.score)]}`}>{r.score}</span>
              <span className="flex-1 min-w-0">
                <span className="block truncate font-medium">{r.title}</span>
                <span className="block text-xs text-on-surface-variant">
                  {r.wordCount} words · {r.internalLinks} internal links · {r.h2Count} H2 · {r.issues.length} suggestions
                </span>
              </span>
              <span className="material-symbols-outlined text-on-surface-variant">
                {open === r.slug ? "expand_less" : "expand_more"}
              </span>
            </button>
            {open === r.slug && (
              <ul className="px-5 pb-4 space-y-2">
                {r.issues.length === 0 && <li className="text-sm text-primary">Fully optimized — nothing to fix.</li>}
                {r.issues.map((i) => (
                  <li key={i.id} className="text-sm flex gap-3">
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-1 rounded h-fit ${
                        i.severity === "high"
                          ? "bg-error/15 text-error"
                          : i.severity === "medium"
                            ? "bg-amber-400/15 text-amber-300"
                            : "bg-sky-400/15 text-sky-300"
                      }`}
                    >
                      {i.severity}
                    </span>
                    <span>
                      <span className="font-medium block">{i.label}</span>
                      <span className="text-on-surface-variant">{i.suggestion}</span>
                    </span>
                  </li>
                ))}
                <li>
                  <a
                    href={`/blog/${r.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary text-xs font-bold"
                  >
                    Open post ↗
                  </a>
                </li>
              </ul>
            )}
          </div>
        ))}
        {list.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-on-surface-variant">Every post scores 85 or higher.</p>
        )}
      </div>
    </div>
  );
};

export default PostSeoAudit;
