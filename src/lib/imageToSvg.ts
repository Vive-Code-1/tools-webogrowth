// @ts-expect-error - no types shipped
import ImageTracer from "imagetracerjs";

export type ColorMode = "color" | "grayscale" | "bw";
export type QualityPreset = "icon" | "detailed" | "logo";

export interface TraceOptions {
  size: number; // target viewBox/output px
  colorMode: ColorMode;
  preset: QualityPreset;
  colorCount: number; // 2-16
  smoothing: number; // 0 - 5 (path simplification tolerance)
  background: "transparent" | "white" | string; // hex
}

export interface TraceResult {
  svg: string;
  size: number; // bytes
  pathCount: number;
  width: number;
  height: number;
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
  const tracerOpts: Record<string, unknown> = {
    ...preset,
    numberofcolors: Math.max(2, Math.min(16, opts.colorCount)),
    ltres: (preset.ltres ?? 1) + opts.smoothing * 0.5,
    qtres: (preset.qtres ?? 1) + opts.smoothing * 0.5,
    pathomit: (preset.pathomit ?? 8) + opts.smoothing * 4,
    strokewidth: 0,
    linefilter: true,
    scale: 1,
  };

  if (opts.colorMode === "bw") {
    tracerOpts.numberofcolors = 2;
    tracerOpts.colorsampling = 0;
    tracerOpts.pal = [
      { r: 0, g: 0, b: 0, a: 255 },
      { r: 255, g: 255, b: 255, a: 255 },
    ];
  } else if (opts.colorMode === "grayscale") {
    tracerOpts.colorsampling = 0;
    const n = tracerOpts.numberofcolors as number;
    tracerOpts.pal = Array.from({ length: n }, (_, i) => {
      const v = Math.round((i / (n - 1)) * 255);
      return { r: v, g: v, b: v, a: 255 };
    });
  }

  const rawSvg: string = ImageTracer.imagedataToSVG(imageData, tracerOpts);
  const svg = optimizeSvg(rawSvg, opts.size, opts.background);
  return {
    svg,
    size: new Blob([svg]).size,
    pathCount: countPaths(svg),
    width: opts.size,
    height: opts.size,
  };
}

export const svgToBlob = (svg: string): Blob =>
  new Blob([svg], { type: "image/svg+xml" });
