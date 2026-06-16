import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Optional body: { path?: string | string[] } to delete specific files immediately.
    let targeted: string[] | null = null;
    if (req.method === "POST") {
      try {
        const body = await req.json();
        if (body?.path) {
          targeted = Array.isArray(body.path) ? body.path : [String(body.path)];
        }
      } catch {
        /* ignore – no body */
      }
    }

    if (targeted && targeted.length) {
      const { error } = await supabase.storage
        .from("processed-files")
        .remove(targeted);
      if (error) throw error;
      return new Response(
        JSON.stringify({ message: "Deleted targeted files", deleted: targeted.length, files: targeted }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Fallback: sweep anything older than 5 minutes.
    const { data: files, error: listError } = await supabase.storage
      .from("processed-files")
      .list("", { limit: 1000 });
    if (listError) throw listError;

    if (!files?.length) {
      return new Response(JSON.stringify({ message: "No files", deleted: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const cutoff = new Date(Date.now() - 5 * 60 * 1000);
    const expired = files
      .filter((f) => f.created_at && new Date(f.created_at) < cutoff)
      .map((f) => f.name);

    if (!expired.length) {
      return new Response(JSON.stringify({ message: "No expired files", deleted: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error: deleteError } = await supabase.storage
      .from("processed-files")
      .remove(expired);
    if (deleteError) throw deleteError;

    return new Response(
      JSON.stringify({ message: `Deleted ${expired.length} expired files`, deleted: expired.length, files: expired }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
