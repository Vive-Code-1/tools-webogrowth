## Plan: Fix Compressor, Converter & SVG Optimizer download issues

### Root cause
All three tools (Compressor, Format Converter, SVG Optimizer) call `uploadProcessedFile()` in `src/lib/storage.ts`, which uploads the processed file to a Supabase Storage bucket called `processed-files`. That upload fails with `StorageUnknownError: Failed to fetch` (visible in console logs), so `result` never gets set and the `CountdownDownload` button never renders.

The bucket either doesn't exist or isn't publicly writable from the browser. More importantly, **there's no reason to upload at all** — every conversion/compression already happens 100% in the browser via `<canvas>`. Round-tripping the file through Supabase only adds latency, cost, and a failure point.

### Fix
Make all processed files download directly from the browser using a local blob URL. No backend involved.

### Changes

1. **`src/lib/storage.ts`** — Replace `uploadProcessedFile` with a synchronous wrapper that returns `URL.createObjectURL(blob)`. Replace `deleteProcessedFile` with `URL.revokeObjectURL`. Keep the same function signatures so callers don't change.

2. **`src/components/CountdownDownload.tsx`** — Update the cleanup branch: instead of checking `downloadUrl.includes("supabase")`, call `URL.revokeObjectURL(downloadUrl)` for any `blob:` URL on expiry. The download handler already works for blob URLs (the `fetch(blobUrl)` path works, but we can simplify to set `<a href>` directly).

3. No changes needed in `Compressor.tsx`, `Converter.tsx`, `SvgOptimizer.tsx` — they keep calling `uploadProcessedFile()` and consuming the returned URL exactly as before.

### Result
- Compress / Convert / SVG Optimize all work instantly with no network call
- Download button appears immediately after processing
- 5-minute countdown still applies; on expiry the blob URL is revoked to free memory
- No Supabase Storage configuration required
