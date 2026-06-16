# Format Converter — Bulk + Target Size (KB) + ZIP Download

## কী যোগ হবে

1. **Bulk image upload** — একসাথে অনেক ইমেজ (drag-drop + browse multiple)।
2. **Limit file size (KB)** — optional checkbox + number input। প্রতিটি ইমেজ ওই target KB-এর নিচে নামানো হবে (binary-search quality compression)।
3. **ZIP download** — সব converted ইমেজ একটা `converted-images.zip`-এ একসাথে ডাউনলোড। একটা ইমেজ হলে সরাসরি সেটাই দেবে (optional)।
4. **Per-file progress list** — নাম, original size, converted size, status (queued/converting/done/failed)।

## UI পরিবর্তন (`src/pages/Converter.tsx`)

- বাঁদিকের DropZone-এ multiple file select।
- নিচে selected files list (thumbnail + size + remove)।
- ডানদিকের Conversion Options panel-এ নতুন সেকশন:
  - ☑ **Limit file size** (checkbox)
  - Input: `Target size` + unit dropdown `KB` (locked to KB এখন)
  - Helper text: "Each image will be compressed to stay under this size."
- "Convert" button → "Convert All (N)"।
- Result অংশে: "Download ZIP" button (সব done হলে enable)।

## নতুন/আপডেট ফাইল

- **Update** `src/components/DropZone.tsx` — `multiple?: boolean` prop, `onFilesSelect?: (files: File[]) => void`। existing `onFileSelect` ব্যাকওয়ার্ড-কম্প্যাটিবল থাকবে।
- **New** `src/lib/imageConvert.ts` — utility:
  - `convertImage(file, { format, quality }) → Blob`
  - `convertImageToTargetSize(file, { format, targetKB, minQuality=10, maxQuality=95 }) → Blob` (binary search on quality; PNG হলে JPEG/WebP-তে fallback সাজেস্ট, কারণ PNG lossless-এ KB target ঠিক হয় না — UI-তে warning দেখাবে)
- **Update** `src/pages/Converter.tsx` — bulk state (`files`, `items[]` with status), target-size state, ZIP builder।
- **Dep add**: `jszip` (ZIP তৈরির জন্য)।

## টার্গেট-সাইজ অ্যালগো (KB)

JPEG/WebP-এর জন্য:
```
lo=0.1, hi=0.95
repeat ~7 বার:
  mid = (lo+hi)/2
  blob = canvas.toBlob(format, mid)
  if blob.size <= targetKB*1024: best=blob; lo=mid
  else: hi=mid
```
যদি সবচেয়ে কম quality-তেও target মিস হয় → canvas resize (0.9x করে কয়েকবার) করে রিট্রাই। শেষমেশ closest blob রিটার্ন + UI-তে "couldn't reach target" badge।

PNG target মোডে অটো-fallback: `image/jpeg` ব্যবহার করবে (UI-তে নোটিস)।

## ডাউনলোড ফ্লো

- Convert শেষ হলে blobs মেমরিতে রাখা হবে (Supabase upload skip বাল্ক মোডে — ক্লায়েন্ট-সাইড ZIP)।
- JSZip দিয়ে blob bundle → `URL.createObjectURL` → auto-trigger `<a download>`।
- Single file mode: existing `CountdownDownload` flow ঠিক থাকবে।

## SEO/Copy

হেডার অপরিবর্তিত। DropZone sublabel: "Supports PNG, JPEG, WebP, GIF — bulk upload up to 50MB each"।

## আউট-অফ-স্কোপ

- "KB" ছাড়া অন্য unit (MB) — পরে যোগ করা যাবে।
- Server-side conversion — পুরোটাই browser-side থাকছে।
