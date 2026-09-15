import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";
const FROM = "WeboGrowth Tools <onboarding@resend.dev>";
const RESEND_ACCOUNT_EMAIL = "aabeg01@gmail.com";

/**
 * Send only through the Resend connection linked to this project. The
 * onboarding sender is intentionally restricted to the Resend account email.
 */
async function sendEmail(payload: Record<string, unknown>) {
  const gatewayKey = Deno.env.get("RESEND_API_KEY_1");
  const lovableKey = Deno.env.get("LOVABLE_API_KEY");

  if (!gatewayKey || !lovableKey) {
    return { ok: false, status: 500, data: { message: "Resend connection is not configured" } };
  }

  try {
    const res = await fetch(`${GATEWAY_URL}/emails`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": gatewayKey,
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) return { ok: true, status: res.status, data };
    console.error("Resend send failed", res.status, JSON.stringify(data));
    return { ok: false, status: res.status, data };
  } catch (error) {
    console.error("Resend request error", String(error));
    return { ok: false, status: 502, data: { message: "Unable to reach Resend" } };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { name, email, service, message, type } = await req.json();

    // Never trust a browser-provided recipient. Resend's test sender can only
    // deliver to the connected account owner's verified inbox.
    const recipientEmail = RESEND_ACCOUNT_EMAIL;

    // Newsletter signup
    if (type === "newsletter") {
      if (!email?.trim()) {
        return new Response(JSON.stringify({ error: "Email is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const out = await sendEmail({
        from: FROM,
        to: [recipientEmail],
        subject: `New Newsletter Signup: ${email.trim()}`,
        html: `
          <h2>New Newsletter Subscription</h2>
          <p><strong>Email:</strong> ${email.trim()}</p>
          <p>This user wants to receive updates from WeboGrowth Tools.</p>
        `,
      });

      if (!out.ok) {
        return new Response(JSON.stringify({ error: out.data?.message || "Failed to send" }), {
          status: out.status,
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

    const escape = (s: string) =>
      String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    const out = await sendEmail({
      from: FROM,
      to: [recipientEmail],
      subject: `Contact from ${name.trim()} - ${service || "General"}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${escape(name)}</p>
        <p><strong>Email:</strong> ${escape(email)}</p>
        <p><strong>Service:</strong> ${escape(service || "N/A")}</p>
        <hr/>
        <p><strong>Message:</strong></p>
        <p>${escape(message).replace(/\n/g, "<br/>")}</p>
      `,
      text: `New contact form submission\n\nName: ${name.trim()}\nEmail: ${email.trim()}\nService: ${service || "N/A"}\n\nMessage:\n${message.trim()}`,
      reply_to: email,
    });

    if (!out.ok) {
      return new Response(JSON.stringify({ error: out.data?.message || "Failed to send email" }), {
        status: out.status,
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
