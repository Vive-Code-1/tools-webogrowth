// Palette utilities: dense sampling + median-cut quantization
// for faithful color extraction (avoids "all black" SVG output).

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export const toHex = (c: RGB): string =>
  "#" +
  [c.r, c.g, c.b]
    .map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0"))
    .join("");

export const fromHex = (h: string): RGB => {
  const s = h.replace("#", "").trim();
  const full = s.length === 3 ? s.split("").map((c) => c + c).join("") : s;
  return {
    r: parseInt(full.slice(0, 2), 16) || 0,
    g: parseInt(full.slice(2, 4), 16) || 0,
    b: parseInt(full.slice(4, 6), 16) || 0,
  };
};

// Perceptual luminance (Rec. 709) — 0..255
export const luminance = (c: RGB): number =>
  0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;

export const avgLuminance = (colors: RGB[]): number =>
  colors.length ? colors.reduce((s, c) => s + luminance(c), 0) / colors.length : 0;

// Dense sampling — up to ~20k visible pixels.
export function sampleImageData(data: ImageData, maxSamples = 20000): RGB[] {
  const px = data.data;
  const total = px.length / 4;
  const step = Math.max(1, Math.floor(total / maxSamples));
  const out: RGB[] = [];
  for (let i = 0; i < total; i += step) {
    const o = i * 4;
    if (px[o + 3] < 16) continue; // skip transparent
    out.push({ r: px[o], g: px[o + 1], b: px[o + 2] });
  }
  return out;
}

// Standard median-cut quantization in RGB space.
// Splits the bucket with the largest range along its longest channel.
export function medianCut(pixels: RGB[], k: number): RGB[] {
  if (!pixels.length || k < 1) return [];
  const target = Math.max(1, Math.min(64, k));
  let buckets: RGB[][] = [pixels.slice()];

  const rangeOf = (b: RGB[]) => {
    let rMin = 255, rMax = 0, gMin = 255, gMax = 0, bMin = 255, bMax = 0;
    for (const p of b) {
      if (p.r < rMin) rMin = p.r; if (p.r > rMax) rMax = p.r;
      if (p.g < gMin) gMin = p.g; if (p.g > gMax) gMax = p.g;
      if (p.b < bMin) bMin = p.b; if (p.b > bMax) bMax = p.b;
    }
    return { r: rMax - rMin, g: gMax - gMin, b: bMax - bMin };
  };

  while (buckets.length < target) {
    let pick = -1;
    let pickRange = -1;
    let pickChannel: "r" | "g" | "b" = "r";
    for (let i = 0; i < buckets.length; i++) {
      if (buckets[i].length < 2) continue;
      const rng = rangeOf(buckets[i]);
      const maxC = Math.max(rng.r, rng.g, rng.b);
      if (maxC > pickRange) {
        pickRange = maxC;
        pick = i;
        pickChannel = rng.r === maxC ? "r" : rng.g === maxC ? "g" : "b";
      }
    }
    if (pick < 0 || pickRange === 0) break;
    const bucket = buckets[pick];
    bucket.sort((a, b) => a[pickChannel] - b[pickChannel]);
    const mid = bucket.length >> 1;
    buckets.splice(pick, 1, bucket.slice(0, mid), bucket.slice(mid));
  }

  return buckets.map((b) => {
    let r = 0, g = 0, bb = 0;
    for (const p of b) {
      r += p.r;
      g += p.g;
      bb += p.b;
    }
    const n = b.length;
    return { r: Math.round(r / n), g: Math.round(g / n), b: Math.round(bb / n) };
  });
}

export async function extractPaletteFromFile(
  file: File,
  maxColors = 16,
): Promise<{ palette: RGB[]; avgLuminance: number }> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const i = new Image();
    i.onload = () => { URL.revokeObjectURL(url); resolve(i); };
    i.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };
    i.src = url;
  });
  const max = 320;
  const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, w, h);
  const data = ctx.getImageData(0, 0, w, h);
  const samples = sampleImageData(data, 20000);
  const palette = medianCut(samples, maxColors);
  return { palette, avgLuminance: avgLuminance(samples) };
}

// Extract fill colors actually used in a generated SVG string.
export function extractSvgFillColors(svg: string): RGB[] {
  const out: RGB[] = [];
  const seen = new Set<string>();
  const re = /fill="(#[0-9a-fA-F]{3,6}|rgb\([^)]+\))"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(svg))) {
    const v = m[1];
    if (seen.has(v)) continue;
    seen.add(v);
    if (v.startsWith("#")) {
      out.push(fromHex(v));
    } else {
      const nums = v.match(/\d+/g);
      if (nums && nums.length >= 3) {
        out.push({ r: +nums[0], g: +nums[1], b: +nums[2] });
      }
    }
  }
  return out;
}
