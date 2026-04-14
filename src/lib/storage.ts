import { supabase } from "@/integrations/supabase/client";

/**
 * Upload a processed file to Supabase storage.
 * Returns a public URL for downloading.
 */
export async function uploadProcessedFile(
  blob: Blob,
  fileName: string
): Promise<string> {
  const uniqueName = `${Date.now()}_${Math.random().toString(36).slice(2)}_${fileName}`;

  const { error } = await supabase.storage
    .from("processed-files")
    .upload(uniqueName, blob, {
      contentType: blob.type || "application/octet-stream",
      upsert: false,
    });

  if (error) {
    console.error("Upload failed:", error);
    throw new Error("Failed to upload processed file");
  }

  const { data: urlData } = supabase.storage
    .from("processed-files")
    .getPublicUrl(uniqueName);

  return urlData.publicUrl;
}

/**
 * Delete a file from storage by its public URL.
 */
export async function deleteProcessedFile(publicUrl: string): Promise<void> {
  try {
    const url = new URL(publicUrl);
    const pathParts = url.pathname.split("/processed-files/");
    if (pathParts.length < 2) return;
    const filePath = decodeURIComponent(pathParts[1]);

    await supabase.storage.from("processed-files").remove([filePath]);
  } catch (err) {
    console.error("Delete failed:", err);
  }
}
