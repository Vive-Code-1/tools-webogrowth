const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";
const DIRECT_URL = "https://api.resend.com";
const FROM = "WeboGrowth Tools <onboarding@resend.dev>";
const FALLBACK_TO = "rafikuzzaman10@gmail.com";

/**
 * Send via Resend. Prefers the user's own RESEND_API_KEY (direct API);
 * falls back to the Lovable connector gateway key.
 */
async function sendEmail(payload: Record<string, unknown>) {
  const directKey = Deno.env.get("RESEND_API_KEY");
  const gatewayKey = Deno.env.get("RESEND_API_KEY_1");
  const lovableKey = Deno.env.get("LOVABLE_API_KEY");

  const attempts: { url: string; headers: Record<string, string> }[] = [];
  if (directKey) {
    attempts.push({
      url: `${DIRECT_URL}/emails`,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${directKey}` },
    });
  }
  if (gatewayKey && lovableKey) {
    attempts.push({
      url: `${GATEWAY_URL}/emails`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": gatewayKey,
      },
    });
  }

  if (!attempts.length) {
    return { ok: false, status: 500, data: { message: "No Resend API key configured" } };
  }

  let last = { ok: false, status: 500, data: { message: "Unknown error" } as Record<string, unknown> };
  for (const a of attempts) {
    try {
      const res = await fetch(a.url, { method: "POST", headers: a.headers, body: JSON.stringify(payload) });
      const data = await res.json().catch(() => ({}));
      if (res.ok) return { ok: true, status: res.status, data };
      console.error("Resend send failed", a.url, res.status, JSON.stringify(data));
      last = { ok: false, status: res.status, data };
    } catch (e) {
      console.error("Resend request error", a.url, String(e));
      last = { ok: false, status: 502, data: { message: String(e) } };
    }
  }
  return last;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY_1");
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { name, email, service, message, toEmail, type } = await req.json();

    const recipientEmail = toEmail || "rafikuzzaman10@gmail.com";

    // Newsletter signup
    if (type === "newsletter") {
      if (!email?.trim()) {
        return new Response(JSON.stringify({ error: "Email is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const res = await fetch(`${GATEWAY_URL}/emails`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${LOVABLE_API_KEY}`,
          "X-Connection-Api-Key": RESEND_API_KEY,
        },
        body: JSON.stringify({
          from: "WeboGrowth Tools <onboarding@resend.dev>",
          to: [recipientEmail],
          subject: `New Newsletter Signup: ${email.trim()}`,
          html: `
            <h2>New Newsletter Subscription</h2>
            <p><strong>Email:</strong> ${email.trim()}</p>
            <p>This user wants to receive updates from WeboGrowth Tools.</p>
          `,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error("Resend API error:", JSON.stringify(data));
        return new Response(JSON.stringify({ error: data.message || "Failed to send" }), {
          status: res.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Contact form
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return new Response(JSON.stringify({ error: "Name, email, and message are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: "Invalid email address" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const res = await fetch(`${GATEWAY_URL}/emails`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": RESEND_API_KEY,
      },
      body: JSON.stringify({
        from: "WeboGrowth Tools <onboarding@resend.dev>",
        to: [recipientEmail],
        subject: `Contact from ${name.trim()} - ${service || "General"}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Service:</strong> ${service || "N/A"}</p>
          <hr/>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, "<br/>")}</p>
        `,
        reply_to: email,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Resend API error:", JSON.stringify(data));
      return new Response(JSON.stringify({ error: data.message || "Failed to send email" }), {
        status: res.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
