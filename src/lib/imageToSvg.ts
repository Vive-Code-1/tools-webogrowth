import ImageTracer from "imagetracerjs";
import {
  type RGB,
  sampleImageData,
  medianCut,
  extractSvgFillColors,
} from "./palette";

export type ColorMode = "color" | "grayscale" | "bw";
export type QualityPreset = "icon" | "detailed" | "logo";

export interface TraceOptions {
  size: number; // target viewBox/output px
  colorMode: ColorMode;
  preset: QualityPreset;
  colorCount: number | "auto"; // 2-64 or "auto" to detect from image
  smoothing: number; // 0 - 5 (path simplification tolerance)
  background: "transparent" | "white" | string; // hex
  /** Manual palette (color mode only). When set, this exact set is used. */
  palette?: RGB[];
  /**
   * Lock colors to the resolved palette via colorsampling:0.
   * Prevents imagetracerjs from re-quantizing and shifting hues.
   */
  lockColors?: boolean;
}

// Estimate distinct dominant colors in image data by quantizing each
// channel to 5 bits and counting unique buckets (ignoring transparent pixels).
// Returns a value clamped to [4, 64] suitable for imagetracerjs numberofcolors.
function estimateColorCount(data: ImageData): number {
  const px = data.data;
  const buckets = new Set<number>();
  const step = Math.max(4, Math.floor((px.length / 4) / 4000)) * 4; // sample ~4k pixels
  for (let i = 0; i < px.length; i += step) {
    const a = px[i + 3];
    if (a < 16) continue;
    const r = px[i] >> 3;
    const g = px[i + 1] >> 3;
    const b = px[i + 2] >> 3;
    buckets.add((r << 10) | (g << 5) | b);
    if (buckets.size >= 64) break;
  }
  return Math.max(4, Math.min(64, buckets.size || 8));
}

export interface TraceResult {
  svg: string;
  size: number; // bytes
  pathCount: number;
  width: number;
  height: number;
  /** Palette actually used during tracing. */
  usedPalette: RGB[];
  /** Avg luminance (0-255) of visible source pixels. */
  sourceLuminance: number;
}

const loadImage = (file: File): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
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

const presetOpts = (preset: QualityPreset) => {
  switch (preset) {
    case "icon":
      return { ltres: 1, qtres: 1, pathomit: 12, rightangleenhance: true };
    case "detailed":
      return { ltres: 0.5, qtres: 0.5, pathomit: 4, rightangleenhance: false };
    case "logo":
      return { ltres: 1, qtres: 1, pathomit: 8, rightangleenhance: true };
  }
};

const countPaths = (svg: string) => (svg.match(/<path\b/g) || []).length;

function optimizeSvg(svg: string, size: number, background: string): string {
  // Strip XML processing instruction and clamp to standard icon viewBox
  let out = svg
    .replace(/<\?xml[^>]*\?>/g, "")
    .replace(/\s+xmlns:xlink="[^"]*"/g, "")
    .replace(/\s+desc="[^"]*"/g, "")
    .trim();

  // Ensure xmlns + viewBox normalized to 0 0 size size
  const wMatch = out.match(/width="([^"]+)"/);
  const hMatch = out.match(/height="([^"]+)"/);
  const w = wMatch ? parseFloat(wMatch[1]) : size;
  const h = hMatch ? parseFloat(hMatch[1]) : size;

  out = out.replace(
    /<svg[^>]*>/,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${size}" height="${size}">`,
  );

  if (background && background !== "transparent") {
    out = out.replace(
      /(<svg[^>]*>)/,
      `$1<rect width="${w}" height="${h}" fill="${background}"/>`,
    );
  }

  return out;
}

export async function traceToSvg(file: File, opts: TraceOptions): Promise<TraceResult> {
  const img = await loadImage(file);

  // Downscale source to target size for performance + cleaner trace
  const maxSource = Math.max(opts.size * 4, 256); // trace at higher res, output scaled
  const scale = Math.min(1, maxSource / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, w, h);
  const imageData = ctx.getImageData(0, 0, w, h);

  const preset = presetOpts(opts.preset);

  // Dense sample of visible pixels — used both for palette extraction and
  // luminance metrics (for the brightness-shift validator on the caller).
  const samples = sampleImageData(imageData, 20000);
  const sourceLuminance = samples.length
    ? samples.reduce((s, c) => s + (0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b), 0) / samples.length
    : 0;

  // Decide palette + numberofcolors based on color mode.
  let palette: RGB[] = [];
  let useLockedPalette = false;

  if (opts.colorMode === "bw") {
    palette = [
      { r: 0, g: 0, b: 0 },
      { r: 255, g: 255, b: 255 },
    ];
    useLockedPalette = true;
  } else if (opts.colorMode === "grayscale") {
    const n =
      opts.colorCount === "auto"
        ? Math.max(4, Math.min(8, estimateColorCount(imageData)))
        : Math.max(2, Math.min(16, opts.colorCount));
    palette = Array.from({ length: n }, (_, i) => {
      const v = Math.round((i / (n - 1)) * 255);
      return { r: v, g: v, b: v };
    });
    useLockedPalette = true;
  } else {
    // color mode
    if (opts.palette && opts.palette.length >= 2) {
      palette = opts.palette.slice(0, 64);
      useLockedPalette = true;
    } else {
      const n =
        opts.colorCount === "auto"
          ? Math.max(4, Math.min(24, estimateColorCount(imageData)))
          : Math.max(2, Math.min(64, opts.colorCount));
      palette = medianCut(samples, n);
      if (!palette.length) palette = [{ r: 0, g: 0, b: 0 }];
      useLockedPalette = !!opts.lockColors;
    }
  }

  const tracerOpts: Record<string, unknown> = {
    ...preset,
    numberofcolors: palette.length,
    ltres: (preset.ltres ?? 1) + opts.smoothing * 0.5,
    qtres: (preset.qtres ?? 1) + opts.smoothing * 0.5,
    pathomit: (preset.pathomit ?? 8) + opts.smoothing * 4,
    strokewidth: 0,
    linefilter: true,
    scale: 1,
  };

  if (useLockedPalette) {
    tracerOpts.colorsampling = 0;
    tracerOpts.pal = palette.map((c) => ({ r: c.r, g: c.g, b: c.b, a: 255 }));
  } else {
    // Provide our median-cut palette as a seed, but let the tracer also sample
    // for better dithering — colorsampling: 2 (random) keeps colors faithful.
    tracerOpts.colorsampling = 2;
    tracerOpts.mincolorratio = 0;
  }

  const rawSvg: string = ImageTracer.imagedataToSVG(imageData, tracerOpts);
  const svg = optimizeSvg(rawSvg, opts.size, opts.background);
  const usedPalette = useLockedPalette ? palette : extractSvgFillColors(svg);

  return {
    svg,
    size: new Blob([svg]).size,
    pathCount: countPaths(svg),
    width: opts.size,
    height: opts.size,
    usedPalette: usedPalette.length ? usedPalette : palette,
    sourceLuminance,
  };
}

export const svgToBlob = (svg: string): Blob =>
  new Blob([svg], { type: "image/svg+xml" });
