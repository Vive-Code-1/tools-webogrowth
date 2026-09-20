import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PageRow {
  path: string;
  views: number;
  visitors: number;
  avgDwellSec: number;
  bounceRate: number;
  organic: number;
  social: number;
  referral: number;
  direct: number;
}

interface Payload {
  totals: { views: number; visitors: number; avgDwellSec: number; bounceRate: number };
  sources: Record<string, number>;
  devices: Record<string, number>;
  daily: { day: string; views: number }[];
  pages: PageRow[];
  error?: string;
}

const fmt = (n: number) => n.toLocaleString();
const mmss = (s: number) => `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, "0")}s`;

const VisitorAnalyticsDashboard = () => {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "blog" | "tools">("all");

  const load = async (d = days) => {
    setLoading(true);
    setErr(null);
    try {
      const { data: res, error } = await supabase.functions.invoke<Payload>("site-analytics", {
        body: { days: d },
      });
      if (error) throw new Error(error.message);
      if (res?.error) throw new Error(res.error);
      setData(res as Payload);
    } catch (e) {
      setErr((e as Error).message || "Could not load visitor data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(days);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  const pages = (data?.pages || []).filter((p) =>
    filter === "blog" ? p.path.startsWith("/blog") : filter === "tools" ? !p.path.startsWith("/blog") : true,
  );

  const card = (label: string, value: string, sub?: string) => (
    <div className="bg-surface-container-highest rounded-xl p-5">
      <p className="text-xs font-label uppercase tracking-widest text-on-surface-variant">{label}</p>
      <p className="text-3xl font-headline font-black mt-2">{value}</p>
      {sub && <p className="text-xs text-on-surface-variant/70 mt-1">{sub}</p>}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-headline font-bold">Visitors &amp; Engagement</h2>
          <p className="text-on-surface-variant text-sm">
            Real visits and reading time per page — including traffic that never came from a search keyword.
            Cookie-free, no IP stored.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-2 rounded-lg text-xs font-bold ${days === d ? "bg-primary text-on-primary" : "bg-surface-container-highest text-on-surface-variant"}`}
            >
              {d}d
            </button>
          ))}
          <button
            onClick={() => load()}
            disabled={loading}
            className="bg-surface-container-highest px-3 py-2 rounded-lg text-xs font-bold disabled:opacity-50"
          >
            {loading ? "Loading…" : "Refresh"}
          </button>
        </div>
      </div>

      {err && <div className="bg-error/10 text-error rounded-xl p-4 text-sm">{err}</div>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {card("Page views", fmt(data?.totals.views ?? 0))}
        {card("Unique sessions", fmt(data?.totals.visitors ?? 0))}
        {card("Avg. time on page", mmss(data?.totals.avgDwellSec ?? 0))}
        {card("Bounce rate", `${data?.totals.bounceRate ?? 0}%`, "under 15s on page")}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-surface-container rounded-xl p-5">
          <h3 className="font-headline font-bold mb-3">Where visitors come from</h3>
          {Object.keys(data?.sources || {}).length === 0 ? (
            <p className="text-sm text-on-surface-variant">No data yet — collection starts after the next deploy.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {Object.entries(data!.sources)
                .sort((a, b) => b[1] - a[1])
                .map(([k, v]) => (
                  <li key={k} className="flex justify-between">
                    <span className="text-on-surface-variant">{k.replace(/_/g, " ")}</span>
                    <span className="font-bold">{fmt(v)}</span>
                  </li>
                ))}
            </ul>
          )}
        </div>
        <div className="bg-surface-container rounded-xl p-5">
          <h3 className="font-headline font-bold mb-3">Devices</h3>
          <ul className="space-y-2 text-sm">
            {Object.entries(data?.devices || {}).map(([k, v]) => (
              <li key={k} className="flex justify-between">
                <span className="text-on-surface-variant">{k}</span>
                <span className="font-bold">{fmt(v)}</span>
              </li>
            ))}
            {Object.keys(data?.devices || {}).length === 0 && (
              <li className="text-on-surface-variant">No data yet.</li>
            )}
          </ul>
        </div>
      </div>

      <div className="bg-surface-container rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-outline-variant/15 flex items-center justify-between gap-3 flex-wrap">
          <h3 className="font-headline font-bold">Pages by engagement</h3>
          <div className="flex gap-2">
            {(["all", "blog", "tools"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest ${filter === f ? "bg-primary/15 text-primary" : "text-on-surface-variant"}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant/15 text-xs uppercase tracking-widest text-on-surface-variant">
                <th className="text-left px-4 py-3">Page</th>
                <th className="text-right px-4 py-3">Views</th>
                <th className="text-right px-4 py-3">Sessions</th>
                <th className="text-right px-4 py-3">Avg. time</th>
                <th className="text-right px-4 py-3">Bounce</th>
                <th className="text-right px-4 py-3">Organic</th>
                <th className="text-right px-4 py-3">Other</th>
              </tr>
            </thead>
            <tbody>
              {[...pages]
                .sort((a, b) => b.avgDwellSec * b.views - a.avgDwellSec * a.views)
                .map((p) => (
                  <tr key={p.path} className="border-b border-outline-variant/10">
                    <td className="px-4 py-2 truncate max-w-[300px] font-mono text-xs">{p.path}</td>
                    <td className="px-4 py-2 text-right font-bold">{fmt(p.views)}</td>
                    <td className="px-4 py-2 text-right">{fmt(p.visitors)}</td>
                    <td className="px-4 py-2 text-right">{mmss(p.avgDwellSec)}</td>
                    <td className="px-4 py-2 text-right">{p.bounceRate}%</td>
                    <td className="px-4 py-2 text-right">{fmt(p.organic)}</td>
                    <td className="px-4 py-2 text-right">{fmt(p.social + p.referral + p.direct)}</td>
                  </tr>
                ))}
              {pages.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-on-surface-variant">
                    No visits recorded yet for this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VisitorAnalyticsDashboard;
