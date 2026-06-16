import { supabase } from "@/integrations/supabase/client";

const BUCKET = "processed-files";

export interface RemoteFile {
  url: string;
  path: string;
}

/**
 * Upload a blob to Supabase storage and return the public URL + path.
 * Falls back to throwing — caller can catch and use a blob URL instead.
 */
export async function uploadToStorage(
  blob: Blob,
  fileName: string,
): Promise<RemoteFile> {
  const safe = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}-${safe}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, { contentType: blob.type || "application/octet-stream", upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, path };
}

/**
 * Ask the server to delete the file immediately. Server cleanup also runs
 * as a sweep, so this is best-effort.
 */
export async function deleteFromStorage(path: string): Promise<void> {
  try {
    await supabase.functions.invoke("cleanup-expired-files", {
      body: { path },
    });
  } catch (e) {
    console.warn("Storage cleanup failed:", e);
  }
}
