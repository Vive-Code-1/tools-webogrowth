import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const SITE_URL = "https://tools.webogrowth.com/";
const BATCH = 15;

interface StatusRow {
  url: string;
  verdict: string | null;
  coverage_state: string | null;
  robots_state: string | null;
  google_canonical: string | null;
  user_canonical: string | null;
  last_crawl_time: string | null;
  checked_at: string;
}

const isIndexed = (r: StatusRow) => r.verdict === "PASS";

const IndexStatusPanel = () => {
  const [rows, setRows] = useState<StatusRow[]>([]);
  const [sitemapUrls, setSitemapUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [tab, setTab] = useState<"not-indexed" | "indexed" | "unchecked">("not-indexed");

  const loadCached = async () => {
    const { data, error } = await supabase.functions.invoke<{ rows: StatusRow[]; error?: string }>("gsc-manage", {
      body: { action: "cached_index_status" },
    });
    if (error) return setErr(error.message);
    if (data?.error) return setErr(String(data.error));
    setRows(data?.rows || []);
  };

  const loadSitemap = async () => {
    try {
      const res = await fetch("/sitemap.xml", { cache: "no-store" });
      const xml = await res.text();
      setSitemapUrls([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]));
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    loadCached();
    loadSitemap();
  }, []);

  const checkedSet = new Set(rows.map((r) => r.url));
  const unchecked = sitemapUrls.filter((u) => !checkedSet.has(u));

  const runCheck = async (urls: string[]) => {
    if (urls.length === 0) return;
    setLoading(true);
    setErr(null);
    try {
      for (let i = 0; i < urls.length; i += BATCH) {
        const slice = urls.slice(i, i + BATCH);
        setProgress(`Checking ${i + 1}–${Math.min(i + BATCH, urls.length)} of ${urls.length}…`);
        const { data, error } = await supabase.functions.invoke<{ results: any[]; error?: string }>("gsc-manage", {
          body: { action: "inspect_urls", siteUrl: SITE_URL, urls: slice },
        });
        if (error) throw new Error(error.message);
        if (data?.error) throw new Error(String(data.error));
        const failed = (data?.results || []).find((r) => r.error);
        if (failed) {
          setErr(
            `Google stopped at ${failed.url} (status ${failed.status}) — daily inspection quota or property access. Try again later.`,
          );
          break;
        }
      }
      await loadCached();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setLoading(false);
      setProgress(null);
    }
  };

  const notIndexed = rows.filter((r) => !isIndexed(r));
  const indexed = rows.filter(isIndexed);

  const exportCsv = () => {
    const lines = [
      "url,verdict,coverage_state,robots_state,google_canonical,last_crawl",
      ...notIndexed.map((r) =>
        [r.url, r.verdict, r.coverage_state, r.robots_state, r.google_canonical, r.last_crawl_time]
          .map((v) => `"${(v ?? "").toString().replace(/"/g, '""')}"`)
          .join(","),
      ),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "not-indexed-urls.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const list = tab === "not-indexed" ? notIndexed : tab === "indexed" ? indexed : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-headline font-bold">Index Status</h2>
          <p className="text-on-surface-variant text-sm">
            Every sitemap URL checked against Google's index. Google limits daily inspections, so run it in batches.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => runCheck(unchecked.length ? unchecked : sitemapUrls)}
            disabled={loading || sitemapUrls.length === 0}
            className="bg-primary text-on-primary px-4 py-2 rounded-lg font-bold text-sm disabled:opacity-50"
          >
            {loading ? progress || "Checking…" : unchecked.length ? `Check ${unchecked.length} new URLs` : "Re-check all"}
          </button>
          <button
            onClick={exportCsv}
            disabled={notIndexed.length === 0}
            className="bg-surface-container-highest px-4 py-2 rounded-lg font-bold text-sm disabled:opacity-50"
          >
            Export CSV
          </button>
        </div>
      </div>

      {err && <div className="bg-error/10 text-error rounded-xl p-4 text-sm">{err}</div>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          ["Sitemap URLs", sitemapUrls.length],
          ["Checked", rows.length],
          ["Indexed", indexed.length],
          ["Not indexed", notIndexed.length],
        ].map(([label, value]) => (
          <div key={label as string} className="bg-surface-container-highest rounded-xl p-5">
            <p className="text-xs font-label uppercase tracking-widest text-on-surface-variant">{label}</p>
            <p className="text-3xl font-headline font-black mt-2">{value as number}</p>
          </div>
        ))}
      </div>

      <div className="bg-surface-container rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-outline-variant/15 flex gap-2 flex-wrap">
          {(
            [
              ["not-indexed", `Not indexed (${notIndexed.length})`],
              ["indexed", `Indexed (${indexed.length})`],
              ["unchecked", `Not checked yet (${unchecked.length})`],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest ${tab === id ? "bg-primary/15 text-primary" : "text-on-surface-variant"}`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "unchecked" ? (
          <ul className="divide-y divide-outline-variant/10">
            {unchecked.slice(0, 200).map((u) => (
              <li key={u} className="px-4 py-2 font-mono text-xs truncate">
                {u}
              </li>
            ))}
            {unchecked.length === 0 && (
              <li className="px-4 py-8 text-center text-on-surface-variant text-sm">Every sitemap URL has been checked.</li>
            )}
          </ul>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant/15 text-xs uppercase tracking-widest text-on-surface-variant">
                  <th className="text-left px-4 py-3">URL</th>
                  <th className="text-left px-4 py-3">Coverage</th>
                  <th className="text-left px-4 py-3">Robots</th>
                  <th className="text-left px-4 py-3">Last crawl</th>
                </tr>
              </thead>
              <tbody>
                {list.map((r) => (
                  <tr key={r.url} className="border-b border-outline-variant/10">
                    <td className="px-4 py-2 font-mono text-xs truncate max-w-[320px]">{r.url.replace(SITE_URL, "/")}</td>
                    <td className="px-4 py-2">{r.coverage_state || "—"}</td>
                    <td className="px-4 py-2">{r.robots_state || "—"}</td>
                    <td className="px-4 py-2">{r.last_crawl_time ? r.last_crawl_time.slice(0, 10) : "never"}</td>
                  </tr>
                ))}
                {list.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-on-surface-variant text-sm">
                      Nothing here yet — run a check first.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default IndexStatusPanel;
