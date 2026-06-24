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

    return json({ error: "Unknown action" }, 400);
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
