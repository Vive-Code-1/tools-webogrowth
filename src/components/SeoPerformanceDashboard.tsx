import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Row {
  keys: string[]; // [query, page] when dimensions=["query","page"]
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface GscResp {
  rows?: Row[];
  error?: string | { message?: string };
}

const SITE_URL = "https://tools.webogrowth.com/";

async function fetchRange(days: number, endOffset = 0): Promise<Row[]> {
  const end = new Date(Date.now() - (2 + endOffset) * 86400_000)
    .toISOString()
    .slice(0, 10);
  const start = new Date(Date.now() - (2 + endOffset + days) * 86400_000)
    .toISOString()
    .slice(0, 10);
  const { data, error } = await supabase.functions.invoke<GscResp>("gsc-manage", {
    body: {
      action: "query_search_analytics",
      siteUrl: SITE_URL,
      startDate: start,
      endDate: end,
      dimensions: ["query", "page"],
      rowLimit: 1000,
    },
  });
  if (error) throw new Error(error.message);
  if ((data as any)?.error) {
    const e = (data as any).error;
    throw new Error(typeof e === "string" ? e : e?.message || "GSC error");
  }
  return data?.rows ?? [];
}

const fmt = (n: number, d = 0) => n.toLocaleString(undefined, { maximumFractionDigits: d });

const SeoPerformanceDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [last90, setLast90] = useState<Row[]>([]);
  const [last15, setLast15] = useState<Row[]>([]);
  const [prev15, setPrev15] = useState<Row[]>([]);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const [r90, r15, p15] = await Promise.all([
        fetchRange(90),
        fetchRange(15),
        fetchRange(15, 15),
      ]);
      setLast90(r90);
      setLast15(r15);
      setPrev15(p15);
    } catch (e: any) {
      setErr(e?.message || "Failed to load GSC data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const totals = useMemo(() => {
    const sum = (rows: Row[]) =>
      rows.reduce(
        (a, r) => ({
          clicks: a.clicks + r.clicks,
          impressions: a.impressions + r.impressions,
        }),
        { clicks: 0, impressions: 0 },
      );
    return { d90: sum(last90), d15: sum(last15), p15: sum(prev15) };
  }, [last90, last15, prev15]);

  const topQueries = useMemo(() => {
    const map = new Map<string, { clicks: number; impressions: number; position: number; ctr: number; n: number }>();
    for (const r of last90) {
      const q = r.keys[0] || "(no query)";
      const cur = map.get(q) || { clicks: 0, impressions: 0, position: 0, ctr: 0, n: 0 };
      cur.clicks += r.clicks;
      cur.impressions += r.impressions;
      cur.position += r.position;
      cur.ctr += r.ctr;
      cur.n += 1;
      map.set(q, cur);
    }
    return [...map.entries()]
      .map(([q, v]) => ({ q, clicks: v.clicks, impressions: v.impressions, position: v.position / v.n, ctr: v.ctr / v.n }))
      .sort((a, b) => b.clicks - a.clicks || b.impressions - a.impressions)
      .slice(0, 25);
  }, [last90]);

  const recommendations = useMemo(() => {
    // 15-day vs prior-15 comparison per page
    const byPage = (rows: Row[]) => {
      const m = new Map<string, { clicks: number; impressions: number; pos: number; n: number }>();
      for (const r of rows) {
        const p = r.keys[1] || "/";
        const c = m.get(p) || { clicks: 0, impressions: 0, pos: 0, n: 0 };
        c.clicks += r.clicks; c.impressions += r.impressions; c.pos += r.position; c.n++;
        m.set(p, c);
      }
      return m;
    };
    const now = byPage(last15);
    const prev = byPage(prev15);
    const recs: { type: "winner" | "loser" | "refresh" | "opportunity"; page: string; note: string }[] = [];
    for (const [page, n] of now) {
      const p = prev.get(page) || { clicks: 0, impressions: 0, pos: 0, n: 0 };
      const delta = n.clicks - p.clicks;
      const pos = n.pos / Math.max(1, n.n);
      if (delta >= 5 && n.clicks >= 10) {
        recs.push({ type: "winner", page, note: `+${delta} clicks vs prior 15d — double down with a follow-up post or refresh.` });
      } else if (p.clicks >= 5 && delta <= -3) {
        recs.push({ type: "loser", page, note: `${delta} clicks vs prior 15d — refresh title/intro, add fresher data.` });
      } else if (n.impressions >= 200 && n.clicks <= 5 && pos > 0 && pos <= 20) {
        recs.push({ type: "opportunity", page, note: `${fmt(n.impressions)} imp, pos ~${fmt(pos, 1)} — rewrite title + meta to lift CTR.` });
      } else if (n.impressions >= 100 && pos > 20) {
        recs.push({ type: "refresh", page, note: `pos ~${fmt(pos, 1)} — add internal links + FAQs to push into top 20.` });
      }
    }
    return recs.slice(0, 20);
  }, [last15, prev15]);

  const card = (label: string, value: string, sub?: string) => (
    <div className="bg-surface-container-highest rounded-xl p-5">
      <p className="text-xs font-label uppercase tracking-widest text-on-surface-variant">{label}</p>
      <p className="text-3xl font-headline font-black mt-2">{value}</p>
      {sub && <p className="text-xs text-on-surface-variant/70 mt-1">{sub}</p>}
    </div>
  );

  const badge = (type: string) => {
    const m: Record<string, string> = {
      winner: "bg-primary/15 text-primary",
      loser: "bg-error/15 text-error",
      opportunity: "bg-amber-400/15 text-amber-300",
      refresh: "bg-sky-400/15 text-sky-300",
    };
    return <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded ${m[type]}`}>{type}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-headline font-bold">SEO Performance (90 days)</h2>
          <p className="text-on-surface-variant text-sm">Live data from Google Search Console. Recommendations refresh every 15 days based on click trends.</p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="bg-primary text-on-primary px-4 py-2 rounded-lg font-bold text-sm disabled:opacity-50"
        >
          {loading ? "Loading…" : "Refresh"}
        </button>
      </div>

      {err && (
        <div className="bg-error/10 text-error rounded-xl p-4 text-sm">
          {err} — verify Google Search Console connector is linked and the property <code>{SITE_URL}</code> exists.
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {card("Clicks (90d)", fmt(totals.d90.clicks))}
        {card("Impressions (90d)", fmt(totals.d90.impressions))}
        {card(
          "Clicks (last 15d)",
          fmt(totals.d15.clicks),
          `Prior 15d: ${fmt(totals.p15.clicks)} (${
            totals.p15.clicks ? Math.round(((totals.d15.clicks - totals.p15.clicks) / totals.p15.clicks) * 100) : 0
          }%)`,
        )}
        {card("CTR (90d)", `${((totals.d90.clicks / Math.max(1, totals.d90.impressions)) * 100).toFixed(2)}%`)}
      </div>

      <div className="bg-surface-container rounded-xl p-6">
        <h3 className="font-headline font-bold mb-4">15-day Recommendations</h3>
        {recommendations.length === 0 ? (
          <p className="text-sm text-on-surface-variant">No actionable signals yet — more data needed.</p>
        ) : (
          <ul className="space-y-2">
            {recommendations.map((r, i) => (
              <li key={i} className="flex items-start gap-3 text-sm border-b border-outline-variant/10 pb-2">
                {badge(r.type)}
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-xs truncate text-foreground">{r.page}</p>
                  <p className="text-on-surface-variant">{r.note}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-surface-container rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-outline-variant/15">
          <h3 className="font-headline font-bold">Top 25 keywords (90 days)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant/15 text-xs uppercase tracking-widest text-on-surface-variant">
                <th className="text-left px-4 py-3">Query</th>
                <th className="text-right px-4 py-3">Clicks</th>
                <th className="text-right px-4 py-3">Impr.</th>
                <th className="text-right px-4 py-3">CTR</th>
                <th className="text-right px-4 py-3">Pos.</th>
              </tr>
            </thead>
            <tbody>
              {topQueries.map((q) => (
                <tr key={q.q} className="border-b border-outline-variant/10">
                  <td className="px-4 py-2 truncate max-w-[320px]">{q.q}</td>
                  <td className="px-4 py-2 text-right font-bold">{fmt(q.clicks)}</td>
                  <td className="px-4 py-2 text-right">{fmt(q.impressions)}</td>
                  <td className="px-4 py-2 text-right">{(q.ctr * 100).toFixed(1)}%</td>
                  <td className="px-4 py-2 text-right">{q.position.toFixed(1)}</td>
                </tr>
              ))}
              {topQueries.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-on-surface-variant text-sm">No keyword data yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SeoPerformanceDashboard;
