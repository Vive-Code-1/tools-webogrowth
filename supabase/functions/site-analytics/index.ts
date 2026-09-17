import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

interface Row {
  path: string;
  referrer_source: string;
  device: string;
  dwell_ms: number;
  is_bounce: boolean;
  session_id: string | null;
  created_at: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const url = Deno.env.get("SUPABASE_URL");
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !key) return json({ error: "Backend not configured" }, 500);

    const body = await req.json().catch(() => ({}));
    const days = Math.min(Math.max(Number(body.days) || 30, 1), 365);
    const since = new Date(Date.now() - days * 86_400_000).toISOString();

    const supabase = createClient(url, key);
    const { data, error } = await supabase
      .from("page_views")
      .select("path, referrer_source, device, dwell_ms, is_bounce, session_id, created_at")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(50_000);

    if (error) {
      console.error("page_views read failed:", error.message);
      return json({ error: error.message }, 500);
    }

    const rows = (data || []) as Row[];

    const pages = new Map<
      string,
      { path: string; views: number; totalDwell: number; bounces: number; sessions: Set<string>; sources: Record<string, number> }
    >();
    const sources: Record<string, number> = {};
    const devices: Record<string, number> = {};
    const daily = new Map<string, number>();

    for (const r of rows) {
      const p = pages.get(r.path) || {
        path: r.path,
        views: 0,
        totalDwell: 0,
        bounces: 0,
        sessions: new Set<string>(),
        sources: {},
      };
      p.views += 1;
      p.totalDwell += r.dwell_ms || 0;
      if (r.is_bounce) p.bounces += 1;
      if (r.session_id) p.sessions.add(r.session_id);
      p.sources[r.referrer_source] = (p.sources[r.referrer_source] || 0) + 1;
      pages.set(r.path, p);

      sources[r.referrer_source] = (sources[r.referrer_source] || 0) + 1;
      devices[r.device] = (devices[r.device] || 0) + 1;
      const day = r.created_at.slice(0, 10);
      daily.set(day, (daily.get(day) || 0) + 1);
    }

    const pageList = [...pages.values()]
      .map((p) => ({
        path: p.path,
        views: p.views,
        visitors: p.sessions.size,
        avgDwellSec: Math.round(p.totalDwell / Math.max(1, p.views) / 1000),
        bounceRate: Math.round((p.bounces / Math.max(1, p.views)) * 100),
        organic: p.sources["organic_search"] || 0,
        social: p.sources["social"] || 0,
        referral: p.sources["referral"] || 0,
        direct: p.sources["direct"] || 0,
      }))
      .sort((a, b) => b.views - a.views);

    const totalViews = rows.length;
    const totalVisitors = new Set(rows.map((r) => r.session_id).filter(Boolean)).size;
    const avgDwellSec = Math.round(
      rows.reduce((a, r) => a + (r.dwell_ms || 0), 0) / Math.max(1, totalViews) / 1000,
    );

    return json({
      days,
      totals: {
        views: totalViews,
        visitors: totalVisitors,
        avgDwellSec,
        bounceRate: Math.round((rows.filter((r) => r.is_bounce).length / Math.max(1, totalViews)) * 100),
      },
      sources,
      devices,
      daily: [...daily.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([day, views]) => ({ day, views })),
      pages: pageList.slice(0, 200),
    });
  } catch (e) {
    console.error("site-analytics failed:", (e as Error).message);
    return json({ error: (e as Error).message }, 500);
  }
});
