const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GATEWAY = "https://connector-gateway.lovable.dev/google_search_console";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function gscFetch(
  path: string,
  apiKey: string,
  lovableKey: string,
  init: RequestInit = {},
) {
  const res = await fetch(`${GATEWAY}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": apiKey,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  let data: unknown = text;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    /* keep text */
  }
  return { ok: res.ok, status: res.status, data };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const GSC_KEY = Deno.env.get("GOOGLE_SEARCH_CONSOLE_API_KEY");
    if (!LOVABLE_API_KEY || !GSC_KEY) {
      return json(
        { error: "Google Search Console connector not configured" },
        500,
      );
    }

    const body = await req.json().catch(() => ({}));
    const action = body.action as string;

    if (action === "list_sites") {
      const r = await gscFetch("/webmasters/v3/sites", GSC_KEY, LOVABLE_API_KEY);
      return json(r.data, r.status);
    }

    if (action === "add_site") {
      const siteUrl = String(body.siteUrl || "").trim();
      if (!siteUrl) return json({ error: "siteUrl required" }, 400);
      const r = await gscFetch(
        `/webmasters/v3/sites/${encodeURIComponent(siteUrl)}`,
        GSC_KEY,
        LOVABLE_API_KEY,
        { method: "PUT" },
      );
      return json(r.ok ? { success: true } : r.data, r.status);
    }

    if (action === "get_verification_token") {
      const identifier = String(body.identifier || "").trim();
      if (!identifier) return json({ error: "identifier required" }, 400);
      const r = await gscFetch(
        "/siteVerification/v1/token",
        GSC_KEY,
        LOVABLE_API_KEY,
        {
          method: "POST",
          body: JSON.stringify({
            site: { identifier, type: "SITE" },
            verificationMethod: "META",
          }),
        },
      );
      return json(r.data, r.status);
    }

    if (action === "verify_site") {
      const identifier = String(body.identifier || "").trim();
      if (!identifier) return json({ error: "identifier required" }, 400);
      const r = await gscFetch(
        "/siteVerification/v1/webResource?verificationMethod=META",
        GSC_KEY,
        LOVABLE_API_KEY,
        {
          method: "POST",
          body: JSON.stringify({ site: { identifier, type: "SITE" } }),
        },
      );
      return json(r.data, r.status);
    }

    if (action === "list_sitemaps") {
      const siteUrl = String(body.siteUrl || "").trim();
      if (!siteUrl) return json({ error: "siteUrl required" }, 400);
      const r = await gscFetch(
        `/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/sitemaps`,
        GSC_KEY,
        LOVABLE_API_KEY,
      );
      return json(r.data, r.status);
    }

    if (action === "submit_sitemap") {
      const siteUrl = String(body.siteUrl || "").trim();
      const feedpath = String(body.feedpath || "").trim();
      if (!siteUrl || !feedpath) {
        return json({ error: "siteUrl and feedpath required" }, 400);
      }
      const r = await gscFetch(
        `/webmasters/v3/sites/${encodeURIComponent(
          siteUrl,
        )}/sitemaps/${encodeURIComponent(feedpath)}`,
        GSC_KEY,
        LOVABLE_API_KEY,
        { method: "PUT" },
      );
      return json(r.ok ? { success: true } : r.data, r.status);
    }

    if (action === "query_search_analytics") {
      const siteUrl = String(body.siteUrl || "").trim();
      if (!siteUrl) return json({ error: "siteUrl required" }, 400);
      const today = new Date();
      const iso = (d: Date) => d.toISOString().slice(0, 10);
      const days = Number(body.days) || 90;
      const end = iso(new Date(today.getTime() - 2 * 86400_000)); // GSC has ~2-day lag
      const start = iso(new Date(today.getTime() - (days + 2) * 86400_000));
      const payload = {
        startDate: body.startDate || start,
        endDate: body.endDate || end,
        dimensions: body.dimensions || ["query", "page"],
        rowLimit: Math.min(Number(body.rowLimit) || 1000, 25000),
        dataState: "all",
      };
      const r = await gscFetch(
        `/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
        GSC_KEY,
        LOVABLE_API_KEY,
        { method: "POST", body: JSON.stringify(payload) },
      );
      return json(r.data, r.status);
    }

    if (action === "inspect_urls") {
      const siteUrl = String(body.siteUrl || "").trim();
      const urls: string[] = Array.isArray(body.urls) ? body.urls.slice(0, 40) : [];
      if (!siteUrl || urls.length === 0) {
        return json({ error: "siteUrl and urls[] required" }, 400);
      }

      const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
      const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

      const results: Record<string, unknown>[] = [];
      for (const inspectionUrl of urls) {
        const r = await gscFetch(
          "/v1/urlInspection/index:inspect",
          GSC_KEY,
          LOVABLE_API_KEY,
          {
            method: "POST",
            body: JSON.stringify({ inspectionUrl, siteUrl }),
          },
        );
        if (!r.ok) {
          results.push({ url: inspectionUrl, error: true, status: r.status, detail: r.data });
          // Quota / permission errors will repeat for every URL — stop early.
          if (r.status === 403 || r.status === 429) break;
          continue;
        }
        const idx = (r.data as any)?.inspectionResult?.indexStatusResult || {};
        results.push({
          url: inspectionUrl,
          verdict: idx.verdict ?? null,
          coverageState: idx.coverageState ?? null,
          robotsTxtState: idx.robotsTxtState ?? null,
          googleCanonical: idx.googleCanonical ?? null,
          userCanonical: idx.userCanonical ?? null,
          lastCrawlTime: idx.lastCrawlTime ?? null,
        });
      }

      // Cache successful checks so the dashboard keeps history between runs.
      if (SUPABASE_URL && SERVICE_KEY) {
        const rows = results
          .filter((x) => !x.error)
          .map((x) => ({
            url: x.url,
            verdict: x.verdict,
            coverage_state: x.coverageState,
            robots_state: x.robotsTxtState,
            google_canonical: x.googleCanonical,
            user_canonical: x.userCanonical,
            last_crawl_time: x.lastCrawlTime,
            checked_at: new Date().toISOString(),
          }));
        if (rows.length) {
          const up = await fetch(`${SUPABASE_URL}/rest/v1/url_index_status?on_conflict=url`, {
            method: "POST",
            headers: {
              apikey: SERVICE_KEY,
              Authorization: `Bearer ${SERVICE_KEY}`,
              "Content-Type": "application/json",
              Prefer: "resolution=merge-duplicates,return=minimal",
            },
            body: JSON.stringify(rows),
          });
          if (!up.ok) console.error("index status cache failed:", up.status, await up.text());
        }
      }

      return json({ results });
    }

    if (action === "cached_index_status") {
      const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
      const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      if (!SUPABASE_URL || !SERVICE_KEY) return json({ rows: [] });
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/url_index_status?select=*&order=checked_at.desc&limit=1000`,
        { headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` } },
      );
      if (!res.ok) {
        const t = await res.text();
        console.error("cached index status read failed:", res.status, t);
        return json({ error: t }, res.status);
      }
      return json({ rows: await res.json() });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
