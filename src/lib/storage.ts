/**
 * Create a local blob URL for downloading a processed file.
 * Processing happens entirely in the browser — no upload needed.
 */
export async function uploadProcessedFile(
  blob: Blob,
  _fileName: string
): Promise<string> {
  return URL.createObjectURL(blob);
}

/**
 * Revoke a previously created blob URL to free memory.
 */
export async function deleteProcessedFile(blobUrl: string): Promise<void> {
  try {
    if (blobUrl.startsWith("blob:")) {
      URL.revokeObjectURL(blobUrl);
    }
  } catch (err) {
    console.error("Revoke failed:", err);
  }
}
