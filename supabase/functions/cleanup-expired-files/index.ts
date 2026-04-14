import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // List all files in the processed-files bucket
    const { data: files, error: listError } = await supabase.storage
      .from("processed-files")
      .list("", { limit: 1000 });

    if (listError) {
      throw listError;
    }

    if (!files || files.length === 0) {
      return new Response(
        JSON.stringify({ message: "No files to clean up", deleted: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    const expiredFiles: string[] = [];

    for (const file of files) {
      if (file.created_at) {
        const createdAt = new Date(file.created_at);
        if (createdAt < fiveMinutesAgo) {
          expiredFiles.push(file.name);
        }
      }
    }

    if (expiredFiles.length === 0) {
      return new Response(
        JSON.stringify({ message: "No expired files", deleted: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { error: deleteError } = await supabase.storage
      .from("processed-files")
      .remove(expiredFiles);

    if (deleteError) {
      throw deleteError;
    }

    return new Response(
      JSON.stringify({
        message: `Deleted ${expiredFiles.length} expired files`,
        deleted: expiredFiles.length,
        files: expiredFiles,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
