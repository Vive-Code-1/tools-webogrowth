// Browser-side image conversion utilities.
// Supports format conversion and target-size (KB) compression via quality binary search + optional downscale.

export type ImageFormat = "image/webp" | "image/png" | "image/jpeg";

export const formatExtension = (fmt: ImageFormat): string =>
  fmt === "image/webp" ? "webp" : fmt === "image/png" ? "png" : "jpg";

const loadImage = (file: File): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });

const drawToCanvas = (
  img: HTMLImageElement,
  scale = 1,
): HTMLCanvasElement => {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas;
};

const canvasToBlob = (
  canvas: HTMLCanvasElement,
  type: string,
  quality?: number,
): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
      type,
      quality,
    );
  });

export async function convertImage(
  file: File,
  opts: { format: ImageFormat; quality: number },
): Promise<Blob> {
  const img = await loadImage(file);
  const canvas = drawToCanvas(img);
  return canvasToBlob(canvas, opts.format, opts.quality / 100);
}

export interface TargetSizeResult {
  blob: Blob;
  reachedTarget: boolean;
  quality: number;
  scale: number;
  format: ImageFormat;
}

/**
 * Compress an image to stay under targetKB.
 * Uses quality binary-search; if minimum quality still exceeds target, downscales canvas.
 * PNG is lossless — auto-falls back to JPEG for target-size mode.
 */
export async function convertImageToTargetSize(
  file: File,
  opts: { format: ImageFormat; targetKB: number },
): Promise<TargetSizeResult> {
  // PNG can't be lossy-compressed via canvas. Fall back to JPEG.
  const effectiveFormat: ImageFormat =
    opts.format === "image/png" ? "image/jpeg" : opts.format;
  const targetBytes = opts.targetKB * 1024;
  const img = await loadImage(file);

  let scale = 1;
  let best: { blob: Blob; quality: number } | null = null;

  for (let attempt = 0; attempt < 5; attempt++) {
    const canvas = drawToCanvas(img, scale);
    let lo = 0.1;
    let hi = 0.95;
    let localBest: { blob: Blob; quality: number } | null = null;
    let underTarget: { blob: Blob; quality: number } | null = null;

    for (let i = 0; i < 8; i++) {
      const mid = (lo + hi) / 2;
      const blob = await canvasToBlob(canvas, effectiveFormat, mid);
      if (!localBest || Math.abs(blob.size - targetBytes) < Math.abs(localBest.blob.size - targetBytes)) {
        localBest = { blob, quality: mid };
      }
      if (blob.size <= targetBytes) {
        underTarget = { blob, quality: mid };
        lo = mid;
      } else {
        hi = mid;
      }
    }

    if (underTarget) {
      return {
        blob: underTarget.blob,
        reachedTarget: true,
        quality: Math.round(underTarget.quality * 100),
        scale,
        format: effectiveFormat,
      };
    }
    // try lowest quality with this scale
    const lowest = await canvasToBlob(canvas, effectiveFormat, 0.1);
    if (lowest.size <= targetBytes) {
      return {
        blob: lowest,
        reachedTarget: true,
        quality: 10,
        scale,
        format: effectiveFormat,
      };
    }
    if (!best || lowest.size < best.blob.size) best = { blob: lowest, quality: 0.1 };
    // downscale and retry
    scale *= 0.8;
    if (scale < 0.2) break;
  }

  return {
    blob: best!.blob,
    reachedTarget: false,
    quality: Math.round(best!.quality * 100),
    scale,
    format: effectiveFormat,
  };
}
